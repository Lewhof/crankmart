'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { countryFromPath } from '@/lib/regions-static'
import { getLocale } from '@/lib/currency'

const COUNTRY_MAP_CENTER: Record<string, [number, number]> = {
  za: [-29, 25],
  au: [-25, 135],
}

const TYPE_COLORS: Record<string, string> = {
  race: '#EF4444', stage_race: '#0D1B2A', fun_ride: '#10B981',
  social_ride: '#3B82F6', tour: '#F59E0B', training_camp: '#8B5CF6',
  festival: '#EC4899', default: '#6B7280',
}
const TYPE_LABELS: Record<string, string> = {
  race: 'Race', stage_race: 'Stage Race', fun_ride: 'Fun Ride',
  social_ride: 'Social Ride', tour: 'Tour', training_camp: 'Training Camp', festival: 'Festival',
}

interface EventPin {
  id: string; slug: string; title: string
  event_type: string; city: string; province: string
  event_date_start: string
  lat: number; lng: number
}

interface Props {
  events: EventPin[]
  userLat?: number | null
  userLng?: number | null
  nearbyKm?: number
  nearMeActive?: boolean
}

interface LeafletLib {
  map: (el: HTMLElement, config: any) => any;
  tileLayer: (url: string, config: any) => any;
  divIcon: (config: any) => any;
  marker: (coords: [number, number], config: any) => any;
  layerGroup: () => any;
  circle: (coords: [number, number], config: any) => any;
}

export default function EventsMap({ events, userLat, userLng, nearbyKm = 50, nearMeActive = false }: Props) {
  const country = countryFromPath(usePathname())
  const locale = getLocale(country)
  const mapCenter = COUNTRY_MAP_CENTER[country] ?? COUNTRY_MAP_CENTER.za
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const leafletRef = useRef<LeafletLib | null>(null)
  const markersLayer = useRef<any>(null)
  const userLayer = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return
    let L: LeafletLib
    Promise.all([
      import('leaflet'),
      import('leaflet/dist/leaflet.css' as any),
    ]).then(([leaflet]: [any, any]) => {
      L = leaflet.default ?? leaflet
      leafletRef.current = L
      const map = L.map(mapRef.current!, { center: mapCenter, zoom: country === 'au' ? 4 : 5, zoomControl: true })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors', maxZoom: 18,
      }).addTo(map)
      mapInstance.current = map
      markersLayer.current = L.layerGroup().addTo(map)
      userLayer.current = L.layerGroup().addTo(map)
      updateMarkers(L)
    })
  }, [])

  function updateMarkers(L: LeafletLib) {
    if (!L || !markersLayer.current) return
    markersLayer.current.clearLayers()

    events.forEach(e => {
      const color = TYPE_COLORS[e.event_type] || TYPE_COLORS.default
      const label = TYPE_LABELS[e.event_type] || e.event_type
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3);"></div>`,
        iconSize: [14, 14], iconAnchor: [7, 7],
      })
      const marker = L.marker([e.lat, e.lng], { icon })
      const date = new Date(e.event_date_start).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
      marker.bindPopup(`
        <div style="min-width:180px;font-family:Inter,sans-serif;">
          <div style="font-size:12px;font-weight:800;color:#1a1a1a;margin-bottom:4px;line-height:1.3;">${e.title}</div>
          <div style="display:inline-block;background:${color};color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:2px;text-transform:uppercase;margin-bottom:6px;">${label}</div>
          <div style="font-size:11px;color:#6b7280;margin-bottom:8px;">📅 ${date}<br>📍 ${e.city}, ${e.province}</div>
          <a href="/events/${e.slug}" style="display:block;text-align:center;padding:7px;background:#0D1B2A;color:#fff;border-radius:2px;font-size:12px;font-weight:700;text-decoration:none;">View Event →</a>
        </div>
      `, { maxWidth: 220 })
      markersLayer.current.addLayer(marker)
    })
  }

  useEffect(() => {
    const L = leafletRef.current
    if (!L) return
    updateMarkers(L)
  }, [events])

  useEffect(() => {
    const L = leafletRef.current
    if (!L || !userLayer.current || !mapInstance.current) return
    userLayer.current.clearLayers()
    if (nearMeActive && userLat != null && userLng != null) {
      const userIcon = L.divIcon({
        className: '',
        html: `<div style="width:16px;height:16px;border-radius:50%;background:#16A34A;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);"></div>`,
        iconSize: [16, 16], iconAnchor: [8, 8],
      })
      L.marker([userLat, userLng], { icon: userIcon }).addTo(userLayer.current).bindPopup('Your location')
      L.circle([userLat, userLng], { radius: nearbyKm * 1000, color: '#16A34A', fillColor: '#16A34A', fillOpacity: 0.07, weight: 1.5 }).addTo(userLayer.current)
      mapInstance.current.setView([userLat, userLng], events.length > 0 ? 9 : 8)
    }
  }, [nearMeActive, userLat, userLng, nearbyKm])

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
}
