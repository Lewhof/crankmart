/**
 * Seed Nelspruit / Mbombela / Lowveld cycling routes
 * Run: DATABASE_URL="..." npx tsx src/db/seed-nelspruit-routes.ts
 *
 * Covers eNelspruit metro, White River, Hazyview, Barberton,
 * Kaapsehoop, and surrounding Lowveld / Escarpment areas.
 * Skips existing slugs. Updates hero images on featured routes.
 */
import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

const envFile = readFileSync('.env.local', 'utf-8')
for (const line of envFile.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && v.length) process.env[k.trim()] = v.join('=').trim()
}

const sql = neon(process.env.DATABASE_URL!)

// Curated Unsplash images relevant to each route (landscape, cycling-compatible)
const heroImages: Record<string, string> = {
  'mankele-full-enduro-loop':
    'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=1200&q=80', // MTB forest trail
  'nelspruit-white-river-road-loop':
    'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=1200&q=80', // road cycling tropical
  'kaapsehoop-escarpment-gravel':
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200&q=80', // misty escarpment
  'nelspruit-crocodile-river-gravel':
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80', // tropical river valley
  'lowveld-botanical-garden-loop':
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80', // botanical garden
  'nelspruit-mbombela-stadium-loop':
    'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80', // urban cycling
}

