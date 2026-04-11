import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { boosts, boostPackages, listings } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { validateItnSignature, isPayfastIp } from '@/lib/payfast'
import { sql } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? ''
    if (!isPayfastIp(ip)) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const body = await req.text()
    const data: Record<string, string> = Object.fromEntries(new URLSearchParams(body).entries())

    if (!validateItnSignature(data, data.signature ?? '')) {
      return new NextResponse('Invalid signature', { status: 400 })
    }

    const boostId = data.custom_str1 || data.m_payment_id
    if (!boostId) return new NextResponse('Missing boost ID', { status: 400 })

    const [boost] = await db.select().from(boosts).where(eq(boosts.id, boostId)).limit(1)
    if (!boost) return new NextResponse('Not found', { status: 404 })
    if (boost.status === 'active') return new NextResponse('OK', { status: 200 })

    const paymentStatus = data.payment_status

    if (paymentStatus === 'COMPLETE') {
      const [pkg] = await db.select().from(boostPackages).where(eq(boostPackages.id, boost.packageId)).limit(1)
      const now = new Date()
      const expiresAt = pkg?.durationDays ? new Date(now.getTime() + pkg.durationDays * 86400 * 1000) : null

      await db.transaction(async (tx) => {
        await tx.update(boosts).set({
          status:            'active',
          payfastPaymentId:  data.pf_payment_id ?? null,
          payfastMPaymentId: data.m_payment_id ?? null,
          startsAt:          now,
          expiresAt,
          updatedAt:         now,
        }).where(eq(boosts.id, boostId))

        if (boost.listingId) {
          if (pkg?.type === 'bump') {
            await tx.update(listings).set({ updatedAt: now }).where(eq(listings.id, boost.listingId))
          } else {
            await tx.update(listings).set({
              isFeatured: true, featuredExpiresAt: expiresAt,
              boostEnabled: true, boostExpiresAt: expiresAt, updatedAt: now,
            }).where(eq(listings.id, boost.listingId))
          }
        }

        if (boost.directoryId) {
          await tx.execute(
            sql`UPDATE directory_businesses SET is_featured=true, featured_expires_at=${expiresAt?.toISOString() ?? null}, updated_at=NOW() WHERE id=${boost.directoryId}`
          )
        }
      })

    }

    if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
      await db.update(boosts).set({ status: 'failed', updatedAt: new Date() }).where(eq(boosts.id, boostId))
    }

    return new NextResponse('OK', { status: 200 })
  } catch (err) {
    return new NextResponse('Server error', { status: 500 })
  }
}
