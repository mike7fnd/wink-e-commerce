'use client';

import { useEffect } from 'react';
import { getSupabaseClient } from '@/supabase/client';

/**
 * SupabaseErrorListener - Listens for Supabase errors and handles them globally
 * This is similar to the FirebaseErrorListener but for Supabase
 */
export function SupabaseErrorListener() {
  useEffect(() => {
    const supabase = getSupabaseClient();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        console.log('Supabase token refreshed successfully');
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
      } else if (event === 'USER_UPDATED') {
        console.log('User updated');
      } else if (event === 'SIGNED_IN') {
        console.log('User signed in');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
