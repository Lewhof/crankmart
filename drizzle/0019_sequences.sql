-- G7 Marketing Hub Phase 2 — sequences (ordered email flows triggered by
-- an event like business_claim / signup / listing_publish). Each enrollment
-- advances through steps via QStash callbacks; next_run_at is set when a
-- step fires so the cron pollers don't re-send.

CREATE TABLE IF NOT EXISTS sequences (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country       char(2) NOT NULL,
  name          varchar(255) NOT NULL,
  description   text,
  trigger_type  varchar(50) NOT NULL DEFAULT 'manual',
  status        varchar(20) NOT NULL DEFAULT 'draft',
  created_by    uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at    timestamp NOT NULL DEFAULT NOW(),
  updated_at    timestamp NOT NULL DEFAULT NOW(),
  UNIQUE (country, name),
  CONSTRAINT sequence_status_valid CHECK (status IN ('draft','active','paused','archived'))
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_sequences_country_status ON sequences(country, status);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS sequence_steps (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id  uuid NOT NULL REFERENCES sequences(id) ON DELETE CASCADE,
  step_order   integer NOT NULL,
  template_id  uuid NOT NULL REFERENCES email_templates(id) ON DELETE RESTRICT,
  delay_hours  integer NOT NULL DEFAULT 0,
  created_at   timestamp NOT NULL DEFAULT NOW(),
  UNIQUE (sequence_id, step_order)
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS sequence_enrollments (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id        uuid NOT NULL REFERENCES sequences(id) ON DELETE CASCADE,
  user_id            uuid REFERENCES users(id) ON DELETE CASCADE,
  email              varchar(255),
  current_step       integer NOT NULL DEFAULT 0,
  next_run_at        timestamp,
  qstash_message_id  varchar(255),
  completed_at       timestamp,
  cancelled_at       timestamp,
  created_at         timestamp NOT NULL DEFAULT NOW(),
  CONSTRAINT enrollment_has_recipient CHECK (user_id IS NOT NULL OR email IS NOT NULL)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_enrollments_due
  ON sequence_enrollments(next_run_at)
  WHERE completed_at IS NULL AND cancelled_at IS NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_enrollments_sequence
  ON sequence_enrollments(sequence_id, created_at DESC);
