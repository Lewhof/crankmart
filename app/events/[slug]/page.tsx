import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { getCountry } from '@/lib/country'
import { buildAlternates } from '@/lib/hreflang'
import EventDetail from './EventDetail'

type Props = { params: Promise<{ slug: string }> }

const TYPE_LABELS: Record<string, string> = {
  race: 'Race', stage_race: 'Stage Race', fun_ride: 'Fun Ride',
  social_ride: 'Social Ride', tour: 'Tour', training_camp: 'Training Camp', festival: 'Festival'
}

async function fetchEvent(slug: string) {
  const country = await getCountry()
  const result = await db.execute(sql`
    SELECT * FROM events WHERE slug = ${slug} AND country = ${country} LIMIT 1
  `)
  const rows = (result.rows ?? result) as any[]
  return rows[0] ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const event = await fetchEvent(slug)
    if (!event) throw new Error('not found')
    const typeLabel = TYPE_LABELS[event.event_type] || event.event_type
    return {
      title: `${event.title} | CrankMart Events`,
      description: event.description || `Join ${event.title}, a ${typeLabel} in ${event.city}, ${event.province} on ${new Date(event.event_date_start).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}.`,
      openGraph: {
        title: event.title,
        description: event.description,
        url: `https://crankmart.com/events/${slug}`,
        siteName: 'CrankMart',
        type: 'website',
        ...(event.cover_image_url && { images: [{ url: event.cover_image_url, width: 1200, height: 630 }] }),
      },
      twitter: {
        card: 'summary_large_image',
        title: event.title,
        description: event.description,
        ...(event.cover_image_url && { images: [event.cover_image_url] }),
      },
      alternates: buildAlternates(`/events/${slug}`),
    }
  } catch {
    return { title: 'CrankMart Events', description: 'Find upcoming cycling events across South Africa.' }
  }
}

function buildJsonLd(event: any, slug: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: event.title,
    description: event.description ?? undefined,
    startDate: event.event_date_start,
    endDate: event.event_date_end ?? undefined,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    sport: 'Cycling',
    location: {
      '@type': 'Place',
      name: event.venue_name || `${event.city}, ${event.province}`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.city,
        addressRegion: event.province,
        addressCountry: (event.country || 'za').toUpperCase(),
      },
    },
    image: event.cover_image_url || undefined,
    url: `https://crankmart.com/events/${slug}`,
    organizer: event.organiser_name
      ? {
          '@type': 'Organization',
          name: event.organiser_name,
          url: event.organiser_website || undefined,
        }
      : undefined,
    offers: event.entry_url
      ? {
          '@type': 'Offer',
          url: event.entry_url,
          price: event.entry_fee ?? undefined,
          priceCurrency: 'ZAR',
          availability: 'https://schema.org/InStock',
        }
      : undefined,
  }
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params
  const event = await fetchEvent(slug)
  if (!event) notFound()
  const jsonLd = buildJsonLd(event, slug)
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EventDetail event={event} />
    </>
  )
}
