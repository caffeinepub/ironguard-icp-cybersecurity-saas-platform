import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerBusinessProfile, useSaveCallerBusinessProfile } from '../hooks/useQueries';
import { toast } from 'sonner';
import Header from '../components/Header';
import Footer from '../components/Footer';
import type { BusinessProfile } from '../backend';

const subscriptionTiers = ['Starter', 'Growth', 'Enterprise', 'Custom/Government'];
const industries = ['Technology', 'Healthcare', 'Finance', 'Government', 'Education', 'Retail', 'Other'];
const companySizes = ['1-10', '11-50', '51-200', '201-1000', '1000+'];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: existingProfile, isLoading: profileLoading, isFetched } = useGetCallerBusinessProfile();
  const saveProfile = useSaveCallerBusinessProfile();

  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    size: '',
    billingDetails: '',
    storageEstimateGb: '10',
    subscriptionTier: 'Starter',
    contactEmail: '',
  });

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/auth' });
      return;
    }

    if (isFetched && existingProfile) {
      navigate({ to: '/dashboard' });
    }
  }, [identity, existingProfile, isFetched, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.businessName || !formData.industry || !formData.size || !formData.contactEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const profile: BusinessProfile = {
        businessName: formData.businessName,
        industry: formData.industry,
        size: formData.size,
        billingDetails: formData.billingDetails,
        storageEstimateGb: BigInt(formData.storageEstimateGb),
        subscriptionTier: formData.subscriptionTier,
        contactEmail: formData.contactEmail,
      };

      await saveProfile.mutateAsync(profile);
      toast.success('Business profile created successfully!');
      navigate({ to: '/dashboard' });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to create business profile');
    }
  };

  if (!identity || profileLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-20">
        <div className="container max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Business Onboarding</CardTitle>
              <CardDescription>
                Tell us about your organization to get started with IronGuard ICP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="Acme Corporation"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="contact@acme.com"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry *</Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) => setFormData({ ...formData, industry: value })}
                    >
                      <SelectTrigger id="industry">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="size">Company Size *</Label>
                    <Select
                      value={formData.size}
                      onValueChange={(value) => setFormData({ ...formData, size: value })}
                    >
                      <SelectTrigger id="size">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {companySizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size} employees
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subscriptionTier">Subscription Tier</Label>
                    <Select
                      value={formData.subscriptionTier}
                      onValueChange={(value) => setFormData({ ...formData, subscriptionTier: value })}
                    >
                      <SelectTrigger id="subscriptionTier">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {subscriptionTiers.map((tier) => (
                          <SelectItem key={tier} value={tier}>
                            {tier}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storageEstimate">Storage Estimate (GB)</Label>
                    <Input
                      id="storageEstimate"
                      type="number"
                      min="1"
                      value={formData.storageEstimateGb}
                      onChange={(e) => setFormData({ ...formData, storageEstimateGb: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingDetails">Billing Details (Optional)</Label>
                  <Textarea
                    id="billingDetails"
                    value={formData.billingDetails}
                    onChange={(e) => setFormData({ ...formData, billingDetails: e.target.value })}
                    placeholder="Enter billing address or additional details"
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={saveProfile.isPending}>
                  {saveProfile.isPending ? 'Creating Profile...' : 'Complete Onboarding'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
