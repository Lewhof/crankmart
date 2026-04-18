import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { checkAdminApi } from '@/lib/admin'

interface Params { params: Promise<{ id: string }> }

/**
 * PATCH /api/admin/community/members/[id]
 * Body: { action: 'ban' | 'unban', reason?: string }
 *
 * Banning sets is_active=false + banned_at; unbanning clears both. The
 * user's content stays in place unless separately removed.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check

  const { id } = await params
  let body: { action?: string; reason?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (body.action === 'ban') {
    await db.execute(sql`
      UPDATE users
      SET is_active = false, banned_at = NOW(), ban_reason = ${body.reason ?? null}, updated_at = NOW()
      WHERE id = ${id}::uuid
    `)
    return NextResponse.json({ ok: true })
  }
  if (body.action === 'unban') {
    await db.execute(sql`
      UPDATE users
      SET is_active = true, banned_at = NULL, ban_reason = NULL, updated_at = NOW()
      WHERE id = ${id}::uuid
    `)
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
