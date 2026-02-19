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
    
    // Check active session
    const getSession = async () => {
      try {
        if (!mounted) return;
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(session);
        }
      } catch (error) {
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
      if (!mounted) return;
      
      setSession(session);
      
      // Broadcast auth events to other tabs
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        localStorage.setItem('auth-event', JSON.stringify({ event, timestamp: Date.now() }));
      }
    });

    // Listen for storage events from other tabs
    const handleStorageChange = async (event: StorageEvent) => {
      if (event.key === 'auth-event' && event.newValue) {
        try {
          const authEvent = JSON.parse(event.newValue);
          
          if (authEvent.event === 'SIGNED_IN') {
            // Refresh session in this tab
            const { data: { session } } = await supabase.auth.getSession();
            if (mounted) setSession(session);
          } else if (authEvent.event === 'SIGNED_OUT') {
            // Sign out in this tab
            if (mounted) setSession(null);
          }
        } catch (error) {
          // Silent fail for storage events
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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google'
    });
    
    if (error) {
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
