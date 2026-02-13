'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { SupabaseClient, Session, User } from '@supabase/supabase-js';
import { getSupabaseClient } from './client';

interface SupabaseProviderProps {
  children: ReactNode;
}

interface SupabaseContextState {
  supabase: SupabaseClient;
  session: Session | null;
  user: User | null;
  isLoading: boolean;
}

const SupabaseContext = createContext<SupabaseContextState | undefined>(undefined);

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const [supabase] = useState(() => getSupabaseClient());
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const contextValue = useMemo(() => ({
    supabase,
    session,
    user,
    isLoading,
  }), [supabase, session, user, isLoading]);

  return (
    <SupabaseContext.Provider value={contextValue}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase(): SupabaseContextState {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider.');
  }
  return context;
}

export function useUser(): { user: User | null; isLoading: boolean } {
  const { user, isLoading } = useSupabase();
  return { user, isLoading };
}

export function useSession(): { session: Session | null; isLoading: boolean } {
  const { session, isLoading } = useSupabase();
  return { session, isLoading };
}

export function useAuth(): SupabaseClient {
  const { supabase } = useSupabase();
  return supabase;
}
