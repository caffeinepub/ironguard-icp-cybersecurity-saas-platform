import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AuthPage() {
  const navigate = useNavigate();
  const { identity, login, loginStatus } = useInternetIdentity();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/onboarding' });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="container max-w-md">
          <Card className="border-border/50">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto flex items-center justify-center">
                <img src="/assets/1-modified.png" alt="IronGuard ICP" className="h-20 w-auto" />
              </div>
              <CardTitle className="text-2xl">Welcome to IronGuard ICP</CardTitle>
              <CardDescription>
                Secure authentication powered by Internet Computer Protocol
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="w-full"
                  size="lg"
                >
                  {isLoggingIn ? 'Authenticating...' : 'Login with Internet Identity'}
                </Button>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>Cryptographic authentication with no passwords</span>
                </p>
                <p className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>Multi-factor security built into the protocol</span>
                </p>
                <p className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>Your keys, your data, your control</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
