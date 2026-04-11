import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdminApi()
    if (adminCheck instanceof NextResponse) return adminCheck
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const typeFilter = searchParams.get('type') || 'all'
    const limit = 20
    const offset = (page - 1) * limit

    const result = await db.execute(
      typeFilter !== 'all'
        ? sql`
            SELECT
              id, name, logo_url, cover_url, business_type, province, city, is_verified,
              is_premium, views_count, created_at
            FROM businesses
            WHERE business_type = ${typeFilter}
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `
        : sql`
            SELECT
              id, name, logo_url, cover_url, business_type, province, city, is_verified,
              is_premium, views_count, created_at
            FROM businesses
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `,
    )

    const businesses = result.rows.map((row: any) => ({
      ...row,
      cover: row.cover_url || null,
    })) || []

    const countResult = await db.execute(
      typeFilter !== 'all'
        ? sql`SELECT COUNT(*) as count FROM businesses WHERE business_type = ${typeFilter}`
        : sql`SELECT COUNT(*) as count FROM businesses`,
    )
    const totalCount = parseInt((countResult.rows?.[0] as any)?.count || '0')
    const totalPages = Math.ceil(totalCount / limit)

    // Type counts for tab badges
    const typeCounts = await db.execute(sql`
      SELECT business_type, COUNT(*) as count FROM businesses GROUP BY business_type
    `)
    const counts: Record<string, number> = { all: totalCount }
    ;(typeCounts.rows as any[]).forEach((r: any) => { counts[r.business_type] = parseInt(r.count) })
    if (typeFilter === 'all') counts.all = (typeCounts.rows as any[]).reduce((s: number, r: any) => s + parseInt(r.count), 0)

    return NextResponse.json({
      businesses,
      counts,
      pagination: { page, limit, totalCount, totalPages },
    })
  } catch (error: any) {
    console.error('Directory error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
