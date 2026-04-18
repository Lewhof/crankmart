import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

interface Params { params: Promise<{ handle: string }> }

/**
 * GET /api/u/[handle]
 *
 * Public profile payload. We expose just enough to render a profile card +
 * recent activity — never email, phone, or precise location. Province is
 * shown unconditionally; city only if the user opted in (profile_show_city).
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const { handle } = await params
  if (!handle || handle.length > 40) {
    return NextResponse.json({ error: 'Invalid handle' }, { status: 400 })
  }

  const userRes = await db.execute(sql`
    SELECT
      id, name, avatar_url, handle,
      profile_bio, profile_province,
      CASE WHEN profile_show_city THEN profile_city ELSE NULL END AS profile_city,
      role, created_at
    FROM users
    WHERE LOWER(handle) = LOWER(${handle})
      AND is_active = true AND banned_at IS NULL
    LIMIT 1
  `)
  const user = ((userRes.rows ?? userRes) as Array<{
    id: string
    name: string
    avatar_url: string | null
    handle: string
    profile_bio: string | null
    profile_province: string | null
    profile_city: string | null
    role: string
    created_at: string
  }>)[0]

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Activity counts + recent listings + recent comments. Single-roundtrip.
  const [countsRes, listingsRes, commentsRes] = await Promise.all([
    db.execute(sql`
      SELECT
        (SELECT COUNT(*)::int FROM listings WHERE seller_id = ${user.id}::uuid AND status = 'active') AS listings_active,
        (SELECT COUNT(*)::int FROM listings WHERE seller_id = ${user.id}::uuid AND status = 'sold')   AS listings_sold,
        (SELECT COUNT(*)::int FROM comments WHERE user_id  = ${user.id}::uuid AND status = 'approved') AS comments_total
    `),
    db.execute(sql`
      SELECT l.id, l.slug, l.title, l.price, l.created_at,
             (SELECT image_url FROM listing_images WHERE listing_id = l.id ORDER BY display_order ASC LIMIT 1) AS thumb
      FROM listings l
      WHERE l.seller_id = ${user.id}::uuid AND l.status = 'active' AND l.moderation_status = 'approved'
      ORDER BY l.created_at DESC
      LIMIT 6
    `),
    db.execute(sql`
      SELECT c.id, c.target_type, c.target_id, LEFT(c.body, 200) AS body, c.created_at
      FROM comments c
      WHERE c.user_id = ${user.id}::uuid AND c.status = 'approved'
      ORDER BY c.created_at DESC
      LIMIT 10
    `),
  ])

  const counts = ((countsRes.rows ?? countsRes) as Array<{
    listings_active: number
    listings_sold: number
    comments_total: number
  }>)[0] ?? { listings_active: 0, listings_sold: 0, comments_total: 0 }

  return NextResponse.json({
    handle: user.handle,
    name: user.name,
    avatarUrl: user.avatar_url,
    bio: user.profile_bio,
    province: user.profile_province,
    city: user.profile_city,
    role: user.role,
    memberSince: user.created_at,
    counts: {
      listingsActive: Number(counts.listings_active) || 0,
      listingsSold:   Number(counts.listings_sold) || 0,
      commentsTotal:  Number(counts.comments_total) || 0,
    },
    recentListings: (listingsRes.rows ?? listingsRes) as Array<unknown>,
    recentComments: (commentsRes.rows ?? commentsRes) as Array<unknown>,
  })
}
