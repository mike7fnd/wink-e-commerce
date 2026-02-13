'use client';

import { SupabaseClient } from '@supabase/supabase-js';

export interface SignUpOptions {
  email: string;
  password: string;
  options?: {
    emailRedirectTo?: string;
    data?: Record<string, any>;
  };
}

export interface SignInOptions {
  email: string;
  password: string;
}

/**
 * Authentication helper functions for Supabase.
 */
export const auth = {
  /**
   * Sign up a new user with email and password.
   */
  signUp: async (supabase: SupabaseClient, options: SignUpOptions) => {
    return await supabase.auth.signUp({
      email: options.email,
      password: options.password,
      options: options.options,
    });
  },

  /**
   * Sign in a user with email and password.
   */
  signInWithPassword: async (supabase: SupabaseClient, options: SignInOptions) => {
    return await supabase.auth.signInWithPassword({
      email: options.email,
      password: options.password,
    });
  },

  /**
   * Sign in anonymously.
   */
  signInAnonymous: async (supabase: SupabaseClient) => {
    return await supabase.auth.signInAnonymously();
  },

  /**
   * Sign out the current user.
   */
  signOut: async (supabase: SupabaseClient) => {
    return await supabase.auth.signOut();
  },

  /**
   * Get the current session.
   */
  getSession: async (supabase: SupabaseClient) => {
    return await supabase.auth.getSession();
  },

  /**
   * Get the current user.
   */
  getUser: async (supabase: SupabaseClient) => {
    return await supabase.auth.getUser();
  },

  /**
   * Reset password for a user.
   */
  resetPassword: async (supabase: SupabaseClient, email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/account/settings`,
    });
  },

  /**
   * Update the current user's password.
   */
  updatePassword: async (supabase: SupabaseClient, password: string) => {
    return await supabase.auth.updateUser({ password });
  },

  /**
   * Update the current user's profile data.
   */
  updateUser: async (supabase: SupabaseClient, data: { email?: string; data?: Record<string, any> }) => {
    return await supabase.auth.updateUser(data);
  },
};
