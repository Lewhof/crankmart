import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { checkAdminApi } from '@/lib/admin'
import { getAdminCountry, isSuperadminSession } from '@/lib/admin-country'

interface Row {
  id: string
  email: string
  country: string
  referrer: string | null
  created_at: string
}

function escapeCsvCell(v: unknown): string {
  if (v == null) return ''
  const s = String(v)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export async function GET(request: NextRequest) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check

  const params = request.nextUrl.searchParams
  const format = params.get('format') || 'json'
  const seeAll = isSuperadminSession(check.session) && params.get('all') === '1'
  const page   = Math.max(1, parseInt(params.get('page') || '1'))
  const limit  = Math.min(500, Math.max(1, parseInt(params.get('limit') || '50')))
  const offset = (page - 1) * limit

  try {
    const country = await getAdminCountry()
    const countryCond = seeAll ? sql`` : sql` AND country = ${country}`

    const [listRes, countRes, countryCountsRes] = await Promise.all([
      db.execute(sql`
        SELECT id::text, email, country, referrer, created_at
        FROM waitlist
        WHERE 1=1 ${countryCond}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `),
      db.execute(sql`
        SELECT COUNT(*)::int AS total FROM waitlist WHERE 1=1 ${countryCond}
      `),
      db.execute(sql`
        SELECT country, COUNT(*)::int AS total
        FROM waitlist GROUP BY country ORDER BY total DESC
      `),
    ])

    const rows = (listRes.rows ?? listRes) as unknown as Row[]
    const total = Number(((countRes.rows ?? countRes) as Array<{ total: number }>)[0]?.total ?? 0)
    const countryCounts = (countryCountsRes.rows ?? countryCountsRes) as Array<{ country: string; total: number }>

    if (format === 'csv') {
      const header = 'email,country,referrer,created_at'
      const body = rows.map(r => [r.email, r.country, r.referrer, r.created_at].map(escapeCsvCell).join(',')).join('\n')
      const filename = `crankmart-waitlist-${new Date().toISOString().slice(0, 10)}.csv`
      return new NextResponse(`${header}\n${body}\n`, {
        status: 200,
        headers: {
          'Content-Type':        'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control':       'private, no-store',
        },
      })
    }

    return NextResponse.json({
      rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      countryCounts,
    })
  } catch (e) {
    console.error('Admin waitlist GET error:', e)
    return NextResponse.json({ error: 'Failed to fetch waitlist' }, { status: 500 })
  }
}
