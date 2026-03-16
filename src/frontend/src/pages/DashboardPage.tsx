import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Database,
  FileText,
  Shield,
  TrendingUp,
} from "lucide-react";
import { useEffect } from "react";
import { BillingStatus } from "../backend";
import BillingAlert from "../components/BillingAlert";
import DashboardSidebar from "../components/DashboardSidebar";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { DashboardWidgetSkeleton } from "../components/SkeletonLoader";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetBusinessFiles,
  useGetCallerBusinessProfile,
  useGetCustomerBillingStatus,
  useIsCallerAdmin,
} from "../hooks/useQueries";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const {
    data: profile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerBusinessProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: billingStatus } = useGetCustomerBillingStatus();
  const businessId = identity?.getPrincipal().toString() || "";
  const { data: files = [], isLoading: filesLoading } =
    useGetBusinessFiles(businessId);

  useEffect(() => {
    if (!identity) {
      navigate({ to: "/auth" });
      return;
    }

    if (isFetched && !profile) {
      navigate({ to: "/onboarding" });
    }
  }, [identity, profile, isFetched, navigate]);

  if (!identity || profileLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const totalStorageBytes = files.reduce(
    (sum, file) => sum + Number(file.sizeBytes),
    0,
  );
  const totalStorageGB = (totalStorageBytes / 1024 ** 3).toFixed(2);
  const includedStorageGB = Number(profile.storageEstimateGb);
  const storageUsagePercent =
    (Number.parseFloat(totalStorageGB) / includedStorageGB) * 100;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex-1 flex">
        <DashboardSidebar />

        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Billing Alert */}
            {billingStatus && <BillingAlert status={billingStatus} />}

            {/* Welcome Section */}
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {profile.businessName}
              </h1>
              <p className="text-muted-foreground">
                Here's an overview of your security posture and system status
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filesLoading ? (
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
                      <CardTitle className="text-sm font-medium">
                        Storage Used
                      </CardTitle>
                      <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {totalStorageGB} GB
                      </div>
                      <p className="text-xs text-muted-foreground">
                        of {includedStorageGB} GB included
                      </p>
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${Math.min(storageUsagePercent, 100)}%`,
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        Files Stored
                      </CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{files.length}</div>
                      <p className="text-xs text-muted-foreground">
                        Encrypted files
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        Security Status
                      </CardTitle>
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-500">
                        Secure
                      </div>
                      <p className="text-xs text-muted-foreground">
                        All systems operational
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        Active Alerts
                      </CardTitle>
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {billingStatus && billingStatus !== BillingStatus.active
                          ? "1"
                          : "0"}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {billingStatus && billingStatus !== BillingStatus.active
                          ? "Billing issue"
                          : "No active alerts"}
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Subscription Info */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription Details</CardTitle>
                <CardDescription>Your current plan and usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {profile.subscriptionTier} Plan
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {includedStorageGB}GB included storage
                    </p>
                  </div>
                  <Link to="/billing">
                    <Button variant="outline">Manage Subscription</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and operations</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                <Link to="/data-manager">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled={billingStatus === BillingStatus.restricted}
                  >
                    <Database className="mr-2 h-4 w-4" />
                    Upload Data
                  </Button>
                </Link>
                <Link to="/key-vault">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    Manage Keys
                  </Button>
                </Link>
                <Link to="/settings">
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="mr-2 h-4 w-4" />
                    View Activity
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Admin Link */}
            {isAdmin && (
              <Card className="border-primary/50">
                <CardHeader>
                  <CardTitle>Admin Access</CardTitle>
                  <CardDescription>
                    You have administrator privileges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/admin">
                    <Button>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Go to Admin Panel
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
