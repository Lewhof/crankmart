-- Marketing launch-readiness checklist
-- 2026-04-13: single table holds the 4-section checklist from CrankMart_Marketing_Strategy_ZA.md
-- Seed rows upserted by label so re-running is idempotent.

CREATE TABLE IF NOT EXISTS "marketing_checklist_items" (
  "id"            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "section"       varchar(32) NOT NULL,
  "section_label" varchar(120) NOT NULL,
  "label"         text NOT NULL UNIQUE,
  "description"   text,
  "sort_order"    integer NOT NULL DEFAULT 0,
  "is_complete"   boolean NOT NULL DEFAULT false,
  "completed_by"  uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "completed_at"  timestamptz,
  "notes"         text,
  "created_at"    timestamptz NOT NULL DEFAULT NOW(),
  "updated_at"    timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "marketing_checklist_section_idx"
  ON "marketing_checklist_items"("section", "sort_order");

-- Seed (idempotent): Platform prerequisites
INSERT INTO "marketing_checklist_items" (section, section_label, label, sort_order) VALUES
  ('platform','Platform prerequisites','Full rebrand executed per REBRAND_INVENTORY.md (950+ locations)',10),
  ('platform','Platform prerequisites','crankmart.com DNS live, SSL valid, /za vertical routing correctly',20),
  ('platform','Platform prerequisites','Country-tagging live on all listings/businesses/routes/events (country_code=ZA)',30),
  ('platform','Platform prerequisites','All transactional email senders migrated to @crankmart.com',40),
  ('platform','Platform prerequisites','Brand assets replaced: favicon, apple-icon, PWA icons, hero + brand banners',50),
  ('platform','Platform prerequisites','Social handles reserved across Instagram, Facebook, TikTok, LinkedIn, YouTube, X',60),
  ('platform','Platform prerequisites','llms.txt, robots.txt, sitemap all emit crankmart.com/za/... URLs',70),
  ('platform','Platform prerequisites','PayFast ZA production credentials configured, ITN webhook verified end-to-end',80),
  ('platform','Platform prerequisites','Schema.org metadata emits correct Organization URL and sameAs links',90),
  -- Phase 1
  ('phase_1','Phase 1: Founding Member drive','Claim This Business flow live on directory profiles (6-month Pro unlock)',10),
  ('phase_1','Phase 1: Founding Member drive','Claim Event flow live (3-month Featured unlock)',20),
  ('phase_1','Phase 1: Founding Member drive','Admin-side pre-load shop + event stubs at scale (seed scripts validated)',30),
  ('phase_1','Phase 1: Founding Member drive','Founding Member promo / auto-grant wired into subscription billing',40),
  ('phase_1','Phase 1: Founding Member drive','Outreach inbox (founders@crankmart.com) provisioned + reply monitoring',50),
  -- Phase 2
  ('phase_2','Phase 2: Niche Domination','Gravel + E-Bike taxonomy visible and filterable in Browse',10),
  ('phase_2','Phase 2: Niche Domination','Routes feature live with GPX upload/download',20),
  ('phase_2','Phase 2: Niche Domination','Meta Business Manager, Pixel installed on /za, conversion events defined',30),
  ('phase_2','Phase 2: Niche Domination','Retargeting audiences seeded from Phase 1 traffic',40),
  -- Phase 3
  ('phase_3','Phase 3: Mass Market + SEO','Blog/news live at /za/news with bylines, Article schema, OG images',10),
  ('phase_3','Phase 3: Mass Market + SEO','Sitemap includes articles, Search Console verified for crankmart.com + /za',20),
  ('phase_3','Phase 3: Mass Market + SEO','Google Ads account linked, conversion tracking verified',30),
  ('phase_3','Phase 3: Mass Market + SEO','300+ active classifieds threshold reached before Google Search ads activate',40)
ON CONFLICT (label) DO NOTHING;
