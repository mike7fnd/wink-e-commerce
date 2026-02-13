# Firebase to Supabase Migration - TODO List

## Phase 1: Install Supabase dependencies
- [x] Add @supabase/supabase-js to package.json
- [x] Run npm install

## Phase 2: Create Supabase configuration and client
- [x] Create src/supabase/config.ts - Supabase configuration with URL and anon key
- [x] Create src/supabase/client.ts - Client-side Supabase initialization
- [x] Create src/supabase/index.ts - Export all supabase modules

## Phase 3: Create Supabase provider and hooks
- [x] Create src/supabase/provider.tsx - SupabaseProvider component with useUser, useSession
- [x] Create src/supabase/client-provider.tsx - Client-side provider wrapper
- [x] Create src/supabase/hooks/use-collection.ts - For real-time collection subscriptions
- [x] Create src/supabase/hooks/use-doc.ts - For real-time document subscriptions
- [x] Create src/supabase/hooks/use-mutations.ts - For data mutations

## Phase 4: Create Supabase auth helpers
- [x] Create src/supabase/auth.ts - Authentication methods

## Phase 5: Update app to use Supabase
- [x] Update src/app/layout.tsx to use SupabaseProvider
- [x] Create src/components/SupabaseErrorListener.tsx to handle Supabase errors

## Phase 6: Clean up (Optional)
- [ ] Keep Firebase for reference or remove if not needed

---

## Migration Complete!

The app has been successfully migrated from Firebase to Supabase. Here's a summary of what was done:

1. **Installed Supabase dependencies** - Added @supabase/supabase-js package
2. **Created Supabase configuration** - Set up config.ts with Supabase URL and anon key
3. **Created Supabase client** - Initialized Supabase client
4. **Created provider and hooks** - Built useUser, useSession, useCollection, useDoc, and useMutations hooks
5. **Created auth helpers** - Built authentication methods for sign up, sign in, sign out
6. **Updated app layout** - Added SupabaseClientProvider and SupabaseErrorListener
7. **Created error listener** - Built SupabaseErrorListener for handling Supabase errors

The Firebase files are still present in src/firebase/ but are no longer used. You can remove them if desired.
