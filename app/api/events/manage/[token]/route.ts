import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { events } from '@/db/schema'
import { eq } from 'drizzle-orm'

interface Params {
  params: Promise<{ token: string }>
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { token } = await params

  const [event] = await db
    .select({ id: events.id, editToken: events.editToken })
    .from(events)
    .where(eq(events.editToken, token))
    .limit(1)

  if (!event || !event.editToken) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }

  const body = await req.json()

  const {
    title, description, eventType, startDate, endDate,
    province, city, venue, distance, entryFee, entryUrl,
    websiteUrl, organiserName, organiserEmail, organiserPhone,
  } = body

  await db.update(events)
    .set({
      title:          title          || undefined,
      description:    description    || undefined,
      eventType:      eventType      || undefined,
      startDate:      startDate ? new Date(startDate) : undefined,
      endDate:        endDate   ? new Date(endDate)   : undefined,
      province:       province       || undefined,
      city:           city           || undefined,
      venue:          venue          || undefined,
      distance:       distance       || undefined,
      entryFee:       entryFee       || undefined,
      entryUrl:       entryUrl       || undefined,
      websiteUrl:     websiteUrl     || undefined,
      organiserName:  organiserName  || undefined,
      organiserEmail: organiserEmail || undefined,
      organiserPhone: organiserPhone || undefined,
      updatedAt:      new Date(),
    })
    .where(eq(events.id, event.id))

  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { token } = await params

  const [event] = await db
    .select({ id: events.id, editToken: events.editToken })
    .from(events)
    .where(eq(events.editToken, token))
    .limit(1)

  if (!event || !event.editToken) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }

  await db.update(events)
    .set({ status: 'cancelled', editToken: null, updatedAt: new Date() })
    .where(eq(events.id, event.id))

  return NextResponse.json({ success: true })
}
