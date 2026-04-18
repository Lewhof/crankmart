import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { checkAdminApi } from '@/lib/admin'
import { getAdminCountry } from '@/lib/admin-country'

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check
  const country = await getAdminCountry()
  const { id } = await params

  // Guard that the list belongs to the admin's country.
  const owns = await db.execute(sql`
    SELECT 1 FROM contact_lists WHERE id = ${id}::uuid AND country = ${country} LIMIT 1
  `)
  if (((owns.rows ?? owns) as unknown[]).length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const res = await db.execute(sql`
    SELECT m.id, m.email, m.added_at,
           u.id AS user_id, u.name AS user_name, u.handle AS user_handle
    FROM contact_list_members m
    LEFT JOIN users u ON u.id = m.user_id
    WHERE m.list_id = ${id}::uuid
    ORDER BY m.added_at DESC
    LIMIT 500
  `)
  return NextResponse.json({ members: (res.rows ?? res) as Array<Record<string, unknown>> })
}

export async function POST(req: NextRequest, { params }: Params) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check
  const country = await getAdminCountry()
  const { id } = await params

  let body: { emails?: string[]; userIds?: string[] }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

  const owns = await db.execute(sql`
    SELECT 1 FROM contact_lists WHERE id = ${id}::uuid AND country = ${country} LIMIT 1
  `)
  if (((owns.rows ?? owns) as unknown[]).length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  let added = 0
  for (const email of (body.emails ?? [])) {
    const clean = email.trim().toLowerCase()
    if (!clean.includes('@')) continue
    const r = await db.execute(sql`
      INSERT INTO contact_list_members (list_id, email)
      VALUES (${id}::uuid, ${clean})
      ON CONFLICT DO NOTHING
      RETURNING id
    `)
    if (((r.rows ?? r) as unknown[]).length > 0) added++
  }
  for (const userId of (body.userIds ?? [])) {
    const r = await db.execute(sql`
      INSERT INTO contact_list_members (list_id, user_id)
      VALUES (${id}::uuid, ${userId}::uuid)
      ON CONFLICT DO NOTHING
      RETURNING id
    `)
    if (((r.rows ?? r) as unknown[]).length > 0) added++
  }
  return NextResponse.json({ ok: true, added })
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check
  const country = await getAdminCountry()
  const { id } = await params

  const { searchParams } = new URL(req.url)
  const memberId = searchParams.get('memberId')
  if (!memberId) return NextResponse.json({ error: 'memberId required' }, { status: 400 })

  await db.execute(sql`
    DELETE FROM contact_list_members m
    USING contact_lists l
    WHERE m.id = ${memberId}::uuid
      AND m.list_id = l.id
      AND l.country = ${country}
  `)
  return NextResponse.json({ ok: true })
}
