import type { Metadata } from 'next'
import { getCountry } from '@/lib/country'
import { getCountryConfig } from '@/lib/country-config'

export async function generateMetadata(): Promise<Metadata> {
  const cfg = getCountryConfig(await getCountry())
  return {
    title: 'Browse Bikes & Cycling Gear — CrankMart',
    description: `Browse thousands of bikes, parts, and cycling gear for sale in ${cfg.name}. Find road bikes, MTB, gravel bikes, and more.`,
    keywords: `buy bike, cycling gear for sale, bike marketplace ${cfg.name}`,
  }
}

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
