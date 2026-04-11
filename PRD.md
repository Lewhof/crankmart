# CrankMart - Product Requirements Document (PRD)

**Version:** 1.0
**Date:** 2026-04-11
**Author:** CrankMart Development Team
**Status:** Draft - Pending Stakeholder Approval
**Methodology:** CDDP (Customer-Driven Development Process)

---

## 1. Executive Summary

CrankMart is a full rebrand and international evolution of CycleMart.co.za, a South African cycling marketplace platform. The existing platform (v0.2.1) is a production-ready Next.js application with classifieds, business directory, cycling routes, events calendar, messaging, admin panel, and PayFast payment integration.

This PRD defines the transformation from a single-country cycling marketplace into an internationally scalable platform. The root domain (crankmart.com) serves as the global framework, with country-specific content under path prefixes: /za (South Africa), /au (Australia), /nz (New Zealand), and so on. CycleMart data migrates into the /za vertical. The global framework launches simultaneously as a country-agnostic shell.

**Core principle:** We make no assumptions. Every decision is validated against customer needs, market data, and the existing codebase.

---

## 2. What Already Exists (CycleMart v0.2.1 Audit)

### 2.1 Platform Statistics
| Metric | Count |
|---|---|
| Page routes | 60 |
| API endpoints | 91 |
| Database tables | 17 |
| Database enums | 16 |
| Seed/migration scripts | 100+ |
| UI components | 15+ |
| Email templates | 11 |

### 2.2 Feature Inventory

#### Classifieds Marketplace
- 4-step sell wizard (category > details > photos > pricing/location)
- Draft persistence to localStorage
- Bike-specific fields: make, model, year, frame size, wheel size, drivetrain speeds, brake type, suspension travel, frame material, colour
- Condition grading (new, like_new, used, poor)
- Price in ZAR with negotiation flag
- Shipping availability toggle
- Listing lifecycle: draft > active > sold/expired/removed/paused
- Moderation workflow: pending > approved > rejected > flagged
- Listing renewal with email reminders
- Full-text search (tsvector)
- Infinite scroll browsing with category filters

#### Business Directory
- 5 business types: shop, brand, service_center, tour_operator, event_organiser
- Brands stocked and services arrays
- Claim workflow with JWT tokens (3-touch email outreach)
- Verification pipeline: pending > verified > suspended > claimed > removed
- WhatsApp integration
- Boost tiers for premium placement
- Map integration via Leaflet

#### Cycling Routes
- 5 disciplines: road, MTB, gravel, urban, bikepacking
- 4 difficulty levels: beginner, intermediate, advanced, expert
- Route loops/variants with colour-coded difficulty (green/blue/red/black)
- Distance (km), elevation (m), estimated time
- GPX file support
- Community reviews with ratings and condition notes
- Image galleries with multiple variants (thumb, medium, full)
- Data scrapers: Trailforks, Komoot, MTB Trails SA

#### Events Calendar
- 8 event types: race, sportive, fun_ride, social_ride, training_camp, expo, club_event, charity_ride
- FullCalendar integration with calendar + map views
- Event organiser portal with edit tokens
- Entry fee and registration URL tracking
- 3-touch outreach for organisers
- Moderation workflow: draft > pending_review > verified > cancelled > completed

#### News/Blog
- Article submission and moderation
- Admin news management
- SEO-optimised article detail pages

#### Messaging
- User-to-user direct messaging
- Conversation threads
- Unread count tracking
- Contact seller flow from listing pages

#### Monetisation (Boosts)
- Configurable boost packages (admin CRUD)
- 4 boost types: bump, category_top, homepage, directory
- PayFast payment integration (signature validation, IPN webhook, IP whitelisting)
- Boost expiry via cron job
- Pricing tiers for shops: Free / Starter R149 / Pro R399 / Anchor R999
- Pricing tiers for events: Free / Featured R299 / Headline R799

