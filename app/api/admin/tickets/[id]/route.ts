import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { checkAdminApi } from '@/lib/admin'
import { getAdminCountry } from '@/lib/admin-country'

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check
  const country = await getAdminCountry()
  const { id } = await params

  const [ticketRes, msgRes, tagsRes] = await Promise.all([
    db.execute(sql`
      SELECT t.*, u.name AS assigned_name, u.email AS assigned_email
      FROM tickets t LEFT JOIN users u ON u.id = t.assigned_admin_id
      WHERE t.id = ${id}::uuid AND t.country = ${country}
      LIMIT 1
    `),
    db.execute(sql`
      SELECT m.id, m.author_type, m.author_id, m.direction, m.body_html, m.body_text,
             m.email_message_id, m.email_in_reply_to, m.created_at,
             u.name AS author_name, u.handle AS author_handle, u.avatar_url AS author_avatar
      FROM ticket_messages m
      LEFT JOIN users u ON u.id = m.author_id
      WHERE m.ticket_id = ${id}::uuid
      ORDER BY m.created_at ASC
    `),
    db.execute(sql`SELECT tag FROM ticket_tags WHERE ticket_id = ${id}::uuid ORDER BY tag`),
  ])

  const ticket = ((ticketRes.rows ?? ticketRes) as Array<Record<string, unknown>>)[0]
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    ticket,
    messages: (msgRes.rows ?? msgRes) as Array<Record<string, unknown>>,
    tags: ((tagsRes.rows ?? tagsRes) as Array<{ tag: string }>).map(r => r.tag),
  })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check
  const country = await getAdminCountry()
  const { id } = await params

  let body: {
    status?: 'todo' | 'snoozed' | 'done'
    priority?: 'urgent' | 'high' | 'normal' | 'low'
    assignToMe?: boolean
    unassign?: boolean
    snoozedUntil?: string | null
    addTag?: string
    removeTag?: string
    category?: string | null
  }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

  const session = (check as { session: { user?: { id?: string } } }).session
  const adminId = session.user?.id

  // Simple field updates
  const sets: ReturnType<typeof sql>[] = []
  if (body.status)   sets.push(sql`status = ${body.status}`)
  if (body.priority) sets.push(sql`priority = ${body.priority}`)
  if (body.category !== undefined) sets.push(sql`category = ${body.category}`)
  if (body.assignToMe && adminId) sets.push(sql`assigned_admin_id = ${adminId}::uuid`)
  if (body.unassign) sets.push(sql`assigned_admin_id = NULL`)
  if (body.snoozedUntil !== undefined) {
    sets.push(body.snoozedUntil
      ? sql`snoozed_until = ${body.snoozedUntil}::timestamp, status = 'snoozed'`
      : sql`snoozed_until = NULL`)
  }
  if (body.status === 'done') sets.push(sql`resolved_at = COALESCE(resolved_at, NOW())`)

  if (sets.length > 0) {
    sets.push(sql`updated_at = NOW()`)
    const setClause = sets.reduce<ReturnType<typeof sql>>(
      (acc, s, i) => i === 0 ? s : sql`${acc}, ${s}`,
      sql``,
    )
    await db.execute(sql`
      UPDATE tickets SET ${setClause}
      WHERE id = ${id}::uuid AND country = ${country}
    `)
  }

  if (body.addTag) {
    await db.execute(sql`
      INSERT INTO ticket_tags (ticket_id, tag)
      VALUES (${id}::uuid, ${body.addTag.trim().toLowerCase()})
      ON CONFLICT DO NOTHING
    `)
  }
  if (body.removeTag) {
    await db.execute(sql`
      DELETE FROM ticket_tags
      WHERE ticket_id = ${id}::uuid AND tag = ${body.removeTag.trim().toLowerCase()}
    `)
  }

  return NextResponse.json({ ok: true })
}
