-- Adds a `source` column to seeded content tables so orchestrated seed
-- runs can be audited, diffed, and rolled back by origin.

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS source VARCHAR(100);
ALTER TABLE routes     ADD COLUMN IF NOT EXISTS source VARCHAR(100);
ALTER TABLE events     ADD COLUMN IF NOT EXISTS source VARCHAR(100);

CREATE INDEX IF NOT EXISTS businesses_source_idx ON businesses(source);
CREATE INDEX IF NOT EXISTS routes_source_idx     ON routes(source);
CREATE INDEX IF NOT EXISTS events_source_idx     ON events(source);
