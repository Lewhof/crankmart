/**
 * Country-aware routing proxy (Next.js 16 renamed middleware → proxy).
 *
 *   COUNTRY_ROUTING_MODE=implicit-za  → no country segment, every request = ZA
 *   COUNTRY_ROUTING_MODE=prefixed     → first path segment must be an active country
 *
 * Sets the `x-country` request header so server components / queries can
 * read it via `getCountry()` in `src/lib/country.ts`.
 *
 * Also enforces the pre-launch Coming Soon gate: non-admins can only reach
 * `/` (the Coming Soon page) and `/api/*` routes. Everything else redirects
 * to `/`. Admins bypass the gate entirely.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

const ACTIVE_COUNTRIES = ['za'] as const
const DEFAULT_COUNTRY = 'za'
type Country = (typeof ACTIVE_COUNTRIES)[number]

function isCountry(v: string): v is Country {
  return (ACTIVE_COUNTRIES as readonly string[]).includes(v)
}

function applyCountryHeader(req: NextRequest): NextResponse {
  const mode = (process.env.COUNTRY_ROUTING_MODE || 'implicit-za') as 'implicit-za' | 'prefixed'
  const { pathname, search } = req.nextUrl

  // API routes never get the country prefix — they resolve to DEFAULT_COUNTRY
  // and let route handlers read `x-country` for scoping. Prefix-redirecting
  // /api/* would break every client API call in prefixed mode.
  if (pathname.startsWith('/api/')) {
    const res = NextResponse.next()
    res.headers.set('x-country', DEFAULT_COUNTRY)
    return res
  }

  if (mode === 'implicit-za') {
    const res = NextResponse.next()
    res.headers.set('x-country', DEFAULT_COUNTRY)
    return res
  }

  const first = pathname.split('/')[1] || ''
  if (isCountry(first)) {
    const res = NextResponse.next()
    res.headers.set('x-country', first)
    return res
  }

  const url = req.nextUrl.clone()
  url.pathname = `/${DEFAULT_COUNTRY}${pathname === '/' ? '' : pathname}`
  url.search = search
  return NextResponse.redirect(url, 308)
}

// Auth-flow pages that must stay reachable to non-admins so registration,
// email-verify click-throughs, and password recovery keep working.
const GATE_ALLOWLIST = [
  '/login',
  '/register',
  '/verify',
  '/forgot-password',
  '/reset-password',
]

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // API routes handle their own auth; let them through the gate.
  if (pathname.startsWith('/api/')) return applyCountryHeader(req)

  // Root is the Coming Soon page itself.
  if (pathname === '/') return applyCountryHeader(req)

  // Auth flow pages remain public so register / verify / reset work.
  if (GATE_ALLOWLIST.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return applyCountryHeader(req)
  }

  // Everything else is gated behind admin role.
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  const isAdmin = role === 'admin' || role === 'superadmin'

  if (!isAdmin) {
    const url = req.nextUrl.clone()
    url.pathname = '/'
    url.search = ''
    return NextResponse.redirect(url, 307)
  }

  return applyCountryHeader(req)
}

export const config = {
  matcher: [
    '/((?!_next/|api/health|favicon\\.ico|robots\\.txt|sitemap.*|icon-|apple-icon|.*\\.(?:png|jpg|jpeg|webp|avif|svg|gif|ico|css|js|map|txt|xml|woff2?)).*)',
  ],
}
