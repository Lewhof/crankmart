import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { businesses } from '@/db/schema'
import { eq, and, isNotNull, count, sql } from 'drizzle-orm'
import { checkAdminApi } from '@/lib/admin'

const PAGE_SIZE = 20

export async function GET(req: NextRequest) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check

  const { searchParams } = new URL(req.url)
  const status   = searchParams.get('status') ?? 'pending'
  const type     = searchParams.get('type') ?? 'all'
  const pageNum  = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const offset   = (pageNum - 1) * PAGE_SIZE

  // Map tab key -> DB status filter
  const statusMap: Record<string, string | string[]> = {
    pending:   'pending',
    outreach:  'pending', // pending + outreach_sent_at not null
    claimed:   'claimed',
    suspended: 'suspended',
  }

  const dbStatus = statusMap[status] ?? 'pending'

  const conditions = []

  if (status === 'outreach') {
    conditions.push(eq(businesses.status, 'pending'), isNotNull(businesses.outreachSentAt))
  } else if (typeof dbStatus === 'string') {
    conditions.push(eq(businesses.status, dbStatus as 'pending' | 'verified' | 'suspended' | 'claimed' | 'removed'))
    if (status === 'pending') {
      // pending tab = pending status AND no outreach sent
      conditions.push(sql`${businesses.outreachSentAt} IS NULL`)
    }
  }

  if (type !== 'all') {
    conditions.push(eq(businesses.businessType, type as 'shop' | 'brand' | 'service_center' | 'tour_operator' | 'event_organiser'))
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [rows, [{ total }]] = await Promise.all([
    db.select({
      id:               businesses.id,
      name:             businesses.name,
      city:             businesses.city,
      province:         businesses.province,
      business_type:    businesses.businessType,
      status:           businesses.status,
      outreach_sent_at: businesses.outreachSentAt,
      claimed_at:       businesses.claimedAt,
      verified_at:      businesses.verifiedAt,
      created_at:       businesses.createdAt,
      email:            businesses.email,
      phone:            businesses.phone,
    })
      .from(businesses)
      .where(where)
      .orderBy(businesses.createdAt)
      .limit(PAGE_SIZE)
      .offset(offset),
    db.select({ total: count() }).from(businesses).where(where),
  ])

  // Tab counts
  const [pendingCount, outreachCount, claimedCount, suspendedCount] = await Promise.all([
    db.select({ c: count() }).from(businesses).where(and(eq(businesses.status, 'pending'), sql`${businesses.outreachSentAt} IS NULL`)),
    db.select({ c: count() }).from(businesses).where(and(eq(businesses.status, 'pending'), isNotNull(businesses.outreachSentAt))),
    db.select({ c: count() }).from(businesses).where(eq(businesses.status, 'claimed')),
    db.select({ c: count() }).from(businesses).where(eq(businesses.status, 'suspended')),
  ])

  return NextResponse.json({
    businesses: rows,
    pagination: {
      totalCount: Number(total),
      totalPages: Math.max(1, Math.ceil(Number(total) / PAGE_SIZE)),
      page: pageNum,
    },
    counts: {
      pending:   Number(pendingCount[0]?.c ?? 0),
      outreach:  Number(outreachCount[0]?.c ?? 0),
      claimed:   Number(claimedCount[0]?.c ?? 0),
      suspended: Number(suspendedCount[0]?.c ?? 0),
    },
  })
}
