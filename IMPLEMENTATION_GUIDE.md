# CrankMart - Step-by-Step Implementation Guide

**Version:** 1.0
**Date:** 2026-04-11
**Methodology:** CDDP (Customer-Driven Development Process)

---

## Overview

This guide takes the cloned CycleMart codebase and transforms it into CrankMart, deployed on the Neon + Vercel + GitHub stack, with internationalisation foundations for future country expansion.

**Estimated Phase 1 timeline:** 4-6 weeks

---

## Phase 0: Foundation & Setup (Week 1)

### Step 1: Repository Setup (Complete)
- [x] GitHub repository created at Lewhof/crankmart
- [x] CycleMart source code cloned into repository
- [x] Working branch: claude/clone-cyclemart-repo-IJQm2

### Step 2: Branch Strategy
```
main              -- production (deploys to crankmart.com)
develop           -- integration branch
feature/*         -- feature branches
hotfix/*          -- production fixes
```

**Action items:**
1. Merge clone branch into `main` as initial commit
2. Create `develop` branch from `main`
3. All work proceeds on `feature/*` branches, merged to `develop`
4. `develop` merges to `main` for releases

### Step 3: Neon Database Setup
1. Create new Neon project: "crankmart-production"
2. Create database: "crankmart"
3. Note connection string (pooled endpoint for serverless)
4. Create a development branch in Neon (for dev/preview environments)
5. Store credentials:
   - `DATABASE_URL` (pooled connection string)
   - `DATABASE_URL_UNPOOLED` (direct connection for migrations)

### Step 4: Vercel Project Setup
1. Create new Vercel project linked to Lewhof/crankmart
2. Framework preset: Next.js
3. Build settings: defaults (auto-detected)
4. Configure environment variables:
   ```
   DATABASE_URL=<neon-pooled-url>
   DATABASE_URL_UNPOOLED=<neon-direct-url>
   NEXTAUTH_SECRET=<generate-new-secret>
   NEXTAUTH_URL=https://crankmart.com
   GOOGLE_CLIENT_ID=<create-new-project>
   GOOGLE_CLIENT_SECRET=<create-new-project>
   PAYFAST_MERCHANT_ID=24040660
   PAYFAST_MERCHANT_KEY=<existing-key>
   PAYFAST_PASSPHRASE=<existing-passphrase>
   PAYFAST_SANDBOX=true
   ```
5. Custom domains:
   - crankmart.com (primary)
   - crankmart.co.za (301 redirect to crankmart.com/za)
6. Enable preview deployments for PRs
7. Enable Neon integration (auto preview database branches)

### Step 5: DNS Configuration
1. Point crankmart.com to Vercel:
   - A record: 76.76.21.21
   - CNAME: cname.vercel-dns.com (for www)
