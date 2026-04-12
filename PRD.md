# CrankMart - Product Requirements Document

**Version:** 2.0 (Production Draft)
**Date:** 2026-04-11
**Status:** In Review
**Owner:** Lew Hofmeyr (COO / Product)
**Audience:** Engineering, Design, QA, DevOps, Stakeholders
**Methodology:** CDDP (CTO Deliberative Development Protocol)

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-11 | CTO | Initial draft (high-level) |
| 2.0 | 2026-04-11 | CTO | Production rewrite: personas, user stories, API contracts, flows, threat model, migration runbook, testing strategy |

### Related Documents
- `docs/API_CONTRACTS.md` -- Full API reference (91+ endpoints)
- `docs/REBRAND_INVENTORY.md` -- 950+ change locations for rebrand/i18n
- `IMPLEMENTATION_GUIDE.md` -- 31-step implementation roadmap

---

## Table of Contents (Full PRD)

**Part 1 (this document):** Executive Summary, Problem Statement, Personas, Success Metrics
**Part 2:** Functional Requirements with User Stories, Feature Inventory, Data Model
**Part 3:** User Flows, Security Threat Model, Privacy & Compliance, Testing Strategy
**Part 4:** Migration Runbook, Release Criteria, Monitoring, Feature Flags, Risks, Glossary

---

## 1. Executive Summary

### 1.1 What CrankMart Is
CrankMart is the international evolution of CycleMart.co.za, a production-grade cycling community platform combining:
- **Classifieds marketplace** (2,000+ listings target)
- **Business directory** (bike shops, brands, service centres, tour operators, event organisers)
- **Cycling routes library** (500+ SA routes from Trailforks/Komoot/MTB Trails SA)
- **Events calendar** (races, sportives, rides, training camps)
- **Community messaging** (buyer-seller direct chat)
- **News & editorial**

Built on Next.js 16 + Neon Postgres + Vercel + Drizzle ORM, with PayFast (SA) and future Stripe (international) payments.

### 1.2 Why We're Rebuilding
| Driver | Detail |
|--------|--------|
| **Rebrand** | CycleMart -> CrankMart (new domain, brand, social, email) |
| **International scalability** | Phased rollout: SA -> AU -> NZ -> UK -> EU -> US |
| **Stack modernisation** | Move from self-hosted velo-server to Neon + Vercel serverless |
| **Infrastructure simplification** | Decommission nginx, systemd, manual uploads; adopt Vercel Blob, edge CDN |
| **Architectural foresight** | Country-agnostic framework at crankmart.com root with per-country verticals at /za, /au, /nz |

### 1.3 Strategic Outcomes (12-month horizon)
- crankmart.com live globally with /za as the first country vertical
- SA user base migrated from cyclemart.co.za (301 redirects preserve SEO)
- Australia launched (Phase 2) using the same framework
- 99.9% uptime, sub-2.5s LCP, Lighthouse 90+ across all pages
- R25,000+ monthly recurring revenue from SA boost packages
- Foundation laid for Stripe + multi-locale expansion

