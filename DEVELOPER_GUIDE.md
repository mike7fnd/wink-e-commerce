# Supabase Integration - Quick Reference Guide

## Overview
This guide explains how to use the newly implemented Supabase backend for data persistence in E-Moorm.

## Installation & Setup

No additional installation needed - Supabase client is already configured in `src/supabase/client.ts`

## Core Hooks

### 1. Cart Management - `useCart()`

```typescript
import { useCart } from '@/hooks/use-cart';

export function MyComponent() {
  const { 
    cart,           // CartItem[] 
    addToCart,      // (productId: string, quantity?: number) => Promise<void>
    removeFromCart, // (productId: string) => Promise<void>
    updateQuantity, // (productId: string, quantity: number) => Promise<void>
    cartCount,      // number
    clearCart,      // () => Promise<void>
    isLoading       // boolean
  } = useCart();

  const handleAddClick = async () => {
    try {
      await addToCart('product-123', 1);
      // Success!
    } catch (error) {
      console.error('Failed to add to cart', error);
    }
  };

  return (
    <>
      <button onClick={handleAddClick} disabled={isLoading}>
        Add to Cart
      </button>
      <p>Items in cart: {cartCount}</p>
    </>
  );
}
```

### 2. Wishlist Management - `useWishlist()`

```typescript
import { useWishlist } from '@/hooks/use-wishlist';

export function WishlistButton() {
  const { 
    wishlist,              // string[] (product IDs)
    addToWishlist,         // (productId: string) => Promise<void>
    removeFromWishlist,    // (productId: string) => Promise<void>
    isLoading              // boolean
  } = useWishlist();

  const isInWishlist = wishlist.includes('product-123');

  return (
    <button 
      onClick={() => isInWishlist 
        ? removeFromWishlist('product-123') 
        : addToWishlist('product-123')
      }
      disabled={isLoading}
    >
      {isInWishlist ? '❤️ Saved' : '🤍 Save'}
    </button>
  );
}
```

### 3. Search History - `useSearchHistory()`

```typescript
import { useSearchHistory } from '@/hooks/use-search-history';

export function SearchBar() {
  const { 
    searchHistory,         // string[]
    addSearchTerm,         // (term: string) => Promise<void>
    clearSearchHistory,    // () => Promise<void>
    isLoading              // boolean
  } = useSearchHistory();

  const handleSearch = async (term: string) => {
    await addSearchTerm(term);
    // Search executed
  };

  return (
    <>
      <input 
        placeholder="Search products..."
        onFocus={() => {/* Show searchHistory */}}
      />
      <div>
        {searchHistory.map(term => (
          <button key={term} onClick={() => handleSearch(term)}>
            {term}
          </button>
        ))}
      </div>
    </>
  );
}
```

## Service Functions

### Order Service

```typescript
import { orderService } from '@/supabase/services';
import { useUser } from '@/supabase/provider';

export function CheckoutComponent() {
  const { user } = useUser();
  const { cart } = useCart();

  const handleCheckout = async () => {
    const { order, error } = await orderService.createOrder(
      {
        userId: user!.id,
        items: cart,
        totalAmount: calculateTotal(cart),
      },
      // Map of product IDs to prices
      {
        'product-1': 999.99,
        'product-2': 1499.99,
      }
    );

    if (error) {
      console.error('Order creation failed:', error);
      return;
    }

    console.log('Order created:', order.id);
    // Redirect to confirmation page
  };

  return <button onClick={handleCheckout}>Complete Purchase</button>;
}
```

**Available Order Service Methods:**
- `createOrder(params, productPrices)` - Create order (auto-clears cart)
- `getUserOrders(userId)` - Get all user orders
- `getOrderDetails(orderId, userId)` - Get order with items
- `updateOrderStatus(orderId, userId, status)` - Update status
- `cancelOrder(orderId, userId)` - Cancel pending order

### Address Service

```typescript
import { addressService } from '@/supabase/services';
import { useUser } from '@/supabase/provider';

export function AddressManager() {
  const { user } = useUser();
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    async function loadAddresses() {
      const data = await addressService.getUserAddresses(user!.id);
      setAddresses(data);
    }
    loadAddresses();
  }, [user?.id]);

  const handleCreateAddress = async (formData) => {
    const newAddress = await addressService.createAddress(
      user!.id,
      {
        name: formData.name,
        phone: formData.phone,
        address_line_1: formData.street,
        city: formData.city,
        province: formData.province,
        region: formData.region,
        zip: formData.zip,
        is_default: formData.isDefault,
      }
    );

    if (newAddress) {
      setAddresses([...addresses, newAddress]);
    }
  };

  return (
    <>
      {addresses.map(addr => (
        <AddressCard 
          key={addr.id} 
          address={addr}
          onDelete={() => addressService.deleteAddress(user!.id, addr.id)}
          onSetDefault={() => addressService.setDefaultAddress(user!.id, addr.id)}
        />
      ))}
    </>
  );
}
```

