import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { checkAdminApi } from '@/lib/admin'

const PAGE_SIZE = 40

/**
 * GET /api/admin/community/members?q=&page=1
 *
 * Searches members by handle / name / email. Shows banned status so admins
 * can see who's been suspended without a separate tab.
 */
export async function GET(req: NextRequest) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check

  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') ?? '').trim()
  const pageNum = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const offset = (pageNum - 1) * PAGE_SIZE

  const qClause = q
    ? sql`WHERE (LOWER(handle) LIKE ${'%' + q.toLowerCase() + '%'}
              OR LOWER(name)  LIKE ${'%' + q.toLowerCase() + '%'}
              OR LOWER(email) LIKE ${'%' + q.toLowerCase() + '%'})`
    : sql``

  const [rowsRes, countRes] = await Promise.all([
    db.execute(sql`
      SELECT id, handle, name, email, role, is_active, banned_at, ban_reason,
             created_at,
             (SELECT COUNT(*)::int FROM comments WHERE user_id = users.id AND status = 'approved') AS comments_total,
             (SELECT COUNT(*)::int FROM listings WHERE seller_id = users.id AND status = 'active')  AS listings_active
      FROM users
      ${qClause}
      ORDER BY created_at DESC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `),
    db.execute(sql`SELECT COUNT(*)::int AS total FROM users ${qClause}`),
  ])

  const rows = (rowsRes.rows ?? rowsRes) as Array<Record<string, unknown>>
  const total = ((countRes.rows ?? countRes) as Array<{ total: number }>)[0]?.total ?? 0

  return NextResponse.json({
    members: rows,
    pagination: {
      totalCount: total,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      page: pageNum,
    },
  })
}
