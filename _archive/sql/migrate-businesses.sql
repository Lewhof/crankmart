-- CrankMart Business Directory Migration
-- Generated: 2026-03-30
-- Creates businesses table with all required columns

-- Create enums
DO $$ BEGIN
 CREATE TYPE "business_type" AS ENUM('shop', 'brand', 'service_center', 'tour_operator', 'event_organiser');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "business_status" AS ENUM('disabled', 'active', 'paused', 'removed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create businesses table
CREATE TABLE IF NOT EXISTS "businesses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(255) NOT NULL,
  "slug" varchar(255) UNIQUE NOT NULL,
  "business_type" "business_type" DEFAULT 'shop' NOT NULL,
  "description" text,
  "province" varchar(100),
  "city" varchar(100),
  "suburb" varchar(100),
  "address" varchar(500),
  "phone" varchar(50),
  "whatsapp" varchar(50),
  "email" varchar(255),
  "website" varchar(500),
  "brands_stocked" text[] DEFAULT '{}',
  "services" text[] DEFAULT '{}',
  "specialisation" text[] DEFAULT '{}',
  "seo_tags" text[] DEFAULT '{}',
  "logo_url" varchar(500),
  "banner_url" varchar(500),
  "location_lat" numeric(10, 7),
  "location_lng" numeric(10, 7),
  "status" "business_status" DEFAULT 'disabled' NOT NULL,
  "verified" boolean DEFAULT false NOT NULL,
  "is_premium" boolean DEFAULT false NOT NULL,
  "tier" varchar(50) DEFAULT 'free',
  "views_count" integer DEFAULT 0,
  "saves_count" integer DEFAULT 0,
  "claimed_by" uuid REFERENCES "users"("id"),
  "claimed_at" timestamp,
  "verified_at" timestamp,
  "search_vector" tsvector,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_businesses_slug" ON "businesses"("slug");
CREATE INDEX IF NOT EXISTS "idx_businesses_city" ON "businesses"("city");
CREATE INDEX IF NOT EXISTS "idx_businesses_province" ON "businesses"("province");
CREATE INDEX IF NOT EXISTS "idx_businesses_status" ON "businesses"("status");
CREATE INDEX IF NOT EXISTS "idx_businesses_business_type" ON "businesses"("business_type");
CREATE INDEX IF NOT EXISTS "idx_businesses_verified" ON "businesses"("verified");
CREATE INDEX IF NOT EXISTS "idx_businesses_search" ON "businesses" USING gin("search_vector");

-- Create trigger to update search_vector
CREATE OR REPLACE FUNCTION update_businesses_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.city, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.services, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_businesses_search_vector ON "businesses";
CREATE TRIGGER trigger_update_businesses_search_vector
  BEFORE INSERT OR UPDATE ON "businesses"
  FOR EACH ROW
  EXECUTE FUNCTION update_businesses_search_vector();

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_businesses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_businesses_updated_at ON "businesses";
CREATE TRIGGER trigger_update_businesses_updated_at
  BEFORE UPDATE ON "businesses"
  FOR EACH ROW
  EXECUTE FUNCTION update_businesses_updated_at();
