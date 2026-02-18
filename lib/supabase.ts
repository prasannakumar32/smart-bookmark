'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only throw in client-side initialization, not during build
let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables are not configured');
    // Create a minimal client to avoid crashes during build
    return createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      flowType: 'implicit',
    },
  });

  return supabaseClient;
}

export const supabase = getSupabaseClient();


