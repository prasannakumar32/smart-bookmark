import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  });
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  console.log('Auth callback received:', { code: !!code, error, errorDescription });

  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(`${requestUrl.origin}/?error=${encodeURIComponent(error || 'Authentication failed')}`);
  }

  if (code) {
    try {
      const supabase = await createSupabaseClient();
      
      // Add a small delay to ensure everything is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error exchanging code for session:', error);
        return NextResponse.redirect(`${requestUrl.origin}/?error=${encodeURIComponent('Failed to complete authentication')}`);
      }

      console.log('Session established successfully:', data.user?.email);
      console.log('Session data:', { 
        hasSession: !!data.session,
        userId: data.user?.id,
        email: data.user?.email,
        expiresAt: data.session?.expires_at
      });
      
      // Verify the session was actually established
      if (data.session && data.user) {
        console.log('Authentication successful, redirecting to home');
        return NextResponse.redirect(`${requestUrl.origin}/`);
      } else {
        console.error('Session establishment failed - no session or user data');
        return NextResponse.redirect(`${requestUrl.origin}/?error=${encodeURIComponent('Authentication incomplete')}`);
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(`${requestUrl.origin}/?error=${encodeURIComponent('Authentication error')}`);
    }
  }

  // If no code or error, redirect to home
  return NextResponse.redirect(`${requestUrl.origin}/`);
}
