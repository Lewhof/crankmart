-- G8 Admin ticketing (OSS/BSS-style). Every inbound action becomes a ticket:
-- contact-us submissions, content flags, moderation queue items, business-claim
-- outreach replies. Unified inbox, threaded email replies, SLA tracking,
-- canned responses. Tickets STAY LINKED to their source entity via exclusive
-- nullable FKs (industry-standard pattern; string polymorphism rejected).

-- ── Contact submissions (source table for direct contact-us) ─────────
CREATE TABLE IF NOT EXISTS contact_submissions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country          char(2) NOT NULL,
  name             varchar(255) NOT NULL,
  email            varchar(255) NOT NULL,
  subject          varchar(255),
  body             text NOT NULL,
  ip_hash          varchar(64),
  user_agent       varchar(255),
  created_at       timestamp NOT NULL DEFAULT NOW()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_contact_submissions_country ON contact_submissions(country, created_at DESC);
--> statement-breakpoint

-- ── Tickets — one row per actionable thread ──────────────────────────
CREATE TABLE IF NOT EXISTS tickets (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country           char(2) NOT NULL,
  subject           varchar(500) NOT NULL,
  status            varchar(20) NOT NULL DEFAULT 'todo',
  priority          varchar(20) NOT NULL DEFAULT 'normal',
  category          varchar(50),

  requester_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  requester_email   varchar(255),
  requester_name    varchar(255),

  assigned_admin_id uuid REFERENCES users(id) ON DELETE SET NULL,

  sla_target_hours  integer,
  sla_due_at        timestamp,
  first_response_at timestamp,
  resolved_at       timestamp,
  snoozed_until     timestamp,

  -- Polymorphic source — exclusive nullable FKs, CHECK enforces at most one.
  source_listing_id       uuid REFERENCES listings(id)         ON DELETE SET NULL,
  source_flag_id          uuid REFERENCES content_flags(id)    ON DELETE SET NULL,
  source_stolen_report_id uuid REFERENCES stolen_reports(id)   ON DELETE SET NULL,
  source_lost_report_id   uuid REFERENCES lost_reports(id)     ON DELETE SET NULL,
  source_news_article_id  uuid REFERENCES news_articles(id)    ON DELETE SET NULL,
  source_business_id      uuid REFERENCES businesses(id)       ON DELETE SET NULL,
  source_contact_id       uuid REFERENCES contact_submissions(id) ON DELETE SET NULL,

  created_at        timestamp NOT NULL DEFAULT NOW(),
  updated_at        timestamp NOT NULL DEFAULT NOW(),

  CONSTRAINT ticket_status_valid   CHECK (status IN ('todo','snoozed','done')),
  CONSTRAINT ticket_priority_valid CHECK (priority IN ('urgent','high','normal','low')),
  CONSTRAINT ticket_at_most_one_source CHECK (
    (CASE WHEN source_listing_id       IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN source_flag_id          IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN source_stolen_report_id IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN source_lost_report_id   IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN source_news_article_id  IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN source_business_id      IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN source_contact_id       IS NOT NULL THEN 1 ELSE 0 END) <= 1
  )
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_tickets_status_country  ON tickets(country, status, sla_due_at NULLS LAST);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_tickets_assigned       ON tickets(assigned_admin_id, status);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_tickets_requester      ON tickets(requester_user_id);
--> statement-breakpoint

-- ── Ticket messages — conversation thread, one row per inbound/outbound ──
CREATE TABLE IF NOT EXISTS ticket_messages (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id          uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_type        varchar(20) NOT NULL,
  author_id          uuid,
  direction          varchar(20) NOT NULL,
  body_html          text,
  body_text          text NOT NULL,
  email_message_id   varchar(255),
  email_in_reply_to  varchar(255),
  created_at         timestamp NOT NULL DEFAULT NOW(),
  CONSTRAINT msg_author_valid    CHECK (author_type IN ('user','admin','system')),
  CONSTRAINT msg_direction_valid CHECK (direction IN ('inbound','outbound','internal_note'))
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id, created_at);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS uniq_ticket_msg_email_id
  ON ticket_messages(email_message_id) WHERE email_message_id IS NOT NULL;
--> statement-breakpoint

-- ── Ticket tags (free-form labels) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS ticket_tags (
  ticket_id uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  tag       varchar(50) NOT NULL,
  PRIMARY KEY (ticket_id, tag)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_ticket_tags_tag ON ticket_tags(tag);
--> statement-breakpoint

-- ── Canned responses (per-country macros with variable interpolation) ──
CREATE TABLE IF NOT EXISTS canned_responses (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country      char(2) NOT NULL,
  name         varchar(100) NOT NULL,
  body_markdown text NOT NULL,
  category     varchar(50),
  created_by   uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at   timestamp NOT NULL DEFAULT NOW(),
  updated_at   timestamp NOT NULL DEFAULT NOW(),
  UNIQUE (country, name)
);
