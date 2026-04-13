import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { listings } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { getCountry } from '@/lib/country'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: listingId } = await params
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

  

    const country = await getCountry()

    // Verify ownership and update (country-scoped)
    const listing = await db
      .select({ sellerId: listings.sellerId })
      .from(listings)
      .where(and(eq(listings.id, listingId), eq(listings.country, country)))
      .limit(1)

    if (!listing.length) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing[0].sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await db
      .update(listings)
      .set({
        status: 'sold',
        soldAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(listings.id, listingId), eq(listings.country, country)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mark sold error:', error)
    return NextResponse.json(
      { error: 'Failed to mark as sold' },
      { status: 500 }
    )
  }
}
