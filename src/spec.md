# IronGuard ICP Cybersecurity SaaS Platform

## Overview
IronGuard ICP is a production-ready cybersecurity SaaS platform that provides secure data hosting with end-to-end encryption and zero-knowledge architecture on the Internet Computer Protocol.

## Authentication & Security
- Primary authentication via ICP/NNS-based mechanism
- Secondary email + password login flow (local validation, no external emails)
- Multi-factor authentication using ICP/NNS cryptographic device/session verification
- Role-based access control for team accounts
- All key generation, storage, and signing performed client-side
- Client-side encryption with user-only decryption capabilities
- Immutable audit logs for all authentication and security events

## Billing & Payments
- Stripe as the primary payment processor with platform-owned API keys configured by admin only
- Payment methods supported: credit cards, debit cards, Apple Pay, Google Pay, and PayPal (via Stripe)
- Subscription tiers:
  - Starter: $49/month, 10GB included, $0.50/GB overage
  - Growth: $199/month, 50GB included, $0.40/GB overage
  - Enterprise: $499-$999/month, 200GB included, $0.30/GB overage
  - Custom/Government: $2000-$10,000/month, custom storage and features
- Monthly subscription billing with automatic renewal
- Usage-based storage billing calculated monthly
- Automatic invoicing with invoice generation, history, and display
- Failed payment workflows with grace periods before service suspension
- Subscription upgrade/downgrade functionality
- Storage metering linked to actual ICP storage usage
- Customer payment method management (add, update, view)
- Secure checkout using Stripe Checkout or Stripe Elements with PCI compliance
- Apple Pay and Google Pay detection and integration
- Configuration toggle for switching between Stripe test and live modes

## Failed Payment Recovery System
- Stripe webhook integration to detect payment failures (declined cards, insufficient funds, expired cards, network errors, authorization failures)
- PayPal webhook integration for PayPal payment failures
- Smart retry schedule (dunning management):
  - Attempt 1: immediate retry
  - Attempt 2: 24 hours later
  - Attempt 3: 72 hours later
  - Stop retries after third attempt
- Grace period logic:
  - 7-day grace period after initial failed payment
  - Full platform access during grace period
  - After 7 days: restrict file uploads, maintain read-only access for data and keys
  - Never delete user data due to payment failures
- Customer notification triggers:
  - Day 0: initial failure notification
  - Day 5: grace period reminder
  - Day 7: final notice before restriction
- Automatic recovery when payment succeeds:
  - Restore full service immediately
  - Clear all alerts and warnings
  - Resume normal billing schedule
- Billing status states: Active, Grace, Restricted
- Compliance requirement: maintain data retention regardless of payment status

## Core Features
- Business onboarding flow collecting business information, industry, size, billing details, and storage estimates
- Secure data upload, download, and deletion pipeline with compliance
- Smart key vault for encrypted NNS key storage with user-only access
- Real-time usage analytics and alerting system
- API access capabilities for enterprise integration

## Theme System
- Global light/dark mode toggle with sun/moon icon in top navigation bar
- Toggle positioned immediately to the right of "IronGuard ICP" brand name
- Dark mode enabled by default with existing dark blue gradient theme
- Light mode with light gradient background (white to light blue/gray)
- **Persistent Theme Storage**:
  - Theme preference stored in browser localStorage for immediate access
  - Theme preference synchronized with user profile settings for authenticated users
  - Server-side theme storage for logged-in users to maintain consistency across devices and sessions
  - Local storage fallback for logged-out users
  - Theme applied before first UI render to prevent flicker or incorrect theme flashes
  - System preference respected only on first visit if no user preference exists
- **Theme Toggle Behavior**:
  - Immediate update of stored preferences upon user action
  - Authentication-aware persistence: server sync for logged-in users, local storage for logged-out users
  - Theme toggle icon and state remain accurate across page reloads and navigation
  - Consistent theme persistence across all sessions, tab changes, navigations, and reloads
- Smooth transitions and animations when switching themes (200-300ms)
- WCAG AA compliant contrast ratios for accessibility
- No layout flash during theme changes

