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

**Next: Part 2 will cover Functional Requirements with User Stories, Feature Inventory with Cross-References, and Data Model.**

*Part 1 word count: ~2,800 words. Full PRD target: ~12,000 words across 4 parts.*
