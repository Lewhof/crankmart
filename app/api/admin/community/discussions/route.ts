import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { checkAdminApi } from '@/lib/admin'

const PAGE_SIZE = 50

export async function GET(req: NextRequest) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? 'approved'
  const targetType = searchParams.get('targetType') ?? 'all'
  const pageNum = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const offset = (pageNum - 1) * PAGE_SIZE

  const statusClause = ['approved', 'removed', 'flagged'].includes(status) ? sql`status = ${status}` : sql`status = 'approved'`
  const targetClause = targetType !== 'all' ? sql`AND target_type = ${targetType}` : sql``

  const [rowsRes, countRes] = await Promise.all([
    db.execute(sql`
      SELECT c.id, c.target_type, c.target_id, c.parent_id, c.status,
             c.body, c.created_at, c.edited_at,
             u.email, u.name, u.handle
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE ${statusClause} ${targetClause}
      ORDER BY c.created_at DESC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `),
    db.execute(sql`SELECT COUNT(*)::int AS total FROM comments WHERE ${statusClause} ${targetClause}`),
  ])

  const rows = (rowsRes.rows ?? rowsRes) as Array<Record<string, unknown>>
  const total = ((countRes.rows ?? countRes) as Array<{ total: number }>)[0]?.total ?? 0

  return NextResponse.json({
    comments: rows,
    pagination: {
      totalCount: total,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      page: pageNum,
    },
  })
}
