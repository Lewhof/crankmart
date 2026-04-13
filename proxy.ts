/**
 * Country-aware routing proxy (Next.js 16 renamed middleware → proxy).
 *
 *   COUNTRY_ROUTING_MODE=implicit-za  → no country segment, every request = ZA
 *   COUNTRY_ROUTING_MODE=prefixed     → first path segment must be an active country
 *
 * Sets the `x-country` request header so server components / queries can
 * read it via `getCountry()` in `src/lib/country.ts`.
 */

import { NextRequest, NextResponse } from 'next/server'

const ACTIVE_COUNTRIES = ['za'] as const
const DEFAULT_COUNTRY = 'za'
type Country = (typeof ACTIVE_COUNTRIES)[number]

function isCountry(v: string): v is Country {
  return (ACTIVE_COUNTRIES as readonly string[]).includes(v)
}

export function proxy(req: NextRequest) {
  const mode = (process.env.COUNTRY_ROUTING_MODE || 'implicit-za') as
    | 'implicit-za'
    | 'prefixed'

  const { pathname, search } = req.nextUrl

  if (mode === 'implicit-za') {
    const res = NextResponse.next()
    res.headers.set('x-country', DEFAULT_COUNTRY)
    return res
  }

  // prefixed mode
  const first = pathname.split('/')[1] || ''

  if (isCountry(first)) {
    const res = NextResponse.next()
    res.headers.set('x-country', first)
    return res
  }

  // No country segment — 301 to DEFAULT_COUNTRY prefix
  const url = req.nextUrl.clone()
  url.pathname = `/${DEFAULT_COUNTRY}${pathname === '/' ? '' : pathname}`
  url.search = search
  return NextResponse.redirect(url, 308)
}

export const config = {
  // Skip static assets, Next internals, and API health
  matcher: [
    '/((?!_next/|api/health|favicon\\.ico|robots\\.txt|sitemap.*|icon-|apple-icon|.*\\.(?:png|jpg|jpeg|webp|avif|svg|gif|ico|css|js|map|txt|xml|woff2?)).*)',
  ],
}
