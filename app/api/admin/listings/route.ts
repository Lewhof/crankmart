import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { getAdminCountry, isSuperadminSession } from '@/lib/admin-country'

interface ListingRow {
  id: string;
  title: string;
  slug: string;
  price: number;
  status: string;
  moderation_status: string;
  created_at: string;
  category_id: string;
  seller_name: string;
  thumb_url: string | null;
}

interface CountRow {
  count: number | string;
}

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdminApi()
    if (adminCheck instanceof NextResponse) return adminCheck
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || 'all'
    const moderation = searchParams.get('moderation') || 'all'
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const offset = (page - 1) * limit

    const country = await getAdminCountry()
    const seeAll = isSuperadminSession(adminCheck.session) && searchParams.get('all') === '1'
    const countryFilter = seeAll ? sql`` : sql` AND l.country = ${country}`

    // Build query using parameterized sql template to prevent injection
    const statusFilter = status !== 'all' ? sql` AND l.status = ${status}` : sql``
    const moderationFilter = moderation !== 'all' ? sql` AND l.moderation_status = ${moderation}` : sql``
    const searchFilter = search ? sql` AND (l.title ILIKE ${'%' + search + '%'} OR u.name ILIKE ${'%' + search + '%'})` : sql``

    const result = await db.execute(
      sql`
        SELECT
          l.id, l.title, l.slug, l.price, l.status, l.moderation_status,
          l.created_at, l.category_id, u.name as seller_name,
          (SELECT image_url FROM listing_images WHERE listing_id = l.id LIMIT 1) as thumb_url
        FROM listings l
        JOIN users u ON l.seller_id = u.id
        WHERE 1=1
        ${countryFilter}
        ${statusFilter}
        ${moderationFilter}
        ${searchFilter}
        ORDER BY l.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
    )

    const listings = (result.rows || []) as unknown as ListingRow[]

    const countResult = await db.execute(
      sql`
        SELECT COUNT(*) as count FROM listings l
        JOIN users u ON l.seller_id = u.id
        WHERE 1=1
        ${countryFilter}
        ${statusFilter}
        ${moderationFilter}
        ${searchFilter}
      `,
    )

    const totalCount = parseInt(((countResult.rows?.[0] as unknown as CountRow | undefined)?.count || '0').toString())
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
    })
  } catch (error: unknown) {
    console.error('Listings error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
