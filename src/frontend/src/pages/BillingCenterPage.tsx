import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Download, TrendingUp, CheckCircle2, Calendar, DollarSign, Shield, AlertTriangle } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerBusinessProfile, useCreateCheckoutSession, useGetCustomerBillingStatus } from '../hooks/useQueries';
import { toast } from 'sonner';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DashboardSidebar from '../components/DashboardSidebar';
import BillingAlert from '../components/BillingAlert';
import { BillingStatus } from '../backend';
import type { ShoppingItem } from '../backend';
import { BillingSummarySkeleton } from '../components/SkeletonLoader';

const subscriptionPrices: Record<string, number> = {
  'Starter': 49,
  'Growth': 199,
  'Enterprise': 499,
  'Custom/Government': 2000,
};

const subscriptionDetails: Record<string, { storage: string; overage: string }> = {
  'Starter': { storage: '10GB', overage: '$0.50/GB' },
  'Growth': { storage: '50GB', overage: '$0.40/GB' },
  'Enterprise': { storage: '200GB', overage: '$0.30/GB' },
  'Custom/Government': { storage: 'Custom', overage: 'Custom' },
};

export default function BillingCenterPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading, isFetched } = useGetCallerBusinessProfile();
  const { data: billingStatus, isLoading: billingLoading } = useGetCustomerBillingStatus();
  const createCheckout = useCreateCheckoutSession();
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/auth' });
      return;
    }

    if (isFetched && !profile) {
      navigate({ to: '/onboarding' });
    }
  }, [identity, profile, isFetched, navigate]);

  const handleSubscriptionPayment = async () => {
    if (!profile) return;

    setProcessingPayment(true);
    try {
      const price = subscriptionPrices[profile.subscriptionTier] || 49;
      const items: ShoppingItem[] = [
        {
          productName: `${profile.subscriptionTier} Plan - Monthly Subscription`,
          productDescription: `IronGuard ICP ${profile.subscriptionTier} subscription with ${subscriptionDetails[profile.subscriptionTier]?.storage || '10GB'} included storage`,
          priceInCents: BigInt(price * 100),
          quantity: BigInt(1),
          currency: 'usd',
        },
      ];

      const session = await createCheckout.mutateAsync(items);
      window.location.href = session.url;
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment. Please ensure Stripe is configured.');
      setProcessingPayment(false);
    }
  };

  const handleUpgrade = async (tier: string) => {
    setProcessingPayment(true);
    try {
      const price = subscriptionPrices[tier] || 49;
      const items: ShoppingItem[] = [
        {
          productName: `Upgrade to ${tier} Plan`,
          productDescription: `IronGuard ICP ${tier} subscription with ${subscriptionDetails[tier]?.storage || '10GB'} included storage`,
          priceInCents: BigInt(price * 100),
          quantity: BigInt(1),
          currency: 'usd',
        },
      ];

      const session = await createCheckout.mutateAsync(items);
      window.location.href = session.url;
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Failed to initiate upgrade. Please try again.');
      setProcessingPayment(false);
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

  if (!profile) return null;

  const currentPrice = subscriptionPrices[profile.subscriptionTier] || 49;
  const currentDetails = subscriptionDetails[profile.subscriptionTier] || { storage: '10GB', overage: '$0.50/GB' };

  const getBillingStatusBadge = () => {
    if (!billingStatus) return null;
    
    if (billingStatus === BillingStatus.active) {
      return (
        <Badge variant="default" className="text-sm">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Active
        </Badge>
      );
    }
    
    if (billingStatus === BillingStatus.grace) {
      return (
        <Badge variant="outline" className="text-sm border-yellow-500 text-yellow-500">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Grace Period
        </Badge>
      );
    }
    
    if (billingStatus === BillingStatus.restricted) {
      return (
        <Badge variant="destructive" className="text-sm">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Restricted
        </Badge>
      );
    }
  };

  const getBillingStatusText = () => {
    if (!billingStatus) return 'Current';
    
    if (billingStatus === BillingStatus.active) return 'Current';
    if (billingStatus === BillingStatus.grace) return 'Payment Issue - Grace Period';
    if (billingStatus === BillingStatus.restricted) return 'Service Restricted';
    
    return 'Current';
  };

  const getBillingStatusColor = () => {
    if (!billingStatus || billingStatus === BillingStatus.active) return 'text-green-500';
    if (billingStatus === BillingStatus.grace) return 'text-yellow-500';
    if (billingStatus === BillingStatus.restricted) return 'text-destructive';
    return 'text-green-500';
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="flex-1 flex">
        <DashboardSidebar />
        
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Billing Alert */}
            {billingStatus && <BillingAlert status={billingStatus} showUpdateButton={false} />}

            <div>
              <h1 className="text-3xl font-bold mb-2">Billing Center</h1>
              <p className="text-muted-foreground">
                Manage your subscription, payment methods, and view billing history
              </p>
            </div>

            {/* Current Subscription */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Current Subscription</CardTitle>
                    <CardDescription>Your active plan and billing details</CardDescription>
                  </div>
                  {getBillingStatusBadge()}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {billingLoading ? (
                  <BillingSummarySkeleton />
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-bold">{profile.subscriptionTier} Plan</h3>
                        <p className="text-muted-foreground">
                          {currentDetails.storage} included storage • {currentDetails.overage} overage
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold">${currentPrice}</p>
                        <p className="text-sm text-muted-foreground">per month</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="flex items-start space-x-3">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Next Billing Date</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Payment Method</p>
                          <p className="text-sm text-muted-foreground">Secure checkout via Stripe</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Billing Status</p>
                          <p className={`text-sm font-medium ${getBillingStatusColor()}`}>
                            {getBillingStatusText()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex flex-wrap gap-3">
                      <Button onClick={handleSubscriptionPayment} disabled={processingPayment} size="lg">
                        <CreditCard className="mr-2 h-4 w-4" />
                        {processingPayment ? 'Processing...' : billingStatus && billingStatus !== BillingStatus.active ? 'Update Payment & Restore Service' : 'Confirm Payment'}
                      </Button>
                      <Button variant="outline" size="lg" disabled>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Update Payment Method
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Payments are processed securely through Stripe. We support credit cards, debit cards, Apple Pay, Google Pay, and PayPal.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Manage your payment methods for subscriptions and usage charges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No payment methods saved yet</p>
                  <Button variant="outline" disabled>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Add Payment Method
                  </Button>
                  <p className="text-xs text-muted-foreground mt-4">
                    Payment methods will be saved securely after your first payment
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Upgrade Options */}
            <Card>
              <CardHeader>
                <CardTitle>Upgrade Your Plan</CardTitle>
                <CardDescription>Get more storage and advanced features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(subscriptionPrices)
                    .filter(([tier]) => tier !== profile.subscriptionTier)
                    .map(([tier, price]) => {
                      const details = subscriptionDetails[tier];
                      return (
                        <div
                          key={tier}
                          className="p-5 border border-border rounded-lg hover:border-primary transition-colors hover:shadow-md"
                        >
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold text-lg">{tier}</h4>
                              <p className="text-sm text-muted-foreground">{details.storage} included</p>
                            </div>
                            <div>
                              <p className="text-3xl font-bold">${price}</p>
                              <p className="text-sm text-muted-foreground">per month</p>
                            </div>
                            <Button 
                              variant="outline" 
                              className="w-full" 
                              onClick={() => handleUpgrade(tier)}
                              disabled={processingPayment}
                            >
                              <TrendingUp className="mr-2 h-4 w-4" />
                              Upgrade
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Invoice History */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice History</CardTitle>
                <CardDescription>View and download your past invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">No invoices yet</p>
                  <p className="text-sm text-muted-foreground">
                    Invoices will appear here after your first payment
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Usage-Based Billing Info */}
            <Card>
              <CardHeader>
                <CardTitle>Usage-Based Storage Billing</CardTitle>
                <CardDescription>How storage charges work</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm">
                    Your subscription includes {currentDetails.storage} of storage. If you exceed this amount, you'll be charged {currentDetails.overage} for each additional GB used.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Storage is calculated monthly based on actual usage</li>
                    <li>No hidden fees or minimum charges</li>
                    <li>Overage charges are billed automatically at the end of each month</li>
                    <li>You can upgrade your plan anytime to get more included storage</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
