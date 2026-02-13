'use client';

import { getSupabaseClient } from '@/supabase/client';

export interface Address {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  address_line_1: string;
  city: string;
  province: string;
  region: string;
  zip: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Address service for managing user addresses in Supabase
 */
export const addressService = {
  /**
   * Get all addresses for a user
   */
  getUserAddresses: async (userId: string): Promise<Address[]> => {
    const supabase = getSupabaseClient();

    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      return [];
    }
  },

  /**
   * Get default address for a user
   */
  getDefaultAddress: async (userId: string): Promise<Address | null> => {
    const supabase = getSupabaseClient();

    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .eq('is_default', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is fine
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Failed to fetch default address:', error);
      return null;
    }
  },

  /**
   * Create a new address
   */
  createAddress: async (userId: string, address: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Address | null> => {
    const supabase = getSupabaseClient();

    try {
      // If this will be default, unset other defaults
      if (address.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      const { data, error } = await supabase
        .from('addresses')
        .insert({
          user_id: userId,
          ...address,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create address:', error);
      return null;
    }
  },

  /**
   * Update an address
   */
  updateAddress: async (
    userId: string,
    addressId: string,
    updates: Partial<Omit<Address, 'id' | 'user_id' | 'created_at'>>
  ): Promise<Address | null> => {
    const supabase = getSupabaseClient();

    try {
      // If setting as default, unset other defaults
      if (updates.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', userId)
          .neq('id', addressId);
      }

      const { data, error } = await supabase
        .from('addresses')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', addressId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to update address:', error);
      return null;
    }
  },

  /**
   * Delete an address
   */
  deleteAddress: async (userId: string, addressId: string): Promise<boolean> => {
    const supabase = getSupabaseClient();

    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to delete address:', error);
      return false;
    }
  },

  /**
   * Set an address as default
   */
  setDefaultAddress: async (userId: string, addressId: string): Promise<boolean> => {
    const supabase = getSupabaseClient();

    try {
      // Unset all other defaults
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);

      // Set the selected address as default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to set default address:', error);
      return false;
    }
  },
};

/**
 * Profile service for managing user profiles
 */
export const profileService = {
  /**
   * Get user profile
   */
  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    const supabase = getSupabaseClient();

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, it should have been created on signup
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      return null;
    }
  },

  /**
   * Update user profile
   */
  updateUserProfile: async (
    userId: string,
    updates: Partial<Omit<UserProfile, 'id' | 'created_at'>>
  ): Promise<UserProfile | null> => {
    const supabase = getSupabaseClient();

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      return null;
    }
  },
};
