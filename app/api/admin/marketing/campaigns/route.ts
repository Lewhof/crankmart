import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { checkAdminApi } from '@/lib/admin'
import { getAdminCountry } from '@/lib/admin-country'

const PAGE_SIZE = 25

export async function GET(req: NextRequest) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check
  const country = await getAdminCountry()

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? 'all'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const offset = (page - 1) * PAGE_SIZE

  const statusClause = status !== 'all' ? sql`AND c.status = ${status}` : sql``

  const [rowsRes, countRes] = await Promise.all([
    db.execute(sql`
      SELECT c.id, c.name, c.status, c.scheduled_at, c.sent_at, c.stats, c.created_at,
             t.name AS template_name, s.name AS segment_name, l.name AS list_name
      FROM campaigns c
      LEFT JOIN email_templates t ON t.id = c.template_id
      LEFT JOIN segments s ON s.id = c.segment_id
      LEFT JOIN contact_lists l ON l.id = c.contact_list_id
      WHERE c.country = ${country} ${statusClause}
      ORDER BY COALESCE(c.scheduled_at, c.created_at) DESC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `),
    db.execute(sql`
      SELECT COUNT(*)::int AS total FROM campaigns c
      WHERE c.country = ${country} ${statusClause}
    `),
  ])

  return NextResponse.json({
    campaigns: (rowsRes.rows ?? rowsRes) as Array<Record<string, unknown>>,
    total: ((countRes.rows ?? countRes) as Array<{ total: number }>)[0]?.total ?? 0,
    page,
    pageSize: PAGE_SIZE,
  })
}

export async function POST(req: NextRequest) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check
  const country = await getAdminCountry()
  const session = (check as { session: { user?: { id?: string } } }).session

  let body: {
    name?: string
    templateId?: string
    segmentId?: string
    contactListId?: string
    scheduledAt?: string | null
  }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

  if (!body.name?.trim() || !body.templateId) {
    return NextResponse.json({ error: 'Name + template required' }, { status: 400 })
  }
  if (!body.segmentId && !body.contactListId) {
    return NextResponse.json({ error: 'Pick a segment or a contact list' }, { status: 400 })
  }

  const res = await db.execute(sql`
    INSERT INTO campaigns (country, name, template_id, segment_id, contact_list_id, scheduled_at, created_by, status)
    VALUES (
      ${country}, ${body.name.trim()}, ${body.templateId}::uuid,
      ${body.segmentId ? sql`${body.segmentId}::uuid` : sql`NULL`},
      ${body.contactListId ? sql`${body.contactListId}::uuid` : sql`NULL`},
      ${body.scheduledAt ?? null}::timestamp,
      ${session.user?.id}::uuid,
      ${body.scheduledAt ? 'scheduled' : 'draft'}
    )
    RETURNING id
  `)
  const id = ((res.rows ?? res) as Array<{ id: string }>)[0]?.id
  return NextResponse.json({ ok: true, id })
}
