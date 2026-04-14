-- Performance indexes: browse queries, unread counts, saved listings.
-- Use CONCURRENTLY so index builds don't block writes on prod.
-- Must run outside transactions (Drizzle runner handles this via statement-breakpoint).

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_country_status_created
  ON listings(country, status, created_at DESC);
--> statement-breakpoint
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_country_status_category
  ON listings(country, status, category_id, created_at DESC);
--> statement-breakpoint
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listing_images_listing_display
  ON listing_images(listing_id, display_order);
--> statement-breakpoint
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_buyer
  ON conversations(buyer_id);
--> statement-breakpoint
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_seller
  ON conversations(seller_id);
--> statement-breakpoint
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listing_saves_user
  ON listing_saves(user_id);
