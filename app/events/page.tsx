'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { MapPin, Calendar, ChevronRight, Search, ExternalLink, SlidersHorizontal, X, Map, LayoutGrid, LocateFixed, CalendarDays, Users } from 'lucide-react'

// City → [lat, lng] lookup for SA cities
const CITY_COORDS: Record<string, [number, number]> = {
  // Western Cape
  'Cape Town': [-33.9249, 18.4241], 'Stellenbosch': [-33.9321, 18.8602], 'George': [-33.9646, 22.4614],
  'Paarl': [-33.7342, 18.9626], 'Knysna': [-34.0356, 23.0478], 'Mossel Bay': [-34.1826, 22.1419],
  'Hermanus': [-34.4187, 19.2345], 'Somerset West': [-34.0851, 18.8445], 'Franschhoek': [-33.9122, 19.1222],
  'Worcester': [-33.6457, 19.4481], 'Swellendam': [-34.0236, 20.4428], 'Oudtshoorn': [-33.5935, 22.2040],
  'Wilderness': [-33.9958, 22.5896], 'Plettenberg Bay': [-34.0527, 23.3714], 'Caledon': [-34.2300, 19.4355],
  'Robertson': [-33.8012, 19.8835], 'Malmesbury': [-33.4601, 18.7310], 'Strand': [-34.1168, 18.8298],
  'Gordon\'s Bay': [-34.1577, 18.8607], 'Langebaan': [-33.1063, 18.0323], 'Vredenburg': [-32.9072, 17.9948],
  'Ceres': [-33.3701, 19.3114], 'Tulbagh': [-33.2825, 19.1374], 'Montagu': [-33.7840, 20.1180],
  'Bredasdorp': [-34.5333, 20.0406], 'L\'Agulhas': [-34.8285, 20.0095], 'Grabouw': [-34.1461, 19.0085],
  'Calitzdorp': [-33.5316, 21.6877], 'Ladismith': [-33.4982, 21.2618], 'De Rust': [-33.4769, 22.5215],
  'Prince Albert': [-33.2178, 22.0310], 'Riversdale': [-34.0981, 21.2597], 'Stilbaai': [-34.3722, 21.4261],
  'Genadendal': [-34.0264, 19.5583], 'Elgin': [-34.1550, 19.0458],
  // Gauteng
  'Johannesburg': [-26.2041, 28.0473], 'Pretoria': [-25.7479, 28.2293], 'Sandton': [-26.1070, 28.0567],
  'Midrand': [-25.9976, 28.1283], 'Centurion': [-25.8553, 28.1878], 'Randburg': [-26.0875, 27.9978],
  'Roodepoort': [-26.1628, 27.8665], 'Soweto': [-26.2677, 27.8583], 'Benoni': [-26.1875, 28.3180],
  'Kempton Park': [-26.1077, 28.2335], 'Boksburg': [-26.2144, 28.2607], 'Germiston': [-26.2170, 28.1719],
  'Springs': [-26.2521, 28.4366], 'Alberton': [-26.2656, 28.1222], 'Edenvale': [-26.1383, 28.1597],
  'Fourways': [-26.0171, 28.0099], 'Hartbeespoort': [-25.7481, 27.9002], 'Krugersdorp': [-26.0952, 27.7720],
  'Tembisa': [-25.9993, 28.2265], 'Vereeniging': [-26.6731, 27.9269], 'Vanderbijlpark': [-26.7023, 27.8396],
  'Magaliesburg': [-26.0000, 27.5333], 'Muldersdrift': [-26.0236, 27.8575], 'Heidelberg': [-26.5038, 28.3607],
  // KwaZulu-Natal
  'Durban': [-29.8587, 31.0218], 'Pietermaritzburg': [-29.6167, 30.3930], 'Ballito': [-29.5329, 31.2092],
  'Richards Bay': [-28.7832, 32.0390], 'Newcastle': [-27.7569, 29.9322], 'Ladysmith': [-28.5569, 29.7797],
  'Pinetown': [-29.8177, 30.8557], 'Westville': [-29.8309, 30.9352], 'Umhlanga': [-29.7307, 31.0841],
  'Amanzimtoti': [-30.0551, 30.8766], 'Margate': [-30.8651, 30.3605], 'Port Shepstone': [-30.7486, 30.4567],
  'Tongaat': [-29.5700, 31.1122], 'Stanger': [-29.3399, 31.2932], 'Scottburgh': [-30.2890, 30.7629],
  'Hluhluwe': [-28.0202, 32.2727], 'Eshowe': [-28.8838, 31.4690], 'Howick': [-29.4726, 30.2293],
  'Underberg': [-29.7897, 29.4917], 'Mtunzini': [-28.9620, 31.7450], 'New Hanover': [-29.3671, 30.5278],
  'Winterton': [-28.8000, 29.5333],
  // Eastern Cape
  'Port Elizabeth': [-33.9608, 25.6022], 'Gqeberha': [-33.9608, 25.6022], 'East London': [-33.0153, 27.9116],
  'Uitenhage': [-33.7660, 25.3984], 'King William\'s Town': [-32.8892, 27.3985], 'Queenstown': [-31.9000, 26.8757],
  'Grahamstown': [-33.3042, 26.5328], 'Makhanda': [-33.3042, 26.5328], 'Graaff-Reinet': [-32.2522, 24.5328],
  'Jeffreys Bay': [-34.0531, 24.9189], 'Jeffrey\'s Bay': [-34.0531, 24.9189], 'Humansdorp': [-34.0290, 24.7705],
  'Middelburg (EC)': [-31.4990, 25.0096], 'Middelburg EC': [-31.4990, 25.0096],
  'Aliwal North': [-30.6919, 26.7140], 'Cradock': [-32.1643, 25.6182],
  'Addo': [-33.5549, 25.7234], 'Port Alfred': [-33.5935, 26.8877], 'Storms River': [-33.9779, 23.8792],
  'Nieu-Bethesda': [-31.8609, 24.5606], 'Jansenville': [-32.9367, 24.6699], 'Willowmore': [-33.2885, 23.4912],
  // Free State
  'Bloemfontein': [-29.0852, 26.1596], 'Welkom': [-27.9777, 26.7345], 'Kroonstad': [-27.6494, 27.2281],
  'Bethlehem': [-28.2299, 28.3007], 'Harrismith': [-28.2744, 29.1203], 'Parys': [-26.9007, 27.4609],
  'Sasolburg': [-26.8100, 27.8252], 'Phuthaditjhaba': [-28.5296, 28.9037],
  'Clarens': [-28.5269, 28.4286], 'Fouriesburg': [-28.6236, 28.2164], 'Clocolan': [-28.9218, 27.5770],
  'Jacobsdal': [-29.1264, 24.7454],
  // Limpopo
  'Polokwane': [-23.9045, 29.4688], 'Tzaneen': [-23.8296, 30.1577], 'Mokopane': [-24.1937, 29.0076],
  'Bela-Bela': [-24.8867, 28.3244], 'Louis Trichardt': [-23.0432, 29.9044], 'Phalaborwa': [-23.9393, 31.1554],
  'Groblersdal': [-25.1666, 29.3994], 'Lephalale': [-23.6798, 27.7064],
  'Thabazimbi': [-24.5939, 27.4044], 'Vaalwater': [-24.2747, 28.1126],
  // Mpumalanga
  'Nelspruit': [-25.4745, 30.9703], 'Mbombela': [-25.4745, 30.9703], 'Witbank': [-25.8748, 29.2373],
  'eMalahleni': [-25.8748, 29.2373], 'Middelburg': [-25.7735, 29.4677], 'Secunda': [-26.5100, 29.1671],
  'Standerton': [-26.9405, 29.2394], 'Ermelo': [-26.5233, 29.9767], 'Hazyview': [-25.0502, 31.1289],
  'White River': [-25.3310, 31.0007], 'Sabie': [-25.1004, 30.7808], 'Lydenburg': [-25.0973, 30.4525],
  'Dullstroom': [-25.4097, 30.1148], 'Machadodorp': [-25.6567, 30.2909],
  // North West
  'Rustenburg': [-25.6675, 27.2423], 'Klerksdorp': [-26.8681, 26.6677], 'Potchefstroom': [-26.7145, 27.0991],
  'Mahikeng': [-25.8493, 25.6420], 'Mmabatho': [-25.8493, 25.6420], 'Brits': [-25.6313, 27.7759],
  'Lichtenburg': [-26.1495, 26.1624], 'Zeerust': [-25.5431, 26.0722], 'Vryburg': [-26.9566, 24.7297],
  'Buffelspoort': [-25.6688, 27.8983],
  // Northern Cape
  'Kimberley': [-28.7323, 24.7620], 'Upington': [-28.4478, 21.2561], 'Springbok': [-29.6643, 17.8865],
  'De Aar': [-30.6494, 24.0106], 'Kuruman': [-27.4540, 23.4330], 'Kakamas': [-28.7818, 20.6178],
  'Augrabies': [-28.5968, 20.3377], 'Calvinia': [-31.4718, 19.7753], 'Hanover': [-31.0696, 24.4573],
  'Kenhardt': [-29.3627, 21.1476], 'Nigramoep': [-29.7131, 17.6872], 'O\'Kiep': [-29.6147, 17.8844],
  'Orania': [-29.8097, 24.4197],
}

