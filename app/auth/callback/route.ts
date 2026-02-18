import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

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
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables');
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error exchanging code for session:', error);
        return NextResponse.redirect(`${requestUrl.origin}/?error=${encodeURIComponent('Failed to complete authentication')}`);
      }

      console.log('Session established successfully:', data.user?.email);
      
      // Redirect to the home page after successful authentication
      return NextResponse.redirect(`${requestUrl.origin}/`);
    } catch (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(`${requestUrl.origin}/?error=${encodeURIComponent('Authentication error')}`);
    }
  }

  // If no code or error, redirect to home
  return NextResponse.redirect(`${requestUrl.origin}/`);
}
