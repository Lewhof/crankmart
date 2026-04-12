/**
 * Phase 1: Clean duplicate-name routes
 * Strategy: keep the longer/more-descriptive slug, delete the shorter one.
 * First transfers any loops from the "to-delete" route to the "to-keep" route.
 * Run: DATABASE_URL="..." npx tsx src/db/cleanup-duplicates.ts
 */
import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
const envFile = readFileSync('.env.local', 'utf-8')
for (const line of envFile.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && v.length) process.env[k.trim()] = v.join('=').trim()
}
const sql = neon(process.env.DATABASE_URL!)

// Each pair: [keep_slug, delete_slug]
// Rule: keep the more descriptive/newer slug; delete the shorter/older one.
const pairs: [string, string][] = [
  ['magaliesberg-valley-road-ride',          'magaliesberg-valley-road'],
  ['hartebeespoort-dam-rim-ride',            'hartebeespoort-dam-rim'],
  ['long-tom-pass-road-ride',                'long-tom-pass-road'],
  ['ficksburg-cherry-country-ride',          'ficksburg-cherry-country'],
  ['tsitsikamma-coastal-trail-ride',         'tsitsikamma-coastal-trail'],
  ['valley-of-a-thousand-hills-road-ride',   'valley-of-a-thousand-hills-road'],
  ['blyde-river-canyon-rim-ride',            'blyde-river-canyon-rim'],
  ['blouberg-mountain-gravel-loop',          'blouberg-mountain-gravel'],
  ['robertson-wine-valley-ride',             'robertson-wine-valley'],
  ['swartberg-pass-gravel-epic',             'swartberg-pass-gravel'],
  ['elgin-valley-orchard-loop',              'elgin-valley-orchard'],
  ['north-coast-beach-road-ride',            'north-coast-beach-road'],
  ['bloemfontein-rose-garden-loop',          'bloemfontein-rose-garden'],
  ['tulbagh-valley-road-ride',               'tulbagh-valley-road'],
  ['port-elizabeth-beach-loop',              'port-elizabeth-beach'],
  ['magoebaskloof-mountain-pass',            'magoebaskloof-mountain'],
  ['clarens-art-village-road-ride',          'clarens-art-village-road'],
  ['augrabies-falls-desert-ride',            'augrabies-falls-desert'],
  ['giants-castle-game-reserve-ride',        'giants-castle-game-reserve'],
  ['tzaneen-avocado-country-road-ride',      'tzaneen-avocado-country-road'],
  ['vryburg-kalahari-gravel-epic',           'vryburg-kalahari-gravel'],
  ['cradle-of-humankind-gravel-ride',        'cradle-of-humankind-gravel'],
  // Montagu — check which is better first (both same length, one is duplicate)
  ['montagu-mountain-gravel-loop',           'montagu-mountain-gravel'],
]

async function main() {
  console.log(`\n🧹 Phase 1: Cleaning ${pairs.length} duplicate-name route pairs...\n`)

  let deleted = 0, loopsMoved = 0, notFound = 0

  for (const [keepSlug, deleteSlug] of pairs) {
    const [keepRoute]   = await sql`SELECT id, name FROM routes WHERE slug = ${keepSlug}`
    const [deleteRoute] = await sql`SELECT id, name FROM routes WHERE slug = ${deleteSlug}`

    if (!keepRoute) {
      console.log(`  ⚠️  KEEP not found: ${keepSlug}`)
      notFound++
      continue
    }
    if (!deleteRoute) {
      console.log(`  ⏭  DELETE not found (already gone): ${deleteSlug}`)
      continue
    }

    // Check loops on the "to-delete" route
    const deleteLoops = await sql`SELECT id, name FROM route_loops WHERE route_id = ${deleteRoute.id}`
    if (deleteLoops.length > 0) {
      // Move loops to the kept route (only if keep doesn't already have a loop with that name)
      for (const loop of deleteLoops) {
        const existsOnKeep = await sql`SELECT id FROM route_loops WHERE route_id = ${keepRoute.id} AND name = ${loop.name}`
        if (existsOnKeep.length === 0) {
          await sql`UPDATE route_loops SET route_id = ${keepRoute.id} WHERE id = ${loop.id}`
          loopsMoved++
        }
      }
    }

    // Delete the duplicate route (cascade will remove any remaining loops)
    await sql`DELETE FROM routes WHERE id = ${deleteRoute.id}`
    console.log(`  🗑️  Deleted: "${deleteSlug}"  →  kept: "${keepSlug}"${deleteLoops.length > 0 ? ` (${deleteLoops.length} loops moved)` : ''}`)
    deleted++
  }

  // Verify
  const dupCheck = await sql`SELECT name, COUNT(*) AS c FROM routes GROUP BY name HAVING COUNT(*) > 1`
  const [total]  = await sql`SELECT COUNT(*) AS c FROM routes`
  const [loops]  = await sql`SELECT COUNT(*) AS c FROM route_loops`

  console.log(`\n──────────────────────────────────────────────────`)
  console.log(`✅ ${deleted} duplicates deleted | ${loopsMoved} loops moved | ${notFound} not found`)
  console.log(`📊 Routes remaining: ${total.c}`)
  console.log(`📊 Loops remaining:  ${loops.c}`)
  if (dupCheck.length > 0) {
    console.log(`\n⚠️  Still duplicated names:`)
    dupCheck.forEach((r: any) => console.log(`   "${r.name}" x${r.c}`))
  } else {
    console.log(`✅ No duplicate names remaining`)
  }
}
main().catch(console.error)
