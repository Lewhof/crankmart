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

import { neon } from '@neondatabase/serverless'

const CATEGORY_LABELS: Record<string, string> = {
  green: 'Green Circle',
  blue:  'Blue Square',
  red:   'Red Diamond',
  black: 'Black Diamond',
}

const DIFFICULTY_MAP: Record<string, string> = {
  easy:       'beginner',
  moderate:   'intermediate',
  difficult:  'advanced',
  expert:     'expert',
}

interface RouteVariant {
  name:        string
  category:    string
  distance:    number | string | null
  difficulty:  string
  description: string
}

interface ApiRoute {
  name:          string
  routeVariants: RouteVariant[]
  [key: string]: unknown
}

interface ApiResponse {
  data: ApiRoute[]
  [key: string]: unknown
}

async function main() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error('DATABASE_URL not set')

  const sql = neon(dbUrl)

  // Add category and subtitle columns if not present
  await sql`ALTER TABLE route_loops ADD COLUMN IF NOT EXISTS category VARCHAR(20) DEFAULT 'green'`
  await sql`ALTER TABLE route_loops ADD COLUMN IF NOT EXISTS subtitle VARCHAR(100)`
  console.log('Columns ensured.')

  // Fetch MTBtrailsSA API
  console.log('Fetching MTBtrailsSA API...')
  const res = await fetch('https://mtbtrailssa.co.za/api/routes?rows=200&page=1')
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const body = await res.json() as ApiResponse

  const apiRoutes: ApiRoute[] = Array.isArray(body) ? body : (body.data ?? [])
  console.log(`Fetched ${apiRoutes.length} routes from API.`)

  let routesMatched = 0
  let loopsInserted = 0

  for (const apiRoute of apiRoutes) {
    if (!apiRoute.routeVariants?.length) continue

    // Find matching route in DB
    const rows = await sql`
      SELECT id, est_time_min, distance_km FROM routes
      WHERE name = ${apiRoute.name} OR name ILIKE ${apiRoute.name}
      LIMIT 1
    `
    if (!rows.length) continue
    routesMatched++

    const dbRoute = rows[0] as { id: string; est_time_min: number | null; distance_km: string | null }

    for (let i = 0; i < apiRoute.routeVariants.length; i++) {
      const variant = apiRoute.routeVariants[i]
      const difficulty = DIFFICULTY_MAP[variant.difficulty?.toLowerCase()] ?? 'intermediate'
      const category   = variant.category?.toLowerCase() ?? 'green'
      const subtitle   = CATEGORY_LABELS[category] ?? 'Green Circle'
      const distanceKm = variant.distance ? parseFloat(String(variant.distance)) : null

      const description = variant.description
        ? `${variant.description}\n\nCategory: ${category} | ${subtitle}`
        : `Category: ${category} | ${subtitle}`

      await sql`
        INSERT INTO route_loops (id, route_id, name, distance_km, difficulty, description, display_order, category, subtitle)
        VALUES (
          gen_random_uuid(),
          ${dbRoute.id},
          ${variant.name},
          ${distanceKm},
          ${difficulty as 'beginner' | 'intermediate' | 'advanced' | 'expert'},
          ${description},
          ${i},
          ${category},
          ${subtitle}
        )
        ON CONFLICT DO NOTHING
      `
      loopsInserted++
    }

    // Update est_time_min if not set and distance is known
    if (!dbRoute.est_time_min && dbRoute.distance_km) {
      const distNum = parseFloat(dbRoute.distance_km)
      if (!isNaN(distNum) && distNum > 0) {
        const estTime = Math.round(distNum * 15)
        await sql`UPDATE routes SET est_time_min = ${estTime} WHERE id = ${dbRoute.id}`
      }
    }
  }

  console.log(`\nDone.`)
  console.log(`  Routes matched: ${routesMatched}`)
  console.log(`  Loops inserted: ${loopsInserted}`)
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
