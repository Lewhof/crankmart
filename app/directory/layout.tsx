import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cycling Businesses Directory — CrankMart',
  description: 'Find local cycling shops, repair services, and bike businesses across South Africa. Connect with the cycling community.',
  keywords: 'bike shop, cycling repair, cycling businesses, South Africa',
}

export default function DirectoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
