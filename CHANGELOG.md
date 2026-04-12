# CycleMart Changelog

## v0.2.1 — 2026-04-03

### Fix
- **Email templates** — replaced emoji text header (`🚲 CycleMart`) with real site logo (`apple-icon.png`) across all 11 templates
- Extracted shared `HEADER()` helper — single source of truth for logo block, no duplication
- Logo URL: `https://cyclemart.co.za/apple-icon.png` (48×48px, rounded)
- No API/DB contract changes — template functions unchanged, only HTML output updated

---

## v0.9.0-beta — 2026-04-03

### New Features
- **Trust & Verification System** — full shop + event verification lifecycle
- **DB Migration** (`0006_trust_verification.sql`) — new business statuses (pending/verified/suspended/claimed/removed), event statuses (draft/pending_review/verified/cancelled/completed), 12 new columns on businesses + events tables
- **Shop Claim Portal** (`/directory/claim?token=`) — JWT-based owner claim flow with pre-filled editable form
- **Owner Dashboard** (`/account/my-listing`) — manage listing, view stats, boost CTA
- **Event Organiser Portal** (`/events/manage/[token]`) — token-gated event edit + remove flow
- **Pricing Page** (`/pricing`) — public shop tiers (Free/Starter R149/Pro R399/Anchor R999) + event tiers (Free/Featured R299/Headline R799) with psychology copy
- **Admin Verifications Dashboard** (`/admin/verifications`) — 4-column claim pipeline (Pending/Outreach Sent/Claimed/Suspended) with actions
- **Admin Email Templates Page** (`/admin/email-templates`) — preview all 11 templates with sample data
- **8 new email templates** — shopClaimTouch1, shopClaimTouch2, shopClaimTouch3, shopVerifiedEmail, eventOrganizerTouch1, eventVerifiedEmail, boostRenewalEmail, adListingInviteEmail
- **Footer Pricing link** — added to Business column in footer
- **Admin nav** — added Verifications + Email Templates nav items

### Bug Fixes / Improvements
- Extracted pure email template functions into `email-templates.ts` (client-safe, no nodemailer)
- Fixed TS type error in `/api/account/my-listing` PATCH route
- Updated seed files + API routes to use new event/business status enum values
- Updated seo-audit counts to use new status values

### DB Changes
- `business_status` enum: disabled/active/paused/removed → **pending/verified/suspended/claimed/removed**
- `event_status` enum: upcoming/ongoing/completed/cancelled → **draft/pending_review/verified/cancelled/completed**
- New columns on `businesses`: boostTier, boostPosition, boostExpiresAt, autoVerified, outreachSentAt, outreachTouch2At, outreachTouch3At, claimToken, claimTokenExpiresAt, hours, contactSource, consentAt
- New columns on `events`: boostTier, boostExpiresAt, organiserUserId, editToken, outreachSentAt

---

## v0.8.0-beta — 2026-03-29

Initial beta with core marketplace, directory, events, routes, news, boosts, and PayFast integration.
