// Xero Contacts Sync Handler
// This function syncs contacts from Xero to the local database

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface XeroContact {
  ContactID: string
  Name: string
  EmailAddress?: string
  Phones?: Array<{ PhoneType: string; PhoneNumber: string }>
  Addresses?: Array<{ AddressType: string; AddressLine1?: string; City?: string; PostalCode?: string }>
  IsSupplier: boolean
  IsCustomer: boolean
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  let syncLogId: string | null = null

  try {
    // Create sync log entry
    const { data: logData, error: logError } = await supabaseClient
      .from('xero_sync_log')
      .insert({
        sync_type: 'contacts',
        status: 'started',
      })
      .select()
      .single()

    if (logError) throw logError
    syncLogId = logData.id

    // Get Xero credentials
    const { data: credentials, error: credError } = await supabaseClient
      .from('xero_credentials')
      .select('*')
      .single()

    if (credError || !credentials) {
      throw new Error('No Xero credentials found. Please connect to Xero first.')
    }

    // Check if token is expired and refresh if needed
    let accessToken = credentials.access_token
    if (new Date(credentials.expires_at) <= new Date()) {
      // Refresh token
      const tokenResponse = await fetch('https://identity.xero.com/connect/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${Deno.env.get('XERO_CLIENT_ID')}:${Deno.env.get('XERO_CLIENT_SECRET')}`)}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: credentials.refresh_token,
        }),
      })

      if (!tokenResponse.ok) {
        throw new Error('Failed to refresh Xero access token')
      }

      const tokens = await tokenResponse.json()
      accessToken = tokens.access_token

      // Update credentials in database
      const expiresAt = new Date(Date.now() + (tokens.expires_in * 1000))
      await supabaseClient
        .from('xero_credentials')
        .update({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', credentials.id)
    }

    // Fetch contacts from Xero
    const contactsResponse = await fetch('https://api.xero.com/api.xro/2.0/Contacts', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'xero-tenant-id': credentials.tenant_id,
        'Accept': 'application/json',
      },
    })

    if (!contactsResponse.ok) {
      const error = await contactsResponse.text()
      throw new Error(`Failed to fetch contacts from Xero: ${error}`)
    }

    const xeroData = await contactsResponse.json()
    const xeroContacts: XeroContact[] = xeroData.Contacts || []

    let contactsCreated = 0
    let contactsUpdated = 0

    // Process each Xero contact
    for (const xeroContact of xeroContacts) {
      // Extract phone number (prefer mobile, then default)
      const mobilePhone = xeroContact.Phones?.find(p => p.PhoneType === 'MOBILE')
      const defaultPhone = xeroContact.Phones?.find(p => p.PhoneType === 'DEFAULT')
      const phone = mobilePhone?.PhoneNumber || defaultPhone?.PhoneNumber || null

      // Extract address
      const postalAddress = xeroContact.Addresses?.find(a => a.AddressType === 'POBOX') ||
                           xeroContact.Addresses?.find(a => a.AddressType === 'STREET')
      const address = postalAddress
        ? [postalAddress.AddressLine1, postalAddress.City, postalAddress.PostalCode]
            .filter(Boolean)
            .join(', ')
        : null

      // Check if contact already exists by xero_contact_id
      const { data: existing } = await supabaseClient
        .from('contacts')
        .select('*')
        .eq('xero_contact_id', xeroContact.ContactID)
        .maybeSingle()

      const contactData = {
        name: xeroContact.Name,
        email: xeroContact.EmailAddress || null,
        phone: phone,
        address: address,
        is_customer: xeroContact.IsCustomer,
        is_supplier: xeroContact.IsSupplier,
        xero_contact_id: xeroContact.ContactID,
        sync_status: 'synced',
        last_synced_at: new Date().toISOString(),
      }

      if (existing) {
        // Update existing contact
        await supabaseClient
          .from('contacts')
          .update(contactData)
          .eq('id', existing.id)
        contactsUpdated++
      } else {
        // Create new contact
        await supabaseClient
          .from('contacts')
          .insert(contactData)
        contactsCreated++
      }
    }

    // Update sync log with success
    await supabaseClient
      .from('xero_sync_log')
      .update({
        status: 'completed',
        contacts_synced: xeroContacts.length,
        contacts_created: contactsCreated,
        contacts_updated: contactsUpdated,
        completed_at: new Date().toISOString(),
      })
      .eq('id', syncLogId)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${xeroContacts.length} contacts from Xero`,
        stats: {
          total: xeroContacts.length,
          created: contactsCreated,
          updated: contactsUpdated,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Sync error:', error)

    // Update sync log with failure
    if (syncLogId) {
      await supabaseClient
        .from('xero_sync_log')
        .update({
          status: 'failed',
          error_message: error.message,
          completed_at: new Date().toISOString(),
        })
        .eq('id', syncLogId)
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
