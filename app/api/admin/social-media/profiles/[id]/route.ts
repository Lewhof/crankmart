import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck

  const { id } = await params
  const body = await req.json().catch(() => ({})) as {
    handle?: string
    url?: string
    displayInFooter?: boolean
    isActive?: boolean
    sortOrder?: number
  }

  if (body.url) {
    try {
      const parsed = new URL(body.url)
      if (parsed.protocol !== 'https:') throw new Error('non-https')
    } catch {
      return NextResponse.json({ error: 'URL must be https://' }, { status: 400 })
    }
  }

  await db.execute(sql`
    UPDATE social_profiles SET
      handle            = COALESCE(${body.handle ?? null},            handle),
      url               = COALESCE(${body.url ?? null},               url),
      display_in_footer = COALESCE(${body.displayInFooter ?? null},   display_in_footer),
      is_active         = COALESCE(${body.isActive ?? null},          is_active),
      sort_order        = COALESCE(${body.sortOrder ?? null}::int,    sort_order),
      updated_at        = NOW()
    WHERE id = ${id}::uuid
  `)
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck

  const { id } = await params
  await db.execute(sql`DELETE FROM social_profiles WHERE id = ${id}::uuid`)
  return NextResponse.json({ ok: true })
}
