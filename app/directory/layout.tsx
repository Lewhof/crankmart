import type { Metadata } from 'next'
import { getCountry } from '@/lib/country'
import { getCountryConfig } from '@/lib/country-config'

export async function generateMetadata(): Promise<Metadata> {
  const cfg = getCountryConfig(await getCountry())
  return {
    title: 'Cycling Businesses Directory — CrankMart',
    description: `Find local cycling shops, repair services, and bike businesses across ${cfg.name}. Connect with the cycling community.`,
    keywords: `bike shop, cycling repair, cycling businesses, ${cfg.name}`,
  }
}

export default function DirectoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
