import type { Metadata } from 'next'
import BusinessDetail from './BusinessDetail'

type Props = { params: Promise<{ slug: string }> }

const TYPE_LABELS: Record<string, string> = {
  shop: 'Bike Shop', online: 'Online Store', brand: 'Brand', club: 'Cycling Club',
  coach: 'Coach / Trainer', mechanic: 'Mobile Mechanic', tour: 'Tour Operator', other: 'Other'
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://crankmart.com'
    const res = await fetch(`${BASE}/api/directory/${slug}`, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error('not found')
    const data = await res.json()
    const business = data.data || data
    const typeLabel = TYPE_LABELS[business.type] || business.type
    return {
      title: `${business.name} — ${typeLabel} in ${business.city} | CrankMart`,
      description: business.description || `Find ${business.name}, a ${typeLabel} located in ${business.city}, ${business.province}. Browse contact details, location, and services on CrankMart's business directory.`,
      openGraph: {
        title: `${business.name} — ${typeLabel} in ${business.city}`,
        description: business.description,
        url: `https://crankmart.com/directory/${slug}`,
        siteName: 'CrankMart',
        type: 'website',
        ...(business.logo && { images: [{ url: business.logo, width: 400, height: 400 }] }),
      },
      twitter: {
        card: 'summary',
        title: `${business.name} — ${typeLabel}`,
        description: business.description,
        ...(business.logo && { images: [business.logo] }),
      },
      alternates: { canonical: `https://crankmart.com/directory/${slug}` },
    }
  } catch {
    return { title: 'CrankMart Business Directory', description: 'Find cycling businesses across the country.' }
  }
}

export default function BusinessPage() {
  return <BusinessDetail />
}
