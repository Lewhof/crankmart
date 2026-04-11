CREATE TYPE "public"."boost_status" AS ENUM('pending', 'active', 'expired', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."boost_type" AS ENUM('bump', 'category_top', 'homepage', 'directory');--> statement-breakpoint
CREATE TYPE "public"."business_status" AS ENUM('disabled', 'active', 'paused', 'removed');--> statement-breakpoint
CREATE TYPE "public"."business_type" AS ENUM('shop', 'brand', 'service_center', 'tour_operator', 'event_organiser');--> statement-breakpoint
CREATE TYPE "public"."route_difficulty" AS ENUM('beginner', 'intermediate', 'advanced', 'expert');--> statement-breakpoint
CREATE TYPE "public"."route_discipline" AS ENUM('road', 'mtb', 'gravel', 'urban', 'bikepacking');--> statement-breakpoint
CREATE TYPE "public"."route_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."route_surface" AS ENUM('tarmac', 'gravel', 'singletrack', 'mixed');--> statement-breakpoint
CREATE TABLE "boost_packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "boost_type" NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"duration_days" integer,
	"price_cents" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "boosts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"package_id" integer NOT NULL,
	"listing_id" uuid,
	"directory_id" uuid,
	"status" "boost_status" DEFAULT 'pending',
	"payfast_payment_id" varchar(255),
	"payfast_m_payment_id" varchar(255),
	"amount_cents" integer NOT NULL,
	"starts_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
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
	"claimed_by" uuid,
	"claimed_at" timestamp,
	"verified_at" timestamp,
	"search_vector" "tsvector",
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "businesses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "route_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"route_id" uuid NOT NULL,
	"url" varchar(500) NOT NULL,
	"thumb_url" varchar(500),
	"medium_url" varchar(500),
	"alt_text" varchar(255),
	"source" varchar(100) DEFAULT 'scrape',
	"display_order" integer DEFAULT 0,
	"is_primary" boolean DEFAULT false,
	"width" integer,
	"height" integer,
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "route_loops" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"route_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"distance_km" numeric(6, 1),
	"difficulty" "route_difficulty" DEFAULT 'intermediate',
	"category" varchar(20) DEFAULT 'green',
	"subtitle" varchar(100),
	"description" text,
	"display_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "route_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"route_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"body" text,
	"conditions_note" text,
	"ridden_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "route_saves" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"route_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "routes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"discipline" "route_discipline" DEFAULT 'mtb' NOT NULL,
	"difficulty" "route_difficulty" DEFAULT 'intermediate' NOT NULL,
	"surface" "route_surface" DEFAULT 'mixed',
	"distance_km" numeric(6, 1),
	"elevation_m" integer,
	"est_time_min" integer,
	"province" varchar(100),
	"region" varchar(100),
	"town" varchar(100),
	"lat" numeric(10, 7),
	"lng" numeric(10, 7),
	"gpx_url" varchar(500),
	"hero_image_url" varchar(500),
	"facilities" jsonb DEFAULT '{}'::jsonb,
	"tags" text[] DEFAULT '{}',
	"website_url" varchar(500),
	"contact_email" varchar(255),
	"contact_phone" varchar(50),
	"is_verified" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"status" "route_status" DEFAULT 'approved',
	"avg_rating" numeric(3, 2) DEFAULT '0',
	"review_count" integer DEFAULT 0,
	"image_count" integer DEFAULT 0,
	"primary_image_url" varchar(500),
	"source_name" varchar(100),
	"source_url" varchar(500),
	"last_scraped_at" timestamp,
	"submitted_by" uuid,
	"views_count" integer DEFAULT 0,
	"saves_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "routes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "scrape_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_name" varchar(100) NOT NULL,
	"started_at" timestamp DEFAULT now(),
	"finished_at" timestamp,
	"routes_found" integer DEFAULT 0,
	"routes_added" integer DEFAULT 0,
	"routes_updated" integer DEFAULT 0,
	"errors" jsonb DEFAULT '[]'::jsonb,
	"status" varchar(50) DEFAULT 'running'
);
--> statement-breakpoint
ALTER TABLE "listing_images" ADD COLUMN "is_primary" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "renewal_email_sent" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "search_vector" "tsvector";--> statement-breakpoint
ALTER TABLE "boosts" ADD CONSTRAINT "boosts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boosts" ADD CONSTRAINT "boosts_package_id_boost_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."boost_packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_claimed_by_users_id_fk" FOREIGN KEY ("claimed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_images" ADD CONSTRAINT "route_images_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_loops" ADD CONSTRAINT "route_loops_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_reviews" ADD CONSTRAINT "route_reviews_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_reviews" ADD CONSTRAINT "route_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_saves" ADD CONSTRAINT "route_saves_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_saves" ADD CONSTRAINT "route_saves_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;