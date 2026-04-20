import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql, type SQL } from 'drizzle-orm'

type SessionShape = { session: { user?: { id?: string } } }

export async function GET(req: NextRequest) {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck

  const q      = req.nextUrl.searchParams.get('q')?.trim().slice(0, 200)
  const tag    = req.nextUrl.searchParams.get('tag')?.trim().slice(0, 80)
  const limit  = Math.min(Number(req.nextUrl.searchParams.get('limit') ?? 48), 200)
  const offset = Math.max(Number(req.nextUrl.searchParams.get('offset') ?? 0), 0)

  const where: SQL[] = [sql`TRUE`]
  if (q)   where.push(sql`(title ILIKE ${'%' + q + '%'} OR alt_text ILIKE ${'%' + q + '%'})`)
  if (tag) where.push(sql`${tag} = ANY(tags)`)
  const whereClause = sql.join(where, sql` AND `)

  const [page, total] = await Promise.all([
    db.execute(sql`
      SELECT id, url, thumb_url, mime, width, height, size_bytes, title, alt_text,
             tags, rights_status, rights_note, created_at
      FROM social_assets
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${limit}::int OFFSET ${offset}::int
    `),
    db.execute(sql`SELECT COUNT(*)::int AS count FROM social_assets WHERE ${whereClause}`),
  ])
  const rows = (page.rows ?? page) as Array<Record<string, unknown>>
  const countRow = ((total.rows ?? total) as Array<{ count: number }>)[0]
  return NextResponse.json({ assets: rows, count: countRow?.count ?? rows.length })
}

export async function POST(req: NextRequest) {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck
  const uid = (adminCheck as SessionShape).session.user?.id ?? null

  const body = await req.json().catch(() => ({})) as {
    url?: string
    thumbUrl?: string | null
    mime?: string | null
    width?: number | null
    height?: number | null
    sizeBytes?: number | null
    title?: string | null
    altText?: string | null
    tags?: string[]
    rightsStatus?: string
    rightsNote?: string | null
  }

  if (!body.url) return NextResponse.json({ error: 'url required' }, { status: 400 })
  try {
    const parsed = new URL(body.url)
    if (parsed.protocol !== 'https:') throw new Error('non-https')
  } catch {
    return NextResponse.json({ error: 'url must be https' }, { status: 400 })
  }

  const tags = Array.isArray(body.tags) ? body.tags.filter(t => typeof t === 'string').slice(0, 20) : []
  const rights = body.rightsStatus ?? 'owned'

  const result = await db.execute(sql`
    INSERT INTO social_assets (url, thumb_url, mime, width, height, size_bytes, title, alt_text, tags, rights_status, rights_note, uploaded_by)
    VALUES (
      ${body.url},
      ${body.thumbUrl ?? null},
      ${body.mime ?? null},
      ${body.width ?? null}::int,
      ${body.height ?? null}::int,
      ${body.sizeBytes ?? null}::int,
      ${body.title ?? null},
      ${body.altText ?? null},
      ${tags}::text[],
      ${rights}::social_asset_rights,
      ${body.rightsNote ?? null},
      ${uid}::uuid
    )
    RETURNING id, url, thumb_url, mime, width, height, size_bytes, title, alt_text, tags, rights_status, created_at
  `)
  const rows = (result.rows ?? result) as Array<Record<string, unknown>>
  return NextResponse.json({ asset: rows[0] })
}
