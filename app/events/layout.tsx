import type { Metadata } from 'next'
import { getCountry } from '@/lib/country'
import { getCountryConfig } from '@/lib/country-config'

export async function generateMetadata(): Promise<Metadata> {
  const cfg = getCountryConfig(await getCountry())
  return {
    title: `Cycling Events in ${cfg.name} — CrankMart`,
    description: `Discover cycling events, races, and community rides across ${cfg.name}. Find your next cycling adventure.`,
    keywords: `cycling events, bike races, ${cfg.name}, cycling community`,
  }
}

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
