import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/db'
import { listings } from '@/db/schema'
import { eq } from 'drizzle-orm'

const ParamSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    const paramValidation = ParamSchema.safeParse({ slug })
    if (!paramValidation.success) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
    }
    const userId = session.user.id
    const { slug: validatedSlug } = paramValidation.data

    // Fetch listing by slug (not ID)
    const [listing] = await db.select().from(listings)
      .where(eq(listings.slug, validatedSlug))
      .limit(1)

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Check ownership
    if (listing.sellerId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Renew: set expires_at to 30 days from now, mark as active, clear email flag
    const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    await db.update(listings)
      .set({
        expiresAt: newExpiresAt,
        renewalEmailSent: false,
        status: 'active',
      })
      .where(eq(listings.id, listing.id))

    return NextResponse.json({
      ok: true,
      expiresAt: newExpiresAt.toISOString(),
    })
  } catch (error) {
    console.error('Renew listing error:', error)
    return NextResponse.json({ error: 'Failed to renew listing' }, { status: 500 })
  }
}
