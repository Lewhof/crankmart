import type { Metadata } from 'next'
import RoutesClient from './RoutesClient'
import { getCountry } from '@/lib/country'
import { getCountryConfig } from '@/lib/country-config'

export async function generateMetadata(): Promise<Metadata> {
  const cfg = getCountryConfig(await getCountry())
  return {
    title: 'Cycling Routes — CrankMart',
    description: `Discover the best cycling routes across ${cfg.name}. MTB trails, road rides, gravel adventures and more.`,
    keywords: `cycling routes, ${cfg.name}, MTB trails, road cycling, gravel routes`,
    openGraph: {
      title: 'Cycling Routes — CrankMart',
      description: `Discover the best cycling routes across ${cfg.name}.`,
      url: `https://crankmart.com/${cfg.code}/routes`,
      siteName: 'CrankMart',
      type: 'website',
    },
  }
}

export default function RoutesPage() {
  return <RoutesClient />
}