### 1.4 CDDP Alignment
This PRD was produced following the CDDP protocol: Review -> Research -> Scope -> Spec -> Cross-Reference -> Integration Assessment -> Suggest/Ask/Advise -> Request to Execute. Every requirement is justified by user need, market data, or existing code (documented in Part 2's cross-reference column).

---

## 2. Problem Statement

### 2.1 The Problem
**For South African cyclists:** There is no single trusted destination combining bike classifieds, local shop discovery, trail information, events, and community. Options today:

| Current | Problem |
|---------|---------|
| BikeHub.co.za | Classifieds only; no routes, events, or directory; dated UX |
| Gumtree, Facebook Marketplace | No cycling focus; low trust; no search/filter by bike specs |
| Facebook Groups (MTB SA, etc.) | No structure, no search, scam risk, poor discovery |
| Strava | Training/routes only; no marketplace, no directory |
| BuyCycle.com | International; no SA payment, no SA routes, no local community |

**Gap:** SA cyclists juggle 4-6 platforms. Discovery is fractured. Trust is low. Sellers lose money to scams. Shops can't reach buyers efficiently. Event organisers rely on Facebook and email.

### 2.2 The Opportunity
**SA cycling market:**
- Estimated 500K+ active cyclists
- Strong MTB culture (Cape Epic, sani2c, Wines2Whales)
- Growing road cycling segment
- Established bike shop network (400+ shops)
- Active event calendar (150+ events/year)

**International market (future phases):**
- Australia: ~2M regular cyclists, strong MTB culture, no dominant all-in-one
- New Zealand: ~500K cyclists, world-class trail networks, underserved
- UK: mature but fragmented (BikeRadar, Sell My Bike, eBay)
- EU / US: massive addressable market, Stripe-native

**CrankMart's edge:**
1. All-in-one (marketplace + directory + routes + events + community)
2. Local payment (PayFast for SA, Stripe for international)
3. Trust layer (verified businesses, moderated listings, KYC, POPIA/GDPR compliant)
4. Content moat (curated routes + events = massive SEO surface)
5. Monetisation from day one (boost packages, tiered business subscriptions)
6. International framework (single codebase, country modules)

### 2.3 Business Case
| Metric | Year 1 Target (SA) | Year 3 (SA + AU + NZ) |
|--------|--------------------|-----------------------|
| Registered users | 10,000 | 100,000 |
| Active listings | 3,000 | 25,000 |
| Directory businesses | 400 | 2,500 |
| Monthly recurring boost revenue | R25,000 (~$1,350) | $50,000 |
| Marketplace GMV | R15M (~$815K) | $15M |
| Organic monthly visitors | 25,000 | 400,000 |

**Unit economics:** Boost packages (R149-R999/month), business tiers (R0-R999/month), future: transaction fees, featured placement, sponsored content.

---

## 3. Target Users & Personas

### 3.1 Persona: **Sibu** -- The Private Seller
- **Role:** Hobbyist MTB cyclist, Cape Town
- **Age:** 34
- **Goals:** Sell his Specialized Stumpjumper to upgrade; reach serious buyers, avoid scammers
- **Pain points:** Facebook Marketplace is full of lowballs; doesn't want to pay R500 Gumtree fees
- **Needs:** Easy listing flow, photo upload, price guidance, in-app messaging, buyer verification
- **Success:** Lists in <5 min, sells in 14 days, pays 0 commission
- **Maps to:** Sell flow (steps 1-4), listing renewal, messaging, boost-for-visibility

### 3.2 Persona: **Thandi** -- The Buyer
- **Role:** New cyclist looking for first real bike, Johannesburg
- **Age:** 28
- **Goals:** Find a reliable hardtail under R15,000 near her
- **Pain points:** Doesn't know what specs matter; worried about buying a stolen bike
- **Needs:** Filter by discipline/price/location, clear condition grading, seller reputation, WhatsApp contact
- **Success:** Finds bike in 3-5 searches, messages seller, meets safely
- **Maps to:** Browse, search, filters, listing detail, contact seller, saved listings

### 3.3 Persona: **Marco** -- The Bike Shop Owner
- **Role:** Owner of Marco's Cycles (independent shop), Stellenbosch
- **Age:** 48
- **Goals:** Drive walk-in traffic, promote new stock, build online presence
- **Pain points:** Google ranking poor; Facebook reach declining; can't afford full digital agency
- **Needs:** Business profile, brand/service listings, boosted placement, analytics, claim existing listing
- **Success:** Claims his listing, upgrades to Pro tier (R399/mo), gets 50+ directory views/week
- **Maps to:** Directory, business claim flow, my-shop dashboard, boost packages, verification

### 3.4 Persona: **Kagiso** -- The Event Organiser
- **Role:** Volunteer organiser of Soweto Cycle Festival
- **Age:** 41
- **Goals:** Maximise entries, reach cyclists across Gauteng
- **Pain points:** Relies on WhatsApp groups and posters; low repeat attendance
- **Needs:** Event submission, calendar visibility, map view, boosted listing option, edit link
- **Success:** Event listed, 300+ views, 50+ entries vs last year's 20
- **Maps to:** Event submission, organiser portal, token-based edit flow, event boost

### 3.5 Persona: **Zanele** -- The Admin / Platform Operator
- **Role:** CrankMart operations
- **Age:** 32
- **Goals:** Moderate content, verify businesses, track payments, spot abuse
- **Pain points:** Fraudulent listings, unverified businesses, payment disputes
- **Needs:** Admin dashboard, moderation queues, KYC workflow, payment reconciliation, analytics, SEO audits, email template management
- **Success:** <4h listing moderation SLA, <48h business verification, 0 unresolved PayFast disputes
- **Maps to:** All /admin/* pages (17 pages), verification pipeline, boost admin, email templates, settings

### 3.6 Persona Priority Matrix
| Persona | Phase 1 Priority | Rationale |
|---------|------------------|-----------|
| Sibu (Seller) | P0 | Listings are core inventory |
| Thandi (Buyer) | P0 | Buyers drive seller activity |
| Marco (Shop Owner) | P1 | Directory drives SEO + revenue |
| Kagiso (Organiser) | P1 | Events drive recurring traffic |
| Zanele (Admin) | P0 | Platform can't operate without moderation |

---

## 4. Market Analysis & Competitive Positioning

### 4.1 South African Market
| Competitor | Strengths | Weaknesses | CrankMart Counter |
|------------|-----------|------------|-------------------|
| BikeHub.co.za | Established brand, classifieds traffic | Dated UX, classifieds only, no mobile-first | Modern UX, all-in-one, mobile-first |
| Gumtree SA | Scale | No cycling focus, low trust, paid listings | Cycling-specific filters, free listings, trust system |
| Facebook Groups | Community | No search, no structure, scam risk | Structured, searchable, moderated |
| Strava | Routes + fitness | No marketplace, no directory | Marketplace + local community |

### 4.2 International Positioning
Once expanded to AU/NZ/UK, CrankMart competes with:
- BikeExchange (AU), BuyCycle (EU), PinkBike Buy/Sell (MTB), eBay Motors
- **Differentiator:** All-in-one community + marketplace, not just listings

### 4.3 Defensible Moats
1. **SEO moat:** 500+ route pages + 400+ business pages + events = massive long-tail content
2. **Network effects:** More listings -> more buyers -> more sellers (flywheel)
3. **Trust layer:** POPIA/GDPR compliant, verified businesses, moderated content, KYC
4. **International framework:** Launch new country in 4-6 weeks via config, not rebuild
5. **Data moat:** Bike specs, prices, routes, events -- proprietary dataset over time

---

## 5. Success Metrics & KPIs

### 5.1 North Star Metric
**Monthly Active Contributors (MAC)** -- users who list, message, review, or save in a given month. Target Phase 1 (SA): 2,000 MAC by month 6.

### 5.2 Launch Metrics (First 30 days, SA)
| Metric | Target | Measurement |
|--------|--------|-------------|
| crankmart.com live | Day 1 | Uptime monitor |
| cyclemart.co.za 301 -> crankmart.com/za | Day 1 | curl check |
| Lighthouse Performance | >= 90 | Vercel Speed Insights |
| Zero P0 bugs in production | 100% | Sentry tracking |
| All existing users migrated | 100% | DB row count match |

### 5.3 Phase 1 Growth Metrics (Months 1-6, SA)
| Metric | Month 1 | Month 3 | Month 6 |
|--------|---------|---------|---------|
| Registered users | 500 | 2,000 | 5,000 |
| Active listings | 300 | 1,000 | 2,000 |
| Directory businesses | 100 | 200 | 400 |
| Verified businesses | 20 | 80 | 200 |
| Monthly page views | 5K | 15K | 30K |
| Monthly organic visitors | 2K | 6K | 10K |
| Boost revenue/mo (R) | 2,000 | 10,000 | 25,000 |
| Email list | 200 | 600 | 1,000 |

### 5.4 International Expansion Metrics (per new country, 6-month)
| Metric | Target |
|--------|--------|
| Registered users | 2,000 |
| Active listings | 500 |
| Directory businesses | 50 |
| Routes seeded at launch | 200+ |
| Events seeded at launch | 30+ |
| Boost revenue/mo (local currency) | $1,000 equiv |

### 5.5 Non-Functional KPIs
| KPI | Target | Measurement |
|-----|--------|-------------|
| Uptime | 99.9% | Vercel + UptimeRobot |
| API p95 latency | < 500ms | Vercel analytics |
| LCP | < 2.5s | Speed Insights |
| CLS | < 0.1 | Speed Insights |
| Lighthouse Accessibility | >= 95 | CI check |
| Error rate | < 0.5% | Sentry |
| Mean time to recovery (MTTR) | < 30 min | Incident log |

### 5.6 Business KPIs
| KPI | Phase 1 Target | How Measured |
|-----|----------------|--------------|
| GMV (marketplace turnover) | R15M/yr | Sum of sold listing prices |
| Take rate | 0% (boosts only) | N/A in Phase 1 |
| Boost conversion | 5% of active listings | Boosts / active listings |
| Business tier upgrade | 15% of verified | Paid / verified |
| Organic traffic share | 60%+ | Google Analytics |
| Net Promoter Score | 40+ | Post-transaction survey |

---

## End of Part 1

---

# Part 2A: Feature Inventory

Carried forward from CycleMart v0.2.1 and enhanced. Each feature has a status, owner persona, phase priority, and cross-reference to existing code.

## 6. Feature Inventory

### 6.1 Authentication & User Management
| ID | Feature | Status | Persona | Priority | Code Reference |
|----|---------|--------|---------|----------|----------------|
| F-AUTH-01 | Email/password login | Exists | All | P0 | src/auth.ts:18-46 |
| F-AUTH-02 | Google OAuth login | Exists | All | P0 | src/auth.ts:14-17 |
| F-AUTH-03 | Email verification | Schema exists, not wired | All | P1 | users.emailVerified |
| F-AUTH-04 | Password reset (email token) | Exists | All | P0 | app/api/auth/forgot-password |
| F-AUTH-05 | Session management (JWT) | Exists | All | P0 | src/auth.ts:53 |
| F-AUTH-06 | Role-based access (7 roles) | Exists | Admin | P0 | userRoleEnum |
| F-AUTH-07 | KYC workflow | Schema exists, UI pending | Seller/Shop | P2 | users.kycStatus |
| F-AUTH-08 | Profile editing (name, province, password) | Exists | All | P0 | /api/account/update |
| F-AUTH-09 | Avatar upload | Exists | All | P1 | /api/account/avatar |
| F-AUTH-10 | Account deletion (POPIA/GDPR) | **New** | All | P1 | Schema + DELETE /api/account |

### 6.2 Classifieds Marketplace
| ID | Feature | Status | Persona | Priority | Code Reference |
|----|---------|--------|---------|----------|----------------|
| F-LIST-01 | Browse listings (filters, pagination) | Exists | Buyer | P0 | app/browse/page.tsx |
| F-LIST-02 | Listing detail page | Exists | Buyer | P0 | app/browse/[slug]/ListingDetail.tsx |
| F-LIST-03 | 4-step sell wizard | Exists | Seller | P0 | app/sell/step-1..4 |
| F-LIST-04 | Draft autosave (server + localStorage) | Exists | Seller | P0 | /api/sell/draft |
| F-LIST-05 | Multi-image upload (up to 15, 10MB each) | Exists | Seller | P0 | /api/sell/upload |
| F-LIST-06 | Bike-spec fields (brand, model, year, frame, wheels, drivetrain) | Exists | Seller | P0 | listings table |
| F-LIST-07 | Condition grading (new/like_new/used/poor) | Exists | Seller | P0 | conditionEnum |
| F-LIST-08 | Price + negotiable flag | Exists | Seller | P0 | listings.price/negotiable |
| F-LIST-09 | Shipping availability | Exists | Seller | P1 | listings.shippingAvailable |
| F-LIST-10 | Duplicate detection on publish | Exists | Seller | P0 | publish route |
| F-LIST-11 | Edit own listing | Exists | Seller | P0 | /api/listings/by-id/[id]/edit |
| F-LIST-12 | Mark as sold | Exists | Seller | P0 | /api/listings/[id]/mark-sold |
| F-LIST-13 | Save/favourite listings | Exists | Buyer | P0 | /api/listings/save |
| F-LIST-14 | Listing renewal (30-day expiry) | Exists | Seller | P1 | /api/listings/[slug]/renew |
| F-LIST-15 | Full-text search (tsvector) | Schema exists, needs wiring | Buyer | P1 | listings.searchVector |
| F-LIST-16 | Filter by category, condition, price, province | Exists | Buyer | P0 | Browse query params |
| F-LIST-17 | Listing moderation (pending -> approved) | Exists | Admin | P0 | moderationStatusEnum |
| F-LIST-18 | Saved-listing alerts (cron email) | Exists | Buyer | P2 | /api/cron/saved-listing-alerts |
| F-LIST-19 | Similar/related listings | Stubbed | Buyer | P2 | Sprint 2 |
| F-LIST-20 | Report listing | **New** | Buyer/Admin | P1 | Schema + UI |

### 6.3 Business Directory
| ID | Feature | Status | Persona | Priority | Code Reference |
|----|---------|--------|---------|----------|----------------|
| F-DIR-01 | Browse directory (filter by type/province/city) | Exists | All | P0 | /api/directory |
| F-DIR-02 | Business detail page | Exists | Buyer | P0 | BusinessDetail.tsx |
| F-DIR-03 | Map view (Leaflet) | Exists | Buyer | P1 | app/directory/MapComponent |
| F-DIR-04 | Proximity search (lat/lng/radius) | Exists | Buyer | P1 | /api/directory?lat&lng&nearbyKm |
| F-DIR-05 | Self-serve business registration | Exists | Shop Owner | P0 | /api/directory/register |
| F-DIR-06 | Concierge registration (admin-assisted) | Exists | Shop Owner | P0 | mode=concierge |
| F-DIR-07 | Business claim via JWT token link | Exists | Shop Owner | P0 | /api/directory/claim |
| F-DIR-08 | 3-touch outreach email sequence | Exists | Admin -> Shop | P0 | email-templates touch1/2/3 |
| F-DIR-09 | Verification pipeline (pending/verified/suspended) | Exists | Admin | P0 | businessStatusEnum |
| F-DIR-10 | Business hours (JSON) | Schema exists | Shop Owner | P1 | businesses.hours |
| F-DIR-11 | Brands stocked + services arrays | Exists | Shop Owner | P0 | text[] columns |
| F-DIR-12 | WhatsApp contact button | Exists | Buyer | P0 | BusinessDetail |
| F-DIR-13 | Reviews/ratings | **New** | All | P2 | New schema |
| F-DIR-14 | Admin verification dashboard | Exists | Admin | P0 | /admin/verifications |
| F-DIR-15 | Boost tiers (Free/Starter/Pro/Anchor) | Exists | Shop Owner | P0 | businesses.tier/boostTier |

### 6.4 Cycling Routes
| ID | Feature | Status | Persona | Priority | Code Reference |
|----|---------|--------|---------|----------|----------------|
| F-RT-01 | Browse routes (filter by discipline, difficulty, distance, province) | Exists | All | P0 | /api/routes |
| F-RT-02 | Route detail with gallery, loops, reviews | Exists | All | P0 | app/routes/[slug] |
| F-RT-03 | Route map + GPX download | Partial | Buyer | P1 | routes.gpxUrl |
| F-RT-04 | Route loops with colour-coded difficulty | Exists | All | P1 | route_loops table |
| F-RT-05 | Reviews + conditions notes | Exists | All | P1 | route_reviews |
| F-RT-06 | Save route | Exists | All | P1 | /api/routes/[slug]/save |
| F-RT-07 | Proximity search | Exists | All | P1 | ?lat&lng&nearbyKm |
| F-RT-08 | Admin route management (create/edit/images) | Exists | Admin | P0 | /admin/routes/* |
| F-RT-09 | Scrape integrations (Trailforks, Komoot, MTB Trails SA) | Exists | Admin | P1 | src/db/scrapers/ |
| F-RT-10 | "My Routes" tab (user's submissions) | **New** | All | P2 | Needs submitted_by index |

### 6.5 Events
| ID | Feature | Status | Persona | Priority | Code Reference |
|----|---------|--------|---------|----------|----------------|
| F-EV-01 | Calendar + list + map views | Exists | All | P0 | EventsCalendar, EventsMap |
| F-EV-02 | 8 event types (race/sportive/fun_ride/etc.) | Exists | All | P0 | eventTypeEnum |
| F-EV-03 | Event detail page | Exists | All | P0 | app/events/[slug] |
| F-EV-04 | Event submission form | Exists | Organiser | P0 | /api/events/submit |
| F-EV-05 | Organiser portal via token edit link | Exists | Organiser | P0 | /api/events/manage/[token] |
| F-EV-06 | Moderation workflow | Exists | Admin | P0 | eventStatusEnum |
| F-EV-07 | Entry fee + registration URL | Exists | Organiser | P0 | entry_url, entry_fee |
| F-EV-08 | Event boost (Featured/Headline tiers) | Exists | Organiser | P1 | boostTier on events |
| F-EV-09 | Filter by month/province/type | Exists | All | P0 | Query params |
| F-EV-10 | Organiser outreach emails | Exists | Admin | P1 | email templates |

### 6.6 Messaging
| ID | Feature | Status | Persona | Priority | Code Reference |
|----|---------|--------|---------|----------|----------------|
| F-MSG-01 | Buyer-seller direct messaging | Exists | Buyer/Seller | P0 | /api/messages/* |
| F-MSG-02 | Conversation threads | Exists | All | P0 | /api/messages |
| F-MSG-03 | Unread count badge | Exists | All | P0 | /api/messages/unread-count |
| F-MSG-04 | Start conversation from listing | Exists | Buyer | P0 | /api/messages/start |
| F-MSG-05 | Email notifications on new message | Exists | All | P1 | email-templates |
| F-MSG-06 | Rate limiting / spam protection | **New** | Admin | P1 | Middleware |
| F-MSG-07 | Report conversation | **New** | All | P2 | New schema |

### 6.7 Monetisation (Boosts & Payments)
| ID | Feature | Status | Persona | Priority | Code Reference |
|----|---------|--------|---------|----------|----------------|
| F-PAY-01 | Boost package catalogue | Exists | Seller/Shop | P0 | /api/boosts/packages |
| F-PAY-02 | 4 boost types (bump, category_top, homepage, directory) | Exists | All | P0 | boostTypeEnum |
| F-PAY-03 | PayFast checkout + signature + IPN | Exists | Seller | P0 | src/lib/payfast.ts |
| F-PAY-04 | Boost expiry cron | Exists | System | P0 | /api/cron/expire-boosts |
| F-PAY-05 | Business tier pricing (R0/R149/R399/R999) | Exists | Shop Owner | P0 | /pricing page |
| F-PAY-06 | Event boost pricing (R0/R299/R799) | Exists | Organiser | P0 | /pricing page |
| F-PAY-07 | Admin payment reconciliation | Exists | Admin | P0 | /admin/payfast |
| F-PAY-08 | Refund workflow | Manual | Admin | P2 | DB update |
| F-PAY-09 | Stripe integration (international) | **New** | Future | P2 (Phase 2+) | lib/payments/stripe.ts |
| F-PAY-10 | Country-aware gateway selection | **New** | System | P1 | payment interface |

### 6.8 News & Editorial
| ID | Feature | Status | Persona | Priority | Code Reference |
|----|---------|--------|---------|----------|----------------|
| F-NEWS-01 | Browse articles | Exists | All | P1 | app/news |
| F-NEWS-02 | Article detail page | Exists | All | P1 | app/news/[slug] |
| F-NEWS-03 | Submit article | Exists | All | P2 | /api/news/submit |
| F-NEWS-04 | Admin news management | Exists | Admin | P1 | /admin/news |
| F-NEWS-05 | Author byline / "My Articles" | **New** | All | P2 | Needs author_id |

### 6.9 Admin Platform
| ID | Feature | Status | Persona | Priority | Code Reference |
|----|---------|--------|---------|----------|----------------|
| F-ADM-01 | Dashboard (stats overview) | Exists | Admin | P0 | /admin |
| F-ADM-02 | User management + role assignment | Exists | Admin | P0 | /admin/users |
| F-ADM-03 | Listing moderation | Exists | Admin | P0 | /admin/listings |
| F-ADM-04 | Event moderation | Exists | Admin | P0 | /admin/events |
| F-ADM-05 | Directory moderation | Exists | Admin | P0 | /admin/directory |
| F-ADM-06 | Route management | Exists | Admin | P0 | /admin/routes |
| F-ADM-07 | Boost package CRUD | Exists | Admin | P0 | /admin/boosts |
| F-ADM-08 | PayFast payment monitoring | Exists | Admin | P0 | /admin/payfast |
| F-ADM-09 | Verification queue | Exists | Admin | P0 | /admin/verifications |
| F-ADM-10 | Email template preview | Exists | Admin | P1 | /admin/email-templates |
| F-ADM-11 | Theme customisation | Exists | Admin | P2 | /admin/theme |
| F-ADM-12 | SEO audit tools | Exists | Admin | P1 | /admin/seo-audit |
| F-ADM-13 | Analytics dashboard | Exists | Admin | P0 | /admin/analytics |
| F-ADM-14 | Site settings (SMTP, general) | Exists | Admin | P0 | /admin/settings |
| F-ADM-15 | **Admin Whiteboard (new)** | **New** | Admin | P1 | /admin/whiteboard |
| F-ADM-16 | Reports management | Exists | Admin | P2 | /admin/reports |

### 6.10 International Framework (New)
| ID | Feature | Status | Priority | Spec |
|----|---------|--------|----------|------|
| F-INTL-01 | Country config system | **New** | P0 | src/config/countries/[code].ts |
| F-INTL-02 | Dynamic /[country]/ routing | **New** | P0 | app/[country]/ segment |
| F-INTL-03 | Currency abstraction | **New** | P0 | formatPrice(cents, countryCode) |
| F-INTL-04 | Region/province abstraction | **New** | P0 | Country-specific regions |
| F-INTL-05 | Phone format abstraction | **New** | P1 | Country phoneFormat |
| F-INTL-06 | Payment gateway interface | **New** | P0 | lib/payments/interface.ts |
| F-INTL-07 | Timezone abstraction | **New** | P1 | Country timezone |
| F-INTL-08 | country_code column on content tables | **New** | P0 | Drizzle migration 0008 |
| F-INTL-09 | IP-based country auto-detect (root) | **New** | P1 | middleware.ts |
| F-INTL-10 | Country-aware sitemap | **New** | P1 | app/[country]/sitemap.ts |

### 6.11 Rebrand (New)
| ID | Feature | Status | Priority | Detail |
|----|---------|--------|----------|--------|
| F-RB-01 | All cyclemart references -> crankmart | **New** | P0 | 304+ locations (see REBRAND_INVENTORY.md) |
| F-RB-02 | New logo + favicon set | **New** | P0 | 7 icon sizes |
| F-RB-03 | New email templates (11) | **New** | P0 | crankmart branding |
| F-RB-04 | New social handles | **New** | P1 | Secure @crankmart everywhere |
| F-RB-05 | cyclemart.co.za 301 -> crankmart.com/za | **New** | P0 | Vercel redirect |
| F-RB-06 | crankmart.co.za 301 -> crankmart.com/za | **New** | P0 | Vercel redirect |

### 6.12 Out of Scope (Phase 1)
- Native mobile app (React Native / Expo) -- PWA only
- Multi-language translation -- English only
- AI pricing recommendations
- Integrated shipping/logistics
- Real-time chat (WebSockets)
- Push notifications
- Bike valuation tool
- Insurance partnerships
- Affiliate programme
- Video content / live streaming

---

# Part 2B: User Stories & Acceptance Criteria

Critical P0 user stories with acceptance criteria (Gherkin-lite format). Full backlog lives in the admin whiteboard post-launch.

## 7. User Stories (P0)

### 7.1 Authentication

**US-AUTH-01: Register with email**
> As a new visitor, I want to register with email+password so that I can list or save items.

**Acceptance criteria:**
- GIVEN I'm on /register, WHEN I enter name, valid email, password (>=8 chars), province, AND click Register, THEN a user is created and I'm redirected to /account.
- AND I receive a welcome email within 60 seconds.
- GIVEN email already exists, WHEN I submit, THEN I see "Email already registered" and stay on page.
- GIVEN password < 8 chars, WHEN I submit, THEN I see inline validation error.

**US-AUTH-02: Login with Google**
> As a returning user, I want to login with Google so I don't need to remember a password.

**Acceptance:**
- GIVEN valid Google account, WHEN I click "Continue with Google", THEN I'm redirected to Google, then back to /account with active session.
- GIVEN first-time Google user, THEN a user record is created with role='buyer' and emailVerified=true.
- Session persists across tabs and survives page refresh.

**US-AUTH-03: Reset password**
> As a user who forgot my password, I want to reset it via email.

**Acceptance:**
- GIVEN I enter email on /forgot-password, THEN I receive a reset link within 60s.
- Link expires after 1 hour.
- GIVEN expired token, WHEN I use it, THEN I see "Link expired, request a new one".
- New password must be >= 8 chars.
- After reset, all existing sessions for that user are invalidated.

### 7.2 Selling

**US-SELL-01: Create a listing (happy path)**
> As a seller, I want to list my bike in under 5 minutes.

**Acceptance:**
- I can complete steps 1-4 without losing data if I navigate away (draft persists via localStorage + server).
- Step 1: category selected, saved to localStorage `crankmart-sell-category`.
- Step 2: title, condition required; all bike-spec fields optional; autosave every 1.5s.
- Step 3: 1-15 images, each <= 10MB, jpeg/png/webp/heic.
- Step 4: price (required), province (required), city (required); optional postal code, shipping.
- On Publish: listing created with status='active', moderationStatus='pending', 30-day expiry.
- I receive confirmation email with listing URL.

**US-SELL-02: Duplicate detection**
> As a seller, I don't want to accidentally create duplicate listings.

**Acceptance:**
- GIVEN I have an existing active listing with title similar (25-char match, case-insensitive), WHEN I publish a new one, THEN the API returns 409 with existing slug/title.
- I see a modal: "You have a similar listing. View existing, or confirm publish new?"
- Choosing "Publish anyway" sends `forceDuplicate: true` and publishes.

**US-SELL-03: Mark as sold**
> As a seller, I want to mark my listing as sold.

**Acceptance:**
- "Mark Sold" button visible only to seller on listing detail.
- On click, listing status changes to 'sold', soldAt timestamp set, removed from browse results.
- Buyer messages in existing conversations still accessible.

### 7.3 Buying

**US-BUY-01: Browse and filter**
> As a buyer, I want to find a hardtail MTB under R15,000 near me.

**Acceptance:**
- /browse loads with default filters.
- Apply filters: category=mtb, maxPrice=15000, province=gauteng.
- URL updates with query params (shareable).
- Listings render as single-column mobile, grid on desktop >= 900px.
- Infinite scroll loads next 24 per request.
- Empty state: "No listings match. Adjust filters or save this search."

**US-BUY-02: Contact seller**
> As a buyer, I want to message the seller without revealing my phone number.

**Acceptance:**
- "Contact Seller" button on listing detail requires login (redirects to /login with callback).
- Opens message composer, 1-2000 chars, attaches listingId.
- On send, a new conversation is created (or reuses existing) and seller receives email notification.
- Messages render in conversation thread with sender name, body, timestamp.

**US-BUY-03: Save a listing**
> As a buyer, I want to save listings to revisit later.

**Acceptance:**
- Save icon on listing card / detail page.
- Requires login (redirect if not).
- Toggle behaviour: POST /api/listings/save with listingId flips save state.
- Saved listings appear in /account under Saved tab with saved-at timestamp.
- Unsave removes from list immediately (optimistic UI).

### 7.4 Directory / Business

**US-SHOP-01: Claim my business**
> As a shop owner, I want to claim my existing directory listing via the token in my email.

**Acceptance:**
- Email link: crankmart.com/za/directory/claim?token=...
- Server validates token: exists, not expired (30-day TTL).
- If invalid/expired: show error + "Request new link" button.
- If valid: render prefilled form (business name read-only; phone/email/website/hours/description editable).
- POPIA consent checkbox required.
- On submit: phone or email required; business status='claimed', verified=true, consentAt=now, claimToken cleared.
- User account created (if new email) with role='shop_owner' and random password.
- Verification email sent.
- Redirect to /directory/[slug]?claimed=1 with success toast.

**US-SHOP-02: Edit my shop**
> As a shop owner, I want to update my business details.

**Acceptance:**
- /account/my-shop accessible only to role=shop_owner with a claimed business.
- Editable fields: name, description, phone, email, website, address, suburb, city, province, brands stocked (array), services (array), hours (JSON).
- Saves via PATCH /api/account/my-shop.
- Logo/cover upload via separate endpoints.
- Updates reflect on /directory/[slug] within 60s.

### 7.5 Events

**US-EVT-01: Submit an event**
> As an organiser, I want to list my event on the calendar.

**Acceptance:**
- /events/submit requires login.
- Fields: title (req), city (req), organiser email (req), start date (req), + optional description/venue/end date/entry URL/fee/distance/type/discipline/cover image.
- On submit: event created with status='pending_review'.
- Organiser receives confirmation + edit token link.
- Admin notified.
- Visible in admin moderation queue.

**US-EVT-02: Edit my event via token link**
> As an organiser without an account, I want to edit my event.

**Acceptance:**
- Email contains link: crankmart.com/za/events/manage/[token]
- Token validated against events.editToken; no login required.
- Editable: all submission fields except slug.
- Changes trigger re-moderation if major fields changed (title/date/venue).

### 7.6 Payments (Boosts)

**US-PAY-01: Boost my listing**
> As a seller, I want to pay to feature my listing on the homepage for 7 days.

**Acceptance:**
- "Boost" button on my listing detail -> /boost/select?listingId=...
- Boost package catalogue filtered by type (bump/category_top/homepage).
- Select package, click "Pay with PayFast".
- Boost record created with status='pending', amount from package.
- Form auto-submits to PayFast with MD5 signature.
- On PayFast success: user redirected to /boost/success.
- IPN webhook validates signature + IP; sets boost.status='active', updates listing.isFeatured, featuredExpiresAt.
- If cancelled/failed: boost.status='failed', listing unchanged.
- User sees boost state on listing + /account.

**US-PAY-02: PayFast IPN idempotency**
> As the platform, I must handle duplicate IPN webhooks without double-activating boosts.

**Acceptance:**
- GIVEN a boost already has status='active' with matching pf_payment_id, WHEN an IPN arrives, THEN return 200 "OK" and make no changes.
- Log duplicate for audit.

### 7.7 Admin

**US-ADM-01: Moderate a listing**
> As admin Zanele, I want to approve or reject pending listings.

**Acceptance:**
- /admin/listings?moderation=pending lists all pending items.
- Click row -> sidebar with listing detail + images.
- Approve: moderationStatus='approved'; listing appears in /browse.
- Reject: moderationStatus='rejected'; optional reason field; seller emailed.
- Flag: moderationStatus='flagged' for follow-up.
- Action logged with admin userId + timestamp.

**US-ADM-02: Verify a business**
> As admin, I want to verify a claimed business.

**Acceptance:**
- /admin/verifications shows 4-column pipeline (Pending / Outreach Sent / Claimed / Suspended).
- Move business between columns via action buttons.
- On verify: businesses.verified=true, verifiedAt=now; owner emailed.
- On suspend: businesses.status='suspended'; listing removed from /directory; owner notified.

**US-ADM-03: Manage the whiteboard backlog**
> As admin, I want a to-do/whiteboard to track operational tasks.

**Acceptance:**
- /admin/whiteboard renders a list/table of tasks.
- Fields: title, description, status (To Do/In Progress/Done/Blocked), priority (Critical/High/Medium/Low), category (Dev/Design/Content/Marketing/Infra/Other), assignee, due date, created date.
- Filter by status, priority, category.
- Inline edit status and priority.
- Persisted in `admin_todos` table.
- Only accessible to admin + superadmin roles.

---

