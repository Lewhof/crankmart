/**
 * Multi-country runtime helpers.
 *
 * During the pre-launch build phase, `COUNTRY_ROUTING_MODE=implicit-za` means
 * URLs have no country segment and every request resolves to 'za'.
 *
 * At launch we flip `COUNTRY_ROUTING_MODE=prefixed`, the middleware enforces
 * a country segment on every URL, and `/` 301s to `/za`.
 *
 * Every DB query against a geo-scoped table MUST be filtered by country
 * — use `scopedBy()` or include `eq(table.country, getCountry())` explicitly.
 */

import { headers } from 'next/headers'
import { eq, type SQL } from 'drizzle-orm'

export type Country = 'za'
// Future: 'au' | 'uk' | 'us' | 'nz'

export const ACTIVE_COUNTRIES: readonly Country[] = ['za'] as const
export const DEFAULT_COUNTRY: Country = 'za'

export type RoutingMode = 'implicit-za' | 'prefixed'

export function getRoutingMode(): RoutingMode {
  return (process.env.COUNTRY_ROUTING_MODE as RoutingMode) || 'implicit-za'
}

export function isActiveCountry(value: string | null | undefined): value is Country {
  return !!value && (ACTIVE_COUNTRIES as readonly string[]).includes(value)
}

/**
 * Server-side country resolver. Reads the `x-country` header set by middleware.
 * Falls back to DEFAULT_COUNTRY if missing (e.g. in non-request contexts).
 */
export async function getCountry(): Promise<Country> {
  try {
    const h = await headers()
    const c = h.get('x-country')
    if (isActiveCountry(c)) return c
  } catch {
    // Outside a request (scripts, seeds) — fall through.
  }
  return DEFAULT_COUNTRY
}

/**
 * Drizzle helper — returns `eq(table.country, <current country>)` for use
 * in `where` clauses. Every query against a geo-scoped table must pass
 * through this OR include a manual country filter.
 *
 *   const rows = await db.select().from(events).where(await scopedBy(events))
 *
 * Combine with other filters via `and(...)`.
 */
export async function scopedBy(
  table: { country: { name: string } & { _: unknown } } & Record<string, unknown>,
): Promise<SQL> {
  const country = await getCountry()
  // @ts-expect-error — drizzle column typing is table-specific
  return eq(table.country, country)
}

/** Build a country-aware path. `/events` → `/za/events` when prefixed. */
export function countryPath(path: string, country: Country = DEFAULT_COUNTRY): string {
  if (getRoutingMode() === 'implicit-za') return path
  const clean = path.startsWith('/') ? path : `/${path}`
  return `/${country}${clean}`
}

/** Locale tag for hreflang — maps country code to `en-<CC>`. */
export function hreflangFor(country: Country): string {
  return `en-${country.toUpperCase()}`
}
