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
  const status = searchParams.get('status') ?? 'todo'
  const priority = searchParams.get('priority') ?? 'all'
  const assigned = searchParams.get('assigned') ?? 'all' // all | me | unassigned
  const category = searchParams.get('category') ?? 'all'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const offset = (page - 1) * PAGE_SIZE

  const session = (check as { session: { user?: { id?: string } } }).session
  const adminId = session.user?.id

  const clauses: ReturnType<typeof sql>[] = [sql`t.country = ${country}`]
  if (status !== 'all') clauses.push(sql`t.status = ${status}`)
  if (priority !== 'all') clauses.push(sql`t.priority = ${priority}`)
  if (category !== 'all') clauses.push(sql`t.category = ${category}`)
  if (assigned === 'me' && adminId) clauses.push(sql`t.assigned_admin_id = ${adminId}::uuid`)
  if (assigned === 'unassigned') clauses.push(sql`t.assigned_admin_id IS NULL`)

  const where = clauses.reduce<ReturnType<typeof sql>>(
    (acc, c, i) => i === 0 ? c : sql`${acc} AND ${c}`,
    sql``,
  )

  const [rowsRes, countRes, tabsRes] = await Promise.all([
    db.execute(sql`
      SELECT
        t.id, t.subject, t.status, t.priority, t.category,
        t.requester_email, t.requester_name, t.assigned_admin_id,
        t.sla_due_at, t.created_at, t.updated_at, t.first_response_at,
        (t.sla_due_at < NOW() AND t.status <> 'done') AS is_overdue,
        (SELECT COUNT(*)::int FROM ticket_messages m WHERE m.ticket_id = t.id) AS msg_count,
        u.name AS assigned_name, u.email AS assigned_email
      FROM tickets t
      LEFT JOIN users u ON u.id = t.assigned_admin_id
      WHERE ${where}
      ORDER BY
        CASE t.priority WHEN 'urgent' THEN 4 WHEN 'high' THEN 3 WHEN 'normal' THEN 2 WHEN 'low' THEN 1 END DESC,
        t.sla_due_at ASC NULLS LAST,
        t.created_at DESC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `),
    db.execute(sql`SELECT COUNT(*)::int AS total FROM tickets t WHERE ${where}`),
    db.execute(sql`
      SELECT status, COUNT(*)::int AS c FROM tickets
      WHERE country = ${country}
      GROUP BY status
    `),
  ])

  const tabs = ((tabsRes.rows ?? tabsRes) as Array<{ status: string; c: number }>)
    .reduce<Record<string, number>>((acc, r) => { acc[r.status] = r.c; return acc }, {})

  return NextResponse.json({
    tickets: (rowsRes.rows ?? rowsRes) as Array<Record<string, unknown>>,
    total: ((countRes.rows ?? countRes) as Array<{ total: number }>)[0]?.total ?? 0,
    page,
    pageSize: PAGE_SIZE,
    counts: {
      todo:    tabs.todo    ?? 0,
      snoozed: tabs.snoozed ?? 0,
      done:    tabs.done    ?? 0,
    },
  })
}
