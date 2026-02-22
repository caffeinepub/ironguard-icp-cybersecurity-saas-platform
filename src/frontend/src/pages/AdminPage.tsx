import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Database, 
  Shield, 
  Settings as SettingsIcon, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { 
  useIsCallerAdmin, 
  useGetAllBusinessProfiles, 
  useIsStripeConfigured, 
  useSetStripeConfiguration,
  useGetAllBillingRecords,
  useManuallySetBillingStatus
} from '../hooks/useQueries';
import { toast } from 'sonner';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DashboardSidebar from '../components/DashboardSidebar';
import { BillingStatus } from '../backend';
import type { StripeConfiguration } from '../backend';
import { BillingRecordSkeleton, DashboardWidgetSkeleton } from '../components/SkeletonLoader';

export default function AdminPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: businesses = [], isLoading: businessesLoading } = useGetAllBusinessProfiles();
  const { data: stripeConfigured } = useIsStripeConfigured();
  const { data: billingRecords = [], isLoading: billingLoading } = useGetAllBillingRecords();
  const setStripeConfig = useSetStripeConfiguration();
  const manuallySetStatus = useManuallySetBillingStatus();

  const [showStripeSetup, setShowStripeSetup] = useState(false);
  const [stripeKey, setStripeKey] = useState('');
  const [allowedCountries, setAllowedCountries] = useState('US,CA,GB,AU,DE,FR,IT,ES,NL,SE,NO,DK,FI,IE,BE,AT,CH,PT,PL,CZ,HU,RO,GR,BG,HR,SK,SI,LT,LV,EE,CY,MT,LU');

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/auth' });
      return;
    }

    if (!adminLoading && !isAdmin) {
      navigate({ to: '/dashboard' });
      toast.error('Access denied: Admin privileges required');
    }
  }, [identity, isAdmin, adminLoading, navigate]);

  const handleStripeSetup = async () => {
    if (!stripeKey) {
      toast.error('Please enter a Stripe secret key');
      return;
    }

    if (!stripeKey.startsWith('sk_test_') && !stripeKey.startsWith('sk_live_')) {
      toast.error('Invalid Stripe secret key format');
      return;
    }

    try {
      const config: StripeConfiguration = {
        secretKey: stripeKey,
        allowedCountries: allowedCountries.split(',').map(c => c.trim()).filter(c => c.length > 0),
      };

      await setStripeConfig.mutateAsync(config);
      toast.success('Stripe configuration saved successfully!');
      setShowStripeSetup(false);
      setStripeKey('');
    } catch (error) {
      console.error('Stripe setup error:', error);
      toast.error('Failed to configure Stripe');
    }
  };

  const handleManualStatusChange = async (businessId: string, newStatus: BillingStatus) => {
    try {
      await manuallySetStatus.mutateAsync({ businessId, status: newStatus });
      toast.success(`Billing status updated to ${newStatus}`);
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update billing status');
    }
  };

  const getBillingStatusBadge = (status: BillingStatus) => {
    if (status === BillingStatus.active) {
      return <Badge variant="default" className="text-xs"><CheckCircle2 className="mr-1 h-3 w-3" />Active</Badge>;
    }
    if (status === BillingStatus.grace) {
      return <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-500"><AlertTriangle className="mr-1 h-3 w-3" />Grace</Badge>;
    }
    if (status === BillingStatus.restricted) {
      return <Badge variant="destructive" className="text-xs"><XCircle className="mr-1 h-3 w-3" />Restricted</Badge>;
    }
  };

  const formatTimestamp = (timestamp?: bigint) => {
    if (!timestamp) return 'N/A';
    const date = new Date(Number(timestamp));
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!identity || adminLoading) {
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

  if (!isAdmin) return null;

  const activeCount = billingRecords.filter(r => r.status === BillingStatus.active).length;
  const graceCount = billingRecords.filter(r => r.status === BillingStatus.grace).length;
  const restrictedCount = billingRecords.filter(r => r.status === BillingStatus.restricted).length;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="flex-1 flex">
        <DashboardSidebar />
        
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
              <p className="text-muted-foreground">
                Platform management and configuration
              </p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              {billingLoading ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <DashboardWidgetSkeleton />
                      </CardHeader>
                    </Card>
                  ))}
                </>
              ) : (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{businesses.length}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-500">{activeCount}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Grace Period</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-500">{graceCount}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Restricted</CardTitle>
                      <XCircle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-destructive">{restrictedCount}</div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Stripe Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Stripe Configuration</CardTitle>
                <CardDescription>
                  This connects IronGuard ICP's Stripe account for payment processing. This configuration is accessible only to the admin and is required once per platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {stripeConfigured ? (
                      <>
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                        <div>
                          <p className="font-medium">Stripe Status: Configured</p>
                          <p className="text-sm text-muted-foreground">Payment processing is active</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-6 w-6 text-destructive" />
                        <div>
                          <p className="font-medium">Stripe Status: Not Configured</p>
                          <p className="text-sm text-muted-foreground">Payment processing is disabled</p>
                        </div>
                      </>
                    )}
                  </div>
                  <Button 
                    onClick={() => setShowStripeSetup(!showStripeSetup)}
                    variant={stripeConfigured ? "outline" : "default"}
                  >
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    {stripeConfigured ? 'Update Configuration' : 'Configure Stripe'}
                  </Button>
                </div>

                {!stripeConfigured && (
                  <Alert>
                    <AlertDescription>
                      Stripe must be configured before customers can make payments. This is a one-time setup that enables credit cards, debit cards, Apple Pay, Google Pay, and PayPal processing.
                    </AlertDescription>
                  </Alert>
                )}

                {showStripeSetup && (
                  <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
                    <div className="space-y-2">
                      <Label htmlFor="stripeKey">Stripe Secret Key</Label>
                      <Input
                        id="stripeKey"
                        type="password"
                        value={stripeKey}
                        onChange={(e) => setStripeKey(e.target.value)}
                        placeholder="sk_test_... or sk_live_..."
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter your platform's Stripe secret key. Use test keys (sk_test_) for testing or live keys (sk_live_) for production.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="countries">Allowed Countries (comma-separated)</Label>
                      <Input
                        id="countries"
                        value={allowedCountries}
                        onChange={(e) => setAllowedCountries(e.target.value)}
                        placeholder="US,CA,GB,AU,DE,FR..."
                      />
                      <p className="text-xs text-muted-foreground">
                        Specify which countries can make payments. Use ISO 3166-1 alpha-2 country codes.
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleStripeSetup} disabled={setStripeConfig.isPending}>
                        {setStripeConfig.isPending ? 'Saving...' : 'Save Configuration'}
                      </Button>
                      <Button variant="outline" onClick={() => setShowStripeSetup(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Failed Payment Recovery Management */}
            <Card>
              <CardHeader>
                <CardTitle>Failed Payment Recovery Management</CardTitle>
                <CardDescription>
                  Monitor and manage payment failures, retry attempts, and account billing states
                </CardDescription>
              </CardHeader>
              <CardContent>
                {billingLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <BillingRecordSkeleton key={i} />
                    ))}
                  </div>
                ) : billingRecords.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No billing records available
                  </div>
                ) : (
                  <div className="space-y-4">
                    {billingRecords.map((record, index) => {
                      const business = businesses.find(b => 
                        identity?.getPrincipal().toString() === record.businessId || 
                        b.businessName === record.businessId
                      );
                      
                      return (
                        <div
                          key={index}
                          className="p-4 border border-border rounded-lg space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="font-medium">
                                  {business?.businessName || record.businessId.substring(0, 20) + '...'}
                                </p>
                                {getBillingStatusBadge(record.status)}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Business ID: {record.businessId.substring(0, 30)}...
                              </p>
                            </div>
                          </div>

                          <Separator />

                          <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-start space-x-2">
                              <RefreshCw className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="font-medium">Retry Attempts</p>
                                <p className="text-muted-foreground">
                                  {record.retryAttempts.toString()} / 3
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-2">
                              <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="font-medium">Next Retry</p>
                                <p className="text-muted-foreground">
                                  {formatTimestamp(record.nextRetryTime)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-2">
                              <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="font-medium">Grace Period Start</p>
                                <p className="text-muted-foreground">
                                  {formatTimestamp(record.gracePeriodStart)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {record.paymentFailureLogs.length > 0 && (
                            <>
                              <Separator />
                              <div className="space-y-2">
                                <p className="text-sm font-medium">Payment Failure Logs</p>
                                {record.paymentFailureLogs.slice(0, 3).map((log, logIndex) => (
                                  <div key={logIndex} className="text-xs p-2 bg-muted/50 rounded">
                                    <div className="flex justify-between mb-1">
                                      <span className="font-medium text-destructive">{log.reason}</span>
                                      <span className="text-muted-foreground">
                                        ${(Number(log.amount) / 100).toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                      <span>Attempts: {log.attempts.toString()}</span>
                                      <span>{formatTimestamp(log.timestamp)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}

                          <Separator />

                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleManualStatusChange(record.businessId, BillingStatus.active)}
                              disabled={manuallySetStatus.isPending || record.status === BillingStatus.active}
                            >
                              Set Active
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleManualStatusChange(record.businessId, BillingStatus.grace)}
                              disabled={manuallySetStatus.isPending || record.status === BillingStatus.grace}
                            >
                              Set Grace
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleManualStatusChange(record.businessId, BillingStatus.restricted)}
                              disabled={manuallySetStatus.isPending || record.status === BillingStatus.restricted}
                            >
                              Set Restricted
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Business Profiles */}
            <Card>
              <CardHeader>
                <CardTitle>Business Profiles</CardTitle>
                <CardDescription>
                  All registered businesses on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {businessesLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 border border-border rounded-lg flex items-center justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                          <div className="h-3 w-64 bg-muted rounded animate-pulse" />
                        </div>
                        <div className="h-3 w-12 bg-muted rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : businesses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No businesses registered yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {businesses.map((business, index) => (
                      <div
                        key={index}
                        className="p-4 border border-border rounded-lg flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{business.businessName}</p>
                          <p className="text-sm text-muted-foreground">
                            {business.industry} • {business.size} • {business.subscriptionTier}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {business.storageEstimateGb.toString()}GB
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
