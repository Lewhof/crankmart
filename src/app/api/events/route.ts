import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { events } from '@/db/schema'
import { asc, and, eq, ilike, gte, lte } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const province = searchParams.get('province')
    const month = searchParams.get('month')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const offset = (page - 1) * limit

    const filters = []

    // Status filter - only upcoming and ongoing
    filters.push(eq(events.status, 'upcoming' as any))

    // Type filter
    if (type) {
      filters.push(eq(events.eventType, type as any))
    }

    // Province filter
    if (province) {
      filters.push(eq(events.province, province))
    }

    // Month filter
    if (month) {
      const monthNum = parseInt(month)
      const currentYear = new Date().getFullYear()
      const startOfMonth = new Date(currentYear, monthNum - 1, 1)
      const endOfMonth = new Date(currentYear, monthNum, 0, 23, 59, 59)

      filters.push(gte(events.startDate, startOfMonth))
      filters.push(lte(events.startDate, endOfMonth))
    }

    // Search filter (title, city, organizer)
    if (search) {
      filters.push(
        ilike(events.title, `%${search}%`)
      )
    }

    // Build query with filters
    let query = db.select().from(events)
    if (filters.length > 0) {
      query = query.where(and(...filters)) as any
    }

    // Get featured events first, then others
    const allEvents = await (query as any)
      .orderBy(
        asc(events.isFeatured), // Featured first
        asc(events.startDate)   // Then by date
      )
      .limit(limit)
      .offset(offset)

    // Get total count for pagination
    const countResult = await db.select({ count: events.viewsCount }).from(events)
    const total = countResult.length

    return NextResponse.json({
      events: allEvents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Events API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}
