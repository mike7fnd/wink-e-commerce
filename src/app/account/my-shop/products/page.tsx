'use client';

import { useState, useEffect } from 'react';
import { AccountHeader } from '@/components/layout/account-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/supabase/provider';
import { sellerService } from '@/supabase/services/seller';

export default function ProductsPage() {
  const { user } = useUser();
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await sellerService.getSellerProfile(user.id);
        setSellerProfile(profile);
      } catch (err) {
        console.error('Failed to load seller profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <AccountHeader title="My Products" />
      <main className="container mx-auto px-4 pt-4 pb-24 md:pb-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Products</h1>
          <Button size="sm" className="rounded-full">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>

        <div className="text-center py-16 bg-muted/30 rounded-[30px] border-2 border-dashed">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No products yet</h3>
          <p className="text-muted-foreground mb-6">Start your selling journey by adding your first product.</p>
          <Button className="rounded-full">
            <Plus className="mr-2 h-4 w-4" /> Add Your First Product
          </Button>
        </div>
      </main>
    </>
  );
}
