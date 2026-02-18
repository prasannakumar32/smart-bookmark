# Smart Bookmarks - Quick Vercel Deployment Guide

## ✅ Code Pushed to GitHub
Your code is now at: https://github.com/prasannakumar32/smart-bookmark

## 📋 Deployment Steps

### Step 1: Set Up Supabase (Required First!)

1. Go to https://supabase.com and create an account
2. Create a new project:
   - Name: `smart-bookmark`
   - Password: Create a strong password
   - Region: Choose closest to you
3. Wait for project to be created (2-3 minutes)

4. **Run Database Setup**:
   - Go to **SQL Editor** (left sidebar)
   - Click **New Query**
   - Copy everything from the file: `database.sql` from your GitHub repo
   - Paste into the SQL editor and click **Run**
   - This creates the bookmarks table and security policies

5. **Enable Google OAuth**:
   - Go to **Authentication** → **Providers**
   - Click **Google**
   - Toggle **Enabled** ON
   - (Don't fill credentials yet - we'll get them from Google)

6. **Get Your Credentials**:
   - Go to **Settings** → **API**
   - Copy and save these:
     - **Project URL** (e.g., `https://xxxxx.supabase.co`)
     - **anon public** key

### Step 2: Set Up Google OAuth Credentials

1. Go to https://console.cloud.google.com
2. Create a new project (or use existing)
3. Enable "Google+ API"
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   - For now, just use `http://localhost:3000/auth/callback`
   - (You'll update this after Vercel deployment)
7. Click **Create** and copy:
   - **Client ID**
   - **Client Secret**

8. **Go back to Supabase**:
   - Authentication → Providers → Google
   - Paste Client ID and Client Secret
   - Click **Save**

### Step 3: Deploy to Vercel

1. Go to https://vercel.com/new
2. Click **Continue with GitHub**
3. Authorize Vercel to access your GitHub account
4. Find and select **smart-bookmark** repository
5. Click **Import**
6. **Add Environment Variables**:
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: (paste your Supabase Project URL)
   - Click **Add**
   
   - Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: (paste your Supabase anon key)
   - Click **Add**

7. Click **Deploy**
8. Wait 2-3 minutes for deployment to complete ⏳

### Step 4: Update OAuth Redirect URIs

Once Vercel deployment is done:

1. Go to your Vercel project dashboard
2. Copy your domain (e.g., `smart-bookmark-chi.vercel.app`)

3. **Update Google Cloud Console**:
   - https://console.cloud.google.com
   - Go to Credentials → Your OAuth app
   - Add to "Authorized JavaScript origins":
     - `https://smart-bookmark-chi.vercel.app` (your actual domain)
   - Add to "Authorized redirect URIs":
     - `https://smart-bookmark-chi.vercel.app/auth/callback`
   - Click **Save**

4. **Update Supabase**:
   - Supabase → Authentication → Providers → Google
   - Update redirect URL to include:
     - `https://smart-bookmark-chi.vercel.app/auth/callback`
   - Click **Save**

### Step 5: Test Your Live App

1. Go to `https://your-domain.vercel.app`
2. Click "Sign in with Google"
3. Sign in with your Google account
4. Click "Add New Bookmark"
5. Add a test bookmark (e.g., Title: "Google", URL: "https://google.com")
6. **Open the same URL in a new tab**
7. In the first tab, add another bookmark
8. **Check the second tab** - it should appear in real-time! ✨

## 🎉 Your App is Live!

Share your URL: `https://your-domain.vercel.app`

## 📊 Project Status

- ✅ Code on GitHub: https://github.com/prasannakumar32/smart-bookmark
- ⏳ Deployment to Vercel: Follow steps above
- 📱 Real-time bookmarks: Works across all tabs
- 🔐 Private bookmarks: Only you see your data
- 👤 Multiple users: Each user has their own bookmarks

## 🆘 Troubleshooting

### "Invalid Client ID" error
- Verify Google OAuth credentials are correct in Supabase
- Make sure redirect URI exactly matches your Vercel domain

### Bookmarks not saving
- Check environment variables are set in Vercel
- Verify Supabase project is running
- Check browser console for errors (F12)

### Real-time updates not working
- Verify Realtime is enabled in Supabase
- Check that you're logged in properly
- Try opening the app in two tabs and adding a bookmark

### Can't sign in
- Verify Google API is enabled
- Check redirect URIs match exactly (with https://)
- Make sure Supabase Auth is enabled

## 📚 Documentation

See your GitHub repo for:
- `README.md` - Full documentation
- `DEPLOYMENT.md` - Detailed deployment guide
- `database.sql` - Database schema
- Source code with comments

## ⏱️ Time Estimate

- Supabase setup: ~5-10 minutes
- Google OAuth: ~5 minutes
- Vercel deployment: ~5 minutes
- Testing: ~5 minutes

**Total: ~20-25 minutes**

Good luck! 🚀
