CREATE TYPE "public"."listing_condition" AS ENUM('new', 'like_new', 'used', 'poor');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('upcoming', 'ongoing', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('race', 'sportive', 'fun_ride', 'social_ride', 'training_camp', 'expo', 'club_event', 'charity_ride');--> statement-breakpoint
CREATE TYPE "public"."kyc_status" AS ENUM('not_submitted', 'pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('draft', 'active', 'sold', 'expired', 'removed', 'paused');--> statement-breakpoint
CREATE TYPE "public"."moderation_status" AS ENUM('pending', 'approved', 'rejected', 'flagged');--> statement-breakpoint
CREATE TYPE "public"."seller_type" AS ENUM('individual', 'shop', 'brand');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('buyer', 'seller', 'shop_owner', 'organiser', 'vendor', 'admin', 'superadmin');--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"event_type" "event_type" DEFAULT 'race',
	"status" "event_status" DEFAULT 'upcoming',
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"province" varchar(100),
	"city" varchar(100),
	"venue" varchar(255),
	"distance" varchar(100),
	"entry_fee" varchar(100),
	"entry_url" varchar(500),
	"website_url" varchar(500),
	"banner_url" varchar(500),
	"organiser_name" varchar(255),
	"organiser_email" varchar(255),
	"organiser_phone" varchar(50),
	"is_scraped" boolean DEFAULT false,
	"scrape_source" varchar(100),
	"is_featured" boolean DEFAULT false,
	"submitted_by" uuid,
	"moderation_status" varchar(50) DEFAULT 'approved',
	"views_count" integer DEFAULT 0,
	"saves_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "listing_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"icon_url" varchar(200),
	"display_order" integer DEFAULT 0,
	"listing_count" integer DEFAULT 0,
	CONSTRAINT "listing_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "listing_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"image_url" varchar(500) NOT NULL,
	"thumb_url" varchar(500),
	"display_order" integer DEFAULT 0,
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "listing_saves" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"listing_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seller_id" uuid NOT NULL,
	"category_id" integer,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"bike_make" varchar(100),
	"bike_model" varchar(100),
	"bike_year" integer,
	"frame_size" varchar(10),
	"wheel_size_inches" integer,
	"suspension_travel_mm" integer,
	"frame_material" varchar(50),
	"drivetrain_speeds" integer,
	"brake_type" varchar(50),
	"component_brands" varchar(255),
	"damage_notes" text,
	"trade_considered" boolean DEFAULT false,
	"original_receipt" boolean DEFAULT false,
	"warranty_remaining" text,
	"recent_upgrades" text,
	"postal_code" varchar(10),
	"colour" varchar(50),
	"youtube_url" varchar(500),
	"condition" "listing_condition" NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"negotiable" boolean DEFAULT true,
	"seller_type" "seller_type" DEFAULT 'individual',
	"location_lat" numeric(10, 7),
	"location_lng" numeric(10, 7),
	"location_address" varchar(255),
	"province" varchar(100),
	"city" varchar(100),
	"shipping_available" boolean DEFAULT false,
	"status" "listing_status" DEFAULT 'active',
	"moderation_status" "moderation_status" DEFAULT 'approved',
	"boost_enabled" boolean DEFAULT false,
	"attributes" jsonb DEFAULT '{}'::jsonb,
	"boost_expires_at" timestamp,
	"is_featured" boolean DEFAULT false,
	"featured_expires_at" timestamp,
	"views_count" integer DEFAULT 0,
	"saves_count" integer DEFAULT 0,
	"enquiry_count" integer DEFAULT 0,
	"expires_at" timestamp,
	"sold_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "listings_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false,
	"password_hash" varchar(255),
	"phone" varchar(20),
	"name" varchar(255) NOT NULL,
	"avatar_url" varchar(500),
	"role" "user_role" DEFAULT 'buyer',
	"kyc_status" "kyc_status" DEFAULT 'not_submitted',
	"kyc_document_url" varchar(500),
	"province" varchar(100),
	"city" varchar(100),
	"bio" text,
	"is_active" boolean DEFAULT true,
	"banned_at" timestamp,
	"ban_reason" text,
	"last_active_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "listing_images" ADD CONSTRAINT "listing_images_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_saves" ADD CONSTRAINT "listing_saves_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_saves" ADD CONSTRAINT "listing_saves_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_category_id_listing_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."listing_categories"("id") ON DELETE no action ON UPDATE no action;