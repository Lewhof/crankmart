'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { MapPin, Navigation, TrendingUp, Clock, Mountain, ChevronRight, Search, Map, LayoutGrid, SlidersHorizontal, X, LocateFixed } from 'lucide-react'

const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false, loading: () => (
  <div style={{ width: '100%', height: '100%', background: '#E9ECF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <span style={{ color: '#9CA3AF', fontSize: 13 }}>Loading map…</span>
  </div>
) })

const DISCIPLINES = [
  { value: 'all',         label: 'All',         color: '#64748B' },
  { value: 'road',        label: 'Road',        color: '#3B82F6' },
  { value: 'mtb',         label: 'MTB',         color: '#7C3AED' },
  { value: 'gravel',      label: 'Gravel',      color: '#D97706' },
  { value: 'urban',       label: 'Urban',       color: '#10B981' },
  { value: 'bikepacking', label: 'Bikepacking', color: '#EC4899' },
]

const DIFFICULTIES = [
  { value: 'all',          label: 'All',          color: '#64748B' },
  { value: 'beginner',     label: 'Beginner',     color: '#16A34A' },
  { value: 'intermediate', label: 'Intermediate', color: '#D97706' },
  { value: 'advanced',     label: 'Advanced',     color: '#DC2626' },
  { value: 'expert',       label: 'Expert',       color: '#7C3AED' },
]

const PROVINCES = [
  'Western Cape', 'Gauteng', 'KwaZulu-Natal', 'Eastern Cape',
  'Limpopo', 'Mpumalanga', 'North West', 'Free State', 'Northern Cape',
]

const DISTANCE_RANGES = [
  { value: 'under30', label: 'Under 30 km' },
  { value: '30to60',  label: '30 – 60 km' },
  { value: '60to100', label: '60 – 100 km' },
  { value: 'over100', label: '100 km+' },
]

const FACILITY_FILTERS = [
  { key: 'parking',    label: 'Parking' },
  { key: 'coffee',     label: 'Coffee' },
  { key: 'showers',    label: 'Showers' },
  { key: 'restaurant', label: 'Restaurant' },
]

interface Route {
  id: string; slug: string; name: string; description: string
  discipline: string; difficulty: string; surface: string
  distance_km: string | null; elevation_m: number | null; est_time_min: number | null
  province: string; region: string; town: string
  lat: string | null; lng: string | null; hero_image_url: string | null
  facilities: Record<string, boolean> | null; tags: string[] | null; is_featured: boolean
  loop_difficulties: string[] | null
}

function formatTime(minutes: number | null): string {
  if (!minutes) return '–'
  const h = Math.floor(minutes / 60), m = minutes % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

function getDisciplineColor(d: string) { return DISCIPLINES.find(x => x.value === d)?.color ?? '#64748B' }
function getDifficultyColor(d: string) { return DIFFICULTIES.find(x => x.value === d)?.color ?? '#64748B' }

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ height: 120, background: '#f0f0f0' }} />
      <div style={{ padding: 16 }}>
        <div style={{ height: 16, background: '#f0f0f0', borderRadius: 4, marginBottom: 8 }} />
        <div style={{ height: 12, background: '#f5f5f5', borderRadius: 4, marginBottom: 12, width: '60%' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
          {[0,1,2].map(i => <div key={i} style={{ height: 52, background: '#f5f5f5', borderRadius: 2  }} />)}
        </div>
        <div style={{ height: 38, background: '#f0f0f0', borderRadius: 2  }} />
      </div>
    </div>
  )
}

