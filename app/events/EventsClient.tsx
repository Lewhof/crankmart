'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MapPin, Calendar, ChevronRight, Search, ExternalLink, Users } from 'lucide-react'
import { countryFromPath, getProvincesStatic } from '@/lib/regions-static'
import { getLocale } from '@/lib/currency'

interface Event {
  id: string; title: string; slug: string; description: string
  event_type: string; city: string; province: string
  event_date_start: string; event_date_end: string
  entry_url: string; entry_status: string; cover_image_url: string
  is_featured: boolean; discipline: string[]
  entry_fee?: string; distance?: string; organiser_name?: string; organiser_website?: string
}

interface Organiser {
  id: string; name: string; slug: string; description: string
  city: string; province: string; website: string
  logo_url: string; cover_url: string
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const TYPES = [
  { value: '', label: 'All' },
  { value: 'race', label: 'Race' },
  { value: 'stage_race', label: 'Stage Race' },
  { value: 'fun_ride', label: 'Fun Ride' },
  { value: 'social_ride', label: 'Social Ride' },
  { value: 'tour', label: 'Tour' },
  { value: 'training_camp', label: 'Training Camp' },
  { value: 'festival', label: 'Festival' },
]
const TYPE_COLORS: Record<string, string> = {
  race: '#EF4444', stage_race: '#0D1B2A', fun_ride: '#10B981',
  social_ride: '#3B82F6', tour: '#F59E0B', training_camp: '#8B5CF6',
  festival: '#EC4899', default: '#6B7280'
}
const TYPE_LABELS: Record<string, string> = {
  race: 'Race', stage_race: 'Stage Race', fun_ride: 'Fun Ride',
  social_ride: 'Social Ride', tour: 'Tour', training_camp: 'Training Camp', festival: 'Festival'
}

function formatDate(d: string, locale: string) {
  return new Date(d).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
}
function getMonth(d: string) { return new Date(d).getMonth() }
function gradientFor(type: string) {
  const g: Record<string, string> = {
    race: 'linear-gradient(135deg, #1e3a5f, #0D1B2A)',
    stage_race: 'linear-gradient(135deg, #0D1B2A, #1a5276)',
    fun_ride: 'linear-gradient(135deg, #0d6e4e, #10B981)',
    social_ride: 'linear-gradient(135deg, #1a4f8a, #3B82F6)',
    tour: 'linear-gradient(135deg, #92400e, #F59E0B)',
    training_camp: 'linear-gradient(135deg, #4c1d95, #8B5CF6)',
    festival: 'linear-gradient(135deg, #831843, #EC4899)',
  }
  return g[type] || 'linear-gradient(135deg, #374151, #6B7280)'
}

export default function EventsPage() {
  const country = countryFromPath(usePathname())
  const locale = getLocale(country)
  const PROVINCES = ['', ...getProvincesStatic(country)]
  const [activeView, setActiveView] = useState<'events' | 'organisers'>('events')
  const [events, setEvents] = useState<Event[]>([])
  const [pastEvents, setPastEvents] = useState<Event[]>([])
  const [pastOpen, setPastOpen] = useState(false)
  const [organisers, setOrganisers] = useState<Organiser[]>([])
  const [loading, setLoading] = useState(true)
  const [orgLoading, setOrgLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [province, setProvince] = useState('')
  const [month, setMonth] = useState<number | null>(null)
  const [orgProvince, setOrgProvince] = useState('')

  const hasActiveFilters = Boolean(search || type || province || month !== null)
  const clearFilters = () => { setSearch(''); setType(''); setProvince(''); setMonth(null) }

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ limit: '200' })
    if (type) params.set('type', type)
    if (province) params.set('province', province)
    if (month !== null) params.set('month', String(month + 1))
    if (search) params.set('search', search)
    fetch(`/api/events?${params}`, { headers: { 'x-country': country } })
      .then(r => r.json())
      .then(d => setEvents(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }, [type, province, month, search, country])

