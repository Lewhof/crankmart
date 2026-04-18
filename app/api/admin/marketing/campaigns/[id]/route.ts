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

  const res = await db.execute(sql`
    SELECT c.*, t.name AS template_name, s.name AS segment_name, l.name AS list_name
    FROM campaigns c
    LEFT JOIN email_templates t ON t.id = c.template_id
    LEFT JOIN segments s ON s.id = c.segment_id
    LEFT JOIN contact_lists l ON l.id = c.contact_list_id
    WHERE c.id = ${id}::uuid AND c.country = ${country}
    LIMIT 1
  `)
  const row = ((res.rows ?? res) as Array<Record<string, unknown>>)[0]
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(row)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check
  const country = await getAdminCountry()
  const { id } = await params

  let body: {
    action?: 'cancel' | 'reschedule'
    scheduledAt?: string | null
  }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

  if (body.action === 'cancel') {
    await db.execute(sql`
      UPDATE campaigns SET status = 'cancelled', updated_at = NOW()
      WHERE id = ${id}::uuid AND country = ${country} AND status IN ('draft','scheduled')
    `)
    return NextResponse.json({ ok: true })
  }
  if (body.action === 'reschedule') {
    if (!body.scheduledAt) return NextResponse.json({ error: 'scheduledAt required' }, { status: 400 })
    await db.execute(sql`
      UPDATE campaigns
      SET scheduled_at = ${body.scheduledAt}::timestamp,
          status = 'scheduled',
          updated_at = NOW()
      WHERE id = ${id}::uuid AND country = ${country} AND status IN ('draft','scheduled')
    `)
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check
  const country = await getAdminCountry()
  const { id } = await params

  // Only drafts are deletable; sent/scheduled must be cancelled so audit trail stays.
  const res = await db.execute(sql`
    DELETE FROM campaigns
    WHERE id = ${id}::uuid AND country = ${country} AND status = 'draft'
    RETURNING id
  `)
  const deleted = ((res.rows ?? res) as unknown[]).length > 0
  if (!deleted) return NextResponse.json({ error: 'Only drafts can be deleted' }, { status: 409 })
  return NextResponse.json({ ok: true })
}
