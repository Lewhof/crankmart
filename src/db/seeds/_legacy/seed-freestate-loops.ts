/**
 * Seed route_loops for Free State routes that need circular loop variants
 * Run: DATABASE_URL="..." npx tsx src/db/seed-freestate-loops.ts
 *
 * Adds short/medium/long loop options to routes that were seeded as
 * point-to-point or out-and-back, giving riders circular alternatives.
 */
import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

const envFile = readFileSync('.env.local', 'utf-8')
for (const line of envFile.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && v.length) process.env[k.trim()] = v.join('=').trim()
}

const sql = neon(process.env.DATABASE_URL!)

// Each entry: route slug → array of loop variants
const loopData: Record<string, Array<{
  name: string
  distance_km: number
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  category: string
  subtitle: string
  description: string
  display_order: number
}>> = {

  // ── Naval Hill Road Loop ─────────────────────────────────────────────
  'bloemfontein-naval-hill-road-loop': [
    {
      name: 'Naval Hill Short Loop',
      distance_km: 22,
      difficulty: 'beginner',
      category: 'green',
      subtitle: 'City flat + one Naval Hill climb',
      description: 'Quick 22 km loop from the CBD up Naval Hill via Hamilton Road for city panoramas, then a fast descent through Willows and back to town. Ideal before-work ride.',
      display_order: 1,
    },
    {
      name: 'Naval Hill Standard Loop',
      distance_km: 42,
      difficulty: 'intermediate',
      category: 'blue',
      subtitle: 'Full hill circuit via Universitas',
      description: 'The classic 42 km Naval Hill loop: climb via Hamilton Road, summit lap, descend through Universitas, loop Bayswater and return via Pellissier. The definitive Bloem morning club route.',
      display_order: 2,
    },
    {
      name: 'Naval Hill Extended Loop',
      distance_km: 65,
      difficulty: 'advanced',
      category: 'red',
      subtitle: 'Hill + Soetdoring outskirts',
      description: 'Extended 65 km loop that adds the Soetdoring dam road north-west of the city to the standard Naval Hill circuit. For riders wanting a proper two-hour effort.',
      display_order: 3,
    },
  ],

  // ── Loch Logan Waterfront ────────────────────────────────────────────
  'bloemfontein-loch-logan-waterfront-loop': [
    {
      name: 'Waterfront Mini Loop',
      distance_km: 12,
      difficulty: 'beginner',
      category: 'green',
      subtitle: 'Lake circuit only',
      description: 'A 12 km flat loop circling Loch Logan lake and the Botanical Garden. Perfect for families with children and first-time cyclists.',
      display_order: 1,
    },
    {
      name: 'Waterfront City Loop',
      distance_km: 22,
      difficulty: 'beginner',
      category: 'blue',
      subtitle: 'Full waterfront + CBD greenway',
      description: 'The 22 km loop linking Loch Logan, Mimosa Mall, Voortrekker Park and the CBD cycle path. The standard recreational loop for Bloemfontein residents.',
      display_order: 2,
    },
  ],

  // ── Hillside Training Loop ───────────────────────────────────────────
  'bloemfontein-hillside-training-loop': [
    {
      name: 'Hillside Short Training Loop',
      distance_km: 38,
      difficulty: 'intermediate',
      category: 'blue',
      subtitle: 'Hillside + Brandwag circuit',
      description: 'A 38 km loop keeping to the Hillside and Brandwag suburbs with the N1 service road return. Good for mid-week threshold sessions.',
      display_order: 1,
    },
    {
      name: 'Hillside Full Loop',
      distance_km: 70,
      difficulty: 'intermediate',
      category: 'red',
      subtitle: 'Full Bloemspruit circuit',
      description: 'The complete 70 km club training loop via Langenhoven Park, Bloemspruit airfield and Pellissier. The benchmark weekend ride for Bloem road clubs.',
      display_order: 2,
    },
    {
      name: 'Hillside Century Prep',
      distance_km: 100,
      difficulty: 'advanced',
      category: 'black',
      subtitle: 'Century distance via Maselspoort',
      description: '100 km loop adding the Maselspoort dam road to the full Hillside circuit. Used to prepare for century events and the Rapport Toer.',
      display_order: 3,
    },
  ],

  // ── Botshabelo Road ──────────────────────────────────────────────────
  'bloemfontein-botshabelo-road-ride': [
    {
      name: 'Botshabelo Short Loop',
      distance_km: 35,
      difficulty: 'beginner',
      category: 'green',
      subtitle: 'Modderpoort circuit + return',
      description: 'A 35 km loop that takes the R64 to Modderpoort, circles the historic cave church and returns via the same road. Avoids Botshabelo proper — good for solo riders.',
      display_order: 1,
    },
    {
      name: 'Botshabelo Full Cultural Loop',
      distance_km: 50,
      difficulty: 'beginner',
      category: 'blue',
      subtitle: 'Full township circuit — guided recommended',
      description: 'The full 50 km loop into and through Botshabelo township. Best ridden as a guided social ride. Returns via the R64 past the Botshabelo Historical Village museum.',
      display_order: 2,
    },
  ],

  // ── Thaba Nchu Loop ──────────────────────────────────────────────────
  'bloemfontein-thaba-nchu-road-loop': [
    {
      name: 'Thaba Nchu Short Loop',
      distance_km: 50,
      difficulty: 'beginner',
      category: 'green',
      subtitle: 'Grassland out-and-back',
      description: 'A 50 km out-and-back on the R64 to the Thaba Nchu plateau foothills. Good tar, minimal traffic and open Highveld scenery. Return via the same route.',
      display_order: 1,
    },
    {
      name: 'Thaba Nchu Maria Moroka Loop',
      distance_km: 82,
      difficulty: 'intermediate',
      category: 'blue',
      subtitle: 'Full loop via Maria Moroka NP',
      description: 'The full 82 km loop incorporating the Maria Moroka National Park perimeter road and a lap of the Rustfontein Dam before returning to Bloemfontein. Wildlife sightings throughout.',
      display_order: 2,
    },
  ],

  // ── Soetdoring MTB ───────────────────────────────────────────────────
  'bloemfontein-soetdoring-mtb-park': [
    {
      name: 'Soetdoring Green Loop',
      distance_km: 12,
      difficulty: 'beginner',
      category: 'green',
      subtitle: 'Flat dam-edge trail',
      description: 'A beginner-friendly 12 km loop on the flat dam edge tracks with game sightings. Perfect for families and first-time mountain bikers.',
      display_order: 1,
    },
    {
      name: 'Soetdoring Blue Loop',
      distance_km: 22,
      difficulty: 'intermediate',
      category: 'blue',
      subtitle: 'Koppie circuit + dam views',
      description: 'The 22 km intermediate loop adding the reserve koppies and upper thornveld sections. Moderate climbs with great dam panoramas from the ridge.',
      display_order: 2,
    },
    {
      name: 'Soetdoring Red Loop',
      distance_km: 28,
      difficulty: 'advanced',
      category: 'red',
      subtitle: 'Full reserve perimeter',
      description: 'The full 28 km reserve perimeter loop including the most technical koppie sections and the Modder River tributary crossings. Used for club race events.',
      display_order: 3,
    },
  ],

  // ── Gariep Dam Gravel ────────────────────────────────────────────────
  'gariep-dam-gravel-loop': [
    {
      name: 'Gariep Dam Short Loop',
      distance_km: 32,
      difficulty: 'beginner',
      category: 'green',
      subtitle: 'Dam wall + north shore',
      description: 'A 32 km loop along the dam wall and the accessible north shore gravel roads. Flat to rolling with spectacular dam views. Good for gravel cyclists new to the area.',
      display_order: 1,
    },
    {
      name: 'Gariep Dam Full Loop',
      distance_km: 65,
      difficulty: 'intermediate',
      category: 'blue',
      subtitle: 'Full nature reserve perimeter',
      description: 'The full 65 km loop circumnavigating the Gariep Dam Nature Reserve. Expect wind, game sightings, big water views and classic Karoo-edge scenery throughout.',
      display_order: 2,
    },
    {
      name: 'Gariep Dam Epic Loop',
      distance_km: 95,
      difficulty: 'advanced',
      category: 'red',
      subtitle: 'Extended Norvalspont circuit',
      description: 'Extended 95 km loop adding the Norvalspont road and the southern Karoo crossing. Requires solid fitness and wind-management skills. A bucket-list Free State gravel day.',
      display_order: 3,
    },
  ],

  // ── Philippolis / Toverberg ──────────────────────────────────────────
  'philippolis-toverberg-road-ride': [
    {
      name: 'Philippolis Town Loop',
      distance_km: 25,
      difficulty: 'beginner',
      category: 'green',
      subtitle: 'Historic town circuit',
      description: 'A short 25 km loop around Philippolis town, the Transgariep area and historic mission church. Flat to gently rolling on good tar. Ideal for relaxed touring.',
      display_order: 1,
    },
    {
      name: 'Toverberg Loop',
      distance_km: 78,
      difficulty: 'intermediate',
      category: 'blue',
      subtitle: 'Full Karoo plateau circuit',
      description: 'The full 78 km road loop from Philippolis to the Toverberg plateau and back via a different farm road. Big Karoo skies, merino farms and total solitude.',
      display_order: 2,
    },
  ],

  // ── Bethulie Gravel ──────────────────────────────────────────────────
  'bethulie-gariep-river-gravel': [
    {
      name: 'Bethulie Short Gravel',
      distance_km: 28,
      difficulty: 'beginner',
      category: 'green',
      subtitle: 'River valley loop',
      description: 'A 28 km loop along the Gariep River valley near Bethulie using the best-surfaced farm roads. Scenic and accessible — good for gravel newcomers.',
      display_order: 1,
    },
    {
      name: 'Bethulie Full Gravel Loop',
      distance_km: 55,
      difficulty: 'intermediate',
      category: 'blue',
      subtitle: 'Full valley + Bethulie Bridge',
      description: 'The full 55 km loop crossing the Bethulie Bridge and completing a circuit of the river valley. Anglo-Boer War sites, solitude and dramatic river scenery.',
      display_order: 2,
    },
  ],

  // ── Golden Gate Road Classic ─────────────────────────────────────────
  'golden-gate-highlands-road-classic': [
    {
      name: 'Golden Gate Short Road Loop',
      distance_km: 45,
      difficulty: 'intermediate',
      category: 'blue',
      subtitle: 'Clarens + Park entrance loop',
      description: 'A 45 km loop from Clarens to the Golden Gate park entrance and back via the R712. The signature sandstone cliff scenery without the full highland circuit effort.',
      display_order: 1,
    },
    {
      name: 'Golden Gate Classic Road Loop',
      distance_km: 95,
      difficulty: 'advanced',
      category: 'red',
      subtitle: 'Full park circuit via Glen Reenen',
      description: 'The full 95 km classic road loop through Golden Gate, Glen Reenen rest camp, Brandwater and back to Clarens via the R26. Epic highland cycling in National Park scenery.',
      display_order: 2,
    },
  ],

  // ── Clarens Drakensberg Foothills Gravel ────────────────────────────
  'clarens-drakensberg-foothills-gravel': [
    {
      name: 'Clarens Foothills Short Gravel',
      distance_km: 35,
      difficulty: 'intermediate',
      category: 'blue',
      subtitle: 'Rooiberge farm roads',
      description: 'A 35 km gravel loop from Clarens into the Rooiberge foothills. Beautiful sandstone scenery without the big mountain elevation. Good for a half-day ride.',
      display_order: 1,
    },
    {
      name: 'Clarens Drakensberg Full Gravel',
      distance_km: 72,
      difficulty: 'advanced',
      category: 'red',
      subtitle: 'Lesotho border escarpment loop',
      description: 'The full 72 km loop climbing to the Lesotho border escarpment and back. Basotho cultural encounters, dramatic mountain views and premium Drakensberg gravel.',
      display_order: 2,
    },
  ],

  // ── Ficksburg Caledon Valley ─────────────────────────────────────────
  'ficksburg-caledon-river-valley-road': [
    {
      name: 'Ficksburg Cherry Loop',
      distance_km: 35,
      difficulty: 'beginner',
      category: 'green',
      subtitle: 'Orchard circuit + river',
      description: 'A gentle 35 km loop through the cherry and asparagus orchards around Ficksburg. Flat valley roads with mountain views. The Cherry Festival route in November.',
      display_order: 1,
    },
    {
      name: 'Caledon River Valley Full Loop',
      distance_km: 62,
      difficulty: 'intermediate',
      category: 'blue',
      subtitle: 'Full border valley circuit',
      description: 'The full 62 km loop including the Caledon Poort border viewpoints. Rolling farm roads with the Maluti Mountains of Lesotho visible across the river throughout.',
      display_order: 2,
    },
  ],

  // ── Fouriesburg Rooiberge ────────────────────────────────────────────
  'fouriesburg-rooiberge-gravel-loop': [
    {
      name: 'Fouriesburg Short Gravel',
      distance_km: 30,
      difficulty: 'intermediate',
      category: 'blue',
      subtitle: 'Sandstone koppies circuit',
      description: 'A 30 km loop through the accessible sandstone koppies south of Fouriesburg. Gravel farm roads with Rooiberge scenery. Good for gravel riders new to the area.',
      display_order: 1,
    },
    {
      name: 'Rooiberge Full Gravel Loop',
      distance_km: 68,
      difficulty: 'advanced',
      category: 'red',
      subtitle: 'High escarpment + gorge crossing',
      description: 'The full 68 km loop including the high escarpment farm tracks and Caledon River gorge crossing. Remote, demanding and extraordinarily scenic.',
      display_order: 2,
    },
  ],

  // ── Senekal/Vrede Gravel Plains ──────────────────────────────────────
  'senekal-vrede-gravel-plains': [
    {
      name: 'Senekal Gravel Short Loop',
      distance_km: 35,
      difficulty: 'beginner',
      category: 'green',
      subtitle: 'Local grain farm circuit',
      description: 'A 35 km loop on the best-surfaced gravel roads around Senekal. Rolling wheat and maize fields, quiet farm gates and Highveld sky. Accessible warm-up for the bigger loop.',
      display_order: 1,
    },
    {
      name: 'Senekal to Vrede Epic Gravel',
      distance_km: 80,
      difficulty: 'intermediate',
      category: 'blue',
      subtitle: 'Cross-plains bikepacking route',
      description: 'The full 80 km cross-plains loop from Senekal toward Vrede on farm service roads. Pure Free State Highveld immersion — wind, grain, sky and silence.',
      display_order: 2,
    },
  ],

  // ── Welkom Goldfields ────────────────────────────────────────────────
  'welkom-goldfields-road-loop': [
    {
      name: 'Welkom Inner City Loop',
      distance_km: 20,
      difficulty: 'beginner',
      category: 'green',
      subtitle: 'Roundabout city circuit',
      description: 'A 20 km loop on Welkom\'s famous roundabout-only streets — no traffic lights in the entire city. Great for casual rides and exploring the planned goldfields city grid.',
      display_order: 1,
    },
    {
      name: 'Welkom Koponong Dam Loop',
      distance_km: 40,
      difficulty: 'beginner',
      category: 'blue',
      subtitle: 'City + dam perimeter',
      description: 'The 40 km loop adding the Koponong Dam perimeter road and Virginia\'s goldfields edge. Flat, scenic and historically fascinating.',
      display_order: 2,
    },
  ],

  // ── Heilbron Vaal River Gravel ───────────────────────────────────────
  'heilbron-vaal-river-gravel': [
    {
      name: 'Heilbron Short Gravel',
      distance_km: 28,
      difficulty: 'beginner',
      category: 'green',
      subtitle: 'Local farm road circuit',
      description: 'A 28 km loop on the well-maintained gravel roads north of Heilbron. Rolling wheat farms with Highveld views. Good warm-up for the full Vaal River loop.',
      display_order: 1,
    },
    {
      name: 'Heilbron Vaal River Full Loop',
      distance_km: 58,
      difficulty: 'intermediate',
      category: 'blue',
      subtitle: 'Full descent to Vaal gorge',
      description: 'The full 58 km loop descending from the Highveld plateau to the Vaal River gorge and returning via a different farm road circuit. One of the Free State\'s most rewarding gravel rides.',
      display_order: 2,
    },
  ],
}

