/**
 * Seed missing loops for original Free State routes that have 0 loops
 * Run: DATABASE_URL="..." npx tsx src/db/seed-freestate-missing-loops.ts
 */
import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

const envFile = readFileSync('.env.local', 'utf-8')
for (const line of envFile.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && v.length) process.env[k.trim()] = v.join('=').trim()
}

const sql = neon(process.env.DATABASE_URL!)

const loopData: Record<string, Array<{
  name: string; distance_km: number
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  category: string; subtitle: string; description: string; display_order: number
}>> = {

  // ── Bloemfontein Rose Garden Loop (both slugs share same loops) ──────
  'bloemfontein-rose-garden-loop': [
    { name: 'Rose Garden Mini Loop', distance_km: 8, difficulty: 'beginner', category: 'green', subtitle: 'Park circuit only', description: 'A gentle 8 km loop through the President Brand Street Rose Garden and Loch Logan waterfront. Flat, paved and family-friendly.', display_order: 1 },
    { name: 'Rose Garden City Loop', distance_km: 18, difficulty: 'beginner', category: 'blue', subtitle: 'CBD + botanical gardens', description: 'The 18 km loop linking the Rose Garden, National Museum, Tweespruit and Botanical Garden on quiet city roads. Perfect weekend leisure ride.', display_order: 2 },
    { name: 'Rose Garden Extended Loop', distance_km: 30, difficulty: 'intermediate', category: 'red', subtitle: 'Full southern suburbs', description: 'Extended 30 km loop adding Universitas and Fichardtpark suburbs. Rolling Bloem residential roads with good scenery.', display_order: 3 },
  ],
  'bloemfontein-rose-garden': [
    { name: 'Rose Garden Mini Loop', distance_km: 8, difficulty: 'beginner', category: 'green', subtitle: 'Park circuit only', description: 'A gentle 8 km loop through the President Brand Street Rose Garden and Loch Logan waterfront. Flat, paved and family-friendly.', display_order: 1 },
    { name: 'Rose Garden City Loop', distance_km: 18, difficulty: 'beginner', category: 'blue', subtitle: 'CBD + botanical gardens', description: 'The 18 km loop linking the Rose Garden, National Museum, Tweespruit and Botanical Garden on quiet city roads. Perfect weekend leisure ride.', display_order: 2 },
  ],

  // ── Maselspoort Resort MTB ────────────────────────────────────────────
  'maselspoort-resort-mtb-trails': [
    { name: 'Maselspoort Green Loop', distance_km: 8, difficulty: 'beginner', category: 'green', subtitle: 'Riverside flat trail', description: 'A beginner-friendly 8 km loop along the Modder River bank on flat trails. Perfect for children and first-time MTB riders at the resort.', display_order: 1 },
    { name: 'Maselspoort Blue Loop', distance_km: 18, difficulty: 'intermediate', category: 'blue', subtitle: 'Koppies + riverbank circuit', description: 'The 18 km loop adding the rocky koppie sections to the riverside trail. Moderate climbs with great dam views.', display_order: 2 },
    { name: 'Maselspoort Red Loop', distance_km: 26, difficulty: 'advanced', category: 'red', subtitle: 'Full reserve circuit', description: 'The full 26 km loop through all trail zones including the most technical koppie singletrack. Used for club race events at the resort.', display_order: 3 },
  ],

  // ── Roodewal Free State Gravel ────────────────────────────────────────
  'roodewal-free-state-gravel': [
    { name: 'Roodewal Short Gravel', distance_km: 28, difficulty: 'beginner', category: 'green', subtitle: 'Local farm road circuit', description: 'A 28 km loop on the accessible gravel roads around the Roodewal agricultural area near Bothaville. Flat, quiet and good for gravel newcomers.', display_order: 1 },
    { name: 'Roodewal Grain Plains Loop', distance_km: 55, difficulty: 'intermediate', category: 'blue', subtitle: 'Full maize corridor', description: 'The 55 km full loop through the Bothaville maize triangle — one of South Africa\'s most productive agricultural zones. Big sky, grain silos and total quiet.', display_order: 2 },
    { name: 'Roodewal Epic Gravel', distance_km: 85, difficulty: 'advanced', category: 'red', subtitle: 'Extended Vaal triangle', description: 'Extended 85 km loop venturing south toward the Vaal River approaches on remote farm tracks. A true Free State gravel epic.', display_order: 3 },
  ],

  // ── Clarens Road Loop ─────────────────────────────────────────────────
  'clarens-road': [
    { name: 'Clarens Village Loop', distance_km: 15, difficulty: 'beginner', category: 'green', subtitle: 'Village + golden cliffs', description: 'A short 15 km loop from Clarens through the sandstone cliffs on the R711. Flat to gently rolling with iconic golden cliff scenery.', display_order: 1 },
    { name: 'Clarens Standard Loop', distance_km: 38, difficulty: 'intermediate', category: 'blue', subtitle: 'Rooiberge foothills circuit', description: 'The standard 38 km Clarens road loop through the Rooiberge foothills. Rolling highland terrain with the golden cliffs as a constant backdrop.', display_order: 2 },
    { name: 'Clarens Challenge Loop', distance_km: 65, difficulty: 'advanced', category: 'red', subtitle: 'Extended highland circuit', description: 'Extended 65 km loop adding the Little Caledon valley and the R26 highland stretch. A serious effort in one of SA\'s most beautiful cycling environments.', display_order: 3 },
  ],

  // ── Clarens Art Village Road Ride (both slugs) ───────────────────────
  'clarens-art-village-road-ride': [
    { name: 'Art Village Short Loop', distance_km: 20, difficulty: 'beginner', category: 'green', subtitle: 'Village circuit + gallery stops', description: 'A relaxed 20 km loop around the Clarens art village and immediate countryside. Designed for cycling tourists exploring galleries and craft shops.', display_order: 1 },
    { name: 'Art Village Valley Loop', distance_km: 45, difficulty: 'intermediate', category: 'blue', subtitle: 'Golden Gate approach', description: 'The 45 km loop heading toward the Golden Gate National Park entrance and returning via the R712 valley floor. Stunning sandstone scenery.', display_order: 2 },
    { name: 'Art Village Epic Loop', distance_km: 75, difficulty: 'advanced', category: 'red', subtitle: 'Rooiberge + Lesotho approaches', description: 'A serious 75 km loop venturing toward the Lesotho border escarpment. The best Clarens cycling scenery for strong riders.', display_order: 3 },
  ],
  'clarens-art-village-road': [
    { name: 'Art Village Short Loop', distance_km: 20, difficulty: 'beginner', category: 'green', subtitle: 'Village circuit + gallery stops', description: 'A relaxed 20 km loop around the Clarens art village and immediate countryside. Designed for cycling tourists exploring galleries and craft shops.', display_order: 1 },
    { name: 'Art Village Valley Loop', distance_km: 45, difficulty: 'intermediate', category: 'blue', subtitle: 'Golden Gate approach', description: 'The 45 km loop heading toward the Golden Gate National Park entrance and returning via the R712 valley floor. Stunning sandstone scenery.', display_order: 2 },
  ],

  // ── Golden Gate Highlands Circuit ────────────────────────────────────
  'golden-gate-highlands-circuit': [
    { name: 'Golden Gate Short Loop', distance_km: 30, difficulty: 'beginner', category: 'green', subtitle: 'Glen Reenen valley loop', description: 'A gentle 30 km loop through the Golden Gate valley floor near Glen Reenen rest camp. Eland and blesbok sightings on the open plateau meadows.', display_order: 1 },
    { name: 'Golden Gate Highlands Loop', distance_km: 65, difficulty: 'intermediate', category: 'blue', subtitle: 'Full park circuit', description: 'The 65 km loop circumnavigating the main Golden Gate valleys and sandstone cliff formations at 1,900–2,100 m elevation. Classic Free State highland cycling.', display_order: 2 },
    { name: 'Golden Gate Epic Circuit', distance_km: 95, difficulty: 'advanced', category: 'red', subtitle: 'Extended Brandwater pass', description: 'Extended 95 km loop adding the Brandwater plateau and Riemland pass for an epic full-day Golden Gate challenge.', display_order: 3 },
  ],

  // ── Ficksburg Cherry Country Ride (both slugs) ───────────────────────
  'ficksburg-cherry-country-ride': [
    { name: 'Cherry Blossom Short Loop', distance_km: 22, difficulty: 'beginner', category: 'green', subtitle: 'Orchard circuit', description: 'A flat 22 km loop through the cherry orchards closest to Ficksburg town. Best ridden during the November Cherry Festival when blossoms are out.', display_order: 1 },
    { name: 'Cherry Country Full Loop', distance_km: 50, difficulty: 'intermediate', category: 'blue', subtitle: 'Full orchard + river valley', description: 'The 50 km full cherry country loop including the Caledon River valley orchards and Senekal approach. Classic Free State fruit farming scenery.', display_order: 2 },
    { name: 'Ficksburg Mountain Loop', distance_km: 78, difficulty: 'advanced', category: 'red', subtitle: 'Cherry farms + Witteberg climbs', description: 'Extended 78 km loop adding the Witteberg foothills for a challenging cherry country circuit with mountain views into Lesotho.', display_order: 3 },
  ],
  'ficksburg-cherry-country': [
    { name: 'Cherry Blossom Short Loop', distance_km: 22, difficulty: 'beginner', category: 'green', subtitle: 'Orchard circuit', description: 'A flat 22 km loop through the cherry orchards closest to Ficksburg town. Best ridden during the November Cherry Festival when blossoms are out.', display_order: 1 },
    { name: 'Cherry Country Full Loop', distance_km: 50, difficulty: 'intermediate', category: 'blue', subtitle: 'Full orchard + river valley', description: 'The 50 km full cherry country loop including the Caledon River valley orchards and Senekal approach. Classic Free State fruit farming scenery.', display_order: 2 },
  ],

  // ── Paul Roux Gravel Loop ─────────────────────────────────────────────
  'paul-roux-gravel': [
    { name: 'Paul Roux Village Loop', distance_km: 25, difficulty: 'beginner', category: 'green', subtitle: 'Local farm roads', description: 'A 25 km loop on the best-surfaced gravel roads immediately around Paul Roux village. Rolling highland terrain with Witteberg mountain views.', display_order: 1 },
    { name: 'Paul Roux Witteberg Loop', distance_km: 55, difficulty: 'intermediate', category: 'blue', subtitle: 'Witteberg foothills circuit', description: 'The full 55 km loop climbing into the Witteberg foothills above Paul Roux. One of the Eastern Free State\'s best-kept gravel secrets.', display_order: 2 },
    { name: 'Paul Roux Highland Epic', distance_km: 85, difficulty: 'advanced', category: 'red', subtitle: 'Extended Lesotho border approaches', description: 'Extended 85 km loop pushing toward the Lesotho border escarpment on remote farm tracks. Extraordinary highland scenery and total solitude.', display_order: 3 },
  ],
}

