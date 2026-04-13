import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { getAdminCountry, isSuperadminSession } from '@/lib/admin-country'

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdminApi()
    if (adminCheck instanceof NextResponse) return adminCheck
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const adminOnly = searchParams.get('adminOnly') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const offset = (page - 1) * limit

    const country = await getAdminCountry()
    const seeAll = isSuperadminSession(adminCheck.session) && searchParams.get('all') === '1'
    const countryFilter = seeAll ? sql`` : sql` AND u.country = ${country}`
    const adminFilter = adminOnly ? sql` AND u.role IN ('admin','superadmin')` : sql``
    const searchFilter = search ? sql` AND (u.name ILIKE ${'%' + search + '%'} OR u.email ILIKE ${'%' + search + '%'})` : sql``

    const result = await db.execute(
      sql`
        SELECT
          u.id, u.name, u.email, u.avatar_url, u.created_at, u.role, u.status,
          COUNT(DISTINCT l.id) as listing_count
        FROM users u
        LEFT JOIN listings l ON u.id = l.seller_id
        WHERE 1=1
        ${countryFilter}
        ${adminFilter}
        ${searchFilter}
        GROUP BY u.id
        ORDER BY u.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
    )

    const users = result.rows || []

    const countResult = await db.execute(
      sql`
        SELECT COUNT(DISTINCT u.id) as count
        FROM users u
        WHERE 1=1
        ${countryFilter}
        ${adminFilter}
        ${searchFilter}
      `,
    )

    const totalCount = parseInt((countResult.rows?.[0] as any)?.count || '0')
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
    })
  } catch (error: any) {
    console.error('Users error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
