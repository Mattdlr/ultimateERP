// Xero OAuth 2.0 Callback Handler
// This function handles the OAuth callback from Xero and exchanges the code for tokens

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')

    if (!code) {
      throw new Error('No authorization code received')
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://identity.xero.com/connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${Deno.env.get('XERO_CLIENT_ID')}:${Deno.env.get('XERO_CLIENT_SECRET')}`)}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: Deno.env.get('XERO_REDIRECT_URI') || '',
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      throw new Error(`Token exchange failed: ${error}`)
    }

    const tokens = await tokenResponse.json()

    // Get tenant (organization) information
    const connectionsResponse = await fetch('https://api.xero.com/connections', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!connectionsResponse.ok) {
      throw new Error('Failed to fetch Xero connections')
    }

    const connections = await connectionsResponse.json()
    const primaryTenant = connections[0] // Use first tenant

    // Calculate token expiry
    const expiresAt = new Date(Date.now() + (tokens.expires_in * 1000))

    // Store credentials in database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Delete old credentials (only one Xero connection supported)
    await supabaseClient.from('xero_credentials').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // Insert new credentials
    const { error: dbError } = await supabaseClient
      .from('xero_credentials')
      .insert({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt.toISOString(),
        tenant_id: primaryTenant.tenantId,
        tenant_name: primaryTenant.tenantName,
      })

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`)
    }

    // Redirect back to app with success
    const redirectUrl = `${Deno.env.get('APP_URL')}?xero_connected=true`
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirectUrl,
      },
    })

  } catch (error) {
    console.error('OAuth callback error:', error)

    // Redirect back to app with error
    const redirectUrl = `${Deno.env.get('APP_URL')}?xero_error=${encodeURIComponent(error.message)}`
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirectUrl,
      },
    })
  }
})
