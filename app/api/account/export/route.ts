import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { limiters, clientKey, check, rateLimitHeaders } from '@/lib/ratelimit'

/**
 * POPIA/GDPR Data Subject Access Request — synchronous JSON export
 * of everything we hold linked to the signed-in user.
 *
 * Returns a `application/json` attachment the browser will download.
 * Synchronous is safe at current volumes; revisit with an async job
 * + signed S3 URL if per-user row counts grow into tens of thousands.
 */
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = await check(limiters.authWrite, clientKey(request, `export:${session.user.id}`))
  if (!rl.ok) {
    return NextResponse.json({ error: 'Too many export requests.' }, { status: 429, headers: rateLimitHeaders(rl) })
  }

  const userId = session.user.id

  try {
    const [userRes, listingsRes, savesRes, convRes, msgRes, reviewsRes] = await Promise.all([
      db.execute(sql`
        SELECT id, email, name, phone, avatar_url, role, kyc_status, province, city, bio,
               is_active, email_verified, country, created_at, updated_at, last_active_at
        FROM users WHERE id = ${userId}::uuid
      `),
      db.execute(sql`
        SELECT id, slug, title, description, price, condition, status, moderation_status,
               country, province, city, bike_make, bike_model, bike_year,
               views_count, saves_count, enquiry_count, created_at, updated_at, sold_at
        FROM listings WHERE seller_id = ${userId}::uuid
      `),
      db.execute(sql`
        SELECT listing_id, created_at FROM listing_saves WHERE user_id = ${userId}::uuid
      `),
      db.execute(sql`
        SELECT id, listing_id, buyer_id, seller_id, subject,
               buyer_unread_count, seller_unread_count, last_message_at, created_at
        FROM conversations WHERE buyer_id = ${userId}::uuid OR seller_id = ${userId}::uuid
      `),
      db.execute(sql`
        SELECT m.id, m.conversation_id, m.body, m.created_at
        FROM messages m
        JOIN conversations c ON c.id = m.conversation_id
        WHERE m.sender_id = ${userId}::uuid
           OR c.buyer_id = ${userId}::uuid
           OR c.seller_id = ${userId}::uuid
      `),
      db.execute(sql`
        SELECT id, route_id, rating, body, conditions_note, ridden_at, created_at
        FROM route_reviews WHERE user_id = ${userId}::uuid
      `).catch(() => ({ rows: [] })),
    ])

    const payload = {
      exportedAt: new Date().toISOString(),
      notice: 'This export contains all personal data CrankMart holds linked to your account, per POPIA / GDPR data subject access rights.',
      user:          (userRes.rows     ?? userRes)[0] ?? null,
      listings:      listingsRes.rows  ?? listingsRes,
      savedListings: savesRes.rows     ?? savesRes,
      conversations: convRes.rows      ?? convRes,
      messages:      msgRes.rows       ?? msgRes,
      routeReviews:  reviewsRes.rows   ?? reviewsRes,
    }

    const filename = `crankmart-data-export-${new Date().toISOString().slice(0, 10)}.json`
    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        'Content-Type':        'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control':       'private, no-store',
      },
    })
  } catch (e) {
    console.error('DSAR export error:', e)
    return NextResponse.json({ error: 'Failed to build export' }, { status: 500 })
  }
}
