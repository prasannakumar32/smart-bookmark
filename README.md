# Smart Bookmarks - Bookmark Manager App

A simple, real-time bookmark manager built with Next.js, Supabase, and Tailwind CSS. Users can sign up with Google OAuth, save bookmarks, and see updates in real-time across multiple tabs.

## Live Demo

**[Coming soon - Live Vercel URL will be added here after deployment]**

## Features

- ✅ **Google OAuth Authentication** - Sign in securely with your Google account
- ✅ **Add Bookmarks** - Save URLs with titles
- ✅ **Real-time Updates** - Bookmarks update instantly across all open tabs
- ✅ **Private Bookmarks** - Users can only see their own bookmarks
- ✅ **Delete Bookmarks** - Remove bookmarks with one click
- ✅ **Responsive Design** - Works on desktop and mobile

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + React
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Google OAuth)
- **Real-time Database**: Supabase Realtime
- **Deployment**: Vercel

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ and npm installed
- A Supabase account (free tier works great)
- A Google Cloud project for OAuth credentials
- A Vercel account for deployment

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/log in
2. Click "New Project"
3. Fill in the project details and create it
4. Wait for the project to be provisioned

### 2. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the "Google+ API"
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - For local development: `http://localhost:3000/auth/callback`
   - For production: `https://your-vercel-domain.vercel.app/auth/callback`
6. Copy your Client ID and Client Secret

### 3. Configure Supabase Auth

1. In your Supabase project, go to **Authentication** → **Providers**
2. Enable Google provider
3. Enter your Google OAuth Client ID and Client Secret
4. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-vercel-domain.vercel.app/auth/callback`

### 4. Create Database Schema

1. In Supabase, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `database.sql`
4. Run the query

This will create:
- `bookmarks` table with user_id, title, url, and created_at
- Row Level Security (RLS) policies to ensure users only see their own bookmarks
- Indexes for optimal query performance

### 5. Clone and Configure the App

```bash
git clone https://github.com/yourusername/smart-bookmark.git
cd smart-bookmark
npm install
```

### 6. Set Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these in your Supabase project settings under "API".

### 7. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### 1. Push to GitHub

```bash
git remote add origin https://github.com/yourusername/smart-bookmark.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click "Deploy"

### 3. Update Google OAuth Redirect URLs

Update your Google Cloud project and Supabase with your Vercel production URL:
- `https://your-app.vercel.app/auth/callback`

## Project Structure

```
smart-bookmark/
├── app/
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts        # OAuth callback handler
│   ├── layout.tsx              # Root layout with AuthProvider
│   ├── page.tsx                # Home page (conditional login/bookmarks)
│   └── globals.css
├── components/
│   ├── login.tsx               # Google sign-in button
│   └── bookmarks.tsx           # Bookmark list, add, delete
├── lib/
│   ├── supabase.ts             # Supabase client initialization
│   └── auth-context.tsx        # Auth state management & utilities
├── database.sql                # Database schema
├── .env.local.example          # Environment variables template
└── README.md
```

## Problems Encountered and Solutions

### Problem 1: Real-time Updates Not Working Across Tabs

**Issue**: When a bookmark was added in one tab, it didn't appear in another tab in real-time.

**Solution**: 
- Used Supabase Realtime subscriptions with the `postgres_changes` event type
- Subscribe to changes filtered by the user's ID: `user_id=eq.${session.user.id}`
- This ensures each user only gets real-time updates for their own bookmarks
- The subscription listens for INSERT, UPDATE, and DELETE events
- State is updated immediately when changes are detected

**Code Reference**: See `components/bookmarks.tsx` - the `useEffect` hook sets up the Realtime subscription.

### Problem 2: Privacy - Ensuring Users Can't See Other Users' Bookmarks

**Issue**: Without proper security, users could theoretically query other users' bookmarks.

**Solution**:
- Implemented Row Level Security (RLS) on the bookmarks table in PostgreSQL
- Created RLS policies that enforce `auth.uid() = user_id`
- These policies are enforced at the database level, not just in the application
- The Supabase anon key can't bypass these policies
- All queries are automatically filtered by `user_id = auth.uid()`

**Code Reference**: See `database.sql` - the RLS policies section.

### Problem 3: OAuth Redirect Callback Flow

**Issue**: Google OAuth redirects with a `code` parameter that needs to be exchanged for a session.

**Solution**:
- Created a dedicated route handler at `/auth/callback`
- This route exchanges the authorization code for a session using `exchangeCodeForSession()`
- After exchange, it redirects back to the home page where the `useAuth` hook picks up the session
- The auth context listens for session changes via `onAuthStateChange`

**Code Reference**: See `app/auth/callback/route.ts`.

### Problem 4: Managing Auth State Across the App

**Issue**: Multiple components needed access to session and auth functions, requiring prop drilling.

**Solution**:
- Created an `AuthContext` with a provider pattern
- The context provides `session`, `loading`, `signInWithGoogle`, and `signOut`
- Wrapped the entire app with `<AuthProvider>` in the root layout
- Components use the `useAuth` hook to access auth state without prop drilling

**Code Reference**: See `lib/auth-context.tsx`.

### Problem 5: Handling Loading States

**Issue**: Components would briefly show incorrect content while auth state was being determined.

**Solution**:
- Added a `loading` state in the `AuthContext`
- The initial session is fetched with `getSession()` on mount
- Set `loading` to `false` after the session check completes
- The home page shows a loading spinner while `loading === true`
- This ensures the correct UI is shown once auth status is determined