// Province fallback centres — used when city not found
const PROVINCE_COORDS: Record<string, [number, number]> = {
  'Western Cape': [-33.9249, 18.4241],
  'Gauteng': [-26.2041, 28.0473],
  'KwaZulu-Natal': [-29.8587, 31.0218],
  'Eastern Cape': [-33.0153, 27.9116],
  'Free State': [-29.0852, 26.1596],
  'Limpopo': [-23.9045, 29.4688],
  'Mpumalanga': [-25.4745, 30.9703],
  'North West': [-25.6675, 27.2423],
  'Northern Cape': [-28.7323, 24.7620],
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function getCityCoords(city: string, province?: string): [number, number] | null {
  if (!city) return province ? (PROVINCE_COORDS[province] ?? null) : null
  // Exact match
  const direct = CITY_COORDS[city]
  if (direct) return direct
  // Case-insensitive match
  const key = Object.keys(CITY_COORDS).find(k => k.toLowerCase() === city.toLowerCase())
  if (key) return CITY_COORDS[key]
  // City field sometimes contains province name — treat as province fallback
  if (PROVINCE_COORDS[city]) return PROVINCE_COORDS[city]
  // Fall back to province centre so events are never silently dropped
  if (province && PROVINCE_COORDS[province]) return PROVINCE_COORDS[province]
  return null
}

const EventsMap = dynamic(() => import('./EventsMap'), { ssr: false, loading: () => (
  <div style={{ width: '100%', height: '100%', background: '#E9ECF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <span style={{ color: '#9CA3AF', fontSize: 13 }}>Loading map…</span>
  </div>
) })

const EventsCalendar = dynamic(() => import('./EventsCalendar'), { ssr: false, loading: () => (
  <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>Loading calendar…</div>
) })

interface Event {
  id: string; title: string; slug: string; description: string
  event_type: string; city: string; province: string
  event_date_start: string; event_date_end: string
  entry_url: string; entry_status: string; cover_image_url: string
  is_featured: boolean; discipline: string[]
  entry_fee?: string; distance?: string; organiser_name?: string; organiser_website?: string
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
const PROVINCES = ['','Western Cape','Gauteng','KwaZulu-Natal','Eastern Cape','Limpopo','Mpumalanga','Northern Cape','North West','Free State']
const TYPE_COLORS: Record<string, string> = {
  race: '#EF4444', stage_race: '#0D1B2A', fun_ride: '#10B981',
  social_ride: '#3B82F6', tour: '#F59E0B', training_camp: '#8B5CF6',
  festival: '#EC4899', default: '#6B7280'
}
const TYPE_LABELS: Record<string, string> = {
  race: 'Race', stage_race: 'Stage Race', fun_ride: 'Fun Ride',
  social_ride: 'Social Ride', tour: 'Tour', training_camp: 'Training Camp', festival: 'Festival'
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
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
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [province, setProvince] = useState('')
  const [month, setMonth] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState<'list' | 'map' | 'calendar' | 'organisers'>('list')
  interface Organiser {
    id: string;
    name: string;
    cover_url?: string;
    logo_url?: string;
    city?: string;
    province?: string;
    description?: string;
    website?: string;
  }

  const [organisers, setOrganisers] = useState<Organiser[]>([])
  const [orgLoading, setOrgLoading] = useState(false)
  const [orgLoaded, setOrgLoaded] = useState(false)
  const [userLat, setUserLat] = useState<number | null>(null)
  const [userLng, setUserLng] = useState<number | null>(null)
  const [nearMe, setNearMe] = useState(false)
  const [nearbyKm, setNearbyKm] = useState(50)
  const [locating, setLocating] = useState(false)
  const [locateError, setLocateError] = useState<string | null>(null)
  const RADIUS_OPTIONS = [25, 50, 100, 200]

  const handleNearMe = () => {
    if (nearMe) { setNearMe(false); return }
    if (!navigator.geolocation) { setLocateError('Geolocation not supported'); return }
    setLocating(true); setLocateError(null)
    navigator.geolocation.getCurrentPosition(
      pos => { setUserLat(pos.coords.latitude); setUserLng(pos.coords.longitude); setNearMe(true); setLocating(false) },
      () => { setLocateError('Location access denied.'); setLocating(false) },
      { timeout: 10000, enableHighAccuracy: false }
    )
  }

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ limit: '200' })
    if (type) params.set('type', type)
    if (province) params.set('province', province)
    if (month !== null) params.set('month', String(month + 1))
    if (search) params.set('search', search)
    fetch(`/api/events?${params}`)
      .then(r => r.json())
      .then(d => setEvents(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }, [type, province, month, search])

  useEffect(() => {
    if (activeTab !== 'organisers' || orgLoaded) return
    setOrgLoading(true)
    fetch('/api/directory?type=event_organiser&limit=200')
      .then(r => r.json())
      .then(d => { setOrganisers(Array.isArray(d.data) ? d.data : []); setOrgLoaded(true) })
      .finally(() => setOrgLoading(false))
  }, [activeTab, orgLoaded])

  const currentMonth = new Date().getMonth()
  const monthsWithEvents = new Set(events.map(e => getMonth(e.event_date_start)))
  const hasFilters = !!type || !!province || month !== null || !!search
  const filterCount = [!!type, !!province, month !== null, !!search].filter(Boolean).length

  // Filter by Near Me
  const filteredEvents = nearMe && userLat !== null && userLng !== null
    ? events.filter(e => {
        const coords = getCityCoords(e.city)
        if (!coords) return false
        return haversineKm(userLat, userLng, coords[0], coords[1]) <= nearbyKm
      })
    : events

  // Map pins — fall back to province centre if city not in lookup
  const mapPins = filteredEvents
    .map(e => { const c = getCityCoords(e.city, e.province); return c ? { ...e, lat: c[0], lng: c[1] } : null })
    .filter(Boolean) as (Event & { lat: number; lng: number })[]

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <style>{`
        .ev-hero { background: linear-gradient(135deg, #1a2744, #0D1B2A); padding: 48px 20px 40px; text-align: center; }
        @media(min-width:768px) { .ev-hero { padding: 56px 24px 48px; } }
        .ev-hero h1 { font-size: 28px; font-weight: 800; color: #fff; margin-bottom: 8px; }
        @media(min-width:768px) { .ev-hero h1 { font-size: 36px; } }
        .ev-hero p { font-size: 15px; color: rgba(255,255,255,.7); margin-bottom: 24px; }
        .search-wrap { position: relative; max-width: 560px; margin: 0 auto; }
        .search-wrap input { width: 100%; height: 52px; padding: 0 52px 0 20px; border-radius: 2px; border: 2px solid rgba(255,255,255,0.25); font-size: 15px; font-weight: 500; outline: none; box-sizing: border-box; background: rgba(255,255,255,0.15); color: #fff; backdrop-filter: blur(4px); transition: border-color .2s, background .2s; }
        .search-wrap input::placeholder { color: rgba(255,255,255,0.55); }
        .search-wrap input:focus { border-color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.22); }
        .search-icon { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.6); pointer-events: none; }

        /* Month strip */
        .month-strip { background: #fff; border-bottom: 1px solid #ebebeb; overflow-x: auto; scrollbar-width: none; }
        .month-strip::-webkit-scrollbar { display: none; }
        .month-inner { display: flex; gap: 0; padding: 0 20px; max-width: 1280px; margin: 0 auto; }
        .month-btn { padding: 12px 14px; border: none; background: none; cursor: pointer; font-size: 13px; font-weight: 600; color: #9a9a9a; border-bottom: 2px solid transparent; margin-bottom: -1px; white-space: nowrap; position: relative; transition: color .15s; }
        .month-btn.active { color: #0D1B2A; border-bottom-color: #0D1B2A; }
        .month-btn.has-events::after { content: ''; width: 4px; height: 4px; background: var(--color-primary); border-radius: 50%; position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%); }
        .month-btn:not(.active).has-events { color: #1a1a1a; }

        /* Tab bar */
        .ev-tabbar { background: #fff; border-bottom: 1px solid #ebebeb; position: sticky; top: 0; z-index: 50; }
        .ev-tabbar-inner { max-width: 1280px; margin: 0 auto; padding: 0 20px; display: flex; align-items: stretch; flex-wrap: wrap; }
        .ev-tab { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 10px 14px; border: none; background: none; cursor: pointer; font-size: 12px; font-weight: 600; color: #9CA3AF; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: color .15s; white-space: nowrap; }
        .ev-tab--active { color: #0D1B2A; border-bottom-color: #0D1B2A; }
        .ev-tab--filtered { color: #0D1B2A; }
        .ev-tab--nearme-active { color: #16A34A !important; border-bottom-color: #16A34A !important; }
        @media(min-width: 768px) { .ev-tab { flex-direction: row; padding: 14px 18px; font-size: 13px; gap: 6px; } }
        .ev-radius-row { flex: 0 0 100%; width: 100%; display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; padding: 10px 16px 12px; border-top: 1px solid #f0f0f0; background: #fff; }
        .ev-radius-pill { padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; border: 1px solid #D1D5DB; background: #fff; color: #374151; cursor: pointer; transition: all .15s; }
        .ev-radius-pill--active { background: #0D1B2A; border-color: #0D1B2A; color: #fff; }
        @media(min-width: 768px) { .ev-radius-row { flex: none; width: auto; border-top: none; padding: 0 0 0 8px; background: transparent; gap: 6px; } }

        /* Filter drawer — matches Routes */
        .ev-foverlay { position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:500; opacity:0; pointer-events:none; transition:opacity .2s; }
        .ev-foverlay.open { opacity:1; pointer-events:all; }
        .ev-fdrawer { position:fixed; bottom:0; left:0; right:0; background:#fff; border-radius:20px 20px 0 0; z-index:501; transform:translateY(100%); transition:transform .25s cubic-bezier(.4,0,.2,1); max-height:90vh; display:flex; flex-direction:column; }
        .ev-fdrawer.open { transform:translateY(0); }
        @media(min-width:768px) {
          .ev-fdrawer { left:auto; right:0; top:0; bottom:0; width:400px; border-radius:0; transform:translateX(100%); max-height:100vh; }
          .ev-fdrawer.open { transform:translateX(0); }
        }
        .ev-fdr-hdr { padding:18px 20px 14px; border-bottom:1px solid #ebebeb; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
        .ev-fdr-body { flex:1; overflow-y:auto; overflow-x:hidden; padding:0; }
        .ev-fdr-ftr { padding:14px 20px; border-top:1px solid #ebebeb; display:flex; gap:10px; flex-shrink:0; }
        .ev-btn-apply { flex:2; height:48px; background:#1a1a1a; color:#fff; border:none; border-radius:2px; font-size:15px; font-weight:700; cursor:pointer; }
        .ev-btn-clear { flex:1; height:48px; background:#fff; color:#1a1a1a; border:1px solid #e4e4e7; border-radius:2px; font-size:15px; font-weight:600; cursor:pointer; }

        .events-wrap { max-width: 1280px; margin: 0 auto; padding: 20px; }
        .events-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media(min-width: 768px) { .events-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; } }
        @media(min-width: 1100px) { .events-grid { grid-template-columns: repeat(3, 1fr); } }

        .ev-card { background: #fff; border-radius: 2px; border: 1px solid #ebebeb; overflow: hidden; text-decoration: none; display: block; transition: box-shadow .15s; }
        .ev-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.1); }
        .ev-banner { height: 110px; display: flex; align-items: flex-end; padding: 10px; position: relative; }
        @media(min-width: 768px) { .ev-banner { height: 140px; } }
        .type-badge { font-size: 10px; font-weight: 700; color: #fff; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: .4px; }
        .featured-star { position: absolute; top: 8px; right: 8px; background: #F59E0B; color: #fff; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; }
        .ev-body { padding: 12px; }
        .ev-title { font-size: 13px; font-weight: 700; color: #1a1a1a; margin-bottom: 6px; line-height: 1.3; }
        @media(min-width: 768px) { .ev-title { font-size: 14px; } }
        .ev-meta { font-size: 11px; color: #9a9a9a; display: flex; flex-direction: column; gap: 3px; margin-bottom: 8px; }
        .ev-meta span { display: flex; align-items: center; gap: 4px; }
        .ev-chips { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 8px; }
        .ev-chip { font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 4px; background: #f0f4ff; color: #0D1B2A; border: 1px solid #d0dbf5; white-space: nowrap; }
        .ev-chip.fee { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
        .ev-visit { display: flex; align-items: center; justify-content: center; gap: 5px; width: 100%; height: 32px; background: var(--color-primary); color: #fff; border-radius: 2px; font-size: 12px; font-weight: 700; text-decoration: none; margin-top: 8px; transition: background .15s; }
        .ev-visit:hover { background: #1e2d5a; }

        .empty { text-align: center; padding: 60px 20px; }
        .section-head { font-size: 13px; font-weight: 700; color: #9a9a9a; text-transform: uppercase; letter-spacing: .6px; margin-bottom: 12px; }
        /* Desktop sidebar */
        .ev-sidebar { display: none; width: 220px; flex-shrink: 0; position: sticky; top: 57px; background: #fff; border: 1px solid #ebebeb; border-radius: 2px; overflow: hidden; }
        @media(min-width: 768px) { .ev-sidebar { display: block; } }
      `}</style>

      {/* Hero */}
      <div className="ev-hero">
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
            <Calendar size={16} style={{ color: '#93C5FD', flexShrink: 0 }} />
            <span style={{ color: '#93C5FD', fontSize: 12, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' }}>SA Cycling Events</span>
          </div>
          <h1>Upcoming Cycling Events</h1>
          <p>Races, tours, sportives and fun rides across South Africa</p>
          <div className="search-wrap">
            <input type="text" placeholder="Search events, cities..." value={search} onChange={e => setSearch(e.target.value)} />
            <Search size={18} className="search-icon" />
          </div>
        </div>
      </div>

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

      {/* Tab bar */}
      {(() => {
        return (
          <>
            <div className="ev-tabbar">
              <div className="ev-tabbar-inner">
                <button onClick={() => setActiveTab('list')} className={`ev-tab${activeTab === 'list' ? ' ev-tab--active' : ''}`}>
                  <LayoutGrid size={16} /><span>List</span>
                </button>
                <button onClick={() => setActiveTab('calendar')} className={`ev-tab${activeTab === 'calendar' ? ' ev-tab--active' : ''}`}>
                  <CalendarDays size={16} /><span>Calendar</span>
                </button>
                <button onClick={() => setActiveTab('map')} className={`ev-tab${activeTab === 'map' ? ' ev-tab--active' : ''}`}>
                  <Map size={16} /><span>Map</span>
                </button>
                <button onClick={() => setShowFilters(true)} className={`ev-tab${hasFilters ? ' ev-tab--filtered' : ''}`}>
                  <SlidersHorizontal size={16} />
                  <span>Filters{hasFilters ? ` (${filterCount})` : ''}</span>
                </button>
                <button onClick={() => setActiveTab('organisers')} className={`ev-tab${activeTab === 'organisers' ? ' ev-tab--active' : ''}`}>
                  <Users size={16} /><span>Organisers</span>
                </button>
                <button onClick={handleNearMe} disabled={locating} className={`ev-tab${nearMe ? ' ev-tab--nearme-active' : ''}`} style={{ marginLeft: 'auto' }}>
                  <LocateFixed size={16} style={{ animation: locating ? 'spin 1s linear infinite' : 'none', flexShrink: 0 }} />
                  <span>{locating ? 'Locating…' : nearMe ? 'Near Me ✕' : 'Near Me'}</span>
                </button>
                {nearMe && (
                  <div className="ev-radius-row">
                    {RADIUS_OPTIONS.map(r => (
                      <button key={r} onClick={() => setNearbyKm(r)} className={`ev-radius-pill${nearbyKm === r ? ' ev-radius-pill--active' : ''}`}>{r} km</button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Filter drawer */}
            <div className={`ev-foverlay${showFilters ? ' open' : ''}`} onClick={() => setShowFilters(false)} />
            <div className={`ev-fdrawer${showFilters ? ' open' : ''}`}>
              <div className="ev-fdr-hdr">
                <span style={{ fontSize: 17, fontWeight: 800, color: '#1a1a1a' }}>Filters</span>
                <button onClick={() => setShowFilters(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a1a', padding: 4 }}>
                  <X size={22} />
                </button>
              </div>
              <div className="ev-fdr-body">
                {/* Event Type */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 10 }}>Event Type</div>
                  {TYPES.map(t => {
                    const color = TYPE_COLORS[t.value] || '#64748B'
                    const isActive = type === t.value
                    return (
                      <button key={t.value} onClick={() => setType(t.value)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', marginBottom: 3, borderRadius: 2, border: isActive ? `1px solid ${color}` : '1px solid transparent', background: isActive ? `${color}15` : 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: isActive ? 700 : 500, color: '#1a1a1a', textAlign: 'left' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />{t.label}
                      </button>
                    )
                  })}
                </div>
                {/* Province */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 10 }}>Province</div>
                  <select value={province} onChange={e => setProvince(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 2, border: '1px solid #e4e4e7', fontSize: 13, color: '#1a1a1a', background: '#fff', cursor: 'pointer' }}>
                    <option value="">All Provinces</option>
                    {PROVINCES.filter(Boolean).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                {/* Month */}
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 10 }}>Month</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <button onClick={() => setMonth(null)} style={{ padding: '7px 16px', borderRadius: 2, border: month === null ? '1px solid #1a1a1a' : '1px solid #e4e4e7', background: month === null ? '#1a1a1a' : '#fff', color: month === null ? '#fff' : '#1a1a1a', fontSize: 13, fontWeight: month === null ? 700 : 500, cursor: 'pointer' }}>All</button>
                    {MONTHS.map((m, i) => (
                      <button key={m} onClick={() => setMonth(month === i ? null : i)} style={{ padding: '7px 16px', borderRadius: 2, border: month === i ? '1px solid #1a1a1a' : '1px solid #e4e4e7', background: month === i ? '#1a1a1a' : '#fff', color: month === i ? '#fff' : '#1a1a1a', fontSize: 13, fontWeight: month === i ? 700 : 500, cursor: 'pointer' }}>{m}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="ev-fdr-ftr">
                <button onClick={() => { setType(''); setProvince(''); setMonth(null); }} className="ev-btn-clear">Clear all</button>
                <button onClick={() => setShowFilters(false)} className="ev-btn-apply">Show {filteredEvents.length} Events</button>
              </div>
            </div>
          </>
        )
      })()}

      {/* Location error */}
      {locateError && (
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '12px 20px 0' }}>
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 2, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#DC2626', fontWeight: 600 }}>{locateError}</span>
            <button onClick={() => setLocateError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626' }}><X size={16} /></button>
          </div>
        </div>
      )}

      {/* Calendar view */}
      {activeTab === 'calendar' && (
        <div style={{ background: '#fff', borderBottom: '1px solid #ebebeb' }}>
          <EventsCalendar events={filteredEvents} />
        </div>
      )}

      {/* Map view */}
      {activeTab === 'map' && (
        <div>
          <div style={{ height: 'clamp(340px, 55vh, 560px)', position: 'relative' }}>
            <EventsMap
              events={mapPins}
              userLat={userLat}
              userLng={userLng}
              nearbyKm={nearbyKm}
              nearMeActive={nearMe}
            />
            <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000, background: 'rgba(13,27,42,0.85)', backdropFilter: 'blur(4px)', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 700, color: '#fff' }}>
              {mapPins.length} events
            </div>
          </div>
          <div className="events-wrap">
            <div className="events-grid">
              {mapPins.map(e => <EventCard key={e.id} event={e} gradientFor={gradientFor} />)}
            </div>
          </div>
        </div>
      )}

      {/* Organisers view */}
      {activeTab === 'organisers' && (
        <div className="events-wrap">
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-primary)', margin: '0 0 4px' }}>Event Organisers</h2>
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
              {orgLoading ? 'Loading…' : `${organisers.length} organiser${organisers.length !== 1 ? 's' : ''} listed`}
            </p>
          </div>
          {orgLoading ? (
            <div className="events-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ background: '#f0f0f0', borderRadius: 2, height: 200, animation: 'pulse 1.4s infinite' }} />
              ))}
            </div>
          ) : organisers.length === 0 ? (
            <div className="empty">
              <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>No organisers found</p>
            </div>
          ) : (
            <div className="events-grid">
              {organisers.map((o: Organiser) => (
                <div key={o.id} style={{ background: '#fff', borderRadius: 2, border: '1px solid #ebebeb', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'box-shadow .15s' }}>
                  {/* Cover */}
                  <div style={{ height: 100, background: o.cover_url && !o.cover_url.includes('placeholder') ? `url(${o.cover_url}) center/cover no-repeat` : 'linear-gradient(135deg, #1a2744, #0D1B2A)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {o.logo_url
                      ? <div style={{ width: 52, height: 52, borderRadius: 6, background: '#fff', border: '1px solid #e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.15)' }}>
                          <img src={o.logo_url} alt={o.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
                        </div>
                      : <Users size={28} style={{ color: 'rgba(255,255,255,0.4)' }} />
                    }
                  </div>
                  {/* Body */}
                  <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 4, lineHeight: 1.3 }}>{o.name}</div>
                    {(o.city || o.province) && (
                      <div style={{ fontSize: 11, color: '#9a9a9a', display: 'flex', alignItems: 'center', gap: 3, marginBottom: 6 }}>
                        <MapPin size={10} />{[o.city, o.province].filter(Boolean).join(', ')}
                      </div>
                    )}
                    {o.description && (
                      <div style={{ fontSize: 12, color: '#666', lineHeight: 1.4, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const }}>{o.description}</div>
                    )}
                    {o.website && (
                      <a href={o.website} target="_blank" rel="noopener noreferrer" className="ev-visit" style={{ marginTop: 10 }}>
                        <ExternalLink size={11} /> View Website
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ textAlign: 'center', padding: '40px 0 20px' }}>
            <p style={{ fontSize: 14, color: '#9a9a9a', marginBottom: 12 }}>Are you an event organiser?</p>
            <Link href="/events/submit" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--color-primary)', color: '#fff', padding: '10px 20px', borderRadius: 2, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              Get listed →
            </Link>
          </div>
        </div>
      )}

      {/* List view */}
      {activeTab === 'list' && (
        <div className="events-wrap">
          <div style={{ display: 'flex', gap: 24, alignItems: 'start' }}>
            {/* Desktop sidebar */}
            <aside className="ev-sidebar">
              {/* Event Type */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 10 }}>Event Type</div>
                {TYPES.map(t => {
                  const color = TYPE_COLORS[t.value] || '#64748B'
                  const isActive = type === t.value
                  return (
                    <button key={t.value} onClick={() => setType(t.value)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', marginBottom: 3, borderRadius: 2, border: isActive ? `1px solid ${color}` : '1px solid transparent', background: isActive ? `${color}15` : 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: isActive ? 700 : 500, color: '#1a1a1a', textAlign: 'left' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />{t.label}
                    </button>
                  )
                })}
              </div>
              {/* Province */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 10 }}>Province</div>
                <select value={province} onChange={e => setProvince(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 2, border: '1px solid #e4e4e7', fontSize: 13, color: '#1a1a1a', background: '#fff', cursor: 'pointer' }}>
                  <option value="">All Provinces</option>
                  {PROVINCES.filter(Boolean).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              {/* Month */}
              <div style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 10 }}>Month</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <button onClick={() => setMonth(null)} style={{ padding: '5px 10px', borderRadius: 2, border: month === null ? '1px solid #1a1a1a' : '1px solid #e4e4e7', background: month === null ? '#1a1a1a' : '#fff', color: month === null ? '#fff' : '#1a1a1a', fontSize: 12, fontWeight: month === null ? 700 : 500, cursor: 'pointer' }}>All</button>
                  {MONTHS.map((m, i) => (
                    <button key={m} onClick={() => setMonth(month === i ? null : i)} style={{ padding: '5px 10px', borderRadius: 2, border: month === i ? '1px solid #1a1a1a' : '1px solid #e4e4e7', background: month === i ? '#1a1a1a' : '#fff', color: month === i ? '#fff' : '#1a1a1a', fontSize: 12, fontWeight: month === i ? 700 : 500, cursor: 'pointer' }}>{m}</button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>
                    {nearMe ? 'Events Near You' : hasFilters ? 'Filtered Events' : 'All Events'}
                  </h2>
                  <p style={{ fontSize: 12, color: '#9CA3AF', margin: '3px 0 0' }}>
                    {loading ? 'Loading…' : nearMe ? `${filteredEvents.length} event${filteredEvents.length !== 1 ? 's' : ''} within ${nearbyKm} km` : `${filteredEvents.length} event${filteredEvents.length !== 1 ? 's' : ''} found`}
                  </p>
                </div>
              </div>

              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[...Array(8)].map((_, i) => (
                    <div key={i} style={{ background: '#f0f0f0', borderRadius: 2, height: 200, animation: 'pulse 1.4s infinite' }} />
                  ))}
                  <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="empty">
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>No events found</p>
                  <p style={{ fontSize: 14, color: '#9a9a9a' }}>{nearMe ? `No events within ${nearbyKm} km. Try expanding the radius.` : 'Try different filters or check back soon'}</p>
                </div>
              ) : (
                <div className="events-grid">
                  {filteredEvents.map(e => <EventCard key={e.id} event={e} gradientFor={gradientFor} />)}
                </div>
              )}

              {/* Submit CTA */}
              <div style={{ textAlign: 'center', padding: '40px 0 20px' }}>
                <p style={{ fontSize: 14, color: '#9a9a9a', marginBottom: 12 }}>Organising an event?</p>
                <Link href="/events/submit" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--color-primary)', color: '#fff', padding: '10px 20px', borderRadius: 2, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                  Submit your event →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EventCard({ event, gradientFor }: { event: Event; gradientFor: (t: string) => string }) {
  const color = TYPE_COLORS[event.event_type] || TYPE_COLORS.default
  const label = TYPE_LABELS[event.event_type] || event.event_type

  return (
    <div className="ev-card">
      <Link href={`/events/${event.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div className="ev-banner" style={{ background: event.cover_image_url ? `url(${event.cover_image_url}) center/cover no-repeat` : gradientFor(event.event_type) }}>
          <span className="type-badge" style={{ background: color }}>{label}</span>
          {event.is_featured && <span className="featured-star">★ Featured</span>}
        </div>
        <div className="ev-body">
          <div className="ev-title">{event.title}</div>
          <div className="ev-meta">
            <span><Calendar size={10} />{new Date(event.event_date_start).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span><MapPin size={10} />{event.city}, {event.province}</span>
          </div>
          <div className="ev-chips">
            {event.distance && <span className="ev-chip">{event.distance}</span>}
            {event.entry_fee && <span className="ev-chip fee">{event.entry_fee}</span>}
          </div>
        </div>
      </Link>
      {event.entry_url && (
        <div style={{ padding: '0 12px 12px' }}>
          <a href={event.entry_url} target="_blank" rel="noopener noreferrer" className="ev-visit">
            <ExternalLink size={11} /> Visit Website
          </a>
        </div>
      )}
    </div>
  )
}
