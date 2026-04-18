import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { checkAdminApi } from '@/lib/admin'
import { getAdminCountry, isSuperadminSession } from '@/lib/admin-country'

const PAGE_SIZE = 25

export async function GET(req: NextRequest) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? 'pending'
  const pageNum = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const offset = (pageNum - 1) * PAGE_SIZE
  const all = searchParams.get('all') === '1'
  const seeAll = all && isSuperadminSession((check as { session: unknown }).session)
  const country = await getAdminCountry()

  // Country scope: superadmins with ?all=1 see everything, others see their country.
  const countryClause = seeAll ? sql`TRUE` : sql`country = ${country}`

  const validStatuses = ['pending', 'approved', 'rejected', 'recovered']
  const dbStatus = validStatuses.includes(status) ? status : 'pending'

  const [rowsRes, countRes, tabsRes] = await Promise.all([
    db.execute(sql`
      SELECT
        sr.id, sr.serial_number, sr.brand, sr.model, sr.year, sr.colour,
        sr.source, sr.external_id, sr.status, sr.saps_case_no,
        sr.stolen_date, sr.stolen_location, sr.proof_photo_url, sr.notes,
        sr.country, sr.created_at, sr.reviewed_at,
        u.email AS reporter_email, u.name AS reporter_name
      FROM stolen_reports sr
      LEFT JOIN users u ON u.id = sr.reporter_user_id
      WHERE ${countryClause} AND sr.status = ${dbStatus}
      ORDER BY sr.created_at DESC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `),
    db.execute(sql`
      SELECT COUNT(*)::int AS total FROM stolen_reports
      WHERE ${countryClause} AND status = ${dbStatus}
    `),
    db.execute(sql`
      SELECT status, COUNT(*)::int AS c FROM stolen_reports
      WHERE ${countryClause}
      GROUP BY status
    `),
  ])

  const rows = (rowsRes.rows ?? rowsRes) as Array<Record<string, unknown>>
  const totalRow = ((countRes.rows ?? countRes) as Array<{ total: number }>)[0]
  const total = totalRow?.total ?? 0
  const tabs = ((tabsRes.rows ?? tabsRes) as Array<{ status: string; c: number }>)
    .reduce<Record<string, number>>((acc, r) => { acc[r.status] = r.c; return acc }, {})

  return NextResponse.json({
    reports: rows,
    pagination: {
      totalCount: total,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      page: pageNum,
    },
    counts: {
      pending:   tabs.pending   ?? 0,
      approved:  tabs.approved  ?? 0,
      rejected:  tabs.rejected  ?? 0,
      recovered: tabs.recovered ?? 0,
    },
  })
}
