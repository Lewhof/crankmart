/**
 * Seed Bloemfontein / Free State cycling routes — comprehensive expansion
 * Run: DATABASE_URL="..." npx tsx src/db/seed-bloemfontein-routes.ts
 *
 * Covers: Bloemfontein city loops, Thaba Nchu, Gariep Dam, Wepener,
 * Springfontein, Philippolis, Zastron, Bethulie, Fouriesburg additions,
 * Clarens additions, Senekal gravel, Welkom/Odendaalsrus, Heilbron
 */
import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

const envFile = readFileSync('.env.local', 'utf-8')
for (const line of envFile.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && v.length) process.env[k.trim()] = v.join('=').trim()
}

const sql = neon(process.env.DATABASE_URL!)

const heroImages: Record<string, string> = {
  'bloemfontein-naval-hill-road-loop':
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200&q=80',
  'gariep-dam-gravel-loop':
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80',
  'golden-gate-highlands-road-classic':
    'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1200&q=80',
  'bloemfontein-loch-logan-waterfront-loop':
    'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80',
  'clarens-drakensberg-foothills-gravel':
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80',
}

const routes = [

  // ══════════════════════════════════════════════════════════════════════
  // BLOEMFONTEIN — ROAD LOOPS
  // ══════════════════════════════════════════════════════════════════════

  {
    name: 'Bloemfontein Naval Hill Road Loop',
    slug: 'bloemfontein-naval-hill-road-loop',
    description:
      'The signature Bloemfontein road cycling loop anchored by the Naval Hill Nature Reserve — the flat-topped koppie that dominates the city skyline. The route climbs Naval Hill via Hamilton Road for panoramic 360° city views, then descends through Universitas before looping via the N1 service road, Fleurdal and Churchill Estate. A compact, punchy loop beloved by Bloem road clubs for morning intervals. The Hill\'s free-roaming game (zebra, eland, springbok) are visible from the road summit.',
    discipline: 'road',
    difficulty: 'intermediate',
    surface: 'tarmac',
    distance_km: 42,
    elevation_m: 480,
    est_time_min: 95,
    province: 'Free State',
    region: 'Mangaung',
    town: 'Bloemfontein',
    lat: -29.1165,
    lng: 26.2110,
    tags: ['naval-hill', 'koppie', 'panoramic', 'zebra', 'eland', 'city-views', 'morning-loop'],
    is_featured: true,
  },
  {
    name: 'Bloemfontein Loch Logan Waterfront Loop',
    slug: 'bloemfontein-loch-logan-waterfront-loop',
    description:
      'A flat, accessible urban cycling loop from Bloemfontein\'s Loch Logan Waterfront along the city\'s greenway paths. The route circles Loch Logan lake, links the Botanical Garden, Voortrekker Park and Mimosa Mall before returning through Westdene and the CBD. Ideal for beginners, families and tourist cyclists exploring Mangaung. Best ridden early Sunday morning when the city is quiet and the waterfront cafés are just opening.',
    discipline: 'road',
    difficulty: 'beginner',
    surface: 'tarmac',
    distance_km: 22,
    elevation_m: 85,
    est_time_min: 52,
    province: 'Free State',
    region: 'Mangaung',
    town: 'Bloemfontein',
    lat: -29.1115,
    lng: 26.2140,
    tags: ['loch-logan', 'waterfront', 'urban', 'family', 'beginners', 'botanical-garden', 'flat'],
    is_featured: true,
  },
  {
    name: 'Bloemfontein Hillside Training Loop',
    slug: 'bloemfontein-hillside-training-loop',
    description:
      'The go-to Bloemfontein road training loop for intermediate and advanced cyclists — a 70 km circuit through Hillside, Bayswater, Brandwag and the Bloemspruit area. The route exits the city south via Langenhoven Park, loops through the Bloemspruit airfield area and returns via the R706 through Pellissier. Moderate climbs, good road surfaces and minimal weekend traffic make this the backbone of Bloem cycling club training.',
    discipline: 'road',
    difficulty: 'intermediate',
    surface: 'tarmac',
    distance_km: 70,
    elevation_m: 530,
    est_time_min: 165,
    province: 'Free State',
    region: 'Mangaung',
    town: 'Bloemfontein',
    lat: -29.1165,
    lng: 26.2110,
    tags: ['hillside', 'bayswater', 'brandwag', 'training', 'club-ride', 'weekend', 'bloem-loop'],
    is_featured: false,
  },
  {
    name: 'Bloemfontein to Botshabelo Road Ride',
    slug: 'bloemfontein-botshabelo-road-ride',
    description:
      'A historically significant road ride from Bloemfontein east to Botshabelo — one of South Africa\'s largest townships, established during the apartheid era as a homeland town. The R64 passes through the Modderpoort area and Free State grassland on good tar. The ride into and through Botshabelo is a powerful cultural immersion and a tribute to the resilience of its community. Best experienced as a guided social ride.',
    discipline: 'road',
    difficulty: 'beginner',
    surface: 'tarmac',
    distance_km: 50,
    elevation_m: 200,
    est_time_min: 115,
    province: 'Free State',
    region: 'Mangaung',
    town: 'Bloemfontein',
    lat: -29.1165,
    lng: 26.2110,
    tags: ['botshabelo', 'history', 'apartheid', 'cultural', 'R64', 'social-ride', 'guided'],
    is_featured: false,
  },
  {
    name: 'Bloemfontein Thaba Nchu Road Loop',
    slug: 'bloemfontein-thaba-nchu-road-loop',
    description:
      'A classic Free State road loop from Bloemfontein east to Thaba Nchu — the distinctive flat-topped mountain that gives the town its name (Black Mountain in Setswana). The R64 crosses the rolling grassland plains of the Free State Highveld. The Maria Moroka National Park near Thaba Nchu adds a wildlife detour option. An 80 km out-and-back on good tar through open sky Highveld with almost no traffic on weekends.',
    discipline: 'road',
    difficulty: 'intermediate',
    surface: 'tarmac',
    distance_km: 82,
    elevation_m: 340,
    est_time_min: 195,
    province: 'Free State',
    region: 'Mangaung',
    town: 'Bloemfontein',
    lat: -29.1165,
    lng: 26.2110,
    tags: ['thaba-nchu', 'black-mountain', 'R64', 'highveld', 'grassland', 'maria-moroka', 'open-sky'],
    is_featured: false,
  },

  // ══════════════════════════════════════════════════════════════════════
  // BLOEMFONTEIN — MTB
  // ══════════════════════════════════════════════════════════════════════

  {
    name: 'Bloemfontein Soetdoring MTB Park',
    slug: 'bloemfontein-soetdoring-mtb-park',
    description:
      'Purpose-built MTB trails at the Soetdoring Nature Reserve dam north-west of Bloemfontein. The Soetdoring reserve protects Free State grassland and thornveld along the Modder River. The MTB park features 30 km of marked singletrack and dual-track through the reserve with dam views, game sightings and typical Highveld flora. One of Bloemfontein\'s most popular weekend MTB destinations, operated by the local MTB club.',
    discipline: 'mtb',
    difficulty: 'intermediate',
    surface: 'singletrack',
    distance_km: 28,
    elevation_m: 260,
    est_time_min: 105,
    province: 'Free State',
    region: 'Mangaung',
    town: 'Bloemfontein',
    lat: -29.0000,
    lng: 26.0500,
    tags: ['soetdoring', 'dam', 'modder-river', 'grassland', 'thornveld', 'purpose-built', 'club-managed'],
    is_featured: false,
  },
  {
    name: 'Maselspoort Resort MTB Trails',
    slug: 'maselspoort-resort-mtb-trails',
    description:
      'MTB trails based at the Maselspoort Resort on the Modder River east of Bloemfontein — a beloved Free State holiday resort. The trails wind through riverine bush, rocky koppies and open grassland along the Modder River valley. Multiple difficulty options from beginner family loops to technical koppie singletrack. The resort\'s swimming pools and braai facilities make this a perfect Bloem family cycling day out.',
    discipline: 'mtb',
    difficulty: 'beginner',
    surface: 'singletrack',
    distance_km: 18,
    elevation_m: 170,
    est_time_min: 70,
    province: 'Free State',
    region: 'Mangaung',
    town: 'Bloemfontein',
    lat: -29.0833,
    lng: 26.3500,
    tags: ['maselspoort', 'modder-river', 'resort', 'family', 'riverine', 'koppies', 'swimming'],
    is_featured: false,
  },

  // ══════════════════════════════════════════════════════════════════════
  // GARIEP DAM — SOUTH FREE STATE
  // ══════════════════════════════════════════════════════════════════════

  {
    name: 'Gariep Dam Gravel Loop',
    slug: 'gariep-dam-gravel-loop',
    description:
      'A spectacular gravel loop around the Gariep Dam — South Africa\'s largest dam and a premier cycling destination on the N1 corridor. The route follows the dam perimeter on gravel reserve management roads through the Gariep Dam Nature Reserve. Massive open water views across the Orange/Gariep River, springbok herds, black wildebeest and the dramatic Karoo-meets-Free State landscape make this one of the country\'s most unique cycling experiences. Fierce wind is almost guaranteed.',
    discipline: 'gravel',
    difficulty: 'intermediate',
    surface: 'gravel',
    distance_km: 65,
    elevation_m: 380,
    est_time_min: 210,
    province: 'Free State',
    region: 'Xhariep',
    town: 'Gariep Dam',
    lat: -30.5500,
    lng: 25.5167,
    tags: ['gariep-dam', 'largest-dam', 'orange-river', 'springbok', 'wildebeest', 'wind', 'karoo-edge'],
    is_featured: true,
  },
  {
    name: 'Philippolis and Toverberg Road Ride',
    slug: 'philippolis-toverberg-road-ride',
    description:
      'A remote road ride through the Karoo-Free State transitional zone around Philippolis — South Africa\'s oldest inland town (founded 1823). The route crosses the flat Highveld plains before climbing to the Toverberg (Magic Mountain) plateau above Colesberg. Vast open sky, merino sheep farms, historic stone churches and the dramatic Karoo landscape define this lonely but extraordinary road cycling experience.',
    discipline: 'road',
    difficulty: 'intermediate',
    surface: 'tarmac',
    distance_km: 78,
    elevation_m: 420,
    est_time_min: 190,
    province: 'Free State',
    region: 'Xhariep',
    town: 'Philippolis',
    lat: -30.2667,
    lng: 25.2500,
    tags: ['philippolis', 'oldest-town', 'toverberg', 'karoo', 'merino', 'historic', 'remote', 'open-sky'],
    is_featured: false,
  },
  {
    name: 'Bethulie and Gariep River Gravel',
    slug: 'bethulie-gariep-river-gravel',
    description:
      'A quiet gravel ride through the Bethulie district near the Orange/Gariep River — the border between the Free State and Northern Cape. The route follows the river valley on farm service roads through semi-arid scrubland, crossing the historic Bethulie Bridge (site of a famous Anglo-Boer War concentration camp). Extraordinary solitude, wide river valley views and Anglo-Boer War heritage make this a deeply atmospheric Free State ride.',
    discipline: 'gravel',
    difficulty: 'intermediate',
    surface: 'gravel',
    distance_km: 55,
    elevation_m: 280,
    est_time_min: 180,
    province: 'Free State',
    region: 'Xhariep',
    town: 'Bethulie',
    lat: -30.4833,
    lng: 25.9833,
    tags: ['bethulie', 'orange-river', 'boer-war', 'concentration-camp', 'historic', 'remote', 'solitude'],
    is_featured: false,
  },

  // ══════════════════════════════════════════════════════════════════════
  // EASTERN FREE STATE — MOUNTAINS & FOOTHILLS
  // ══════════════════════════════════════════════════════════════════════

  {
    name: 'Golden Gate Highlands Road Classic',
    slug: 'golden-gate-highlands-road-classic',
    description:
      'The full road classic loop through the Golden Gate Highlands National Park — one of South Africa\'s most visually dramatic cycling environments. The route links Clarens, the Golden Gate park entrance, Glen Reenen rest camp and the Brandwater area on the R712 and R26. Towering golden sandstone cliffs, Rooiberge mountains and open highland meadows at 2,000 m create cycling scenery unlike anywhere else in the country. Eland, blesbok and black wildebeest roam the park.',
    discipline: 'road',
    difficulty: 'advanced',
    surface: 'tarmac',
    distance_km: 95,
    elevation_m: 1280,
    est_time_min: 240,
    province: 'Free State',
    region: 'Thabo Mofutsanyana',
    town: 'Clarens',
    lat: -28.5167,
    lng: 28.6167,
    tags: ['golden-gate', 'national-park', 'sandstone-cliffs', 'highland', '2000m', 'eland', 'classic'],
    is_featured: true,
  },
  {
    name: 'Clarens Drakensberg Foothills Gravel',
    slug: 'clarens-drakensberg-foothills-gravel',
    description:
      'A world-class gravel loop from the art village of Clarens through the Drakensberg foothills above the Free State Highlands. The route links farm roads between the Rooiberge mountains, the Little Caledon River valley and the Lesotho border escarpment. Basotho horsemen, highland cattle farms and dramatic sandstone formations define the landscape. Clarens\'s galleries, craft beer and mountain lodges make this a premium cycling holiday destination.',
    discipline: 'gravel',
    difficulty: 'advanced',
    surface: 'gravel',
    distance_km: 72,
    elevation_m: 1100,
    est_time_min: 235,
    province: 'Free State',
    region: 'Thabo Mofutsanyana',
    town: 'Clarens',
    lat: -28.5167,
    lng: 28.4333,
    tags: ['clarens', 'drakensberg-foothills', 'rooiberge', 'lesotho-border', 'basotho', 'gravel-premium', 'art-village'],
    is_featured: true,
  },
  {
    name: 'Ficksburg Caledon River Valley Road',
    slug: 'ficksburg-caledon-river-valley-road',
    description:
      'A scenic road loop from Ficksburg along the Caledon River — the natural border between South Africa and Lesotho. The route follows the river valley through cherry orchards and asparagus farms (Ficksburg is South Africa\'s cherry capital) before climbing to Lesotho border viewpoints above Caledon Poort. The contrast between the fertile river valley and the stark Maluti Mountains of Lesotho across the river is extraordinary.',
    discipline: 'road',
    difficulty: 'intermediate',
    surface: 'tarmac',
    distance_km: 62,
    elevation_m: 580,
    est_time_min: 150,
    province: 'Free State',
    region: 'Thabo Mofutsanyana',
    town: 'Ficksburg',
    lat: -28.8833,
    lng: 27.8833,
    tags: ['ficksburg', 'cherries', 'caledon-river', 'lesotho-border', 'maluti-mountains', 'asparagus', 'border-valley'],
    is_featured: false,
  },
  {
    name: 'Fouriesburg Rooiberge Gravel Loop',
    slug: 'fouriesburg-rooiberge-gravel-loop',
    description:
      'A demanding gravel loop from Fouriesburg through the dramatic Rooiberge (Red Mountains) sandstone range. The route traverses farm roads through the highlands above the Caledon River gorge with views into Lesotho\'s Maluti Mountains. The area was a significant Anglo-Boer War battleground and isolated farmsteads with old stone walls and rusted corrugated iron give the route a haunted, timeless atmosphere. Remote, challenging and breathtaking.',
    discipline: 'gravel',
    difficulty: 'advanced',
    surface: 'gravel',
    distance_km: 68,
    elevation_m: 950,
    est_time_min: 230,
    province: 'Free State',
    region: 'Thabo Mofutsanyana',
    town: 'Fouriesburg',
    lat: -28.6167,
    lng: 28.2333,
    tags: ['fouriesburg', 'rooiberge', 'sandstone', 'lesotho-views', 'boer-war', 'remote', 'highland'],
    is_featured: false,
  },
  {
    name: 'Senekal and Vrede Gravel Plains',
    slug: 'senekal-vrede-gravel-plains',
    description:
      'A long gravel route across the vast Free State grain plains between Senekal and Vrede — the agricultural heartland of South Africa. The route follows gravel farm roads through rolling wheat, maize and soya fields under enormous Highveld skies. A few gentle koppies break the flat horizon. This is pure Free State — vast, quiet, windy and profoundly beautiful in its simplicity. A bikepacking favourite for riders wanting to cross the Highveld off-road.',
    discipline: 'gravel',
    difficulty: 'intermediate',
    surface: 'gravel',
    distance_km: 80,
    elevation_m: 240,
    est_time_min: 255,
    province: 'Free State',
    region: 'Thabo Mofutsanyana',
    town: 'Senekal',
    lat: -28.3167,
    lng: 27.6167,
    tags: ['senekal', 'vrede', 'grain-plains', 'highveld', 'wheat', 'big-sky', 'bikepacking', 'wind'],
    is_featured: false,
  },

  // ══════════════════════════════════════════════════════════════════════
  // NORTHERN FREE STATE — WELKOM & GOLDFIELDS
  // ══════════════════════════════════════════════════════════════════════

  {
    name: 'Welkom Goldfields Road Loop',
    slug: 'welkom-goldfields-road-loop',
    description:
      'A flat road loop through Welkom — South Africa\'s only planned city, built from scratch in 1947 as the service centre for the Free State goldfields. The route circles the city\'s wide circular streets (designed without traffic lights using roundabouts), past gold mine head gears and the man-made Koponong Dam. A unique urban cycling experience through apartheid-era town planning and industrial gold mining history.',
    discipline: 'road',
    difficulty: 'beginner',
    surface: 'tarmac',
    distance_km: 40,
    elevation_m: 110,
    est_time_min: 88,
    province: 'Free State',
    region: 'Lejweleputswa',
    town: 'Welkom',
    lat: -27.9833,
    lng: 26.7333,
    tags: ['welkom', 'goldfields', 'planned-city', 'gold-mines', 'roundabouts', 'flat', 'industrial-heritage'],
    is_featured: false,
  },
  {
    name: 'Heilbron and Vaal River Gravel',
    slug: 'heilbron-vaal-river-gravel',
    description:
      'A gravel ride from Heilbron to the Vaal River confluence in the northern Free State. The route descends from the Highveld plateau on farm roads to the Vaal River gorge — a dramatic geological feature rarely visited by cyclists. Cattle farms, wheat fields and sunflower crops line the route. The Vaal River crossing at Windsorton and the rocky riverbank make this a rewarding gravel adventure in a little-known part of the Free State.',
    discipline: 'gravel',
    difficulty: 'intermediate',
    surface: 'gravel',
    distance_km: 58,
    elevation_m: 340,
    est_time_min: 190,
    province: 'Free State',
    region: 'Fezile Dabi',
    town: 'Heilbron',
    lat: -27.2833,
    lng: 27.9500,
    tags: ['heilbron', 'vaal-river', 'gorge', 'wheat', 'sunflowers', 'northern-freestate', 'gravel'],
    is_featured: false,
  },
]