async function main() {
  console.log(`\n🔁 Seeding route_loops for ${Object.keys(loopData).length} Free State routes...\n`)

  let added = 0
  let skipped = 0
  let routesMissing = 0

  for (const [slug, loops] of Object.entries(loopData)) {
    // Get route ID
    const [route] = await sql`SELECT id, name FROM routes WHERE slug = ${slug}`
    if (!route) {
      console.log(`  ⚠️  Route not found: ${slug}`)
      routesMissing++
      continue
    }

    console.log(`\n  📍 ${route.name}`)

    for (const loop of loops) {
      // Check if loop already exists
      const exists = await sql`
        SELECT id FROM route_loops
        WHERE route_id = ${route.id} AND name = ${loop.name}
      `
      if (exists.length > 0) {
        console.log(`     ⏭  SKIP: ${loop.name}`)
        skipped++
        continue
      }

      await sql`
        INSERT INTO route_loops (route_id, name, distance_km, difficulty, category, subtitle, description, display_order)
        VALUES (
          ${route.id}, ${loop.name}, ${loop.distance_km},
          ${loop.difficulty}::route_difficulty, ${loop.category},
          ${loop.subtitle}, ${loop.description}, ${loop.display_order}
        )
      `
      console.log(`     ✅ ${loop.name} (${loop.distance_km} km, ${loop.category})`)
      added++
    }
  }

  // Summary
  const [totalLoops] = await sql`SELECT COUNT(*) AS c FROM route_loops`
  const [fsLoops]    = await sql`
    SELECT COUNT(rl.id) AS c FROM route_loops rl
    JOIN routes r ON r.id = rl.route_id
    WHERE r.province = 'Free State'
  `

  console.log('\n──────────────────────────────────────────────────')
  console.log(`✅ Done: ${added} loops added | ${skipped} skipped | ${routesMissing} routes not found`)
  console.log(`📊 Free State route_loops: ${fsLoops.c}`)
  console.log(`📊 Total route_loops in DB: ${totalLoops.c}`)
}

main().catch(console.error)
