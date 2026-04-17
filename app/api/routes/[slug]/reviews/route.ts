import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { auth } from '@/auth'
import { getCountry } from '@/lib/country'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const country = await getCountry()
  try {
    const result = await db.execute(sql`
      SELECT rr.id, rr.rating, rr.body, rr.conditions_note, rr.ridden_at, rr.created_at,
             u.name as user_name, u.avatar_url
      FROM route_reviews rr
      JOIN users u ON u.id = rr.user_id
      WHERE rr.route_id = (SELECT id FROM routes WHERE slug = ${slug} AND country = ${country} LIMIT 1)
      ORDER BY rr.created_at DESC
      LIMIT 50
    `)
    return NextResponse.json({ reviews: result.rows ?? [] })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { slug } = await params
  const body = await req.json()
  const rating = parseInt(body.rating)
  if (!rating || rating < 1 || rating > 5) return NextResponse.json({ error: 'Rating must be 1–5' }, { status: 400 })

  const reviewBody = (body.body ?? '').toString().trim().slice(0, 2000)
  const conditionsNote = (body.conditions_note ?? '').toString().trim().slice(0, 500)
  const riddenAt: string | null = body.ridden_at || null
  const userId = session.user.id
  const country = await getCountry()

  try {
    const routeResult = await db.execute(sql`SELECT id FROM routes WHERE slug = ${slug} AND country = ${country} LIMIT 1`)
    const routeId = (routeResult.rows as Array<{ id: string }>)[0]?.id
    if (!routeId) return NextResponse.json({ error: 'Route not found' }, { status: 404 })

    const existing = await db.execute(sql`SELECT id FROM route_reviews WHERE route_id = ${routeId} AND user_id = ${userId}`)
    if ((existing.rows as unknown[]).length > 0) {
      await db.execute(sql`
        UPDATE route_reviews SET
          rating = ${rating},
          body = ${reviewBody},
          conditions_note = ${conditionsNote},
          ridden_at = COALESCE(${riddenAt}::timestamp, ridden_at),
          created_at = NOW()
        WHERE route_id = ${routeId} AND user_id = ${userId}
      `)
    } else {
      await db.execute(sql`
        INSERT INTO route_reviews (id, route_id, user_id, rating, body, conditions_note, ridden_at)
        VALUES (gen_random_uuid(), ${routeId}, ${userId}, ${rating}, ${reviewBody}, ${conditionsNote}, ${riddenAt}::timestamp)
      `)
    }

    await db.execute(sql`
      UPDATE routes SET
        avg_rating   = (SELECT ROUND(AVG(rating)::numeric, 2) FROM route_reviews WHERE route_id = ${routeId}),
        review_count = (SELECT COUNT(*) FROM route_reviews WHERE route_id = ${routeId})
      WHERE id = ${routeId}
    `)

    const newReview = await db.execute(sql`
      SELECT rr.id, rr.rating, rr.body, rr.conditions_note, rr.ridden_at, rr.created_at,
             u.name as user_name, u.avatar_url
      FROM route_reviews rr JOIN users u ON u.id = rr.user_id
      WHERE rr.route_id = ${routeId} AND rr.user_id = ${userId}
      LIMIT 1
    `)
    return NextResponse.json({ review: (newReview.rows as unknown[])[0] })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('Review POST error:', msg)
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 })
  }
}
