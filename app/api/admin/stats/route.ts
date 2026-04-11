import { NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

interface CountResult {
  count: number | string;
}

export async function GET() {
  try {
    const adminCheck = await checkAdminApi()
    if (adminCheck instanceof NextResponse) return adminCheck
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
      // Total listings (all statuses)
      db.execute(sql.raw(`SELECT COUNT(*) as count FROM listings`)),
      // Active listings
      db.execute(sql.raw(`SELECT COUNT(*) as count FROM listings WHERE status = 'active'`)),
      // Total users
      db.execute(sql.raw(`SELECT COUNT(*) as count FROM users`)),
      // New users this week
      db.execute(
        sql.raw(`SELECT COUNT(*) as count FROM users WHERE created_at >= NOW() - INTERVAL '7 days'`),
      ),
      // Total events
      db.execute(sql.raw(`SELECT COUNT(*) as count FROM events`)),
      // Total businesses
      db.execute(sql.raw(`SELECT COUNT(*) as count FROM businesses`)),
      // Total messages
      db.execute(sql.raw(`SELECT COUNT(*) as count FROM messages`)),
      // Pending moderation listings
      db.execute(
        sql.raw(
          `SELECT COUNT(*) as count FROM listings WHERE moderation_status = 'pending'`,
        ),
      ),
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
