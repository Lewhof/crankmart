/**
 * Seed missing loops for original Northern Cape routes with 0 loops
 */
import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
const envFile = readFileSync('.env.local', 'utf-8')
for (const line of envFile.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && v.length) process.env[k.trim()] = v.join('=').trim()
}
const sql = neon(process.env.DATABASE_URL!)

const loopData: Record<string, Array<{ name: string; distance_km: number; difficulty: 'beginner'|'intermediate'|'advanced'|'expert'; category: string; subtitle: string; description: string; display_order: number }>> = {

  'kimberley-big-hole-diamond-route': [
    { name: 'Big Hole Short Loop', distance_km: 15, difficulty: 'beginner', category: 'green', subtitle: 'Heritage circuit', description: 'A 15 km loop around the Big Hole and Kimberley historic mining district. Flat and accessible.', display_order: 1 },
    { name: 'Diamond Route Full Loop', distance_km: 45, difficulty: 'intermediate', category: 'blue', subtitle: 'Full mining heritage circuit', description: 'The 45 km loop through all four Kimberley diamond mines and the Victorian CBD. Classic Kimberley cycling.', display_order: 2 },
    { name: 'Diamond Route Extended', distance_km: 75, difficulty: 'advanced', category: 'red', subtitle: 'Barkly West extension', description: 'Extended 75 km loop adding the Barkly West alluvial diggings on the Vaal River.', display_order: 3 },
  ],

  'augrabies-falls-desert-ride': [
    { name: 'Desert Ride Short Loop', distance_km: 22, difficulty: 'beginner', category: 'green', subtitle: 'Falls viewpoints + quiver trees', description: 'A 22 km loop through the quiver tree forest to the main Augrabies Falls viewpoints and back.', display_order: 1 },
    { name: 'Desert Ride Full Loop', distance_km: 48, difficulty: 'intermediate', category: 'blue', subtitle: 'Full gorge rim circuit', description: 'The complete 48 km gorge rim loop with gemsbok and klipspringer sightings throughout.', display_order: 2 },
    { name: 'Augrabies Desert Epic', distance_km: 70, difficulty: 'advanced', category: 'red', subtitle: 'Extended remote circuit', description: 'Extended 70 km loop into the remote southern reaches of the park. Black rhino territory — guide strongly recommended.', display_order: 3 },
  ],

  'augrabies-falls-desert': [
    { name: 'Desert Short Loop', distance_km: 22, difficulty: 'beginner', category: 'green', subtitle: 'Falls viewpoints + quiver trees', description: 'A 22 km loop through the quiver tree forest to the main Augrabies Falls viewpoints.', display_order: 1 },
    { name: 'Desert Full Loop', distance_km: 48, difficulty: 'intermediate', category: 'blue', subtitle: 'Full gorge rim circuit', description: 'The complete 48 km gorge rim loop.', display_order: 2 },
  ],

  'namaqualand-flower-route-gravel': [
    { name: 'Flower Route Short', distance_km: 30, difficulty: 'intermediate', category: 'blue', subtitle: 'Skilpad + Hantam foothills', description: 'A 30 km loop through the Skilpad Wildflower Reserve and surrounding granite koppies. Best Aug–Sep.', display_order: 1 },
    { name: 'Flower Route Epic', distance_km: 85, difficulty: 'advanced', category: 'red', subtitle: 'Full Namaqualand flower belt', description: 'The 85 km epic through the complete Namaqualand flower carpet. Extraordinary during flower season.', display_order: 2 },
  ],

  'tankwa-karoo-gravel': [
    { name: 'Tankwa Short Gravel', distance_km: 40, difficulty: 'advanced', category: 'blue', subtitle: 'Ouberg Pass approach', description: 'A 40 km loop through the Tankwa\'s most accessible sections near the Ouberg Pass base. Serious gravel required.', display_order: 1 },
    { name: 'Tankwa Classic Loop', distance_km: 85, difficulty: 'expert', category: 'red', subtitle: 'Race route circuit', description: 'The 85 km classic Tankwa loop. Self-sufficient — no services, extreme heat or cold. Expert only.', display_order: 2 },
    { name: 'Tankwa Full Traverse', distance_km: 120, difficulty: 'expert', category: 'black', subtitle: 'Full park traverse', description: 'The complete 120 km national park traverse. Two days recommended. Water carrying critical.', display_order: 3 },
  ],

  'orania-and-orange-river-gravel': [
    { name: 'Orania Short River Loop', distance_km: 22, difficulty: 'beginner', category: 'green', subtitle: 'Orange River bank circuit', description: 'A 22 km loop along the Orange River banks around Orania. Flat, scenic and historically unique.', display_order: 1 },
    { name: 'Orania Orange River Loop', distance_km: 55, difficulty: 'intermediate', category: 'blue', subtitle: 'Full river valley circuit', description: 'The 55 km loop through the Orania river valley and surrounding pecan and lucerne farms. Distinctive Karoo-Orange River scenery.', display_order: 2 },
  ],

  'sutherland-starfields-gravel': [
    { name: 'Starfields Short Loop', distance_km: 25, difficulty: 'beginner', category: 'green', subtitle: 'Observatory circuit', description: 'A 25 km loop around the SALT telescope plateau with Roggeveld Karoo views.', display_order: 1 },
    { name: 'Sutherland Full Starfields Loop', distance_km: 60, difficulty: 'intermediate', category: 'blue', subtitle: 'Full plateau + Karoo circuit', description: 'The 60 km full Roggeveld plateau loop. Best ridden summer morning — winters hit -20°C.', display_order: 2 },
    { name: 'Sutherland Roggeveld Epic', distance_km: 90, difficulty: 'advanced', category: 'red', subtitle: 'Extended Matjiesfontein approach', description: 'Extended 90 km loop heading toward the Matjiesfontein plateau. Extraordinary high Karoo scenery.', display_order: 3 },
  ],
}

