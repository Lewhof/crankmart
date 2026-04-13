import { db } from './index'
import { sql } from 'drizzle-orm'

async function main() {
  try {
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE news_status AS ENUM ('pending','approved','rejected','draft');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)
    console.log('✅ news_status enum created')

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS news_articles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        excerpt TEXT,
        body TEXT NOT NULL,
        cover_image_url TEXT,
        category VARCHAR(100) DEFAULT 'general',
        tags TEXT[],
        author_name VARCHAR(150),
        author_email VARCHAR(255),
        author_bio TEXT,
        source_url TEXT,
        status news_status DEFAULT 'pending',
        is_featured BOOLEAN DEFAULT false,
        views_count INTEGER DEFAULT 0,
        submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
        approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
        approved_at TIMESTAMP WITH TIME ZONE,
        published_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)
    console.log('✅ news_articles table created')
    console.log('🎉 News migration complete')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
  process.exit(0)
}

main()
