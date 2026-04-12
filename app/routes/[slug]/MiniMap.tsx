'use client'

import { useEffect, useRef } from 'react'

export default function MiniMap({ name, slug, discipline, lat, lng }: { name: string; slug: string; discipline: string; lat: string; lng: string }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  const DISCIPLINE_COLOR: Record<string, string> = {
    road: '#3B82F6', mtb: '#7C3AED', gravel: '#D97706', urban: '#10B981', bikepacking: '#EC4899',
  }

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'; link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    import('leaflet').then((leafletModule) => {
      const L = leafletModule.default
      delete (L.Icon.Default.prototype as any)._getIconUrl
      const latNum = parseFloat(lat), lngNum = parseFloat(lng)
      if (isNaN(latNum) || isNaN(lngNum)) return
      const map = L.map(mapRef.current!, { center: [latNum, lngNum], zoom: 12, zoomControl: false, scrollWheelZoom: false, dragging: false })
      mapInstanceRef.current = map
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)
      const color = DISCIPLINE_COLOR[discipline] ?? '#64748B'
      const icon = L.divIcon({ html: `<div style="width:16px;height:16px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`, className: '', iconSize: [16, 16], iconAnchor: [8, 8] })
      L.marker([latNum, lngNum], { icon }).addTo(map)
      setTimeout(() => map.invalidateSize(), 100)
    })
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null } }
  }, [lat, lng, discipline])

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
}
