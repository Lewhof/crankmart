import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { getCountry } from '@/lib/country'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const country = await getCountry()

    const result = await db.execute(sql`
      SELECT r.*,
             COALESCE(
               (SELECT ROUND(AVG(rating)::numeric, 1) FROM route_reviews WHERE route_id = r.id),
               0
             ) as avg_rating,
             COALESCE(
               (SELECT COUNT(*) FROM route_reviews WHERE route_id = r.id),
               0
             ) as review_count
      FROM routes r
      WHERE r.slug = ${slug} AND r.country = ${country}
      LIMIT 1
    `)

    const rows = result.rows ?? result
    if (!rows || (rows as any[]).length === 0) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 })
    }

    const route = (rows as any[])[0]

    // Fetch loops
    const loopsResult = await db.execute(sql.raw(`
      SELECT * FROM route_loops
      WHERE route_id = '${route.id}'
      ORDER BY display_order ASC
    `))
    const loops = loopsResult.rows ?? loopsResult

    // Fetch reviews with user info
    const reviewsResult = await db.execute(sql.raw(`
      SELECT rr.*, u.name as user_name, u.avatar_url as user_avatar
      FROM route_reviews rr
      JOIN users u ON u.id = rr.user_id
      WHERE rr.route_id = '${route.id}'
      ORDER BY rr.created_at DESC
      LIMIT 10
    `))
    const reviews = reviewsResult.rows ?? reviewsResult

    // Fetch images
    const imagesResult = await db.execute(sql.raw(`
      SELECT id, url, thumb_url, medium_url, alt_text, is_primary, display_order
      FROM route_images
      WHERE route_id = '${route.id}'
      ORDER BY is_primary DESC, display_order ASC
      LIMIT 12
    `))
    const images = imagesResult.rows ?? imagesResult

    // Fetch nearby routes (same province, different slug, same country)
    const nearbyResult = await db.execute(sql`
      SELECT id, slug, name, discipline, difficulty, distance_km, elevation_m, town, hero_image_url
      FROM routes
      WHERE province = ${route.province} AND slug != ${slug} AND status = 'approved' AND country = ${country}
      ORDER BY is_featured DESC, created_at DESC
      LIMIT 3
    `)
    const nearby = nearbyResult.rows ?? nearbyResult

    return NextResponse.json({ route, images, loops, reviews, nearby })
  } catch (e: any) {
    console.error('Route detail API error:', e.message)
    return NextResponse.json({ error: 'Failed to fetch route' }, { status: 500 })
  }
}
