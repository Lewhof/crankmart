import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { getCountry } from '@/lib/country'

const PAGE_SIZE = 24

/**
 * GET /api/community/stolen?status=approved&province=&brand=&page=1
 *
 * Public read of approved stolen reports. Mirrors /api/community/lost so
 * the registry pages can share their UI shape.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? 'approved'
  const province = searchParams.get('province') ?? ''
  const brand = searchParams.get('brand') ?? ''
  const pageNum = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const offset = (pageNum - 1) * PAGE_SIZE

  if (!['approved', 'recovered'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const country = await getCountry()
  const provinceClause = province ? sql`AND stolen_location ILIKE ${'%' + province + '%'}` : sql``
  const brandClause = brand ? sql`AND LOWER(brand) = LOWER(${brand})` : sql``

  const [rowsRes, countRes] = await Promise.all([
    db.execute(sql`
      SELECT
        id, serial_number, brand, model, year, colour,
        stolen_date, stolen_location, proof_photo_url, saps_case_no,
        notes, status, created_at
      FROM stolen_reports
      WHERE country = ${country} AND status = ${status}
        ${provinceClause}
        ${brandClause}
      ORDER BY created_at DESC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `),
    db.execute(sql`
      SELECT COUNT(*)::int AS total FROM stolen_reports
      WHERE country = ${country} AND status = ${status}
        ${provinceClause}
        ${brandClause}
    `),
  ])

  const rows = (rowsRes.rows ?? rowsRes) as Array<Record<string, unknown>>
  const total = ((countRes.rows ?? countRes) as Array<{ total: number }>)[0]?.total ?? 0

  return NextResponse.json({
    reports: rows,
    pagination: {
      totalCount: total,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      page: pageNum,
    },
  })
}
