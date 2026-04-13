import { db } from './index'
import { sql } from 'drizzle-orm'

async function main() {
  try {
    console.log('Starting admin migration...')

    // Add is_admin column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false
    `)
    console.log('✅ Added is_admin column to users table')

    // Add status column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active'
    `)
    console.log('✅ Added status column to users table')

    // Mark test user as admin
    await db.execute(sql`
      UPDATE users SET is_admin = true WHERE email = 'lewhofmeyr@gmail.com'
    `)
    console.log('✅ Marked test user as admin')

    console.log('✅ Admin migration completed successfully!')
    process.exit(0)
  } catch (e) {
    console.error('❌ Migration failed:', e)
    process.exit(1)
  }
}

main()
