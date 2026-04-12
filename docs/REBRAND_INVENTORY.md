# CrankMart Rebrand & Internationalisation Inventory

**Version:** 2.0 | **Date:** 2026-04-11 | **Total Locations:** 950+

---

## Summary

| Category | Locations | Action |
|----------|-----------|--------|
| Rebrand (cyclemart -> crankmart) | 304+ | Find & replace |
| Internationalise (SA -> configurable) | 650+ | Abstract to country config |
| Both | 50+ | Rebrand + abstract |

---

## 1. REBRAND: Domain & URL References (50+ locations)

| File | Line(s) | Context |
|------|---------|---------|
| next.config.ts | 39, 50 | Image hostname whitelist |
| app/layout.tsx | 32-149 | Schema.org metadata, OG images (32 refs) |
| app/sitemap.ts | 5 | BASE URL |
| app/robots.ts | 28-30 | Sitemap URLs |
| public/robots.txt | 49-51 | Sitemap URLs |
| public/llms.txt | 9, 26-35 | Domain + social handles (8 refs) |
| app/faq/page.tsx | 10-158 | FAQ content with URLs (21 refs) |
| app/terms/page.tsx | 22 | legal@cyclemart.co.za |
| app/privacy/page.tsx | 20 | privacy@cyclemart.co.za |
| app/news/[slug]/page.tsx | 9, 20, 33 | NEXT_PUBLIC_APP_URL fallback |
| app/directory/[slug]/page.tsx | 14, 26, 37 | Schema.org URLs |
| app/directory/category/[type]/page.tsx | 51-125 | Breadcrumb URLs |
| app/events/[slug]/page.tsx | 14, 25, 36 | Schema.org URLs |
| app/routes/[slug]/page.tsx | 24 | localhost:3099 fallback |

## 2. REBRAND: Package & Config (4 locations)

| File | Line(s) | Context |
|------|---------|---------|
| package.json | 2 | name: "cyclemart" |
| package-lock.json | 2, 8 | name: "cyclemart" |

## 3. REBRAND: localStorage Keys (19 locations)

| File | Line(s) | Keys |
|------|---------|------|
| app/sell/step-1/page.tsx | 49 | cyclemart-sell-category |
| app/sell/step-2/page.tsx | 92, 153, 192, 193 | cyclemart-sell-draft, cyclemart-sell-category |
| app/sell/step-3/page.tsx | 21, 22, 27, 38 | cyclemart-sell-category, cyclemart-sell-photos |
| app/sell/step-4/page.tsx | 66-164 | All 3 keys (10 refs) |

## 4. REBRAND: Email References (20+ locations)

| File | Line(s) | Context |
|------|---------|---------|
| src/lib/email.ts | 27, 47 | info@cyclemart.co.za sender |
| src/lib/email-templates.ts | 4, 53-429 | 12 templates with brand + logo URL |
| src/db/migrate-settings.ts | 24 | noreply@cyclemart.co.za |
| src/db/seed.ts | 40-44 | 5 test user emails @cyclemart.co.za |
| app/api/auth/forgot-password/route.ts | 45-100 | Reset email sender (5 refs) |
| app/api/admin/verifications/[id]/route.ts | 76 | directory@cyclemart.co.za |
| seed-blog-posts.ts | 30 | editorial@cyclemart.co.za |
| seed-blog-final.ts | 27 | editorial@cyclemart.co.za |
| seed-blog-safe.ts | 24 | editorial@cyclemart.co.za |

## 5. REBRAND: Social Media (8 locations)

| File | Line(s) | Context |
|------|---------|---------|
| app/layout.tsx | 78-83 | Instagram, Facebook, TikTok, LinkedIn, YouTube, Twitter |
| public/llms.txt | 35 | @cyclemartsa handles |
| app/api/admin/seo-audit/route.ts | 408-410 | Social profile checks |

## 6. REBRAND: User-Facing Brand Text (40+ locations)

| File | Line(s) | Context |
|------|---------|---------|
| app/browse/[slug]/ListingDetail.tsx | 120, 705, 876 | Share text "on CycleMart" |
| app/api/blog/seed/route.ts | 31-352 | Blog content with brand (20+ refs) |
| Various page components | throughout | Brand name in headings, meta tags |

## 7. REBRAND: Image Assets (5 locations)

| File | Path |
|------|------|
| public/images/cyclemart-brand-banner.jpg | Brand banner |
| public/images/hero-brand-banner.jpg | Hero banner |
| app/favicon.ico | Favicon |
| app/apple-icon.png | Apple touch icon |
| app/icon-192.png, icon-512.png | PWA icons |

