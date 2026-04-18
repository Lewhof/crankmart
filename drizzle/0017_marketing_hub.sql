-- G7 Marketing Hub Phase 1 — per-country campaigns + segments + contact lists
-- + email templates + email-event analytics. Sequences land in Phase 2 (0019).

-- ── Contact lists (static audiences) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_lists (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country     char(2) NOT NULL,
  name        varchar(100) NOT NULL,
  description text,
  created_by  uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at  timestamp NOT NULL DEFAULT NOW(),
  updated_at  timestamp NOT NULL DEFAULT NOW(),
  UNIQUE (country, name)
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS contact_list_members (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id   uuid NOT NULL REFERENCES contact_lists(id) ON DELETE CASCADE,
  user_id   uuid REFERENCES users(id) ON DELETE CASCADE,
  email     varchar(255),
  added_at  timestamp NOT NULL DEFAULT NOW(),
  CONSTRAINT member_has_user_or_email CHECK (user_id IS NOT NULL OR email IS NOT NULL)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_list_members_list ON contact_list_members(list_id);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS uniq_list_member_user  ON contact_list_members(list_id, user_id) WHERE user_id IS NOT NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS uniq_list_member_email ON contact_list_members(list_id, email)   WHERE email   IS NOT NULL AND user_id IS NULL;
--> statement-breakpoint

-- ── Segments (query-based dynamic audiences) ─────────────────────────
CREATE TABLE IF NOT EXISTS segments (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country              char(2) NOT NULL,
  name                 varchar(100) NOT NULL,
  description          text,
  -- Stored filter definition so the query can be re-evaluated. Structure is
  -- opaque here; a builder in src/lib/segments.ts materialises rows at send time.
  query_json           jsonb NOT NULL DEFAULT '{}',
  last_materialized_at timestamp,
  last_size            integer,
  created_by           uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at           timestamp NOT NULL DEFAULT NOW(),
  updated_at           timestamp NOT NULL DEFAULT NOW(),
  UNIQUE (country, name)
);
--> statement-breakpoint

-- ── Email templates (React Email refs, versioned per country) ────────
CREATE TABLE IF NOT EXISTS email_templates (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country           char(2) NOT NULL,
  name              varchar(100) NOT NULL,
  subject           varchar(255) NOT NULL,
  react_email_path  varchar(255) NOT NULL,
  variables         jsonb DEFAULT '{}',
  is_transactional  boolean DEFAULT false,
  created_by        uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at        timestamp NOT NULL DEFAULT NOW(),
  updated_at        timestamp NOT NULL DEFAULT NOW(),
  UNIQUE (country, name)
);
--> statement-breakpoint

-- ── Campaigns (one-off broadcasts) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS campaigns (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country          char(2) NOT NULL,
  name             varchar(255) NOT NULL,
  status           varchar(20) NOT NULL DEFAULT 'draft',
  template_id      uuid NOT NULL REFERENCES email_templates(id),
  segment_id       uuid REFERENCES segments(id),
  contact_list_id  uuid REFERENCES contact_lists(id),
  scheduled_at     timestamp,
  sent_at          timestamp,
  stats            jsonb NOT NULL DEFAULT '{}',
  created_by       uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at       timestamp NOT NULL DEFAULT NOW(),
  updated_at       timestamp NOT NULL DEFAULT NOW(),
  CONSTRAINT campaign_has_audience CHECK (segment_id IS NOT NULL OR contact_list_id IS NOT NULL),
  CONSTRAINT campaign_status_valid CHECK (status IN ('draft','scheduled','sending','sent','cancelled','failed'))
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_campaigns_country_status ON campaigns(country, status, scheduled_at DESC);
--> statement-breakpoint

-- ── Email events (Resend webhook-fed analytics) ──────────────────────
CREATE TABLE IF NOT EXISTS email_events (
  id                bigserial PRIMARY KEY,
  campaign_id       uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  recipient_email   varchar(255) NOT NULL,
  event_type        varchar(20) NOT NULL,
  provider_event_id varchar(255),
  metadata          jsonb DEFAULT '{}',
  created_at        timestamp NOT NULL DEFAULT NOW()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_email_events_campaign  ON email_events(campaign_id, created_at DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_email_events_recipient ON email_events(recipient_email, created_at DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_email_events_type      ON email_events(event_type, created_at DESC);
