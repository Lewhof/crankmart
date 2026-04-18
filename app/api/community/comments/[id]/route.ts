import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { sanitiseCommentBody } from '@/lib/community'

interface Params { params: Promise<{ id: string }> }

/**
 * PATCH /api/community/comments/[id]
 * Body: { body: string }
 *
 * Owner-only edit. Sets edited_at so the UI can show "edited".
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to edit comments.' }, { status: 401 })
  }

  const { id } = await params
  let body: { body?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  if (!body.body) {
    return NextResponse.json({ error: 'Missing body' }, { status: 400 })
  }
  const text = sanitiseCommentBody(body.body)
  if (text.length < 2) {
    return NextResponse.json({ error: 'Comment is too short.' }, { status: 400 })
  }

  const res = await db.execute(sql`
    UPDATE comments
       SET body = ${text}, edited_at = NOW(), updated_at = NOW()
     WHERE id = ${id}::uuid AND user_id = ${session.user.id}::uuid AND status = 'approved'
     RETURNING id
  `)
  const updated = ((res.rows ?? res) as Array<{ id: string }>)[0]
  if (!updated) {
    return NextResponse.json({ error: 'Comment not found or not yours' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}

/**
 * DELETE /api/community/comments/[id]
 * Owner OR admin can soft-delete. We mark status='removed' rather than hard
 * delete so reply chains stay coherent (replies survive with their threading).
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const role = (session.user as { role?: string }).role
  const isAdmin = role === 'admin' || role === 'superadmin'

  const guard = isAdmin
    ? sql`TRUE`
    : sql`user_id = ${session.user.id}::uuid`

  const res = await db.execute(sql`
    UPDATE comments
       SET status = 'removed', updated_at = NOW()
     WHERE id = ${id}::uuid AND ${guard}
     RETURNING id
  `)
  const updated = ((res.rows ?? res) as Array<{ id: string }>)[0]
  if (!updated) {
    return NextResponse.json({ error: 'Comment not found or not yours' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
