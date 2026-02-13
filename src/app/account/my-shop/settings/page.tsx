'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AccountHeader } from '@/components/layout/account-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/supabase/provider';
import { sellerService } from '@/supabase/services/seller';
import { getSupabaseClient } from '@/supabase/client';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const supabase = getSupabaseClient();
  
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    shopName: '',
    shopDescription: '',
    shopLogo: '',
    shopBanner: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await sellerService.getSellerProfile(user.id);
        if (profile) {
          setSellerProfile(profile);
          setFormData({
            shopName: profile.shop_name || '',
            shopDescription: profile.shop_description || '',
            shopLogo: profile.shop_logo || '',
            shopBanner: profile.shop_banner || '',
            contactEmail: profile.contact_email || '',
            contactPhone: profile.contact_phone || '',
            address: profile.address || '',
            city: profile.city || '',
            state: profile.state || '',
            zipCode: profile.zip_code || '',
            country: profile.country || '',
          });
        }
      } catch (err) {
        console.error('Failed to load seller profile:', err);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load seller profile.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('seller_profiles')
        .update({
          shop_name: formData.shopName,
          shop_description: formData.shopDescription,
          shop_logo: formData.shopLogo,
          shop_banner: formData.shopBanner,
          contact_email: formData.contactEmail,
          contact_phone: formData.contactPhone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          country: formData.country,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Shop settings updated successfully.',
      });
    } catch (error: any) {
      console.error('Failed to update shop settings:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update shop settings.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!sellerProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <Settings className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-xl font-bold">No Shop Found</h1>
        <p className="text-muted-foreground">Please register as a seller first.</p>
      </div>
    );
  }

  return (
    <>
      <AccountHeader title="Shop Settings" />
      <main className="container mx-auto px-4 pt-4 pb-24 md:pb-8">
        <Card className="rounded-[30px] shadow-card-shadow border-none">
          <CardHeader>
            <CardTitle>Edit Shop Details</CardTitle>
            <CardDescription>Update your shop information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="shopName">Shop Name</Label>
                <Input
                  id="shopName"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shopDescription">Shop Description</Label>
                <Textarea
                  id="shopDescription"
                  name="shopDescription"
                  value={formData.shopDescription}
                  onChange={handleChange}
                  className="rounded-xl"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSaving} className="rounded-full">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="rounded-full"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
