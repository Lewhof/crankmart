import { db } from '@/db'
import { sql } from 'drizzle-orm'

async function main() {
  try {
    // Update the admin user to have the admin role
    const result = await db.execute(
      sql`UPDATE users SET role = 'admin' WHERE email = 'admin@test.local' RETURNING id, email, role`
    )
    console.log('✅ User role updated:', result)
    process.exit(0)
  } catch (e) {
    console.error('❌ Error:', e)
    process.exit(1)
  }
}

main()
