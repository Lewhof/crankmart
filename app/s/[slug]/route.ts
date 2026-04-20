import { NextRequest, NextResponse, after } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

/**
 * Short-link resolver. `/s/<slug>` → increments click count, appends UTM
 * params, 302-redirects. Destinations are validated at insert time as
 * crankmart.com-only to prevent open-redirect abuse — we re-validate here
 * in case the DB was tampered with.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!slug || !/^[A-Za-z0-9-]{3,40}$/.test(slug)) {
    return NextResponse.redirect(new URL('/', req.url), { status: 302 })
  }

  const result = await db.execute(sql`
    SELECT id, destination, utm_source, utm_medium, utm_campaign, utm_content, expires_at
    FROM short_links
    WHERE slug = ${slug}
    LIMIT 1
  `)
  const row = ((result.rows ?? result) as Array<{
    id: string
    destination: string
    utm_source: string | null
    utm_medium: string | null
    utm_campaign: string | null
    utm_content: string | null
    expires_at: string | null
  }>)[0]

  if (!row) return NextResponse.redirect(new URL('/', req.url), { status: 302 })
  if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
    return NextResponse.redirect(new URL('/', req.url), { status: 302 })
  }

  const target = buildTarget(row.destination, row, req.url)
  if (!target) return NextResponse.redirect(new URL('/', req.url), { status: 302 })

  // Schedule the click increment to run after response. `after()` keeps the
  // function alive past the redirect so Vercel Fluid/Edge doesn't cancel
  // the fire-and-forget promise (as a bare `void db.execute(...)` would).
  after(async () => {
    try {
      await db.execute(sql`UPDATE short_links SET clicks = clicks + 1 WHERE id = ${row.id}::uuid`)
    } catch (e) {
      console.error('[short-links] click increment failed', e)
    }
  })

  return NextResponse.redirect(target, { status: 302 })
}

// Must match the insert-time allowlist in short-links/route.ts exactly.
// Defence in depth: even if the DB was tampered with, we will not redirect
// off-allowlist at serve time.
const ALLOWED_HOSTS = new Set(['crankmart.com', 'www.crankmart.com'])

function buildTarget(
  dest: string,
  utm: {
    utm_source: string | null; utm_medium: string | null
    utm_campaign: string | null; utm_content: string | null
  },
  reqUrl: string,
): URL | null {
  try {
    const isRelative = dest.startsWith('/') && !dest.startsWith('//') && !dest.startsWith('/\\')
    const base = isRelative ? new URL(dest, reqUrl) : new URL(dest)
    if (base.protocol !== 'https:') return null
    if (!isRelative && !ALLOWED_HOSTS.has(base.hostname.toLowerCase())) return null
    if (utm.utm_source)   base.searchParams.set('utm_source',   utm.utm_source)
    if (utm.utm_medium)   base.searchParams.set('utm_medium',   utm.utm_medium)
    if (utm.utm_campaign) base.searchParams.set('utm_campaign', utm.utm_campaign)
    if (utm.utm_content)  base.searchParams.set('utm_content',  utm.utm_content)
    return base
  } catch { return null }
}
