-- Stolen-bike serial registry (G4).
-- Covers both CrankMart-native reports and a cache for third-party lookups
-- (Bike Index primarily). Listings get an optional serial_number column so
-- publish-time checks have something to match against.

ALTER TABLE listings ADD COLUMN IF NOT EXISTS serial_number varchar(64);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_listings_serial
  ON listings(serial_number)
  WHERE serial_number IS NOT NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS stolen_reports (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_number    varchar(64) NOT NULL,
  brand            varchar(100) NOT NULL,
  model            varchar(100),
  year             integer,
  colour           varchar(50),
  source           varchar(20) NOT NULL DEFAULT 'crankmart',
  external_id      varchar(64),
  status           varchar(20) NOT NULL DEFAULT 'pending',
  saps_case_no     varchar(50),
  stolen_date      date,
  stolen_location  varchar(200),
  reporter_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  reporter_email   varchar(255),
  proof_photo_url  text,
  notes            text,
  country          char(2) NOT NULL DEFAULT 'za',
  created_at       timestamp NOT NULL DEFAULT NOW(),
  updated_at       timestamp NOT NULL DEFAULT NOW(),
  reviewed_by      uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at      timestamp
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_stolen_reports_serial
  ON stolen_reports(serial_number)
  WHERE status IN ('pending', 'approved');
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_stolen_reports_status
  ON stolen_reports(status, created_at DESC);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS serial_lookup_cache (
  cache_key   varchar(96) PRIMARY KEY,
  result      jsonb NOT NULL,
  fetched_at  timestamp NOT NULL DEFAULT NOW(),
  ttl_seconds integer NOT NULL DEFAULT 86400
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_lookup_cache_fetched
  ON serial_lookup_cache(fetched_at);
