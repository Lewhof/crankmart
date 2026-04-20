/**
 * Country-aware routing proxy (Next.js 16 renamed middleware → proxy).
 *
 *   COUNTRY_ROUTING_MODE=implicit-za  → no country segment, every request = ZA
 *   COUNTRY_ROUTING_MODE=prefixed     → first path segment must be an active country
 *
 * Sets the `x-country` request header so server components / queries can
 * read it via `getCountry()` in `src/lib/country.ts`.
 *
 * Sticky country preference: the `admin_country` cookie (set by the
 * SuperadminCountryToggle / CountrySwitcher) acts as the user's preferred
 * country. When a request has no URL country prefix the proxy redirects to
 * the cookie's country instead of DEFAULT_COUNTRY — so any hardcoded
 * unprefixed link (`/events`, `/browse`, etc.) lands on the user's chosen
 * country.
 *
 * Cookie write rule:
 *   - Initialise the cookie when ABSENT (any visit).
 *   - Sync to URL country when present AND request is a top-level browser
 *     navigation (Sec-Fetch-Mode: navigate). Direct URL bar entry, hard
 *     reload, opening in a new tab — these are explicit user intent.
 *   - DO NOT sync on fetch()-based requests (Next.js Link prefetches,
 *     RSC refetches, soft-nav). Those use Sec-Fetch-Mode: cors/no-cors
 *     and would silently flip the sticky preference whenever any Link to
 *     a different country enters the viewport (e.g. GeoSuggestBanner's
 *     "Switch" Link). The toggle's POST to /api/admin/country remains
 *     the canonical way to change the cookie via in-app interaction.
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

const COUNTRY_PREF_COOKIE = 'admin_country'
const COUNTRY_PREF_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

function readCountryPref(req: NextRequest): Country | null {
  const v = req.cookies.get(COUNTRY_PREF_COOKIE)?.value
  return isCountry(v ?? '') ? (v as Country) : null
}

function syncCountryPrefCookie(res: NextResponse, country: Country): void {
  // httpOnly: false — this cookie is an operator UX preference, not a
  // security boundary (admin access is checked server-side by checkAdminApi).
  // Admin client components (e.g. app/admin/routes/new) need to read it to
  // render country-appropriate dropdowns, which is impossible if it's
  // httpOnly. Must match the attributes in /api/admin/country/route.ts.
  res.cookies.set(COUNTRY_PREF_COOKIE, country, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COUNTRY_PREF_MAX_AGE,
  })
}

function applyCountryHeader(req: NextRequest, forceCountry?: Country): NextResponse {
  const mode = getMode()
  const { pathname, search } = req.nextUrl

  if (pathname.startsWith('/api/')) {
    // Resolution order: explicit caller header → sticky cookie → default.
    // Vary: x-country + Cookie on /api responses keeps CDN cache slots split
    // per (country header, cookie) pair so cross-country contamination can't
    // leak through the edge cache.
    const incoming = req.headers.get('x-country')
    const cookie = readCountryPref(req)
    const resolved: Country = isCountry(incoming ?? '')
      ? (incoming as Country)
      : (cookie ?? forceCountry ?? DEFAULT_COUNTRY)
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
    const res = NextResponse.rewrite(rewritten, { request: { headers } })

    const existing = readCountryPref(req)
    const fetchMode = req.headers.get('sec-fetch-mode')
    const isTopLevelNavigation = fetchMode === 'navigate'

    // Set cookie when (a) absent OR (b) explicit top-level navigation to a
    // different country (typed URL, hard reload, new tab). Skip on soft-nav
    // and prefetch (Sec-Fetch-Mode: cors/no-cors) so a `<Link href="/za">`
    // entering the viewport can't silently overwrite the sticky preference.
    const shouldSync =
      existing === null ||
      (isTopLevelNavigation && existing !== first)
    if (shouldSync) syncCountryPrefCookie(res, first)
    return res
  }

  // No URL prefix → fall back to sticky cookie, then DEFAULT_COUNTRY.
  // This is what makes `<Link href="/events">` from /au pages land on
  // /au/events instead of bouncing back to /za/events.
  const target = readCountryPref(req) ?? DEFAULT_COUNTRY
  const url = req.nextUrl.clone()
  url.pathname = `/${target}${pathname === '/' ? '' : pathname}`
  url.search = search
  // The redirect target depends on the user's admin_country cookie, so
  // any intermediate cache (Vercel edge, corporate proxy, browser 308
  // persistent cache) MUST key on that cookie and must not share one
  // user's redirect with another. Vary:Cookie + no-store closes both
  // doors. Kept as 308 since the mapping is stable for a given cookie
  // value, just not shareable across users.
  const redirect = NextResponse.redirect(url, 308)
  redirect.headers.set('Cache-Control', 'private, no-store, must-revalidate')
  redirect.headers.set('Vary', 'Cookie')
  return redirect
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
