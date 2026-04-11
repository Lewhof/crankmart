import { db } from '../../index'
import { routes, routeImages } from '../../schema'
import { slugify } from '../lib/slugify'
import { checkDuplicate } from '../lib/dedup'
import { sql } from 'drizzle-orm'

const API_BASE = 'https://www.trailforks.com/api/1'

type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert'

function mapDifficulty(level: number): Difficulty {
  if (level <= 1) return 'beginner'
  if (level === 2) return 'intermediate'
  if (level === 3) return 'advanced'
  return 'expert'
}

interface TFRoute {
  rid: number
  title: string
  difficulty: number
  distance: number
  elevation_gain: number
  lat: number
  lon: number
  region: string
  city: string
  description: string
  photos: Array<{ photo_url: string }>
  alias: string
  status: number
}

async function fetchPage(page: number): Promise<TFRoute[]> {
  const params = new URLSearchParams({
    'filter': 'region_id:72',
    'rows': '100',
    'page': String(page),
    'fields': 'rid,title,difficulty,distance,elevation_gain,lat,lon,region,city,description,photos,alias,status',
  })
  const url = `${API_BASE}/routes?${params}`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'CycleMartBot/1.0 (+https://cyclemart.co.za)' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching Trailforks page ${page}`)
  const data = await res.json()
  return (data?.data ?? []) as TFRoute[]
}

export async function scrapeTrailforks(
  maxPages = 20
): Promise<{ added: number; updated: number; errors: string[] }> {
  const errors: string[] = []
  let added = 0
  let updated = 0

  for (let page = 1; page <= maxPages; page++) {
    let rows: TFRoute[]
    try {
      rows = await fetchPage(page)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`Page ${page}: ${msg}`)
      break
    }

    if (rows.length === 0) break
    console.log(`  Trailforks page ${page}: ${rows.length} routes`)

    for (const row of rows) {
      try {
        const distanceKm = row.distance ? row.distance / 1000 : null
        const lat = row.lat || null
        const lng = row.lon || null
        const difficulty = mapDifficulty(row.difficulty)
        const slug = slugify(row.title)

        const dup = await checkDuplicate({ slug, lat, lng, discipline: 'mtb' })

        if (dup.exists && dup.id) {
          await db.execute(sql`
            UPDATE routes SET last_scraped_at = NOW(), updated_at = NOW()
            WHERE id = ${dup.id}
          `)
          updated++
          continue
        }

        const images = (row.photos ?? []).map(p => p.photo_url).filter(Boolean).slice(0, 12)

        const [inserted] = await db.insert(routes).values({
          slug,
          name: row.title,
          description: row.description || null,
          discipline: 'mtb',
          difficulty,
          surface: 'singletrack',
          distanceKm: distanceKm?.toFixed(1) ?? null,
          elevationM: row.elevation_gain ? Math.round(row.elevation_gain) : null,
          province: null,
          region: row.region || null,
          town: row.city || null,
          lat: lat?.toString() ?? null,
          lng: lng?.toString() ?? null,
          facilities: {},
          tags: [],
          sourceName: 'trailforks',
          sourceUrl: `https://www.trailforks.com/routes/${row.alias}/`,
          lastScrapedAt: new Date(),
          imageCount: images.length,
          primaryImageUrl: images[0] ?? null,
        }).returning({ id: routes.id })

        if (inserted && images.length > 0) {
          await db.insert(routeImages).values(
            images.map((imgUrl, i) => ({
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
        errors.push(`Route ${row.rid}: ${msg}`)
      }
    }

    if (rows.length < 100) break

    // Rate limit between pages
    await new Promise(r => setTimeout(r, 500))
  }

  return { added, updated, errors }
}
