'use client'

import { useEffect, useRef } from 'react'

const TYPE_COLOR: Record<string, string> = {
  shop:            '#0D1B2A',
  brand:           '#E63946',
  service_center:  '#F4A532',
  tour_operator:   '#2D6A4F',
  event_organiser: '#3B82F6',
}

const TYPE_LABEL: Record<string, string> = {
  shop:            'Bike Shop',
  brand:           'Brand/Importer',
  service_center:  'Workshop',
  tour_operator:   'Tour & Rental',
  event_organiser: 'Event Organiser',
}

interface BusinessMarker {
  id:                  string
  slug:                string
  name:                string
  type:                string
  city:                string
  lat:                 number
  lng:                 number
  distance_from_user?: number | null
}

interface DirectoryMapProps {
  businesses:    BusinessMarker[]
  center?:       [number, number]
  zoom?:         number
  // Near Me props
  userLat?:      number | null
  userLng?:      number | null
  nearbyKm?:     number
  nearMeActive?: boolean
}

export default function DirectoryMap({
  businesses,
  center       = [-29, 25],
  zoom         = 5,
  userLat,
  userLng,
  nearbyKm     = 50,
  nearMeActive = false,
}: DirectoryMapProps) {
  const mapRef       = useRef<HTMLDivElement>(null)
  const mapInstance  = useRef<any>(null)
  const leafletRef   = useRef<any>(null)
  const markersLayer = useRef<any>(null)
  const userLayer    = useRef<any>(null)
  const readyRef     = useRef(false)

  const buildPopupHtml = (b: BusinessMarker, color: string) => {
    const distAway = b.distance_from_user != null
      ? `<span style="font-size:11px;color:#10B981;font-weight:600;">📍 ${b.distance_from_user.toFixed(1)} km away</span>`
      : ''
    return `
      <div style="min-width:175px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:2px;">
        <div style="font-weight:800;font-size:13px;margin-bottom:6px;color:var(--color-primary);line-height:1.3;">${b.name}</div>
        <div style="display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin-bottom:10px;">
          <span style="background:${color};color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;text-transform:uppercase;letter-spacing:0.04em;">
            ${TYPE_LABEL[b.type] ?? b.type}
          </span>
          <span style="font-size:11px;color:#6B7280;">${b.city}</span>
          ${distAway}
        </div>
        <a href="/directory/${b.slug}"
           style="display:block;width:100%;background:var(--color-primary);color:#fff;text-decoration:none;text-align:center;padding:7px 0;border-radius:7px;font-size:12px;font-weight:700;letter-spacing:0.02em;">
          View Profile →
        </a>
      </div>`
  }

  const renderMap = (L: any, map: any) => {
    // Clear markers
    if (markersLayer.current) markersLayer.current.clearLayers()
    else markersLayer.current = L.featureGroup().addTo(map)

    if (userLayer.current) userLayer.current.clearLayers()
    else userLayer.current = L.featureGroup().addTo(map)

    const valid = businesses.filter(b => !isNaN(b.lat) && !isNaN(b.lng))

    valid.forEach((b) => {
      const color = TYPE_COLOR[b.type] ?? '#64748B'
      const icon = L.divIcon({
        html: `<div style="
          width:14px;height:14px;
          background:${color};
          border:2.5px solid white;
          border-radius:50%;
          box-shadow:0 2px 8px rgba(0,0,0,0.4);
        "></div>`,
        className: '',
        iconSize:   [14, 14],
        iconAnchor: [7, 7],
      })
      const marker = L.marker([b.lat, b.lng], { icon })
      marker.bindPopup(buildPopupHtml(b, color), {
        maxWidth:  240,
        className: 'cm-biz-popup',
      })
      markersLayer.current.addLayer(marker)
    })

    if (nearMeActive && userLat != null && userLng != null) {
      // Pulsing user dot
      const userIcon = L.divIcon({
        html: `
          <div style="position:relative;width:20px;height:20px;">
            <div style="
              position:absolute;top:50%;left:50%;
              transform:translate(-50%,-50%);
              width:14px;height:14px;
              background:#2563EB;border:3px solid white;border-radius:50%;
              box-shadow:0 2px 8px rgba(37,99,235,0.6);z-index:2;
            "></div>
            <div style="
              position:absolute;top:50%;left:50%;
              transform:translate(-50%,-50%);
              width:28px;height:28px;
              background:rgba(37,99,235,0.2);border-radius:50%;
              animation:cm-pulse 2s ease-out infinite;z-index:1;
            "></div>
          </div>`,
        className: '',
        iconSize:   [20, 20],
        iconAnchor: [10, 10],
      })
      const userMarker = L.marker([userLat, userLng], { icon: userIcon, zIndexOffset: 1000 })
        .bindPopup('<div style="font-family:sans-serif;font-size:12px;font-weight:700;color:var(--color-primary);">📍 Your Location</div>')
      userLayer.current.addLayer(userMarker)

      // Radius circle
      const circle = L.circle([userLat, userLng], {
        radius:      nearbyKm * 1000,
        color:       '#2563EB',
        weight:      2,
        opacity:     0.6,
        fillColor:   '#3B82F6',
        fillOpacity: 0.08,
        dashArray:   '6 4',
      })
      userLayer.current.addLayer(circle)
      map.fitBounds(circle.getBounds(), { padding: [32, 32], animate: true, duration: 0.6 })

    } else if (valid.length > 0) {
      const bounds = markersLayer.current.getBounds()
      if (bounds.isValid()) {
        if (valid.length === 1) {
          map.setView([valid[0].lat, valid[0].lng], 13, { animate: true, duration: 0.6 })
        } else {
          map.fitBounds(bounds, { padding: [48, 48], maxZoom: 12, animate: true, duration: 0.6 })
        }
      }
    }
  }

  // Init map once
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'; link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    if (!document.getElementById('cm-biz-map-style')) {
      const style = document.createElement('style')
      style.id = 'cm-biz-map-style'
      style.textContent = `
        .cm-biz-popup .leaflet-popup-content-wrapper {
          border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.18);border:none;padding:0;
        }
        .cm-biz-popup .leaflet-popup-content { margin:14px 16px; }
        .cm-biz-popup .leaflet-popup-tip { background:#fff; }
        @keyframes cm-pulse {
          0% { transform:translate(-50%,-50%) scale(1); opacity:.8; }
          100% { transform:translate(-50%,-50%) scale(2.5); opacity:0; }
        }
      `
      document.head.appendChild(style)
    }

    import('leaflet').then((mod) => {
      const L = mod.default
      leafletRef.current = L

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, {
        center, zoom, zoomControl: true, scrollWheelZoom: true, zoomSnap: 0.5,
      })
      mapInstance.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      setTimeout(() => {
        map.invalidateSize()
        readyRef.current = true
        renderMap(L, map)
      }, 150)
    })

    return () => {
      readyRef.current = false
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
        markersLayer.current = null
        userLayer.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-render on data / Near Me state change
  useEffect(() => {
    if (!readyRef.current || !mapInstance.current || !leafletRef.current) return
    renderMap(leafletRef.current, mapInstance.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businesses, nearMeActive, userLat, userLng, nearbyKm])

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
}
