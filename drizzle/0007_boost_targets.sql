-- Migration: Extended Boost Targets
-- Adds event_id, route_id, news_id to boosts + new boost_type values + new packages

-- ─── 1. New boost_type enum values ──────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'event_feature' AND enumtypid = 'boost_type'::regtype) THEN
    ALTER TYPE boost_type ADD VALUE 'event_feature';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'route_feature' AND enumtypid = 'boost_type'::regtype) THEN
    ALTER TYPE boost_type ADD VALUE 'route_feature';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'news_feature' AND enumtypid = 'boost_type'::regtype) THEN
    ALTER TYPE boost_type ADD VALUE 'news_feature';
  END IF;
END $$;

-- ─── 2. Add new target columns to boosts ────────────────────────────────────
ALTER TABLE boosts
  ADD COLUMN IF NOT EXISTS event_id   uuid DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS route_id   uuid DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS news_id    uuid DEFAULT NULL;

-- ─── 3. Indexes ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_boosts_event_id ON boosts(event_id) WHERE event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_boosts_route_id ON boosts(route_id) WHERE route_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_boosts_news_id  ON boosts(news_id)  WHERE news_id  IS NOT NULL;

-- ─── 4. Seed new packages (idempotent) ──────────────────────────────────────
INSERT INTO boost_packages (type, name, description, duration_days, price_cents, is_active, display_order)
SELECT 'event_feature', 'Event Featured – 7 days', 'Pin your event at the top of the events calendar', 7, 4900, true, 5
WHERE NOT EXISTS (SELECT 1 FROM boost_packages WHERE type = 'event_feature' AND name = 'Event Featured – 7 days');

INSERT INTO boost_packages (type, name, description, duration_days, price_cents, is_active, display_order)
SELECT 'event_feature', 'Event Homepage Spotlight', 'Feature your event on the CycleMart homepage for 7 days', 7, 7900, true, 6
WHERE NOT EXISTS (SELECT 1 FROM boost_packages WHERE type = 'event_feature' AND name = 'Event Homepage Spotlight');

INSERT INTO boost_packages (type, name, description, duration_days, price_cents, is_active, display_order)
SELECT 'route_feature', 'Route Featured – 14 days', 'Pin your route at the top of route search results', 14, 3900, true, 7
WHERE NOT EXISTS (SELECT 1 FROM boost_packages WHERE type = 'route_feature' AND name = 'Route Featured – 14 days');

INSERT INTO boost_packages (type, name, description, duration_days, price_cents, is_active, display_order)
SELECT 'news_feature', 'News Homepage Feature – 7 days', 'Feature your article on the homepage news block', 7, 2900, true, 8
WHERE NOT EXISTS (SELECT 1 FROM boost_packages WHERE type = 'news_feature' AND name = 'News Homepage Feature – 7 days');
