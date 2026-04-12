/**
 * Seed Durban / KZN cycling routes
 * Run: DATABASE_URL="..." npx tsx src/db/seed-durban-routes.ts
 *
 * Covers eThekwini metro + surrounding KZN areas.
 * Skips slugs that already exist to prevent duplicates.
 */
import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

// Load .env.local
const envFile = readFileSync('.env.local', 'utf-8')
for (const line of envFile.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && v.length) process.env[k.trim()] = v.join('=').trim()
}

const sql = neon(process.env.DATABASE_URL!)

const routes = [
  // ── GIBA GORGE ────────────────────────────────────────────────────────
  {
    name: 'Giba Gorge MTB Full Loop',
    slug: 'giba-gorge-mtb-full-loop',
    description:
      'The flagship Durban MTB experience. Giba Gorge in Pinetown boasts 45 km of purpose-built trails weaving through indigenous gorge forest, open grassland and technical rocky outcrops. The full loop links the most rewarding singletrack on site, passing the gorge waterfall and finishing back at the lively trailhead hub with restaurant and BMX track. Expect smooth bermed flow trails alongside punchy climbs and fast descents.',
    discipline: 'mtb',
    difficulty: 'intermediate',
    surface: 'singletrack',
    distance_km: 25,
    elevation_m: 480,
    est_time_min: 100,
    province: 'KwaZulu-Natal',
    region: 'eThekwini',
    town: 'Pinetown',
    lat: -29.8192,
    lng: 30.8347,
    tags: ['gorge-forest', 'purpose-built', 'flow-trails', 'waterfall', 'durban-classic'],
    is_featured: true,
  },

  // ── SHONGWENI ─────────────────────────────────────────────────────────
  {
    name: 'Shongweni Falls MTB Challenge',
    slug: 'shongweni-falls-mtb-challenge',
    description:
      'A demanding 30 km loop in the Shongweni Valley west of Durban, managed by EMBA (eThekwini Mountain Bike Association). The route traverses deep valleys, indigenous grassland and dense bush before rewarding riders with views of Shongweni Falls. Sustained technical climbs and fast descents on red-clay singletrack make this one of KZN\'s premier advanced MTB experiences. Entry via Shongweni Resources Reserve.',
    discipline: 'mtb',
    difficulty: 'advanced',
    surface: 'singletrack',
    distance_km: 30,
    elevation_m: 720,
    est_time_min: 135,
    province: 'KwaZulu-Natal',
    region: 'eThekwini',
    town: 'Shongweni',
    lat: -29.8500,
    lng: 30.7167,
    tags: ['EMBA', 'waterfall', 'singletrack', 'red-clay', 'technical', 'valley'],
    is_featured: true,
  },
  {
    name: 'EMBA Shongweni Gravel Spin',
    slug: 'emba-shongweni-gravel-spin',
    description:
      'A more relaxed exploration of the EMBA Shongweni trail network on gravel and jeep tracks. Big sweeping valley views, open grassland spins and gentle farm roads link the outer perimeter of the reserve. A great introduction to Shongweni for gravel cyclists before tackling the full singletrack loop. The wide vertiginous views across the valley towards the Durban skyline are unmatched.',
    discipline: 'gravel',
    difficulty: 'intermediate',
    surface: 'gravel',
    distance_km: 40,
    elevation_m: 560,
    est_time_min: 150,
    province: 'KwaZulu-Natal',
    region: 'eThekwini',
    town: 'Shongweni',
    lat: -29.8600,
    lng: 30.7100,
    tags: ['EMBA', 'valley-views', 'grassland', 'farm-roads', 'accessible'],
    is_featured: false,
  },

  // ── AMASHOVA ──────────────────────────────────────────────────────────
  {
    name: 'Amashova Durban Classic 106 km',
    slug: 'amashova-durban-classic-106',
    description:
      'South Africa\'s premier road cycling event route, the Amashova Durban Classic 106 km takes riders from the Durban CBD along the Indian Ocean coast before turning inland through the Valley of a Thousand Hills and climbing to Pietermaritzburg. The iconic race is held annually in September and draws thousands of participants. The route\'s highlight is the brutal Botha\'s Hill climb and the long rolling descent into the Midlands.',
    discipline: 'road',
    difficulty: 'advanced',
    surface: 'tarmac',
    distance_km: 106,
    elevation_m: 1680,
    est_time_min: 270,
    province: 'KwaZulu-Natal',
    region: 'eThekwini',
    town: 'Durban',
    lat: -29.8587,
    lng: 31.0218,
    tags: ['race-route', 'thousand-hills', 'bothas-hill', 'Pmb', 'event', 'epic'],
    is_featured: true,
  },
  {
    name: 'Amashova 40 km Coastal Route',
    slug: 'amashova-40km-coastal-route',
    description:
      'The shorter Amashova event category stays close to the Durban coastline, making it an accessible introduction to the famous race. The 40 km route rolls along the Bluff and South Beach before looping through Glenwood and back to the finish. Flat coastal sections alternate with short sharp climbs through the southern suburbs — ideal preparation for the full 106 km.',
    discipline: 'road',
    difficulty: 'beginner',
    surface: 'tarmac',
    distance_km: 40,
    elevation_m: 320,
    est_time_min: 90,
    province: 'KwaZulu-Natal',
    region: 'eThekwini',
    town: 'Durban',
    lat: -29.8730,
    lng: 31.0280,
    tags: ['race-route', 'coastal', 'bluff', 'event', 'beginner-friendly'],
    is_featured: false,
  },

  // ── KRANTZKLOOF ───────────────────────────────────────────────────────
  {
    name: 'Krantzkloof Nature Reserve Gravel',
    slug: 'krantzkloof-nature-reserve-gravel',
    description:
      'A beautiful gravel route exploring the rim and interior of the Krantzkloof Nature Reserve near Kloof. The reserve protects a dramatic forested gorge with towering cliffs, indigenous forest and the Nungwane Falls. The route follows fire breaks and gravel management roads around the gorge perimeter before dropping into valley singletrack sections. Outstanding birdlife and monkey sightings are common.',
    discipline: 'gravel',
    difficulty: 'intermediate',
    surface: 'gravel',
    distance_km: 22,
    elevation_m: 380,
    est_time_min: 90,
    province: 'KwaZulu-Natal',
    region: 'eThekwini',
    town: 'Kloof',
    lat: -29.7833,
    lng: 30.8333,
    tags: ['gorge', 'indigenous-forest', 'waterfall', 'birds', 'monkeys', 'scenic'],
    is_featured: false,
  },

  // ── HILLCREST / BOTHA'S HILL ──────────────────────────────────────────
  {
    name: "Hillcrest and Botha's Hill Road Loop",
    slug: 'hillcrest-bothas-hill-road-loop',
    description:
      "A classic Durban road cycling loop that earns its reputation through the notorious Botha's Hill climb — a long, relentless ascent from the Thousand Hills valley to the ridge. The route leaves Hillcrest, descends through the Valley of a Thousand Hills, crosses the uMgeni River and grinds back up via Botha's Hill before returning through Waterfall. A rite of passage for Durban road cyclists.",
    discipline: 'road',
    difficulty: 'advanced',
    surface: 'tarmac',
    distance_km: 75,
    elevation_m: 1350,
    est_time_min: 195,
    province: 'KwaZulu-Natal',
    region: 'eThekwini',
    town: 'Hillcrest',
    lat: -29.7833,
    lng: 30.7667,
    tags: ["bothas-hill", 'thousand-hills', 'classic-climb', 'valley', 'training'],
    is_featured: true,
  },

  // ── WESTVILLE / PINETOWN ──────────────────────────────────────────────
  {
    name: 'Westville Pinetown Morning Loop',
    slug: 'westville-pinetown-morning-loop',
    description:
      'A popular early-morning road loop from Westville linking Pinetown, New Germany and Westville in a rolling suburban circuit. Quiet residential roads give way to busier arterials before looping back through Westville\'s leafy avenues. A staple mid-week training route for Durban road cyclists with a coffee stop at Westville\'s café strip.',
    discipline: 'road',
    difficulty: 'beginner',
    surface: 'tarmac',
    distance_km: 35,
    elevation_m: 240,
    est_time_min: 75,
    province: 'KwaZulu-Natal',
    region: 'eThekwini',
    town: 'Westville',
    lat: -29.8333,
    lng: 30.9333,
    tags: ['training', 'morning-ride', 'suburban', 'coffee-stop', 'group-friendly'],
    is_featured: false,
  },

  // ── SOUTH COAST / AMANZIMTOTI ─────────────────────────────────────────
  {
    name: 'Durban South Coast Gravel',
    slug: 'durban-south-coast-gravel',
    description:
      'A gravel exploration of the sugar-cane country south of Durban, starting from Amanzimtoti. The route heads inland through vast cane fields on farm roads, cuts across the Lovu River valley and returns via the coastal ridge with ocean views. A rare combination of KZN coastal scenery and agricultural gravel riding within 30 minutes of central Durban.',
    discipline: 'gravel',
    difficulty: 'intermediate',
    surface: 'gravel',
    distance_km: 55,
    elevation_m: 520,
    est_time_min: 160,
    province: 'KwaZulu-Natal',
    region: 'eThekwini',
    town: 'Amanzimtoti',
    lat: -30.0500,
    lng: 30.8833,
    tags: ['sugarcane', 'coastal-ridge', 'ocean-views', 'farm-roads', 'kzn-coast'],
    is_featured: false,
  },

  // ── INANDA ────────────────────────────────────────────────────────────
  {
    name: 'Inanda Valley MTB Trails',
    slug: 'inanda-valley-mtb-trails',
    description:
      'Technical MTB riding in the Inanda Valley north-west of Durban. The route crosses the Inanda Dam area and explores rocky singletrack through indigenous bush above the reservoir. Dramatic views over the dam and Durban North are the reward for the punishing ascents. The area is home to the uMngeni Water MTB trails and several club routes used by Durban North cycling clubs.',
    discipline: 'mtb',
    difficulty: 'advanced',
    surface: 'singletrack',
    distance_km: 38,
    elevation_m: 680,
    est_time_min: 150,
    province: 'KwaZulu-Natal',
    region: 'eThekwini',
    town: 'Inanda',
    lat: -29.7500,
    lng: 30.9500,
    tags: ['dam', 'singletrack', 'reservoir-views', 'indigenous-bush', 'technical'],
    is_featured: false,
  },

  // ── THE BLUFF ─────────────────────────────────────────────────────────
  {
    name: 'The Bluff Cliffside Road Ride',
    slug: 'the-bluff-cliffside-road-ride',
    description:
      'A distinctive Durban road route that explores the Bluff peninsula separating the Indian Ocean from the Durban harbour. The Bluff\'s cliff-edge road offers extraordinary views across the harbour entrance, container ships and the Durban skyline. The route loops the peninsula through the quiet residential streets before finishing at Brighton Beach for an ocean swim.',
    discipline: 'road',
    difficulty: 'intermediate',
    surface: 'tarmac',
    distance_km: 42,
    elevation_m: 310,
    est_time_min: 100,
    province: 'KwaZulu-Natal',
    region: 'eThekwini',
    town: 'Bluff',
    lat: -29.9333,
    lng: 30.9833,
    tags: ['harbour-views', 'peninsula', 'ocean', 'container-ships', 'unique-scenery'],
    is_featured: false,
  },

  // ── SPRINGSIDE ────────────────────────────────────────────────────────
  {
    name: 'Springside Nature Reserve MTB',
    slug: 'springside-nature-reserve-mtb',
    description:
      'An accessible MTB outing in the Springside Nature Reserve near Hillcrest. Short, well-marked singletrack trails wind through indigenous mistbelt forest with dense canopy cover — a rare cool escape from Durban\'s summer heat. The trails are beginner-friendly with optional harder lines. A great family and junior MTB destination within easy reach of the Hillcrest suburbs.',
    discipline: 'mtb',
    difficulty: 'beginner',
    surface: 'singletrack',
    distance_km: 14,
    elevation_m: 180,
    est_time_min: 55,
    province: 'KwaZulu-Natal',
    region: 'eThekwini',
    town: 'Hillcrest',
    lat: -29.7917,
    lng: 30.7583,
    tags: ['nature-reserve', 'forest', 'family-friendly', 'beginners', 'juniors', 'cool'],
    is_featured: false,
  },

  // ── MARIANNHILL ───────────────────────────────────────────────────────
  {
    name: 'Mariannhill Monastery MTB Loop',
    slug: 'mariannhill-monastery-mtb-loop',
    description:
      'A hidden gem MTB loop in the Mariannhill area of Pinetown. The route starts near the historic Mariannhill Monastery — a Trappist mission founded in 1882 — and explores the surrounding deep ravines, indigenous forest patches and open grassland on red-clay singletrack. Atmospheric forest riding with the monastery visible on the ridge above makes this a uniquely KZN MTB experience.',
    discipline: 'mtb',
    difficulty: 'intermediate',
    surface: 'singletrack',
    distance_km: 28,
    elevation_m: 510,
    est_time_min: 115,
    province: 'KwaZulu-Natal',
    region: 'eThekwini',
    town: 'Pinetown',
    lat: -29.8083,
    lng: 30.8500,
    tags: ['monastery', 'historic', 'ravines', 'indigenous-forest', 'red-clay', 'hidden-gem'],
    is_featured: false,
  },

  // ── ASSAGAY / EVERTON ─────────────────────────────────────────────────
  {
    name: 'Assagay and Everton Road Loop',
    slug: 'assagay-everton-road-loop',
    description:
      'A challenging road loop through the quiet rural roads between Hillcrest, Assagay and Everton. The route dips into the Valley of a Thousand Hills, crosses the uMbilo River and climbs through macadamia orchards and smallholdings back to the Hillcrest ridge. Light traffic, pastoral views and a genuine rural feel make this a favourite for Durban cyclists escaping the city.',
    discipline: 'road',
    difficulty: 'intermediate',
    surface: 'tarmac',
    distance_km: 68,
    elevation_m: 970,
    est_time_min: 170,
    province: 'KwaZulu-Natal',
    region: 'eThekwini',
    town: 'Hillcrest',
    lat: -29.8000,
    lng: 30.7333,
    tags: ['rural', 'macadamia', 'orchards', 'light-traffic', 'valley-views', 'pastoral'],
    is_featured: false,
  },

  // ── UMLAZI / SOUTH BEACH ──────────────────────────────────────────────
  {
    name: 'uShaka to South Beach Beachfront Loop',
    slug: 'ushaka-south-beach-beachfront-loop',
    description:
      'A flat and fast beachfront spin starting from uShaka Marine World and running along the famous Durban Golden Mile. The route heads south along the promenade, loops through South Beach and returns via the beachfront shared cycling path. Ideal for morning training, tourist exploration or introducing newcomers to Durban cycling. The Indian Ocean backdrop and Durban skyline make this a photogenic urban route.',
    discipline: 'road',
    difficulty: 'beginner',
    surface: 'tarmac',
    distance_km: 18,
    elevation_m: 45,
    est_time_min: 45,
    province: 'KwaZulu-Natal',
    region: 'eThekwini',
    town: 'Durban',
    lat: -29.8726,
    lng: 31.0472,
    tags: ['beachfront', 'golden-mile', 'flat', 'tourist', 'promenade', 'scenic', 'indian-ocean'],
    is_featured: false,
  },

  // ── STAINBANK ────────────────────────────────────────────────────────
  {
    name: 'Stainbank Nature Reserve MTB',
    slug: 'stainbank-nature-reserve-mtb',
    description:
      'A beginner-friendly MTB experience inside the Stainbank Nature Reserve in Queensburgh, just south of Pinetown. The reserve protects a remnant of coastal forest and open grassland with gentle singletrack trails. Rhino, wildebeest and zebra roam the reserve. The trail network is ideal for first-time mountain bikers, juniors and families wanting a safe, controlled wildlife-and-trails experience in greater Durban.',
    discipline: 'mtb',
    difficulty: 'beginner',
    surface: 'singletrack',
    distance_km: 12,
    elevation_m: 120,
    est_time_min: 50,
    province: 'KwaZulu-Natal',
    region: 'eThekwini',
    town: 'Queensburgh',
    lat: -29.8667,
    lng: 30.9167,
    tags: ['wildlife', 'rhino', 'zebra', 'family', 'beginners', 'coastal-forest', 'safe'],
    is_featured: false,
  },
]

