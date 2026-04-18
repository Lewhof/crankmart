import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { checkAdminApi } from '@/lib/admin'

interface Params { params: Promise<{ id: string }> }

/**
 * PATCH /api/admin/community/discussions/[id]
 * Body: { action: 'remove' | 'restore' }
 *
 * Hides/unhides a comment from public threads.
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
  if (body.action !== 'remove' && body.action !== 'restore') {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }
  const newStatus = body.action === 'remove' ? 'removed' : 'approved'
  await db.execute(sql`
    UPDATE comments SET status = ${newStatus}, updated_at = NOW()
    WHERE id = ${id}::uuid
  `)
  return NextResponse.json({ ok: true })
}