  useEffect(() => {
    fetch(`/api/events?past=1&limit=50`, { headers: { 'x-country': country } })
      .then(r => r.json())
      .then(d => setPastEvents(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [country])

  useEffect(() => {
    if (activeView !== 'organisers' || organisers.length > 0) return
    setOrgLoading(true)
    const params = new URLSearchParams({ limit: '200', type: 'event_organiser' })
    if (orgProvince) params.set('province', orgProvince)
    fetch(`/api/directory?${params}`, { headers: { 'x-country': country } })
      .then(r => r.json())
      .then(d => setOrganisers(Array.isArray(d.data) ? d.data : []))
      .finally(() => setOrgLoading(false))
  }, [activeView, orgProvince, country])

  const currentMonth = new Date().getMonth()
  const monthsWithEvents = new Set(events.map(e => getMonth(e.event_date_start)))

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <style>{`
        .ev-hero { background: linear-gradient(135deg, #1a2744, #0D1B2A); padding: 48px 20px 40px; text-align: center; }
        @media(min-width:768px) { .ev-hero { padding: 56px 24px 48px; } }
        .ev-hero h1 { font-size: 28px; font-weight: 800; color: #fff; margin-bottom: 8px; }
        @media(min-width:768px) { .ev-hero h1 { font-size: 36px; } }
        .ev-hero p { font-size: 15px; color: rgba(255,255,255,.7); margin-bottom: 24px; }
        .search-wrap { position: relative; max-width: 560px; margin: 0 auto; }
        .search-wrap input { width: 100%; height: 52px; padding: 0 52px 0 20px; border-radius: 10px; border: 2px solid rgba(255,255,255,0.25); font-size: 15px; font-weight: 500; outline: none; box-sizing: border-box; background: rgba(255,255,255,0.15); color: #fff; backdrop-filter: blur(4px); transition: border-color .2s, background .2s; }
        .search-wrap input::placeholder { color: rgba(255,255,255,0.55); }
        .search-wrap input:focus { border-color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.22); }
        .search-icon { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.6); pointer-events: none; }

        /* View tabs — matches Routes/Directory style */
        .ev-tabs { background: #fff; border-bottom: 1px solid #ebebeb; }
        .ev-tabs-inner { display: flex; max-width: 1280px; margin: 0 auto; padding: 0 16px; }
        @media(min-width:768px) { .ev-tabs-inner { padding: 0 24px; } }
        .ev-tab { padding: 12px 18px; border: none; background: none; cursor: pointer; font-size: 13px; font-weight: 600; color: #9a9a9a; border-bottom: 2px solid transparent; display: flex; align-items: center; gap: 6px; white-space: nowrap; transition: color .12s, border-color .12s; }
        .ev-tab.active { color: #0D1B2A; border-bottom-color: #0D1B2A; }
        .ev-tab:hover:not(.active) { color: #555; }

        .month-strip { background: #fff; border-bottom: 1px solid #ebebeb; overflow-x: auto; scrollbar-width: none; }
        .month-strip::-webkit-scrollbar { display: none; }
        .month-inner { display: flex; gap: 0; min-width: max-content; padding: 0 16px; max-width: 1280px; margin: 0 auto; }
        @media(min-width: 768px) { .month-inner { padding: 0 24px; } }
        .month-btn { padding: 12px 16px; border: none; background: none; cursor: pointer; font-size: 13px; font-weight: 600; color: #9a9a9a; border-bottom: 2px solid transparent; white-space: nowrap; position: relative; }
        .month-btn.active { color: #0D1B2A; border-bottom-color: #0D1B2A; }
        .month-btn.has-events::after { content: ''; width: 4px; height: 4px; background: var(--color-primary); border-radius: 50%; position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%); }
        .month-btn:not(.active).has-events { color: #1a1a1a; }

        .filters-outer { background: #fff; border-bottom: 1px solid #ebebeb; overflow-x: auto; scrollbar-width: none; }
        .filters-outer::-webkit-scrollbar { display: none; }
        .filters-row { padding: 10px 16px; display: flex; gap: 8px; max-width: 1280px; margin: 0 auto; align-items: center; min-width: max-content; }
        @media(min-width: 768px) { .filters-row { padding: 10px 24px; } }
        .type-pill { flex-shrink: 0; padding: 7px 16px; border-radius: 2px; border: 1px solid #e4e4e7; background: #fff; font-size: 13px; font-weight: 500; color: #1a1a1a; cursor: pointer; white-space: nowrap; transition: all .12s; }
        .type-pill.active { background: var(--color-primary); border-color: #0D1B2A; color: #fff; }
        .prov-select { flex-shrink: 0; height: 36px; padding: 0 10px; border-radius: 2px; border: 1px solid #e4e4e7; font-size: 13px; font-weight: 500; background: #fff; color: #1a1a1a; outline: none; cursor: pointer; }

        .events-wrap { max-width: 1280px; margin: 0 auto; padding: 16px; }
        @media(min-width: 768px) { .events-wrap { padding: 20px 24px; } }
        .events-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media(min-width: 768px) { .events-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; } }
        @media(min-width: 1100px) { .events-grid { grid-template-columns: repeat(4, 1fr); } }

        .ev-card { background: #fff; border-radius: 2px; border: 1px solid #ebebeb; overflow: hidden; text-decoration: none; display: flex; flex-direction: column; transition: box-shadow .15s; }
        .ev-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.1); }
        .ev-banner { height: 110px; display: flex; align-items: flex-end; padding: 10px; position: relative; }
        @media(min-width: 768px) { .ev-banner { height: 140px; } }
        .type-badge { font-size: 10px; font-weight: 700; color: #fff; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: .4px; }
        .featured-star { position: absolute; top: 8px; right: 8px; background: #F59E0B; color: #fff; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; }
        .ev-body { padding: 12px; flex: 1; display: flex; flex-direction: column; min-height: 0; }
        .ev-title { font-size: 13px; font-weight: 700; color: #1a1a1a; margin-bottom: 6px; line-height: 1.3; }
        @media(min-width: 768px) { .ev-title { font-size: 14px; } }
        .ev-meta { font-size: 11px; color: #9a9a9a; display: flex; flex-direction: column; gap: 3px; margin-bottom: 8px; }
        .ev-meta span { display: flex; align-items: center; gap: 4px; }
        .ev-chips { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 8px; }
        .ev-chip { font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 4px; background: #f0f4ff; color: #0D1B2A; border: 1px solid #d0dbf5; white-space: nowrap; }
        .ev-chip.fee { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
        .ev-visit { display: flex; align-items: center; justify-content: center; gap: 5px; width: 100%; height: 32px; background: var(--color-primary); color: #fff; border-radius: 2px; font-size: 12px; font-weight: 700; text-decoration: none; margin-top: auto; flex-shrink: 0; transition: background .15s; }
        .ev-visit:hover { background: #1e2d5a; }
        .ev-visit-placeholder { height: 32px; margin-top: auto; flex-shrink: 0; }

        /* Organiser cards */
        .org-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media(min-width: 640px) { .org-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; } }
        @media(min-width: 1024px) { .org-grid { grid-template-columns: repeat(4, 1fr); } }
        .org-card { background: #fff; border-radius: 2px; border: 1px solid #ebebeb; overflow: hidden; display: flex; flex-direction: column; transition: box-shadow .15s; }
        .org-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.1); }
        .org-cover { height: 100px; background-size: cover; background-position: center; background-color: #e8edf5; position: relative; display: flex; align-items: center; justify-content: center; }
        @media(min-width:768px) { .org-cover { height: 120px; } }
        .org-logo-wrap { width: 52px; height: 52px; border-radius: 6px; background: #fff; border: 1px solid #e4e4e7; display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.12); }
        .org-logo-wrap img { width: 100%; height: 100%; object-fit: contain; padding: 4px; }
        .org-logo-fallback { width: 28px; height: 28px; color: #9a9a9a; }
        .org-body { padding: 12px; flex: 1; display: flex; flex-direction: column; }
        .org-name { font-size: 13px; font-weight: 700; color: #1a1a1a; margin-bottom: 4px; line-height: 1.3; }
        @media(min-width:768px) { .org-name { font-size: 14px; } }
        .org-location { font-size: 11px; color: #9a9a9a; display: flex; align-items: center; gap: 3px; margin-bottom: 8px; }
        .org-desc { font-size: 12px; color: #666; line-height: 1.4; flex: 1; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }
        .org-visit { display: flex; align-items: center; justify-content: center; gap: 5px; width: 100%; height: 32px; background: var(--color-primary); color: #fff; border-radius: 2px; font-size: 12px; font-weight: 700; text-decoration: none; margin-top: 10px; transition: background .15s; }
        .org-visit:hover { background: #1e2d5a; }

        .empty { text-align: center; padding: 60px 20px; }
        .section-head { font-size: 13px; font-weight: 700; color: #9a9a9a; text-transform: uppercase; letter-spacing: .6px; margin-bottom: 12px; }
      `}</style>

      {/* Hero */}
      <div className="ev-hero">
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <h1>Cycling Events in South Africa</h1>
          <p>Races, tours, sportives and fun rides across all 9 provinces</p>
          {activeView === 'events' && (
            <div className="search-wrap">
              <input type="text" placeholder="Search events, cities..." value={search} onChange={e => setSearch(e.target.value)} />
              <Search size={18} className="search-icon" />
            </div>
          )}
        </div>
      </div>

      {/* View tabs — Events | Organisers */}
      <div className="ev-tabs">
        <div className="ev-tabs-inner">
          <button
            className={`ev-tab${activeView === 'events' ? ' active' : ''}`}
            onClick={() => setActiveView('events')}
          >
            <Calendar size={14} /> Events
          </button>
          <button
            className={`ev-tab${activeView === 'organisers' ? ' active' : ''}`}
            onClick={() => setActiveView('organisers')}
          >
            <Users size={14} /> Organisers
          </button>
        </div>
      </div>

      {activeView === 'events' ? (
        <>
          {/* Month strip */}
          <div className="month-strip">
            <div className="month-inner">
              <button className={`month-btn${month === null ? ' active' : ''}`} onClick={() => setMonth(null)}>All</button>
              {MONTHS.map((m, i) => (
                <button key={m}
                  className={`month-btn${month === i ? ' active' : ''}${monthsWithEvents.has(i) ? ' has-events' : ''}`}
                  onClick={() => setMonth(month === i ? null : i)}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="filters-outer">
            <div className="filters-row">
              <button className={`type-pill${type === '' ? ' active' : ''}`} onClick={() => setType('')}>All</button>
              <select className="prov-select" value={province} onChange={e => setProvince(e.target.value)}>
                <option value="">All provinces</option>
                {PROVINCES.filter(Boolean).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <div style={{ width: 1, height: 24, background: '#e4e4e7', flexShrink: 0 }} />
              {TYPES.filter(t => t.value !== '').map(t => (
                <button key={t.value} className={`type-pill${type === t.value ? ' active' : ''}`}
                  onClick={() => setType(t.value)}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Events grid */}
          <div className="events-wrap">
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} style={{ background: '#f0f0f0', borderRadius: 2, height: 200, animation: 'pulse 1.4s infinite' }} />
                ))}
                <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
              </div>
            ) : events.length === 0 ? (
              <div className="empty">
                <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>
                  {hasActiveFilters ? 'No events match your filters' : 'No upcoming events right now'}
                </p>
                <p style={{ fontSize: 14, color: '#9a9a9a', marginBottom: 16 }}>
                  {hasActiveFilters ? 'Try broadening the search, or clear filters to see everything.' : 'Check back soon — new events are added weekly.'}
                </p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 2, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="events-grid">
                {events.map(e => <EventCard key={e.id} event={e} gradientFor={gradientFor} locale={locale} />)}
              </div>
            )}

            {/* Past events — collapsed by default, last 60 days */}
            {pastEvents.length > 0 && (
              <div style={{ marginTop: 32, borderTop: '1px solid #ebebeb', paddingTop: 24 }}>
                <button
                  onClick={() => setPastOpen(o => !o)}
                  style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>
                    Recent past events ({pastEvents.length})
                  </span>
                  <span style={{ fontSize: 13, color: '#9a9a9a' }}>{pastOpen ? 'Hide' : 'Show'}</span>
                </button>
                {pastOpen && (
                  <div className="events-grid" style={{ marginTop: 16, opacity: 0.75 }}>
                    {pastEvents.map(e => <EventCard key={e.id} event={e} gradientFor={gradientFor} locale={locale} />)}
                  </div>
                )}
              </div>
            )}
            <div style={{ textAlign: 'center', padding: '40px 0 20px' }}>
              <p style={{ fontSize: 14, color: '#9a9a9a', marginBottom: 12 }}>Organising an event?</p>
              <Link href="/events/submit" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--color-primary)', color: '#fff', padding: '10px 20px', borderRadius: 2, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                Submit your event →
              </Link>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Organisers filter bar */}
          <div className="filters-outer">
            <div className="filters-row">
              <select className="prov-select" value={orgProvince} onChange={e => { setOrgProvince(e.target.value); setOrganisers([]); }}>
                <option value="">All provinces</option>
                {PROVINCES.filter(Boolean).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Organisers grid */}
          <div className="events-wrap">
            <p style={{ fontSize: 13, color: '#9a9a9a', marginBottom: 16 }}>
              Event organisers, cycling clubs and race series listed on CrankMart
            </p>
            {orgLoading ? (
              <div className="org-grid">
                {[...Array(8)].map((_, i) => (
                  <div key={i} style={{ background: '#f0f0f0', borderRadius: 2, height: 180, animation: 'pulse 1.4s infinite' }} />
                ))}
                <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
              </div>
            ) : organisers.length === 0 ? (
              <div className="empty">
                <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>No organisers found</p>
                <p style={{ fontSize: 14, color: '#9a9a9a' }}>Try a different province</p>
              </div>
            ) : (
              <div className="org-grid">
                {organisers.map(o => <OrganiserCard key={o.id} org={o} />)}
              </div>
            )}
            <div style={{ textAlign: 'center', padding: '40px 0 20px' }}>
              <p style={{ fontSize: 14, color: '#9a9a9a', marginBottom: 12 }}>Are you an event organiser?</p>
              <Link href="/events/submit" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--color-primary)', color: '#fff', padding: '10px 20px', borderRadius: 2, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                Get listed →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function EventCard({ event, gradientFor, locale }: { event: Event; gradientFor: (t: string) => string; locale: string }) {
  const color = TYPE_COLORS[event.event_type] || TYPE_COLORS.default
  const label = TYPE_LABELS[event.event_type] || event.event_type
  return (
    <div className="ev-card">
      <Link href={`/events/${event.slug}`} style={{ textDecoration: 'none', display: 'block', flexShrink: 0 }}>
        <div className="ev-banner" style={{ background: event.cover_image_url ? `url(${event.cover_image_url}) center/cover no-repeat` : gradientFor(event.event_type) }}>
          <span className="type-badge" style={{ background: color }}>{label}</span>
          {event.is_featured && <span className="featured-star">★ Featured</span>}
        </div>
      </Link>
      <div className="ev-body">
        <Link href={`/events/${event.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
          <div className="ev-title">{event.title}</div>
          <div className="ev-meta">
            <span><Calendar size={10} />{new Date(event.event_date_start).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span><MapPin size={10} />{event.city}, {event.province}</span>
          </div>
          <div className="ev-chips">
            {event.distance && <span className="ev-chip">{event.distance}</span>}
            {event.entry_fee && <span className="ev-chip fee">{event.entry_fee}</span>}
          </div>
        </Link>
        {event.entry_url
          ? <a href={event.entry_url} target="_blank" rel="noopener noreferrer" className="ev-visit">
              <ExternalLink size={11} /> Visit Website
            </a>
          : <div className="ev-visit-placeholder" />
        }
      </div>
    </div>
  )
}

function OrganiserCard({ org }: { org: Organiser }) {
  return (
    <div className="org-card">
      <div
        className="org-cover"
        style={{ backgroundImage: org.cover_url && !org.cover_url.includes('placeholder') ? `url(${org.cover_url})` : undefined }}
      >
        <div className="org-logo-wrap">
          {org.logo_url
            ? <img src={org.logo_url} alt={org.name} />
            : <Users size={28} className="org-logo-fallback" />
          }
        </div>
      </div>
      <div className="org-body">
        <div className="org-name">{org.name}</div>
        {(org.city || org.province) && (
          <div className="org-location">
            <MapPin size={10} />
            {[org.city, org.province].filter(Boolean).join(', ')}
          </div>
        )}
        {org.description && <div className="org-desc">{org.description}</div>}
        {org.website && (
          <a href={org.website} target="_blank" rel="noopener noreferrer" className="org-visit">
            <ExternalLink size={11} /> View Website
          </a>
        )}
      </div>
    </div>
  )
}
