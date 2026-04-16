CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) NOT NULL,
  country char(2) NOT NULL DEFAULT 'za',
  ip varchar(45),
  user_agent text,
  referrer varchar(500),
  created_at timestamp NOT NULL DEFAULT NOW()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_email_country ON waitlist(email, country);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_waitlist_created ON waitlist(created_at DESC);
