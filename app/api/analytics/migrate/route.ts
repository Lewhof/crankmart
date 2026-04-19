import { NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { checkAdminApi } from '@/lib/admin'

// Kept as a "repair button" for re-creating the page_views table in new
// environments or after a schema wipe. Canonical schema now lives in
// src/db/schema.ts + drizzle/0020_page_views.sql — prefer those for fresh
// deploys. Gated to admins so a public caller can't probe DDL endpoints.
export async function GET() {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS page_views (
        id SERIAL PRIMARY KEY,
        path VARCHAR(500) NOT NULL,
        referrer VARCHAR(500),
        country VARCHAR(100),
        country_code VARCHAR(10),
        city VARCHAR(100),
        region VARCHAR(100),
        device VARCHAR(20),
        browser VARCHAR(50),
        visitor_id VARCHAR(64),
        session_id VARCHAR(64),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    // Add new columns idempotently
    const alterCols = [
      `ADD COLUMN IF NOT EXISTS visitor_id VARCHAR(64)`,
      `ADD COLUMN IF NOT EXISTS session_id VARCHAR(64)`,
      `ADD COLUMN IF NOT EXISTS country_code VARCHAR(10)`,
      `ADD COLUMN IF NOT EXISTS city VARCHAR(100)`,
      `ADD COLUMN IF NOT EXISTS region VARCHAR(100)`,
    ]
    for (const col of alterCols) {
      await db.execute(sql.raw(`ALTER TABLE page_views ${col}`))
    }

    // Indexes
    for (const idx of [
      `CREATE INDEX IF NOT EXISTS idx_pv_path ON page_views(path)`,
      `CREATE INDEX IF NOT EXISTS idx_pv_created ON page_views(created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_pv_visitor ON page_views(visitor_id)`,
      `CREATE INDEX IF NOT EXISTS idx_pv_session ON page_views(session_id)`,
      `CREATE INDEX IF NOT EXISTS idx_pv_country ON page_views(country_code)`,
    ]) {
      await db.execute(sql.raw(idx))
    }

    return NextResponse.json({ ok: true, message: 'Migration complete' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
