/**
 * Country-aware routing proxy (Next.js 16 renamed middleware → proxy).
 *
 *   COUNTRY_ROUTING_MODE=implicit-za  → no country segment, every request = ZA
 *   COUNTRY_ROUTING_MODE=prefixed     → first path segment must be an active country
 *
 * Sets the `x-country` request header so server components / queries can
 * read it via `getCountry()` in `src/lib/country.ts`.
 *
 * Gates non-admins out of any country marked `coming-soon` in
 * COUNTRY_LIVE_STATUS (e.g. `za:live,au:coming-soon`). Country-scoped gate
 * means ZA can be publicly live while AU stays behind the admin gate.
 * Admins and superadmins bypass regardless.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

const ACTIVE_COUNTRIES = ['za', 'au'] as const
const DEFAULT_COUNTRY = 'za'
type Country = (typeof ACTIVE_COUNTRIES)[number]

function isCountry(v: string): v is Country {
  return (ACTIVE_COUNTRIES as readonly string[]).includes(v)
}

function getMode(): 'implicit-za' | 'prefixed' {
  return (process.env.COUNTRY_ROUTING_MODE || 'implicit-za') as 'implicit-za' | 'prefixed'
}

/**
 * Read per-country launch status from env. Format: `za:live,au:coming-soon`.
 * Unknown / malformed entries default to 'coming-soon' to fail safe.
 */
function getCountryStatus(country: Country): 'live' | 'coming-soon' {
  const raw = process.env.COUNTRY_LIVE_STATUS ?? ''
  const pair = raw.split(',').map(s => s.trim()).find(p => p.startsWith(`${country}:`))
  if (!pair) return country === 'za' ? 'live' : 'coming-soon'
  const value = pair.slice(country.length + 1).trim()
  return value === 'live' ? 'live' : 'coming-soon'
}

/** Strips an active-country prefix so gate checks don't need to special-case /za/...  */
function stripCountry(pathname: string): { path: string; country: Country | null } {
  for (const c of ACTIVE_COUNTRIES) {
    if (pathname === `/${c}`) return { path: '/', country: c }
    if (pathname.startsWith(`/${c}/`)) return { path: pathname.slice(`/${c}`.length), country: c }
  }
  return { path: pathname, country: null }
}

/**
 * Build a request-header bag with x-country set so the page render reads
 * the right country via headers(). NextResponse.next/rewrite must receive
 * `{ request: { headers } }` — `res.headers.set()` only sets RESPONSE
 * headers (visible to the browser), which the page renderer never sees.
 */
function withCountryHeader(req: NextRequest, country: Country): Headers {
  const h = new Headers(req.headers)
  h.set('x-country', country)
  return h
}

function applyCountryHeader(req: NextRequest, forceCountry?: Country): NextResponse {
  const mode = getMode()
  const { pathname, search } = req.nextUrl

  if (pathname.startsWith('/api/')) {
    // Respect an x-country header set by the caller (server components
    // forwarding the country into internal /api fetches). Only fall back to
    // the default when the caller didn't supply one.
    const incoming = req.headers.get('x-country')
    const resolved = isCountry(incoming ?? '') ? (incoming as Country) : (forceCountry ?? DEFAULT_COUNTRY)
    const headers = withCountryHeader(req, resolved)
    return NextResponse.next({ request: { headers } })
  }

  if (mode === 'implicit-za') {
    const headers = withCountryHeader(req, DEFAULT_COUNTRY)
    return NextResponse.next({ request: { headers } })
  }

  const first = pathname.split('/')[1] || ''
  if (isCountry(first)) {
    // Rewrite /za/x internally to /x so Next.js's file router finds the
    // route — the app/ tree isn't nested under a [country] segment.
    const rewritten = req.nextUrl.clone()
    rewritten.pathname = pathname.slice(`/${first}`.length) || '/'
    const headers = withCountryHeader(req, first)
    return NextResponse.rewrite(rewritten, { request: { headers } })
  }

  const url = req.nextUrl.clone()
  url.pathname = `/${DEFAULT_COUNTRY}${pathname === '/' ? '' : pathname}`
  url.search = search
  return NextResponse.redirect(url, 308)
}

// Auth-flow pages that must stay reachable to non-admins so registration,
// email-verify click-throughs, and password recovery keep working — regardless
// of country launch status.
const GATE_ALLOWLIST = [
  '/login',
  '/register',
  '/verify',
  '/forgot-password',
  '/reset-password',
  // Always-public info pages — no user data, safe to show while gated.
  '/safety',
  '/status',
  '/check',
  '/community/check',
]

export async function proxy(req: NextRequest) {
  const rawPath = req.nextUrl.pathname

  // API routes handle their own auth; let them through the gate.
  if (rawPath.startsWith('/api/')) return applyCountryHeader(req)

  const { path, country } = stripCountry(rawPath)
  const resolvedCountry: Country = country ?? DEFAULT_COUNTRY
  const status = getCountryStatus(resolvedCountry)

  // Root is the Coming Soon / home page itself — always reachable.
  if (path === '/') return applyCountryHeader(req)

  // Auth flow + always-public info pages remain public.
  if (GATE_ALLOWLIST.some(p => path === p || path.startsWith(p + '/'))) {
    return applyCountryHeader(req)
  }

  // Live country → public, no gate.
  if (status === 'live') return applyCountryHeader(req)

  // Coming-soon country → admins bypass, everyone else redirects home.
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  const isAdmin = role === 'admin' || role === 'superadmin'

  if (!isAdmin) {
    const url = req.nextUrl.clone()
    url.pathname = getMode() === 'prefixed' ? `/${resolvedCountry}` : '/'
    url.search = ''
    return NextResponse.redirect(url, 307)
  }

  return applyCountryHeader(req)
}

export const config = {
  matcher: [
    '/((?!_next/|api/health|favicon\\.ico|robots\\.txt|sitemap.*|icon-|apple-icon|manifest\\.webmanifest|.*\\.(?:png|jpg|jpeg|webp|avif|svg|gif|ico|css|js|map|txt|xml|woff2?|webmanifest)).*)',
  ],
}
