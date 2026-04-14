import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { whiteboardItems } from '@/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { checkAdminApi } from '@/lib/admin'
import { getAdminCountry, isSuperadminSession } from '@/lib/admin-country'

export async function GET(request: NextRequest) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check

  const country = await getAdminCountry()
  const seeAll = isSuperadminSession((check as any).session) && request.nextUrl.searchParams.get('all') === '1'
  const countryCond = seeAll ? undefined : eq(whiteboardItems.country, country)

  // Priority rank for sort: urgent=4 ... low=1
  const priorityRank = sql`CASE ${whiteboardItems.priority}
    WHEN 'urgent' THEN 4
    WHEN 'high' THEN 3
    WHEN 'medium' THEN 2
    WHEN 'low' THEN 1
  END`

  const rows = countryCond
    ? await db.select().from(whiteboardItems).where(countryCond).orderBy(desc(priorityRank), desc(whiteboardItems.createdAt))
    : await db.select().from(whiteboardItems).orderBy(desc(priorityRank), desc(whiteboardItems.createdAt))

  return NextResponse.json({ items: rows })
}

export async function POST(request: NextRequest) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check

  const country = await getAdminCountry()
  const body = await request.json()

  const title = String(body.title ?? '').trim().slice(0, 200)
  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })

  try {
    const [row] = await db.insert(whiteboardItems).values({
      country,
      title,
      description: body.description || null,
      priority: body.priority || 'medium',
      status: body.status || 'backlog',
      effort: body.effort || null,
      categories: Array.isArray(body.categories) ? body.categories : [],
      sourceUrl: body.sourceUrl || null,
      owner: body.owner || null,
    }).returning()
    return NextResponse.json({ item: row }, { status: 201 })
  } catch (err: any) {
    if (err?.code === '23505') {
      return NextResponse.json({ error: 'An item with this title already exists in this country' }, { status: 409 })
    }
    console.error('Whiteboard POST error:', err)
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}
