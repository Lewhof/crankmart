import * as cheerio from 'cheerio'
import { db } from '../../index'
import { routes, routeImages, routeLoops } from '../../schema'
import { slugify } from '../lib/slugify'
import { checkDuplicate } from '../lib/dedup'
import { sql } from 'drizzle-orm'

const BASE = 'https://mtbtrailssa.co.za'

type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert'

function mapDifficulty(raw: string): Difficulty {
  const s = raw.toLowerCase().trim()
  if (s === 'easy')     return 'beginner'
  if (s === 'moderate') return 'intermediate'
  if (s === 'difficult') return 'advanced'
  if (s === 'expert')   return 'expert'
  return 'intermediate'
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'CycleMartBot/1.0 (+https://cyclemart.co.za)' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`)
  return res.text()
}

async function fetchRouteList(): Promise<string[]> {
  const html = await fetchHtml(BASE + '/')
  const $ = cheerio.load(html)
  const urls = new Set<string>()

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') ?? ''
    const match = href.match(/\/routes\/(\d+)/)
    if (match) {
      urls.add(`${BASE}/routes/${match[1]}`)
    }
  })

  return Array.from(urls)
}

interface RouteDetail {
  name: string
  description: string
  distanceKm: number | null
  elevationM: number | null
  estTimeMin: number | null
  difficulty: Difficulty
  lat: number | null
  lng: number | null
  facilities: Record<string, boolean>
  loops: Array<{ name: string; distanceKm: number | null; difficulty: Difficulty }>
  contactEmail: string | null
  contactPhone: string | null
  websiteUrl: string | null
  images: string[]
  province: string | null
  region: string | null
  town: string | null
  tags: string[]
}

async function fetchRouteDetail(url: string): Promise<RouteDetail> {
  const html = await fetchHtml(url)
  const $ = cheerio.load(html)

  const name = $('h1').first().text().trim()

  // Description — "About This Trail" section
  const descParts: string[] = []
  $('*').filter((_, el) => $(el).text().includes('About This Trail')).each((_, el) => {
    $(el).nextAll('p').slice(0, 5).each((_, p) => {
      const t = $(p).text().trim()
      if (t) descParts.push(t)
    })
  })
  const description = descParts.join('\n\n')

  // Stats
  let distanceKm: number | null = null
  let elevationM: number | null = null
  let estTimeMin: number | null = null
  let difficulty: Difficulty = 'intermediate'

  const bodyText = $('body').text()

  const kmMatch = bodyText.match(/(\d+(?:\.\d+)?)\s*km/i)
  if (kmMatch) distanceKm = parseFloat(kmMatch[1])

  const elevMatch = bodyText.match(/(\d+)\s*m\s*(elevation|climb|ascent)/i)
  if (elevMatch) elevationM = parseInt(elevMatch[1])

  const hoursMatch = bodyText.match(/(\d+(?:\.\d+)?)\s*hours?/i)
  if (hoursMatch) estTimeMin = Math.round(parseFloat(hoursMatch[1]) * 60)

  // Difficulty badge
  $('[class*="difficulty"],[class*="badge"],[class*="level"]').each((_, el) => {
    const t = $(el).text().trim().toLowerCase()
    if (['easy','moderate','difficult','expert'].includes(t)) {
      difficulty = mapDifficulty(t)
    }
  })

  // GPS
  let lat: number | null = null
  let lng: number | null = null
  const gpsMatch = bodyText.match(/(-?\d{1,2}\.\d{4,})[,\s]+(-?\d{1,3}\.\d{4,})/)
  if (gpsMatch) {
    lat = parseFloat(gpsMatch[1])
    lng = parseFloat(gpsMatch[2])
  }

  // Location
  let province: string | null = null
  let region: string | null = null
  let town: string | null = null
  $('[class*="location"],[class*="region"],[class*="province"]').each((_, el) => {
    const t = $(el).text().trim()
    if (t && !province) province = t
  })

  // Facilities
  const facilityKeys = ['parking','toilets','coffee_shop','restaurant','showers','wash_bay']
  const facilities: Record<string, boolean> = {}
  facilityKeys.forEach(key => {
    const label = key.replace('_', ' ')
    facilities[key] = bodyText.toLowerCase().includes(label)
  })

  // Tags
  const tags: string[] = []
  $('[class*="feature"],[class*="tag"]').each((_, el) => {
    const t = $(el).text().trim()
    if (t && t.length < 50) tags.push(t)
  })

  // Sub-loops
  const loops: RouteDetail['loops'] = []
  $('table tr, [class*="variant"] [class*="row"]').each((_, row) => {
    const cells = $(row).find('td')
    if (cells.length >= 1) {
      const cellText = cells.first().text().trim()
      const distMatch = cellText.match(/(\d+(?:\.\d+)?)\s*km/i)
      if (distMatch) {
        loops.push({
          name: cellText || `${distMatch[1]}km loop`,
          distanceKm: parseFloat(distMatch[1]),
          difficulty: 'intermediate',
        })
      }
    }
  })

  // Contact
  let contactEmail: string | null = null
  let contactPhone: string | null = null
  let websiteUrl: string | null = null
  const emailMatch = bodyText.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i)
  if (emailMatch) contactEmail = emailMatch[0]
  const phoneMatch = bodyText.match(/(?:\+27|0)[0-9\s-]{8,}/i)
  if (phoneMatch) contactPhone = phoneMatch[0].trim()
  $('a[href^="http"]').each((_, el) => {
    const href = $(el).attr('href') ?? ''
    if (!href.includes('mtbtrailssa.co.za') && !websiteUrl) websiteUrl = href
  })

  // Images — external URLs
  const images: string[] = []
  $('img[src]').each((_, el) => {
    const src = $(el).attr('src') ?? ''
    if (src.startsWith('http') && !src.includes('mtbtrailssa.co.za')) {
      images.push(src)
    }
  })
  $('img[data-src]').each((_, el) => {
    const src = $(el).attr('data-src') ?? ''
    if (src.startsWith('http') && !src.includes('mtbtrailssa.co.za')) {
      images.push(src)
    }
  })

  return {
    name,
    description,
    distanceKm,
    elevationM,
    estTimeMin,
    difficulty,
    lat,
    lng,
    facilities,
    loops,
    contactEmail,
    contactPhone,
    websiteUrl,
    images: [...new Set(images)].slice(0, 12),
    province,
    region,
    town,
    tags: [...new Set(tags)].slice(0, 20),
  }
}

export async function scrapeMTBTrailsSA(
  limit?: number
): Promise<{ added: number; updated: number; errors: string[] }> {
  const errors: string[] = []
  let added = 0
  let updated = 0

  let routeUrls = await fetchRouteList()
  if (limit) routeUrls = routeUrls.slice(0, limit)

  console.log(`  Found ${routeUrls.length} routes on mtbtrailssa.co.za`)

  for (const url of routeUrls) {
    try {
      const detail = await fetchRouteDetail(url)
      if (!detail.name) continue

      const slug = slugify(detail.name)
      const dup = await checkDuplicate({ slug, lat: detail.lat, lng: detail.lng, discipline: 'mtb' })

      if (dup.exists && dup.id) {
        await db.execute(sql`
          UPDATE routes SET
            last_scraped_at = NOW(),
            updated_at = NOW()
          WHERE id = ${dup.id}
        `)
        updated++
        continue
      }

      const [inserted] = await db.insert(routes).values({
        slug,
        name: detail.name,
        description: detail.description || null,
        discipline: 'mtb',
        difficulty: detail.difficulty,
        surface: 'singletrack',
        distanceKm: detail.distanceKm?.toString() ?? null,
        elevationM: detail.elevationM,
        estTimeMin: detail.estTimeMin,
        province: detail.province,
        region: detail.region,
        town: detail.town,
        lat: detail.lat?.toString() ?? null,
        lng: detail.lng?.toString() ?? null,
        facilities: detail.facilities,
        tags: detail.tags,
        websiteUrl: detail.websiteUrl,
        contactEmail: detail.contactEmail,
        contactPhone: detail.contactPhone,
        sourceName: 'mtbtrailssa',
        sourceUrl: url,
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

      if (inserted && detail.loops.length > 0) {
        await db.insert(routeLoops).values(
          detail.loops.map((loop, i) => ({
            routeId: inserted.id,
            name: loop.name,
            distanceKm: loop.distanceKm?.toString() ?? null,
            difficulty: loop.difficulty,
            displayOrder: i,
          }))
        )
      }

      added++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`${url}: ${msg}`)
    }
  }

  return { added, updated, errors }
}