#### Admin Panel (17 pages)
- Dashboard with stats
- User management with KYC verification
- Listing/event/directory/route moderation
- Boost package management
- PayFast payment monitoring with manual verification
- Theme customisation (dynamic CSS injection from DB)
- Email template preview
- SEO audit tools
- Site settings (SMTP, general config)
- Analytics dashboard
- Report management

#### Authentication & Authorisation
- NextAuth v5-beta with JWT sessions
- Google OAuth + email/password credentials
- 7 user roles: buyer, seller, shop_owner, organiser, vendor, admin, superadmin
- Admin middleware with role checking
- KYC status tracking

### 2.3 Tech Stack (Current)
| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.1 (App Router) |
| Language | TypeScript (strict) |
| Runtime | React 19.2.4 |
| Styling | Tailwind CSS v4 |
| Database | Neon PostgreSQL (serverless) |
| ORM | Drizzle ORM |
| Auth | NextAuth v5-beta |
| API | tRPC + REST API routes |
| Payments | PayFast (SA) |
| Maps | Leaflet.js |
| Calendar | FullCalendar |
| Email | Nodemailer |
| Images | Sharp |
| Scraping | Cheerio |
| Icons | Lucide React |
| UI | shadcn-inspired components |
| State | TanStack React Query |
| Validation | Zod |

### 2.4 South Africa-Specific Hardcoding (Must Be Abstracted)

| Category | Details |
|---|---|
| **Provinces** | All 9 SA provinces hardcoded in seed data, forms, and filters |
| **Currency** | ZAR (R) throughout pricing, PayFast uses cents |
| **Payment** | PayFast (SA-only gateway) |
| **Domain** | cyclemart.co.za hardcoded in 50+ locations |
| **Branding** | "CycleMart" in localStorage keys, email templates, footer, SEO metadata, structured data |
| **Social** | @cyclemartsa on Instagram, TikTok, Facebook |
| **Phone** | SA phone format assumed |
| **Seed data** | Cape Town, Stellenbosch, Durban, Joburg, Pretoria, Bloemfontein, PE, Nelspruit, etc. |
| **Routes** | SA-specific trail sources (mtbtrailssa.co.za, sabie.co.za, etc.) |
| **Server** | Deployed on velo-server via systemd, port 3099, nginx proxy |

---

## 3. Vision & Goals

### 3.1 Vision
CrankMart will be the world's most comprehensive cycling community platform -- a single destination for buying/selling bikes, discovering routes, finding events, and connecting with local cycling businesses, starting with South Africa and expanding country by country.

### 3.2 Goals (Measurable)
| Goal | Metric | Phase 1 Target (SA) |
|---|---|---|
| User acquisition | Registered users | 5,000 in first 6 months |
| Listings | Active listings | 2,000 in first 6 months |
| Directory | Verified businesses | 200 in first 6 months |
| Routes | Approved routes | 500+ (existing seed data) |
| Events | Listed events | 100+ per quarter |
| Revenue | Monthly boost revenue | R25,000/month by month 6 |
| Performance | Lighthouse score | 90+ on all metrics |
| SEO | Organic traffic | 10,000 monthly visits by month 6 |

### 3.3 CDDP Principles Applied
1. **No assumptions** -- every feature justified by user need or market data
2. **No shortcuts** -- every migration step validated, every hardcoded value identified
3. **Customer first** -- user flows validated before implementation
4. **Data-driven** -- analytics from day one, decisions backed by metrics
5. **Phased delivery** -- ship value early, iterate based on feedback

---

## 4. Rebrand Specification: CycleMart --> CrankMart

### 4.1 Branding Changes
| Element | CycleMart (Current) | CrankMart (New) |
|---|---|---|
| Domain | cyclemart.co.za | crankmart.com |
| Name | CycleMart | CrankMart |
| Package name | "cyclemart" | "crankmart" |
| localStorage keys | cyclemart-sell-* | crankmart-sell-* |
| Email sender | info@cyclemart.co.za | info@crankmart.com |
| Social handles | @cyclemartsa | @crankmart (TBD) |
| Logo | Current apple-icon.png | New CrankMart logo (TBD) |
| Colour palette | Review needed | Confirm or update |
| Tagline | None identified | TBD |

