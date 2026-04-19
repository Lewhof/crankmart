import { ImageResponse } from 'next/og'
import { getCountry } from '@/lib/country'
import { getCountryConfig } from '@/lib/country-config'
import { formatPrice } from '@/lib/currency'

export const runtime = 'edge'
export const revalidate = 3600
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const CONDITION_LABELS: Record<string, string> = {
  new: 'New', like_new: 'Like New', used: 'Used', poor: 'Fair',
}

export default async function Image({ params }: { params: { slug: string } }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://crankmart.com'
  const country = await getCountry()
  const cfg = getCountryConfig(country)
  let title = 'CrankMart listing'
  let price = ''
  let cond = ''
  let location = ''

  try {
    const res = await fetch(`${baseUrl}/api/listings/${params.slug}`, {
      headers: { 'x-country': country },
      next: { revalidate: 3600 },
    })
    if (res.ok) {
      const l = await res.json()
      const make  = l.bikeMake ? `${l.bikeMake} ` : ''
      const model = l.bikeModel ? l.bikeModel : ''
      const year  = l.bikeYear ? ` ${l.bikeYear}` : ''
      title = (make + model + year).trim() || l.title || title
      price = l.price ? formatPrice(country, l.price) : ''
      cond = CONDITION_LABELS[l.condition] || ''
      location = [l.city, l.province].filter(Boolean).join(', ')
    }
  } catch { /* fall through to generic */ }

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
          }}>🚲</div>
          <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: -0.6 }}>CrankMart</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {cond && (
            <div style={{
              display: 'inline-flex', alignItems: 'center',
              alignSelf: 'flex-start',
              padding: '8px 18px', borderRadius: 999,
              background: 'rgba(129, 140, 248, 0.18)',
              border: '1px solid rgba(165, 180, 252, 0.35)',
              color: '#a5b4fc',
              fontSize: 20, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: 2,
            }}>{cond}</div>
          )}
          <div style={{
            fontSize: 72, fontWeight: 900, lineHeight: 1.05, letterSpacing: -2,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>{title}</div>
          {price && (
            <div style={{
              fontSize: 56, fontWeight: 800, letterSpacing: -1.5,
              background: 'linear-gradient(90deg, #818cf8, #a5b4fc)',
              backgroundClip: 'text',
              color: 'transparent',
            }}>{price}</div>
          )}
          {location && (
            <div style={{ fontSize: 26, color: 'rgba(255,255,255,.6)' }}>{location}</div>
          )}
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 20, color: 'rgba(255,255,255,.45)',
        }}>
          <div>crankmart.com</div>
          <div>{cfg.name}'s Cycling Marketplace</div>
        </div>
      </div>
    ),
    { ...size },
  )
}
