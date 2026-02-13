'use client';

import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/supabase/client';

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
}

export interface CreateOrderParams {
  userId: string;
  items: CartItem[];
  totalAmount: number;
  addressId?: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

/**
 * Order service for managing orders and transactions with Supabase
 */
export const orderService = {
  /**
   * Create an order with transaction support
   * This function creates an order and its items in a transaction-like manner
   */
  createOrder: async (
    params: CreateOrderParams,
    productPrices: Record<string, number>
  ): Promise<{ order: Order; error?: Error }> => {
    const supabase = getSupabaseClient();

    try {
      // Start transaction by creating order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: params.userId,
          status: 'pending',
          total_amount: params.totalAmount,
        })
        .select()
        .single();

      if (orderError) throw new Error(`Failed to create order: ${orderError.message}`);

      const orderId = orderData.id;

      // Create order items
      const orderItems = params.items.map((item) => ({
        order_id: orderId,
        product_id: item.productId,
        quantity: item.quantity,
        price: productPrices[item.productId] || 0,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        // Rollback by deleting the order
        await supabase.from('orders').delete().eq('id', orderId);
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }

      // Clear cart after successful order
      const { error: cartError } = await supabase
        .from('carts')
        .delete()
        .eq('user_id', params.userId);

      if (cartError) {
        console.warn('Failed to clear cart after order creation:', cartError);
        // Don't fail the order creation if cart clear fails
      }

      return { order: orderData };
    } catch (error) {
      console.error('Order creation failed:', error);
      return {
        order: {} as Order,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
      };
    }
  },

  /**
   * Get all orders for a user
   */
  getUserOrders: async (userId: string): Promise<Order[]> => {
    const supabase = getSupabaseClient();

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch user orders:', error);
      return [];
    }
  },

  /**
   * Get order details with items
   */
  getOrderDetails: async (
    orderId: string,
    userId: string
  ): Promise<{ order: Order; items: OrderItem[] } | null> => {
    const supabase = getSupabaseClient();

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();

      if (orderError) throw orderError;

      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      return {
        order: orderData,
        items: itemsData || [],
      };
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      return null;
    }
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (orderId: string, userId: string, status: string): Promise<boolean> => {
    const supabase = getSupabaseClient();

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to update order status:', error);
      return false;
    }
  },

  /**
   * Cancel an order (if still in pending status)
   */
  cancelOrder: async (orderId: string, userId: string): Promise<boolean> => {
    const supabase = getSupabaseClient();

    try {
      // Check if order is still pending
      const { data: order, error: checkError } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();

      if (checkError) throw checkError;

      if (order?.status !== 'pending') {
        throw new Error('Can only cancel pending orders');
      }

      // Update order status to cancelled
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .eq('user_id', userId);

      if (updateError) throw updateError;
      return true;
    } catch (error) {
      console.error('Failed to cancel order:', error);
      return false;
    }
  },
};
