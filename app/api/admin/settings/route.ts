import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

export async function GET() {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck

  try {
    const result = await db.execute(
      sql`SELECT key, value FROM site_settings ORDER BY key`
    )
    const rows = (result.rows ?? result) as Array<{ key: string; value: string }>
    const settings: Record<string, string> = {}

    rows.forEach((row) => {
      // Mask smtp_pass in response
      if (row.key === 'smtp_pass') {
        settings[row.key] = row.value ? '••••••' : ''
      } else {
        settings[row.key] = row.value
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck

  try {
    const body = (await request.json()) as Record<string, string>

    for (const [key, value] of Object.entries(body)) {
      // Upsert into site_settings
      await db.execute(
        sql`
        INSERT INTO site_settings (key, value, updated_at)
        VALUES (${key}, ${value}, NOW())
        ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          updated_at = NOW()
        `
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
