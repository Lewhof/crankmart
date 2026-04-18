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
 * the home page, auth-flow pages, and `/api/*` routes. Everything else
 * redirects home. Admins and superadmins bypass the gate entirely.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

const ACTIVE_COUNTRIES = ['za'] as const
const DEFAULT_COUNTRY = 'za'
type Country = (typeof ACTIVE_COUNTRIES)[number]

function isCountry(v: string): v is Country {
  return (ACTIVE_COUNTRIES as readonly string[]).includes(v)
}

function getMode(): 'implicit-za' | 'prefixed' {
  return (process.env.COUNTRY_ROUTING_MODE || 'implicit-za') as 'implicit-za' | 'prefixed'
}

/**
 * Returns the pathname with an active-country prefix stripped off
 * (e.g. `/za/browse` → `/browse`, `/za` → `/`). In implicit-za mode
 * this is a no-op. Used so allow-list / home checks don't need to
 * special-case every `/za/...` twin.
 */
function stripCountry(pathname: string): string {
  for (const c of ACTIVE_COUNTRIES) {
    if (pathname === `/${c}`) return '/'
    if (pathname.startsWith(`/${c}/`)) return pathname.slice(`/${c}`.length)
  }
  return pathname
}

function applyCountryHeader(req: NextRequest): NextResponse {
  const mode = getMode()
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
    // Rewrite /za/x internally to /x so Next.js's file router finds the
    // route — the app/ tree isn't nested under a [country] segment.
    // URL bar still shows /za/x; server components still read x-country.
    const rewritten = req.nextUrl.clone()
    rewritten.pathname = pathname.slice(`/${first}`.length) || '/'
    const res = NextResponse.rewrite(rewritten)
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
  // Always-public info pages — no user data, safe to show while gated.
  '/safety',
  '/status',
  // SMOKE TEST WINDOW (2026-04-17): widened so a fresh non-admin can walk
  // register → verify → list → message → report → export → delete.
  // REVERT to the minimal list above once smoke pass is signed off.
  '/browse',
  '/sell',
  '/account',
  '/events',
  '/news',
  '/routes',
  '/shops',
  '/directory',
  '/pricing',
  '/privacy',
  '/terms',
  '/how-to',
  '/seller',
  '/search',
]

export async function proxy(req: NextRequest) {
  const rawPath = req.nextUrl.pathname

  // API routes handle their own auth; let them through the gate.
  if (rawPath.startsWith('/api/')) return applyCountryHeader(req)

  // Normalise `/za/x` → `/x` before gate checks so prefixed mode doesn't
  // re-enter the redirect loop via `/za` ↔ `/` bouncing.
  const path = stripCountry(rawPath)

  // Root is the Coming Soon page itself — /za in prefixed mode also
  // resolves to the home via stripCountry().
  if (path === '/') return applyCountryHeader(req)

  // Auth flow + always-public info pages remain public.
  if (GATE_ALLOWLIST.some(p => path === p || path.startsWith(p + '/'))) {
    return applyCountryHeader(req)
  }

  // Everything else is gated behind admin role.
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  const isAdmin = role === 'admin' || role === 'superadmin'

  if (!isAdmin) {
    const url = req.nextUrl.clone()
    // Send them to the home of whatever routing mode is active so we don't
    // immediately redirect again (/ → /za) in prefixed mode.
    url.pathname = getMode() === 'prefixed' ? `/${DEFAULT_COUNTRY}` : '/'
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
