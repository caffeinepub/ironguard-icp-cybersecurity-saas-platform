import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Database, Key, Activity, FileCheck } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
          <div className="container relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                Enterprise-Grade Security.{' '}
                <span className="block mt-2">Built on Zero-Knowledge Architecture.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                IronGuard ICP is a secure data hosting and cybersecurity platform that delivers 
                end-to-end encryption, immutable audit logs, and cryptographic identity—without 
                exposing your data or private keys.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Link to="/auth">
                  <Button size="lg" variant="default" className="w-full sm:w-auto px-8 bg-foreground text-background hover:bg-foreground/90">
                    Get Started
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 border-2">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trust & Security Signal Section */}
        <section className="py-12 border-y border-border/50 bg-muted/20">
          <div className="container">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-8">
                Trusted Security Architecture
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                <div className="text-center space-y-2">
                  <Shield className="h-8 w-8 mx-auto text-foreground/70" />
                  <p className="text-sm font-medium leading-tight">Zero-Knowledge<br />Encryption</p>
                </div>
                <div className="text-center space-y-2">
                  <Lock className="h-8 w-8 mx-auto text-foreground/70" />
                  <p className="text-sm font-medium leading-tight">ICP/NNS Cryptographic<br />Identity</p>
                </div>
                <div className="text-center space-y-2">
                  <Database className="h-8 w-8 mx-auto text-foreground/70" />
                  <p className="text-sm font-medium leading-tight">Immutable Audit<br />Logging</p>
                </div>
                <div className="text-center space-y-2">
                  <Key className="h-8 w-8 mx-auto text-foreground/70" />
                  <p className="text-sm font-medium leading-tight">Enterprise-Grade Key<br />Management</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Overview Section */}
        <section className="py-20 md:py-28">
          <div className="container">
            <div className="text-center space-y-4 mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Designed for Security-First Organizations
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                A unified platform for secure data hosting, identity management, and real-time security visibility.
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="border border-border/60 bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="space-y-4">
                  <Shield className="h-10 w-10 text-foreground/80" />
                  <div className="space-y-2">
                    <CardTitle className="text-xl font-semibold">Zero-Knowledge Encryption</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Client-side encryption ensures IronGuard never accesses or processes plaintext data.
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border border-border/60 bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="space-y-4">
                  <Lock className="h-10 w-10 text-foreground/80" />
                  <div className="space-y-2">
                    <CardTitle className="text-xl font-semibold">ICP / NNS Authentication</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Cryptographic identity and access control powered by the Internet Computer.
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border border-border/60 bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="space-y-4">
                  <Database className="h-10 w-10 text-foreground/80" />
                  <div className="space-y-2">
                    <CardTitle className="text-xl font-semibold">Immutable Audit Logs</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Tamper-resistant activity records stored on-chain for full traceability.
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border border-border/60 bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="space-y-4">
                  <Key className="h-10 w-10 text-foreground/80" />
                  <div className="space-y-2">
                    <CardTitle className="text-xl font-semibold">Smart Key Vault</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Encrypted storage for NNS keys with user-only decryption and access control.
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border border-border/60 bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="space-y-4">
                  <Activity className="h-10 w-10 text-foreground/80" />
                  <div className="space-y-2">
                    <CardTitle className="text-xl font-semibold">Real-Time Analytics</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Live visibility into usage, access events, and security status.
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border border-border/60 bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="space-y-4">
                  <FileCheck className="h-10 w-10 text-foreground/80" />
                  <div className="space-y-2">
                    <CardTitle className="text-xl font-semibold">Compliance Ready</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Designed to support SOC 2, GDPR, and HIPAA compliance requirements.
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Dashboard Preview Section */}
        <section className="py-20 md:py-28 bg-muted/20">
          <div className="container">
            <div className="text-center space-y-4 mb-12 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Security Visibility Without Complexity
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Monitor storage, access activity, and security posture from a single dashboard.
              </p>
            </div>
            <div className="max-w-5xl mx-auto">
              <div className="rounded-lg border border-border/60 bg-card shadow-lg overflow-hidden">
                <img
                  src="/assets/generated/dashboard-preview.dim_800x500.png"
                  alt="Dashboard Preview"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 md:py-28">
          <div className="container text-center space-y-8 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Get Started with IronGuard ICP
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Deploy enterprise-grade security and encrypted data hosting in minutes.
            </p>
            <Link to="/auth">
              <Button size="lg" className="px-8 bg-foreground text-background hover:bg-foreground/90">
                Get Started
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
