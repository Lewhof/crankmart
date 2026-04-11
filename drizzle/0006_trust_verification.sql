-- Migration: Trust & Verification System
-- Adds new enum values, new columns to businesses and events tables

-- ─── 1. business_status enum: add pending, verified, suspended, claimed ─────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum WHERE enumlabel = 'pending'
      AND enumtypid = 'business_status'::regtype
  ) THEN
    ALTER TYPE business_status ADD VALUE 'pending';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum WHERE enumlabel = 'verified'
      AND enumtypid = 'business_status'::regtype
  ) THEN
    ALTER TYPE business_status ADD VALUE 'verified';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum WHERE enumlabel = 'suspended'
      AND enumtypid = 'business_status'::regtype
  ) THEN
    ALTER TYPE business_status ADD VALUE 'suspended';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum WHERE enumlabel = 'claimed'
      AND enumtypid = 'business_status'::regtype
  ) THEN
    ALTER TYPE business_status ADD VALUE 'claimed';
  END IF;
END $$;

-- ─── 2. event_status enum: add draft, pending_review, verified ───────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum WHERE enumlabel = 'draft'
      AND enumtypid = 'event_status'::regtype
  ) THEN
    ALTER TYPE event_status ADD VALUE 'draft';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum WHERE enumlabel = 'pending_review'
      AND enumtypid = 'event_status'::regtype
  ) THEN
    ALTER TYPE event_status ADD VALUE 'pending_review';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum WHERE enumlabel = 'verified'
      AND enumtypid = 'event_status'::regtype
  ) THEN
    ALTER TYPE event_status ADD VALUE 'verified';
  END IF;
END $$;

-- ─── 3. businesses: add new columns ─────────────────────────────────────────
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS boost_tier        varchar(50)  DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS boost_position    integer      DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS boost_expires_at  timestamptz  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS auto_verified     boolean      DEFAULT false,
  ADD COLUMN IF NOT EXISTS outreach_sent_at  timestamptz  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS outreach_touch2_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS outreach_touch3_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS claim_token       varchar(500) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS claim_token_expires_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS hours             jsonb        DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS contact_source   varchar(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS consent_at        timestamptz  DEFAULT NULL;

-- ─── 4. events: add new columns ─────────────────────────────────────────────
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS boost_tier         varchar(50)  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS boost_expires_at   timestamptz  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS organiser_user_id  uuid         REFERENCES users(id) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS edit_token         varchar(500) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS outreach_sent_at   timestamptz  DEFAULT NULL;

-- ─── 5. Indexes ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_businesses_claim_token   ON businesses(claim_token)        WHERE claim_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_businesses_status        ON businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_boost_tier    ON businesses(boost_tier);
CREATE INDEX IF NOT EXISTS idx_businesses_claimed_by    ON businesses(claimed_by)          WHERE claimed_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_status            ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_boost_tier        ON events(boost_tier)              WHERE boost_tier IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_edit_token        ON events(edit_token)              WHERE edit_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_organiser_user_id ON events(organiser_user_id)       WHERE organiser_user_id IS NOT NULL;