### 4.2 SEO Migration & Domain Routing
- **cyclemart.co.za** 301 redirects to **crankmart.com/za** (all paths)
- **crankmart.co.za** 301 redirects to **crankmart.com/za** (all paths)
- Updated sitemap.ts and robots.ts for crankmart.com
- Google Search Console property transfer
- Structured data (Organization schema) updated
- Meta descriptions and OG tags updated
- Canonical URLs on crankmart.com

### 4.3 Files Requiring Rebrand (Identified)
- `package.json` -- name field
- `app/layout.tsx` -- Organization schema, metadata, social links
- `src/lib/email-templates.ts` -- all 11 templates
- `src/lib/email.ts` -- sender address
- `src/components/nav/TopNav.tsx` -- logo, brand text
- `src/components/nav/Footer.tsx` -- brand, links, social handles
- `src/components/nav/BottomNav.tsx` -- brand references
- `app/globals.css` -- any brand-specific styles
- `app/sitemap.ts` -- base URL
- `app/robots.ts` -- sitemap URL
- `next.config.ts` -- image domains
- `public/` -- favicon, icons, logo images
- All seed files referencing cyclemart
- localStorage key prefixes in sell flow pages
- `vercel.json` -- if any domain references
- Various page components with hardcoded brand text

---

## 5. Functional Requirements

### 5.1 Phase 1: Global Framework + South Africa (/za)

#### FR-1: Complete Rebrand
- All user-facing "CycleMart" references replaced with "CrankMart"
- New logo and favicon assets (updated)
- Updated email templates
- Updated SEO metadata and structured data
- Social media handles to be secured (see to-do backlog)

#### FR-2: Two-Layer Architecture (Global + Country)

**Global layer (crankmart.com):**
- Country-agnostic framework/shell
- Global home page with country selector or auto-detect
- Shared auth system (users are global, content is per-country)
- Global admin panel
- Shared UI components, design system, layout

**Country layer (crankmart.com/za):**
- All marketplace features scoped under /za
- South African data: listings, businesses, routes, events, news
- ZAR currency, SA provinces, PayFast payments
- CycleMart data migrated here

**URL structure:**
```
crankmart.com/           --> Global landing / country selector
crankmart.com/za/        --> South Africa home
crankmart.com/za/browse  --> SA listings
crankmart.com/za/routes  --> SA routes
crankmart.com/za/events  --> SA events
crankmart.com/za/directory --> SA directory
crankmart.com/au/        --> Australia home (Phase 2)
crankmart.com/admin      --> Global admin panel
crankmart.com/account    --> User account (global)
crankmart.com/login      --> Auth (global)
```

#### FR-3: Internationalisation Foundation (i18n-Ready Architecture)
- **Country context system**: Region/country abstraction layer
  - Country config: currency, provinces/states, payment gateways, phone format, tax rules
  - Default country: South Africa
  - URL strategy: path-based routing under crankmart.com -- single domain consolidates SEO authority globally
- **Currency abstraction**: Replace hardcoded "R" / ZAR with configurable currency per country
- **Region abstraction**: Replace hardcoded SA provinces with configurable regions per country
- **Payment gateway abstraction**: PayFast for SA (existing merchant 24040660), prepare interface for Stripe (international)

#### FR-4: Database Migration
- New Neon project for CrankMart
- Schema migration from existing Drizzle schema
- CycleMart data migrated as /za content (routes, businesses, events, categories, listings)
- All location-dependent records tagged with country_code='ZA'
- New Google OAuth project (replacing CycleMart credentials)