async function main() {
  console.log(`\n🚴 Seeding ${routes.length} Durban/eThekwini cycling routes...\n`)

  let added = 0
  let skipped = 0

  for (const r of routes) {
    const exists = await sql`SELECT id FROM routes WHERE slug = ${r.slug}`
    if (exists.length > 0) {
      console.log(`  ⏭  SKIP: ${r.name} (slug exists)`)
      skipped++
      continue
    }

    await sql`
      INSERT INTO routes (
        name, slug, description, discipline, difficulty, surface,
        distance_km, elevation_m, est_time_min,
        province, region, town, lat, lng,
        tags, is_featured
      ) VALUES (
        ${r.name}, ${r.slug}, ${r.description},
        ${r.discipline}::route_discipline, ${r.difficulty}::route_difficulty, ${r.surface}::route_surface,
        ${r.distance_km}, ${r.elevation_m}, ${r.est_time_min},
        ${r.province}, ${r.region}, ${r.town}, ${r.lat}, ${r.lng},
        ${r.tags}, ${r.is_featured}
      )
    `
    console.log(`  ✅ ${r.name}`)
    added++
  }

  const [kznCount] = await sql`SELECT COUNT(*) AS c FROM routes WHERE province = 'KwaZulu-Natal'`
  const [etCount] = await sql`SELECT COUNT(*) AS c FROM routes WHERE region = 'eThekwini'`
  const [total] = await sql`SELECT COUNT(*) AS c FROM routes`

  console.log('\n──────────────────────────────────────────────────')
  console.log(`✅ Done: ${added} added | ${skipped} skipped`)
  console.log(`📊 eThekwini routes: ${etCount.c}`)
  console.log(`📊 KwaZulu-Natal total: ${kznCount.c}`)
  console.log(`📊 All routes total: ${total.c}`)
}

main().catch(console.error)
