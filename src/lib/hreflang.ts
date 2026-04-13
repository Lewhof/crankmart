/**
 * hreflang / canonical helper for country-aware pages.
 *
 * Use inside a Next.js `generateMetadata()`:
 *
 *   export async function generateMetadata(): Promise<Metadata> {
 *     return {
 *       alternates: buildAlternates('/events'),
 *     }
 *   }
 *
 * During `implicit-za` mode, all URLs are un-prefixed. At launch (prefixed mode)
 * the same helper emits `/za/events`, `/au/events` (future), and `x-default`.
 */

import { ACTIVE_COUNTRIES, getRoutingMode, hreflangFor, type Country } from './country'

const BASE = 'https://crankmart.com'

export function buildAlternates(pathWithoutCountry: string): {
  canonical: string
  languages: Record<string, string>
} {
  const clean = pathWithoutCountry.startsWith('/')
    ? pathWithoutCountry
    : `/${pathWithoutCountry}`

  const mode = getRoutingMode()
  const languages: Record<string, string> = {}

  for (const c of ACTIVE_COUNTRIES as readonly Country[]) {
    const url = mode === 'implicit-za' ? `${BASE}${clean}` : `${BASE}/${c}${clean}`
    languages[hreflangFor(c)] = url
  }

  // x-default → first active country (ZA during launch phase)
  const first = ACTIVE_COUNTRIES[0]
  languages['x-default'] =
    mode === 'implicit-za' ? `${BASE}${clean}` : `${BASE}/${first}${clean}`

  const canonical =
    mode === 'implicit-za' ? `${BASE}${clean}` : `${BASE}/${first}${clean}`

  return { canonical, languages }
}
