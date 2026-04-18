import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { limiters, clientKey, check, rateLimitHeaders } from '@/lib/ratelimit'
import { isTargetType, sanitiseCommentBody } from '@/lib/community'
import { getCountry } from '@/lib/country'

export interface CommentRow {
  id: string
  parentId: string | null
  body: string
  createdAt: string
  editedAt: string | null
  user: {
    id: string
    handle: string | null
    name: string
    avatarUrl: string | null
  }
  reactionCount: number
  viewerHasReacted: boolean
}

const PAGE_SIZE = 30

/**
 * GET /api/community/comments?targetType=listing&targetId=<uuid>
 *
 * Lists approved comments for a target, top-level then their replies,
 * with reaction counts and a viewerHasReacted boolean (false when no session).
 */
export async function GET(req: NextRequest) {
  const targetType = req.nextUrl.searchParams.get('targetType') ?? ''
  const targetId = req.nextUrl.searchParams.get('targetId') ?? ''
  const cursor = req.nextUrl.searchParams.get('cursor') // ISO timestamp

  if (!isTargetType(targetType)) {
    return NextResponse.json({ error: 'Invalid target type' }, { status: 400 })
  }
  if (!targetId) {
    return NextResponse.json({ error: 'Missing target id' }, { status: 400 })
  }

  const session = await auth()
  const viewerId = session?.user?.id ?? null
  const country = await getCountry()

  const cursorClause = cursor
    ? sql`AND c.created_at < ${cursor}::timestamp`
    : sql``

  const res = await db.execute(sql`
    SELECT
      c.id, c.parent_id, c.body, c.created_at, c.edited_at,
      u.id AS user_id, u.handle, u.name, u.avatar_url,
      (SELECT COUNT(*)::int FROM comment_reactions r WHERE r.comment_id = c.id) AS reaction_count,
      ${viewerId
        ? sql`EXISTS(SELECT 1 FROM comment_reactions r WHERE r.comment_id = c.id AND r.user_id = ${viewerId}::uuid)`
        : sql`false`} AS viewer_has_reacted
    FROM comments c
    JOIN users u ON u.id = c.user_id
    WHERE c.country = ${country}
      AND c.target_type = ${targetType}
      AND c.target_id = ${targetId}::uuid
      AND c.status = 'approved'
      ${cursorClause}
    ORDER BY
      CASE WHEN c.parent_id IS NULL THEN c.created_at ELSE NULL END DESC NULLS LAST,
      c.parent_id NULLS FIRST,
      c.created_at ASC
    LIMIT ${PAGE_SIZE}
  `)

  const rows = (res.rows ?? res) as Array<{
    id: string
    parent_id: string | null
    body: string
    created_at: string
    edited_at: string | null
    user_id: string
    handle: string | null
    name: string
    avatar_url: string | null
    reaction_count: number
    viewer_has_reacted: boolean
  }>

  const comments: CommentRow[] = rows.map(r => ({
    id: r.id,
    parentId: r.parent_id,
    body: r.body,
    createdAt: r.created_at,
    editedAt: r.edited_at,
    user: {
      id: r.user_id,
      handle: r.handle,
      name: r.name,
      avatarUrl: r.avatar_url,
    },
    reactionCount: Number(r.reaction_count) || 0,
    viewerHasReacted: Boolean(r.viewer_has_reacted),
  }))

  return NextResponse.json({ comments, hasMore: comments.length === PAGE_SIZE })
}

/**
 * POST /api/community/comments
 * Body: { targetType, targetId, body, parentId? }
 *
 * Creates a new comment or single-level reply. Requires auth, rate-limited
 * per user. Returns the created comment in CommentRow shape.
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to comment.' }, { status: 401 })
  }

  const rl = await check(limiters.commentWrite, clientKey(req, `comment:${session.user.id}`))
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'You\'re posting too fast. Try again in a few minutes.' },
      { status: 429, headers: rateLimitHeaders(rl) },
    )
  }

  let body: { targetType?: string; targetId?: string; body?: string; parentId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.targetType || !isTargetType(body.targetType)) {
    return NextResponse.json({ error: 'Invalid target type' }, { status: 400 })
  }
  if (!body.targetId || !body.body) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  const text = sanitiseCommentBody(body.body)
  if (text.length < 2) {
    return NextResponse.json({ error: 'Comment is too short.' }, { status: 400 })
  }

  // Single-level threading: replies to replies collapse to the top-level parent.
  let effectiveParentId: string | null = null
  if (body.parentId) {
    const parentRes = await db.execute(sql`
      SELECT id, parent_id, target_type, target_id FROM comments
      WHERE id = ${body.parentId}::uuid AND status = 'approved'
      LIMIT 1
    `)
    const parent = ((parentRes.rows ?? parentRes) as Array<{
      id: string; parent_id: string | null; target_type: string; target_id: string
    }>)[0]
    if (!parent) {
      return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 })
    }
    if (parent.target_type !== body.targetType || parent.target_id !== body.targetId) {
      return NextResponse.json({ error: 'Parent target mismatch' }, { status: 400 })
    }
    effectiveParentId = parent.parent_id ?? parent.id
  }

  const country = await getCountry()
  const insertRes = await db.execute(sql`
    INSERT INTO comments (target_type, target_id, parent_id, user_id, body, country)
    VALUES (
      ${body.targetType},
      ${body.targetId}::uuid,
      ${effectiveParentId ? sql`${effectiveParentId}::uuid` : sql`NULL`},
      ${session.user.id}::uuid,
      ${text},
      ${country}
    )
    RETURNING id, created_at
  `)
  const created = ((insertRes.rows ?? insertRes) as Array<{ id: string; created_at: string }>)[0]

  // Hydrate author for the response so the client can render immediately.
  const authorRes = await db.execute(sql`
    SELECT id, handle, name, avatar_url FROM users WHERE id = ${session.user.id}::uuid LIMIT 1
  `)
  const author = ((authorRes.rows ?? authorRes) as Array<{
    id: string; handle: string | null; name: string; avatar_url: string | null
  }>)[0]

  const comment: CommentRow = {
    id: created.id,
    parentId: effectiveParentId,
    body: text,
    createdAt: created.created_at,
    editedAt: null,
    user: {
      id: author.id,
      handle: author.handle,
      name: author.name,
      avatarUrl: author.avatar_url,
    },
    reactionCount: 0,
    viewerHasReacted: false,
  }

  return NextResponse.json({ comment })
}
