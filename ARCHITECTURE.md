# E-Moorm Backend Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        React Components                             │
│  (Account, Cart, Product, Search, Seller Registration, etc.)      │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      React Hooks (Custom)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐    │
│  │ useCart()    │  │useWishlist() │  │useSearchHistory()    │    │
│  └──────────────┘  └──────────────┘  └──────────────────────┘    │
│  (Provides async cart operations with isLoading state)             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Service Layer (Type-safe)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐    │
│  │orderService  │  │profileService│  │sellerService         │    │
│  └──────────────┘  └──────────────┘  └──────────────────────┘    │
│                                                                      │
│  • createOrder()      • getUserProfile()    • getSellerProfile()  │
│  • getUserOrders()    • updateProfile()     • createSeller()      │
│  • cancelOrder()      • getUserAddresses()  • updateSeller()      │
│  • updateStatus()     • createAddress()     • getVerified...()    │
│                       • setDefaultAddress()                        │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│              Supabase JavaScript Client (@supabase/js)             │
│  (Connection pooling, query optimization, auto-retry)              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Supabase PostgreSQL                            │
│  ┌────────────────────────────────────────────────────┐           │
│  │  Database Tables (with RLS Policies)               │           │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐       │           │
│  │  │profiles  │ │addresses │ │seller_...    │       │           │
│  │  ├──────────┤ ├──────────┤ ├──────────────┤       │           │
│  │  │carts     │ │orders    │ │order_items   │       │           │
│  │  ├──────────┤ ├──────────┤ └──────────────┘       │           │
│  │  │wishlists │ │search_..│                         │           │
│  │  └──────────┘ └──────────┘                         │           │
│  └────────────────────────────────────────────────────┘           │
│                                                                      │
│  Authentication: Firebase Auth (external to Supabase)              │
│  Authorization: RLS Policies on all tables                         │
│  Scalability: Managed PostgreSQL with automatic backups            │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### User Authentication Flow
```
User Login/Signup (Firebase)
        ↓
Firebase emits auth state change
        ↓
useUser() updates user context
        ↓
Hooks detect user.id available
        ↓
Auto-load user data from Supabase
(profiles, carts, wishlists, etc.)
        ↓
Components re-render with fresh data
```

### Cart Flow
```
User clicks "Add to Cart"
        ↓
useCart.addToCart(productId)
        ↓
Check user authentication (user.id)
        ↓
Supabase INSERT/UPDATE carts table
(with RLS policy verification)
        ↓
Return success/error
        ↓
Component updates UI (with isLoading state)
```

### Order Creation Flow (with Transaction Support)
```
User clicks "Checkout"
        ↓
Collect items from cart + address
        ↓
orderService.createOrder()
        ↓
┌─ Transaction Start
│  Step 1: INSERT order → orders table
│  Step 2: INSERT items → order_items table
│  Step 3: DELETE from → carts table
└─ Transaction End
        ↓
If Step 2 fails:
  ├─ DELETE order (rollback)
  └─ Return error
        ↓
On Success:
  ├─ Return order object
  ├─ Cart auto-cleared ✓
  └─ Redirect to confirmation
```

## Component Integration Map

```
Main Layout
├── Header + Search
│   └── useSearchHistory()
├── Product Listing
│   ├── useCart() (Add to Cart button)
│   └── useWishlist() (Save button)
├── Account Page
│   ├── useUser() (Load profile)
│   ├── profileService (Avatar upload)
│   └── sellerService (Check seller status)
└── Seller Registration
    └── sellerService.createSellerProfile()

Cart Page
├── useCart() (Display items)
└── orderService.createOrder() (Checkout)

Wishlist Page
└── useWishlist() (Display items)
```

## Type Safety Flow

```
Supabase Database Schema
        ↓
Generated Types (TypeScript)
        ↓
Service Function Parameters
        ↓
Hook Return Types
        ↓
Component Props Type-Checking
        ↓
Zero Type Errors ✓
```

## Error Handling Strategy

```
User Action
        ↓
Try-Catch Block
        ├─ Success: Update state & UI
        ├─ Validation Error: Show toast
        ├─ Network Error: Retry + fallback
        └─ Auth Error: Redirect to login
        ↓
Fallback Values
├─ Empty cart on load fail
├─ Empty wishlist on fail
└─ Avatar image URL on fail
```

## Authentication & Authorization

### Authentication (Firebase)
```
Firebase Auth Service
├─ Email/Password login
├─ Session persistence
├─ Real-time auth state
└─ User ID (user.id)
```

