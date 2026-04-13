import { db } from './index'
import { sql } from 'drizzle-orm'

async function main() {
  try {
    // Create event_type enum
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE event_type AS ENUM ('race','sportive','fun_ride','social_ride','training_camp','expo','club_event','charity_ride');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)
    console.log('✅ event_type enum created')

    // Create event_status enum
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE event_status AS ENUM ('upcoming','ongoing','completed','cancelled');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)
    console.log('✅ event_status enum created')

    // Create events table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        event_type event_type DEFAULT 'race',
        status event_status DEFAULT 'upcoming',
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP,
        province VARCHAR(100),
        city VARCHAR(100),
        venue VARCHAR(255),
        distance VARCHAR(100),
        entry_fee VARCHAR(100),
        entry_url VARCHAR(500),
        website_url VARCHAR(500),
        banner_url VARCHAR(500),
        organiser_name VARCHAR(255),
        organiser_email VARCHAR(255),
        organiser_phone VARCHAR(50),
        is_scraped BOOLEAN DEFAULT false,
        scrape_source VARCHAR(100),
        is_featured BOOLEAN DEFAULT false,
        submitted_by UUID,
        moderation_status VARCHAR(50) DEFAULT 'approved',
        views_count INTEGER DEFAULT 0,
        saves_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('✅ Events table created')
  } catch (e) {
    console.error('Migration error:', e)
    process.exit(1)
  }
  process.exit(0)
}
