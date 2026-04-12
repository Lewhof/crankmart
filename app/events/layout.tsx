import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cycling Events in South Africa — CycleMart',
  description: 'Discover cycling events, races, and community rides across South Africa. Find your next cycling adventure.',
  keywords: 'cycling events, bike races, South Africa, cycling community',
}

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
