import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

export async function GET() {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck

  const rows = await db.execute(sql`
    SELECT id, type, name, description, duration_days, price_cents, is_active, display_order, created_at
    FROM boost_packages
    ORDER BY display_order ASC, id ASC
  `)
  return NextResponse.json(rows.rows ?? rows)
}

export async function POST(req: NextRequest) {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck

  const body = await req.json() as {
    type: string; name: string; description?: string
    duration_days?: number | null; price_cents: number
    is_active?: boolean; display_order?: number
  }

  if (!body.type || !body.name || !body.price_cents) {
    return NextResponse.json({ error: 'type, name and price_cents are required' }, { status: 400 })
  }

  const result = await db.execute(sql`
    INSERT INTO boost_packages (type, name, description, duration_days, price_cents, is_active, display_order)
    VALUES (
      ${body.type}, ${body.name}, ${body.description ?? null},
      ${body.duration_days ?? null}, ${body.price_cents},
      ${body.is_active ?? true}, ${body.display_order ?? 99}
    )
    RETURNING *
  `)

  const rows = (result.rows ?? result) as Record<string, unknown>[]
  return NextResponse.json(rows[0], { status: 201 })
}
