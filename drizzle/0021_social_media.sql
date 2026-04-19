-- Social Media module: profiles, posts, assets, metrics, short-links.
-- Replaces hardcoded social handles in app/layout.tsx with DB-driven records.
-- Written by /admin/social-media, read by Footer + root metadata (sameAs JSON-LD).

-- Enums (idempotent via DO blocks)
DO $$ BEGIN
  CREATE TYPE social_platform AS ENUM (
    'instagram','facebook','tiktok','youtube','twitter','linkedin','threads','pinterest','bluesky','strava'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE social_post_status AS ENUM ('draft','scheduled','published','failed','archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE social_asset_rights AS ENUM ('owned','ugc_pending','ugc_approved','licensed','unknown');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- social_profiles ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS social_profiles (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform           social_platform NOT NULL,
  handle             VARCHAR(120)    NOT NULL,
  url                VARCHAR(500)    NOT NULL,
  country            CHAR(2)         NOT NULL DEFAULT 'za',
  display_in_footer  BOOLEAN         NOT NULL DEFAULT TRUE,
  is_active          BOOLEAN         NOT NULL DEFAULT TRUE,
  sort_order         INTEGER         NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS social_profiles_platform_country_uniq
  ON social_profiles (platform, country);
CREATE INDEX IF NOT EXISTS social_profiles_country_active_idx
  ON social_profiles (country, is_active);

-- social_assets ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS social_assets (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url            VARCHAR(500)    NOT NULL,
  thumb_url      VARCHAR(500),
  mime           VARCHAR(50),
  width          INTEGER,
  height         INTEGER,
  size_bytes     INTEGER,
  title          VARCHAR(255),
  alt_text       VARCHAR(500),
  tags           TEXT[]          NOT NULL DEFAULT ARRAY[]::TEXT[],
  rights_status  social_asset_rights NOT NULL DEFAULT 'owned',
  rights_note    TEXT,
  uploaded_by    UUID            REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS social_assets_created_idx ON social_assets (created_at);
CREATE INDEX IF NOT EXISTS social_assets_rights_idx  ON social_assets (rights_status);

-- social_posts -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS social_posts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id           UUID            REFERENCES users(id) ON DELETE SET NULL,
  country             CHAR(2)         NOT NULL DEFAULT 'za',
  status              social_post_status NOT NULL DEFAULT 'draft',
  platforms           TEXT[]          NOT NULL DEFAULT ARRAY[]::TEXT[],
  title               VARCHAR(255),
  body                TEXT            NOT NULL DEFAULT '',
  asset_ids           UUID[]          NOT NULL DEFAULT ARRAY[]::UUID[],
  linked_listing_id   UUID            REFERENCES listings(id)   ON DELETE SET NULL,
  linked_event_id     UUID            REFERENCES events(id)     ON DELETE SET NULL,
  linked_route_id     UUID            REFERENCES routes(id)     ON DELETE SET NULL,
  linked_business_id  UUID            REFERENCES businesses(id) ON DELETE SET NULL,
  utm_campaign        VARCHAR(120),
  scheduled_at        TIMESTAMPTZ,
  published_at        TIMESTAMPTZ,
  error_log           TEXT,
  created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS social_posts_status_scheduled_idx ON social_posts (status, scheduled_at);
CREATE INDEX IF NOT EXISTS social_posts_country_idx          ON social_posts (country);
CREATE INDEX IF NOT EXISTS social_posts_author_idx           ON social_posts (author_id);

-- social_metrics -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS social_metrics (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id       UUID            NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  platform      social_platform NOT NULL,
  impressions   INTEGER         DEFAULT 0,
  clicks        INTEGER         DEFAULT 0,
  engagements   INTEGER         DEFAULT 0,
  captured_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS social_metrics_post_platform_idx ON social_metrics (post_id, platform);

-- short_links --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS short_links (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         VARCHAR(40)  NOT NULL UNIQUE,
  destination  VARCHAR(1000) NOT NULL,
  utm_source   VARCHAR(60),
  utm_medium   VARCHAR(60),
  utm_campaign VARCHAR(120),
  utm_content  VARCHAR(120),
  clicks       INTEGER      NOT NULL DEFAULT 0,
  post_id      UUID         REFERENCES social_posts(id) ON DELETE SET NULL,
  created_by   UUID         REFERENCES users(id)        ON DELETE SET NULL,
  expires_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS short_links_slug_uniq ON short_links (slug);

-- Seed the six legacy hardcoded handles from app/layout.tsx so sameAs JSON-LD
-- stays intact immediately after migrate. Admin can edit/remove thereafter.
INSERT INTO social_profiles (platform, handle, url, country, sort_order) VALUES
  ('instagram', 'crankmartsa', 'https://www.instagram.com/crankmartsa',     'za', 10),
  ('facebook',  'crankmartsa', 'https://www.facebook.com/crankmartsa',       'za', 20),
  ('tiktok',    'crankmartsa', 'https://www.tiktok.com/@crankmartsa',        'za', 30),
  ('linkedin',  'crankmart-sa','https://www.linkedin.com/company/crankmart-sa','za', 40),
  ('youtube',   'crankmartsa', 'https://www.youtube.com/@crankmartsa',       'za', 50),
  ('twitter',   'crankmartsa', 'https://twitter.com/crankmartsa',            'za', 60)
ON CONFLICT (platform, country) DO NOTHING;
