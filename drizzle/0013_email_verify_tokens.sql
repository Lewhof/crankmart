CREATE TABLE IF NOT EXISTS email_verify_tokens (
  token       varchar(255) PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  timestamp NOT NULL,
  consumed_at timestamp,
  created_at  timestamp NOT NULL DEFAULT NOW()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_email_verify_tokens_user
  ON email_verify_tokens(user_id);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_email_verify_tokens_expires
  ON email_verify_tokens(expires_at)
  WHERE consumed_at IS NULL;
