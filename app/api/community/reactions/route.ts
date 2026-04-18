import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { limiters, clientKey, check, rateLimitHeaders } from '@/lib/ratelimit'

/**
 * POST   /api/community/reactions  — toggle a reaction (idempotent body shape)
 * Body: { commentId: string, reaction?: 'like' }
 *
 * Returns { reacted: boolean, count: number } so the caller can update local
 * state without a follow-up GET.
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to react.' }, { status: 401 })
  }

  const rl = await check(limiters.reactionToggle, clientKey(req, `react:${session.user.id}`))
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Too many reactions, slow down.' },
      { status: 429, headers: rateLimitHeaders(rl) },
    )
  }

  let body: { commentId?: string; reaction?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }
  if (!body.commentId) {
    return NextResponse.json({ error: 'Missing commentId' }, { status: 400 })
  }
  const reaction = body.reaction || 'like'

  // Existence check on the comment so we don't leave orphan FK errors
  // surfacing as opaque 500s.
  const exists = await db.execute(sql`
    SELECT 1 FROM comments WHERE id = ${body.commentId}::uuid AND status = 'approved' LIMIT 1
  `)
  if (((exists.rows ?? exists) as unknown[]).length === 0) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
  }

  // Toggle: delete-if-exists first, then re-insert the new state
  const had = await db.execute(sql`
    DELETE FROM comment_reactions
     WHERE comment_id = ${body.commentId}::uuid
       AND user_id    = ${session.user.id}::uuid
       AND reaction   = ${reaction}
    RETURNING comment_id
  `)
  const wasReacted = ((had.rows ?? had) as unknown[]).length > 0
  if (!wasReacted) {
    await db.execute(sql`
      INSERT INTO comment_reactions (comment_id, user_id, reaction)
      VALUES (${body.commentId}::uuid, ${session.user.id}::uuid, ${reaction})
      ON CONFLICT DO NOTHING
    `)
  }

  const countRes = await db.execute(sql`
    SELECT COUNT(*)::int AS c FROM comment_reactions WHERE comment_id = ${body.commentId}::uuid
  `)
  const count = ((countRes.rows ?? countRes) as Array<{ c: number }>)[0]?.c ?? 0

  return NextResponse.json({ reacted: !wasReacted, count })
}
