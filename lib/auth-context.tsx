'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Handle OAuth callback hash
    const handleOAuthCallback = async () => {
      try {
        if (typeof window === 'undefined') return;
        
        const hash = window.location.hash;
        console.log('Checking for OAuth callback hash:', hash.substring(0, 50) + '...');
        
        if (hash.includes('access_token')) {
          console.log('OAuth callback detected, processing...');
          
          // Let Supabase process the hash
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error processing OAuth callback:', error);
          } else if (data.session) {
            console.log('Session established from OAuth callback:', data.session.user?.email);
            if (mounted) {
              setSession(data.session);
              setLoading(false);
              return;
            }
          }
        }
      } catch (error) {
        console.error('Error in OAuth callback handler:', error);
      }
    };

    handleOAuthCallback();
    
    // Check active session
    const getSession = async () => {
      try {
        // Add delay to ensure the session is properly initialized
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!mounted) return;
        
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', session?.user?.email || 'No session');
        
        if (mounted) {
          setSession(session);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        if (mounted) {
          setSession(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email || 'No session');
      
      if (!mounted) return;
      
      // Update session for all events
      setSession(session);
      
      // Handle sign-in event
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in successfully:', session.user?.email);
        // Broadcast to other tabs
        localStorage.setItem('auth-event', JSON.stringify({ event: 'SIGNED_IN', timestamp: Date.now() }));
      }
      
      // Handle sign-out event
      if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        // Broadcast to other tabs
        localStorage.setItem('auth-event', JSON.stringify({ event: 'SIGNED_OUT', timestamp: Date.now() }));
      }

      // Handle token refresh
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed');
      }
    });

    // Listen for storage events from other tabs
    const handleStorageChange = async (event: StorageEvent) => {
      if (event.key === 'auth-event') {
        try {
          const authEvent = JSON.parse(event.newValue || '{}');
          console.log('Received auth event from another tab:', authEvent);
          
          if (authEvent.event === 'SIGNED_OUT') {
            // Force sign out in this tab
            await supabase.auth.signOut();
            if (mounted) setSession(null);
          } else if (authEvent.event === 'SIGNED_IN') {
            // Refresh session in this tab
            getSession();
          }
        } catch (error) {
          console.error('Error parsing auth event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      mounted = false;
      subscription?.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const signInWithGoogle = async () => {
    const redirectUri = `${window.location.origin}/auth/callback`;
    console.log('Redirect URI being sent:', redirectUri);
    console.log('Current origin:', window.location.origin);
    
    try {
      const { error, data } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }
      
      console.log('OAuth initiated successfully:', data);
    } catch (error) {
      console.error('Failed to initiate OAuth:', error);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ session, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
