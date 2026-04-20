import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck

  const { id } = await params
  const body = await req.json().catch(() => ({})) as {
    title?: string | null
    altText?: string | null
    tags?: string[]
    rightsStatus?: string
    rightsNote?: string | null
  }

  const tags = Array.isArray(body.tags) ? body.tags.filter(t => typeof t === 'string').slice(0, 20) : null

  await db.execute(sql`
    UPDATE social_assets SET
      title         = COALESCE(${body.title ?? null},        title),
      alt_text      = COALESCE(${body.altText ?? null},      alt_text),
      tags          = COALESCE(${tags}::text[],              tags),
      rights_status = COALESCE(${body.rightsStatus ?? null}::social_asset_rights, rights_status),
      rights_note   = COALESCE(${body.rightsNote ?? null},   rights_note),
      updated_at    = NOW()
    WHERE id = ${id}::uuid
  `)
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck

  const { id } = await params
  await db.execute(sql`DELETE FROM social_assets WHERE id = ${id}::uuid`)
  return NextResponse.json({ ok: true })
}
