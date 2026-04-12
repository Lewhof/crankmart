import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const province = searchParams.get('province')

    let query = `
      SELECT DISTINCT town
      FROM routes
      WHERE status = 'approved'
        AND town IS NOT NULL
        AND town != ''
    `
    if (province) {
      const p = province.replace(/'/g, "''")
      query += ` AND province ILIKE '%${p}%'`
    }
    query += ` ORDER BY town ASC`

    const result = await db.execute(sql.raw(query))
    const rows = result.rows ?? result
    const cities = (rows as { town: string }[]).map(r => r.town).filter(Boolean)

    return NextResponse.json({ cities })
  } catch (e: any) {
    console.error('Routes cities API error:', e?.message || String(e))
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 })
  }
}
