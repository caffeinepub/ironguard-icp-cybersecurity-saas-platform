import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Book, Headphones, Shield, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SupportCategory } from "../backend";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useSubmitSupportRequest } from "../hooks/useQueries";

export default function SupportPage() {
  const [fullName, setFullName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [supportCategory, setSupportCategory] = useState<SupportCategory | "">(
    "",
  );
  const [description, setDescription] = useState("");

  const submitRequest = useSubmitSupportRequest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !fullName ||
      !businessEmail ||
      !organizationName ||
      !supportCategory ||
      !description
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await submitRequest.mutateAsync({
        fullName,
        businessEmail,
        organizationName,
        supportCategory: supportCategory as SupportCategory,
        description,
      });

      toast.success("Support request submitted successfully");

      // Reset form
      setFullName("");
      setBusinessEmail("");
      setOrganizationName("");
      setSupportCategory("");
      setDescription("");
    } catch (error) {
      toast.error("Failed to submit support request. Please try again.");
      console.error("Support request error:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-20">
        <div className="container max-w-6xl">
          {/* Page Header */}
          <div className="text-center space-y-3 mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Support & Resources
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Access documentation, contact support, and review common
              questions.
            </p>
          </div>

          {/* Support Options Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card className="border-border/50 hover:border-border transition-colors flex flex-col h-full">
              <CardHeader className="space-y-3 flex-1">
                <Book className="h-7 w-7 text-primary/80" />
                <CardTitle className="text-lg">Documentation</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Product Documentation & API Reference
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" className="w-full">
                  View Documentation
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-border transition-colors flex flex-col h-full">
              <CardHeader className="space-y-3 flex-1">
                <Users className="h-7 w-7 text-primary/80" />
                <CardTitle className="text-lg">
                  Knowledge Base & Community
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Curated discussions and shared knowledge from the IronGuard
                  ICP user community.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" className="w-full">
                  Access Knowledge Base
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-border transition-colors flex flex-col h-full">
              <CardHeader className="space-y-3 flex-1">
                <Headphones className="h-7 w-7 text-primary/80" />
                <CardTitle className="text-lg">
                  Contact Technical Support
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Standard response time: within 24 business hours. Priority
                  support for Growth and Enterprise plans.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Support Request Form */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle className="text-2xl">Submit Support Request</CardTitle>
              <CardDescription className="text-sm">
                Complete the form below to submit a support request. Our team
                will respond within 24 business hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Smith"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="businessEmail"
                      className="text-sm font-medium"
                    >
                      Business Email Address{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="businessEmail"
                      type="email"
                      value={businessEmail}
                      onChange={(e) => setBusinessEmail(e.target.value)}
                      placeholder="john.smith@company.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="organizationName"
                    className="text-sm font-medium"
                  >
                    Organization Name{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="organizationName"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="Your organization name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="supportCategory"
                    className="text-sm font-medium"
                  >
                    Support Category <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={supportCategory}
                    onValueChange={(value) =>
                      setSupportCategory(value as SupportCategory)
                    }
                    required
                  >
                    <SelectTrigger id="supportCategory">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SupportCategory.billing}>
                        Billing
                      </SelectItem>
                      <SelectItem value={SupportCategory.technicalIssue}>
                        Technical Issue
                      </SelectItem>
                      <SelectItem value={SupportCategory.security}>
                        Security
                      </SelectItem>
                      <SelectItem value={SupportCategory.accountAccess}>
                        Account Access
                      </SelectItem>
                      <SelectItem value={SupportCategory.other}>
                        Other
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description of Issue{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please provide a detailed description of your issue or question"
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitRequest.isPending}
                  >
                    {submitRequest.isPending
                      ? "Submitting..."
                      : "Submit Support Request"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Do not include sensitive or confidential information.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground">
                Common questions about IronGuard ICP security and operations
              </p>
            </div>

            <div className="space-y-4 max-w-4xl mx-auto">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    How secure is IronGuard ICP?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    IronGuard ICP uses zero-knowledge architecture with
                    end-to-end encryption. All data is encrypted client-side
                    before upload, and we never have access to your plaintext
                    data.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    What is ICP / NNS authentication?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    ICP / NNS authentication uses cryptographic identity on the
                    Internet Computer, providing passwordless or multi-factor
                    security without centralized credential storage.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    How do subscription changes work?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Subscription plans can be changed from the Billing & Usage
                    section of the dashboard. Plan changes take effect at the
                    start of the next billing cycle.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Compliance & Trust Footer */}
          <Card className="bg-muted/30 border-border/50">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-3">
                <Shield className="h-8 w-8 text-primary/80" />
              </div>
              <CardTitle className="text-xl">
                Security & Privacy Commitment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                IronGuard ICP is designed to support enterprise security and
                compliance requirements, including audit logging, access
                controls, and encrypted data storage.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
