import { sql } from "drizzle-orm";
import { db } from "./index";

async function migrate() {
  try {
    console.log("Starting directory migration...");

    // Create ENUMs (ignore if already exists)
    try {
      await db.execute(
        sql`CREATE TYPE business_type AS ENUM ('bike_shop','online_retailer','brand_importer','workshop','coach','event_organiser','bike_hire')`
      );
      console.log("✓ Created business_type enum");
    } catch (e: any) {
      if (e.cause?.code === "42710") {
        console.log("✓ business_type enum already exists");
      } else {
        throw e;
      }
    }

    try {
      await db.execute(
        sql`CREATE TYPE business_status AS ENUM ('active','pending','suspended')`
      );
      console.log("✓ Created business_status enum");
    } catch (e: any) {
      if (e.cause?.code === "42710") {
        console.log("✓ business_status enum already exists");
      } else {
        throw e;
      }
    }

    // Create businesses table
    await db.execute(
      sql`
        CREATE TABLE IF NOT EXISTS businesses (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          business_type business_type DEFAULT 'bike_shop',
          status business_status DEFAULT 'pending',
          tagline VARCHAR(500),
          description TEXT,
          logo_url VARCHAR(500),
          cover_url VARCHAR(500),
          banner_url VARCHAR(500),
          province VARCHAR(100),
          city VARCHAR(100),
          address TEXT,
          latitude DECIMAL(10,7),
          longitude DECIMAL(10,7),
          phone VARCHAR(50),
          email VARCHAR(255),
          website_url VARCHAR(500),
          instagram_url VARCHAR(500),
          facebook_url VARCHAR(500),
          brands_stocked TEXT,
          services TEXT,
          is_featured BOOLEAN DEFAULT false,
          is_verified BOOLEAN DEFAULT false,
          views_count INTEGER DEFAULT 0,
          rating_avg DECIMAL(3,2) DEFAULT 0,
          rating_count INTEGER DEFAULT 0,
          owner_id UUID,
          is_concierge_request BOOLEAN DEFAULT false,
          concierge_source_url VARCHAR(500),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `
    );
    console.log("✓ Created businesses table");

    // Create business_hours table
    await db.execute(
      sql`
        CREATE TABLE IF NOT EXISTS business_hours (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
          day_of_week INTEGER NOT NULL,
          open_time VARCHAR(10),
          close_time VARCHAR(10),
          is_closed BOOLEAN DEFAULT false
        )
      `
    );
    console.log("✓ Created business_hours table");

    // Create indexes for faster querying (with error handling)
    const indexes = [
      { name: "idx_businesses_slug", column: "slug" },
      { name: "idx_businesses_type", column: "business_type" },
      { name: "idx_businesses_province", column: "province" },
      { name: "idx_business_hours_business_id", table: "business_hours", column: "business_id" }
    ];

    for (const idx of indexes) {
      try {
        const table = idx.table || "businesses";
        await db.execute(
          sql.raw(`CREATE INDEX IF NOT EXISTS ${idx.name} ON ${table}(${idx.column})`)
        );
      } catch (e) {
        console.log(`⚠️  Index ${idx.name} creation skipped (may already exist)`);
      }
    }
    console.log("✓ Created indexes");

    console.log("\n✅ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
