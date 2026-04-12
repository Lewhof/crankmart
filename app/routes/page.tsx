import type { Metadata } from 'next'
import RoutesClient from './RoutesClient'

export const metadata: Metadata = {
  title: 'Cycling Routes — CrankMart',
  description: 'Discover the best cycling routes across South Africa. MTB trails, road rides, gravel adventures and more.',
  keywords: 'cycling routes, South Africa, MTB trails, road cycling, gravel routes',
  openGraph: {
    title: 'Cycling Routes — CrankMart',
    description: 'Discover the best cycling routes across South Africa.',
    url: 'https://crankmart.com/routes',
    siteName: 'CrankMart',
    type: 'website',
  },
}

export default function RoutesPage() {
  return <RoutesClient />
}
