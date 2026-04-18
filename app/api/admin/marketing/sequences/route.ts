import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { checkAdminApi } from '@/lib/admin'
import { getAdminCountry } from '@/lib/admin-country'

export async function GET() {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check
  const country = await getAdminCountry()

  const res = await db.execute(sql`
    SELECT s.id, s.name, s.description, s.trigger_type, s.status, s.created_at,
           (SELECT COUNT(*)::int FROM sequence_steps st WHERE st.sequence_id = s.id) AS step_count,
           (SELECT COUNT(*)::int FROM sequence_enrollments e WHERE e.sequence_id = s.id AND e.completed_at IS NULL AND e.cancelled_at IS NULL) AS active_enrollments
    FROM sequences s
    WHERE s.country = ${country}
    ORDER BY s.created_at DESC
  `)
  return NextResponse.json({ sequences: (res.rows ?? res) as Array<Record<string, unknown>> })
}

export async function POST(req: NextRequest) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check
  const country = await getAdminCountry()
  const session = (check as { session: { user?: { id?: string } } }).session

  let body: {
    name?: string
    description?: string
    triggerType?: string
    steps?: Array<{ templateId: string; delayHours: number }>
  }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }
  if (!body.name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  if (!body.steps || body.steps.length === 0) return NextResponse.json({ error: 'At least one step required' }, { status: 400 })

  try {
    const seqRes = await db.execute(sql`
      INSERT INTO sequences (country, name, description, trigger_type, created_by)
      VALUES (${country}, ${body.name.trim()}, ${body.description ?? null},
              ${body.triggerType ?? 'manual'}, ${session.user?.id}::uuid)
      RETURNING id
    `)
    const seqId = ((seqRes.rows ?? seqRes) as Array<{ id: string }>)[0].id

    for (let i = 0; i < body.steps.length; i++) {
      const s = body.steps[i]
      await db.execute(sql`
        INSERT INTO sequence_steps (sequence_id, step_order, template_id, delay_hours)
        VALUES (${seqId}::uuid, ${i}, ${s.templateId}::uuid, ${s.delayHours})
      `)
    }

    return NextResponse.json({ ok: true, id: seqId })
  } catch (e) {
    const msg = (e as Error).message
    if (msg.includes('unique')) return NextResponse.json({ error: 'Name already exists' }, { status: 409 })
    throw e
  }
}
