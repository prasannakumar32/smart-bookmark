import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  
  // Let Supabase client-side handle the OAuth callback
  // Just redirect back to home with the code/hash in the URL
  // The client-side Supabase with detectSessionInUrl: true will process it
  return NextResponse.redirect(`${requestUrl.origin}/`);
}
