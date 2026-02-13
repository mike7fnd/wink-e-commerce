'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig } from './config';

// Create a client for browser-side usage
let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseClient;
}

// Export for server-side usage (if needed in future)
export function createServerClient() {
  return createClient(supabaseConfig.url, supabaseConfig.anonKey, {
    auth: {
      persistSession: false,
    },
  });
}