const routes = [

  // ══════════════════════════════════════════════════════════════════════
  // NELSPRUIT / MBOMBELA — MTB
  // ══════════════════════════════════════════════════════════════════════

  {
    name: 'Mankele Full Enduro Loop',
    slug: 'mankele-full-enduro-loop',
    description:
      'The flagship loop at Mankele Mountain Bike Park — arguably South Africa\'s most scenic MTB destination. The full enduro loop at Mankele combines all major trail sections: the Mist Trail through lush subtropical forest, the Panorama Ridge with Lowveld escarpment views, the technical Granite Section and the flowing Riverbed descent back to the trailhead. Mankele sits on the Kaapsehoop plateau at 1,600 m and offers cool air and dramatic mist even in summer. The park is purpose-built with erosion-resistant trail construction throughout.',
    discipline: 'mtb',
    difficulty: 'advanced',
    surface: 'singletrack',
    distance_km: 38,
    elevation_m: 840,
    est_time_min: 160,
    province: 'Mpumalanga',
    region: 'Ehlanzeni',
    town: 'Nelspruit',
    lat: -25.6667,
    lng: 30.9167,
    tags: ['mankele', 'enduro', 'escarpment', 'mist-trail', 'panorama', 'subtropical-forest', 'purpose-built'],
    is_featured: true,
  },
  {
    name: 'Mankele Beginner Green Loop',
    slug: 'mankele-beginner-green-loop',
    description:
      'The introductory loop at Mankele MTB Park on the Kaapsehoop escarpment. The green loop traverses the most accessible sections of the trail network — smooth double-track, wide singletrack and gentle bermed corners through subtropical forest. At 1,600 m elevation, the air is cool and the mist dramatic even on the easiest trails. A perfect first MTB experience for families and entry-level riders visiting the Lowveld.',
    discipline: 'mtb',
    difficulty: 'beginner',
    surface: 'singletrack',
    distance_km: 15,
    elevation_m: 280,
    est_time_min: 65,
    province: 'Mpumalanga',
    region: 'Ehlanzeni',
    town: 'Nelspruit',
    lat: -25.6667,
    lng: 30.9167,
    tags: ['mankele', 'beginner', 'family', 'forest', 'escarpment', 'cool-air', 'easy'],
    is_featured: false,
  },
  {
    name: 'Karino Farm MTB Trails',
    slug: 'karino-farm-mtb-trails',
    description:
      'Private MTB trail network on Karino Farm south-east of Nelspruit. The trails wind through mango, avocado and banana orchards interspersed with indigenous bush on the lower Lowveld slopes. Unique tropical fruit farm riding with red-clay singletrack, short technical sections and sweeping views over the Crocodile River valley. Popular with Nelspruit locals for after-work sessions and weekend club rides.',
    discipline: 'mtb',
    difficulty: 'intermediate',
    surface: 'singletrack',
    distance_km: 22,
    elevation_m: 340,
    est_time_min: 90,
    province: 'Mpumalanga',
    region: 'Ehlanzeni',
    town: 'Nelspruit',
    lat: -25.5333,
    lng: 31.0167,
    tags: ['farm-trails', 'mango', 'avocado', 'tropical', 'lowveld', 'red-clay', 'after-work'],
    is_featured: false,
  },
  {
    name: 'Nelspruit Botanical Garden MTB Loop',
    slug: 'nelspruit-botanical-garden-loop',
    description:
      'A short MTB loop in and around the Lowveld National Botanical Garden in Nelspruit — one of South Africa\'s eight national botanical gardens. The garden protects riverine forest along the Crocodile River with fig trees, cycads and a stunning waterfall. The MTB loop follows fire breaks above the garden before descending to the river through forest singletrack. Outstanding fig forest scenery and bird life throughout.',
    discipline: 'mtb',
    difficulty: 'beginner',
    surface: 'singletrack',
    distance_km: 12,
    elevation_m: 160,
    est_time_min: 50,
    province: 'Mpumalanga',
    region: 'Ehlanzeni',
    town: 'Nelspruit',
    lat: -25.4667,
    lng: 30.9833,
    tags: ['botanical-garden', 'cycads', 'fig-forest', 'waterfall', 'riverine', 'birdlife', 'SANBI'],
    is_featured: false,
  },

  // ══════════════════════════════════════════════════════════════════════
  // NELSPRUIT / MBOMBELA — ROAD
  // ══════════════════════════════════════════════════════════════════════

  {
    name: 'Nelspruit White River Road Loop',
    slug: 'nelspruit-white-river-road-loop',
    description:
      'The standard Nelspruit road club loop from Mbombela through White River and back. The R40 White River Road climbs steadily through subtropical farms — macadamia, mango, litchi and banana plantations — before cresting at White River and descending back to Nelspruit via the R538 and R40. Moderate traffic, excellent road surface and beautiful Lowveld scenery make this the backbone of Nelspruit road cycling.',
    discipline: 'road',
    difficulty: 'intermediate',
    surface: 'tarmac',
    distance_km: 60,
    elevation_m: 580,
    est_time_min: 140,
    province: 'Mpumalanga',
    region: 'Ehlanzeni',
    town: 'Nelspruit',
    lat: -25.4753,
    lng: 30.9694,
    tags: ['white-river', 'R40', 'macadamia', 'tropical-farms', 'lowveld', 'club-ride'],
    is_featured: true,
  },
  {
    name: 'Nelspruit to Hazyview Road Ride',
    slug: 'nelspruit-hazyview-road-ride',
    description:
      'A classic Lowveld road ride from Nelspruit north to Hazyview on the R40 tourism corridor. The route passes through subtropical farmland, the Crocodile River gorge crossing and the lush irrigated farms around Hazyview. The R536 return leg adds the Sabie River valley — one of Mpumalanga\'s most beautiful river roads. A 90 km loop with moderate climbs, good tar and iconic Lowveld tropical scenery.',
    discipline: 'road',
    difficulty: 'intermediate',
    surface: 'tarmac',
    distance_km: 92,
    elevation_m: 720,
    est_time_min: 210,
    province: 'Mpumalanga',
    region: 'Ehlanzeni',
    town: 'Nelspruit',
    lat: -25.4753,
    lng: 30.9694,
    tags: ['hazyview', 'R40', 'sabie-river', 'crocodile-river', 'tropical', 'kruger-approach'],
    is_featured: false,
  },
  {
    name: 'Mbombela Stadium City Loop',
    slug: 'nelspruit-mbombela-stadium-loop',
    description:
      'A flat urban cycling loop around the Mbombela (Nelspruit) city area linking the iconic Mbombela Stadium — known for its giraffe-shaped floodlights — with the CBD, Riverside Mall and the Lowveld Botanical Garden. The route uses the R40, N4 service roads and quiet residential streets. Minimal climbing, smooth tar and good sightseeing make this a popular family ride and tourist cycling experience.',
    discipline: 'road',
    difficulty: 'beginner',
    surface: 'tarmac',
    distance_km: 24,
    elevation_m: 95,
    est_time_min: 58,
    province: 'Mpumalanga',
    region: 'Ehlanzeni',
    town: 'Nelspruit',
    lat: -25.4680,
    lng: 30.9870,
    tags: ['mbombela-stadium', 'giraffes', 'urban', 'botanical-garden', 'flat', 'sightseeing', 'family'],
    is_featured: false,
  },
  {
    name: 'Nelspruit Crocodile River Valley Road',
    slug: 'nelspruit-crocodile-river-road',
    description:
      'A scenic road ride following the Crocodile River valley east of Nelspruit towards the Mozambique border corridor. The route drops into the lowveld heat through citrus and banana estates, crosses the Crocodile River at Malelane and loops back via Hectorspruit on the R570. Flat to rolling terrain with sweeping views over the wide Lowveld floodplain and occasional wildlife sightings near the Kruger fence.',
    discipline: 'road',
    difficulty: 'intermediate',
    surface: 'tarmac',
    distance_km: 80,
    elevation_m: 380,
    est_time_min: 185,
    province: 'Mpumalanga',
    region: 'Ehlanzeni',
    town: 'Nelspruit',
    lat: -25.5167,
    lng: 31.1667,
    tags: ['crocodile-river', 'malelane', 'lowveld', 'citrus', 'kruger-fence', 'wildlife', 'heat'],
    is_featured: false,
  },

  // ══════════════════════════════════════════════════════════════════════
  // WHITE RIVER — MTB & GRAVEL
  // ══════════════════════════════════════════════════════════════════════

  {
    name: 'White River Casterbridge Gravel Loop',
    slug: 'white-river-casterbridge-gravel',
    description:
      'A popular gravel loop from White River town through the art farms, eco-estates and macadamia orchards surrounding Casterbridge Hollow. The route links quiet gravel farm roads through Henley on Klip and Farm Inn areas before returning via the R40 to White River. Outstanding tropical fruit farm scenery, red-clay gravel tracks and easy access from the Casterbridge Farm Market coffee stop.',
    discipline: 'gravel',
    difficulty: 'intermediate',
    surface: 'gravel',
    distance_km: 42,
    elevation_m: 420,
    est_time_min: 140,
    province: 'Mpumalanga',
    region: 'Ehlanzeni',
    town: 'White River',
    lat: -25.3333,
    lng: 31.0167,
    tags: ['casterbridge', 'macadamia', 'art-farms', 'gravel', 'coffee-stop', 'lowveld', 'red-clay'],
    is_featured: false,
  },
  {
    name: 'Plaston and Numbi Gate Gravel',
    slug: 'plaston-numbi-gate-gravel',
    description:
      'A Lowveld gravel adventure from White River through the Numbi area towards the Kruger National Park\'s Numbi Gate. The route follows farm service roads and dirt tracks through citrus estates and indigenous bushveld transitioning to the hot Lowveld savannah. Distant views of the Drakensberg escarpment to the west and the Kruger Park boundary fence add drama. An out-and-back gravel ride with genuine Lowveld wilderness feel.',
    discipline: 'gravel',
    difficulty: 'intermediate',
    surface: 'gravel',
    distance_km: 65,
    elevation_m: 510,
    est_time_min: 195,
    province: 'Mpumalanga',
    region: 'Ehlanzeni',
    town: 'White River',
    lat: -25.2833,
    lng: 31.1833,
    tags: ['numbi-gate', 'kruger', 'citrus', 'bushveld', 'escarpment-views', 'lowveld', 'dirt-tracks'],
    is_featured: false,
  },

  // ══════════════════════════════════════════════════════════════════════
  // KAAPSEHOOP — MTB & GRAVEL
  // ══════════════════════════════════════════════════════════════════════

  {
    name: 'Kaapsehoop Escarpment Gravel Loop',
    slug: 'kaapsehoop-escarpment-gravel',
    description:
      'A breathtaking gravel loop on the Kaapsehoop escarpment plateau at 1,600 m above the Lowveld. The route links the historic mining village of Kaapsehoop with the plateau\'s farm roads, indigenous forest patches and the cliff-edge viewpoints overlooking the entire Lowveld and Mozambique plains. Wild horses roam the plateau freely and are commonly encountered on the route. Misty, cool and extraordinary — one of South Africa\'s most atmospheric gravel rides.',
    discipline: 'gravel',
    difficulty: 'intermediate',
    surface: 'gravel',
    distance_km: 48,
    elevation_m: 560,
    est_time_min: 160,
    province: 'Mpumalanga',
    region: 'Ehlanzeni',
    town: 'Kaapsehoop',
    lat: -25.5833,
    lng: 30.8167,
    tags: ['kaapsehoop', 'wild-horses', 'escarpment', 'cliff-edge', 'mist', 'historic-village', 'atmospheric'],
    is_featured: true,
  },
  {
    name: 'Kaapsehoop to Nelspruit Descent',
    slug: 'kaapsehoop-nelspruit-descent',
    description:
      'A spectacular 35 km descent from the Kaapsehoop plateau (1,600 m) all the way down to Nelspruit in the Lowveld (660 m). The route drops 940 m over 35 km via the old Kaapsehoop Road through subtropical forest, cliff faces and dramatic escarpment switchbacks. One of South Africa\'s great cycling descents — fast, technical and visually extraordinary. Best ridden early morning to avoid heat at the bottom.',
    discipline: 'road',
    difficulty: 'intermediate',
    surface: 'tarmac',
    distance_km: 35,
    elevation_m: 940,
    est_time_min: 75,
    province: 'Mpumalanga',
    region: 'Ehlanzeni',
    town: 'Kaapsehoop',
    lat: -25.5833,
    lng: 30.8667,
    tags: ['descent', 'escarpment', 'forest', 'switchbacks', 'epic', '940m-drop', 'one-way'],
    is_featured: true,
  },

  // ══════════════════════════════════════════════════════════════════════
  // BARBERTON — MTB & GRAVEL
  // ══════════════════════════════════════════════════════════════════════

  {
    name: 'Barberton Fortuna Mine MTB Trail',
    slug: 'barberton-fortuna-mine-mtb',
    description:
      'Technical MTB trails in the ancient mountains above Barberton — some of the oldest exposed geology on Earth (3.5 billion years). The Fortuna Mine area above town offers rocky singletrack through the Makhonjwa Mountains above the historic gold rush town. The trails connect with old mining tracks and indigenous forest patches with sweeping views over the De Kaap Valley. A geologically extraordinary MTB experience.',
    discipline: 'mtb',
    difficulty: 'advanced',
    surface: 'singletrack',
    distance_km: 28,
    elevation_m: 680,
    est_time_min: 125,
    province: 'Mpumalanga',
    region: 'Ehlanzeni',
    town: 'Barberton',
    lat: -25.7833,
    lng: 31.0500,
    tags: ['barberton', 'makhonjwa', 'gold-rush', 'ancient-geology', 'UNESCO', 'mining', 'de-kaap-valley'],
    is_featured: false,
  },
  {
    name: 'Barberton De Kaap Valley Road Ride',
    slug: 'barberton-de-kaap-valley-road',
    description:
      'A rolling road ride through the historic De Kaap Valley around Barberton — once the site of South Africa\'s first major gold rush in 1884. The route links Barberton\'s Victorian gold rush architecture with the valley floor farms, the Nooitgedacht Dam and the surrounding Makhonjwa Mountains (a UNESCO Geoheritage site). Low traffic, excellent road surface and extraordinary geological and historical character make this a unique Lowveld road ride.',
    discipline: 'road',
    difficulty: 'intermediate',
    surface: 'tarmac',
    distance_km: 55,
    elevation_m: 620,
    est_time_min: 135,
    province: 'Mpumalanga',
    region: 'Ehlanzeni',
    town: 'Barberton',
    lat: -25.7833,
    lng: 31.0333,
    tags: ['barberton', 'gold-rush', 'Victorian', 'de-kaap', 'UNESCO-geoheritage', 'historic', 'dam'],
    is_featured: false,
  },

  // ══════════════════════════════════════════════════════════════════════
  // NELSPRUIT — GRAVEL CONNECTOR
  // ══════════════════════════════════════════════════════════════════════

  {
    name: 'Nelspruit Crocodile River Gravel Trail',
    slug: 'nelspruit-crocodile-river-gravel',
    description:
      'A scenic gravel route following the Crocodile River upstream from Nelspruit towards Montrose Falls and the Sudwala Caves area. The route uses farm access roads and management tracks along the river corridor through riverine forest and subtropical bush. The Sudwala Caves, Pan African Congress of Geology and Montrose Falls are visible along the route. Wildlife sightings — including crocodile, hippo and bushbuck — are possible along the river sections.',
    discipline: 'gravel',
    difficulty: 'intermediate',
    surface: 'gravel',
    distance_km: 52,
    elevation_m: 490,
    est_time_min: 165,
    province: 'Mpumalanga',
    region: 'Ehlanzeni',
    town: 'Nelspruit',
    lat: -25.4500,
    lng: 30.8833,
    tags: ['crocodile-river', 'sudwala-caves', 'montrose-falls', 'riverine-forest', 'wildlife', 'hippo', 'gravel'],
    is_featured: false,
  },
]

