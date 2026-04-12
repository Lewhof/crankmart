# CrankMart Version Reference

## Current Version: v0.2.1
**Date:** 2026-04-03
**Status:** Pre-launch — locked
**package.json version:** 0.2.1
**Target launch:** 14 April 2026

---

## What's in v0.2.1

### Session — 2026-04-03 (Lew × Elon)
- ✅ DB migration 0006: new business + event status enums, 12 new columns
- ✅ Shop claim portal (`/directory/claim`)
- ✅ Owner dashboard (`/account/my-listing`)
- ✅ Event organiser portal (`/events/manage/[token]`)
- ✅ Pricing page (`/pricing`)
- ✅ Admin verifications dashboard (`/admin/verifications`)
- ✅ Admin email templates preview (`/admin/email-templates`)
- ✅ 11 email templates (client-safe, split from email.ts)
- ✅ PayFast admin page (`/admin/payfast`) — merchant verify, sandbox toggle
- ✅ Boost select bug fixes — RNaN prices, null listingId
- ✅ Boost card layout fix — badge + price no longer overlap
- ✅ Unified account dashboard (`/account`) — My Listings, My Shop, My Events, Saved, Messages, Profile
- ✅ DB migration 0007: event_id, route_id, news_id on boosts + new boost types
- ✅ Boost packages for Events, Routes, News
- ✅ Admin boosts page — Transactions + Packages tabs, full CRUD for packages
- ✅ Profile photo upload — avatar on account hero, profile tab, seller box on listings
- ✅ Email templates — site logo replaces emoji header across all 11 templates
- ✅ Admin nav — PayFast, Verifications, Email Templates, Boost packages

### Session — 2026-04-02 (prior)
- ✅ Admin layout with sidebar nav
- ✅ Admin analytics, users, listings, events, boosts pages
- ✅ Coming soon page with countdown
- ✅ How-to guide page

---

## Infrastructure
- **Server:** velo-server, systemd `crankmart.service`, port 3099
- **DB:** Neon PostgreSQL (pooler endpoint)
- **Next.js:** 16.2.1 (Turbopack)
- **Drizzle ORM** + **NextAuth** credentials
- **PayFast:** merchant 24040660 (LIVE — toggle sandbox in `/admin/payfast`)
- **Storage:** `/home/velo/storage/crankmart/uploads/{listings,avatars,events,directory}/`
- **Nginx:** `crankmart.com` + `crankmart.fibreflow.app` → proxy :3099

---

## Known Issues
- ❌ PayFast sandbox not yet tested end-to-end (ITN needs public URL — works on crankmart.com)
- ❌ Full-text listing search (basic ILIKE only)
- ❌ Email SMTP not yet configured (templates ready, sender wired)
- ❌ Routes table has no `submitted_by` user link — My Routes tab not yet built
- ❌ News has no author link in schema — My Articles tab not yet built

---

## Version History
| Version | Date | Notes |
|---|---|---|
| 0.2.1 | 2026-04-03 | Email logo, avatar upload, account dashboard, boost targets, PayFast admin |
| 0.2.0 | 2026-04-03 | Trust & verification system, claim portal, pricing, admin suite |
| 0.1.0 | 2026-03-28 | Initial marketplace — listings, browse, boosts, directory, events, routes, news |
