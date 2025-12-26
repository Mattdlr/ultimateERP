# Xero Integration Setup Guide

This guide will help you set up Xero contacts synchronization with your ERP system.

## Features

- **One-way sync** from Xero to your ERP (Xero → ERP)
- **Automatic contact mapping** to customers and suppliers
- **Local-only contacts** for historical data not in Xero
- **Manual sync trigger** to control when contacts are synced
- **Sync status tracking** to see when contacts were last updated

## Prerequisites

1. A Xero account with access to your organization
2. Supabase project with CLI installed
3. Node.js and npm installed

## Step 1: Create a Xero App

1. Go to [Xero Developer Portal](https://developer.xero.com/app/manage)
2. Click **"New app"**
3. Fill in the app details:
   - **App name**: `Your ERP Name - Contacts Sync`
   - **Integration type**: Select **"Web app"**
   - **Company or application URL**: Your app URL (e.g., `https://your-domain.com`)
   - **OAuth 2.0 redirect URI**: `https://your-supabase-project.supabase.co/functions/v1/xero-oauth-callback`
     - Replace `your-supabase-project` with your actual Supabase project reference
4. Click **"Create app"**
5. Save your **Client ID** and **Client Secret** (you'll need these later)

## Step 2: Run Database Migrations

Run these SQL scripts in your Supabase SQL Editor (in order):

### 2.1 Contacts Migration
Run `schema-contacts-migration.sql` to create the unified contacts table.

### 2.2 Xero Integration Tables
Run `schema-xero-integration.sql` to create Xero credentials and sync log tables.

## Step 3: Deploy Supabase Edge Functions

### 3.1 Install Supabase CLI (if not already installed)

```bash
npm install -g supabase
```

### 3.2 Link to your Supabase project

```bash
supabase link --project-ref your-project-ref
```

### 3.3 Set up function secrets

```bash
supabase secrets set XERO_CLIENT_ID=your-xero-client-id
supabase secrets set XERO_CLIENT_SECRET=your-xero-client-secret
supabase secrets set XERO_REDIRECT_URI=https://your-project.supabase.co/functions/v1/xero-oauth-callback
supabase secrets set APP_URL=https://your-app-domain.com
```

### 3.4 Deploy the functions

```bash
supabase functions deploy xero-oauth-callback
supabase functions deploy xero-sync-contacts
```

## Step 4: Configure Environment Variables

### 4.1 Create `.env` file in your project root

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### 4.2 Fill in the values

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Xero OAuth Configuration
VITE_XERO_CLIENT_ID=your-xero-client-id
VITE_XERO_REDIRECT_URI=https://your-project.supabase.co/functions/v1/xero-oauth-callback
```

## Step 5: Test the Integration

### 5.1 Start your development server

```bash
npm run dev
```

### 5.2 Navigate to Contacts view

1. Open your ERP in the browser
2. Click on **Contacts** in the navigation
3. You should see a **"Connect to Xero"** button

### 5.3 Connect to Xero

1. Click **"Connect to Xero"**
2. You'll be redirected to Xero's login page
3. Login with your Xero credentials
4. Authorize the app to access your contacts
5. You'll be redirected back to your app

### 5.4 Sync contacts

1. After connecting, you'll see a **"Sync Now"** button
2. Click it to trigger the sync
3. Wait for the sync to complete (you'll see a success message)
4. Your Xero contacts should now appear in the contacts list with a **"Xero"** badge

## How It Works

### Contact Syncing

When you click "Sync Now":

1. The system fetches all contacts from Xero
2. For each Xero contact:
   - If the contact already exists (matched by `xero_contact_id`), it updates the contact
   - If the contact doesn't exist, it creates a new one
   - Sets `is_customer` and `is_supplier` based on Xero's flags
   - Sets `sync_status` to `'synced'`

### Local-Only Contacts

Contacts created directly in your ERP (not from Xero) will have:
- `sync_status = 'local_only'`
- No `xero_contact_id`
- Won't be overwritten by Xero sync
- Perfect for historical data or contacts not in Xero

### Token Management

- Access tokens expire after 30 minutes
- The system automatically refreshes tokens when needed
- Refresh tokens last 60 days
- Xero uses rotating refresh tokens (each refresh gives you a new token)

## Troubleshooting

### "No Xero credentials found" error

- Make sure you've completed the OAuth flow (Connect to Xero)
- Check that the `xero_credentials` table exists in Supabase
- Verify RLS policies allow authenticated users to read credentials

### Sync fails immediately

- Check Supabase Edge Function logs: `supabase functions logs xero-sync-contacts`
- Verify environment variables are set correctly
- Ensure your Xero app has the `accounting.contacts.read` scope

### OAuth redirect fails

- Verify the redirect URI in Xero app settings matches exactly
- Check that the Edge Function is deployed and accessible
- Look for errors in browser console during redirect

### Contacts not appearing after sync

- Check the sync log table for errors: `SELECT * FROM xero_sync_log ORDER BY created_at DESC LIMIT 10`
- Verify contacts in Xero are marked as customers or suppliers
- Check browser console for JavaScript errors

## API Rate Limits

Xero enforces:
- **5,000 API calls per day** per organization
- Resets at midnight UTC
- The sync function counts as 1-2 calls (depending on token refresh)

For large contact lists (1000+ contacts), Xero uses pagination, which may require multiple API calls.

## Security Notes

- Never commit `.env` files to git
- Client Secret is only stored in Supabase secrets (server-side)
- Access tokens are stored encrypted in Supabase
- RLS policies protect credential access

## Support

For issues with:
- **Xero API**: [Xero Developer Documentation](https://developer.xero.com/documentation/api/accounting/contacts)
- **OAuth 2.0**: [Xero OAuth Guide](https://developer.xero.com/documentation/guides/oauth2/auth-flow/)
- **This Integration**: Check the Edge Function logs and browser console

## References

- [Xero Developer Portal](https://developer.xero.com/)
- [Xero Contacts API](https://developer.xero.com/documentation/api/accounting/contacts)
- [Xero OAuth 2.0](https://developer.xero.com/documentation/guides/oauth2/overview/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
