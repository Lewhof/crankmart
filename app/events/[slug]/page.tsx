import type { Metadata } from 'next'
import EventDetail from './EventDetail'

type Props = { params: Promise<{ slug: string }> }

const TYPE_LABELS: Record<string, string> = {
  race: 'Race', stage_race: 'Stage Race', fun_ride: 'Fun Ride',
  social_ride: 'Social Ride', tour: 'Tour', training_camp: 'Training Camp', festival: 'Festival'
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://cyclemart.co.za'
    const res = await fetch(`${BASE}/api/events/${slug}`, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error('not found')
    const event = await res.json()
    const typeLabel = TYPE_LABELS[event.event_type] || event.event_type
    return {
      title: `${event.title} | CycleMart Events`,
      description: event.description || `Join ${event.title}, a ${typeLabel} in ${event.city}, ${event.province} on ${new Date(event.event_date_start).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}.`,
      openGraph: {
        title: event.title,
        description: event.description,
        url: `https://cyclemart.co.za/events/${slug}`,
        siteName: 'CycleMart',
        type: 'website',
        ...(event.cover_image_url && { images: [{ url: event.cover_image_url, width: 1200, height: 630 }] }),
      },
      twitter: {
        card: 'summary_large_image',
        title: event.title,
        description: event.description,
        ...(event.cover_image_url && { images: [event.cover_image_url] }),
      },
      alternates: { canonical: `https://cyclemart.co.za/events/${slug}` },
    }
  } catch {
    return { title: 'CycleMart Events', description: "Find upcoming cycling events across South Africa." }
  }
}

export default function EventPage() {
  return <EventDetail />
}
