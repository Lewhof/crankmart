import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { checkAdminApi } from '@/lib/admin'
import { sendEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check

  const status  = request.nextUrl.searchParams.get('status') || 'pending'
  const search  = request.nextUrl.searchParams.get('search') || ''
  const page    = Math.max(1, parseInt(request.nextUrl.searchParams.get('page') || '1'))
  const limit   = 50
  const offset  = (page - 1) * limit

  try {
    const whereClause = status === 'all'
      ? `WHERE 1=1`
      : `WHERE status = '${status}'`

    const searchClause = search
      ? ` AND (title ILIKE '%${search.replace(/'/g, "''")}%' OR city ILIKE '%${search.replace(/'/g, "''")}%' OR organiser_name ILIKE '%${search.replace(/'/g, "''")}%')`
      : ''

    const countResult = await db.execute(sql.raw(
      `SELECT COUNT(*) as total FROM events ${whereClause}${searchClause}`
    ))
    const countRows = Array.isArray(countResult.rows) ? countResult.rows : (Array.isArray(countResult) ? countResult : [])
    const total = parseInt((countRows[0] as any)?.total ?? '0')

    const result = await db.execute(sql.raw(`
      SELECT id, title, slug, event_type, discipline, city, province,
             event_date_start, event_date_end, entry_fee, distance,
             organiser_name, organiser_website,
             status, is_featured, is_verified, views_count, entry_clicks, created_at
      FROM events
      ${whereClause}${searchClause}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `))

    const rows = Array.isArray(result.rows) ? result.rows : (Array.isArray(result) ? result : [])

    return NextResponse.json({
      events: rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Admin events GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check
  try {
    const { id, action } = await request.json()

    if (action === 'approve') {
      await db.execute(sql.raw(`UPDATE events SET status = 'pending_review' WHERE id = '${id}'`))
      // Notify organiser
      const result = await db.execute(sql.raw(`SELECT title, organiser_email, organiser_name, slug FROM events WHERE id = '${id}'`))
      const rows = Array.isArray(result.rows) ? result.rows : (Array.isArray(result) ? result : [])
      const event = rows[0] as any
      if (event?.organiser_email) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://crankmart.com'
        sendEmail({
          to: String(event.organiser_email),
          subject: `Your event is live on CrankMart: "${event.title}"`,
          html: `<div style="font-family:sans-serif;max-width:560px;margin:40px auto;background:#fff;border-radius:12px;border:1px solid #ebebeb;overflow:hidden"><div style="background:#0D1B2A;padding:24px 32px"><div style="color:#fff;font-size:20px;font-weight:800">🚲 CrankMart</div></div><div style="padding:32px"><h2 style="margin:0 0 12px">Your event is live!</h2><p style="color:#6b7280">Hi ${event.organiser_name || 'there'}, your event <strong>${event.title}</strong> has been approved and is now listed on CrankMart.</p><a href="${baseUrl}/events/${event.slug}" style="display:inline-block;margin-top:16px;background:#0D1B2A;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">View Event →</a></div></div>`
        })
      }
    } else if (action === 'reject') {
      await db.execute(sql.raw(`UPDATE events SET status = 'rejected' WHERE id = '${id}'`))
    } else if (action === 'feature') {
      await db.execute(sql.raw(`UPDATE events SET is_featured = NOT is_featured WHERE id = '${id}'`))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
