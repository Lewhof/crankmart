import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const result = await db.execute(sql.raw(`
      SELECT
        r.id, r.name, r.slug, r.discipline, r.difficulty, r.province, r.town,
        r.distance_km, r.elevation_m, r.hero_image_url,
        rs.created_at as saved_at
      FROM route_saves rs
      JOIN routes r ON r.id = rs.route_id
      WHERE rs.user_id = '${userId}'
      ORDER BY rs.created_at DESC
    `))

    const rows = (result.rows ?? result) as any[]
    return NextResponse.json(rows)
  } catch (error: any) {
    console.error('Fetch saved routes error:', error.message)
    return NextResponse.json({ error: 'Failed to fetch saved routes' }, { status: 500 })
  }
}