### Authorization (Supabase RLS)
```
Every Database Operation
        ↓
RLS Policy Check
├─ Is user authenticated? (auth.uid())
├─ Does user own this data?
└─ Is operation allowed?
        ↓
Query Allowed ✓ / Blocked ✗
```

### RLS Policies Example
```sql
-- Cart: Users can only access their own cart
CREATE POLICY "Users can view their own cart" ON carts
  FOR SELECT USING (auth.uid() = user_id);

-- Orders: Users can only view their orders
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Seller Profiles: Public read, user-specific write
CREATE POLICY "Anyone can view sellers" ON seller_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own seller profile" ON seller_profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

## State Management Pattern

```
Component
    ↓
useAuth() ──┐
            ├─→ Check authentication
useCart()   ├─→ Load/update cart
useWishlist ├─→ Load/update wishlist
            ├─→ Handle loading/error states
useUser()   ├─→ Manage user context
            ↓
       Component renders
```

## Database Relationships

```
auth.users (Firebase)
    ↓
profiles (1:1)
├─ avatar_url
├─ full_name
└─ phone
    ↓
carts (1:N)  ← User can have many cart items
├─ product_id
└─ quantity
    ↓
wishlists (1:N)  ← User can wishlist many products
└─ product_id
    ↓
orders (1:N)  ← User can have many orders
├─ status
└─ total_amount
    ├─ order_items (1:N)  ← Order has many items
    │   ├─ product_id
    │   ├─ quantity
    │   └─ price
    ↓
addresses (1:N)  ← User can have many addresses
├─ is_default
└─ (street, city, etc.)
    ↓
seller_profiles (0..1)  ← User can be a seller
└─ shop_name

search_history (1:N)  ← User search history
└─ search_term
```

## Async Operation Pattern

```typescript
// Pattern used in all hooks and services

async function operation(params) {
  try {
    setIsLoading(true);
    
    // Validate input
    if (!user?.id) throw new Error("Not authenticated");
    
    // Perform Supabase operation
    const { data, error } = await supabase...;
    if (error) throw error;
    
    // Update local state
    setState(data);
    
    return { success: true, data };
  } catch (error) {
    console.error('Operation failed:', error);
    return { success: false, error };
  } finally {
    setIsLoading(false);
  }
}
```

## Deployment Architecture

```
Developer Laptop
        ↓
    [Git Push]
        ↓
GitHub Repository
        ↓
[Build & Deploy]
        ↓
Vercel (Next.js hosting)
├─ Client-side: React components
└─ API: Server-side functions (if needed)
        ↓
Supabase Cloud (Database)
├─ PostgreSQL database
├─ Auth service (optional superuser)
└─ Automatic backups
```

## Performance Optimization Points

```
1. Query Optimization
   ├─ RLS reduces rows early
   ├─ Proper indexes on user_id
   └─ Limit queries to needed fields

2. State Management
   ├─ React Context for hooks
   ├─ isLoading flag prevents double-clicks
   └─ Error states cached

3. Network
   ├─ Supabase connection pooling
   ├─ Automatic query batching
   └─ Retry on transient failures

4. Caching
   ├─ Browser localStorage (for UI prefs)
   ├─ React component state
   └─ Custom event broadcasts
```

## Security Layers

```
Layer 1: Firebase Authentication
         └─ Verify user identity

Layer 2: Supabase RLS Policies
         └─ Filter data by user

Layer 3: Service Layer Validation
         └─ Check user.id matches request

Layer 4: Error Handling
         └─ Don't leak sensitive info

Layer 5: HTTPS Encryption
         └─ All data in transit encrypted
```

## Scaling Capabilities

```
Current Setup (Single User)
    ├─ Unlimited cart items
    ├─ Unlimited wishlist items
    ├─ Unlimited addresses
    └─ Unlimited orders

With Multiple Users (Thousands)
    ├─ Supabase auto-scales
    ├─ Connection pooling handles concurrent users
    ├─ RLS policies isolate data
    └─ Indexes optimize queries

Future Scaling
    ├─ Add database read replicas
    ├─ Implement caching layer (Redis)
    ├─ Horizontal scaling of API
    └─ CDN for static assets
```

---

**This architecture ensures:**
- ✅ Type safety throughout the stack
- ✅ Secure user data isolation
- ✅ Non-blocking async operations
- ✅ Easy error handling
- ✅ Scalability for growth
- ✅ Maintainability with clear separation of concerns
