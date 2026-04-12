import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Bikes & Cycling Gear — CrankMart',
  description: 'Browse thousands of bikes, parts, and cycling gear for sale in South Africa. Find road bikes, MTB, gravel bikes, and more.',
  keywords: 'buy bike, cycling gear for sale, bike marketplace South Africa',
}

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
