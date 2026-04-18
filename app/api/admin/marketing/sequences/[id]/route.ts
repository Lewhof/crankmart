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

  const [seqRes, stepsRes] = await Promise.all([
    db.execute(sql`
      SELECT * FROM sequences WHERE id = ${id}::uuid AND country = ${country} LIMIT 1
    `),
    db.execute(sql`
      SELECT s.id, s.step_order, s.delay_hours, s.template_id,
             t.name AS template_name, t.subject AS template_subject
      FROM sequence_steps s
      LEFT JOIN email_templates t ON t.id = s.template_id
      WHERE s.sequence_id = ${id}::uuid
      ORDER BY s.step_order
    `),
  ])
  const seq = ((seqRes.rows ?? seqRes) as Array<Record<string, unknown>>)[0]
  if (!seq) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    sequence: seq,
    steps: (stepsRes.rows ?? stepsRes) as Array<Record<string, unknown>>,
  })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check
  const country = await getAdminCountry()
  const { id } = await params

  let body: { status?: 'draft' | 'active' | 'paused' | 'archived' }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

  if (body.status) {
    await db.execute(sql`
      UPDATE sequences SET status = ${body.status}, updated_at = NOW()
      WHERE id = ${id}::uuid AND country = ${country}
    `)
  }
  return NextResponse.json({ ok: true })
}