export default function RoutesClient() {
  const [routes, setRoutes]         = useState<Route[]>([])
  const [allMapRoutes, setAllMapRoutes] = useState<Route[]>([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]       = useState(true)
  const [mapLoading, setMapLoading] = useState(false)

  const [discipline,    setDiscipline]    = useState('all')
  const [province,      setProvince]      = useState('')
  const [city,          setCity]          = useState('')
  const [availCities,   setAvailCities]   = useState<string[]>([])
  const [difficulty,    setDifficulty]    = useState('all')
  const [distanceRange, setDistanceRange] = useState('')
  const [facilities,    setFacilities]    = useState<string[]>([])
  const [search,        setSearch]        = useState('')
  const [searchInput,   setSearchInput]   = useState('')
  const [activeTab,     setActiveTab]     = useState<'list' | 'map'>('list')
  const [showFilters,   setShowFilters]   = useState(false)
  const [userLat,       setUserLat]       = useState<number | null>(null)
  const [userLng,       setUserLng]       = useState<number | null>(null)
  const [nearMe,        setNearMe]        = useState(false)
  const [nearbyKm,      setNearbyKm]      = useState(50)
  const [locating,      setLocating]      = useState(false)
  const [locateError,   setLocateError]   = useState<string | null>(null)

  const RADIUS_OPTIONS = [10, 25, 50, 100, 200]

  const handleNearMe = () => {
    if (nearMe) { setNearMe(false); return }
    if (!navigator.geolocation) { setLocateError('Geolocation not supported by your browser'); return }
    setLocating(true)
    setLocateError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude)
        setUserLng(pos.coords.longitude)
        setNearMe(true)
        setLocating(false)
        setPage(1)
      },
      () => {
        setLocateError('Location access denied. Enable location in your browser settings.')
        setLocating(false)
      },
      { timeout: 10000, enableHighAccuracy: false }
    )
  }

  // Fetch available cities (filtered by province when set)
  useEffect(() => {
    const params = new URLSearchParams()
    if (province) params.set('province', province)
    fetch(`/api/routes/cities?${params}`)
      .then(r => r.json())
      .then(d => setAvailCities(d.cities ?? []))
      .catch(() => setAvailCities([]))
  }, [province])

  // Reset city when province changes
  useEffect(() => { setCity('') }, [province])

  // Shared filter param builder (no pagination)
  const buildFilterParams = useCallback(() => {
    const params = new URLSearchParams()
    if (discipline !== 'all') params.set('discipline', discipline)
    if (province)             params.set('province', province)
    if (city)                 params.set('city', city)
    if (difficulty !== 'all') params.set('difficulty', difficulty)
    if (distanceRange)        params.set('distanceRange', distanceRange)
    if (search)               params.set('search', search)
    if (nearMe && userLat !== null && userLng !== null) {
      params.set('lat', String(userLat))
      params.set('lng', String(userLng))
      params.set('nearbyKm', String(nearbyKm))
    }
    return params
  }, [discipline, province, city, difficulty, distanceRange, search, nearMe, userLat, userLng, nearbyKm])

  // Paginated list fetch
  const fetchRoutes = useCallback(async () => {
    setLoading(true)
    try {
      const params = buildFilterParams()
      params.set('page', String(page))
      params.set('limit', '24')
      const res = await fetch(`/api/routes?${params}`)
      const data = await res.json()
      setRoutes(data.routes ?? [])
      setTotal(data.total ?? 0)
      setTotalPages(data.totalPages ?? 1)
    } catch { setRoutes([]) }
    finally { setLoading(false) }
  }, [buildFilterParams, page])

  // Map fetch — all matching routes (no pagination, up to 200)
  const fetchMapRoutes = useCallback(async () => {
    setMapLoading(true)
    try {
      const params = buildFilterParams()
      params.set('limit', '200')
      params.set('page', '1')
      const res = await fetch(`/api/routes?${params}`)
      const data = await res.json()
      setAllMapRoutes((data.routes ?? []).filter((r: Route) => r.lat && r.lng))
    } catch { setAllMapRoutes([]) }
    finally { setMapLoading(false) }
  }, [buildFilterParams])

  useEffect(() => { fetchRoutes() }, [fetchRoutes])
  useEffect(() => { fetchMapRoutes() }, [fetchMapRoutes])

  const mapRoutes = allMapRoutes as (Route & { lat: string; lng: string })[]

  const resetFilters = () => {
    setDiscipline('all'); setProvince(''); setCity(''); setDifficulty('all')
    setDistanceRange(''); setFacilities([]); setSearch(''); setSearchInput('')
    setNearMe(false); setPage(1)
  }

  const hasFilters = discipline !== 'all' || !!province || !!city || difficulty !== 'all' || !!distanceRange || facilities.length > 0 || !!search

  const FilterContent = () => (
    <div>
      {/* Discipline */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 10 }}>Discipline</div>
        {DISCIPLINES.map(d => (
          <button key={d.value} onClick={() => { setDiscipline(d.value); setPage(1) }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', marginBottom: 3, borderRadius: 2, border: discipline === d.value ? `1px solid ${d.color}` : '1px solid transparent', background: discipline === d.value ? `${d.color}15` : 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: discipline === d.value ? 700 : 500, color: '#1a1a1a', textAlign: 'left' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />{d.label}
          </button>
        ))}
      </div>
      {/* Province */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 10 }}>Province</div>
        <select value={province} onChange={e => { setProvince(e.target.value); setPage(1) }} style={{ width: '100%', padding: '8px 10px', borderRadius: 2, border: '1px solid #e4e4e7', fontSize: 13, color: '#1a1a1a', background: '#fff', cursor: 'pointer' }}>
          <option value=''>All Provinces</option>
          {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      {/* City */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 10 }}>City</div>
        <select value={city} onChange={e => { setCity(e.target.value); setPage(1) }} style={{ width: '100%', padding: '8px 10px', borderRadius: 2, border: '1px solid #e4e4e7', fontSize: 13, color: city ? '#1a1a1a' : '#9CA3AF', background: '#fff', cursor: 'pointer' }}>
          <option value=''>{province ? 'All Cities in Province' : 'All Cities'}</option>
          {availCities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {/* Difficulty */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 10 }}>Difficulty</div>
        {DIFFICULTIES.map(d => (
          <button key={d.value} onClick={() => { setDifficulty(d.value); setPage(1) }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', marginBottom: 3, borderRadius: 2, border: difficulty === d.value ? `1px solid ${d.color}` : '1px solid transparent', background: difficulty === d.value ? `${d.color}15` : 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: difficulty === d.value ? 700 : 500, color: '#1a1a1a', textAlign: 'left' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />{d.label}
          </button>
        ))}
      </div>
      {/* Distance */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 10 }}>Distance</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {DISTANCE_RANGES.map(r => (
            <button key={r.value} onClick={() => { setDistanceRange(distanceRange === r.value ? '' : r.value); setPage(1) }} style={{ padding: '7px 16px', borderRadius: 2, border: distanceRange === r.value ? '1px solid #1a1a1a' : '1px solid #e4e4e7', background: distanceRange === r.value ? '#1a1a1a' : '#fff', color: distanceRange === r.value ? '#fff' : '#1a1a1a', fontSize: 13, fontWeight: distanceRange === r.value ? 700 : 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>
      {/* Facilities */}
      <div style={{ padding: '16px 20px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 10 }}>Facilities</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {FACILITY_FILTERS.map(f => {
            const active = facilities.includes(f.key)
            return (
              <button key={f.key} onClick={() => { setFacilities(prev => active ? prev.filter(x => x !== f.key) : [...prev, f.key]); setPage(1) }} style={{ padding: '7px 16px', borderRadius: 2, border: active ? '1px solid #1a1a1a' : '1px solid #e4e4e7', background: active ? '#1a1a1a' : '#fff', color: active ? '#fff' : '#1a1a1a', fontSize: 13, fontWeight: active ? 700 : 500, cursor: 'pointer' }}>
                {f.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )

  const RouteCard = ({ route }: { route: Route & { distance_from_user?: number } }) => (
    <div className="rt-card" style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ height: 130, position: 'relative', overflow: 'hidden', background: route.hero_image_url ? 'none' : `linear-gradient(135deg, ${getDisciplineColor(route.discipline)}22, ${getDisciplineColor(route.discipline)}55)` }}>
        {route.hero_image_url
          ? <img src={route.hero_image_url} alt={route.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={32} style={{ color: getDisciplineColor(route.discipline), opacity: 0.4 }} /></div>
        }
        <span style={{ position: 'absolute', top: 8, left: 8, background: getDisciplineColor(route.discipline), color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 5, textTransform: 'uppercase' }}>{route.discipline}</span>
        <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
          {(route.loop_difficulties && route.loop_difficulties.length > 0
            ? route.loop_difficulties
            : [route.difficulty]
          ).map((d: string) => (
            <span key={d} style={{ background: '#fff', color: getDifficultyColor(d), fontSize: 10, fontWeight: 700, border: `1.5px solid ${getDifficultyColor(d)}`, padding: '2px 7px', borderRadius: 5, textTransform: 'capitalize' }}>{d}</span>
          ))}
        </div>
        {route.distance_from_user != null && (
          <span style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 5, display: 'flex', alignItems: 'center', gap: 3 }}>
            <LocateFixed size={9} /> {route.distance_from_user} km away
          </span>
        )}
      </div>
      <div style={{ padding: '14px' }}>
        <h3 style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1.3 }}>{route.name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 10 }}>
          <MapPin size={11} style={{ color: '#9CA3AF', flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>{route.town}, {route.province}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 12 }}>
          {[
            { icon: <Navigation size={11} />, val: route.distance_km ? `${parseFloat(route.distance_km).toFixed(0)} km` : '–', label: 'Dist' },
            { icon: <Mountain size={11} />, val: route.elevation_m ? `${route.elevation_m} m` : '–', label: 'Elev' },
            { icon: <Clock size={11} />, val: formatTime(route.est_time_min), label: 'Time' },
          ].map((stat, i) => (
            <div key={i} style={{ background: '#f9f9f9', borderRadius: 7, padding: '7px 6px', textAlign: 'center' }}>
              <div style={{ color: '#9CA3AF', marginBottom: 1, display: 'flex', justifyContent: 'center' }}>{stat.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }}>{stat.val}</div>
              <div style={{ fontSize: 9, color: '#9CA3AF', textTransform: 'uppercase' }}>{stat.label}</div>
            </div>
          ))}
        </div>
        {route.tags && route.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
            {route.tags.slice(0, 3).map((tag: string) => (
              <span key={tag} style={{ fontSize: 10, fontWeight: 600, color: '#4B5563', background: '#F3F4F6', padding: '2px 7px', borderRadius: 20  }}>{tag}</span>
            ))}
          </div>
        )}
        <Link href={`/routes/${route.slug}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, width: '100%', padding: '9px', borderRadius: 2, background: 'var(--color-primary)', color: '#fff', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
          View Route <ChevronRight size={13} />
        </Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', overflowX: 'hidden', width: '100%' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1a2744 0%, #0D1B2A 100%)', padding: '48px 20px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
            <Navigation size={16} style={{ color: '#93C5FD', flexShrink: 0 }} />
            <span style={{ color: '#93C5FD', fontSize: 12, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' }}>SA Cycling Routes</span>
          </div>
          <h1 style={{ color: '#fff', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, lineHeight: 1.2, margin: '0 0 10px' }}>
            Discover South Africa's Best Rides
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, margin: '0 0 24px', lineHeight: 1.6 }}>
            Road, MTB, gravel and urban routes across all 9 provinces. Find your next adventure.
          </p>
          <div className='rt-search-wrap'>
            <input type='text' placeholder='Search routes, towns, provinces…' value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1) } }} />
            <Search size={18} className='rt-search-icon' onClick={() => { setSearch(searchInput); setPage(1) }} />
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ebebeb' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {[
            { icon: <Navigation size={14} />, label: `${total || 50} Routes`, sub: 'Verified' },
            { icon: <MapPin size={14} />,      label: '9 Provinces',          sub: 'All covered' },
            { icon: <TrendingUp size={14} />,  label: 'All Levels',           sub: 'Beg → Expert' },
            { icon: <Mountain size={14} />,    label: 'Road · MTB · Gravel',  sub: 'Every discipline' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 0', flexShrink: 0, paddingRight: i < 3 ? 20 : 0, marginRight: i < 3 ? 20 : 0, borderRight: i < 3 ? '1px solid #f0f0f0' : 'none' }}>
              <span style={{ color: 'var(--color-primary)' }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a', whiteSpace: 'nowrap' }}>{s.label}</div>
                <div style={{ fontSize: 10, color: '#9CA3AF', whiteSpace: 'nowrap' }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ebebeb', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>

          {/* Desktop: inline row. Mobile: 4-col grid */}
          <div className="rt-nav-grid">

            {/* Col 1: List */}
            <button onClick={() => setActiveTab('list')} className={`rt-nav-col${activeTab === 'list' ? ' rt-nav-col--active' : ''}`}>
              <LayoutGrid size={16} />
              <span>List</span>
            </button>

            {/* Col 2: Map */}
            <button onClick={() => setActiveTab('map')} className={`rt-nav-col${activeTab === 'map' ? ' rt-nav-col--active' : ''}`}>
              <Map size={16} />
              <span>Map</span>
            </button>

            {/* Col 3: Filters */}
            <button onClick={() => setShowFilters(true)} className={`rt-nav-col${hasFilters ? ' rt-nav-col--filtered' : ''}`}>
              <SlidersHorizontal size={16} />
              <span>Filters{hasFilters ? ` (${[discipline !== 'all', !!province, !!city, difficulty !== 'all', !!distanceRange, facilities.length > 0, !!search].filter(Boolean).length})` : ''}</span>
            </button>

            {/* Col 4: Near Me button — always in the first row */}
            <button
              onClick={handleNearMe}
              disabled={locating}
              className={`rt-nav-col rt-nearme-col${nearMe ? ' rt-nearme-col--active' : ''}`}>
              <LocateFixed size={16} style={{ animation: locating ? 'spin 1s linear infinite' : 'none', flexShrink: 0 }} />
              <span>{locating ? 'Locating…' : nearMe ? 'Near Me ✕' : 'Near Me'}</span>
            </button>

            {/* Radius pills row — only on mobile when Near Me is active, spans full width */}
            {nearMe && (
              <div className="rt-pills-row">
                {RADIUS_OPTIONS.map(r => (
                  <button key={r}
                    onClick={() => { setNearbyKm(r); setPage(1) }}
                    className={`rt-radius-pill${nearbyKm === r ? ' rt-radius-pill--active' : ''}`}>
                    {r} km
                  </button>
                ))}
                {locateError && <span style={{ fontSize: 11, color: '#DC2626' }}>{locateError}</span>}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Filter drawer */}
      {/* Filter drawer — bottom sheet mobile, right panel desktop */}
      <div className={`rt-foverlay${showFilters ? ' open' : ''}`} onClick={() => setShowFilters(false)} />
      <div className={`rt-fdrawer${showFilters ? ' open' : ''}`}>
        <div className='rt-fdr-hdr'>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#1a1a1a' }}>Filters</span>
          <button onClick={() => setShowFilters(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a1a', padding: 4 }}>
            <X size={22} />
          </button>
        </div>
        <div className='rt-fdr-body'>
          <FilterContent />
        </div>
        <div className='rt-fdr-ftr'>
          <button onClick={resetFilters} className='rt-btn-clear'>Clear all</button>
          <button onClick={() => setShowFilters(false)} className='rt-btn-apply'>Show {total} Routes</button>
        </div>
      </div>

      {/* Location error */}
      {locateError && (
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '12px 20px 0' }}>
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 2, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#DC2626', fontWeight: 600 }}>{locateError}</span>
            <button onClick={() => setLocateError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626' }}><X size={16} /></button>
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {activeTab === 'list' && (
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 20px' }}>
          <div style={{ display: 'flex', gap: 28, alignItems: 'start' }}>
            <aside className='md-sidebar' style={{ width: 220, flexShrink: 0, position: 'sticky', top: 57, background: '#fff', border: '1px solid #ebebeb', borderRadius: 2, padding: 20, display: 'none' }}>
              <FilterContent />
            </aside>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>
                    {nearMe ? 'Routes Near You' : search || hasFilters ? 'Filtered Routes' : 'All Routes'}
                  </h2>
                  <p style={{ fontSize: 12, color: '#9CA3AF', margin: '3px 0 0' }}>
                    {loading ? 'Loading…' : nearMe ? `${total} route${total !== 1 ? 's' : ''} within ${nearbyKm} km of you` : `${total} route${total !== 1 ? 's' : ''} found`}
                  </p>
                </div>
              </div>
              <div className='routes-grid' style={{ display: 'grid', gap: 16 }}>
                {loading ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />) : routes.map(route => <RouteCard key={route.id} route={route} />)}
              </div>
              {totalPages > 1 && !loading && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '8px 16px', borderRadius: 2, border: '1px solid #e0e0e0', background: '#fff', fontSize: 13, fontWeight: 600, cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? '#9CA3AF' : '#1a1a1a' }}>Previous</button>
                  <span style={{ padding: '8px 14px', fontSize: 13, color: '#6B7280' }}>Page {page} of {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '8px 16px', borderRadius: 2, border: '1px solid #e0e0e0', background: '#fff', fontSize: 13, fontWeight: 600, cursor: page === totalPages ? 'not-allowed' : 'pointer', color: page === totalPages ? '#9CA3AF' : '#1a1a1a' }}>Next</button>
                </div>
              )}
              <div style={{ marginTop: 36, background: 'linear-gradient(135deg, #0D1B2A 0%, #1E3A5F 100%)', borderRadius: 14, padding: '28px', textAlign: 'center' }}>
                <Navigation size={24} style={{ color: '#93C5FD', marginBottom: 10 }} />
                <h3 style={{ color: '#fff', fontSize: 17, fontWeight: 800, margin: '0 0 8px' }}>Know a great route?</h3>
                <p style={{ color: '#CBD5E1', fontSize: 13, margin: '0 0 18px', maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>Share your favourite ride with the CrankMart community.</p>
                <button style={{ background: '#fff', color: 'var(--color-primary)', border: 'none', padding: '10px 24px', borderRadius: 2, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Submit a Route</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAP VIEW */}
      {activeTab === 'map' && (
        <div>
          {/* Map itself — fixed height */}
          <div style={{ height: 'clamp(340px, 55vh, 560px)', position: 'relative' }}>
            {mapLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 12 }}>
                <div style={{ width: 32, height: 32, border: '3px solid #E5E7EB', borderTop: '3px solid #1E3A5F', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ color: '#6B7280', fontSize: 13 }}>Loading map…</span>
              </div>
            ) : (
              <MapComponent
                routes={mapRoutes}
                onRouteClick={(slug) => { window.location.href = `/routes/${slug}` }}
                zoom={6}
                userLat={userLat}
                userLng={userLng}
                nearbyKm={nearbyKm}
                nearMeActive={nearMe}
              />
            )}
            {/* Legend */}
            <div style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 1000, background: 'rgba(255,255,255,0.97)', borderRadius: 2, padding: '8px 12px', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Discipline</div>
              {DISCIPLINES.filter(d => d.value !== 'all').map(d => (
                <div key={d.value} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: '#374151', fontWeight: 500 }}>{d.label}</span>
                </div>
              ))}
            </div>
            {/* Route count badge */}
            <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000, background: 'rgba(13,27,42,0.85)', backdropFilter: 'blur(4px)', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 700, color: '#fff' }}>
              {mapLoading ? '…' : `${mapRoutes.length} routes`}
            </div>
          </div>

          {/* Route list below map */}
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 20px 40px' }}>
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--color-primary)' }}>
                  {nearMe ? 'Routes Near You' : search || hasFilters ? 'Filtered Routes' : 'All Routes'}
                </h2>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: '#9CA3AF' }}>
                  {mapLoading ? 'Loading…' : nearMe
                    ? `${total} route${total !== 1 ? 's' : ''} within ${nearbyKm} km`
                    : `${total} route${total !== 1 ? 's' : ''} found`}
                </p>
              </div>
              {/* Switch to list view */}
              <button
                onClick={() => setActiveTab('list')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 2, border: '1.5px solid #e0e0e0', background: '#fff', fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', cursor: 'pointer' }}>
                <LayoutGrid size={13} /> List View
              </button>
            </div>

            {/* Cards grid — same as list tab */}
            <div className='routes-grid' style={{ display: 'grid', gap: 16 }}>
              {mapLoading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                : mapRoutes.length === 0
                  ? <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 0', color: '#9CA3AF' }}>
                      <MapPin size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                      <p style={{ fontSize: 14, margin: 0 }}>No routes found. Try expanding your radius or removing filters.</p>
                    </div>
                  : mapRoutes.map(route => <RouteCard key={route.id} route={route} />)
              }
            </div>

            {/* Pagination for map list — same logic as list tab */}
            {totalPages > 1 && !mapLoading && activeTab === 'map' && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '8px 16px', borderRadius: 2, border: '1px solid #e0e0e0', background: '#fff', fontSize: 13, fontWeight: 600, cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? '#9CA3AF' : '#1a1a1a' }}>Previous</button>
                <span style={{ padding: '8px 14px', fontSize: 13, color: '#6B7280' }}>Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '8px 16px', borderRadius: 2, border: '1px solid #e0e0e0', background: '#fff', fontSize: 13, fontWeight: 600, cursor: page === totalPages ? 'not-allowed' : 'pointer', color: page === totalPages ? '#9CA3AF' : '#1a1a1a' }}>Next</button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; }
        body { overflow-x: hidden; }
        .routes-grid { grid-template-columns: 1fr; }
        @media (min-width: 540px) { .routes-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 900px) { .routes-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 768px) { .md-sidebar { display: block !important; } }
        .rt-search-wrap { position: relative; max-width: 560px; width: 100%; margin: 0 auto; }
        .rt-search-wrap input { width: 100%; height: 52px; padding: 0 52px 0 20px; border-radius: 2px; border: 2px solid rgba(255,255,255,0.25); font-size: 15px; font-weight: 500; outline: none; box-sizing: border-box; background: rgba(255,255,255,0.15); color: #fff; backdrop-filter: blur(4px); transition: border-color .2s, background .2s; }
        .rt-search-wrap input::placeholder { color: rgba(255,255,255,0.55); }
        .rt-search-wrap input:focus { border-color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.22); }
        .rt-search-icon { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.6); cursor: pointer; }
        /* 4-col nav grid */
        .rt-nav-grid { display: flex; flex-wrap: wrap; align-items: stretch; }

        /* First 3 cols: List / Map / Filters — share one row equally */
        .rt-nav-col {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 4px; padding: 10px 4px; border: none; background: none; cursor: pointer;
          font-size: 12px; font-weight: 600; color: #9CA3AF;
          border-bottom: 2px solid transparent; margin-bottom: -1px;
          transition: color 0.15s; min-width: 0;
        }
        .rt-nav-col--active { color: #0D1B2A; border-bottom-color: #0D1B2A; }
        .rt-nav-col--filtered { color: #0D1B2A; }

        /* Near Me button col — 4th col, same row as List/Map/Filters */
        .rt-nearme-col {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 4px; padding: 10px 4px; border: none; background: none; cursor: pointer;
          font-size: 12px; font-weight: 600; color: #9CA3AF;
          border-bottom: 2px solid transparent; margin-bottom: -1px;
          transition: color 0.15s; min-width: 0;
        }
        .rt-nearme-col--active { color: #16A34A; border-bottom-color: #16A34A; }

        /* Pills row — second row, full width, only on mobile when active */
        .rt-pills-row {
          flex: 0 0 100%; width: 100%;
          display: flex; gap: 8px; flex-wrap: wrap;
          justify-content: center; align-items: center;
          padding: 10px 16px 12px;
          border-top: 1px solid #f0f0f0;
          background: #fff;
        }
        .rt-radius-pill {
          padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;
          border: 1px solid #D1D5DB; background: #fff; color: #374151; cursor: pointer;
          transition: all 0.15s;
        }
        .rt-radius-pill--active { background: var(--color-primary); border-color: var(--color-primary); color: #fff; }

        /* Desktop: revert to inline tab style */
        @media (min-width: 768px) {
          .rt-nav-grid { flex-wrap: nowrap; align-items: center; }
          .rt-nav-col { flex-direction: row; flex: none; padding: 14px 18px; font-size: 13px; gap: 6px; }
          .rt-nearme-col { flex-direction: row; flex: none; padding: 14px 18px; font-size: 13px; gap: 6px; margin-left: auto; }
          .rt-pills-row {
            flex: none; width: auto; border-top: none; padding: 0 0 0 8px;
            background: transparent; gap: 6px;
          }
          .rt-radius-pill { padding: 5px 12px; font-size: 11px; }
        }

        /* Filter drawer — matches browse page pattern */
        .rt-foverlay { position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:500; opacity:0; pointer-events:none; transition:opacity .2s; }
        .rt-foverlay.open { opacity:1; pointer-events:all; }
        .rt-fdrawer { position:fixed; bottom:0; left:0; right:0; background:#fff; border-radius:20px 20px 0 0; z-index:501; transform:translateY(100%); transition:transform .25s cubic-bezier(.4,0,.2,1); max-height:90vh; display:flex; flex-direction:column; }
        .rt-fdrawer.open { transform:translateY(0); }
        @media(min-width:768px) {
          .rt-fdrawer { left:auto; right:0; top:0; bottom:0; width:400px; border-radius:0; transform:translateX(100%); max-height:100vh; }
          .rt-fdrawer.open { transform:translateX(0); }
        }
        .rt-fdr-hdr { padding:18px 20px 14px; border-bottom:1px solid #ebebeb; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
        .rt-fdr-body { flex:1; overflow-y:auto; overflow-x:hidden; padding:0; }
        .rt-fdr-ftr { padding:14px 20px; border-top:1px solid #ebebeb; display:flex; gap:10px; flex-shrink:0; }
        .rt-btn-apply { flex:2; height:48px; background:#1a1a1a; color:#fff; border:none; border-radius:2px; font-size:15px; font-weight:700; cursor:pointer; }
        .rt-btn-clear  { flex:1; height:48px; background:#fff; color:#1a1a1a; border:1px solid #e4e4e7; border-radius:2px; font-size:15px; font-weight:600; cursor:pointer; }

        .rt-card { transition: transform 0.2s, box-shadow 0.2s; }
        .rt-card:hover { transform: translateY(-4px); box-shadow: 0 8px 16px rgba(0,0,0,0.1); }
        @keyframes spin { from { transform: translateY(-50%) rotate(0deg); } to { transform: translateY(-50%) rotate(360deg); } }
        @keyframes cm-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
