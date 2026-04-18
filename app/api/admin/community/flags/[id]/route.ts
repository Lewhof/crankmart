import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { checkAdminApi } from '@/lib/admin'

interface Params { params: Promise<{ id: string }> }

/**
 * PATCH /api/admin/community/flags/[id]
 * Body: { action: 'resolve' | 'dismiss' | 'resolve-and-remove' }
 *
 * - resolve: mark flag resolved (content judged in violation but admin handled manually)
 * - dismiss: false flag
 * - resolve-and-remove: also soft-removes the underlying comment so it disappears
 *   from public threads; only valid when target_type = 'comment'
 */
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

  const action = body.action
  if (action !== 'resolve' && action !== 'dismiss' && action !== 'resolve-and-remove') {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }

  const session = (check as { session: { user?: { id?: string } } }).session
  const reviewerId = session?.user?.id ?? null

  const flagRes = await db.execute(sql`
    SELECT target_type, target_id FROM content_flags WHERE id = ${id}::uuid LIMIT 1
  `)
  const flag = ((flagRes.rows ?? flagRes) as Array<{ target_type: string; target_id: string }>)[0]
  if (!flag) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // If removing the comment, do it first so the flag update reflects final state.
  if (action === 'resolve-and-remove') {
    if (flag.target_type !== 'comment') {
      return NextResponse.json({ error: 'resolve-and-remove only valid for comments' }, { status: 400 })
    }
    await db.execute(sql`
      UPDATE comments SET status = 'removed', updated_at = NOW()
      WHERE id = ${flag.target_id}::uuid
    `)
  }

  const newStatus = action === 'dismiss' ? 'dismissed' : 'resolved'
  await db.execute(sql`
    UPDATE content_flags
       SET status = ${newStatus},
           reviewed_by = ${reviewerId ? sql`${reviewerId}::uuid` : sql`NULL`},
           reviewed_at = NOW()
     WHERE id = ${id}::uuid
  `)

  return NextResponse.json({ ok: true })
}
