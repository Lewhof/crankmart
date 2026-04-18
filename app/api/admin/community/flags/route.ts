import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { checkAdminApi } from '@/lib/admin'

const PAGE_SIZE = 25

export async function GET(req: NextRequest) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? 'pending'
  const pageNum = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const offset = (pageNum - 1) * PAGE_SIZE

  const [rowsRes, countRes, tabsRes] = await Promise.all([
    db.execute(sql`
      SELECT
        f.id, f.target_type, f.target_id, f.reason, f.notes, f.status,
        f.created_at, f.reviewed_at,
        u.email  AS reporter_email,
        u.handle AS reporter_handle,
        u.name   AS reporter_name
      FROM content_flags f
      LEFT JOIN users u ON u.id = f.reporter_id
      WHERE f.status = ${status}
      ORDER BY f.created_at DESC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `),
    db.execute(sql`SELECT COUNT(*)::int AS total FROM content_flags WHERE status = ${status}`),
    db.execute(sql`SELECT status, COUNT(*)::int AS c FROM content_flags GROUP BY status`),
  ])

  const rows = (rowsRes.rows ?? rowsRes) as Array<Record<string, unknown>>
  const total = ((countRes.rows ?? countRes) as Array<{ total: number }>)[0]?.total ?? 0
  const tabs = ((tabsRes.rows ?? tabsRes) as Array<{ status: string; c: number }>)
    .reduce<Record<string, number>>((acc, r) => { acc[r.status] = r.c; return acc }, {})

  return NextResponse.json({
    flags: rows,
    pagination: {
      totalCount: total,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      page: pageNum,
    },
    counts: {
      pending:   tabs.pending   ?? 0,
      resolved:  tabs.resolved  ?? 0,
      dismissed: tabs.dismissed ?? 0,
    },
  })
}