**Code Reference**: See `lib/auth-context.tsx` and `app/page.tsx`.

### Problem 6: URL Validation and Error Handling

**Issue**: Users could add invalid URLs or empty fields.

**Solution**:
- Added input validation before submission
- Used HTML5 `type="url"` for URL field (browser handles basic validation)
- Added manual checks for empty fields with user-friendly error messages
- Added try-catch blocks for database operations
- Display error messages in the UI so users know what went wrong

**Code Reference**: See `components/bookmarks.tsx` - the `handleAddBookmark` function.

### Problem 7: Real-time Subscription Cleanup

**Issue**: Not unsubscribing from Realtime channels could cause memory leaks.

**Solution**:
- Called `channel.unsubscribe()` in the useEffect cleanup function
- Dependencies array includes only `session?.user?.id` to avoid re-subscribing unnecessarily
- The cleanup function is called when the component unmounts or dependencies change

**Code Reference**: See `components/bookmarks.tsx` - the `useEffect` hook's return statement.

### Problem 8: Theme Removal and UI Consistency

**Issue**: The application had theme-dependent code scattered throughout components, making it difficult to maintain a consistent light theme appearance.

**Solution**:
- Removed theme toggle button from bookmarks component header
- Eliminated all `dark:` Tailwind classes from all components
- Removed theme property from settings context interface and default settings
- Cleaned up theme-related CSS variables and dark mode styles from globals.css
- Removed darkMode configuration from tailwind.config.ts
- Removed all theme-related translations from language context across all languages
- Updated profile page with modern, consistent light theme styling

**Code Reference**: 
- `lib/settings-context.tsx` - Removed theme from Settings interface
- `components/bookmarks.tsx` - Removed theme toggle and all dark: classes
- `app/profile/page.tsx` - Complete styling overhaul with modern design
- `app/globals.css` - Removed .dark class styles and theme variables

### Problem 9: Profile Page Outdated Design

**Issue**: The profile page had basic styling with poor visual hierarchy, inconsistent spacing, and lacked modern UI patterns.

**Solution**:
- Redesigned header with gradient icon and improved typography
- Enhanced cover image with overlay and professional label
- Improved avatar section with larger size, hover effects, and better positioning
- Modernized form sections with gradient backgrounds and icon headers
- Updated input styling with better borders, shadows, and focus states
- Enhanced button designs with gradients, icons, and hover animations
- Improved responsive design with better mobile layouts
- Added consistent color scheme (blue → purple → green) for visual hierarchy
- Implemented better display states for edit vs view modes

**Code Reference**: See `app/profile/page.tsx` - Complete component restructure with modern styling patterns.

## How Real-Time Updates Work

1. **WebSocket Connection**: Supabase Realtime uses WebSockets to maintain a persistent connection
2. **Database Triggers**: When data changes in PostgreSQL, a trigger sends an event through the WebSocket
3. **Subscription Filter**: The subscription includes a filter (`user_id=eq.${currentUserId}`) so you only get your own changes
4. **Event Handler**: When an event arrives, the callback updates React state
5. **Automatic Re-render**: React re-renders the component with the new bookmarks

This means if you open the app in two tabs and add a bookmark in Tab 1, Tab 2 will see it appear instantly without any manual refresh.

## Security Notes

- **RLS Policies**: Database-level security ensures users can only access their own data
- **Anon Key**: The public anon key is used for client-side operations, but RLS policies protect sensitive data
- **No Server Secret**: The app doesn't store any server secrets (no backend API needed)
- **OAuth**: Google handles password security; the app never sees passwords

## Troubleshooting

### "Cannot find module '@supabase/supabase-js'"
- Run `npm install`
- Make sure you're in the project directory
- Clear node_modules and package-lock.json if issue persists

### Bookmarks not loading
- Check that your Supabase credentials are correct in `.env.local`
- Verify RLS policies are enabled in the database
- Check that your Supabase project has Realtime enabled
- Look for WebSocket errors in the browser's Network tab

### Real-time updates not working
- Verify that Realtime is enabled in your Supabase project
- Check that user_id is correctly set in the subscription filter
- Look for WebSocket errors in the browser's Network tab
- Ensure your Supabase project has Realtime enabled

### Google sign-in not working
- Verify Google OAuth credentials are correct in Supabase
- Check that redirect URI matches your deployed URL exactly
- Ensure Google+ API is enabled in Google Cloud Console
- Check that your domain is verified in Google Cloud Console

### URL validation issues with custom domains
- **Issue**: When users add URLs with custom domains, they may not validate properly or display incorrectly
- **Solution**: 
  - Added HTML5 `type="url"` validation for basic URL format checking
  - URLs are stored as-is in the database to preserve user input
  - Display logic shows URLs as clickable links when valid
  - Added proper `target="_blank"` and `rel="noopener noreferrer"` for security
  - For production, consider implementing a URL validation service or library for more robust validation

**Code Reference**: See `components/bookmarks.tsx` - URL input field and link display logic.

## Future Enhancements

- [ ] Bookmark categories/tags
- [ ] Search and filter bookmarks
- [ ] Bookmark notes/descriptions
- [ ] Import/export bookmarks
- [ ] Share bookmark collections with other users
- [ ] Browser extension for quick bookmarking
- [ ] Mobile app

## License

MIT

## Support

For issues or questions, please open a GitHub issue.
