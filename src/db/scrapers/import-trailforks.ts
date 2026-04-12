import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local synchronously BEFORE any db module is required
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env.local')
    const envContent = readFileSync(envPath, 'utf8')
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx < 0) continue
      const key = trimmed.slice(0, eqIdx).trim()
      let val = trimmed.slice(eqIdx + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (!process.env[key]) process.env[key] = val
    }
  } catch {
    // .env.local may not exist
  }
}

loadEnv()

interface TfPhoto {
  image_1024?: string
  image_640?: string
  image_320?: string
  [key: string]: unknown
}

interface TfRoute {
  rid?: number
  title?: string
  lat?: number | string
  lon?: number | string
  alias?: string
  photos?: TfPhoto[]
  [key: string]: unknown
}

interface TfResponse {
  data?: TfRoute[]
  [key: string]: unknown
}

const TF_BASE = 'https://www.trailforks.com/api/1/routes'
const REGION_ID = 72 // South Africa

function escape(s: string): string {
  return s.replace(/'/g, "''")
}

async function checkApiAvailable(): Promise<boolean> {
  try {
    const url = `${TF_BASE}?filter=region_id:${REGION_ID}&rows=20&page=1&fields=rid,title,difficulty,distance,elevation_gain,lat,lon,alias,photos`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'CrankMartBot/1.0 (+https://crankmart.com)' },
    })
    if (!res.ok) return false
    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) return false
    const data: TfResponse = await res.json()
    return Array.isArray(data?.data)
  } catch {
    return false
  }
}

async function fetchTfPage(page: number): Promise<TfRoute[]> {
  const url = `${TF_BASE}?filter=region_id:${REGION_ID}&rows=100&page=${page}&fields=rid,title,lat,lon,alias,photos`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'CrankMartBot/1.0 (+https://crankmart.com)' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} on page ${page}`)
  const data: TfResponse = await res.json()
  return data?.data ?? []
}

async function main() {
  // Dynamic imports run AFTER loadEnv() has set process.env.DATABASE_URL
  const { db } = await import('../index')
  const { sql } = await import('drizzle-orm')

  console.log('🔍 Checking Trailforks API availability...')
  const available = await checkApiAvailable()
  if (!available) {
    console.log('  Trailforks API not available (403 or non-JSON). Skipping.')
    process.exit(0)
  }
  console.log('  Trailforks API is available. Starting import...')

  let page = 1
  const maxPages = 15
  let totalImagesInserted = 0
  let totalRoutesUpdated = 0

  while (page <= maxPages) {
    let tfRoutes: TfRoute[]
    try {
      tfRoutes = await fetchTfPage(page)
    } catch (err) {
      console.error(`  Error fetching page ${page}:`, (err as Error).message)
      break
    }

    if (tfRoutes.length === 0) break
    console.log(`  Page ${page}: ${tfRoutes.length} routes`)

    for (const tfRoute of tfRoutes) {
      const photos = tfRoute.photos ?? []
      if (photos.length === 0) continue

      const name = (tfRoute.title ?? '') as string
      const lat = tfRoute.lat ? parseFloat(String(tfRoute.lat)) : null
      const lng = tfRoute.lon ? parseFloat(String(tfRoute.lon)) : null
      const alias = (tfRoute.alias ?? '') as string

      let routeId: string | null = null

      // Try matching by slug/alias first
      if (alias) {
        const r = await db.execute(sql.raw(`
          SELECT id FROM routes WHERE slug ILIKE '${escape(alias)}' LIMIT 1
        `))
        const rows = (r.rows ?? r) as any[]
        if (rows.length > 0) routeId = rows[0].id as string
      }

      // Fall back to GPS coordinates (~2 km radius)
      if (!routeId && lat && lng) {
        const r = await db.execute(sql.raw(`
          SELECT id FROM routes
          WHERE ABS(lat::float - ${lat}) < 0.018
            AND ABS(lng::float - ${lng}) < 0.018
          ORDER BY (ABS(lat::float - ${lat}) + ABS(lng::float - ${lng})) ASC
          LIMIT 1
        `))
        const rows = (r.rows ?? r) as any[]
        if (rows.length > 0) routeId = rows[0].id as string
      }

      if (!routeId) continue

      // Count existing images
      const countResult = await db.execute(sql.raw(`
        SELECT COUNT(*) as cnt FROM route_images WHERE route_id = '${escape(routeId)}'
      `))
      const countRows = (countResult.rows ?? countResult) as any[]
      const displayOffset = parseInt(countRows[0]?.cnt ?? '0', 10)
      const isPrimaryAlready = displayOffset > 0

      let inserted = 0
      for (let i = 0; i < Math.min(photos.length, 5); i++) {
        const photo = photos[i]
        const url = photo.image_1024 ?? photo.image_640 ?? photo.image_320
        if (!url) continue

        await db.execute(sql.raw(`
          INSERT INTO route_images (id, route_id, url, thumb_url, medium_url, is_primary, display_order, source, alt_text)
          VALUES (
            gen_random_uuid(),
            '${escape(routeId)}',
            '${escape(url)}',
            ${photo.image_320 ? `'${escape(photo.image_320)}'` : 'NULL'},
            ${photo.image_640 ? `'${escape(photo.image_640)}'` : 'NULL'},
            ${!isPrimaryAlready && i === 0 ? 'true' : 'false'},
            ${displayOffset + i},
            'trailforks',
            '${escape(name)}'
          )
          ON CONFLICT DO NOTHING
        `))
        inserted++
      }

      if (inserted > 0) {
        const firstUrl = photos[0]?.image_1024 ?? photos[0]?.image_640 ?? photos[0]?.image_320
        if (!isPrimaryAlready && firstUrl) {
          await db.execute(sql.raw(`
            UPDATE routes SET
              hero_image_url    = '${escape(firstUrl)}',
              primary_image_url = '${escape(firstUrl)}',
              image_count       = image_count + ${inserted},
              updated_at        = NOW()
            WHERE id = '${escape(routeId)}'
              AND (hero_image_url IS NULL OR hero_image_url = '')
          `))
        } else {
          await db.execute(sql.raw(`
            UPDATE routes SET image_count = image_count + ${inserted}, updated_at = NOW()
            WHERE id = '${escape(routeId)}'
          `))
        }
        totalImagesInserted += inserted
        totalRoutesUpdated++
      }
    }

    if (tfRoutes.length < 100) break
    page++
    await new Promise(r => setTimeout(r, 500))
  }

  console.log('\n─── Trailforks Results ─────────────────────')
  console.log(`  Images inserted  : ${totalImagesInserted}`)
  console.log(`  Routes updated   : ${totalRoutesUpdated}`)
  console.log('─────────────────────────────────────────────')

  process.exit(0)
}

main().catch(e => {
  console.error('Fatal error:', e)
  process.exit(1)
})
