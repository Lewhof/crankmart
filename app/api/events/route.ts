import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type     = searchParams.get('type')
    const province = searchParams.get('province')
    const month    = searchParams.get('month')
    const search   = searchParams.get('search')
    const limit    = parseInt(searchParams.get('limit') || '200')
    const page     = parseInt(searchParams.get('page') || '1')
    const offset   = (page - 1) * limit

    const typeFilter     = type     ? sql` AND event_type = ${type}`                          : sql``
    const provinceFilter = province ? sql` AND province ILIKE ${'%' + province + '%'}`         : sql``
    const monthFilter    = month    ? sql` AND EXTRACT(MONTH FROM event_date_start) = ${parseInt(month)}` : sql``
    const searchFilter   = search   ? sql` AND (title ILIKE ${'%' + search + '%'} OR city ILIKE ${'%' + search + '%'})` : sql``

    const events = await db.execute(sql`
      SELECT id, title, slug, description, event_type, city, province, venue_name,
             event_date_start, event_date_end, entry_url, entry_status, is_featured,
             is_verified, cover_image_url, discipline, views_count, saves_count,
             entry_fee, distance, organiser_name, organiser_website
      FROM events
      WHERE status = 'upcoming'${typeFilter}${provinceFilter}${monthFilter}${searchFilter}
      ORDER BY is_featured DESC, event_date_start ASC
      LIMIT ${limit} OFFSET ${offset}
    `)

    return NextResponse.json(events.rows ?? events)
  } catch (e: any) {
    console.error('Events API error:', e.message)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
