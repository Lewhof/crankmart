/**
 * CycleMart Business Directory — 108-Listing Seed
 * Generated: 2026-03-30
 *
 * Imports 108 new businesses from business-directory-db.json
 * All listings seeded with:
 *   is_verified: false — unverified until business claims & approves
 *   is_premium: false — free tier
 *
 * business_type enum values: shop | brand | service_center | tour_operator | event_organiser
 *
 * Run: npx tsx src/db/seed-directory-108.ts
 */

import { neon } from "@neondatabase/serverless";
import * as fs from "fs";
import * as path from "path";

const sql = neon(process.env.DATABASE_URL!);

interface SourceBusiness {
  id: string;
  name: string;
  slug: string;
  categories: string[];
  province: string;
  city: string;
  suburb?: string;
  address: string;
  website?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  description: string;
  services: string[];
  specialisation?: string[];
  brands_stocked?: string[];
  status: string;
  tier: string;
  verified: boolean;
  seo_tags?: string[];
}

interface Business {
  name: string;
  slug: string;
  business_type: "shop" | "brand" | "service_center" | "tour_operator" | "event_organiser";
  description: string;
  province: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  brands_stocked: string[];
  services: string[];
}

// ─── Business type mapping ─────────────────────────────────────────────────
// bike_shop       → shop
// online_retailer → shop
// brand_importer  → brand
// mechanic_workshop / cycling_coach → service_center
// event_organiser → event_organiser
// bike_hire       → tour_operator

function mapBusinessType(categories: string[]): Business["business_type"] {
  if (!categories || categories.length === 0) return "shop";
  const primary = categories[0];
  switch (primary) {
    case "bike_shop":
    case "online_retailer":
      return "shop";
    case "brand_importer":
      return "brand";
    case "mechanic_workshop":
    case "cycling_coach":
      return "service_center";
    case "event_organiser":
      return "event_organiser";
    case "bike_hire":
      return "tour_operator";
    default:
      return "shop";
  }
}

function loadAndParseData(): SourceBusiness[] {
  const filePath = "/home/hein/.openclaw/workspace/cyclemart/data/business-directory-db.json";
  let content = fs.readFileSync(filePath, "utf-8");

  // Remove JS-style comments (// lines)
  content = content
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n");

  // Parse the JSON
  const data = JSON.parse(content);
  return data.businesses || [];
}

async function seed() {
  console.log(`\n🚀 CycleMart Directory Seed — 108 businesses\n`);

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  try {
    // Create enums and table if they don't exist
    console.log(`📋 Creating businesses table if needed...`);
    
    await sql`
      DO $$ BEGIN
       CREATE TYPE "business_type" AS ENUM('shop', 'brand', 'service_center', 'tour_operator', 'event_organiser');
      EXCEPTION
       WHEN duplicate_object THEN null;
      END $$;
    `;
    
    await sql`
      DO $$ BEGIN
       CREATE TYPE "business_status" AS ENUM('disabled', 'active', 'paused', 'removed');
      EXCEPTION
       WHEN duplicate_object THEN null;
      END $$;
    `;
    
    await sql`
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
        "claimed_by" uuid,
        "claimed_at" timestamp,
        "verified_at" timestamp,
        "search_vector" tsvector,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `;
    
    console.log(`✅ Table ready\n`);
    
    const sourcedBusinesses = loadAndParseData();
    console.log(`📚 Loaded ${sourcedBusinesses.length} businesses from JSON\n`);

    for (const source of sourcedBusinesses) {
      try {
        const business: Business = {
          name: source.name || "",
          slug: source.slug || "",
          business_type: mapBusinessType(source.categories || []),
          description: source.description || "",
          province: source.province === "WC" ? "Western Cape" :
                   source.province === "GP" ? "Gauteng" :
                   source.province === "KZN" ? "KwaZulu-Natal" :
                   source.province === "EC" ? "Eastern Cape" :
                   source.province === "LP" ? "Limpopo" :
                   source.province === "FS" ? "Free State" :
                   source.province === "MP" ? "Mpumalanga" :
                   source.province === "NW" ? "North West" : source.province || "",
          city: source.city || "",
          address: source.address || "",
          phone: source.phone || "",
          email: source.email || "",
          website: source.website || "",
          brands_stocked: source.brands_stocked || [],
          services: source.services || [],
        };

        // Validate required fields
        if (!business.name || !business.slug || !business.city) {
          console.log(`  ⚠ Skip (missing required fields): ${source.name}`);
          skipped++;
          continue;
        }

        const result = await sql`
          INSERT INTO businesses (
            name, slug, business_type, description,
            province, city, address,
            phone, email, website,
            brands_stocked, services,
            is_verified, is_premium
          ) VALUES (
            ${business.name},
            ${business.slug},
            ${business.business_type}::business_type,
            ${business.description},
            ${business.province},
            ${business.city},
            ${business.address},
            ${business.phone},
            ${business.email},
            ${business.website},
            ${business.brands_stocked},
            ${business.services},
            false,
            false
          )
          ON CONFLICT (slug) DO NOTHING
          RETURNING id
        `;

        // Check if row was actually inserted
        if (result.length > 0) {
          console.log(`  ✓ ${business.name} (${business.business_type})`);
          inserted++;
        } else {
          console.log(`  ⚠ Skip (duplicate slug): ${business.name}`);
          skipped++;
        }
      } catch (e: any) {
        console.error(`  ✗ Error: ${source.name} — ${e.message || e.code}`);
        errors++;
      }
    }

    console.log(`\n${"─".repeat(60)}`);
    console.log(`✅ Seed complete:`);
    console.log(`   📊 Inserted: ${inserted}`);
    console.log(`   ⏭️  Skipped (duplicates/validation): ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);

    // Final count
    const countResult = await sql`SELECT COUNT(*) as count FROM businesses`;
    const totalCount = (countResult[0] as any).count;
    console.log(`   📈 Total in DB: ${totalCount}`);

    process.exit(errors > 0 ? 1 : 0);
  } catch (e) {
    console.error("Fatal error:", e);
    process.exit(1);
  }
}

seed().catch((e) => {
  console.error("Uncaught error:", e);
  process.exit(1);
});