async function main() {
  console.log(`\n🔁 Adding missing loops for ${Object.keys(loopData).length} existing NC routes...\n`)
  let added = 0, skipped = 0

  for (const [slug, loops] of Object.entries(loopData)) {
    const [route] = await sql`SELECT id, name FROM routes WHERE slug = ${slug}`
    if (!route) { console.log(`  ⚠️  Not found: ${slug}`); continue }
    console.log(`\n  📍 ${route.name}`)
    for (const loop of loops) {
      const ex = await sql`SELECT id FROM route_loops WHERE route_id = ${route.id} AND name = ${loop.name}`
      if (ex.length > 0) { skipped++; continue }
      await sql`INSERT INTO route_loops (route_id, name, distance_km, difficulty, category, subtitle, description, display_order)
        VALUES (${route.id}, ${loop.name}, ${loop.distance_km}, ${loop.difficulty}::route_difficulty, ${loop.category}, ${loop.subtitle}, ${loop.description}, ${loop.display_order})`
      console.log(`     ✅ ${loop.name} (${loop.distance_km} km · ${loop.category})`)
      added++
    }
  }

  const [ncLoops]  = await sql`SELECT COUNT(rl.id) AS c FROM route_loops rl JOIN routes r ON r.id=rl.route_id WHERE r.province='Northern Cape'`
  const [noLoops]  = await sql`SELECT COUNT(*) AS c FROM routes r WHERE r.province='Northern Cape' AND NOT EXISTS (SELECT 1 FROM route_loops rl WHERE rl.route_id=r.id)`
  const [allLoops] = await sql`SELECT COUNT(*) AS c FROM route_loops`

  console.log(`\n──────────────────────────────────────────────────`)
  console.log(`✅ ${added} loops added | ${skipped} skipped`)
  console.log(`📊 NC loops total:          ${ncLoops.c}`)
  console.log(`📊 NC routes with no loops: ${noLoops.c}`)
  console.log(`📊 All route_loops total:   ${allLoops.c}`)
}
main().catch(console.error)
