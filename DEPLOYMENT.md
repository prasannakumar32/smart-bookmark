# Deployment Instructions for Smart Bookmarks

## Overview
Your Smart Bookmarks app has been built and is ready for deployment. Follow these steps to deploy to Vercel with GitHub as the source.

## Step 1: Create a GitHub Repository

1. Go to https://github.com/new
2. Create a new repository with the name `smart-bookmark`
3. Choose "Public" (so we can share the URL)
4. Do NOT initialize with README, .gitignore, or license
5. Click "Create repository"
6. Copy the repository URL (e.g., `https://github.com/yourusername/smart-bookmark.git`)

## Step 2: Initialize Git and Push Code

Run these commands in the `smart-bookmark` directory:

```bash
git init
git add .
git commit -m "Initial commit: Smart Bookmarks app with real-time updates"
git branch -M main
git remote add origin https://github.com/yourusername/smart-bookmark.git
git push -u origin main
```

Replace `yourusername` with your actual GitHub username.

## Step 3: Create a Supabase Project

1. Go to https://supabase.com and sign up (or log in)
2. Click "New Project"
3. Fill in:
   - Name: `smart-bookmark`
   - Password: Create a strong password
   - Region: Choose the one closest to you
4. Click "Create new project" and wait for it to provision

## Step 4: Set Up the Database

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `database.sql` from the project
4. Paste it into the SQL editor
5. Click "Run"

This creates:
- The `bookmarks` table
- Row Level Security (RLS) policies
- Database indexes

## Step 5: Configure Google OAuth

### Get Google OAuth Credentials

1. Go to https://console.cloud.google.com/
2. Create a new project (or use existing one)
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Add authorized JavaScript origins:
   - `http://localhost:3000`
   - `https://yourdomain.vercel.app` (you'll update this after Vercel deployment)
7. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.vercel.app/auth/callback` (you'll update this later)
8. Click Create and copy your **Client ID**

### Configure in Supabase

1. In Supabase, go to **Authentication** → **Providers**
2. Click **Google**
3. Toggle **Enabled** to ON
4. Paste your Google Client ID
5. Paste your Google Client Secret (from Google Cloud Console)
6. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.vercel.app/auth/callback`
7. Click **Save**

## Step 6: Get Supabase Credentials

1. In your Supabase project, click **Settings** (bottom of left sidebar)
2. Click **API**
3. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key
4. Save these - you'll need them for Vercel

## Step 7: Deploy to Vercel

1. Go to https://vercel.com/new
2. Click **Continue with GitHub** and authorize
3. Find and select your `smart-bookmark` repository
4. Click **Import**
5. Under "Environment Variables", add:
   - **Key**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: (paste your Supabase Project URL)
   - Click **Add**
   - **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: (paste your Supabase anon key)
   - Click **Add**
6. Click **Deploy**

Wait for the deployment to complete (usually 1-2 minutes).

## Step 8: Update OAuth Redirect URIs

Once Vercel deployment is complete:

1. Go to your Vercel project and copy your production domain (e.g., `smart-bookmark-chi.vercel.app`)

2. Update Google Cloud Console:
   - Go to Google Cloud Console → Credentials
   - Edit your OAuth application
   - Add to "Authorized JavaScript origins":
     - `https://smart-bookmark-chi.vercel.app`
   - Add to "Authorized redirect URIs":
     - `https://smart-bookmark-chi.vercel.app/auth/callback`
   - Click Save

3. Update Supabase:
   - Go to Authentication → Providers → Google
   - Update redirect URLs to include:
     - `https://smart-bookmark-chi.vercel.app/auth/callback`
   - Click Save

## Step 9: Test Your App

1. Go to `https://your-domain.vercel.app`
2. Click "Sign in with Google"
3. Sign in with your Google account
4. Create a bookmark with a title and URL
5. The bookmark should appear in the list
6. Open the same URL in a different browser tab
7. Add another bookmark in one tab - it should appear in the other tab in real-time!
8. Test the delete button

## Summary

Your app is now live! You can:
- **Share the live URL**: `https://your-domain.vercel.app`
- **Share the GitHub URL**: `https://github.com/yourusername/smart-bookmark`
- **Users can sign in with their own Google account** and start saving bookmarks

## Troubleshooting

### "Authentication failed" error
- Confirm Google OAuth credentials are correct in Supabase
- Verify the redirect URI exactly matches your Vercel domain

### Bookmarks not saving
- Check that RLS policies are enabled in Supabase
- Verify environment variables are set correctly in Vercel

### Real-time updates not working
- Verify Realtime is enabled in your Supabase project
- Check browser console for WebSocket errors
- Verify the subscription filter matches your user ID

## Next Steps

Your app is production-ready! Future enhancements could include:
- Search functionality
- Bookmark categories/tags
- Import/export
- Mobile app
- Browser extension
