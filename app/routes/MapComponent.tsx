'use client'

import { useEffect, useRef } from 'react'

const DISCIPLINE_COLOR: Record<string, string> = {
  road:        '#3B82F6',
  mtb:         '#7C3AED',
  gravel:      '#D97706',
  urban:       '#10B981',
  bikepacking: '#EC4899',
}

interface RouteMarker {
  id: string
  slug: string
  name: string
  discipline: string
  distanceKm?: string | number | null
  distance_from_user?: string | number | null
  lat: string | number
  lng: string | number
}

interface MapComponentProps {
  routes: RouteMarker[]
  onRouteClick?: (slug: string) => void
  center?: [number, number]
  zoom?: number
  singleMarker?: boolean
  // Near Me props — passed from parent when active
  userLat?: number | null
  userLng?: number | null
  nearbyKm?: number
  nearMeActive?: boolean
}

export default function MapComponent({
  routes,
  onRouteClick,
  center = [-29, 25],
  zoom = 5,
  singleMarker = false,
  userLat,
  userLng,
  nearbyKm = 50,
  nearMeActive = false,
}: MapComponentProps) {
  const mapRef        = useRef<HTMLDivElement>(null)
  const mapInstance   = useRef<any>(null)
  const leafletRef    = useRef<any>(null)
  const markersLayer  = useRef<any>(null)   // FeatureGroup for route markers
  const userLayer     = useRef<any>(null)   // Layer for user dot + radius circle
  const readyRef      = useRef(false)       // true once Leaflet is fully initialised
  const pendingUpdate = useRef(false)       // queued update while map is loading

  // ── Helpers ──────────────────────────────────────────────────────────────

  const buildPopupHtml = (route: RouteMarker, color: string) => {
    const distAway = route.distance_from_user != null
      ? `<span style="font-size:11px;color:#10B981;font-weight:600;">📍 ${parseFloat(String(route.distance_from_user)).toFixed(1)} km away</span>`
      : ''
    const distRoute = route.distanceKm
      ? `<span style="font-size:11px;color:#6B7280;">${parseFloat(String(route.distanceKm)).toFixed(0)} km route</span>`
      : ''
    return `
      <div style="min-width:175px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:2px;">
        <div style="font-weight:800;font-size:13px;margin-bottom:6px;color:var(--color-primary);line-height:1.3;">${route.name}</div>
        <div style="display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin-bottom:10px;">
          <span style="background:${color};color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;text-transform:uppercase;letter-spacing:0.04em;">${route.discipline}</span>
          ${distRoute}
          ${distAway}
        </div>
        ${onRouteClick
          ? `<button onclick="window.__cmRouteClick&&window.__cmRouteClick('${route.slug}')" style="width:100%;background:var(--color-primary);color:#fff;border:none;padding:7px 0;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer;letter-spacing:0.02em;">View Route →</button>`
          : ''}
      </div>`
  }

  // Haversine — exact radius-to-zoom mapping
  // Returns zoom level so the given km radius fits comfortably in the viewport
  const radiusToZoom = (km: number): number => {
    // Approximate: at zoom Z, visible radius ≈ 40075 / (256 * 2^Z) km
    // Solve for Z given desired radius. We want radius to fit in ~80% of viewport.
    if (km <= 5)   return 13
    if (km <= 10)  return 12
    if (km <= 25)  return 11
    if (km <= 50)  return 10
    if (km <= 100) return 9
    if (km <= 200) return 8
    return 7
  }

  // ── Render markers + optional user location/radius circle ───────────────

  const renderMap = (L: any, map: any) => {
    if (onRouteClick) (window as any).__cmRouteClick = onRouteClick

    // Clear previous layers
    if (markersLayer.current) { markersLayer.current.clearLayers() }
    else { markersLayer.current = L.featureGroup().addTo(map) }

    if (userLayer.current) { userLayer.current.clearLayers() }
    else { userLayer.current = L.featureGroup().addTo(map) }

    // ── Route markers ────────────────────────────────────────────────────
    const validRoutes = routes.filter(r => {
      const lat = parseFloat(String(r.lat))
      const lng = parseFloat(String(r.lng))
      return !isNaN(lat) && !isNaN(lng)
    })

    validRoutes.forEach((route) => {
      const lat = parseFloat(String(route.lat))
      const lng = parseFloat(String(route.lng))
      const color = DISCIPLINE_COLOR[route.discipline] ?? '#64748B'

      const icon = L.divIcon({
        html: `<div style="
          width:16px;height:16px;
          background:${color};
          border:2.5px solid white;
          border-radius:50%;
          box-shadow:0 2px 8px rgba(0,0,0,0.4);
          transition:transform 0.15s;
        "></div>`,
        className: '',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })

      const marker = L.marker([lat, lng], { icon })
      marker.bindPopup(buildPopupHtml(route, color), {
        maxWidth: 220,
        className: 'cm-popup',
      })
      markersLayer.current.addLayer(marker)
    })

    // ── User location + radius circle ────────────────────────────────────
    if (nearMeActive && userLat != null && userLng != null) {
      // Pulsing user location dot
      const userIcon = L.divIcon({
        html: `
          <div style="position:relative;width:20px;height:20px;">
            <div style="
              position:absolute;top:50%;left:50%;
              transform:translate(-50%,-50%);
              width:14px;height:14px;
              background:#2563EB;
              border:3px solid white;
              border-radius:50%;
              box-shadow:0 2px 8px rgba(37,99,235,0.6);
              z-index:2;
            "></div>
            <div style="
              position:absolute;top:50%;left:50%;
              transform:translate(-50%,-50%);
              width:28px;height:28px;
              background:rgba(37,99,235,0.2);
              border-radius:50%;
              animation:cm-pulse 2s ease-out infinite;
              z-index:1;
            "></div>
          </div>`,
        className: '',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      })

      const userMarker = L.marker([userLat, userLng], {
        icon: userIcon,
        zIndexOffset: 1000,
      }).bindPopup('<div style="font-family:sans-serif;font-size:12px;font-weight:700;color:var(--color-primary);">📍 Your Location</div>')

      userLayer.current.addLayer(userMarker)

      // Radius circle — translucent blue fill, solid border
      const radiusMetres = nearbyKm * 1000
      const circle = L.circle([userLat, userLng], {
        radius: radiusMetres,
        color: '#2563EB',
        weight: 2,
        opacity: 0.6,
        fillColor: '#3B82F6',
        fillOpacity: 0.08,
        dashArray: '6 4',
      })
      userLayer.current.addLayer(circle)

      // Fit the map to the radius circle (not the markers)
      // This guarantees the zoom matches the selected km radius exactly
      const circleBounds = circle.getBounds()
      map.fitBounds(circleBounds, {
        padding: [32, 32],
        animate: true,
        duration: 0.6,
      })

    } else if (validRoutes.length > 0) {
      // No Near Me — fit all route markers
      const bounds = markersLayer.current.getBounds()
      if (bounds.isValid()) {
        if (validRoutes.length === 1) {
          map.setView([
            parseFloat(String(validRoutes[0].lat)),
            parseFloat(String(validRoutes[0].lng)),
          ], 13, { animate: true, duration: 0.6 })
        } else {
          map.fitBounds(bounds, { padding: [48, 48], maxZoom: 12, animate: true, duration: 0.6 })
        }
      }
    }
  }

  // ── Map initialisation (once) ─────────────────────────────────────────

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    // Inject pulse animation CSS
    if (!document.getElementById('cm-map-style')) {
      const style = document.createElement('style')
      style.id = 'cm-map-style'
      style.textContent = `
        @keyframes cm-pulse {
          0%   { transform: translate(-50%,-50%) scale(0.5); opacity: 0.8; }
          100% { transform: translate(-50%,-50%) scale(2.2); opacity: 0; }
        }
        .cm-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.18);
          border: none;
          padding: 0;
        }
        .cm-popup .leaflet-popup-content { margin: 14px 16px; }
        .cm-popup .leaflet-popup-tip { background: #fff; }
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
        center,
        zoom,
        zoomControl:      true,
        scrollWheelZoom:  !singleMarker,
        zoomSnap:         0.5,
        zoomDelta:        0.5,
      })
      mapInstance.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      setTimeout(() => {
        map.invalidateSize()
        readyRef.current = true
        // Process any queued update from before Leaflet was ready
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

  // ── Re-render when routes or Near Me state changes ────────────────────

  useEffect(() => {
    if (!readyRef.current || !mapInstance.current || !leafletRef.current) {
      // Map not ready yet — mark pending, init useEffect will call renderMap on ready
      pendingUpdate.current = true
      return
    }
    renderMap(leafletRef.current, mapInstance.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routes, nearMeActive, userLat, userLng, nearbyKm])

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '100%', flex: 1, borderRadius: 'inherit' }} />
  )
}
