import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { auth } from '@/auth'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    const result = await db.execute(sql.raw(`
      SELECT rr.id, rr.rating, rr.body, rr.conditions_note, rr.ridden_at, rr.created_at,
             u.name as user_name, u.avatar_url
      FROM route_reviews rr
      JOIN users u ON u.id = rr.user_id
      WHERE rr.route_id = (SELECT id FROM routes WHERE slug = '${slug.replace(/'/g, "''")}' LIMIT 1)
      ORDER BY rr.created_at DESC
      LIMIT 50
    `))
    return NextResponse.json({ reviews: result.rows ?? [] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
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

  const reviewBody = (body.body ?? '').trim().slice(0, 2000)
  const conditionsNote = (body.conditions_note ?? '').trim().slice(0, 500)
  const riddenAt = body.ridden_at || null
  const userId = session.user.id

  try {
    // Get route id from slug
    const routeResult = await db.execute(sql.raw(`SELECT id FROM routes WHERE slug = '${slug.replace(/'/g, "''")}' LIMIT 1`))
    const routeId = (routeResult.rows as any[])[0]?.id
    if (!routeId) return NextResponse.json({ error: 'Route not found' }, { status: 404 })

    // Check if user already reviewed
    const existing = await db.execute(sql.raw(`SELECT id FROM route_reviews WHERE route_id = '${routeId}' AND user_id = '${userId}'`))
    if ((existing.rows as any[]).length > 0) {
      // Update existing review
      await db.execute(sql.raw(`
        UPDATE route_reviews SET rating = ${rating}, body = '${reviewBody.replace(/'/g, "''")}',
          conditions_note = '${conditionsNote.replace(/'/g, "''")}',
          ${riddenAt ? `ridden_at = '${riddenAt}',` : ''}
          created_at = NOW()
        WHERE route_id = '${routeId}' AND user_id = '${userId}'
      `))
    } else {
      await db.execute(sql.raw(`
        INSERT INTO route_reviews (id, route_id, user_id, rating, body, conditions_note${riddenAt ? ', ridden_at' : ''})
        VALUES (gen_random_uuid(), '${routeId}', '${userId}', ${rating},
          '${reviewBody.replace(/'/g, "''")}',
          '${conditionsNote.replace(/'/g, "''")}'
          ${riddenAt ? `, '${riddenAt}'` : ''})
      `))
    }

    // Update avg_rating + review_count on route
    await db.execute(sql.raw(`
      UPDATE routes SET
        avg_rating   = (SELECT ROUND(AVG(rating)::numeric, 2) FROM route_reviews WHERE route_id = '${routeId}'),
        review_count = (SELECT COUNT(*) FROM route_reviews WHERE route_id = '${routeId}')
      WHERE id = '${routeId}'
    `))

    // Return the review with user info
    const newReview = await db.execute(sql.raw(`
      SELECT rr.id, rr.rating, rr.body, rr.conditions_note, rr.ridden_at, rr.created_at,
             u.name as user_name, u.avatar_url
      FROM route_reviews rr JOIN users u ON u.id = rr.user_id
      WHERE rr.route_id = '${routeId}' AND rr.user_id = '${userId}'
      LIMIT 1
    `))
    return NextResponse.json({ review: (newReview.rows as any[])[0] })
  } catch (e: any) {
    console.error('Review POST error:', e.message)
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 })
  }
}
