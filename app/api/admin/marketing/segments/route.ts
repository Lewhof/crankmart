import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { checkAdminApi } from '@/lib/admin'
import { getAdminCountry } from '@/lib/admin-country'
import { countSegment, type SegmentQuery } from '@/lib/segments'

export async function GET() {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check
  const country = await getAdminCountry()

  const res = await db.execute(sql`
    SELECT id, name, description, query_json, last_materialized_at, last_size, created_at
    FROM segments
    WHERE country = ${country}
    ORDER BY created_at DESC
  `)
  return NextResponse.json({
    segments: (res.rows ?? res) as Array<Record<string, unknown>>,
  })
}

export async function POST(req: NextRequest) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check
  const country = await getAdminCountry()
  const session = (check as { session: { user?: { id?: string } } }).session

  let body: { name?: string; description?: string; query?: SegmentQuery }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }
  if (!body.name?.trim() || !body.query) {
    return NextResponse.json({ error: 'Name + query required' }, { status: 400 })
  }

  // Materialise once to capture size for the admin UI without shipping a worker.
  const size = await countSegment(country, body.query)

  const res = await db.execute(sql`
    INSERT INTO segments (country, name, description, query_json, last_size, last_materialized_at, created_by)
    VALUES (
      ${country}, ${body.name.trim()}, ${body.description ?? null},
      ${JSON.stringify(body.query)}::jsonb,
      ${size}, NOW(),
      ${session.user?.id}::uuid
    )
    RETURNING id
  `)
  return NextResponse.json({
    ok: true,
    id: ((res.rows ?? res) as Array<{ id: string }>)[0]?.id,
    size,
  })
}
