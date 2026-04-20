import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { PLATFORM_META, type SocialPlatform } from '@/lib/social'

const VALID_PLATFORMS: SocialPlatform[] = Object.keys(PLATFORM_META) as SocialPlatform[]
const VALID_COUNTRIES = new Set(['za', 'au'])

function validateHttps(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === 'https:'
  } catch { return false }
}

export async function GET(req: NextRequest) {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck

  const country = req.nextUrl.searchParams.get('country') ?? 'za'
  const result = await db.execute(sql`
    SELECT id, platform, handle, url, country, display_in_footer, is_active, sort_order, created_at, updated_at
    FROM social_profiles
    WHERE country = ${country}
    ORDER BY sort_order ASC, platform ASC
  `)
  const rows = (result.rows ?? result) as Array<Record<string, unknown>>
  return NextResponse.json({ profiles: rows })
}

export async function POST(req: NextRequest) {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck

  const body = await req.json().catch(() => ({})) as {
    platform?: string
    handle?: string
    url?: string
    country?: string
    displayInFooter?: boolean
    sortOrder?: number
  }

  const platform = body.platform as SocialPlatform | undefined
  if (!platform || !VALID_PLATFORMS.includes(platform)) {
    return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
  }
  if (!body.handle || body.handle.length > 120) {
    return NextResponse.json({ error: 'Handle required (max 120 chars)' }, { status: 400 })
  }
  const handle = body.handle.trim()
  const url = body.url?.trim() || PLATFORM_META[platform].baseUrl(handle)
  // Validate both user-supplied and auto-generated URLs. Defence-in-depth
  // if PLATFORM_META ever gets an http:// entry.
  if (!validateHttps(url)) {
    return NextResponse.json({ error: 'URL must be a valid https:// URL' }, { status: 400 })
  }
  const country = (body.country || 'za').toLowerCase().slice(0, 2)
  if (!VALID_COUNTRIES.has(country)) {
    return NextResponse.json({ error: 'Invalid country (use "za" or "au")' }, { status: 400 })
  }
  const displayInFooter = body.displayInFooter !== false
  const sortOrder = Number.isFinite(body.sortOrder) ? Math.max(0, Math.floor(body.sortOrder!)) : 0

  const result = await db.execute(sql`
    INSERT INTO social_profiles (platform, handle, url, country, display_in_footer, sort_order)
    VALUES (${platform}::social_platform, ${handle}, ${url}, ${country}, ${displayInFooter}, ${sortOrder}::int)
    ON CONFLICT (platform, country) DO UPDATE
      SET handle = EXCLUDED.handle,
          url = EXCLUDED.url,
          display_in_footer = EXCLUDED.display_in_footer,
          sort_order = EXCLUDED.sort_order,
          is_active = TRUE,
          updated_at = NOW()
    RETURNING id, platform, handle, url, country, display_in_footer, is_active, sort_order
  `)
  const rows = (result.rows ?? result) as Array<Record<string, unknown>>
  return NextResponse.json({ profile: rows[0] })
}