## Branded Loading System
- **Branded Page Transition Loader**:
  - Triggered on internal route changes within the platform
  - Display duration: 1-2 seconds maximum, automatically dismissed when new page is ready
  - Fade-in/fade-out transitions (200-300ms)
  - Theme-aware backgrounds:
    - Dark Mode: deep navy/dark blue gradient background
    - Light Mode: light neutral background
  - IronGuard-branded geometric motif animation featuring shield/triangle/node-inspired elements with cyber blue accent color
  - Optional subtle text: "Verifying security…" or "Securing connection…"
  - Fully respects prefers-reduced-motion accessibility preferences with fallback to static fade transitions only
  - Loader elements are decorative-only for screen readers (aria-hidden)
  - Does not interfere with keyboard navigation or focus management

- **Skeleton Loaders for Data-Driven Views**:
  - Skeleton loaders implemented for:
    - Dashboard widgets and usage metrics
    - Data tables and activity logs
    - Billing summaries and payment information
  - Theme-aware coloring with light/dark neutral tones
  - Consistent layout shape placeholders without flashing or aggressive shimmer effects
  - Automatically replaced with real data when content is ready
  - Maintains WCAG-compliant contrast ratios
  - Respects reduced-motion preferences with static fade instead of shimmer animations

- **Accessibility and Performance**:
  - All loading animations respect system reduced-motion preferences
  - No layout shift on appear/disappear
  - Seamless integration with existing navigation and router
  - Enterprise-grade aesthetic maintained without performance regressions
  - Keyboard navigation and focus remain functional during all loading states

## Global Loading Screen System
- Global loading screen transition for internal page navigations within the platform
- Duration: 1-2 seconds maximum, automatically dismissed when new page is ready
- Design specifications:
  - Minimal, enterprise-grade geometric animation (rotating triangle/shield/node-inspired line animation)
  - Smooth looping motion without spinners or flashing effects
  - Theme-aware background adaptation:
    - Dark Mode: deep navy/dark blue gradient background
    - Light Mode: light neutral background
  - Subtle cyber blue accent color matching theme
  - Optional subtle text: "Securing connection…" or "Verifying integrity…"
- Transition effects: 200-300ms fade-in and fade-out animations
- Accessibility compliance:
  - Respects user's reduced-motion preferences
  - No layout shift on appear/disappear
  - Does not interfere with critical interactions longer than necessary
- Behavior requirements:
  - Triggers on internal route changes only
  - Does not interfere with authentication or payment flows
  - Feels intentional and professional, not slow
- Implementation as reusable global loader component with CSS transitions
- Router change event integration for seamless navigation experience
- Fully responsive design consistent with IronGuard's enterprise visual language
- Works seamlessly across both light and dark modes

## Application Architecture & Rendering
- Proper React Router setup in App.tsx with all routes and components correctly configured
- ThemeProvider properly mounted and providing theme context to all components
- GlobalLoadingScreen component correctly integrated with router navigation without blocking page renders
- All component imports and exports properly configured
- Global CSS styles (index.css) correctly loaded and applied across all pages
- Asset references (logos, icons) properly resolved and displayed
- Responsive layout components rendering correctly on desktop and mobile
- Theme switching functionality working properly across all pages
- Loading screen only appearing during route transitions, not during normal app operation
- Clean dismissal of loading screen when pages are ready to display
- Proper error boundaries and fallback components for robust rendering
- All authentication pages, dashboard, and other routes displaying correctly
- Header navigation and branding elements properly positioned and styled
- Skeleton loaders integrated into data-driven components without layout disruption

## User Interface
- Landing page with enterprise-grade cybersecurity design and professional presentation
- Pricing page displaying subscription tiers with enterprise-focused design and messaging
- Authentication pages for login and registration
- Main dashboard showing usage metrics, alerts, subscription status, ICP wallet balance, and activity logs with skeleton loaders for data-driven content
- Dashboard billing alert banners for payment issues with direct links to "Update Payment Method"
- Data manager for file operations and storage management with skeleton loaders for data tables
- Billing center for subscription management, payment method management, and invoice history with enterprise-grade UI text ("Add Payment Method", "Update Payment Method", "Confirm Payment") and skeleton loaders for billing summaries
- Billing center alert banners and icons indicating billing issues
- Key vault interface for secure key management
- Settings page for account and security configuration
- Support page with enterprise-focused design and professional tone
- Admin panel for platform management, compliance metrics, and Stripe configuration with status display
- Responsive design optimized for desktop and mobile devices with global theme support
- Primary logo (1-modified.png) displayed in header, landing page hero section, authentication screens, and dashboard sidebar with proper scaling for light/dark modes and responsive design
- Branded loading system integrated across all pages and data-driven views

