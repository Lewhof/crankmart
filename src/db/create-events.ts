import { neon } from '@neondatabase/serverless'

async function main() {
  const sql = neon(process.env.DATABASE_URL!)

  try {
    // Create types with error handling
    try {
      await sql`DO $$ BEGIN CREATE TYPE event_type AS ENUM('race','sportive','fun_ride','social_ride','training_camp','expo','club_event','charity_ride'); EXCEPTION WHEN duplicate_object THEN null; END $$`
      console.log('✅ event_type enum created')
    } catch (e) {
      console.log('ℹ️ event_type enum already exists')
    }

    try {
      await sql`DO $$ BEGIN CREATE TYPE event_status AS ENUM('pending_review','ongoing','completed','cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$`
      console.log('✅ event_status enum created')
    } catch (e) {
      console.log('ℹ️ event_status enum already exists')
    }

    // Create table
    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        title varchar(255) NOT NULL,
        slug varchar(255) NOT NULL UNIQUE,
        description text,
        event_type event_type DEFAULT 'race',
        status event_status DEFAULT 'pending_review',
        start_date timestamp NOT NULL,
        end_date timestamp,
        province varchar(100),
        city varchar(100),
        venue varchar(255),
        distance varchar(100),
        entry_fee varchar(100),
        entry_url varchar(500),
        website_url varchar(500),
        banner_url varchar(500),
        organiser_name varchar(255),
        organiser_email varchar(255),
        organiser_phone varchar(50),
        is_scraped boolean DEFAULT false,
        scrape_source varchar(100),
        is_featured boolean DEFAULT false,
        submitted_by uuid,
        moderation_status varchar(50) DEFAULT 'approved',
        views_count integer DEFAULT 0,
        saves_count integer DEFAULT 0,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      )
    `
    console.log('✅ Events table created')
  } catch (err) {
    console.error('Error:', err)
  }

  process.exit(0)
}

main()
