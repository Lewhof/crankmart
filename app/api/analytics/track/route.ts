import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

// Country code → flag emoji
function countryFlag(code: string) {
  if (!code || code.length !== 2) return ''
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1E6 - 65 + c.charCodeAt(0)))
}

async function geoLookup(ip: string): Promise<{ country: string; countryCode: string; city: string; region: string } | null> {
  // Skip private/local IPs
  if (!ip || /^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|::1|localhost)/i.test(ip)) return null
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country,countryCode,regionName,city`, {
      signal: AbortSignal.timeout(1500),
    })
    if (!res.ok) return null
    const data = await res.json()
    if (data.status === 'fail') return null
    return { country: data.country, countryCode: data.countryCode, city: data.city, region: data.regionName }
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const path = body.path?.slice(0, 500) || '/'
    const referrer = (request.headers.get('referer') || body.referrer || '').slice(0, 500)
    const ua = request.headers.get('user-agent') || ''

    // Device detection
    const isTablet = /Tablet|iPad/i.test(ua)
    const isMobile = /Mobile|Android|iPhone/i.test(ua)
    const device = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop'

    // Browser detection
    const browser = /Edg/i.test(ua) ? 'Edge'
      : /Chrome/i.test(ua) ? 'Chrome'
      : /Firefox/i.test(ua) ? 'Firefox'
      : /Safari/i.test(ua) ? 'Safari'
      : 'Other'

    // Skip bots
    if (/bot|crawler|spider|crawling|Googlebot|Bingbot|facebookexternalhit/i.test(ua)) {
      return NextResponse.json({ ok: true })
    }

    // Visitor + session IDs
    const existingVisitorId = request.cookies.get('_cm_vid')?.value
    const visitorId = existingVisitorId || crypto.randomUUID()
    const existingSessionId = request.cookies.get('_cm_sid')?.value
    const sessionId = existingSessionId || crypto.randomUUID()

    // Geo — Cloudflare header first (free, instant), then ip-api fallback
    let country = ''
    let countryCode = ''
    let city = ''
    let region = ''

    const cfCountry = request.headers.get('cf-ipcountry')
    if (cfCountry && cfCountry !== 'XX') {
      countryCode = cfCountry
    } else {
      // Get real IP (handle proxies)
      const forwarded = request.headers.get('x-forwarded-for')
      const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || ''
      const geo = await geoLookup(ip)
      if (geo) {
        country = geo.country
        countryCode = geo.countryCode
        city = geo.city
        region = geo.region
      }
    }

    await db.execute(sql`
      INSERT INTO page_views (path, referrer, device, browser, visitor_id, session_id, country, country_code, city, region)
      VALUES (${path}, ${referrer}, ${device}, ${browser}, ${visitorId}, ${sessionId},
              ${country || null}, ${countryCode || null}, ${city || null}, ${region || null})
    `)

    const res = NextResponse.json({ ok: true })

    if (!existingVisitorId) {
      res.cookies.set('_cm_vid', visitorId, { maxAge: 60 * 60 * 24 * 365, httpOnly: true, sameSite: 'lax', path: '/' })
    }
    res.cookies.set('_cm_sid', sessionId, { maxAge: 60 * 30, httpOnly: true, sameSite: 'lax', path: '/' })

    return res
  } catch (e) {
    return NextResponse.json({ ok: true })
  }
}