async function main() {
  console.log(`\n🔁 Adding missing loops for ${Object.keys(loopData).length} Free State routes...\n`)

  let added = 0, skipped = 0, missing = 0

  for (const [slug, loops] of Object.entries(loopData)) {
    const [route] = await sql`SELECT id, name FROM routes WHERE slug = ${slug}`
    if (!route) { console.log(`  ⚠️  Not found: ${slug}`); missing++; continue }

    console.log(`\n  📍 ${route.name}`)
    for (const loop of loops) {
      const exists = await sql`SELECT id FROM route_loops WHERE route_id = ${route.id} AND name = ${loop.name}`
      if (exists.length > 0) { console.log(`     ⏭  ${loop.name}`); skipped++; continue }
      await sql`
        INSERT INTO route_loops (route_id, name, distance_km, difficulty, category, subtitle, description, display_order)
        VALUES (${route.id}, ${loop.name}, ${loop.distance_km}, ${loop.difficulty}::route_difficulty,
                ${loop.category}, ${loop.subtitle}, ${loop.description}, ${loop.display_order})
      `
      console.log(`     ✅ ${loop.name} (${loop.distance_km} km · ${loop.category})`)
      added++
    }
  }

  const [fsLoops]  = await sql`SELECT COUNT(rl.id) AS c FROM route_loops rl JOIN routes r ON r.id=rl.route_id WHERE r.province='Free State'`
  const [noLoops]  = await sql`SELECT COUNT(*) AS c FROM routes r WHERE r.province='Free State' AND NOT EXISTS (SELECT 1 FROM route_loops rl WHERE rl.route_id=r.id)`
  const [allLoops] = await sql`SELECT COUNT(*) AS c FROM route_loops`

  console.log('\n──────────────────────────────────────────────────')
  console.log(`✅ ${added} loops added | ${skipped} skipped | ${missing} routes not found`)
  console.log(`📊 Free State loops total:  ${fsLoops.c}`)
  console.log(`📊 FS routes still no loops: ${noLoops.c}`)
  console.log(`📊 All route_loops total:   ${allLoops.c}`)
}

main().catch(console.error)
