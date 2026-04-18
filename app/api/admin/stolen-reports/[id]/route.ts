import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { checkAdminApi } from '@/lib/admin'
import { getAdminCountry, isSuperadminSession } from '@/lib/admin-country'

interface Params { params: Promise<{ id: string }> }

const VALID_ACTIONS = ['approve', 'reject', 'mark-recovered', 'mark-pending'] as const
type Action = typeof VALID_ACTIONS[number]

const ACTION_TO_STATUS: Record<Action, string> = {
  approve: 'approved',
  reject: 'rejected',
  'mark-recovered': 'recovered',
  'mark-pending': 'pending',
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check

  const { id } = await params
  let body: { action?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (!body.action || !VALID_ACTIONS.includes(body.action as Action)) {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }

  const newStatus = ACTION_TO_STATUS[body.action as Action]
  const session = (check as { session: { user?: { id?: string } } }).session
  const reviewerId = session?.user?.id ?? null
  const isSuperadmin = isSuperadminSession(session)
  const country = await getAdminCountry()

  // Country guard: non-superadmins can only act within their assigned country.
  const guard = isSuperadmin
    ? sql`TRUE`
    : sql`country = ${country}`

  const res = await db.execute(sql`
    UPDATE stolen_reports
       SET status = ${newStatus},
           reviewed_by = ${reviewerId}::uuid,
           reviewed_at = NOW(),
           updated_at = NOW()
     WHERE id = ${id}::uuid AND ${guard}
     RETURNING id, serial_number
  `)
  const updated = ((res.rows ?? res) as Array<{ id: string; serial_number: string }>)[0]
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Approving or recovering a report changes the public lookup outcome — bust cache.
  try {
    await db.execute(sql`
      DELETE FROM serial_lookup_cache WHERE cache_key LIKE ${'%:' + updated.serial_number}
    `)
  } catch {}

  return NextResponse.json({ ok: true, status: newStatus })
}
