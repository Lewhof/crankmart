import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { checkAdminApi } from '@/lib/admin'
import { getAdminCountry, isSuperadminSession } from '@/lib/admin-country'

export async function GET(request: NextRequest) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check

  const statusParam = request.nextUrl.searchParams.get('status') || 'pending'
  const search      = request.nextUrl.searchParams.get('search') || ''
  const all         = request.nextUrl.searchParams.get('all') === '1'
  const page        = Math.max(1, parseInt(request.nextUrl.searchParams.get('page') || '1'))
  const limit       = 50
  const offset      = (page - 1) * limit

  const seeAll = all && isSuperadminSession((check as { session: unknown }).session)

  // Tabs map to moderation_status except 'upcoming', which means approved + future.
  const modStatus =
    statusParam === 'pending'  ? 'pending'  :
    statusParam === 'rejected' ? 'rejected' :
    statusParam === 'upcoming' ? 'approved' : null

  try {
    const country = await getAdminCountry()
    const countryCond = seeAll ? sql`` : sql` AND country = ${country}`
    const modCond     = modStatus ? sql` AND moderation_status = ${modStatus}` : sql``
    const lifecycleCond = statusParam === 'upcoming' ? sql` AND start_date >= NOW()` : sql``
    const searchCond = search
      ? sql` AND (title ILIKE ${'%' + search + '%'} OR city ILIKE ${'%' + search + '%'} OR organiser_name ILIKE ${'%' + search + '%'})`
      : sql``

    const countResult = await db.execute(sql`
      SELECT COUNT(*)::int AS total FROM events
      WHERE 1=1 ${countryCond} ${modCond} ${lifecycleCond} ${searchCond}
    `)
    const countRows = Array.isArray(countResult.rows) ? countResult.rows : (Array.isArray(countResult) ? countResult : [])
    const total = Number((countRows[0] as { total?: number })?.total ?? 0)

    const result = await db.execute(sql`
      SELECT id, title, slug, event_type, city, province,
             start_date AS event_date_start,
             end_date   AS event_date_end,
             entry_fee, distance,
             organiser_name,
             website_url AS organiser_website,
             moderation_status AS status, is_featured,
             views_count, created_at
      FROM events
      WHERE 1=1 ${countryCond} ${modCond} ${lifecycleCond} ${searchCond}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `)

    const rows = Array.isArray(result.rows) ? result.rows : (Array.isArray(result) ? result : [])

    return NextResponse.json({
      events: rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Admin events GET error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: 'Failed to fetch', detail: msg }, { status: 500 })
  }
}
