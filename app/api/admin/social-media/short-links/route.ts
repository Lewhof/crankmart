import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { randomSlug } from '@/lib/social'

type SessionShape = { session: { user?: { id?: string } } }

export async function GET(req: NextRequest) {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck

  const limit  = Math.min(Number(req.nextUrl.searchParams.get('limit') ?? 100), 500)
  const offset = Math.max(Number(req.nextUrl.searchParams.get('offset') ?? 0), 0)

  const result = await db.execute(sql`
    SELECT id, slug, destination, utm_source, utm_medium, utm_campaign, utm_content,
           clicks, post_id, expires_at, created_at
    FROM short_links
    ORDER BY created_at DESC
    LIMIT ${limit}::int OFFSET ${offset}::int
  `)
  const rows = (result.rows ?? result) as Array<Record<string, unknown>>
  return NextResponse.json({ links: rows })
}

/**
 * Open-redirect defence: destination must be same-origin (crankmart.com)
 * or a relative path. Refuse everything else so a compromised cookie can't
 * turn /s/abc into a phishing hop. We pin to an exact host allowlist rather
 * than accepting any `*.crankmart.com` subdomain — a compromised user-content
 * subdomain should NOT be able to piggyback on our short-link system.
 */
const ALLOWED_HOSTS = new Set(['crankmart.com', 'www.crankmart.com'])

function isAllowedDestination(dest: string): boolean {
  if (dest.startsWith('/') && !dest.startsWith('//')) return true
  try {
    const u = new URL(dest)
    if (u.protocol !== 'https:') return false
    return ALLOWED_HOSTS.has(u.hostname.toLowerCase())
  } catch { return false }
}

export async function POST(req: NextRequest) {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck
  const uid = (adminCheck as SessionShape).session.user?.id ?? null

  const body = await req.json().catch(() => ({})) as {
    slug?: string
    destination?: string
    utmSource?: string | null
    utmMedium?: string | null
    utmCampaign?: string | null
    utmContent?: string | null
    postId?: string | null
    expiresAt?: string | null
  }

  if (!body.destination) return NextResponse.json({ error: 'destination required' }, { status: 400 })
  if (!isAllowedDestination(body.destination)) {
    return NextResponse.json({ error: 'destination must be a crankmart.com URL or a relative path' }, { status: 400 })
  }

  const slugRaw = (body.slug || '').trim().replace(/[^A-Za-z0-9-]/g, '')
  const userSuppliedSlug = slugRaw.length >= 3 && slugRaw.length <= 40
  const attempts = userSuppliedSlug ? 1 : 4 // retry random-generated slugs against rare collisions

  let lastErr: unknown = null
  for (let i = 0; i < attempts; i++) {
    const slug = userSuppliedSlug ? slugRaw : randomSlug(8)
    try {
      const result = await db.execute(sql`
        INSERT INTO short_links (slug, destination, utm_source, utm_medium, utm_campaign, utm_content, post_id, created_by, expires_at)
        VALUES (
          ${slug},
          ${body.destination},
          ${body.utmSource ?? null},
          ${body.utmMedium ?? 'social'},
          ${body.utmCampaign ?? null},
          ${body.utmContent ?? null},
          ${body.postId ?? null}::uuid,
          ${uid}::uuid,
          ${body.expiresAt ?? null}::timestamptz
        )
        RETURNING id, slug, destination, utm_source, utm_medium, utm_campaign, utm_content, clicks, expires_at, created_at
      `)
      const rows = (result.rows ?? result) as Array<Record<string, unknown>>
      return NextResponse.json({ link: rows[0] })
    } catch (e) {
      lastErr = e
      const conflict = /duplicate key|unique/i.test(e instanceof Error ? e.message : '')
      if (conflict && !userSuppliedSlug) continue // try another random slug
      if (conflict)  return NextResponse.json({ error: 'Slug already taken' }, { status: 409 })
      break
    }
  }
  console.error('[short-links] insert failed after retries', lastErr)
  return NextResponse.json({ error: 'Insert failed' }, { status: 500 })
}
