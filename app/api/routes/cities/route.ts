import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql, SQL } from 'drizzle-orm'
import { getCountry } from '@/lib/country'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const province = searchParams.get('province')
    const country = await getCountry()

    const provinceFilter: SQL = province
      ? sql` AND province ILIKE ${'%' + province + '%'}`
      : sql``

    const result = await db.execute(sql`
      SELECT DISTINCT town
      FROM routes
      WHERE status = 'approved'
        AND country = ${country}
        AND town IS NOT NULL
        AND town != ''
        ${provinceFilter}
      ORDER BY town ASC
    `)
    const rows = result.rows ?? result
    const cities = (rows as { town: string }[]).map(r => r.town).filter(Boolean)

    return NextResponse.json({ cities })
  } catch (e: any) {
    console.error('Routes cities API error:', e?.message || String(e))
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 })
  }
}