async function main() {
  console.log(`\n🌾 Seeding ${routes.length} Bloemfontein / Free State cycling routes...\n`)

  let added = 0
  let skipped = 0
  let imagesUpdated = 0

  for (const r of routes) {
    const exists = await sql`SELECT id FROM routes WHERE slug = ${r.slug}`
    if (exists.length > 0) {
      console.log(`  ⏭  SKIP: ${r.name}`)
      skipped++
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

  const [fs]      = await sql`SELECT COUNT(*) AS c FROM routes WHERE province = 'Free State'`
  const [bloem]   = await sql`SELECT COUNT(*) AS c FROM routes WHERE town ILIKE '%bloemfontein%' OR region ILIKE '%mangaung%'`
  const [withImg] = await sql`SELECT COUNT(*) AS c FROM routes WHERE province = 'Free State' AND hero_image_url IS NOT NULL`
  const [total]   = await sql`SELECT COUNT(*) AS c FROM routes`

  const regions = await sql`
    SELECT region, COUNT(*) AS c FROM routes
    WHERE province = 'Free State'
    GROUP BY region ORDER BY c DESC
  `

  console.log('\n──────────────────────────────────────────────────')
  console.log(`✅ Done: ${added} added | ${skipped} skipped | ${imagesUpdated} images updated`)
  console.log(`📊 Free State total:    ${fs.c}`)
  console.log(`📊 Bloemfontein area:   ${bloem.c}`)
  console.log(`📊 With hero image:     ${withImg.c}`)
  console.log(`📊 All routes total:    ${total.c}`)
  console.log('\n📍 By region:')
  regions.forEach((r: any) => console.log(`   ${r.region || 'unset'}: ${r.c}`))
}

main().catch(console.error)
