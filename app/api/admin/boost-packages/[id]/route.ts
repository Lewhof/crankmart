import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck

  const { id } = await params
  const body = await req.json() as Record<string, unknown>

  const sets: string[] = []
  if (body.name        !== undefined) sets.push(`name = '${String(body.name).replace(/'/g, "''")}'`)
  if (body.description !== undefined) sets.push(`description = ${body.description ? `'${String(body.description).replace(/'/g, "''")}'` : 'NULL'}`)
  if (body.price_cents !== undefined) sets.push(`price_cents = ${Number(body.price_cents)}`)
  if (body.duration_days !== undefined) sets.push(`duration_days = ${body.duration_days === null ? 'NULL' : Number(body.duration_days)}`)
  if (body.is_active   !== undefined) sets.push(`is_active = ${body.is_active ? 'true' : 'false'}`)
  if (body.display_order !== undefined) sets.push(`display_order = ${Number(body.display_order)}`)

  if (!sets.length) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })

  const result = await db.execute(sql.raw(`
    UPDATE boost_packages SET ${sets.join(', ')} WHERE id = ${Number(id)} RETURNING *
  `))

  const rows = (result.rows ?? result) as Record<string, unknown>[]
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(rows[0])
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck

  const { id } = await params

  // Soft delete — just deactivate (preserve boost history)
  await db.execute(sql.raw(`UPDATE boost_packages SET is_active = false WHERE id = ${Number(id)}`))
  return NextResponse.json({ success: true })
}
