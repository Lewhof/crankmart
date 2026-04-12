import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/db'
import { listingSaves, listings } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

const SaveListingSchema = z.object({
  listingId: z.string().uuid('Invalid listing ID format'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const validation = SaveListingSchema.safeParse(data)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request payload', details: validation.error }, { status: 400 })
    }
    const { listingId } = validation.data

    const userId = session.user.id

    // Check if already saved
    const existing = await db.select().from(listingSaves)
      .where(
        and(
          eq(listingSaves.userId, userId),
          eq(listingSaves.listingId, listingId)
        )
      )
      .limit(1)

    if (existing.length > 0) {
      // Already saved — toggle OFF: delete
      await db.delete(listingSaves)
        .where(
          and(
            eq(listingSaves.userId, userId),
            eq(listingSaves.listingId, listingId)
          )
        )
      return NextResponse.json({ saved: false })
    } else {
      // Not saved — toggle ON: insert
      await db.insert(listingSaves).values({
        userId,
        listingId,
      })
      return NextResponse.json({ saved: true })
    }
  } catch (error) {
    console.error('Save listing error:', error)
    return NextResponse.json({ error: 'Failed to save listing' }, { status: 500 })
  }
}
