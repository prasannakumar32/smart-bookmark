import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(`${requestUrl.origin}/?error=${encodeURIComponent(error)}`);
  }

  // Redirect to home while preserving the code and state
  // The client-side Supabase with detectSessionInUrl: true will process it
  if (code && state) {
    return NextResponse.redirect(`${requestUrl.origin}/?code=${code}&state=${state}`);
  }

  return NextResponse.redirect(`${requestUrl.origin}/`);
}
