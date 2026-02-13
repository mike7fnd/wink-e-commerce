'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getSupabaseClient } from '@/supabase/client';
import { useUser } from '@/supabase/provider';

interface WishlistContextType {
  wishlist: string[];
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const supabase = getSupabaseClient();

  // Load wishlist from Supabase on mount or when user changes
  useEffect(() => {
    if (!user?.id) {
      setWishlist([]);
      setIsInitialized(true);
      return;
    }

    const loadWishlist = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('wishlists')
          .select('product_id')
          .eq('user_id', user.id);

        if (error) throw error;

        const productIds: string[] = (data || []).map((item: any) => item.product_id);
        setWishlist(productIds);
      } catch (error) {
        console.error('Failed to load wishlist from Supabase:', error);
        // Fallback to empty wishlist
        setWishlist([]);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    loadWishlist();
  }, [user?.uid, supabase]);

  const addToWishlist = useCallback(
    async (productId: string) => {
      if (!user?.id) {
        console.error('User not authenticated');
        return;
      }

      try {
        setIsLoading(true);

        // Check if already in wishlist
        if (wishlist.includes(productId)) {
          return;
        }

        const { error } = await supabase
          .from('wishlists')
          .insert({
            user_id: user.id,
            product_id: productId,
          });

        if (error) throw error;

        setWishlist((prev) => [...prev, productId]);
      } catch (error) {
        console.error('Failed to add to wishlist:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, wishlist, supabase]
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      if (!user?.id) {
        console.error('User not authenticated');
        return;
      }

      try {
        setIsLoading(true);
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;

        setWishlist((prev) => prev.filter((id) => id !== productId));
      } catch (error) {
        console.error('Failed to remove from wishlist:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, supabase]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isLoading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
