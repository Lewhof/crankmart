import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { listings } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: listingId } = await params

    // Verify ownership
    const listing = await db
      .select({ sellerId: listings.sellerId })
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1)

    if (!listing.length) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing[0].sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Set featured until 7 days from now
    const featureUntil = new Date()
    featureUntil.setDate(featureUntil.getDate() + 7)

    await db
      .update(listings)
      .set({
        isFeatured: true,
        featuredExpiresAt: featureUntil,
        updatedAt: new Date(),
      })
      .where(eq(listings.id, listingId))

    return NextResponse.json({ featureUntil })
  } catch (error) {
    console.error('Boost error:', error)
    return NextResponse.json(
      { error: 'Failed to boost listing' },
      { status: 500 }
    )
  }
}
