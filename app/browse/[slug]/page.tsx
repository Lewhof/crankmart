import type { Metadata } from 'next'
import ListingDetailClient from './ListingDetail'
import { buildAlternates } from '@/lib/hreflang'
import { getCountry } from '@/lib/country'
import { getCountryConfig } from '@/lib/country-config'
import { formatPrice } from '@/lib/currency'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const alternates = buildAlternates(`/browse/${params.slug}`)
  const country = await getCountry()
  const cfg = getCountryConfig(country)

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://crankmart.com'
    const res = await fetch(`${baseUrl}/api/listings/${params.slug}`, {
      headers: { 'x-country': country },
      next: { revalidate: 300 },
    })
    if (!res.ok) throw new Error('Not found')
    const listing = await res.json()

    const make  = listing.bikeMake  ? `${listing.bikeMake} ` : ''
    const model = listing.bikeModel ? `${listing.bikeModel} ` : ''
    const year  = listing.bikeYear  ? `${listing.bikeYear} ` : ''
    const title = `${make}${model}${year}— CrankMart`.trim()

    const condMap: Record<string, string> = {
      new: 'New', like_new: 'Like New', used: 'Used', poor: 'Poor'
    }
    const cond   = condMap[listing.condition] ?? listing.condition
    const price  = formatPrice(country, listing.price)
    const where  = [listing.city, listing.province].filter(Boolean).join(', ')
    const desc   = `${cond} ${listing.title} for ${price}${where ? ` in ${where}` : ''}. Listed on CrankMart ${country.toUpperCase()}.`

    const image  = listing.images?.[0]?.imageUrl ?? listing.images?.[0]?.image_url ?? null
    const url    = alternates.canonical

    return {
      title,
      description: desc,
      alternates,
      openGraph: {
        title,
        description: desc,
        url,
        siteName: 'CrankMart',
        type: 'website',
        ...(image ? { images: [{ url: image.startsWith('http') ? image : `${baseUrl}${image}`, width: 1200, height: 630, alt: title }] } : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: desc,
        ...(image ? { images: [image.startsWith('http') ? image : `${baseUrl}${image}`] } : {}),
      },
    }
  } catch {
    return {
      title: 'Listing — CrankMart',
      description: `Buy and sell bikes, gear, and cycling equipment in ${cfg.name}.`,
      alternates,
    }
  }
}

export default function ListingDetailPage({ params }: Props) {
  return <ListingDetailClient />
}
