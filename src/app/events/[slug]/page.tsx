'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Event {
  id: string
  title: string
  slug: string
  description: string
  eventType: string
  status: string
  startDate: string
  endDate?: string
  province: string
  city: string
  venue: string
  distance: string
  entryFee: string
  entryUrl: string
  websiteUrl?: string
  bannerUrl?: string
  organiserName: string
  organiserEmail: string
  organiserPhone?: string
  isFeatured: boolean
  viewsCount: number
  savesCount: number
}

const eventTypeColors: Record<string, string> = {
  race: '#EF4444',
  sportive: '#3B82F6',
  fun_ride: '#10B981',
  training_camp: '#8B5CF6',
  expo: '#F59E0B',
  club_event: '#6366F1',
  charity_ride: '#EC4899',
  social_ride: '#14B8A6',
}

const eventTypeEmojis: Record<string, string> = {
  race: '🏁',
  sportive: '🏃',
  fun_ride: '😊',
  training_camp: '🎯',
  expo: '🎪',
  club_event: '👥',
  charity_ride: '❤️',
  social_ride: '🚴',
}

export default function EventDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvent()
  }, [params.slug])

  async function fetchEvent() {
    setLoading(true)
    try {
      const res = await fetch(`/api/events/${params.slug}`)
      if (!res.ok) throw new Error('Event not found')
      const data = await res.json()
      setEvent(data)

      // Fetch related events (same type)
      const relatedRes = await fetch(`/api/events?type=${data.eventType}&limit=3`)
      const relatedData = await relatedRes.json()
      setRelatedEvents(relatedData.events?.filter((e: Event) => e.slug !== params.slug).slice(0, 3) || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load event')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '16px', color: '#666' }}>Loading event...</p>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '40px 16px', textAlign: 'center' }}>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>{error || 'Event not found'}</p>
        <Link href="/events" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '600' }}>← Back to Events</Link>
      </div>
    )
  }

  const getGradient = (type: string) => {
    const color = eventTypeColors[type] || '#6366F1'
    return `linear-gradient(135deg, ${color}, ${color}dd)`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleDateString('en-ZA', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ background: 'white', padding: '20px 0', borderBottom: '1px solid #e0e0e0', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-primary)', margin: 0 }}>📅 CycleMart Events</h1>
          <Link href="/events" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '600', cursor: 'pointer' }}>← Back</Link>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px', marginBottom: '40px' }}>
        {/* Event Header */}
        <div style={{ background: 'white', marginBottom: '20px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{
            width: '100%',
            height: '300px',
            background: event.bannerUrl ? `url(${event.bannerUrl})` : getGradient(event.eventType),
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '80px',
            position: 'relative',
          }}>
            {eventTypeEmojis[event.eventType] || '🚴'}
          </div>
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
              <h1 style={{ fontSize: '32px', margin: 0, color: '#1a1a1a' }}>{event.title}</h1>
              {event.isFeatured && (
                <div style={{ background: '#FF9800', color: 'white', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                  Featured
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px', fontSize: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>📅</span>
                <div>
                  <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase' }}>When</div>
                  <div style={{ fontWeight: '600', color: '#1a1a1a' }}>
                    {formatTime(event.startDate)}
                    {event.endDate && ` - ${formatTime(event.endDate)}`}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>📍</span>
                <div>
                  <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase' }}>Location</div>
                  <div style={{ fontWeight: '600', color: '#1a1a1a' }}>{event.city}, {event.province}</div>
                </div>
              </div>
              {event.distance && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>🚴</span>
                  <div>
                    <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase' }}>Distance</div>
                    <div style={{ fontWeight: '600', color: '#1a1a1a' }}>{event.distance}</div>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>💰</span>
                <div>
                  <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase' }}>Entry Fee</div>
                  <div style={{ fontWeight: '600', color: 'var(--color-primary)' }}>{event.entryFee}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a href={event.entryUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '12px 24px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', textDecoration: 'none' }}>
                🔗 Enter Now
              </a>
              <button style={{ padding: '12px 24px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', background: 'transparent', border: '1px solid #e0e0e0', color: '#1a1a1a', borderRadius: '8px' }}>
                ❤️ Save Event
              </button>
              <button style={{ padding: '12px 24px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', background: 'transparent', border: '1px solid #e0e0e0', color: '#1a1a1a', borderRadius: '8px' }}>
                📤 Share
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '40px' }}>
          {/* Left Column */}
          <div>
            {/* About */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', borderBottom: '2px solid #0D1B2A', paddingBottom: '8px' }}>About This Event</h2>
              <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#555' }}>{event.description || 'No description provided.'}</p>
            </div>

            {/* Entry Information */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', borderBottom: '2px solid #0D1B2A', paddingBottom: '8px' }}>Entry Information</h2>
              <div style={{ background: '#f9f9f9', padding: '16px', borderRadius: '8px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '4px' }}>Entry Status</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-primary)' }}>Entries Open</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#4CAF50', fontWeight: '700' }}>Accepting entries</div>
                  <div style={{ fontSize: '12px', color: '#999' }}>Contact organizer for details</div>
                </div>
              </div>
              <a href={event.entryUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', padding: '12px 0', background: 'var(--color-primary)', color: 'white', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', textDecoration: 'none' }}>
                → Continue to Entry Platform
              </a>
            </div>

            {/* Organiser */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', borderBottom: '2px solid #0D1B2A', paddingBottom: '8px' }}>Organiser</h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '64px', height: '64px', background: '#e8e8e8', borderRadius: '8px', flex: '0 0 auto' }}></div>
                <div>
                  <div style={{ fontWeight: '700', marginBottom: '4px', color: '#1a1a1a' }}>{event.organiserName}</div>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Event organiser</div>
                  <div style={{ fontSize: '13px' }}>
                    {event.organiserEmail && <div>📧 {event.organiserEmail}</div>}
                    {event.organiserPhone && <div>📞 {event.organiserPhone}</div>}
                    {event.websiteUrl && <div><a href={event.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>🌐 Website</a></div>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div>
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: 'fit-content' }}>
              <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e0e0e0' }}>
                <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', fontWeight: '700', marginBottom: '8px' }}>Event Type</div>
                <div style={{ display: 'inline-block', background: 'var(--color-primary)', color: 'white', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '700', textTransform: 'capitalize' }}>
                  {event.eventType.replace('_', ' ')}
                </div>
              </div>

              <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e0e0e0' }}>
                <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', fontWeight: '700', marginBottom: '8px' }}>Location Details</div>
                <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '2px' }}>City</div>
                    {event.city}, {event.province}
                  </div>
                  {event.venue && (
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '2px' }}>Venue</div>
                      {event.venue}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e0e0e0' }}>
                <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', fontWeight: '700', marginBottom: '12px' }}>Share Event</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f5f5f5', border: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#0D1B2A'; e.currentTarget.style.color = 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = 'inherit'; }}>
                    💬
                  </button>
                  <button style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f5f5f5', border: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#0D1B2A'; e.currentTarget.style.color = 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = 'inherit'; }}>
                    𝕏
                  </button>
                  <button style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f5f5f5', border: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#0D1B2A'; e.currentTarget.style.color = 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = 'inherit'; }}>
                    👍
                  </button>
                  <button style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f5f5f5', border: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#0D1B2A'; e.currentTarget.style.color = 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = 'inherit'; }}>
                    🏃
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '20px', paddingBottom: '0', borderBottom: 'none' }}>
                <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', fontWeight: '700', marginBottom: '8px' }}>Quick Info</div>
                <div style={{ fontSize: '12px', lineHeight: '1.8', color: '#666' }}>
                  <div>📌 {event.endDate ? '3-day event' : 'Single-day event'}</div>
                  <div>🎯 {event.eventType === 'race' ? 'Competitive' : 'Fun & Social'}</div>
                  <div>✓ Verified event</div>
                </div>
              </div>

              <button style={{ width: '100%', marginTop: '16px', padding: '12px 0', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                Save Event
              </button>
            </div>
          </div>
        </div>

        {/* Related Events */}
        {relatedEvents.length > 0 && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: '#1a1a1a' }}>Similar Events</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '40px' }}>
              {relatedEvents.map((relEvent) => (
                <Link key={relEvent.id} href={`/events/${relEvent.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: 'all 0.2s', cursor: 'pointer' }}>
                    <div style={{ width: '100%', height: '140px', background: getGradient(relEvent.eventType), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>
                      {eventTypeEmojis[relEvent.eventType]}
                    </div>
                    <div style={{ padding: '12px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px', color: '#1a1a1a', lineHeight: '1.2' }}>
                        {relEvent.title}
                      </h3>
                      <p style={{ fontSize: '12px', color: '#666', margin: '0 0 8px 0' }}>
                        {new Date(relEvent.startDate).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })} • {relEvent.entryFee}
                      </p>
                      <button style={{ width: '100%', padding: '8px 0', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                        View
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
