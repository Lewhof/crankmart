import { db } from './index'
import { sql } from 'drizzle-orm'

async function main() {
  try {
    // Create route_discipline enum
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE route_discipline AS ENUM ('road','mtb','gravel','urban','bikepacking');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)
    console.log('✅ route_discipline enum created')

    // Create route_difficulty enum
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE route_difficulty AS ENUM ('beginner','intermediate','advanced','expert');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)
    console.log('✅ route_difficulty enum created')

    // Create route_surface enum
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE route_surface AS ENUM ('tarmac','gravel','singletrack','mixed');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)
    console.log('✅ route_surface enum created')

    // Create route_status enum
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE route_status AS ENUM ('pending','approved','rejected');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)
    console.log('✅ route_status enum created')

    // Create routes table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS routes (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug             VARCHAR(255) UNIQUE NOT NULL,
        name             VARCHAR(255) NOT NULL,
        description      TEXT,
        discipline       route_discipline NOT NULL DEFAULT 'mtb',
        difficulty       route_difficulty NOT NULL DEFAULT 'intermediate',
        surface          route_surface DEFAULT 'mixed',
        distance_km      NUMERIC(6,1),
        elevation_m      INTEGER,
        est_time_min     INTEGER,
        province         VARCHAR(100),
        region           VARCHAR(100),
        town             VARCHAR(100),
        lat              NUMERIC(10,7),
        lng              NUMERIC(10,7),
        gpx_url          VARCHAR(500),
        hero_image_url   VARCHAR(500),
        facilities       JSONB DEFAULT '{}',
        tags             TEXT[] DEFAULT '{}',
        website_url      VARCHAR(500),
        contact_email    VARCHAR(255),
        contact_phone    VARCHAR(50),
        is_verified      BOOLEAN DEFAULT false,
        is_featured      BOOLEAN DEFAULT false,
        status           route_status DEFAULT 'approved',
        avg_rating       NUMERIC(3,2) DEFAULT 0,
        review_count     INTEGER DEFAULT 0,
        image_count      INTEGER DEFAULT 0,
        primary_image_url VARCHAR(500),
        source_name      VARCHAR(100),
        source_url       VARCHAR(500),
        last_scraped_at  TIMESTAMP,
        submitted_by     UUID REFERENCES users(id),
        views_count      INTEGER DEFAULT 0,
        saves_count      INTEGER DEFAULT 0,
        created_at       TIMESTAMP DEFAULT NOW(),
        updated_at       TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('✅ routes table created')

    // Create route_images table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS route_images (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        route_id      UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
        url           VARCHAR(500) NOT NULL,
        thumb_url     VARCHAR(500),
        medium_url    VARCHAR(500),
        alt_text      VARCHAR(255),
        source        VARCHAR(100) DEFAULT 'scrape',
        display_order INTEGER DEFAULT 0,
        is_primary    BOOLEAN DEFAULT false,
        width         INTEGER,
        height        INTEGER,
        uploaded_at   TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('✅ route_images table created')

    // Create route_loops table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS route_loops (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        route_id      UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
        name          VARCHAR(255) NOT NULL,
        distance_km   NUMERIC(6,1),
        difficulty    route_difficulty DEFAULT 'intermediate',
        description   TEXT,
        display_order INTEGER DEFAULT 0
      )
    `)
    console.log('✅ route_loops table created')

    // Create route_reviews table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS route_reviews (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        route_id        UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
        user_id         UUID NOT NULL REFERENCES users(id),
        rating          INTEGER NOT NULL,
        body            TEXT,
        conditions_note TEXT,
        ridden_at       TIMESTAMP,
        created_at      TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('✅ route_reviews table created')

    // Create route_saves table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS route_saves (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    UUID NOT NULL REFERENCES users(id),
        route_id   UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('✅ route_saves table created')

    // Create scrape_runs table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS scrape_runs (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        source_name    VARCHAR(100) NOT NULL,
        started_at     TIMESTAMP DEFAULT NOW(),
        finished_at    TIMESTAMP,
        routes_found   INTEGER DEFAULT 0,
        routes_added   INTEGER DEFAULT 0,
        routes_updated INTEGER DEFAULT 0,
        errors         JSONB DEFAULT '[]',
        status         VARCHAR(50) DEFAULT 'running'
      )
    `)
    console.log('✅ scrape_runs table created')

    // Indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_routes_province    ON routes(province)`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_routes_discipline  ON routes(discipline)`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_routes_status      ON routes(status)`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_route_images_route_id ON route_images(route_id)`)
    console.log('✅ Indexes created')

  } catch (e) {
    console.error('Migration error:', e)
    process.exit(1)
  }
  process.exit(0)
}

main()
