import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql, type SQL } from 'drizzle-orm'
import { PLATFORM_META, type SocialPlatform } from '@/lib/social'

type SessionShape = { session: { user?: { id?: string } } }
const VALID_PLATFORMS = Object.keys(PLATFORM_META) as SocialPlatform[]
const VALID_STATUS = ['draft', 'scheduled', 'published', 'failed', 'archived'] as const
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(req: NextRequest) {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck

  const status  = req.nextUrl.searchParams.get('status')
  const country = req.nextUrl.searchParams.get('country') ?? 'za'
  const from    = req.nextUrl.searchParams.get('from') // ISO date for calendar window
  const to      = req.nextUrl.searchParams.get('to')
  const limit   = Math.min(Number(req.nextUrl.searchParams.get('limit') ?? 100), 500)

  const where: SQL[] = [sql`country = ${country}`]
  if (status && (VALID_STATUS as readonly string[]).includes(status)) {
    where.push(sql`status = ${status}::social_post_status`)
  }
  if (from) where.push(sql`COALESCE(scheduled_at, created_at) >= ${from}::timestamptz`)
  if (to)   where.push(sql`COALESCE(scheduled_at, created_at) <= ${to}::timestamptz`)

  const whereClause = sql.join(where, sql` AND `)

  const result = await db.execute(sql`
    SELECT p.id, p.country, p.status, p.platforms, p.title, p.body, p.asset_ids,
           p.linked_listing_id, p.linked_event_id, p.linked_route_id, p.linked_business_id,
           p.utm_campaign, p.scheduled_at, p.published_at, p.error_log, p.created_at, p.updated_at,
           u.name AS author_name
    FROM social_posts p
    LEFT JOIN users u ON u.id = p.author_id
    WHERE ${whereClause}
    ORDER BY COALESCE(p.scheduled_at, p.created_at) DESC
    LIMIT ${limit}::int
  `)
  const rows = (result.rows ?? result) as Array<Record<string, unknown>>
  return NextResponse.json({ posts: rows })
}

export async function POST(req: NextRequest) {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck
  const uid = (adminCheck as SessionShape).session.user?.id ?? null

  const body = await req.json().catch(() => ({})) as {
    country?: string
    status?: string
    platforms?: string[]
    title?: string | null
    body?: string
    assetIds?: string[]
    linkedListingId?: string | null
    linkedEventId?: string | null
    linkedRouteId?: string | null
    linkedBusinessId?: string | null
    utmCampaign?: string | null
    scheduledAt?: string | null
  }

  const country   = (body.country || 'za').toLowerCase().slice(0, 2)
  const status    = (body.status && (VALID_STATUS as readonly string[]).includes(body.status)) ? body.status : 'draft'
  const platforms = Array.isArray(body.platforms)
    ? body.platforms.filter((p): p is SocialPlatform => VALID_PLATFORMS.includes(p as SocialPlatform))
    : []
  const assetIds  = Array.isArray(body.assetIds)
    ? body.assetIds.filter((a): a is string => typeof a === 'string' && UUID_RE.test(a)).slice(0, 10)
    : []
  if (Array.isArray(body.assetIds) && body.assetIds.length > 0 && assetIds.length === 0) {
    return NextResponse.json({ error: 'assetIds contains invalid UUIDs' }, { status: 400 })
  }

  const result = await db.execute(sql`
    INSERT INTO social_posts (
      author_id, country, status, platforms, title, body, asset_ids,
      linked_listing_id, linked_event_id, linked_route_id, linked_business_id,
      utm_campaign, scheduled_at
    ) VALUES (
      ${uid}::uuid,
      ${country},
      ${status}::social_post_status,
      ${platforms}::text[],
      ${body.title ?? null},
      ${body.body ?? ''},
      ${assetIds}::uuid[],
      ${body.linkedListingId ?? null}::uuid,
      ${body.linkedEventId   ?? null}::uuid,
      ${body.linkedRouteId   ?? null}::uuid,
      ${body.linkedBusinessId?? null}::uuid,
      ${body.utmCampaign ?? null},
      ${body.scheduledAt ?? null}::timestamptz
    )
    RETURNING id, status, scheduled_at, created_at
  `)
  const rows = (result.rows ?? result) as Array<Record<string, unknown>>
  return NextResponse.json({ post: rows[0] })
}
