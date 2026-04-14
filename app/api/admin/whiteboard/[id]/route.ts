import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { whiteboardItems } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { checkAdminApi } from '@/lib/admin'
import { getAdminCountry, isSuperadminSession } from '@/lib/admin-country'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check

  const { id } = await params
  const country = await getAdminCountry()
  const seeAll = isSuperadminSession((check as any).session) && request.nextUrl.searchParams.get('all') === '1'
  const where = seeAll ? eq(whiteboardItems.id, id) : and(eq(whiteboardItems.id, id), eq(whiteboardItems.country, country))

  const body = await request.json()
  const update: Record<string, unknown> = { updatedAt: new Date() }
  if (body.title !== undefined) update.title = String(body.title).trim().slice(0, 200)
  if (body.description !== undefined) update.description = body.description || null
  if (body.priority !== undefined) update.priority = body.priority
  if (body.status !== undefined) update.status = body.status
  if (body.effort !== undefined) update.effort = body.effort || null
  if (body.categories !== undefined) update.categories = Array.isArray(body.categories) ? body.categories : []
  if (body.sourceUrl !== undefined) update.sourceUrl = body.sourceUrl || null
  if (body.owner !== undefined) update.owner = body.owner || null

  try {
    const [row] = await db.update(whiteboardItems).set(update).where(where).returning()
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ item: row })
  } catch (err: any) {
    if (err?.code === '23505') {
      return NextResponse.json({ error: 'Another item already has this title' }, { status: 409 })
    }
    console.error('Whiteboard PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check

  // Superadmin-only delete (per Q5a)
  if (!isSuperadminSession((check as any).session)) {
    return NextResponse.json({ error: 'Superadmin only' }, { status: 403 })
  }

  const { id } = await params
  const [row] = await db.delete(whiteboardItems).where(eq(whiteboardItems.id, id)).returning({ id: whiteboardItems.id })
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
