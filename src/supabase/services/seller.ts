'use client';

import { getSupabaseClient } from '@/supabase/client';

export interface SellerProfile {
  id: string;
  user_id: string;
  shop_name: string;
  shop_description: string;
  shop_logo?: string;
  shop_banner?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Seller service for managing seller profiles
 */
export const sellerService = {
  /**
   * Get seller profile for a user
   */
  getSellerProfile: async (userId: string): Promise<SellerProfile | null> => {
    const supabase = getSupabaseClient();

    try {
      const { data, error } = await supabase
        .from('seller_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No seller profile found
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch seller profile:', error);
      return null;
    }
  },

  /**
   * Get seller profile by shop ID
   */
  getSellerProfileById: async (sellerId: string): Promise<SellerProfile | null> => {
    const supabase = getSupabaseClient();

    try {
      const { data, error } = await supabase
        .from('seller_profiles')
        .select('*')
        .eq('id', sellerId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to fetch seller profile by ID:', error);
      return null;
    }
  },

  /**
   * Get all verified sellers
   */
  getVerifiedSellers: async (): Promise<SellerProfile[]> => {
    const supabase = getSupabaseClient();

    try {
      const { data, error } = await supabase
        .from('seller_profiles')
        .select('*')
        .eq('is_verified', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch verified sellers:', error);
      return [];
    }
  },

  /**
   * Create a seller profile
   */
  createSellerProfile: async (
    userId: string,
    profile: Omit<SellerProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<SellerProfile | null> => {
    const supabase = getSupabaseClient();

    try {
      const { data, error } = await supabase
        .from('seller_profiles')
        .insert({
          user_id: userId,
          ...profile,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create seller profile:', error);
      return null;
    }
  },

  /**
   * Update seller profile
   */
  updateSellerProfile: async (
    userId: string,
    updates: Partial<Omit<SellerProfile, 'id' | 'user_id' | 'created_at'>>
  ): Promise<SellerProfile | null> => {
    const supabase = getSupabaseClient();

    try {
      const { data, error } = await supabase
        .from('seller_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to update seller profile:', error);
      return null;
    }
  },

  /**
   * Verify a seller profile (admin only)
   */
  verifySellerProfile: async (sellerId: string): Promise<boolean> => {
    const supabase = getSupabaseClient();

    try {
      const { error } = await supabase
        .from('seller_profiles')
        .update({ is_verified: true })
        .eq('id', sellerId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to verify seller profile:', error);
      return false;
    }
  },
};
