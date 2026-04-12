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

interface ApiRoute {
  name?: string
  title?: string
  imageUrl?: string
  image_url?: string
  thumbnail?: string
  [key: string]: unknown
}

interface ApiResponse {
  data?: ApiRoute[]
  routes?: ApiRoute[]
  results?: ApiRoute[]
  [key: string]: unknown
}

function escape(s: string): string {
  return s.replace(/'/g, "''")
}

async function fetchApiPage(page: number): Promise<ApiRoute[]> {
  const url = `https://mtbtrailssa.co.za/api/routes?rows=100&page=${page}`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'CrankMartBot/1.0 (+https://crankmart.com)' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} on page ${page}`)
  const data: ApiResponse | ApiRoute[] = await res.json()
  if (Array.isArray(data)) return data
  return (data as ApiResponse).data ?? (data as ApiResponse).routes ?? (data as ApiResponse).results ?? []
}

async function main() {
  // Dynamic imports run AFTER loadEnv() has set process.env.DATABASE_URL
  const { db } = await import('../index')
  const { sql } = await import('drizzle-orm')

  console.log('🖼️  MTBtrailsSA image import starting...')

  let page = 1
  let totalImagesInserted = 0
  let totalRoutesUpdated = 0
  let totalApiRoutes = 0
  let totalMatched = 0

  while (true) {
    let apiRoutes: ApiRoute[]
    try {
      apiRoutes = await fetchApiPage(page)
    } catch (err) {
      console.error(`  Error fetching page ${page}:`, (err as Error).message)
      break
    }

    if (apiRoutes.length === 0) break
    totalApiRoutes += apiRoutes.length
    console.log(`  Page ${page}: ${apiRoutes.length} routes`)

    for (const apiRoute of apiRoutes) {
      const name = ((apiRoute.name ?? apiRoute.title ?? '') as string).trim()
      const imageUrl = ((apiRoute.imageUrl ?? apiRoute.image_url ?? apiRoute.thumbnail ?? '') as string).trim()

      if (!imageUrl || !name) continue

      // Look up route in DB by exact name first
      let routeId: string | null = null

      const exactResult = await db.execute(sql.raw(`
        SELECT id FROM routes WHERE name ILIKE '${escape(name)}' LIMIT 1
      `))
      const exactRows = (exactResult.rows ?? exactResult) as any[]
      if (exactRows.length > 0) {
        routeId = exactRows[0].id as string
      } else {
        // Fuzzy fallback: match on significant words
        const words = name.split(/\s+/).filter(w => w.length > 3).slice(0, 4)
        if (words.length > 0) {
          const pattern = escape(`%${words.join('%')}%`)
          const fuzzyResult = await db.execute(sql.raw(`
            SELECT id FROM routes WHERE name ILIKE '${pattern}' LIMIT 1
          `))
          const fuzzyRows = (fuzzyResult.rows ?? fuzzyResult) as any[]
          if (fuzzyRows.length > 0) routeId = fuzzyRows[0].id as string
        }
      }

      if (!routeId) continue
      totalMatched++

      // Skip if image already exists for this route
      const existing = await db.execute(sql.raw(`
        SELECT id FROM route_images
        WHERE route_id = '${escape(routeId)}' AND url = '${escape(imageUrl)}'
        LIMIT 1
      `))
      const existingRows = (existing.rows ?? existing) as any[]
      if (existingRows.length > 0) continue

      await db.execute(sql.raw(`
        INSERT INTO route_images (id, route_id, url, is_primary, display_order, source, alt_text)
        VALUES (gen_random_uuid(), '${escape(routeId)}', '${escape(imageUrl)}', true, 0, 'mtbtrailssa', '${escape(name)}')
        ON CONFLICT DO NOTHING
      `))

      await db.execute(sql.raw(`
        UPDATE routes SET
          hero_image_url    = '${escape(imageUrl)}',
          primary_image_url = '${escape(imageUrl)}',
          image_count       = 1,
          updated_at        = NOW()
        WHERE id = '${escape(routeId)}'
          AND (hero_image_url IS NULL OR hero_image_url = '')
      `))

      totalImagesInserted++
      totalRoutesUpdated++
    }

    if (apiRoutes.length < 100) break
    page++
    await new Promise(r => setTimeout(r, 300))
  }

  console.log('\n─── Results ───────────────────────────────')
  console.log(`  API routes fetched : ${totalApiRoutes}`)
  console.log(`  Matched in DB      : ${totalMatched}`)
  console.log(`  Images inserted    : ${totalImagesInserted}`)
  console.log(`  Routes updated     : ${totalRoutesUpdated}`)
  console.log('────────────────────────────────────────────')

  process.exit(0)
}

main().catch(e => {
  console.error('Fatal error:', e)
  process.exit(1)
})
