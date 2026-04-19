import { ImageResponse } from 'next/og'
import { getCountry } from '@/lib/country'
import { getCountryConfig } from '@/lib/country-config'

export const runtime = 'edge'
export const revalidate = 3600
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { slug: string } }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://crankmart.com'
  const country = await getCountry()
  const cfg = getCountryConfig(country)
  let title = 'CrankMart event'
  let dateStr = ''
  let location = ''
  let discipline = ''

  try {
    const res = await fetch(`${baseUrl}/api/events/${params.slug}`, {
      headers: { 'x-country': country },
      next: { revalidate: 3600 },
    })
    if (res.ok) {
      const e = await res.json()
      title = e.title || title
      const start = e.event_date_start || e.start_date
      if (start) {
        dateStr = new Date(start).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })
      }
      location = [e.city, e.province].filter(Boolean).join(', ')
      discipline = (e.event_type || e.discipline || '').toString().toUpperCase()
    }
  } catch { /* fall through */ }

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '56px 64px',
        background: 'linear-gradient(135deg, #0a0f1e 0%, #1a2340 60%, #273970 100%)',
        color: '#fff',
        fontFamily: 'system-ui',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg, #273970, #4f6bc4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 900,
          }}>📅</div>
          <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: -0.6 }}>CrankMart Events</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {discipline && (
            <div style={{
              display: 'inline-flex', alignItems: 'center',
              alignSelf: 'flex-start',
              padding: '8px 18px', borderRadius: 999,
              background: 'rgba(129, 140, 248, 0.18)',
              border: '1px solid rgba(165, 180, 252, 0.35)',
              color: '#a5b4fc',
              fontSize: 20, fontWeight: 700, letterSpacing: 2,
            }}>{discipline}</div>
          )}
          <div style={{
            fontSize: 72, fontWeight: 900, lineHeight: 1.05, letterSpacing: -2,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>{title}</div>
          {dateStr && (
            <div style={{
              fontSize: 38, fontWeight: 800, letterSpacing: -0.5,
              background: 'linear-gradient(90deg, #818cf8, #a5b4fc)',
              backgroundClip: 'text',
              color: 'transparent',
            }}>{dateStr}</div>
          )}
          {location && (
            <div style={{ fontSize: 26, color: 'rgba(255,255,255,.6)' }}>{location}</div>
          )}
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 20, color: 'rgba(255,255,255,.45)',
        }}>
          <div>crankmart.com/events</div>
          <div>{cfg.name}'s Cycling Events</div>
        </div>
      </div>
    ),
    { ...size },
  )
}
