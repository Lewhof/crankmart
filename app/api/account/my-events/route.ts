import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id

  const result = await db.execute(sql`
    SELECT
      id, title, slug, discipline, event_type,
      city, province, status,
      event_date_start, event_date_end,
      cover_image_url,
      is_verified, is_featured,
      views_count, saves_count,
      boost_tier, boost_expires_at,
      organiser_name, organiser_user_id
    FROM events
    WHERE organiser_user_id = ${userId}
    ORDER BY event_date_start DESC
    LIMIT 20
  `)

  const rows = (result.rows ?? result) as Record<string, unknown>[]
  return NextResponse.json(rows)
}
