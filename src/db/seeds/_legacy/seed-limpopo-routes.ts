/**
 * Seed Limpopo cycling routes — comprehensive expansion
 * Run: DATABASE_URL="..." npx tsx src/db/seed-limpopo-routes.ts
 *
 * Covers: Polokwane, Soutpansberg (Louis Trichardt), Hoedspruit,
 * Phalaborwa, Lephalale, Modimolle, Mokopane, Nylstroom area,
 * Tzaneen/Magoebaskloof additions, Thabazimbi, Bela-Bela additions
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
  'polokwane-municipal-game-reserve-mtb':
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80',
  'soutpansberg-ridge-road-ride':
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200&q=80',
  'hoedspruit-klaserie-gravel-loop':
    'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=1200&q=80',
  'thabazimbi-waterberg-mtb-loop':
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80',
  'magoebaskloof-red-trail-loop':
    'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1200&q=80',
}

const routes = [

  // ══════════════════════════════════════════════════════════════════════
  // POLOKWANE (PIETERSBURG) — ROAD & MTB
  // ══════════════════════════════════════════════════════════════════════

  {
    name: 'Polokwane Municipal Game Reserve MTB',
    slug: 'polokwane-municipal-game-reserve-mtb',
    description:
      'MTB trails inside the Polokwane Game Reserve — one of the largest municipal game reserves in South Africa at 3,200 hectares, right on the edge of Polokwane city. The reserve hosts white rhino, giraffe, zebra, kudu and numerous antelope alongside a growing trail network of singletrack and fire break roads. Multiple loop options from 10 to 30 km make this an extraordinary urban MTB destination where big game sightings are routine.',
    discipline: 'mtb',
    difficulty: 'intermediate',
    surface: 'singletrack',
    distance_km: 25,
    elevation_m: 240,
    est_time_min: 95,
    province: 'Limpopo',
    region: 'Capricorn',
    town: 'Polokwane',
    lat: -23.8750,
    lng: 29.4583,
    tags: ['game-reserve', 'rhino', 'giraffe', 'zebra', 'urban-MTB', 'polokwane', 'big-game', 'municipal'],
    is_featured: true,
  },
  {
    name: 'Polokwane City Road Loop',
    slug: 'polokwane-city-road-loop',
    description:
      'The standard Polokwane road cycling training loop used by the local Cycling Limpopo clubs. The 65 km circuit leaves the CBD via Grobler Street, heads north through Fauna, then loops through Bendor Park, Ivy Park and Flora Park before returning via the N1. Rolling bushveld terrain at 1,230 m elevation with light early-morning traffic. The Polokwane Cycling Club hosts weekly time trials on the N1 service road.',
    discipline: 'road',
    difficulty: 'intermediate',
    surface: 'tarmac',
    distance_km: 65,
    elevation_m: 420,
    est_time_min: 150,
    province: 'Limpopo',
    region: 'Capricorn',
    town: 'Polokwane',
    lat: -23.9045,
    lng: 29.4688,
    tags: ['polokwane', 'training', 'club-ride', 'N1', 'time-trial', 'city-loop', 'bushveld'],
    is_featured: false,
  },
  {
    name: 'Polokwane to Mokopane Road Escape',
    slug: 'polokwane-mokopane-road-escape',
    description:
      'A classic north Limpopo road ride from Polokwane to Mokopane (Potgietersrus) on the R101 — the old Bela-Bela Road before the N1 bypass. The route passes through Seshego, Lebowakgomo turnoff and the Mogalakwena River valley. Low traffic, good tar and classic South African bushveld scenery characterise the 80 km out-and-back. Mokopane\'s town centre and the Makapan Valley (early human ancestor fossil sites) reward the effort.',
    discipline: 'road',
    difficulty: 'intermediate',
    surface: 'tarmac',
    distance_km: 82,
    elevation_m: 380,
    est_time_min: 195,
    province: 'Limpopo',
    region: 'Waterberg',
    town: 'Polokwane',
    lat: -23.9045,
    lng: 29.4688,
    tags: ['mokopane', 'R101', 'bushveld', 'makapan-valley', 'fossils', 'north-limpopo'],
    is_featured: false,
  },

  // ══════════════════════════════════════════════════════════════════════
  // SOUTPANSBERG — LOUIS TRICHARDT & VIVO
  // ══════════════════════════════════════════════════════════════════════

  {
    name: 'Soutpansberg Ridge Road Ride',
    slug: 'soutpansberg-ridge-road-ride',
    description:
      'One of South Africa\'s most dramatic road cycling climbs — the Soutpansberg mountain range north of Louis Trichardt rises to over 1,700 m above sea level. The route climbs from Louis Trichardt via the R522 through dense subtropical forest to the Soutpansberg ridge with cloud forest, cycad reserves and sweeping views over the Limpopo lowveld. The descent into Vivo on the northern side adds a thrilling finale. A genuine Limpopo classic.',
    discipline: 'road',
    difficulty: 'advanced',
    surface: 'tarmac',
    distance_km: 88,
    elevation_m: 1280,
    est_time_min: 230,
    province: 'Limpopo',
    region: 'Vhembe',
    town: 'Louis Trichardt',
    lat: -23.0500,
    lng: 29.9167,
    tags: ['soutpansberg', 'cloud-forest', 'cycads', 'climb', 'vivo', 'dramatic', 'limpopo-classic'],
    is_featured: true,
  },
  {
    name: 'Levubu Valley Subtropical Gravel',
    slug: 'levubu-valley-subtropical-gravel',
    description:
      'A lush gravel ride through the Levubu Valley east of Louis Trichardt — the most fertile subtropical farming area in Limpopo. The valley floor produces avocados, macadamias, bananas, mangoes and coffee. Gravel farm roads wind between the estates and indigenous forest patches of the Soutpansberg foothills with views up to the cloud forest peaks. A uniquely tropical Limpopo gravel experience rarely known outside the province.',
    discipline: 'gravel',
    difficulty: 'intermediate',
    surface: 'gravel',
    distance_km: 55,
    elevation_m: 480,
    est_time_min: 175,
    province: 'Limpopo',
    region: 'Vhembe',
    town: 'Louis Trichardt',
    lat: -23.0167,
    lng: 30.1333,
    tags: ['levubu', 'avocado', 'macadamia', 'subtropical', 'fertile-valley', 'cloud-forest', 'hidden-gem'],
    is_featured: false,
  },
  {
    name: 'Thohoyanddou and Thate Vondo Forest Road',
    slug: 'thohoyandou-thate-vondo-forest-road',
    description:
      'A scenic road loop through the Venda heartland north of Louis Trichardt, linking Thohoyandou (capital of the former Venda homeland) with the Thate Vondo State Forest. The forest road climbs through dense subtropical forest with sacred Venda sites, cycad populations and the Phiphidi Waterfall en route. The Venda cultural landscape — lakes, forests and mountains — makes this one of Limpopo\'s most culturally rich cycling routes.',
    discipline: 'road',
    difficulty: 'intermediate',
    surface: 'tarmac',
    distance_km: 72,
    elevation_m: 760,
    est_time_min: 180,
    province: 'Limpopo',
    region: 'Vhembe',
    town: 'Thohoyandou',
    lat: -22.9500,
    lng: 30.4833,
    tags: ['venda', 'thohoyandou', 'thate-vondo-forest', 'phiphidi-falls', 'cultural', 'sacred', 'subtropical'],
    is_featured: false,
  },

  // ══════════════════════════════════════════════════════════════════════
  // HOEDSPRUIT — BUSHVELD & KRUGER APPROACHES
  // ══════════════════════════════════════════════════════════════════════

  {
    name: 'Hoedspruit Klaserie Gravel Loop',
    slug: 'hoedspruit-klaserie-gravel-loop',
    description:
      'A gravel safari through the private game reserve corridor between Hoedspruit and the Klaserie Nature Reserve. The route follows management roads and game farm tracks through the Greater Kruger ecosystem — one of the world\'s largest unfenced wildlife areas. Lion, leopard, elephant and rhino are possible sightings. A genuinely wild gravel experience requiring good fitness and situational awareness. Guide recommended for first-timers.',
    discipline: 'gravel',
    difficulty: 'advanced',
    surface: 'gravel',
    distance_km: 60,
    elevation_m: 380,
    est_time_min: 200,
    province: 'Limpopo',
    region: 'Mopani',
    town: 'Hoedspruit',
    lat: -24.3500,
    lng: 31.0500,
    tags: ['klaserie', 'game-reserve', 'lion', 'elephant', 'big-five', 'wild', 'greater-kruger', 'guided'],
    is_featured: true,
  },
  {
    name: 'Hoedspruit to Orpen Gate Road Ride',
    slug: 'hoedspruit-orpen-gate-road-ride',
    description:
      'A classic Lowveld road ride from Hoedspruit to the Orpen Gate of the Kruger National Park on the R531. The route passes through Acornhoek and Klaserie township before reaching the bushveld savannah at Kruger\'s western boundary. Flat to rolling on excellent tarmac with constant wildlife corridor scenery — impala, warthog and zebra frequently cross the road. The Kruger gate marks a natural turnaround with a gate-side coffee stop.',
    discipline: 'road',
    difficulty: 'beginner',
    surface: 'tarmac',
    distance_km: 50,
    elevation_m: 180,
    est_time_min: 115,
    province: 'Limpopo',
    region: 'Mopani',
    town: 'Hoedspruit',
    lat: -24.3500,
    lng: 31.0500,
    tags: ['orpen-gate', 'kruger', 'R531', 'bushveld', 'impala', 'flat', 'wildlife-corridor'],
    is_featured: false,
  },
  {
    name: 'Blyde Canyon to Hoedspruit Descent',
    slug: 'blyde-canyon-hoedspruit-descent',
    description:
      'A spectacular descent from the Drakensberg escarpment above Graskop/Bourke\'s Luck down to Hoedspruit in the Lowveld. The R531 Strijdom Tunnel Road drops over 800 m through subtropical forest, past the famous Three Rondavels viewpoint and into the Lowveld heat. The full descent from Abel Erasmus Pass adds the Olifants River gorge. One of South Africa\'s great cycling descents with world-class scenery throughout.',
    discipline: 'road',
    difficulty: 'intermediate',
    surface: 'tarmac',
    distance_km: 55,
    elevation_m: 980,
    est_time_min: 105,
    province: 'Limpopo',
    region: 'Mopani',
    town: 'Hoedspruit',
    lat: -24.2833,
    lng: 30.8833,
    tags: ['blyde-canyon', 'abel-erasmus', 'three-rondavels', 'descent', '800m-drop', 'escarpment', 'epic'],
    is_featured: false,
  },

  // ══════════════════════════════════════════════════════════════════════
  // PHALABORWA — COPPER MINING TOWN & KRUGER GATEWAY
  // ══════════════════════════════════════════════════════════════════════

  {
    name: 'Phalaborwa Gate Road Loop',
    slug: 'phalaborwa-gate-road-loop',
    description:
      'A flat, hot road loop around the Phalaborwa area — the Kruger National Park\'s northernmost western gate. The route circles through the mining town, past the massive open-pit copper mine (one of the world\'s largest) and out to the Phalaborwa Gate before returning via the Selati Game Reserve boundary. Best ridden at dawn before the Lowveld heat builds. Elephant and lion are active near the Kruger fence at night.',
    discipline: 'road',
    difficulty: 'beginner',
    surface: 'tarmac',
    distance_km: 45,
    elevation_m: 130,
    est_time_min: 100,
    province: 'Limpopo',
    region: 'Mopani',
    town: 'Phalaborwa',
    lat: -23.9397,
    lng: 31.1373,
    tags: ['phalaborwa', 'copper-mine', 'kruger-gate', 'flat', 'lowveld', 'hot', 'dawn-ride'],
    is_featured: false,
  },
  {
    name: 'Tzaneen Ebenezer Dam Gravel Loop',
    slug: 'tzaneen-ebenezer-dam-gravel',
    description:
      'A scenic gravel loop around the Ebenezer Dam outside Tzaneen — the main water supply for the Tzaneen municipality amid the lush Drakensberg foothills. The route follows the dam perimeter on farm access roads through tea estates, avocado orchards and patches of indigenous afromontane forest. Excellent birding, cool mountain air and green subtropical scenery make this a standout Limpopo gravel ride close to Tzaneen town.',
    discipline: 'gravel',
    difficulty: 'intermediate',
    surface: 'gravel',
    distance_km: 38,
    elevation_m: 420,
    est_time_min: 130,
    province: 'Limpopo',
    region: 'Mopani',
    town: 'Tzaneen',
    lat: -23.8167,
    lng: 30.1333,
    tags: ['ebenezer-dam', 'tea-estates', 'avocado', 'afromontane', 'birdlife', 'tzaneen', 'cool'],
    is_featured: false,
  },

  // ══════════════════════════════════════════════════════════════════════
  // MAGOEBASKLOOF ADDITIONS
  // ══════════════════════════════════════════════════════════════════════

  {
    name: 'Magoebaskloof Red Trail Loop',
    slug: 'magoebaskloof-red-trail-loop',
    description:
      'The most challenging loop at the Magoebaskloof MTB trail network — a technical red-graded circuit through the indigenous afromontane forest above Haenertsburg. The trail drops into deep kloofs, crosses stream beds and climbs steep forest ridges before emerging on the tea estate plateau. Moss-covered trees, mountain fynbos and panoramic views over the Tzaneen valley reward the effort. The trail system is among South Africa\'s best-maintained forest MTB.',
    discipline: 'mtb',
    difficulty: 'advanced',
    surface: 'singletrack',
    distance_km: 32,
    elevation_m: 780,
    est_time_min: 145,
    province: 'Limpopo',
    region: 'Mopani',
    town: 'Haenertsburg',
    lat: -23.9333,
    lng: 29.9167,
    tags: ['magoebaskloof', 'red-trail', 'afromontane-forest', 'kloofs', 'streams', 'tea-estate', 'technical'],
    is_featured: true,
  },
  {
    name: 'Magoebaskloof Pass Road Climb',
    slug: 'magoebaskloof-pass-road-climb',
    description:
      'The iconic Magoebaskloof Pass road climb — a 14 km ascent from the Tzaneen valley floor at 750 m to the Haenertsburg plateau at 1,450 m through South Africa\'s largest concentration of indigenous afromontane forest. The R71 pass road winds through mist-shrouded forest, past waterfalls and cycad groves. The descent back to Tzaneen is equally spectacular. A bucket-list Limpopo road climb rivalling any in the country.',
    discipline: 'road',
    difficulty: 'advanced',
    surface: 'tarmac',
    distance_km: 58,
    elevation_m: 1100,
    est_time_min: 145,
    province: 'Limpopo',
    region: 'Mopani',
    town: 'Haenertsburg',
    lat: -23.9333,
    lng: 29.9000,
    tags: ['magoebaskloof-pass', 'afromontane', 'R71', 'mist', 'waterfalls', 'cycads', 'iconic-climb'],
    is_featured: false,
  },

  // ══════════════════════════════════════════════════════════════════════
  // THABAZIMBI — WATERBERG
  // ══════════════════════════════════════════════════════════════════════

  {
    name: 'Thabazimbi Waterberg MTB Loop',
    slug: 'thabazimbi-waterberg-mtb-loop',
    description:
      'Technical MTB trails in the Waterberg Biosphere Reserve around Thabazimbi — a UNESCO Biosphere and one of Africa\'s most significant wildlife conservation areas. The trails navigate the rugged Waterberg sandstone ridges through mopane woodland, dense bushveld and open grassland on plateau tops. White rhino, leopard, cheetah and painted wolf (wild dog) are resident in the biosphere. Epic wilderness riding with serious wildlife encounters.',
    discipline: 'mtb',
    difficulty: 'advanced',
    surface: 'singletrack',
    distance_km: 45,
    elevation_m: 680,
    est_time_min: 185,
    province: 'Limpopo',
    region: 'Waterberg',
    town: 'Thabazimbi',
    lat: -24.5917,
    lng: 27.4000,
    tags: ['waterberg', 'UNESCO-biosphere', 'rhino', 'wild-dog', 'cheetah', 'sandstone', 'wilderness'],
    is_featured: true,
  },
  {
    name: 'Modimolle Nylsvlei Wetland Gravel',
    slug: 'modimolle-nylsvlei-wetland-gravel',
    description:
      'A gravel ride through the Nylsvlei Nature Reserve near Modimolle (Nylstroom) — one of South Africa\'s premier birding destinations and a Ramsar-listed wetland. The Nyl River floodplain floods seasonally, attracting over 400 bird species. The route follows the reserve perimeter on gravel farm roads with constant wetland and grassland birding. A peaceful, flat Limpopo gravel route perfect for birder-cyclists.',
    discipline: 'gravel',
    difficulty: 'beginner',
    surface: 'gravel',
    distance_km: 35,
    elevation_m: 120,
    est_time_min: 115,
    province: 'Limpopo',
    region: 'Waterberg',
    town: 'Modimolle',
    lat: -24.6833,
    lng: 28.4000,
    tags: ['nylsvlei', 'ramsar-wetland', 'birding', '400-species', 'flat', 'seasonal-flood', 'modimolle'],
    is_featured: false,
  },
  {
    name: 'Lephalale Mokolo Dam Gravel Loop',
    slug: 'lephalale-mokolo-dam-gravel',
    description:
      'A remote gravel loop around the Mokolo Dam near Lephalale (Ellisras) in north-west Limpopo. The dam supplies the Medupi Power Station and surrounding coal fields. The route follows farm and reserve management roads around the dam perimeter through dry mopane bushveld. Kudu, eland, giraffe and buffalo are common. A true remote Limpopo experience far from tourist routes with genuine Big Sky Africa wilderness.',
    discipline: 'gravel',
    difficulty: 'intermediate',
    surface: 'gravel',
    distance_km: 62,
    elevation_m: 310,
    est_time_min: 200,
    province: 'Limpopo',
    region: 'Waterberg',
    town: 'Lephalale',
    lat: -23.6833,
    lng: 27.7167,
    tags: ['mokolo-dam', 'lephalale', 'mopane', 'remote', 'big-sky', 'kudu', 'giraffe', 'coal-fields'],
    is_featured: false,
  },
  {
    name: 'Bela-Bela Hot Springs Road Loop',
    slug: 'bela-bela-hot-springs-road-loop',
    description:
      'A road loop based at Bela-Bela (Warmbaths) resort town — famous for its natural hot springs. The route heads north through the Waterberg foothills on the R516 towards Vaalwater before looping back via game farm roads and the R101. Rolling bushveld terrain, light traffic and the promise of a hot spring soak at the finish make this a beloved club ride and cycling holiday destination for Gauteng cyclists.',
    discipline: 'road',
    difficulty: 'intermediate',
    surface: 'tarmac',
    distance_km: 75,
    elevation_m: 620,
    est_time_min: 180,
    province: 'Limpopo',
    region: 'Waterberg',
    town: 'Bela-Bela',
    lat: -24.8833,
    lng: 28.2833,
    tags: ['bela-bela', 'hot-springs', 'warmbaths', 'R516', 'waterberg', 'club-holiday', 'spa-finish'],
    is_featured: false,
  },
  {
    name: 'Vaalwater and Melkrivier Gravel Safari',
    slug: 'vaalwater-melkrivier-gravel-safari',
    description:
      'A gravel safari through the Waterberg Biosphere\'s private game lodges between Vaalwater and Melkrivier. The route links the lodge access roads and biosphere conservation roads through rolling sandstone koppies and broad bushveld valleys. Cheetah, wild dog, rhino and lion are all resident in the biosphere. World-class game lodge scenery with premium gravel riding — this is the Waterberg at its most spectacular.',
    discipline: 'gravel',
    difficulty: 'intermediate',
    surface: 'gravel',
    distance_km: 68,
    elevation_m: 580,
    est_time_min: 220,
    province: 'Limpopo',
    region: 'Waterberg',
    town: 'Vaalwater',
    lat: -24.2833,
    lng: 27.9167,
    tags: ['vaalwater', 'melkrivier', 'waterberg-biosphere', 'cheetah', 'wild-dog', 'sandstone', 'premium'],
    is_featured: false,
  },
]

async function main() {
  console.log(`\n🌿 Seeding ${routes.length} Limpopo cycling routes...\n`)

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

  const [limp]    = await sql`SELECT COUNT(*) AS c FROM routes WHERE province = 'Limpopo'`
  const [withImg] = await sql`SELECT COUNT(*) AS c FROM routes WHERE province = 'Limpopo' AND hero_image_url IS NOT NULL`
  const [total]   = await sql`SELECT COUNT(*) AS c FROM routes`

  // Breakdown by region
  const regions = await sql`
    SELECT region, COUNT(*) AS c FROM routes
    WHERE province = 'Limpopo'
    GROUP BY region ORDER BY c DESC
  `

  console.log('\n──────────────────────────────────────────────────')
  console.log(`✅ Done: ${added} added | ${skipped} skipped | ${imagesUpdated} images updated`)
  console.log(`📊 Limpopo total:     ${limp.c}`)
  console.log(`📊 With hero image:   ${withImg.c}`)
  console.log(`📊 All routes total:  ${total.c}`)
  console.log('\n📍 By region:')
  regions.forEach((r: any) => console.log(`   ${r.region}: ${r.c}`))
}

main().catch(console.error)
