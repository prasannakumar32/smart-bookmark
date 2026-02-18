import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Supabase handles OAuth callback internally
  // Just redirect to home - the client will detect session from URL hash
  return NextResponse.redirect(`${new URL(request.url).origin}/`);
}
