import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { getAdminCountry, isSuperadminSession } from '@/lib/admin-country'

interface CountResult {
  count: number | string;
}

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdminApi()
    if (adminCheck instanceof NextResponse) return adminCheck
    const country = await getAdminCountry()
    const seeAll = isSuperadminSession(adminCheck.session) && request.nextUrl.searchParams.get('all') === '1'
    const c = seeAll ? sql`` : sql` AND country = ${country}`
    const cu = seeAll ? sql`` : sql` AND u.country = ${country}`

    // Get all stats in parallel
    const [
      totalListingsResult,
      activeListingsResult,
      totalUsersResult,
      newUsersResult,
      totalEventsResult,
      totalBusinessesResult,
      totalMessagesResult,
      pendingListingsResult,
    ] = await Promise.all([
      db.execute(sql`SELECT COUNT(*) as count FROM listings WHERE 1=1 ${c}`),
      db.execute(sql`SELECT COUNT(*) as count FROM listings WHERE status = 'active' ${c}`),
      db.execute(sql`SELECT COUNT(*) as count FROM users WHERE 1=1 ${c}`),
      db.execute(sql`SELECT COUNT(*) as count FROM users WHERE created_at >= NOW() - INTERVAL '7 days' ${c}`),
      db.execute(sql`SELECT COUNT(*) as count FROM events WHERE 1=1 ${c}`),
      db.execute(sql`SELECT COUNT(*) as count FROM businesses WHERE 1=1 ${c}`),
      // messages — joined to listings for country scope
      db.execute(sql`
        SELECT COUNT(m.*) as count FROM messages m
        JOIN conversations conv ON conv.id = m.conversation_id
        JOIN listings l ON l.id = conv.listing_id
        WHERE 1=1 ${seeAll ? sql`` : sql` AND l.country = ${country}`}
      `),
      db.execute(sql`SELECT COUNT(*) as count FROM listings WHERE moderation_status = 'pending' ${c}`),
    ])

    const stats = {
      totalListings: parseInt(((totalListingsResult.rows?.[0] as unknown as CountResult | undefined)?.count || '0').toString()),
      activeListings: parseInt(((activeListingsResult.rows?.[0] as unknown as CountResult | undefined)?.count || '0').toString()),
      totalUsers: parseInt(((totalUsersResult.rows?.[0] as unknown as CountResult | undefined)?.count || '0').toString()),
      newUsersThisWeek: parseInt(((newUsersResult.rows?.[0] as unknown as CountResult | undefined)?.count || '0').toString()),
      totalEvents: parseInt(((totalEventsResult.rows?.[0] as unknown as CountResult | undefined)?.count || '0').toString()),
      totalBusinesses: parseInt(((totalBusinessesResult.rows?.[0] as unknown as CountResult | undefined)?.count || '0').toString()),
      totalMessages: parseInt(((totalMessagesResult.rows?.[0] as unknown as CountResult | undefined)?.count || '0').toString()),
      pendingModeration: parseInt(((pendingListingsResult.rows?.[0] as unknown as CountResult | undefined)?.count || '0').toString()),
    }

    return NextResponse.json(stats)
  } catch (error: unknown) {
    console.error('Stats error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