## 8. REBRAND: Scraper User-Agent (6 locations)

| File | Line(s) | Current |
|------|---------|---------|
| src/db/scrapers/sources/mtbtrailssa.ts | 23 | CycleMartBot/1.0 |
| src/db/scrapers/sources/trailforks.ts | 43 | CycleMartBot/1.0 |
| src/db/scrapers/sources/komoot.ts | 53 | CycleMartBot/1.0 |
| src/db/scrapers/scrape-images-v2.ts | 54 | CycleMartBot/1.0 |
| src/db/scrapers/scrape-venue-images.ts | 53 | CycleMartBot/1.0 |
| src/db/scrapers/scrape-business-logos.ts | 27 | CycleMartBot/1.0 |

## 9. REBRAND: Storage Paths (3 locations)

| File | Line(s) | Path |
|------|---------|------|
| app/api/directory/upload/route.ts | 7 | /home/velo/storage/cyclemart/uploads/directory |
| app/api/account/avatar/route.ts | 10 | /home/velo/storage/cyclemart/uploads/avatars |
| app/api/sell/upload/route.ts | 7 | /home/velo/storage/cyclemart/uploads/listings |

---

## 10. INTERNATIONALISE: Currency (45+ locations)

### R Symbol Display (18 locations)
| File | Line(s) | Pattern |
|------|---------|---------|
| app/_home/HomePageFull.tsx | 115 | R symbol with en-ZA locale |
| app/account/page.tsx | 66 | R symbol |
| app/admin/boosts/page.tsx | 52, 215 | fmtRand function |
| app/boost/select/page.tsx | 33-34 | formatPrice returning R |
| app/browse/[slug]/ListingDetail.tsx | 120, 597, 990, 1042, 1068 | toLocaleString('en-ZA') |
| app/browse/[slug]/page.tsx | 24, 26 | R symbol + en-ZA |
| app/browse/page.tsx | 603, 856 | "Price (ZAR)" label |
| app/search/page.tsx | 75 | R formatting |
| app/sell/step-4/page.tsx | 326, 364 | R display + "Price (ZAR)" |
| app/sell/edit/[id]/page.tsx | 473 | "Price (ZAR)" |
| app/seller/[id]/page.tsx | 48 | R formatting |
| app/api/cron/saved-listing-alerts/route.ts | 47 | R in email |

### Database Currency Columns
| File | Column |
|------|--------|
| src/db/schema.ts:249 | priceCents (integer) |
| src/db/schema.ts:264 | amountCents (integer) |

## 11. INTERNATIONALISE: Provinces (500+ locations)

All 9 SA provinces hardcoded across seed files, forms, and filters:
- Western Cape (80+), Gauteng (60+), KwaZulu-Natal (50+)
- Eastern Cape (30+), Free State (25+), Limpopo (20+)
- Mpumalanga (20+), Northern Cape (15+), North West (15+)

**Key files with province selectors/arrays:**
- app/sell/step-4/page.tsx (province dropdown)
- app/register/page.tsx (province dropdown)
- app/browse/page.tsx (filter)
- app/directory/page.tsx (filter)
- app/routes/page.tsx (filter)
- app/events/page.tsx (filter)
- 80+ seed files with province data

## 12. INTERNATIONALISE: Phone Format (100+ locations)

| Category | Count | Example |
|----------|-------|---------|
| +27 in seed data | 90+ | +27 21 555 0000 |
| Phone placeholder | 1 | app/events/submit |
| Phone regex | 1 | mtbtrailssa scraper |

## 13. INTERNATIONALISE: PayFast (14+ locations)

| File | Purpose |
|------|---------|
| src/lib/payfast.ts | Gateway URLs, signature, IP whitelist |
| app/api/payments/payfast/itn/route.ts | Webhook handler |
| app/api/boosts/initiate/route.ts | Payment initiation |
| app/boost/select/page.tsx | Checkout flow (7 refs) |
| app/admin/payfast/page.tsx | Admin config |
| src/db/schema.ts | payfastPaymentId columns |

## 14. INTERNATIONALISE: Timezone (2 locations)

| File | Line(s) | Value |
|------|---------|-------|
| app/admin/seo-audit/page.tsx | 101 | Africa/Johannesburg |
| IMPLEMENTATION_GUIDE.md | 183 | Africa/Johannesburg |

## 15. INTERNATIONALISE: SA-Specific Image Sources (12 locations)

| File | Hostname |
|------|----------|
| next.config.ts | mtbtrailssa.co.za, sabie.co.za, hollatrails.co.za, etc. |
| src/db/scrapers/ | mtbtrailssa.co.za scraper (10 refs) |
