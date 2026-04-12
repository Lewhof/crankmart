import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { events } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const event = await db
      .select()
      .from(events)
      .where(eq(events.slug, slug))
      .limit(1)

    if (!event || event.length === 0) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Increment views count
    await db
      .update(events)
      .set({ viewsCount: (event[0].viewsCount || 0) + 1 })
      .where(eq(events.id, event[0].id))

    return NextResponse.json(event[0])
  } catch (error) {
    console.error('Event detail API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}
