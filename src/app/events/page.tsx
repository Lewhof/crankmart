'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Event {
  id: string
  title: string
  slug: string
  eventType: string
  startDate: string
  endDate?: string
  province: string
  city: string
  distance: string
  entryFee: string
  isFeatured: boolean
  bannerUrl?: string
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

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const eventTypes = ['race', 'sportive', 'fun_ride', 'training_camp', 'expo', 'club_event', 'charity_ride']
  const provinces = ['Western Cape', 'Eastern Cape', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'Free State', 'North West', 'Northern Cape']

  useEffect(() => {
    fetchEvents()
  }, [selectedType, selectedProvince, selectedMonth, searchQuery])

  async function fetchEvents() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedType) params.append('type', selectedType)
      if (selectedProvince) params.append('province', selectedProvince)
      if (selectedMonth) params.append('month', selectedMonth.toString())
      if (searchQuery) params.append('search', searchQuery)

      const res = await fetch(`/api/events?${params}`)
      const data = await res.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGradient = (type: string) => {
    const color = eventTypeColors[type] || '#6366F1'
    return `linear-gradient(135deg, ${color}, ${color}dd)`
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ background: 'white', padding: '20px 0', borderBottom: '1px solid #e0e0e0', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-primary)', margin: 0 }}>📅 Upcoming Cycling Events</h1>
          <Link href="/events/submit" style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>
            + Add Event
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        {/* Search */}
        <div style={{ background: 'white', padding: '20px 0', marginBottom: '20px', borderBottom: '1px solid #e0e0e0' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Search events, races, organizers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '16px' }}
            />
          </div>

          {/* Filter Chips */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>Type:</span>
            {eventTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(selectedType === type ? null : type)}
                style={{
                  background: selectedType === type ? '#0D1B2A' : 'white',
                  color: selectedType === type ? 'white' : '#1a1a1a',
                  border: selectedType === type ? '1px solid #0D1B2A' : '1px solid #e0e0e0',
                  padding: '8px 12px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginTop: '16px' }}>
            <span style={{ fontSize: '13px', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>Province:</span>
            <select
              value={selectedProvince || ''}
              onChange={(e) => setSelectedProvince(e.target.value || null)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '13px', cursor: 'pointer' }}
            >
              <option value="">All Provinces</option>
              {provinces.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Calendar Strip */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '12px 16px', marginBottom: '20px', background: 'white', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          {months.map((month, idx) => (
            <button
              key={month}
              onClick={() => setSelectedMonth(selectedMonth === idx + 1 ? null : idx + 1)}
              style={{
                flex: '0 0 auto',
                textAlign: 'center',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                minWidth: '70px',
                background: selectedMonth === idx + 1 ? '#0D1B2A' : 'white',
                color: selectedMonth === idx + 1 ? 'white' : '#1a1a1a',
                border: selectedMonth === idx + 1 ? '1px solid #0D1B2A' : '1px solid #e0e0e0',
                fontSize: '13px',
                fontWeight: '600',
              }}
            >
              {month}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p>Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', background: 'white', borderRadius: '8px' }}>
            <p style={{ fontSize: '16px', color: '#666' }}>No events found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginBottom: '40px' }}>
            {events.map((event) => (
              <Link key={event.id} href={`/events/${event.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: 'all 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'}>
                  <div style={{ width: '100%', height: '160px', background: event.bannerUrl ? `url(${event.bannerUrl})` : getGradient(event.eventType), backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', position: 'relative', overflow: 'hidden' }}>
                    {eventTypeEmojis[event.eventType] || '🚴'}
                    {event.isFeatured && (
                      <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#FF9800', color: 'white', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                        Featured
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: '#1a1a1a', lineHeight: '1.3' }}>
                      {event.title}
                    </h3>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap', fontSize: '13px', color: '#666' }}>
                      <span>📅 {new Date(event.startDate).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })}</span>
                      <span>📍 {event.city || event.province}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap', fontSize: '13px', color: '#666' }}>
                      {event.distance && <span>🚴 {event.distance}</span>}
                      <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>💰 {event.entryFee}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid #e0e0e0' }}>
                      <button style={{ flex: 1, padding: '10px 12px', border: 'none', background: 'var(--color-primary)', color: 'white', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); }}>
                        View Event
                      </button>
                      <button style={{ flex: '0.3', padding: '10px 12px', border: '1px solid #e0e0e0', background: 'transparent', color: '#1a1a1a', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); }}>
                        ❤️
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
