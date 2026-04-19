-- Page views table — traffic + visitor tracking for admin analytics.
-- Written by /api/analytics/track, read by /api/admin/analytics/stats.
--
-- This migration is idempotent and matches the table previously created
-- at runtime by the /api/analytics/migrate endpoint. Codified here so the
-- schema lives in version control and new environments get it at deploy.

CREATE TABLE IF NOT EXISTS page_views (
  id           SERIAL PRIMARY KEY,
  path         VARCHAR(500) NOT NULL,
  referrer     VARCHAR(500),
  country      VARCHAR(100),
  country_code VARCHAR(10),
  city         VARCHAR(100),
  region       VARCHAR(100),
  device       VARCHAR(20),
  browser      VARCHAR(50),
  visitor_id   VARCHAR(64),
  session_id   VARCHAR(64),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pv_path     ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_pv_created  ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_pv_visitor  ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_pv_session  ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_pv_country  ON page_views(country_code);
