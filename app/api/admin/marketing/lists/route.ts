import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { checkAdminApi } from '@/lib/admin'
import { getAdminCountry } from '@/lib/admin-country'

export async function GET() {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check
  const country = await getAdminCountry()

  const res = await db.execute(sql`
    SELECT l.id, l.name, l.description, l.created_at,
           (SELECT COUNT(*)::int FROM contact_list_members m WHERE m.list_id = l.id) AS member_count
    FROM contact_lists l
    WHERE l.country = ${country}
    ORDER BY l.created_at DESC
  `)
  return NextResponse.json({ lists: (res.rows ?? res) as Array<Record<string, unknown>> })
}

export async function POST(req: NextRequest) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check
  const country = await getAdminCountry()
  const session = (check as { session: { user?: { id?: string } } }).session

  let body: { name?: string; description?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }
  if (!body.name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  try {
    const res = await db.execute(sql`
      INSERT INTO contact_lists (country, name, description, created_by)
      VALUES (${country}, ${body.name.trim()}, ${body.description ?? null}, ${session.user?.id}::uuid)
      RETURNING id
    `)
    return NextResponse.json({
      ok: true,
      id: ((res.rows ?? res) as Array<{ id: string }>)[0]?.id,
    })
  } catch (e) {
    const msg = (e as Error).message
    if (msg.includes('unique')) {
      return NextResponse.json({ error: 'A list with that name already exists' }, { status: 409 })
    }
    throw e
  }
}
