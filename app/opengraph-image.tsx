import { getCountry } from '@/lib/country'
import { getCountryConfig } from '@/lib/country-config'
import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-image'

export const alt = 'CrankMart — cycling marketplace, gear, events, trails'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  const country = await getCountry()
  const cfg = getCountryConfig(country)
  return renderOg({
    kind: country.toUpperCase(),
    title: `${cfg.name}'s dedicated cycling marketplace.`,
    subtitle: 'Buy and sell bikes, find events, trails, bike shops.',
  })
}
