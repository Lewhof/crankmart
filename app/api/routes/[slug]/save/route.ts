import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { auth } from '@/auth'
import { getCountry } from '@/lib/country'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ saved: false })
  const { slug } = await params
  const userId = session.user.id
  const country = await getCountry()
  try {
    const result = await db.execute(sql`
      SELECT 1 FROM route_saves rs
      JOIN routes r ON r.id = rs.route_id
      WHERE rs.user_id = ${userId} AND r.slug = ${slug} AND r.country = ${country}
      LIMIT 1
    `)
    return NextResponse.json({ saved: (result.rows as unknown[]).length > 0 })
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
  const country = await getCountry()
  try {
    const routeResult = await db.execute(sql`SELECT id FROM routes WHERE slug = ${slug} AND country = ${country} LIMIT 1`)
    const routeId = (routeResult.rows as Array<{ id: string }>)[0]?.id
    if (!routeId) return NextResponse.json({ error: 'Route not found' }, { status: 404 })

    const existing = await db.execute(sql`SELECT id FROM route_saves WHERE route_id = ${routeId} AND user_id = ${userId}`)
    let saved: boolean
    if ((existing.rows as unknown[]).length > 0) {
      await db.execute(sql`DELETE FROM route_saves WHERE route_id = ${routeId} AND user_id = ${userId}`)
      saved = false
    } else {
      await db.execute(sql`INSERT INTO route_saves (id, route_id, user_id) VALUES (gen_random_uuid(), ${routeId}, ${userId})`)
      saved = true
    }
    await db.execute(sql`UPDATE routes SET saves_count = (SELECT COUNT(*) FROM route_saves WHERE route_id = ${routeId}) WHERE id = ${routeId}`)
    return NextResponse.json({ saved })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
