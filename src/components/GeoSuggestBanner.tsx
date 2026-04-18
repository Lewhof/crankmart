/**
 * Top-of-page dismissible banner offering to switch countries when the user's
 * IP geolocation suggests a different vertical. Never auto-redirects — per
 * project memory this is a user-controlled switch only.
 *
 * Server-read of `x-vercel-ip-country` keeps the logic trivially cheap and
 * SSR-friendly. We pass `currentCountry` + `suggestedCountry` down to a thin
 * client island that handles dismiss + cookie persistence.
 */

import { headers } from 'next/headers'
import { ACTIVE_COUNTRIES, type Country } from '@/lib/country'
import { getCountryConfig } from '@/lib/country-config'
import { GeoSuggestBannerClient } from './GeoSuggestBannerClient'

export async function GeoSuggestBanner({ currentCountry }: { currentCountry: Country }) {
  const h = await headers()
  const ipCountry = (h.get('x-vercel-ip-country') || '').toLowerCase()

  // Only suggest when the IP country is one of our active verticals and it's
  // different from where the user currently is.
  if (!ipCountry || ipCountry === currentCountry) return null
  if (!(ACTIVE_COUNTRIES as readonly string[]).includes(ipCountry)) return null

  const target = ipCountry as Country
  const cfg = getCountryConfig(target)

  return (
    <GeoSuggestBannerClient
      targetCountry={target}
      targetName={cfg.name}
      targetStatus={cfg.status}
    />
  )
}
