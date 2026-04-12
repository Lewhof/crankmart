import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { boosts, listings } from '@/db/schema'
import { eq, and, lt, isNotNull } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const expired = await db.select().from(boosts).where(
    and(eq(boosts.status, 'active'), isNotNull(boosts.expiresAt), lt(boosts.expiresAt, now))
  )

  let count = 0
  for (const boost of expired) {
    await db.update(boosts).set({ status: 'expired', updatedAt: now }).where(eq(boosts.id, boost.id))

    if (boost.listingId) {
      const stillActive = await db.select({ id: boosts.id }).from(boosts)
        .where(and(eq(boosts.listingId, boost.listingId), eq(boosts.status, 'active'))).limit(1)

      if (!stillActive.length) {
        await db.update(listings).set({
          isFeatured: false, featuredExpiresAt: null,
          boostEnabled: false, boostExpiresAt: null, updatedAt: now,
        }).where(eq(listings.id, boost.listingId))
      }
    }
    count++
  }

  return NextResponse.json({ expired: count, at: now.toISOString() })
}
