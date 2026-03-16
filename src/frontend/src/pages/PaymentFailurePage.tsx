import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function PaymentFailurePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 flex items-center justify-center py-20">
        <div className="container max-w-md">
          <Card className="border-destructive/50">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Payment Failed</CardTitle>
              <CardDescription>
                There was an issue processing your payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm text-muted-foreground">
                  Your payment could not be processed. Please check your payment
                  details and try again.
                </p>
              </div>
              <div className="space-y-2">
                <Link to="/billing">
                  <Button className="w-full">Try Again</Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="outline" className="w-full">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
