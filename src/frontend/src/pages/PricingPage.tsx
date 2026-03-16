import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { Check, Database, FileCheck, Lock, Shield, Users } from "lucide-react";
import Footer from "../components/Footer";
import Header from "../components/Header";

type TierAccent = "starter" | "growth" | "enterprise" | "custom";

const tiers = [
  {
    name: "Starter",
    subtitle: "Small Business",
    price: "$49",
    period: "/month",
    storage: "10GB included",
    overage: "$0.50/GB additional",
    description: "For small businesses and individuals",
    features: [
      "Zero-knowledge encryption",
      "ICP/NNS authentication",
      "Basic audit logs",
      "Email support",
      "API access",
      "Single team member",
    ],
    cta: "Get Started",
    ctaLink: "/auth",
    ctaVariant: "outline" as const,
    accent: "starter" as TierAccent,
  },
  {
    name: "Growth",
    subtitle: "Mid-Size Business",
    price: "$199",
    period: "/month",
    storage: "50GB included",
    overage: "$0.40/GB additional",
    description: "For growing teams",
    features: [
      "Everything in Starter",
      "Advanced authentication",
      "Complete audit logs",
      "Priority support",
      "Full API access",
      "Up to 10 team members",
      "Real-time analytics",
      "Custom integrations",
    ],
    cta: "Get Started",
    ctaLink: "/auth",
    ctaVariant: "default" as const,
    popular: true,
    accent: "growth" as TierAccent,
  },
  {
    name: "Enterprise",
    subtitle: "Large Organizations",
    price: "$499–$999",
    period: "/month",
    storage: "200GB included",
    overage: "$0.30/GB additional",
    description: "For enterprises",
    features: [
      "Everything in Growth",
      "Enterprise SSO",
      "Immutable audit logs",
      "24/7 dedicated support",
      "Advanced API features",
      "Unlimited team members",
      "Custom compliance reports",
      "SLA guarantees",
      "Dedicated account manager",
      "Multi-region redundancy",
    ],
    cta: "Contact Sales",
    ctaLink: "/support",
    ctaVariant: "outline" as const,
    accent: "enterprise" as TierAccent,
  },
  {
    name: "Custom / Government",
    subtitle: "",
    price: "$2,000–$10,000",
    period: "/month",
    storage: "Custom storage",
    overage: "",
    description: "Custom solutions for government and large enterprises",
    features: [
      "Custom storage allocation",
      "Government-grade security",
      "On-premise deployment options",
      "White-glove support",
      "Custom feature development",
      "Advanced compliance",
      "Multi-region redundancy",
      "Custom SLAs",
    ],
    cta: "Request Consultation",
    ctaLink: "/support",
    ctaVariant: "outline" as const,
    accent: "custom" as TierAccent,
  },
];

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-16 md:py-24">
        <div className="container">
          {/* Header Section */}
          <div className="text-center space-y-4 mb-16 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Predictable, Enterprise-Ready Pricing
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Straightforward platform pricing with usage-based storage. No
              hidden fees.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-20">
            {tiers.map((tier) => (
              <Card
                key={tier.name}
                className={`
                  pricing-tier-card
                  pricing-tier-${tier.accent}
                  relative flex flex-col border
                  ${tier.popular ? "border-primary shadow-lg" : "border-border/60"}
                  bg-card
                  transition-all duration-300 ease-out
                  hover:shadow-glass-md hover:-translate-y-1
                  group
                  ${tier.popular ? "pt-8" : ""}
                `}
                style={{
                  willChange: "transform, box-shadow",
                }}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 px-4 py-1 bg-primary text-primary-foreground rounded-full text-xs font-semibold uppercase tracking-wide whitespace-nowrap shadow-md">
                    Most Popular
                  </div>
                )}
                <CardHeader className="space-y-4 pb-6 relative z-10">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold">
                      {tier.name}
                    </CardTitle>
                    {tier.subtitle && (
                      <p className="text-sm text-muted-foreground font-medium">
                        {tier.subtitle}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-3xl md:text-4xl font-bold text-foreground">
                        {tier.price}
                      </span>
                      <span className="text-muted-foreground text-base">
                        {tier.period}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {tier.storage}
                      </p>
                      {tier.overage && (
                        <p className="text-sm text-muted-foreground">
                          {tier.overage}
                        </p>
                      )}
                    </div>
                  </div>
                  <CardDescription className="text-sm leading-relaxed">
                    {tier.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 flex-1 flex flex-col relative z-10">
                  <ul className="space-y-3 flex-1">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start space-x-3">
                        <Check className="h-4 w-4 text-foreground/70 flex-shrink-0 mt-0.5" />
                        <span className="text-sm leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link to={tier.ctaLink} className="block">
                    <Button
                      className={`
                        w-full
                        pricing-tier-button-${tier.accent}
                        transition-all duration-300 ease-out
                        hover:shadow-glass-sm
                      `}
                      variant={tier.ctaVariant}
                      size="lg"
                    >
                      {tier.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Usage-Based Storage Section */}
          <section className="py-16 border-y border-border/50 bg-muted/20 -mx-4 px-4 md:mx-0 md:px-0 md:rounded-lg mb-20">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Usage-Based Storage
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p className="text-base md:text-lg">
                  Storage is billed monthly based on actual usage. Each tier
                  includes a base storage allocation, with transparent per-GB
                  pricing for additional capacity.
                </p>
                <p className="text-base md:text-lg">
                  No hidden fees. No storage minimums. Pay only for what you
                  use.
                </p>
              </div>
            </div>
          </section>

          {/* Built for Business Trust Section */}
          <section className="py-16 max-w-5xl mx-auto">
            <div className="text-center space-y-8">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Built for Business
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-6">
                <div className="text-center space-y-3">
                  <Shield className="h-10 w-10 mx-auto text-foreground/70" />
                  <p className="text-sm font-medium leading-tight">
                    Zero-Knowledge
                    <br />
                    Encryption
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <Lock className="h-10 w-10 mx-auto text-foreground/70" />
                  <p className="text-sm font-medium leading-tight">
                    Cryptographic Identity
                    <br />
                    (ICP/NNS)
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <Database className="h-10 w-10 mx-auto text-foreground/70" />
                  <p className="text-sm font-medium leading-tight">
                    Immutable Audit
                    <br />
                    Logging
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <Users className="h-10 w-10 mx-auto text-foreground/70" />
                  <p className="text-sm font-medium leading-tight">
                    Enterprise
                    <br />
                    Controls
                  </p>
                </div>
                <div className="text-center space-y-3 col-span-2 md:col-span-1">
                  <FileCheck className="h-10 w-10 mx-auto text-foreground/70" />
                  <p className="text-sm font-medium leading-tight">
                    Compliance
                    <br />
                    Readiness
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom CTA */}
          <div className="mt-16 text-center space-y-4">
            <p className="text-muted-foreground text-base">
              Questions about pricing or need a custom solution?{" "}
              <Link
                to="/support"
                className="text-foreground hover:underline font-medium"
              >
                Contact our team
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        /* Pricing tier card hover effects with theme-aware glass-morphism */
        .pricing-tier-card {
          position: relative;
          overflow: visible;
          isolation: isolate;
        }

        /* Background layer with glass-morphism - isolated from content */
        .pricing-tier-card::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 300ms ease-out, backdrop-filter 300ms ease-out;
          pointer-events: none;
          border-radius: inherit;
          z-index: 0;
        }

        /* ===== DARK MODE HOVER EFFECTS ===== */
        /* Starter - Deep Cyber Blue → Soft Sky Blue */
        .dark .pricing-tier-starter:hover::before {
          opacity: 0.10;
          background: linear-gradient(135deg, 
            oklch(0.65 0.16 220) 0%, 
            oklch(0.70 0.12 210) 100%
          );
          box-shadow: 
            inset 0 0 0 1px oklch(0.65 0.16 220 / 0.25),
            0 8px 32px -8px oklch(0.65 0.16 220 / 0.4),
            0 0 24px -8px oklch(0.65 0.16 220 / 0.2);
          backdrop-filter: blur(12px);
        }

        .dark .pricing-tier-starter:hover {
          border-color: oklch(0.65 0.16 220 / 0.35);
        }

        /* Growth - Emerald/Teal → Muted Mint Green */
        .dark .pricing-tier-growth:hover::before {
          opacity: 0.10;
          background: linear-gradient(135deg, 
            oklch(0.60 0.18 165) 0%, 
            oklch(0.65 0.14 155) 100%
          );
          box-shadow: 
            inset 0 0 0 1px oklch(0.60 0.18 165 / 0.25),
            0 8px 32px -8px oklch(0.60 0.18 165 / 0.4),
            0 0 24px -8px oklch(0.60 0.18 165 / 0.2);
          backdrop-filter: blur(12px);
        }

        .dark .pricing-tier-growth:hover {
          border-color: oklch(0.60 0.18 165 / 0.35);
        }

        /* Enterprise - Royal Purple → Lavender/Soft Violet */
        .dark .pricing-tier-enterprise:hover::before {
          opacity: 0.10;
          background: linear-gradient(135deg, 
            oklch(0.63 0.20 290) 0%, 
            oklch(0.68 0.16 280) 100%
          );
          box-shadow: 
            inset 0 0 0 1px oklch(0.63 0.20 290 / 0.25),
            0 8px 32px -8px oklch(0.63 0.20 290 / 0.4),
            0 0 24px -8px oklch(0.63 0.20 290 / 0.2);
          backdrop-filter: blur(12px);
        }

        .dark .pricing-tier-enterprise:hover {
          border-color: oklch(0.63 0.20 290 / 0.35);
        }

        /* Custom/Government - Restrained Magenta/Rose → Pale Rose */
        .dark .pricing-tier-custom:hover::before {
          opacity: 0.10;
          background: linear-gradient(135deg, 
            oklch(0.67 0.16 340) 0%, 
            oklch(0.72 0.12 350) 100%
          );
          box-shadow: 
            inset 0 0 0 1px oklch(0.67 0.16 340 / 0.25),
            0 8px 32px -8px oklch(0.67 0.16 340 / 0.4),
            0 0 24px -8px oklch(0.67 0.16 340 / 0.2);
          backdrop-filter: blur(12px);
        }

        .dark .pricing-tier-custom:hover {
          border-color: oklch(0.67 0.16 340 / 0.35);
        }

        /* ===== LIGHT MODE HOVER EFFECTS ===== */
        /* Starter - Soft Sky Blue with clean shadow */
        .pricing-tier-starter:hover::before {
          opacity: 0.06;
          background: linear-gradient(135deg, 
            oklch(0.75 0.08 220) 0%, 
            oklch(0.80 0.06 210) 100%
          );
          box-shadow: 
            inset 0 0 0 1px oklch(0.60 0.12 220 / 0.15),
            0 4px 16px -4px oklch(0.60 0.12 220 / 0.15);
          backdrop-filter: blur(8px);
        }

        .pricing-tier-starter:hover {
          border-color: oklch(0.60 0.12 220 / 0.25);
        }

        /* Growth - Muted Mint Green with clean shadow */
        .pricing-tier-growth:hover::before {
          opacity: 0.06;
          background: linear-gradient(135deg, 
            oklch(0.72 0.10 165) 0%, 
            oklch(0.77 0.08 155) 100%
          );
          box-shadow: 
            inset 0 0 0 1px oklch(0.55 0.14 165 / 0.15),
            0 4px 16px -4px oklch(0.55 0.14 165 / 0.15);
          backdrop-filter: blur(8px);
        }

        .pricing-tier-growth:hover {
          border-color: oklch(0.55 0.14 165 / 0.25);
        }

        /* Enterprise - Lavender/Soft Violet with clean shadow */
        .pricing-tier-enterprise:hover::before {
          opacity: 0.06;
          background: linear-gradient(135deg, 
            oklch(0.74 0.12 290) 0%, 
            oklch(0.79 0.10 280) 100%
          );
          box-shadow: 
            inset 0 0 0 1px oklch(0.58 0.16 290 / 0.15),
            0 4px 16px -4px oklch(0.58 0.16 290 / 0.15);
          backdrop-filter: blur(8px);
        }

        .pricing-tier-enterprise:hover {
          border-color: oklch(0.58 0.16 290 / 0.25);
        }

        /* Custom/Government - Pale Rose with clean shadow */
        .pricing-tier-custom:hover::before {
          opacity: 0.06;
          background: linear-gradient(135deg, 
            oklch(0.76 0.10 340) 0%, 
            oklch(0.81 0.08 350) 100%
          );
          box-shadow: 
            inset 0 0 0 1px oklch(0.62 0.12 340 / 0.15),
            0 4px 16px -4px oklch(0.62 0.12 340 / 0.15);
          backdrop-filter: blur(8px);
        }

        .pricing-tier-custom:hover {
          border-color: oklch(0.62 0.12 340 / 0.25);
        }

        /* ===== DARK MODE BUTTON HOVER EFFECTS ===== */
        .dark .pricing-tier-button-starter:hover {
          background: oklch(0.65 0.16 220 / 0.15);
          border-color: oklch(0.65 0.16 220 / 0.45);
          color: oklch(0.75 0.14 220);
          box-shadow: 0 0 16px -4px oklch(0.65 0.16 220 / 0.3);
        }

        .dark .pricing-tier-button-growth:hover {
          background: oklch(0.60 0.18 165 / 0.15);
          border-color: oklch(0.60 0.18 165 / 0.45);
          color: oklch(0.70 0.16 165);
          box-shadow: 0 0 16px -4px oklch(0.60 0.18 165 / 0.3);
        }

        .dark .pricing-tier-button-enterprise:hover {
          background: oklch(0.63 0.20 290 / 0.15);
          border-color: oklch(0.63 0.20 290 / 0.45);
          color: oklch(0.73 0.18 290);
          box-shadow: 0 0 16px -4px oklch(0.63 0.20 290 / 0.3);
        }

        .dark .pricing-tier-button-custom:hover {
          background: oklch(0.67 0.16 340 / 0.15);
          border-color: oklch(0.67 0.16 340 / 0.45);
          color: oklch(0.77 0.14 340);
          box-shadow: 0 0 16px -4px oklch(0.67 0.16 340 / 0.3);
        }

        /* ===== LIGHT MODE BUTTON HOVER EFFECTS ===== */
        .pricing-tier-button-starter:hover {
          background: oklch(0.75 0.08 220 / 0.12);
          border-color: oklch(0.60 0.12 220 / 0.35);
          color: oklch(0.45 0.14 220);
          box-shadow: 0 2px 8px -2px oklch(0.60 0.12 220 / 0.2);
        }

        .pricing-tier-button-growth:hover {
          background: oklch(0.72 0.10 165 / 0.12);
          border-color: oklch(0.55 0.14 165 / 0.35);
          color: oklch(0.40 0.16 165);
          box-shadow: 0 2px 8px -2px oklch(0.55 0.14 165 / 0.2);
        }

        .pricing-tier-button-enterprise:hover {
          background: oklch(0.74 0.12 290 / 0.12);
          border-color: oklch(0.58 0.16 290 / 0.35);
          color: oklch(0.43 0.18 290);
          box-shadow: 0 2px 8px -2px oklch(0.58 0.16 290 / 0.2);
        }

        .pricing-tier-button-custom:hover {
          background: oklch(0.76 0.10 340 / 0.12);
          border-color: oklch(0.62 0.12 340 / 0.35);
          color: oklch(0.47 0.14 340);
          box-shadow: 0 2px 8px -2px oklch(0.62 0.12 340 / 0.2);
        }

        /* Mobile: disable hover effects on touch devices */
        @media (hover: none) and (pointer: coarse) {
          .pricing-tier-card:hover::before {
            opacity: 0;
            backdrop-filter: none;
          }
          
          .pricing-tier-card:hover {
            border-color: inherit;
            transform: none;
            box-shadow: inherit;
          }

          .pricing-tier-button-starter:hover,
          .pricing-tier-button-growth:hover,
          .pricing-tier-button-enterprise:hover,
          .pricing-tier-button-custom:hover {
            background: inherit;
            border-color: inherit;
            color: inherit;
            box-shadow: inherit;
          }
        }
      `}</style>
    </div>
  );
}