#### FR-5: Vercel Deployment
- GitHub repo (Lewhof/crankmart) connected to Vercel
- Production branch deployment (main)
- Preview deployments for PRs
- Environment variables configured
- Custom domains: crankmart.com + crankmart.co.za (301 redirect to crankmart.com/za)
- Neon integration for automatic preview database branches

#### FR-6: Image Storage
- **Vercel Blob** for user-uploaded images (avatars, listing photos, business logos)
- Integrated with Vercel, CDN-backed, serverless-compatible
- Replaces the previous nginx-served /uploads/ approach
- Existing scraped image URLs (Unsplash, Trailforks, etc.) remain as remote references

#### FR-7: Existing Features (Carry Forward under /za)
All features from CycleMart v0.2.1 carried forward under the /za country scope:
- Classifieds marketplace (browse, sell, search)
- Business directory (list, claim, verify)
- Cycling routes (browse, review, save)
- Events calendar (browse, submit, manage)
- News/blog
- Messaging
- Boosts/monetisation
- Admin panel
- Authentication

#### FR-8: Admin Whiteboard / To-Do Board
- New admin page: `/admin/whiteboard`
- Project-level to-do tracking and task management
- Used for tracking pending items (social handles, launch tasks, etc.)
- Persisted in database (new table: `admin_todos`)

#### FR-9: Known Issues to Resolve (from VERSION.md)
- PayFast sandbox end-to-end testing
- Full-text search (currently basic ILIKE only -- tsvector exists but may not be fully wired)
- Email SMTP configuration
- Routes table: submitted_by user link for "My Routes" tab
- News: author link in schema for "My Articles" tab

### 5.2 Phase 2: Australia Expansion (/au)
- Country config for Australia (AUD, states/territories, Stripe)
- Australian cycling routes seed data
- Australian business directory seed data
- Australian events calendar
- Path: crankmart.com/au
- Stripe payment integration
- Time zone handling

### 5.3 Phase 3: New Zealand Expansion (/nz)
- Country config for New Zealand (NZD, regions, Stripe)
- NZ cycling routes, directory, events seed data
- Path: crankmart.com/nz

### 5.4 Future Phases
- United Kingdom (/uk), Europe, North America
- Multi-language support (later consideration)
- Mobile app (React Native / Expo)

---

## 6. Non-Functional Requirements

### 6.1 Performance
| Metric | Target |
|---|---|
| Lighthouse Performance | 90+ |
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Cumulative Layout Shift | < 0.1 |
| Time to Interactive | < 3.5s |
| API response time (p95) | < 500ms |

### 6.2 Scalability
- Neon serverless auto-scales with demand
- Vercel edge functions for low-latency global delivery
- Database connection pooling via Neon
- Image optimisation via Next.js Image + Sharp
- Static generation for content pages (routes, events, news)

### 6.3 Security
- HTTPS enforced
- PayFast signature validation (existing)
- Password hashing with bcryptjs (existing)
- CSRF protection via NextAuth
- Input validation via Zod
- Admin role-based access control
- SQL injection prevention via Drizzle ORM parameterised queries
- Rate limiting on auth and API endpoints (to add)
- Content Security Policy headers (to add)

### 6.4 SEO
- Dynamic sitemap generation (existing)
- robots.txt (existing)
- Structured data (Organization, Product, Event schemas)
- Open Graph and Twitter Card meta tags
- Canonical URLs
- Server-side rendering for all public pages
- llms.txt for AI discoverability (existing)

### 6.5 Accessibility
- WCAG 2.1 AA compliance target
- Semantic HTML
- Keyboard navigation
- Screen reader compatibility
- Colour contrast ratios

### 6.6 Reliability
- 99.9% uptime target
- Vercel's global CDN and edge network
- Neon's built-in replication and backups
- Error tracking (to add -- Sentry recommended)
- Health check endpoints

---

## 7. Architecture

