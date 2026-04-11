import { db } from '@/db'
import { sql } from 'drizzle-orm'

async function migrate() {
  try {
    // Create site_settings table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS site_settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Seed default SMTP placeholders
    await db.execute(sql`
      INSERT INTO site_settings (key, value) VALUES
        ('smtp_host', ''),
        ('smtp_port', '587'),
        ('smtp_secure', 'false'),
        ('smtp_user', ''),
        ('smtp_pass', ''),
        ('smtp_from_name', 'CycleMart'),
        ('smtp_from_email', 'noreply@cyclemart.co.za'),
        ('email_notifications_enabled', 'true')
      ON CONFLICT (key) DO NOTHING
    `)

    console.log('✅ site_settings table created and seeded')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

migrate()
