import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { PLATFORM_META, type SocialPlatform } from '@/lib/social'

const VALID_PLATFORMS = Object.keys(PLATFORM_META) as SocialPlatform[]
const VALID_STATUS = ['draft', 'scheduled', 'published', 'failed', 'archived'] as const
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck

  const { id } = await params
  const result = await db.execute(sql`
    SELECT p.id, p.country, p.status, p.platforms, p.title, p.body, p.asset_ids,
           p.linked_listing_id, p.linked_event_id, p.linked_route_id, p.linked_business_id,
           p.utm_campaign, p.scheduled_at, p.published_at, p.created_at, p.updated_at,
           u.name AS author_name
    FROM social_posts p
    LEFT JOIN users u ON u.id = p.author_id
    WHERE p.id = ${id}::uuid
  `)
  const rows = (result.rows ?? result) as Array<Record<string, unknown>>
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const assetIds = (rows[0].asset_ids as string[] | null) ?? []
  let assets: Array<Record<string, unknown>> = []
  if (assetIds.length > 0) {
    const a = await db.execute(sql`
      SELECT id, url, thumb_url, alt_text FROM social_assets
      WHERE id = ANY(${assetIds}::uuid[])
    `)
    assets = (a.rows ?? a) as Array<Record<string, unknown>>
  }
  return NextResponse.json({ post: rows[0], assets })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck

  const { id } = await params
  const body = await req.json().catch(() => ({})) as {
    status?: string
    platforms?: string[]
    title?: string | null
    body?: string
    assetIds?: string[]
    utmCampaign?: string | null
    scheduledAt?: string | null
    linkedListingId?: string | null
    linkedEventId?: string | null
    linkedRouteId?: string | null
    linkedBusinessId?: string | null
  }

  if (body.status && !(VALID_STATUS as readonly string[]).includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }
  const platforms = Array.isArray(body.platforms)
    ? body.platforms.filter((p): p is SocialPlatform => VALID_PLATFORMS.includes(p as SocialPlatform))
    : null
  let assetIds: string[] | null = null
  if (Array.isArray(body.assetIds)) {
    assetIds = body.assetIds.filter((a): a is string => typeof a === 'string' && UUID_RE.test(a)).slice(0, 10)
    if (body.assetIds.length > 0 && assetIds.length === 0) {
      return NextResponse.json({ error: 'assetIds contains invalid UUIDs' }, { status: 400 })
    }
  }

  await db.execute(sql`
    UPDATE social_posts SET
      status              = COALESCE(${body.status ?? null}::social_post_status, status),
      platforms           = COALESCE(${platforms}::text[],                       platforms),
      title               = COALESCE(${body.title ?? null},                      title),
      body                = COALESCE(${body.body ?? null},                       body),
      asset_ids           = COALESCE(${assetIds}::uuid[],                        asset_ids),
      utm_campaign        = COALESCE(${body.utmCampaign ?? null},                utm_campaign),
      scheduled_at        = COALESCE(${body.scheduledAt ?? null}::timestamptz,   scheduled_at),
      linked_listing_id   = COALESCE(${body.linkedListingId ?? null}::uuid,      linked_listing_id),
      linked_event_id     = COALESCE(${body.linkedEventId ?? null}::uuid,        linked_event_id),
      linked_route_id     = COALESCE(${body.linkedRouteId ?? null}::uuid,        linked_route_id),
      linked_business_id  = COALESCE(${body.linkedBusinessId ?? null}::uuid,     linked_business_id),
      updated_at          = NOW()
    WHERE id = ${id}::uuid
  `)
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck

  const { id } = await params
  await db.execute(sql`DELETE FROM social_posts WHERE id = ${id}::uuid`)
  return NextResponse.json({ ok: true })
}
