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
    SELECT id, name, body_markdown, category, created_at
    FROM canned_responses
    WHERE country = ${country}
    ORDER BY name ASC
  `)
  return NextResponse.json({ responses: (res.rows ?? res) as Array<Record<string, unknown>> })
}

export async function POST(req: NextRequest) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check
  const country = await getAdminCountry()
  const session = (check as { session: { user?: { id?: string } } }).session

  let body: { name?: string; bodyMarkdown?: string; category?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }
  if (!body.name?.trim() || !body.bodyMarkdown?.trim()) {
    return NextResponse.json({ error: 'name + bodyMarkdown required' }, { status: 400 })
  }

  const res = await db.execute(sql`
    INSERT INTO canned_responses (country, name, body_markdown, category, created_by)
    VALUES (${country}, ${body.name.trim()}, ${body.bodyMarkdown}, ${body.category ?? null}, ${session.user?.id}::uuid)
    ON CONFLICT (country, name) DO UPDATE SET
      body_markdown = EXCLUDED.body_markdown,
      category = EXCLUDED.category,
      updated_at = NOW()
    RETURNING id
  `)
  return NextResponse.json({ ok: true, id: ((res.rows ?? res) as Array<{ id: string }>)[0]?.id })
}
