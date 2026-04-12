/**
 * Phase 2: Bulk-seed loops for all 170 routes that still have none.
 * Generates 2–3 smart loops per route based on distance/difficulty/discipline.
 * Run: DATABASE_URL="..." npx tsx src/db/seed-bulk-loops.ts
 */
import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
const envFile = readFileSync('.env.local', 'utf-8')
for (const line of envFile.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && v.length) process.env[k.trim()] = v.join('=').trim()
}
const sql = neon(process.env.DATABASE_URL!)

type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert'

// Generate loops based on route characteristics
function makeLoops(name: string, dist: number, diff: Difficulty, discipline: string): Array<{
  name: string; distance_km: number; difficulty: Difficulty
  category: string; subtitle: string; description: string; display_order: number
}> {
  const short = Math.round(dist * 0.40)
  const med   = Math.round(dist * 0.75)
  const full  = dist

  // Difficulty maps
  const downOne: Record<Difficulty, Difficulty> = { expert: 'advanced', advanced: 'intermediate', intermediate: 'beginner', beginner: 'beginner' }
  const upOne:   Record<Difficulty, Difficulty> = { beginner: 'intermediate', intermediate: 'advanced', advanced: 'expert', expert: 'expert' }
  const catMap:  Record<Difficulty, string>     = { beginner: 'green', intermediate: 'blue', advanced: 'red', expert: 'black' }

  const isMTB   = discipline === 'mtb'
  const isUrban = discipline === 'urban'
  const isRoad  = discipline === 'road'
  const isGrav  = discipline === 'gravel'

  const shortLabel = isMTB ? 'Green Trail' : isUrban ? 'City Mini Loop' : isGrav ? 'Short Gravel' : 'Short Loop'
  const medLabel   = isMTB ? 'Blue Trail'  : isUrban ? 'Full City Loop'  : isGrav ? 'Standard Gravel' : 'Standard Loop'
  const fullLabel  = isMTB ? 'Red Trail'   : isUrban ? 'Extended Loop'   : isGrav ? 'Epic Gravel'  : 'Full Loop'

  const shortDiff: Difficulty = short < 20 ? 'beginner' : downOne[diff]
  const medDiff: Difficulty   = diff
  const fullDiff: Difficulty  = full > 80 ? upOne[diff] : diff

  const loops = []

  // Short
  if (short >= 5 && short < full) {
    loops.push({
      name: `${name} — ${shortLabel}`,
      distance_km: short,
      difficulty: shortDiff,
      category: catMap[shortDiff],
      subtitle: `${short} km${isMTB ? ' easy trail' : isGrav ? ' easy gravel' : ' short circuit'}`,
      description: `A ${short} km ${isMTB ? 'easy trail loop' : isGrav ? 'accessible gravel loop' : 'short road circuit'} covering the most accessible section of the ${name}. Good for beginners and warm-up rides.`,
      display_order: 1,
    })
  }

  // Medium
  if (med >= 10 && med < full) {
    loops.push({
      name: `${name} — ${medLabel}`,
      distance_km: med,
      difficulty: medDiff,
      category: catMap[medDiff],
      subtitle: `${med} km${isMTB ? ' intermediate trail' : isGrav ? ' standard gravel' : ' standard loop'}`,
      description: `The ${med} km standard loop — the most popular option on this route. Covers the key highlights without the full distance commitment.`,
      display_order: 2,
    })
  }

  // Full
  loops.push({
    name: `${name} — ${fullLabel}`,
    distance_km: full,
    difficulty: fullDiff,
    category: catMap[fullDiff],
    subtitle: `${full} km full ${isMTB ? 'trail' : isGrav ? 'gravel' : isUrban ? 'circuit' : 'route'}`,
    description: `The complete ${full} km ${isMTB ? 'trail experience' : isGrav ? 'gravel adventure' : isUrban ? 'urban circuit' : 'road route'} — all highlights included. Best for fit riders wanting the full ${name} experience.`,
    display_order: loops.length + 1,
  })

  return loops
}

async function main() {
  console.log('\n🔁 Phase 2: Bulk-seeding loops for all routes with none...\n')

  // Fetch all routes with no loops
  const routes = await sql`
    SELECT r.id, r.slug, r.name, r.discipline, r.distance_km::float AS distance_km, r.difficulty, r.province
    FROM routes r
    WHERE NOT EXISTS (SELECT 1 FROM route_loops rl WHERE rl.route_id = r.id)
    ORDER BY r.province, r.name
  `

  console.log(`Found ${routes.length} routes needing loops\n`)

  let totalAdded = 0
  let routesDone = 0

  for (const r of routes) {
    const loops = makeLoops(
      r.name,
      parseFloat(r.distance_km),
      r.difficulty as Difficulty,
      r.discipline
    )

    for (const loop of loops) {
      await sql`
        INSERT INTO route_loops (route_id, name, distance_km, difficulty, category, subtitle, description, display_order)
        VALUES (
          ${r.id}, ${loop.name}, ${loop.distance_km},
          ${loop.difficulty}::route_difficulty, ${loop.category},
          ${loop.subtitle}, ${loop.description}, ${loop.display_order}
        )
        ON CONFLICT DO NOTHING
      `
      totalAdded++
    }

    routesDone++
    if (routesDone % 20 === 0) {
      process.stdout.write(`  ✅ ${routesDone}/${routes.length} routes processed (${totalAdded} loops added)\n`)
    }
  }

  // Final audit
  const [noLoops]  = await sql`SELECT COUNT(*) AS c FROM routes r WHERE NOT EXISTS (SELECT 1 FROM route_loops rl WHERE rl.route_id = r.id)`
  const [allLoops] = await sql`SELECT COUNT(*) AS c FROM route_loops`
  const [total]    = await sql`SELECT COUNT(*) AS c FROM routes`

  const byProv = await sql`
    SELECT r.province, COUNT(DISTINCT r.id) AS routes,
      COUNT(rl.id) AS loops,
      SUM(CASE WHEN NOT EXISTS (SELECT 1 FROM route_loops rl2 WHERE rl2.route_id=r.id) THEN 1 ELSE 0 END) AS no_loops
    FROM routes r LEFT JOIN route_loops rl ON rl.route_id=r.id
    GROUP BY r.province ORDER BY routes DESC
  `

  console.log(`\n──────────────────────────────────────────────────`)
  console.log(`✅ ${routesDone} routes processed | ${totalAdded} loops added`)
  console.log(`📊 Total routes:              ${total.c}`)
  console.log(`📊 Total loops:               ${allLoops.c}`)
  console.log(`📊 Routes still without loops: ${noLoops.c}`)
  console.log('\n📍 Province summary:')
  byProv.forEach((r: any) =>
    console.log(`  ${String(r.province || 'NULL').padEnd(22)} routes:${String(r.routes).padStart(4)}  loops:${String(r.loops).padStart(5)}  no-loops:${r.no_loops}`)
  )
}

main().catch(console.error)
