-- G6: AU launch — country scoping for community tables + region seeds for 'au'.
--
-- Comments / reactions / flags were added in 0015 without a country column,
-- so every multi-country query would have pulled discussion across both
-- verticals. Backfill lifts country from each comment's parent entity; the
-- same strategy applies to reactions and flags via the comment they target.

ALTER TABLE comments          ADD COLUMN IF NOT EXISTS country char(2) NOT NULL DEFAULT 'za';
--> statement-breakpoint
ALTER TABLE comment_reactions ADD COLUMN IF NOT EXISTS country char(2) NOT NULL DEFAULT 'za';
--> statement-breakpoint
ALTER TABLE content_flags     ADD COLUMN IF NOT EXISTS country char(2) NOT NULL DEFAULT 'za';
--> statement-breakpoint

-- Backfill comments.country from the parent target (per target_type).
UPDATE comments c SET country = COALESCE((
  SELECT country FROM listings       WHERE id = c.target_id AND c.target_type = 'listing'
  UNION ALL
  SELECT country FROM events         WHERE id = c.target_id AND c.target_type = 'event'
  UNION ALL
  SELECT country FROM routes         WHERE id = c.target_id AND c.target_type = 'route'
  UNION ALL
  SELECT country FROM news_articles  WHERE id = c.target_id AND c.target_type = 'news'
  UNION ALL
  SELECT country FROM stolen_reports WHERE id = c.target_id AND c.target_type = 'stolen_report'
  UNION ALL
  SELECT country FROM lost_reports   WHERE id = c.target_id AND c.target_type = 'lost_report'
  LIMIT 1
), 'za');
--> statement-breakpoint

-- Reactions inherit from the comment they react to.
UPDATE comment_reactions r SET country = COALESCE(
  (SELECT country FROM comments WHERE id = r.comment_id),
  'za'
);
--> statement-breakpoint

-- Flags can target many entity types. Inherit from comments when target is a
-- comment; otherwise look up via target_type directly.
UPDATE content_flags f SET country = COALESCE((
  SELECT country FROM comments       WHERE id = f.target_id AND f.target_type = 'comment'
  UNION ALL
  SELECT country FROM listings       WHERE id = f.target_id AND f.target_type = 'listing'
  UNION ALL
  SELECT country FROM events         WHERE id = f.target_id AND f.target_type = 'event'
  UNION ALL
  SELECT country FROM routes         WHERE id = f.target_id AND f.target_type = 'route'
  UNION ALL
  SELECT country FROM news_articles  WHERE id = f.target_id AND f.target_type = 'news'
  UNION ALL
  SELECT country FROM stolen_reports WHERE id = f.target_id AND f.target_type = 'stolen_report'
  UNION ALL
  SELECT country FROM lost_reports   WHERE id = f.target_id AND f.target_type = 'lost_report'
  LIMIT 1
), 'za');
--> statement-breakpoint

-- Country-scoped index replaces the older (target_type, target_id) one.
DROP INDEX IF EXISTS idx_comments_target;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_comments_country_target
  ON comments(country, target_type, target_id, created_at DESC)
  WHERE status = 'approved';
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_flags_country_status
  ON content_flags(country, status, created_at DESC);
--> statement-breakpoint

-- ── AU regions (states + territories) ─────────────────────────────────
INSERT INTO regions (country, code, name, type, display_order) VALUES
  ('au', 'NSW', 'New South Wales',              'state', 1),
  ('au', 'VIC', 'Victoria',                     'state', 2),
  ('au', 'QLD', 'Queensland',                   'state', 3),
  ('au', 'WA',  'Western Australia',            'state', 4),
  ('au', 'SA',  'South Australia',              'state', 5),
  ('au', 'TAS', 'Tasmania',                     'state', 6),
  ('au', 'NT',  'Northern Territory',           'state', 7),
  ('au', 'ACT', 'Australian Capital Territory', 'state', 8)
ON CONFLICT (country, code) DO NOTHING;
--> statement-breakpoint

-- Ensure SA regions exist too (noop if already seeded).
INSERT INTO regions (country, code, name, type, display_order) VALUES
  ('za', 'GP',  'Gauteng',       'province', 1),
  ('za', 'WC',  'Western Cape',  'province', 2),
  ('za', 'KZN', 'KwaZulu-Natal', 'province', 3),
  ('za', 'EC',  'Eastern Cape',  'province', 4),
  ('za', 'FS',  'Free State',    'province', 5),
  ('za', 'LIM', 'Limpopo',       'province', 6),
  ('za', 'MPU', 'Mpumalanga',    'province', 7),
  ('za', 'NC',  'Northern Cape', 'province', 8),
  ('za', 'NW',  'North West',    'province', 9)
ON CONFLICT (country, code) DO NOTHING;