## Home Page Design Requirements
- Sticky header with refined typography, tighter spacing, increased contrast and padding
- Hero section with main heading: "Enterprise-Grade Security. Built on Zero-Knowledge Architecture."
- Hero subheading: "IronGuard ICP is a secure data hosting and cybersecurity platform that delivers end-to-end encryption, immutable audit logs, and cryptographic identity—without exposing your data or private keys."
- Two CTA buttons in hero: "Get Started" (primary) and "View Pricing" (secondary) with neutral, enterprise styling
- Trust & Security Signal section titled "Trusted Security Architecture" with technical bullet points:
  - Zero-Knowledge Encryption
  - ICP/NNS Cryptographic Identity
  - Immutable Audit Logging
  - Enterprise-Grade Key Management
- Platform Overview section: "Designed for Security-First Organizations" with subtitle about unified platform capabilities
- Feature grid with six enterprise-focused features:
  1. Zero-Knowledge Encryption — Client-side encryption with no plaintext access
  2. ICP / NNS Authentication — Cryptographic identity powered by Internet Computer
  3. Immutable Audit Logs — Tamper-resistant on-chain activity records
  4. Smart Key Vault — Encrypted NNS key storage with user-only access
  5. Real-Time Analytics — Live security and usage visibility
  6. Compliance Ready — SOC 2, GDPR, and HIPAA compliance support
- Dashboard Preview section: "Security Visibility Without Complexity" with clean preview container
- Final CTA section: "Get Started with IronGuard ICP" with enterprise deployment messaging
- Restrained color palette, increased spacing, reduced icon saturation, consistent typography hierarchy
- Professional design aligned with established cybersecurity brands

## Pricing Page Design Requirements
- Header section with main heading: "Predictable, Enterprise-Ready Pricing"
- Subheading: "Straightforward platform pricing with usage-based storage. No hidden fees."
- Clean, horizontally aligned pricing grid with consistent typography and spacing
- Four subscription tiers with enterprise-focused messaging:
  - **Starter — Small Business**: $49/month, 10GB included, $0.50/GB additional; for small businesses and individuals. Include 6 bullet features and "Get Started" CTA.
  - **Growth — Mid-Size Business**: $199/month, 50GB included, $0.40/GB additional; for teams. Include 8 bullet features and "Get Started" CTA.
  - **Enterprise — Large Organizations**: $499–$999/month, 200GB included, $0.30/GB additional; for enterprises. Include 10 bullet features and "Contact Sales" CTA.
  - **Custom / Government**: $2,000–$10,000/month; custom storage. Include 8 bullet features and "Request Consultation" CTA.
- Usage-Based Storage section explaining monthly storage billing, no hidden fees, and no minimums
- Built for Business trust section listing: zero-knowledge encryption, cryptographic identity (ICP/NNS), immutable audit logging, enterprise controls, and compliance readiness
- Design consistency with Home page:
  - Neutral color palette
  - Increased spacing and calm layout
  - Reduced visual noise and simplified icons
  - Typography and spacing that feel enterprise-grade and readable
- Responsive design optimized for desktop and mobile
- Professional tone evoking trust, professionalism, and predictability for business decision-makers

## Pricing Page Interactive Effects
- Theme-aware glass-morphism and color-accent hover effects on pricing plan cards:
  - Hover effects activate only on pointer hover and remain subtle and enterprise-grade
  - Glass-morphism effects applied strictly to card background layer only, excluding text and icons from blur or opacity transitions to maintain crisp readability
  - Theme detection (Light/Dark) to adapt accent hues and visual treatments dynamically:
    - **Dark Mode**: Deeper, saturated accent hues with low-opacity soft glows and dark glass blur with slightly luminous borders
    - **Light Mode**: Lighter, desaturated accent hues with soft translucency, replacing glow with clean shadow effects
  - Tier-specific color ramps and gradients for smooth cyber-style transitions:
    - Starter: deep cyber blue → soft sky blue
    - Growth: emerald/teal → muted mint green
    - Enterprise: royal purple → lavender/soft violet
    - Custom/Government: restrained magenta/rose → pale rose/neutral accent
  - Small elevation lift for depth with theme-appropriate border and background color logic
  - Default dark/neutral state when idle
  - Smooth transitions (200-300ms)
  - Graceful degradation on mobile
- "Most Popular" badge positioning and visibility:
  - Proper z-index stacking to ensure badge is fully visible above card content
  - Consistent positioning across light and dark modes with appropriate background context
  - Adequate padding and margin to prevent clipping or overlap with card elements
  - Badge remains visible and properly positioned during hover states
