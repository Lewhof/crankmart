import { db } from './index'
import { sql } from 'drizzle-orm'

async function migrate() {
  try {
    console.log('Adding renewal_email_sent column to listings table...')
    await db.execute(
      sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS renewal_email_sent BOOLEAN DEFAULT false`
    )

    console.log('Setting expires_at for existing active listings (30 days from created_at)...')
    await db.execute(
      sql`UPDATE listings SET expires_at = created_at + INTERVAL '30 days' WHERE expires_at IS NULL AND status = 'active'`
    )

    console.log('Migration complete!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

migrate()
