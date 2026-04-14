-- Whiteboard — strategic backlog module for admin
-- 2026-04-14: one table, country-scoped, ranked by priority within status

DO $$ BEGIN
  CREATE TYPE whiteboard_priority AS ENUM ('urgent', 'high', 'medium', 'low');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE whiteboard_status AS ENUM ('backlog', 'todo', 'in_progress', 'done', 'archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE whiteboard_effort AS ENUM ('s', 'm', 'l', 'xl');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS whiteboard_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country      char(2) NOT NULL DEFAULT 'za',
  title        varchar(200) NOT NULL,
  description  text,
  priority     whiteboard_priority NOT NULL DEFAULT 'medium',
  status       whiteboard_status   NOT NULL DEFAULT 'backlog',
  effort       whiteboard_effort,
  categories   text[] NOT NULL DEFAULT ARRAY[]::text[],
  source_url   text,
  owner        varchar(100),
  created_at   timestamp NOT NULL DEFAULT now(),
  updated_at   timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS whiteboard_country_status_priority_idx
  ON whiteboard_items(country, status, priority DESC);

CREATE UNIQUE INDEX IF NOT EXISTS whiteboard_country_title_uniq
  ON whiteboard_items(country, title);
