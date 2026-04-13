import { db } from '@/db'
import { sql } from 'drizzle-orm'
import bcryptjs from 'bcryptjs'

async function main() {
  try {
    const hashedPassword = await bcryptjs.hash('admin123', 10)

    // First, create or update the user - don't set role initially if it doesn't exist
    const result = await db.execute(
      sql`
      INSERT INTO users (id, name, email, password_hash, email_verified)
      VALUES (${crypto.randomUUID()}, 'Test Admin', 'admin@test.local', ${hashedPassword}, true)
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
      RETURNING id, email
    `
    )

    // The role should already exist as 'admin', but make sure
    console.log('✅ Admin user created/updated:', result)
    process.exit(0)
  } catch (e) {
    console.error('❌ Error:', e)
    process.exit(1)
  }
}

main()