### 7.1 Target Stack
| Layer | Technology | Purpose |
|---|---|---|
| **Hosting** | Vercel | Edge deployment, previews, CI/CD |
| **Database** | Neon PostgreSQL | Serverless Postgres, branching, auto-scale |
| **Source Control** | GitHub (Lewhof/crankmart) | Version control, PR workflow |
| **Framework** | Next.js 16 (App Router) | Full-stack React framework |
| **ORM** | Drizzle ORM | Type-safe database access |
| **Auth** | NextAuth v5 (new Google OAuth project) | Authentication & sessions |
| **Payments (SA)** | PayFast (merchant 24040660) | South African payments |
| **Payments (Int'l)** | Stripe (Phase 2+) | International payments |
| **Email** | Nodemailer / Resend (evaluate) | Transactional email |
| **Image Storage** | Vercel Blob | User uploads (avatars, listings, directory) |
| **Image Optimisation** | Next.js Image + Sharp | CDN-backed delivery & transforms |
| **Maps** | Leaflet.js | Interactive maps |
| **Monitoring** | Vercel Analytics + Sentry (add) | Performance & error tracking |

### 7.2 International Architecture

**App Router structure (Next.js dynamic segments):**
```
app/
├── page.tsx                    # Global landing (country selector)
├── login/page.tsx              # Auth (global)
├── register/page.tsx           # Auth (global)
├── account/page.tsx            # User account (global)
├── admin/                      # Admin panel (global)
│   ├── whiteboard/page.tsx     # To-do / task board (new)
│   └── ...existing admin pages
├── [country]/                  # Dynamic country segment
│   ├── page.tsx                # Country home (/za, /au, /nz)
│   ├── browse/page.tsx         # Listings
│   ├── browse/[slug]/page.tsx  # Listing detail
│   ├── sell/                   # Sell flow
│   ├── directory/              # Business directory
│   ├── routes/                 # Cycling routes
│   ├── events/                 # Events calendar
│   ├── news/                   # News/blog
│   └── ...
```

**Config layer:**
```
src/
├── config/
│   └── countries/
│       ├── index.ts       # Country registry, validation, helpers
│       ├── za.ts          # South Africa
│       ├── au.ts          # Australia (Phase 2)
│       └── nz.ts          # New Zealand (Phase 3)
├── lib/
│   ├── country.ts         # Country context provider & hooks
│   ├── currency.ts        # Currency formatting utilities
│   ├── regions.ts         # Region/province helpers
│   └── payments/
│       ├── interface.ts   # Payment gateway interface
│       ├── payfast.ts     # SA implementation (existing)
│       └── stripe.ts      # International (Phase 2)
```

Each country config exports:
```typescript
interface CountryConfig {
  code: string           // "ZA", "AU", "NZ"
  name: string           // "South Africa"
  currency: { code: string; symbol: string; locale: string }
  regions: { value: string; label: string }[]
  paymentGateway: "payfast" | "stripe"
  phoneFormat: string
  timezone: string
  measurementSystem: "metric"  // cycling is metric worldwide
}
```

### 7.3 Database Strategy
- **Phase 1:** Single Neon database, country_code column on relevant tables
- **Phase 2+:** Evaluate Neon branching or separate databases per region based on data volume and latency requirements
- All location-dependent tables (listings, businesses, routes, events) get a `country_code` column
- Global tables (users, boost_packages, site_settings) remain shared

---

## 8. User Flows

### 8.1 Buyer Journey
1. Land on home page (SEO / social / direct)
2. Browse listings with filters (category, location, price, condition)
3. View listing detail (photos, specs, seller info)
4. Contact seller (message / WhatsApp)
5. Save favourite listings
6. Register/login for messaging and saves

### 8.2 Seller Journey
1. Register / login
2. Start sell wizard (4 steps)
3. Upload photos, enter specs, set price
4. Publish listing
5. Receive enquiries via messaging
6. Optionally boost listing for visibility
7. Mark as sold when complete

### 8.3 Business Owner Journey
1. Discover listing in directory (or receive outreach email)
2. Claim business via token link
3. Edit business details (hours, services, brands)
4. Choose pricing tier
5. Manage listing from account dashboard

### 8.4 Event Organiser Journey
1. Submit event via form
2. Event goes through moderation
3. Receive edit token via email
4. Manage event details
5. Optionally boost for featured placement

### 8.5 Route Contributor Journey
1. Browse existing routes
2. Submit new route (or admin imports via scraper)
3. Route reviewed and approved
4. Community leaves reviews and ratings

---

## 9. Competitive Analysis & Market Gap

### 9.1 South African Cycling Market
| Competitor | Focus | Gap CrankMart Fills |
|---|---|---|
| BikeHub.co.za | Classifieds only | No routes, events, directory |
| Gumtree SA | General classifieds | No cycling-specific features, no community |
| Facebook Groups | Informal selling | No structure, no search, no trust |
| Strava | Routes & fitness | No marketplace, no directory |
| BuyCycle.com | International classifieds | No SA focus, no local payment, no community |

### 9.2 CrankMart Competitive Advantages
1. **All-in-one platform** -- classifieds + directory + routes + events + news in one place
2. **Local-first** -- SA payment (PayFast), SA provinces, SA cycling culture
3. **Trust system** -- verified businesses, moderated listings, KYC
4. **Community** -- routes, reviews, events create stickiness beyond transactions
5. **International scalability** -- same model replicable per country
6. **SEO moat** -- route/event/directory pages create massive organic content
7. **Monetisation from day one** -- boost packages, business tiers

### 9.3 International Opportunity
- Australia: ~2M regular cyclists, strong MTB culture, no dominant all-in-one platform
- New Zealand: ~500K cyclists, world-class trail networks, underserved market
- Each country launch multiplies content and network effects

---

## 10. Success Metrics

### 10.1 Launch Metrics (Phase 1 - First 90 Days)
| Metric | Target |
|---|---|
| Site live on crankmart.com | Day 1 |
| Lighthouse score (all metrics) | 90+ |
| Registered users | 500 |
| Active listings | 300 |
| Directory businesses | 100 |
| Verified businesses | 20 |
| Monthly page views | 5,000 |

### 10.2 Growth Metrics (Phase 1 - Months 4-6)
| Metric | Target |
|---|---|
| Registered users | 5,000 |
| Active listings | 2,000 |
| Monthly boost revenue | R25,000 |
| Directory businesses | 200 |
| Monthly organic visitors | 10,000 |
| Email subscribers | 1,000 |

### 10.3 International Metrics (Per New Country)
| Metric | Target (First 6 Months) |
|---|---|
| Registered users | 2,000 |
| Active listings | 500 |
| Directory businesses | 50 |
| Routes seeded | 200+ |

---

## 11. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| SEO ranking loss during rebrand | High | Medium | 301 redirects, Search Console transfer, canonical URLs |
| PayFast integration breaks on migration | High | Low | Test in sandbox before go-live, keep existing config |
| Database migration data loss | High | Low | Backup before migration, validate row counts |
| Internationalisation over-engineering | Medium | Medium | YAGNI -- build country abstraction only, defer multi-language |
| User confusion about rebrand | Medium | Medium | Clear communication, redirect old domain, email existing users |
| Performance regression on Vercel | Medium | Low | Lighthouse CI checks, Vercel analytics monitoring |

---

## 12. Out of Scope (Phase 1)

- Mobile app (React Native / Expo)
- Multi-language / translation
- AI-powered pricing recommendations
- Integrated shipping / logistics
- Stripe integration (Phase 2)
- Real-time chat / WebSockets
- Push notifications
- Bike valuation tool
- Insurance partnerships
- Affiliate programme

---

## 13. Approval & Sign-Off

| Role | Name | Date | Status |
|---|---|---|---|
| Product Owner | | | Pending |
| Technical Lead | | | Pending |
| Design Lead | | | Pending |

---

*This PRD is a living document. It will be updated as CDDP feedback is gathered and phases progress.*