**Available Address Methods:**
- `getUserAddresses(userId)` - Get all addresses
- `getDefaultAddress(userId)` - Get default address
- `createAddress(userId, address)` - Create new
- `updateAddress(userId, addressId, updates)` - Update existing
- `deleteAddress(userId, addressId)` - Delete
- `setDefaultAddress(userId, addressId)` - Set as default

### Profile Service

```typescript
import { profileService } from '@/supabase/services';
import { useUser } from '@/supabase/provider';

export function ProfileEditor() {
  const { user } = useUser();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      const data = await profileService.getUserProfile(user!.id);
      setProfile(data);
    }
    loadProfile();
  }, [user?.id]);

  const handleUpdate = async (updates) => {
    const updated = await profileService.updateUserProfile(user!.id, updates);
    if (updated) setProfile(updated);
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleUpdate({
        full_name: e.target.fullName.value,
        phone: e.target.phone.value,
      });
    }}>
      <input name="fullName" defaultValue={profile?.full_name} />
      <input name="phone" defaultValue={profile?.phone} />
      <button type="submit">Save</button>
    </form>
  );
}
```

### Seller Service

```typescript
import { sellerService } from '@/supabase/services';
import { useUser } from '@/supabase/provider';

export function SellerDashboard() {
  const { user } = useUser();
  const [sellerProfile, setSellerProfile] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      const data = await sellerService.getSellerProfile(user!.id);
      setSellerProfile(data);
    }
    loadProfile();
  }, [user?.id]);

  const handleUpdate = async (updates) => {
    const updated = await sellerService.updateSellerProfile(user!.id, updates);
    if (updated) setSellerProfile(updated);
  };

  return (
    // ... render seller profile UI
  );
}
```

**Available Seller Methods:**
- `getSellerProfile(userId)` - Get user's seller profile
- `getSellerProfileById(sellerId)` - Get seller by ID
- `getVerifiedSellers()` - Get all verified sellers
- `createSellerProfile(userId, profile)` - Create new
- `updateSellerProfile(userId, updates)` - Update
- `verifySellerProfile(sellerId)` - Admin verification

## Error Handling Best Practices

### Pattern 1: Try-Catch with Toast
```typescript
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

try {
  await addToCart(productId);
} catch (error) {
  toast({
    variant: 'destructive',
    title: 'Error',
    description: 'Failed to add to cart. Please try again.',
  });
}
```

### Pattern 2: Check for Results
```typescript
const { order, error } = await orderService.createOrder(...);

if (error) {
  console.error('Order failed:', error);
  // Show error UI
  return;
}

// Proceed with order
console.log('Order created:', order.id);
```

## Authentication Integration

All hooks automatically use the current authenticated user via `useAuth()`:

```typescript
import { useUser } from '@/supabase/provider';

export function MyComponent() {
  const { user, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Please log in</div>;

  // User is authenticated and ready to use hooks
  const { cart } = useCart();
  
  return <div>Cart: {cart.length} items</div>;
}
```

## Type Definitions

```typescript
// Cart Item
interface CartItem {
  productId: string;
  quantity: number;
}

// Order
interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

// Address
interface Address {
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

// User Profile
interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

// Seller Profile
interface SellerProfile {
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
```

## Debugging

Enable detailed logging:

```typescript
// In your component
const { cart, isLoading } = useCart();

useEffect(() => {
  console.log('Cart state:', { cart, isLoading });
}, [cart, isLoading]);

// Check Supabase logs
const { supabase } = useSupabase();
```

## Common Patterns

### Checkout Flow
```typescript
// 1. Get cart and user
const { user } = useUser();
const { cart, clearCart } = useCart();
const addresses = await addressService.getUserAddresses(user.id);

// 2. Create order
const { order } = await orderService.createOrder(
  {
    userId: user.id,
    items: cart,
    totalAmount: cartTotal,
  },
  productPrices
);

// 3. Cart auto-clears on success
// 4. Redirect to confirmation
navigate(`/orders/${order.id}`);
```

### Load and Update Pattern
```typescript
const [data, setData] = useState(null);

useEffect(() => {
  async function load() {
    const result = await service.getData(userId);
    setData(result);
  }
  load();
}, [userId]);

const handleUpdate = async (updates) => {
  const result = await service.updateData(userId, updates);
  if (result) setData(result);
};
```

## Support

For issues or questions:
1. Check error logs in browser console
2. Verify user is authenticated (`useUser()`)
3. Confirm RLS policies allow your operations
4. Check `supabase-schema.sql` for table structure
5. Review service files in `src/supabase/services/`

## Additional Resources

- [SUPABASE_IMPLEMENTATION.md](SUPABASE_IMPLEMENTATION.md) - Detailed implementation notes
- [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md) - Completion summary
- [Supabase Docs](https://supabase.com/docs) - Official documentation
- [Supabase JS Library](https://github.com/supabase/supabase-js) - Client library
