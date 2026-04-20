/**
 * Static region list safe to import from client components. Mirrors the
 * `regions` table contents so UI dropdowns don't need a fetch for a list
 * that changes roughly never.
 *
 * Keep in sync with `drizzle/0016_au_launch.sql` seed inserts. If these drift,
 * users see ghost entries; the server query (src/lib/regions.ts) is the
 * source of truth for any query-time validation.
 */

import type { Country } from './country'

export const REGIONS_STATIC: Record<Country, readonly string[]> = {
  za: [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'Northern Cape',
    'North West',
    'Western Cape',
  ],
  au: [
    'New South Wales',
    'Victoria',
    'Queensland',
    'Western Australia',
    'South Australia',
    'Tasmania',
    'Northern Territory',
    'Australian Capital Territory',
  ],
}

export function getProvincesStatic(country: Country): readonly string[] {
  return REGIONS_STATIC[country] ?? REGIONS_STATIC.za
}

/**
 * Client-side current-country resolver — reads the URL path.
 *
 * In `prefixed` routing mode the path is /za/... or /au/...; implicit-za has
 * no prefix and every request is ZA. Combined, this works for both modes
 * without an extra fetch or provider.
 *
 * Usage: call with `usePathname()` from next/navigation.
 *
 *   const path = usePathname()
 *   const country = countryFromPath(path)
 *   const provinces = getProvincesStatic(country)
 */
export function countryFromPath(pathname: string | null | undefined): Country {
  if (!pathname) return 'za'
  if (pathname === '/au' || pathname.startsWith('/au/')) return 'au'
  return 'za'
}

/**
 * Client-side admin-country resolver — reads the `admin_country` cookie set
 * by the CountrySwitcher component + proxy. Used inside admin forms where
 * the route path is `/admin/...` (not country-prefixed) but data-entry
 * needs to bind to the country currently in view.
 *
 * The cookie is intentionally NOT httpOnly (it's a UX preference, not a
 * security boundary — admin access is enforced server-side). Both the
 * proxy and /api/admin/country POST write it with httpOnly: false.
 *
 * Only call from a "use client" module. Falls back to 'za' during SSR or
 * if the cookie isn't set.
 */
export function adminCountryFromCookie(): Country {
  if (typeof document === 'undefined') return 'za'
  const match = document.cookie.split('; ').find(c => c.startsWith('admin_country='))
  if (!match) return 'za'
  const value = decodeURIComponent(match.split('=')[1])
  return value === 'au' ? 'au' : 'za'
}
