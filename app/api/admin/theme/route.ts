import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

const THEME_KEYS = [
  'theme_primary',
  'theme_primary_hover',
  'theme_accent',
  'theme_accent_hover',
  'theme_night_ride',
  'theme_background',
  'theme_surface',
]

export async function GET() {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck

  try {
    const result = await db.execute(
      sql`SELECT key, value FROM site_settings WHERE key LIKE 'theme_%'`
    )
    const rows = (result.rows ?? result) as Array<{ key: string; value: string }>
    const theme: Record<string, string> = {}
    rows.forEach(r => { theme[r.key] = r.value })
    return NextResponse.json(theme)
  } catch (error) {
    console.error('Theme GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch theme' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck

  try {
    const body = (await request.json()) as Record<string, string>

    for (const [key, value] of Object.entries(body)) {
      if (!THEME_KEYS.includes(key)) continue
      await db.execute(
        sql`INSERT INTO site_settings (key, value, updated_at)
            VALUES (${key}, ${value}, NOW())
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Theme POST error:', error)
    return NextResponse.json({ error: 'Failed to save theme' }, { status: 500 })
  }
}
