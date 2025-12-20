# Workshop ERP - Supabase Setup Guide

This guide will walk you through setting up your Workshop ERP system with Supabase and deploying it for your team.

## Overview

- **Database & Auth**: Supabase (free tier supports your needs)
- **Frontend Hosting**: Vercel (free tier)
- **Users**: 5 team members with login authentication

---

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up (free)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `workshop-erp`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you (e.g., London for UK)
4. Click **"Create new project"** and wait ~2 minutes for setup

---

## Step 2: Set Up the Database

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Copy the entire contents of `supabase-schema.sql` and paste it into the editor
4. Click **"Run"** (or press Ctrl+Enter)
5. You should see "Success. No rows returned" - this means it worked!

---

## Step 3: Get Your API Keys

1. In Supabase, go to **Settings** (gear icon) → **API**
2. You'll need two values:
   - **Project URL**: Something like `https://abcdefgh.supabase.co`
   - **anon public key**: A long string starting with `eyJ...`

3. Keep this page open - you'll need these values shortly

---

## Step 4: Configure Authentication

1. In Supabase, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled (it should be by default)
3. Go to **Authentication** → **URL Configuration**
4. Set **Site URL** to your domain (we'll update this after deploying):
   - For now, use: `http://localhost:3000`

---

## Step 5: Create Your User Accounts

1. Go to **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. For each of your 5 team members:
   - Enter their email address
   - Create a temporary password
   - Check "Auto Confirm User" 
   - Click **"Create user"**
4. Share the login details with each team member (they can change passwords later)

---

## Step 6: Deploy to Vercel

### Option A: Quick Deploy (Recommended)

1. Go to [https://vercel.com](https://vercel.com) and sign up (free)
2. Click **"Add New..."** → **"Project"**
3. Choose **"Import Third-Party Git Repository"** 
4. Or simply upload the project folder

### Option B: Using the Files Provided

1. Create a new folder on your computer called `workshop-erp`
2. Save the following files from this package:
   - `package.json`
   - `src/App.jsx`
   - `src/main.jsx`
   - `src/supabaseClient.js`
   - `index.html`
   - `vite.config.js`

3. Install and run locally first to test:
   ```bash
   npm install
   npm run dev
   ```

4. Then deploy to Vercel:
   ```bash
   npm install -g vercel
   vercel
   ```

---

## Step 7: Configure Environment Variables

In Vercel (or your `.env` file for local development):

1. Go to your project **Settings** → **Environment Variables**
2. Add these two variables:
   
   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | Your Project URL from Step 3 |
   | `VITE_SUPABASE_ANON_KEY` | Your anon public key from Step 3 |

3. Redeploy for changes to take effect

---

## Step 8: Update Supabase Site URL

1. Go back to Supabase → **Authentication** → **URL Configuration**
2. Update **Site URL** to your Vercel URL (e.g., `https://workshop-erp.vercel.app`)
3. Add the same URL to **Redirect URLs**

---

## You're Done! 🎉

Your Workshop ERP is now live. Share the URL with your team members and they can log in with the accounts you created.

---

## Daily Usage

### Logging In
- Go to your Vercel URL
- Enter email and password
- Click "Sign In"

### Password Reset
Users can reset their own passwords via the "Forgot Password" link on the login page.

### Adding More Users
Go to Supabase → Authentication → Users → Add user

---

## Troubleshooting

### "Invalid API key"
- Check your environment variables are set correctly in Vercel
- Make sure you're using the `anon` key, not the `service_role` key

### "Email not confirmed"
- When creating users, make sure to check "Auto Confirm User"
- Or go to Authentication → Users and manually confirm them

### Can't log in
- Verify the user exists in Supabase Authentication → Users
- Try resetting the password
- Check the browser console for error messages

---

## Costs

**Supabase Free Tier includes:**
- 500MB database storage
- 50,000 monthly active users
- 2GB file storage
- Unlimited API requests

**Vercel Free Tier includes:**
- 100GB bandwidth/month
- Automatic HTTPS
- Custom domains

For a 5-person workshop, you'll stay well within free tiers.

---

## Need Help?

- Supabase docs: https://supabase.com/docs
- Vercel docs: https://vercel.com/docs
