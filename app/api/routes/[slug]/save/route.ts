import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { auth } from '@/auth'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ saved: false })
  const { slug } = await params
  const userId = session.user.id
  try {
    const result = await db.execute(sql.raw(`
      SELECT 1 FROM route_saves rs
      JOIN routes r ON r.id = rs.route_id
      WHERE rs.user_id = '${userId}' AND r.slug = '${slug.replace(/'/g, "''")}'
      LIMIT 1
    `))
    return NextResponse.json({ saved: (result.rows as any[]).length > 0 })
  } catch {
    return NextResponse.json({ saved: false })
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const { slug } = await params
  const userId = session.user.id
  try {
    // Get route id
    const routeResult = await db.execute(sql.raw(`SELECT id FROM routes WHERE slug = '${slug.replace(/'/g, "''")}' LIMIT 1`))
    const routeId = (routeResult.rows as any[])[0]?.id
    if (!routeId) return NextResponse.json({ error: 'Route not found' }, { status: 404 })

    // Check if already saved
    const existing = await db.execute(sql.raw(`SELECT id FROM route_saves WHERE route_id = '${routeId}' AND user_id = '${userId}'`))
    let saved: boolean
    if ((existing.rows as any[]).length > 0) {
      await db.execute(sql.raw(`DELETE FROM route_saves WHERE route_id = '${routeId}' AND user_id = '${userId}'`))
      saved = false
    } else {
      await db.execute(sql.raw(`INSERT INTO route_saves (id, route_id, user_id) VALUES (gen_random_uuid(), '${routeId}', '${userId}')`))
      saved = true
    }
    // Update saves_count
    await db.execute(sql.raw(`UPDATE routes SET saves_count = (SELECT COUNT(*) FROM route_saves WHERE route_id = '${routeId}') WHERE id = '${routeId}'`))
    return NextResponse.json({ saved })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