- Card layout consistency:
  - Uniform card height, padding, and alignment across all pricing tiers
  - Consistent spacing and typography hierarchy maintained
  - Proper alignment with other pricing cards in the grid
- Theme-aware primary action button hover effects:
  - Buttons remain neutral by default
  - On hover, match the card's accent color with theme-appropriate treatments
  - Dark mode: subtle glass-morphism with soft glow and shadow
  - Light mode: clean shadow effect with subtle glass blur
  - High-contrast, readable text maintained with brightness adjusted per theme for accessibility
  - Affects "Get Started," "Contact Sales," and "Request Consultation" buttons
- Enterprise-grade professional aesthetic maintained (Cloudflare/Datadog style)
- No flashy gradients, neon colors, or aggressive animations
- Full accessibility (contrast ratios) and responsiveness preserved

## Support Page Design Requirements
- Page header with main heading: "Support & Resources"
- Subheading: "Access documentation, contact support, and review common questions."
- Refined typography consistent with enterprise visual design
- Support Options section with three structured resource panels:
  - **Documentation:** "Product Documentation & API Reference" with "View Documentation" button
  - **Knowledge Base & Community:** "Curated discussions and shared knowledge from the IronGuard ICP user community." with "Access Knowledge Base" button
  - **Contact Technical Support:** Standard response time within 24 business hours, priority support for Growth and Enterprise plans, "Contact Support" CTA
- Equal height cards with horizontally aligned primary action buttons ("View Documentation," "Access Knowledge Base," and "Contact Support") positioned on the same baseline across all three sections
- Uniform card style with neutral color palette, increased spacing, and minimal icons
- Support Request Form with updated labels:
  - Full Name
  - Business Email Address
  - Organization Name
  - Support Category dropdown (Billing, Technical Issue, Security, Account Access, Other)
  - Description of Issue
  - Submit button: "Submit Support Request"
  - Helper text: "Do not include sensitive or confidential information."
- FAQ section titled "Frequently Asked Questions" with enterprise-focused Q&A:
  - How secure is IronGuard ICP? (Answer: IronGuard ICP uses zero-knowledge architecture with end-to-end encryption. All data is encrypted client-side before upload, and we never have access to your plaintext data.)
  - What is ICP / NNS authentication?
  - How do subscription changes work?
- Compliance & Trust footer section: "Security & Privacy Commitment" with enterprise security statement
- Visual enhancements: reduced icon size and saturation, increased spacing and line height, balanced neutral color scheme
- Responsive design optimized for desktop and mobile with consistent typography and tone, maintaining visual balance and alignment across all screen sizes

## Admin Panel Requirements
- Stripe Configuration section displaying "Stripe Status: Configured" or "Stripe Status: Not Configured"
- Clear explanatory text under "Stripe Configuration": "This connects IronGuard ICP's Stripe account for payment processing. This configuration is accessible only to the admin and is required once per platform."
- Admin-only access to platform-owned Stripe API key configuration
- No customer exposure to Stripe setup or developer interfaces
- Platform management and compliance metrics display
- Failed Payment Recovery Management section:
  - Payment failure logs per account with timestamps
  - Retry attempt count and next scheduled retry time
  - Account billing state display (Active, Grace, Restricted)
  - Manual override functionality to set account state manually
  - Admin-only access to all recovery management features

## Data Storage & Security
- Zero-knowledge architecture with no plaintext data storage
- End-to-end encryption for all data in transit and at rest
- Immutable and queryable activity logs
- Enterprise-grade security and scalability design

## Backend Data Storage
- User accounts with authentication credentials and role assignments
- Business profiles and onboarding information
- Subscription data and billing history
- Payment method information and transaction records
- Encrypted file metadata and storage references
- Usage metrics and storage consumption data
- Audit logs and security events
- API access tokens and permissions
- Key vault encrypted storage references
- User theme preferences for synchronization across devices and sessions
- Support request submissions with form data and tracking
- Stripe configuration and API key storage (admin-only)
- Failed payment tracking and grace period management
- Payment failure recovery data:
  - Failed payment events with timestamps and failure reasons
  - Retry attempt logs with status and timestamps
  - Billing status per account (Active, Grace, Restricted)
  - Grace period start dates and expiration tracking
  - Notification trigger logs and delivery status
  - Manual admin override history and audit trail
