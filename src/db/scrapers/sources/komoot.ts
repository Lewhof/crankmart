import * as cheerio from 'cheerio'
import { db } from '../../index'
import { routes, routeImages } from '../../schema'
import { slugify } from '../lib/slugify'
import { checkDuplicate } from '../lib/dedup'
import { sql } from 'drizzle-orm'

type Discipline = 'road' | 'mtb' | 'gravel'
type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert'

const GUIDES: Array<{ url: string; discipline: Discipline }> = [
  { url: 'https://www.komoot.com/guide/72227/mtb-trails-in-south-africa',          discipline: 'mtb' },
  { url: 'https://www.komoot.com/guide/72228/road-cycling-routes-in-south-africa', discipline: 'road' },
  { url: 'https://www.komoot.com/guide/72229/cycling-in-south-africa',             discipline: 'road' },
  { url: 'https://www.komoot.com/guide/3442843/gravel-biking-in-south-africa',     discipline: 'gravel' },
]

const SA_PROVINCES: Record<string, string> = {
  'western cape':   'Western Cape',
  'eastern cape':   'Eastern Cape',
  'northern cape':  'Northern Cape',
  'north west':     'North West',
  'free state':     'Free State',
  'kwazulu-natal':  'KwaZulu-Natal',
  'kzn':            'KwaZulu-Natal',
  'gauteng':        'Gauteng',
  'limpopo':        'Limpopo',
  'mpumalanga':     'Mpumalanga',
}

function mapProvince(text: string): string | null {
  const lower = text.toLowerCase()
  for (const [key, val] of Object.entries(SA_PROVINCES)) {
    if (lower.includes(key)) return val
  }
  return null
}

function mapDifficulty(raw: string): Difficulty {
  const s = raw.toLowerCase()
  if (s.includes('easy'))   return 'beginner'
  if (s.includes('hard') || s.includes('difficult')) return 'advanced'
  if (s.includes('expert')) return 'expert'
  return 'intermediate'
}

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'CrankMartBot/1.0 (+https://crankmart.com)' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`)
  return res.text()
}

async function fetchTourIds(guideUrl: string): Promise<string[]> {
  const html = await fetchHtml(guideUrl)
  const $ = cheerio.load(html)
  const ids = new Set<string>()

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') ?? ''
    const match = href.match(/\/tour\/(\d+)/)
    if (match) ids.add(match[1])
  })

  return Array.from(ids)
}

interface TourDetail {
  title: string
  description: string
  distanceKm: number | null
  elevationM: number | null
  difficulty: Difficulty
  lat: number | null
  lng: number | null
  province: string | null
  images: string[]
}

async function fetchTourDetail(tourId: string): Promise<TourDetail> {
  const url = `https://www.komoot.com/tour/${tourId}`
  const html = await fetchHtml(url)
  const $ = cheerio.load(html)

  const title = ($('h1').first().text().trim() ||
    $('meta[property="og:title"]').attr('content')) ?? ''

  const description = $('meta[property="og:description"]').attr('content') ?? ''

  // Extract from JSON-LD
  let lat: number | null = null
  let lng: number | null = null
  let distanceKm: number | null = null
  let elevationM: number | null = null

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).text())
      if (data?.geo?.latitude) lat = parseFloat(data.geo.latitude)
      if (data?.geo?.longitude) lng = parseFloat(data.geo.longitude)
      if (data?.distance) distanceKm = parseFloat(data.distance) / 1000
    } catch { /* ignore */ }
  })

  // Fallback: meta tags
  if (!lat) {
    const latMeta = $('meta[name="geo.latitude"]').attr('content')
    const lngMeta = $('meta[name="geo.longitude"]').attr('content')
    if (latMeta) lat = parseFloat(latMeta)
    if (lngMeta) lng = parseFloat(lngMeta)
  }

  // Distance / elevation from page text
  const bodyText = $('body').text()
  if (!distanceKm) {
    const m = bodyText.match(/(\d+(?:[.,]\d+)?)\s*km/i)
    if (m) distanceKm = parseFloat(m[1].replace(',', '.'))
  }
  if (!elevationM) {
    const m = bodyText.match(/(\d+)\s*m\s*(elevation|ascent|climb)/i)
    if (m) elevationM = parseInt(m[1])
  }

  // Difficulty
  let difficulty: Difficulty = 'intermediate'
  $('[class*="difficulty"],[class*="level"],[data-difficulty]').each((_, el) => {
    const t = $(el).text().trim()
    if (t) difficulty = mapDifficulty(t)
  })

  // Province from page text
  const province = mapProvince(bodyText)

  // Images
  const images: string[] = []
  const ogImage = $('meta[property="og:image"]').attr('content')
  if (ogImage) images.push(ogImage)

  $('img[src]').each((_, el) => {
    const src = $(el).attr('src') ?? ''
    if (src.startsWith('http') && src.includes('komoot') && !images.includes(src)) {
      images.push(src)
    }
  })

  return {
    title,
    description,
    distanceKm,
    elevationM,
    difficulty,
    lat,
    lng,
    province,
    images: images.slice(0, 12),
  }
}

export async function scrapeKomoot(): Promise<{ added: number; updated: number; errors: string[] }> {
  const errors: string[] = []
  let added = 0
  let updated = 0

  for (const guide of GUIDES) {
    console.log(`  Fetching guide: ${guide.url}`)
    let tourIds: string[]
    try {
      tourIds = await fetchTourIds(guide.url)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`Guide ${guide.url}: ${msg}`)
      await sleep(1000)
      continue
    }

    const limited = tourIds.slice(0, 50)
    console.log(`  Found ${tourIds.length} tours, processing ${limited.length}`)

    for (const tourId of limited) {
      await sleep(1000)
      try {
        const detail = await fetchTourDetail(tourId)
        if (!detail.title) continue

        const slug = slugify(detail.title)
        const dup = await checkDuplicate({
          slug,
          lat: detail.lat,
          lng: detail.lng,
          discipline: guide.discipline,
        })

        if (dup.exists && dup.id) {
          await db.execute(sql`
            UPDATE routes SET last_scraped_at = NOW(), updated_at = NOW()
            WHERE id = ${dup.id}
          `)
          updated++
          continue
        }

        const [inserted] = await db.insert(routes).values({
          slug,
          name: detail.title,
          description: detail.description || null,
          discipline: guide.discipline,
          difficulty: detail.difficulty,
          surface: guide.discipline === 'road' ? 'tarmac' : guide.discipline === 'gravel' ? 'gravel' : 'singletrack',
          distanceKm: detail.distanceKm?.toFixed(1) ?? null,
          elevationM: detail.elevationM,
          province: detail.province,
          lat: detail.lat?.toString() ?? null,
          lng: detail.lng?.toString() ?? null,
          facilities: {},
          tags: [],
          sourceName: 'komoot',
          sourceUrl: `https://www.komoot.com/tour/${tourId}`,
          lastScrapedAt: new Date(),
          imageCount: detail.images.length,
          primaryImageUrl: detail.images[0] ?? null,
        }).returning({ id: routes.id })

        if (inserted && detail.images.length > 0) {
          await db.insert(routeImages).values(
            detail.images.map((imgUrl, i) => ({
              routeId: inserted.id,
              url: imgUrl,
              displayOrder: i,
              isPrimary: i === 0,
              source: 'scrape',
            }))
          )
        }

        added++
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        errors.push(`Tour ${tourId}: ${msg}`)
      }
    }
  }

  return { added, updated, errors }
}