async function main() {
  console.log(`\n🚴 Seeding ${routes.length} Nelspruit / Lowveld cycling routes...\n`)

  let added = 0
  let skipped = 0
  let imagesUpdated = 0

  for (const r of routes) {
    const exists = await sql`SELECT id FROM routes WHERE slug = ${r.slug}`

    if (exists.length > 0) {
      console.log(`  ⏭  SKIP: ${r.name}`)
      skipped++
      // Still update hero image if we have one and it's missing
      if (heroImages[r.slug]) {
        await sql`UPDATE routes SET hero_image_url = ${heroImages[r.slug]} WHERE slug = ${r.slug} AND (hero_image_url IS NULL OR hero_image_url = '')`
        imagesUpdated++
      }
      continue
    }

    const heroImg = heroImages[r.slug] || null

    await sql`
      INSERT INTO routes (
        name, slug, description, discipline, difficulty, surface,
        distance_km, elevation_m, est_time_min,
        province, region, town, lat, lng,
        tags, is_featured, hero_image_url
      ) VALUES (
        ${r.name}, ${r.slug}, ${r.description},
        ${r.discipline}::route_discipline, ${r.difficulty}::route_difficulty, ${r.surface}::route_surface,
        ${r.distance_km}, ${r.elevation_m}, ${r.est_time_min},
        ${r.province}, ${r.region}, ${r.town}, ${r.lat}, ${r.lng},
        ${r.tags}, ${r.is_featured}, ${heroImg}
      )
    `
    console.log(`  ✅ ${r.name}${heroImg ? ' 🖼' : ''}`)
    added++
  }

  const [mpum]   = await sql`SELECT COUNT(*) AS c FROM routes WHERE province = 'Mpumalanga'`
  const [nel]    = await sql`SELECT COUNT(*) AS c FROM routes WHERE town ILIKE '%nelspruit%' OR town ILIKE '%mbombela%'`
  const [withImg]= await sql`SELECT COUNT(*) AS c FROM routes WHERE province = 'Mpumalanga' AND hero_image_url IS NOT NULL`
  const [total]  = await sql`SELECT COUNT(*) AS c FROM routes`

  console.log('\n──────────────────────────────────────────────────')
  console.log(`✅ Done: ${added} added | ${skipped} skipped | ${imagesUpdated} images updated`)
  console.log(`📊 Mpumalanga total:      ${mpum.c}`)
  console.log(`📊 Nelspruit/Mbombela:    ${nel.c}`)
  console.log(`📊 Mpum with hero image:  ${withImg.c}`)
  console.log(`📊 All routes total:      ${total.c}`)
}

main().catch(console.error)
