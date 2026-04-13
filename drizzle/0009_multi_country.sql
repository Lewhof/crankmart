-- Multi-country architecture retrofit
-- 2026-04-12: adds country scoping to geo-tables + regions lookup
-- All existing rows default to 'za'. Column is NOT NULL.

-- 1. country columns
ALTER TABLE "users"          ADD COLUMN "country" char(2) NOT NULL DEFAULT 'za';
ALTER TABLE "listings"       ADD COLUMN "country" char(2) NOT NULL DEFAULT 'za';
ALTER TABLE "routes"         ADD COLUMN "country" char(2) NOT NULL DEFAULT 'za';
ALTER TABLE "events"         ADD COLUMN "country" char(2) NOT NULL DEFAULT 'za';
ALTER TABLE "businesses"     ADD COLUMN "country" char(2) NOT NULL DEFAULT 'za';
ALTER TABLE "news_articles"  ADD COLUMN "country" char(2) NOT NULL DEFAULT 'za';

-- 2. composite indexes — country first, then primary filter column
CREATE INDEX IF NOT EXISTS "listings_country_status_idx"   ON "listings"("country","status");
CREATE INDEX IF NOT EXISTS "events_country_start_date_idx" ON "events"("country","start_date");
CREATE INDEX IF NOT EXISTS "routes_country_province_idx"   ON "routes"("country","province");
CREATE INDEX IF NOT EXISTS "businesses_country_status_idx" ON "businesses"("country","status");
CREATE INDEX IF NOT EXISTS "news_country_published_at_idx" ON "news_articles"("country","published_at");
CREATE INDEX IF NOT EXISTS "users_country_idx"             ON "users"("country");

-- 3. regions lookup
CREATE TABLE IF NOT EXISTS "regions" (
  "id"            serial PRIMARY KEY,
  "country"       char(2) NOT NULL,
  "code"          varchar(16) NOT NULL,
  "name"          varchar(100) NOT NULL,
  "type"          varchar(32) NOT NULL,
  "display_order" integer DEFAULT 0,
  "created_at"    timestamp DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "regions_country_code_uniq" ON "regions"("country","code");
CREATE INDEX        IF NOT EXISTS "regions_country_idx"       ON "regions"("country");
