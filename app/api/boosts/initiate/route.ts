import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/db'
import { boostPackages, listings, users } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { sql } from 'drizzle-orm'
import { getCountry } from '@/lib/country'
import { buildPayfastPayload, PAYFAST_CHECKOUT_URL, PAYFAST_MERCHANT_ID, PAYFAST_MERCHANT_KEY } from '@/lib/payfast'

const optUuid = z.union([z.string().uuid(), z.null()]).optional().transform(v => v ?? undefined)

const BoostInitiateSchema = z.object({
  packageId:   z.union([z.string(), z.number()]).transform(Number),
  listingId:   optUuid,
  directoryId: optUuid,
  eventId:     optUuid,
  routeId:     optUuid,
  newsId:      optUuid,
})

const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://crankmart.com'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const validation = BoostInitiateSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid request body', details: validation.error.issues }, { status: 400 })
  }

  const { packageId, listingId, directoryId, eventId, routeId, newsId } = validation.data
  const country = await getCountry()

  const [pkg] = await db.select().from(boostPackages).where(eq(boostPackages.id, packageId)).limit(1)
  if (!pkg || !pkg.isActive) return NextResponse.json({ error: 'Package not found' }, { status: 404 })

  // Verify ownership of the target (country-scoped)
  if (listingId) {
    const [listing] = await db.select({ sellerId: listings.sellerId }).from(listings).where(and(eq(listings.id, listingId), eq(listings.country, country))).limit(1)
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    if (listing.sellerId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Resolve human-readable target name for PayFast item_description (country-scoped)
  let targetName = 'CrankMart Boost'
  if (listingId) {
    const r = await db.execute(sql`SELECT title FROM listings WHERE id = ${listingId} AND country = ${country} LIMIT 1`)
    targetName = String(((r.rows ?? r) as Record<string,unknown>[])[0]?.title ?? targetName)
  } else if (directoryId) {
    const r = await db.execute(sql`SELECT name FROM businesses WHERE id = ${directoryId} AND country = ${country} LIMIT 1`)
    targetName = String(((r.rows ?? r) as Record<string,unknown>[])[0]?.name ?? targetName)
  } else if (eventId) {
    const r = await db.execute(sql`SELECT title FROM events WHERE id = ${eventId} AND country = ${country} LIMIT 1`)
    targetName = String(((r.rows ?? r) as Record<string,unknown>[])[0]?.title ?? targetName)
  } else if (routeId) {
    const r = await db.execute(sql`SELECT name FROM routes WHERE id = ${routeId} AND country = ${country} LIMIT 1`)
    targetName = String(((r.rows ?? r) as Record<string,unknown>[])[0]?.name ?? targetName)
  }

  const [user] = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, session.user.id)).limit(1)

  // Insert boost with all target columns
  const insertResult = await db.execute(sql`
    INSERT INTO boosts (
      user_id, package_id, listing_id, directory_id, event_id, route_id, news_id,
      status, amount_cents
    ) VALUES (
      ${session.user.id}, ${pkg.id},
      ${listingId   ?? null},
      ${directoryId ?? null},
      ${eventId     ?? null},
      ${routeId     ?? null},
      ${newsId      ?? null},
      'pending', ${pkg.priceCents}
    )
    RETURNING id
  `)

  const boostId = String(((insertResult.rows ?? insertResult) as Record<string,unknown>[])[0]?.id)
  const amountRand = (pkg.priceCents / 100).toFixed(2)
  const nameParts  = (user?.name ?? 'CrankMart User').split(' ')

  const rawFields: Record<string, string> = {
    merchant_id:      PAYFAST_MERCHANT_ID,
    merchant_key:     PAYFAST_MERCHANT_KEY,
    return_url:       `${BASE_URL}/boost/success?boost_id=${boostId}`,
    cancel_url:       `${BASE_URL}/boost/cancel?boost_id=${boostId}`,
    notify_url:       `${BASE_URL}/api/payments/payfast/itn`,
    name_first:       nameParts[0] ?? 'User',
    name_last:        nameParts.slice(1).join(' ') || 'Account',
    email_address:    user?.email ?? '',
    m_payment_id:     boostId,
    amount:           amountRand,
    item_name:        pkg.name,
    item_description: `${pkg.name} — ${targetName}`,
    custom_str1:      boostId,
  }

  const { fields, signature } = buildPayfastPayload(rawFields)

  return NextResponse.json({
    checkoutUrl: PAYFAST_CHECKOUT_URL,
    fields: { ...fields, signature },
    boostId,
  })
}
