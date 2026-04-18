-- Community Phase 1 (G5): comments, reactions, flags, lost-bike registry,
-- public-profile columns. Comments are polymorphic so a single table backs
-- discussions on listings, events, routes, news, stolen reports + lost reports.

-- ── Polymorphic comment system ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type   varchar(20) NOT NULL,
  target_id     uuid NOT NULL,
  parent_id     uuid REFERENCES comments(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body          text NOT NULL,
  status        varchar(20) NOT NULL DEFAULT 'approved',
  edited_at     timestamp,
  created_at    timestamp NOT NULL DEFAULT NOW(),
  updated_at    timestamp NOT NULL DEFAULT NOW()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_comments_target
  ON comments(target_type, target_id, created_at DESC)
  WHERE status = 'approved';
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_comments_user
  ON comments(user_id, created_at DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_comments_parent
  ON comments(parent_id)
  WHERE parent_id IS NOT NULL;
--> statement-breakpoint

-- ── Reactions (likes only at Phase 1; column kept extensible) ───────
CREATE TABLE IF NOT EXISTS comment_reactions (
  comment_id    uuid NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction      varchar(20) NOT NULL DEFAULT 'like',
  created_at    timestamp NOT NULL DEFAULT NOW(),
  PRIMARY KEY (comment_id, user_id, reaction)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_reactions_comment
  ON comment_reactions(comment_id);
--> statement-breakpoint

-- ── Generic content flagging (works for comments, listings, etc.) ──
CREATE TABLE IF NOT EXISTS content_flags (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type   varchar(20) NOT NULL,
  target_id     uuid NOT NULL,
  reporter_id   uuid REFERENCES users(id) ON DELETE SET NULL,
  reason        varchar(40) NOT NULL,
  notes         text,
  status        varchar(20) NOT NULL DEFAULT 'pending',
  reviewed_by   uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at   timestamp,
  created_at    timestamp NOT NULL DEFAULT NOW()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_flags_status
  ON content_flags(status, created_at DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_flags_target
  ON content_flags(target_type, target_id);
--> statement-breakpoint

-- ── Lost-bike registry (mirror of stolen_reports without SAPS) ──────
CREATE TABLE IF NOT EXISTS lost_reports (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_number      varchar(64),
  brand              varchar(100) NOT NULL,
  model              varchar(100),
  year               integer,
  colour             varchar(50),
  status             varchar(20) NOT NULL DEFAULT 'pending',
  last_seen_date     date,
  last_seen_location varchar(200),
  reporter_user_id   uuid REFERENCES users(id) ON DELETE SET NULL,
  reporter_email     varchar(255),
  proof_photo_url    text,
  description        text,
  reward_text        varchar(200),
  notes              text,
  country            char(2) NOT NULL DEFAULT 'za',
  created_at         timestamp NOT NULL DEFAULT NOW(),
  updated_at         timestamp NOT NULL DEFAULT NOW(),
  reviewed_by        uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at        timestamp
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_lost_reports_status
  ON lost_reports(status, created_at DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_lost_reports_serial
  ON lost_reports(serial_number)
  WHERE serial_number IS NOT NULL AND status IN ('pending', 'approved');
--> statement-breakpoint

-- ── Public profile columns on users ─────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS handle varchar(40);
--> statement-breakpoint
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_bio text;
--> statement-breakpoint
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_city varchar(100);
--> statement-breakpoint
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_province varchar(100);
--> statement-breakpoint
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_show_city boolean DEFAULT false;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_handle
  ON users(LOWER(handle))
  WHERE handle IS NOT NULL;
--> statement-breakpoint

-- ── Backfill handles for existing users ─────────────────────────────
-- Strategy: derive from email-prefix, sanitise, append a numeric suffix
-- to break collisions deterministically (row_number over duplicates).
-- Users can claim a different handle once via /account/profile.
WITH derived AS (
  SELECT
    id,
    -- lowercase, strip non-alphanumeric, cap at 30 chars
    SUBSTRING(
      REGEXP_REPLACE(LOWER(SPLIT_PART(email, '@', 1)), '[^a-z0-9]', '', 'g')
      FROM 1 FOR 30
    ) AS base
  FROM users
  WHERE handle IS NULL AND email IS NOT NULL
),
ranked AS (
  SELECT
    id,
    NULLIF(base, '') AS base,
    ROW_NUMBER() OVER (PARTITION BY base ORDER BY id) AS rn
  FROM derived
)
UPDATE users u
   SET handle = CASE
                  WHEN r.base IS NULL THEN 'rider' || SUBSTRING(u.id::text FROM 1 FOR 8)
                  WHEN r.rn = 1       THEN r.base
                  ELSE r.base || (r.rn - 1)::text
                END
  FROM ranked r
 WHERE u.id = r.id;
