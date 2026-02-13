'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useSupabase } from '@/supabase/provider';

type CartItem = {
  productId: string;
  quantity: number;
};

interface CartContextType {
  cart: CartItem[];
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartCount: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isLoading: isAuthLoading, supabase } = useSupabase();

  // Load cart from Supabase on mount or when user changes
  useEffect(() => {
    const loadCart = async () => {
      try {
        // Wait for auth to finish loading before querying
        if (isAuthLoading) return;

        setIsLoading(true);

        // No user = empty cart
        if (!user?.id) {
          setCart([]);
          setIsInitialized(true);
          return;
        }

        const { data, error } = await supabase
          .from('carts')
          .select('product_id, quantity, user_id')
          .eq('user_id', user.id);

        if (error) {
          console.error('Supabase cart fetch error:', JSON.stringify(error, null, 2), error);
          throw error;
        }

        if (!data) {
          setCart([]);
          return;
        }

        const cartItems: CartItem[] = data.map((item: any) => ({
          productId: item.product_id,
          quantity: item.quantity,
        }));

        setCart(cartItems);
      } catch (error: any) {
        console.error('Failed to load cart from Supabase:', error?.message || JSON.stringify(error) || 'Unknown error');
        // Fallback to empty cart on error
        setCart([]);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    loadCart();
  }, [user?.id, isAuthLoading, supabase]);

  const addToCart = useCallback(
    async (productId: string, quantity: number = 1) => {
      if (!user?.id) {
        console.error('User not authenticated');
        return;
      }

      try {
        setIsLoading(true);

        // Check if product already exists in cart
        const existingItem = cart.find((item) => item.productId === productId);

        if (existingItem) {
          // Update quantity
          const { error } = await supabase
            .from('carts')
            .update({ quantity: existingItem.quantity + quantity })
            .eq('user_id', user.id)
            .eq('product_id', productId);

          if (error) {
            console.error('Supabase cart update error:', {
              message: error.message,
              code: error.code,
            });
            throw error;
          }

          setCart((prev) =>
            prev.map((item) =>
              item.productId === productId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          );
        } else {
          // Insert new cart item
          const { error } = await supabase
            .from('carts')
            .insert({
              user_id: user.id,
              product_id: productId,
              quantity,
            });

          if (error) {
            console.error('Supabase cart insert error:', {
              message: error.message,
              code: error.code,
            });
            throw error;
          }

          setCart((prev) => [...prev, { productId, quantity }]);
        }
      } catch (error: any) {
        console.error('Failed to add to cart:', error?.message || JSON.stringify(error));
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, cart, supabase]
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      if (!user?.id) {
        console.error('User not authenticated');
        return;
      }

      try {
        setIsLoading(true);
        const { error } = await supabase
          .from('carts')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) {
          console.error('Supabase cart delete error:', {
            message: error.message,
            code: error.code,
          });
          throw error;
        }

        setCart((prev) => prev.filter((item) => item.productId !== productId));
      } catch (error: any) {
        console.error('Failed to remove from cart:', error?.message || JSON.stringify(error));
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, supabase]
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (!user?.id) {
        console.error('User not authenticated');
        return;
      }

      try {
        setIsLoading(true);

        if (quantity <= 0) {
          await removeFromCart(productId);
          return;
        }

        const { error } = await supabase
          .from('carts')
          .update({ quantity })
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) {
          console.error('Supabase cart update error:', {
            message: error.message,
            code: error.code,
          });
          throw error;
        }

        setCart((prev) =>
          prev.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          )
        );
      } catch (error: any) {
        console.error('Failed to update quantity:', error?.message || JSON.stringify(error));
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, removeFromCart, supabase]
  );

  const clearCart = useCallback(
    async () => {
      if (!user?.id) {
        console.error('User not authenticated');
        return;
      }

      try {
        setIsLoading(true);
        const { error } = await supabase
          .from('carts')
          .delete()
          .eq('user_id', user.id);

        if (error) {
          console.error('Supabase cart clear error:', {
            message: error.message,
            code: error.code,
          });
          throw error;
        }

        setCart([]);
      } catch (error: any) {
        console.error('Failed to clear cart:', error?.message || JSON.stringify(error));
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, supabase]
  );

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