2. Point crankmart.co.za to Vercel (for 301 redirect):
   - A record: 76.76.21.21
   - Configure redirect rule in Vercel: crankmart.co.za/* -> crankmart.com/za/$1 (301)
3. Verify both domains in Vercel dashboard
4. SSL auto-provisioned by Vercel for both domains

---

## Phase 1A: Rebrand (Week 1-2)

### Step 6: Package & Config Rebrand
**Files to update:**
1. `package.json` -- Change name from "cyclemart" to "crankmart"
2. `vercel.json` -- Verify/update any domain references
3. `drizzle.config.ts` -- Update if any cyclemart references
4. `next.config.ts` -- Replace cyclemart.co.za with crankmart.com in image domains

### Step 7: Brand Assets
1. Design new CrankMart logo (or update from existing)
2. Generate favicon set:
   - `/app/favicon.ico` (16x16, 32x32 multi-size)
   - `/app/apple-icon.png` (180x180)
   - `/app/icon-192.png` (192x192 for PWA)
   - `/app/icon-512.png` (512x512 for PWA)
   - `/public/favicon-16x16.png`
   - `/public/favicon-32x32.png`
   - `/public/apple-icon.png`
   - `/public/icon-192.png`
   - `/public/icon-512.png`
3. Update hero/banner images if they contain CycleMart branding:
   - `/public/images/cyclemart-brand-banner.jpg`
   - `/public/images/hero-brand-banner.jpg`

### Step 8: Code Rebrand (Systematic Find & Replace)
Execute in this order to avoid breaking references:

1. **Layout & SEO** (`app/layout.tsx`):
   - Organization schema: name, URL, social links
   - Page title/description metadata
   - Social media handles

2. **Email templates** (`src/lib/email-templates.ts`):
   - All 11 templates: replace "CycleMart" with "CrankMart"
   - Update logo URL to crankmart.com/apple-icon.png
   - Update footer links

3. **Email sender** (`src/lib/email.ts`):
   - From address: info@crankmart.com

4. **Navigation** (`src/components/nav/`):
   - TopNav.tsx -- logo, brand text
   - Footer.tsx -- brand, links, social handles
   - BottomNav.tsx -- any brand references

5. **localStorage keys** (sell flow pages):
   - `cyclemart-sell-category` -> `crankmart-sell-category`
   - `cyclemart-sell-draft` -> `crankmart-sell-draft`
   - `cyclemart-sell-photos` -> `crankmart-sell-photos`

6. **SEO files**:
   - `app/sitemap.ts` -- base URL
   - `app/robots.ts` -- sitemap URL
   - `public/robots.txt` -- sitemap URL
   - `public/llms.txt` -- any brand references

7. **All remaining references**:
   - Run: `grep -r "cyclemart" --include="*.ts" --include="*.tsx" --include="*.css" --include="*.json" -l`
   - Update each file identified

### Step 9: Validate Rebrand
1. `npm run build` -- must pass with zero errors
2. Search codebase for any remaining "cyclemart" (case-insensitive)
3. Visual check: run dev server and verify brand appears correctly on:
   - Home page
   - Browse page
   - Listing detail
   - Sell flow
   - Login/register
   - Footer
   - Email template preview (/admin/email-templates)

---

## Phase 1B: Internationalisation Foundation (Week 2-3)

### Step 10: Country Configuration System
Create country config files:

```
src/config/
├── countries/
│   ├── index.ts       # Country registry & helpers
│   └── za.ts          # South Africa config
├── currency.ts        # Currency formatting utilities
└── regions.ts         # Region/province helpers
```

**South Africa config (za.ts):**
```typescript
export const zaConfig = {
  code: "ZA",
  name: "South Africa",
  currency: { code: "ZAR", symbol: "R", locale: "en-ZA" },
  regions: [
    { value: "western-cape", label: "Western Cape" },
    { value: "gauteng", label: "Gauteng" },
    // ... all 9 provinces
  ],
  paymentGateway: "payfast" as const,
  phoneFormat: "+27",
  timezone: "Africa/Johannesburg",
  domain: "crankmart.com",
}
```

### Step 11: Database Schema Updates
Add `country_code` column to location-dependent tables:
- `listings` -- country_code VARCHAR(2) DEFAULT 'ZA'
- `businesses` -- country_code VARCHAR(2) DEFAULT 'ZA'
- `routes` -- country_code VARCHAR(2) DEFAULT 'ZA'
- `events` -- country_code VARCHAR(2) DEFAULT 'ZA'
- `users` -- country_code VARCHAR(2) DEFAULT 'ZA'

Create Drizzle migration: `drizzle/0008_country_code.sql`

### Step 12: Currency Abstraction
Replace all hardcoded "R" currency formatting with a utility:
```typescript
// src/config/currency.ts
export function formatPrice(cents: number, countryCode: string): string
```

Identify and update all price display locations:
- Listing cards and detail pages
- Boost package cards
- Pricing page
- Admin panels
- Email templates

### Step 13: Region Abstraction
Replace hardcoded province selectors with dynamic region lists:
- Sell flow step 4 (province selector)
- Register page (province selector)
- Browse filters
- Directory filters
- Route filters
- Event filters
- Admin filters

### Step 14: Payment Gateway Abstraction
Create a payment gateway interface:
```typescript
// src/lib/payments/interface.ts
export interface PaymentGateway {
  createPayment(params: PaymentParams): Promise<PaymentResult>
  validateWebhook(request: Request): Promise<WebhookResult>
  getPaymentStatus(id: string): Promise<PaymentStatus>
}
```

Wrap existing PayFast code behind this interface. When Australia launches, add Stripe implementation of the same interface.

---

## Phase 1C: Database & Deployment (Week 3-4)

### Step 15: Schema Migration to Neon
1. Connect Drizzle to new Neon database
2. Run `npx drizzle-kit push` to create all tables
3. Verify all 17 tables created with correct columns and enums
4. Verify indexes and constraints

### Step 16: Full Data Migration from CycleMart
**All CycleMart data migrates to CrankMart** (tagged country_code='ZA'):

1. Export from CycleMart Neon database (pg_dump or Drizzle export)
2. Import into CrankMart Neon database
3. Run migration script to add country_code='ZA' to all existing records
4. Alternatively, run seed scripts if starting from seed data:
   - `npm run db:seed` -- categories, users, sample listings
   - `tsx seed-directory.ts` -- business directory (SA businesses)
   - `tsx seed-routes-v2.ts` -- cycling routes
   - Run event seed scripts as needed

**Migration checklist:**
- [ ] Users and accounts
- [ ] All listings + listing images
- [ ] All businesses / directory entries
- [ ] All routes + images + loops + reviews
- [ ] All events (including past -- historical record)
- [ ] All news articles
- [ ] Boost packages and transactions
- [ ] Messages and conversations
- [ ] Categories
- [ ] All records tagged country_code='ZA'

**Verify counts match CycleMart source database.**

After verification, decommission CycleMart velo-server (systemd service, nginx, port 3099).

### Step 17: Image Storage (Vercel Blob)
**Decision: Vercel Blob** -- native Vercel integration, CDN-backed, serverless-compatible, cost-effective at scale.

1. Install: `npm install @vercel/blob`
2. Add `BLOB_READ_WRITE_TOKEN` to Vercel environment variables
3. Update upload API routes (`/api/sell/upload`, `/api/account/avatar`, `/api/directory/upload`) to use `put()` from `@vercel/blob`
4. Update `next.config.ts` to allow images from Vercel Blob hostname
5. Migrate any existing cyclemart.co.za/uploads/* URLs in database to new Blob URLs (or accept broken images for old local-upload references)

Existing remote image URLs (Unsplash, Trailforks, etc.) remain as-is -- no migration needed.

### Step 18: Environment Configuration
Verify all environment variables are set in Vercel:

**Required:**
```
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL=https://crankmart.com
```

**Authentication (at least one):**
```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

**Payments:**
```
PAYFAST_MERCHANT_ID
PAYFAST_MERCHANT_KEY
PAYFAST_PASSPHRASE
PAYFAST_SANDBOX=true  (set false when ready for live)
```

**Email (when ready):**
```
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
```

### Step 19: Route Restructure (Global + /[country])
This is the most significant architectural change. Move country-specific pages under a dynamic `[country]` segment.

**Pages that move under `app/[country]/`:**
- `browse/` (listings)
- `sell/` (sell flow)
- `directory/` (business directory)
- `routes/` (cycling routes)
- `events/` (events calendar)
- `news/` (news/blog)
- `seller/` (seller profiles)
- `boost/` (boost selection)
- `search/` (search results)
- `pricing/` (pricing page -- may vary per country)

**Pages that stay global (no country prefix):**
- `login/`, `register/`, `forgot-password/` (auth)
- `account/` (user dashboard)
- `admin/` (admin panel)
- `faq/`, `privacy/`, `terms/`, `how-to/` (static/legal)

**New pages:**
- `app/page.tsx` -- Global landing with country selector
- `app/[country]/page.tsx` -- Country-specific home page
- `app/[country]/layout.tsx` -- Country layout (injects country context)
- `app/admin/whiteboard/page.tsx` -- Admin to-do/whiteboard

**Country validation middleware:**
Add middleware or layout-level validation to ensure `[country]` param matches a registered country code (za, au, nz). Return 404 for invalid country codes.

### Step 20: API Route Restructure
API routes that return country-specific data need the country context:
- Option A: Add `?country=za` query parameter to existing endpoints
- Option B: Move APIs under `/api/[country]/` segments
- **Recommended: Option A** -- simpler, less file restructuring, country passed from client context

### Step 21: First Deployment
1. Merge all changes to `main`
2. Vercel auto-deploys from `main`
3. Verify deployment at crankmart.com
4. Smoke test all core pages:
   - [ ] crankmart.com loads (global landing)
   - [ ] crankmart.com/za loads (SA home)
   - [ ] crankmart.com/za/browse shows listings
   - [ ] Listing detail renders at /za/browse/[slug]
   - [ ] Sell flow navigates all 4 steps at /za/sell/*
   - [ ] Login/register forms work (global)
   - [ ] Directory page loads at /za/directory
   - [ ] Routes page loads at /za/routes
   - [ ] Events page loads at /za/events
   - [ ] Admin panel accessible at /admin
   - [ ] Admin whiteboard loads at /admin/whiteboard
   - [ ] Mobile responsive layout correct
   - [ ] crankmart.co.za redirects to crankmart.com/za

---

## Phase 1D: Quality & Launch (Week 4-5)

### Step 22: Fix Known Issues
From VERSION.md known issues:
1. Wire up full-text search (tsvector columns exist, need query integration)
2. Add `submitted_by` user link for My Routes tab
3. Add author link to news schema for My Articles tab
4. Configure SMTP for email delivery
5. Test PayFast sandbox end-to-end

### Step 23: Performance Optimisation
1. Run Lighthouse audit on key pages
2. Optimise images (ensure Next.js Image component used everywhere)
3. Add loading.tsx skeletons for slow pages (some already exist)
4. Verify static generation for content pages
5. Check bundle size with `@next/bundle-analyzer`

### Step 24: SEO Migration
1. Set up Google Search Console for crankmart.com
2. Submit sitemap (per-country sitemaps: /za/sitemap.xml)
3. Configure 301 redirects:
   - cyclemart.co.za/* -> crankmart.com/za/* (all paths)
   - crankmart.co.za/* -> crankmart.com/za/* (all paths)
   - Submit change of address in Search Console for cyclemart.co.za
4. Verify structured data with Google Rich Results Test
5. Check all pages have proper meta tags (country-aware)

### Step 25: Security Review
1. Verify all API routes have proper auth checks
2. Ensure no secrets in client-side code
3. Add rate limiting to auth endpoints
4. Add Content-Security-Policy headers
5. Review CORS configuration
6. Ensure PayFast IPN endpoint validates signatures

### Step 26: Monitoring Setup
1. Enable Vercel Analytics (built-in)
2. Add Vercel Speed Insights
3. Set up error tracking (Sentry or similar)
4. Configure uptime monitoring
5. Set up alerts for error spikes

### Step 27: Launch Checklist
- [ ] All "cyclemart" references removed
- [ ] New logo/favicon deployed
- [ ] Database seeded with CycleMart data (tagged country_code='ZA')
- [ ] /za routes working (browse, sell, directory, routes, events)
- [ ] Global landing page working (crankmart.com)
- [ ] crankmart.co.za 301-redirects to crankmart.com/za
- [ ] PayFast configured (sandbox tested, merchant 24040660)
- [ ] New Google OAuth project configured
- [ ] Email delivery working
- [ ] Vercel Blob storage for uploads
- [ ] SSL certificates active on crankmart.com and crankmart.co.za
- [ ] Google Search Console configured
- [ ] Sitemap submitted
- [ ] robots.txt verified
- [ ] Lighthouse scores 90+ on all metrics
- [ ] Mobile responsive verified on real devices
- [ ] Admin panel accessible and functional
- [ ] Admin whiteboard page functional
- [ ] Error tracking enabled (Sentry)
- [ ] Backup strategy confirmed (Neon auto-backups)
- [ ] Social media handles secured (see whiteboard to-do)

---

## Phase 2: Australia Expansion (Future)

### Step 28: Australia Configuration
1. Create `src/config/countries/au.ts` with:
   - AUD currency
   - Australian states/territories
   - Stripe payment gateway
   - AEST timezone

### Step 27: Stripe Integration
1. Create Stripe account
2. Implement `src/lib/payments/stripe.ts` against payment gateway interface
3. Configure webhooks
4. Test checkout flow end-to-end

### Step 30: Australian Content
1. Seed Australian cycling routes (source: Trailforks AU, Komoot AU)
2. Seed Australian bike shops and businesses
3. Seed Australian cycling events
4. Source hero images for Australian routes

### Step 31: Launch Australia
- Deploy with AU country context
- Australian SEO (Google AU)
- Local social media accounts
- Partnership outreach to AU cycling community

---

## Phase 3: New Zealand Expansion (Future)

Repeat Phase 2 pattern for NZ:
- `src/config/countries/nz.ts`
- NZD currency, NZ regions
- NZ cycling content seeding
- Path-based: crankmart.com/nz
- NZ cycling community outreach

---

## Appendix A: Key Commands Reference

```bash
# Development
npm install           # Install dependencies
npm run dev           # Start dev server (port 3010)
npm run build         # Production build
npm run lint          # Lint check

# Database
npm run db:push       # Push schema to Neon
npm run db:seed       # Seed base data
tsx seed-directory.ts # Seed directory
tsx seed-routes-v2.ts # Seed routes

# Git
git checkout -b feature/rebrand  # New feature branch
git push -u origin feature/rebrand
```

## Appendix B: File Inventory Requiring Rebrand

Total files to update (identified by grep for "cyclemart"):
- app/layout.tsx
- app/page.tsx
- app/sitemap.ts
- app/robots.ts
- src/lib/email.ts
- src/lib/email-templates.ts
- src/lib/payfast.ts
- src/components/nav/TopNav.tsx
- src/components/nav/Footer.tsx
- src/components/nav/BottomNav.tsx
- app/sell/step-1/page.tsx (localStorage key)
- app/sell/step-2/page.tsx (localStorage key)
- app/sell/step-3/page.tsx (localStorage key)
- app/sell/step-4/page.tsx (localStorage key)
- app/sell/page.tsx
- app/boost/select/page.tsx
- app/boost/success/page.tsx
- next.config.ts
- package.json
- public/robots.txt
- public/llms.txt
- All image assets in public/

## Appendix C: Neon + Vercel Integration

Vercel has native Neon integration:
1. In Vercel project settings > Integrations > Add Neon
2. This auto-populates DATABASE_URL
3. Enables preview branches (each Vercel preview gets its own Neon branch)
4. Zero-config connection pooling

This is the recommended approach over manual connection string management.

---

*This guide is a living document. Each step should be validated before proceeding to the next. No shortcuts.*
