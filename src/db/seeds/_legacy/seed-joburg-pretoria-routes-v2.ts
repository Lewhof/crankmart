/**
 * Seed Johannesburg & Pretoria cycling routes — v2 (additional)
 * Research-based: well-known named loops, event routes, club rides, MTB parks
 * Run: DATABASE_URL="..." npx tsx src/db/seed-joburg-pretoria-routes-v2.ts
 */
import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

const envFile = readFileSync('.env.local', 'utf-8')
for (const line of envFile.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && v.length) process.env[k.trim()] = v.join('=').trim()
}

const sql = neon(process.env.DATABASE_URL!)

const routes = [

  // ══════════════════════════════════════════════════════════════════════
  // JOBURG — CLASSIC ROAD LOOPS (named by Joburg cycling community)
  // ══════════════════════════════════════════════════════════════════════

  {
    name: 'The Cradle Loop (Classic 100)',
    slug: 'the-cradle-loop-classic-100',
    description:
      'The definitive Joburg "big ride" — a 100 km road loop from Northcliff or Randburg through Muldersdrift, Lanseria and the Cradle of Humankind before returning via Hekpoort or Magaliesberg Road. The route passes through pristine Highveld bushveld, game farm roads and the rolling dolomite hills surrounding the UNESCO World Heritage Site. A rite of passage for any Joburg road cyclist and a favourite Saturday club ride.',
    discipline: 'road',
    difficulty: 'advanced',
    surface: 'tarmac',
    distance_km: 102,
    elevation_m: 1240,
    est_time_min: 250,
    province: 'Gauteng',
    region: 'West Rand',
    town: 'Muldersdrift',
    lat: -26.0167,
    lng: 27.8333,
    tags: ['cradle', 'classic-100', 'club-ride', 'UNESCO', 'bushveld', 'saturday-ride', 'iconic'],
    is_featured: true,
  },
  {
    name: 'Allandale Road Time Trial Loop',
    slug: 'allandale-road-time-trial-loop',
    description:
      'A flat, fast out-and-back course on Allandale Road between Midrand and the N14 — Joburg\'s most popular time trial venue. Cycling clubs including EWCC and Kyalami Race Club run regular time trials here on weekday evenings. The dual carriageway is wide, smooth and almost perfectly flat, making it the benchmark for TT training in Gauteng. Best ridden at dusk when traffic eases.',
    discipline: 'road',
    difficulty: 'beginner',
    surface: 'tarmac',
    distance_km: 20,
    elevation_m: 40,
    est_time_min: 35,
    province: 'Gauteng',
    region: 'City of Johannesburg',
    town: 'Midrand',
    lat: -25.9500,
    lng: 28.1167,
    tags: ['time-trial', 'flat', 'allandale', 'EWCC', 'training', 'evening-ride', 'clubs'],
    is_featured: false,
  },
  {
    name: 'Chartwell and Broadacres Farm Loop',
    slug: 'chartwell-broadacres-farm-loop',
    description:
      'A popular weekend road loop through the smallholdings and equestrian estates north of Johannesburg between Chartwell, Broadacres and Hennops River. Light traffic, shaded farm roads and gentle climbs through horse country make this a favourite for Sandton and Fourways riders wanting a rural feel without driving far. Several coffee stops at Broadacres and Cedar Square shopping centres on the return.',
    discipline: 'road',
    difficulty: 'beginner',
    surface: 'tarmac',
    distance_km: 46,
    elevation_m: 310,
    est_time_min: 105,
    province: 'Gauteng',
    region: 'City of Johannesburg',
    town: 'Fourways',
    lat: -25.9750,
    lng: 28.0000,
    tags: ['smallholdings', 'equestrian', 'chartwell', 'fourways', 'coffee-stop', 'light-traffic'],
    is_featured: false,
  },
  {
    name: 'Vereeniging and Vaal River Road Loop',
    slug: 'vereeniging-vaal-river-road-loop',
    description:
      'A scenic road loop south of Joburg following the Vaal River between Vereeniging and Vanderbijlpark. The route crosses the Vaal at Sasolburg and loops back along the northern bank through Meyerton and Three Rivers. Flat riverside roads, wide skies and the tranquil Vaal Dam approach make this a refreshing contrast to busy Joburg. A favourite escape for south Joburg and Vaal Triangle cyclists.',
    discipline: 'road',
    difficulty: 'beginner',
    surface: 'tarmac',
    distance_km: 65,
    elevation_m: 180,
    est_time_min: 140,
    province: 'Gauteng',
    region: 'Sedibeng',
    town: 'Vereeniging',
    lat: -26.6736,
    lng: 27.9319,
    tags: ['vaal-river', 'flat', 'riverside', 'south-joburg', 'vaal-dam', 'scenic'],
    is_featured: false,
  },
  {
    name: 'Parys Gravel and Vredefort Dome Loop',
    slug: 'parys-gravel-vredefort-dome-loop',
    description:
      'An epic gravel adventure through the Vredefort Dome — the world\'s largest verified meteorite impact crater and a UNESCO World Heritage Site — starting from Parys on the Vaal River. Farm roads and dirt tracks wind through the distinctive curved rock formations of the dome structure, crossing the Vaal River at multiple points. A bucket-list Gauteng gravel ride with extraordinary geological scenery.',
    discipline: 'gravel',
    difficulty: 'advanced',
    surface: 'gravel',
    distance_km: 85,
    elevation_m: 680,
    est_time_min: 260,
    province: 'Gauteng',
    region: 'Sedibeng',
    town: 'Parys',
    lat: -26.9083,
    lng: 27.4583,
    tags: ['vredefort-dome', 'UNESCO', 'meteorite', 'vaal-river', 'parys', 'geological', 'epic'],
    is_featured: true,
  },
  {
    name: 'Heidelberg Suikerbosrand Road and Gravel',
    slug: 'heidelberg-suikerbosrand-road-gravel',
    description:
      'A mixed road and gravel route looping the Suikerbosrand Nature Reserve south-east of Joburg from Heidelberg town. The route follows the reserve boundary on farm roads and reserve management tracks, climbing the distinctive quartzite ridges of the Suikerbosrand for Highveld panoramas. Wildlife including blesbuck, kudu and zebra are frequently sighted along the reserve fence. A genuine rural escape within 60 km of Joburg.',
    discipline: 'gravel',
    difficulty: 'intermediate',
    surface: 'mixed',
    distance_km: 60,
    elevation_m: 640,
    est_time_min: 185,
    province: 'Gauteng',
    region: 'Sedibeng',
    town: 'Heidelberg',
    lat: -26.5000,
    lng: 28.3583,
    tags: ['suikerbosrand', 'nature-reserve', 'wildlife', 'quartzite', 'rural', 'heidelberg'],
    is_featured: false,
  },
  {
    name: 'Soweto Cycling Tour Route',
    slug: 'soweto-cycling-tour-full',
    description:
      'The full route of the annual Soweto Cycling Tour — a 90 km event that takes riders through the townships of Soweto, from Orlando to Diepkloof, Meadowlands and Dobsonville before looping back via Jabulani and Naledi. An extraordinary urban cycling experience through the heartbeat of South African history. The event draws thousands annually and the street atmosphere is electric.',
    discipline: 'road',
    difficulty: 'intermediate',
    surface: 'tarmac',
    distance_km: 90,
    elevation_m: 580,
    est_time_min: 215,
    province: 'Gauteng',
    region: 'City of Johannesburg',
    town: 'Soweto',
    lat: -26.2678,
    lng: 27.8546,
    tags: ['soweto', 'tour', 'event', 'history', 'community', 'urban', 'annual'],
    is_featured: true,
  },
  {
    name: 'Northcliff Ridge Sunrise Ride',
    slug: 'northcliff-ridge-sunrise-ride',
    description:
      'A short but punchy road loop from Northcliff centred on the Northcliff Hill climb — one of Joburg\'s most iconic road cycling efforts. The Northcliff Ridge rises 200 m above the western suburbs with 360-degree Joburg skyline views from the water tower. The loop descends through Northcliff Extension 4 and Fairland before a final climb back over the ridge. Perfect for pre-sunrise or early morning club groups.',
    discipline: 'road',
    difficulty: 'intermediate',
    surface: 'tarmac',
    distance_km: 28,
    elevation_m: 420,
    est_time_min: 65,
    province: 'Gauteng',
    region: 'City of Johannesburg',
    town: 'Northcliff',
    lat: -26.1167,
    lng: 27.9583,
    tags: ['northcliff', 'ridge-climb', 'sunrise', 'iconic', 'short-loop', 'city-views'],
    is_featured: false,
  },

  // ══════════════════════════════════════════════════════════════════════
  // JOBURG — MTB (additional parks and trails)
  // ══════════════════════════════════════════════════════════════════════

  {
    name: 'Dinokeng Game Reserve MTB',
    slug: 'dinokeng-game-reserve-mtb',
    description:
      'Big Five MTB riding in the Dinokeng Game Reserve north of Pretoria. The reserve spans 18,000 hectares of bushveld north of Tembisa and hosts lion, elephant, rhino, leopard and buffalo — making this one of the few places on Earth where you can mountain bike among Africa\'s Big Five. Guided MTB trails of 20–50 km navigate the reserve on gravel roads and management tracks.',
    discipline: 'mtb',
    difficulty: 'intermediate',
    surface: 'gravel',
    distance_km: 35,
    elevation_m: 280,
    est_time_min: 120,
    province: 'Gauteng',
    region: 'Tshwane',
    town: 'Hammanskraal',
    lat: -25.6333,
    lng: 28.3167,
    tags: ['big-five', 'lion', 'elephant', 'rhino', 'game-reserve', 'guided', 'bucket-list', 'dinokeng'],
    is_featured: true,
  },
  {
    name: 'Bapsfontein Lakeside MTB',
    slug: 'bapsfontein-lakeside-mtb',
    description:
      'Beginner-friendly MTB trails around the Bapsfontein smallholding areas east of Joburg. The route circles Rietvlei Dam (east Rand) and links several farm trail networks through the Ekurhuleni greenbelt. Flat to rolling terrain with some rocky koppie sections, excellent for families and riders building MTB skills. Multiple coffee-stop options at the Bapsfontein Country Market on weekends.',
    discipline: 'mtb',
    difficulty: 'beginner',
    surface: 'singletrack',
    distance_km: 18,
    elevation_m: 140,
    est_time_min: 70,
    province: 'Gauteng',
    region: 'Ekurhuleni',
    town: 'Bapsfontein',
    lat: -26.0833,
    lng: 28.3833,
    tags: ['lakeside', 'family', 'beginners', 'east-rand', 'greenbelt', 'market', 'bapsfontein'],
    is_featured: false,
  },
  {
    name: 'Rietvlei Dam MTB and Gravel Loop',
    slug: 'rietvlei-dam-mtb-gravel-loop',
    description:
      'A mixed MTB and gravel loop circumnavigating the Rietvlei Dam Nature Reserve south of Pretoria. The reserve hosts white rhino, hippo, cheetah and abundant birdlife. The route follows the dam wall, dam perimeter management roads and open grassland tracks through 4,000 hectares of pristine Highveld. A unique combination of wildlife immersion and cycling within 20 km of Pretoria CBD.',
    discipline: 'gravel',
    difficulty: 'intermediate',
    surface: 'mixed',
    distance_km: 32,
    elevation_m: 220,
    est_time_min: 105,
    province: 'Gauteng',
    region: 'Tshwane',
    town: 'Pretoria South',
    lat: -25.8917,
    lng: 28.2833,
    tags: ['rietvlei', 'dam', 'rhino', 'hippo', 'cheetah', 'nature-reserve', 'pretoria'],
    is_featured: false,
  },
  {
    name: 'Leeupan MTB and Wetland Trail',
    slug: 'leeupan-mtb-wetland-trail',
    description:
      'MTB trails around the Leeupan Wetland near Brakpan on the East Rand. The wetland is one of Gauteng\'s premier birding spots and a Ramsar-listed site. The route follows tracks around the reed-fringed lake through open Highveld grassland with sweeping sky views. A flat, accessible MTB loop popular with birdwatchers and cyclists wanting a peaceful East Rand escape.',
    discipline: 'mtb',
    difficulty: 'beginner',
    surface: 'singletrack',
    distance_km: 16,
    elevation_m: 80,
    est_time_min: 60,
    province: 'Gauteng',
    region: 'Ekurhuleni',
    town: 'Brakpan',
    lat: -26.2333,
    lng: 28.3500,
    tags: ['wetland', 'ramsar', 'birdwatching', 'flat', 'east-rand', 'accessible', 'leeupan'],
    is_featured: false,
  },

  // ══════════════════════════════════════════════════════════════════════
  // PRETORIA — ADDITIONAL LOOPS
  // ══════════════════════════════════════════════════════════════════════

  {
    name: 'Roodeplaat Dam and Pienaarspoort Loop',
    slug: 'roodeplaat-dam-pienaarspoort-loop',
    description:
      'A classic Pretoria road loop heading north-east through Pienaarspoort Pass and looping the Roodeplaat Dam. The Pienaarspoort gorge section cuts through the Magaliesberg quartzite ridges in a dramatic narrow pass above the Pienaars River. The route continues to Roodeplaat Dam — Pretoria\'s main water supply — before returning via the R513. Rocky gorge scenery and open bushveld make this one of Pretoria\'s finest road rides.',
    discipline: 'road',
    difficulty: 'intermediate',
    surface: 'tarmac',
    distance_km: 72,
    elevation_m: 780,
    est_time_min: 175,
    province: 'Gauteng',
    region: 'Tshwane',
    town: 'Pretoria East',
    lat: -25.6500,
    lng: 28.3833,
    tags: ['pienaarspoort', 'pass', 'gorge', 'roodeplaat-dam', 'quartzite', 'classic', 'pretoria'],
    is_featured: true,
  },
  {
    name: 'Bela-Bela (Warmbaths) Road Escape',
    slug: 'bela-bela-warmbaths-road-escape',
    description:
      'A long-distance road escape from Pretoria north to Bela-Bela (Warmbaths) on the N1. The 120 km route follows the old Bela-Bela Road through Hammanskraal and the Limpopo bushveld transitional zone. The reward is a hot spring soak at the destination. The return trip via the R101 adds scenic farm roads through Nylstroom (Modimolle) country. Popular for Pretoria cycling clubs\' overnight rides.',
    discipline: 'road',
    difficulty: 'advanced',
    surface: 'tarmac',
    distance_km: 120,
    elevation_m: 680,
    est_time_min: 290,
    province: 'Gauteng',
    region: 'Tshwane',
    town: 'Pretoria North',
    lat: -25.5500,
    lng: 28.2000,
    tags: ['bela-bela', 'warmbaths', 'hot-springs', 'long-distance', 'overnight', 'escape', 'N1'],
    is_featured: false,
  },
  {
    name: 'Bronkhorstspruit Dam Gravel Loop',
    slug: 'bronkhorstspruit-dam-gravel-loop',
    description:
      'A gravel loop around the Bronkhorstspruit Dam east of Pretoria — one of Gauteng\'s largest dams and a popular weekend escape. The route follows farm roads and reserve management tracks around the dam perimeter through bushveld and open Highveld. Water bird sightings, fishing spots and quiet farm gates characterise the route. A long, peaceful gravel ride well away from metro traffic.',
    discipline: 'gravel',
    difficulty: 'intermediate',
    surface: 'gravel',
    distance_km: 68,
    elevation_m: 420,
    est_time_min: 200,
    province: 'Gauteng',
    region: 'Tshwane East',
    town: 'Bronkhorstspruit',
    lat: -25.8000,
    lng: 28.7500,
    tags: ['dam', 'bushveld', 'waterbirds', 'gravel', 'east-pretoria', 'quiet', 'rural'],
    is_featured: false,
  },
  {
    name: 'Pretoria West Magaliesberg Foothills Loop',
    slug: 'pretoria-west-magaliesberg-foothills-loop',
    description:
      'A road loop from Pretoria West through the farms and smallholdings along the Magaliesberg foothills towards Brits. The route follows the R512 through game farms and citrus estates before turning into the hills via Hekpoort Road and returning via the R27 Rustenburg Road. Views into the ancient Magaliesberg valley are spectacular and traffic is light after leaving the suburbs.',
    discipline: 'road',
    difficulty: 'intermediate',
    surface: 'tarmac',
    distance_km: 88,
    elevation_m: 860,
    est_time_min: 210,
    province: 'Gauteng',
    region: 'Tshwane',
    town: 'Pretoria West',
    lat: -25.7333,
    lng: 27.9833,
    tags: ['magaliesberg', 'foothills', 'R512', 'game-farms', 'citrus', 'brits', 'scenic'],
    is_featured: false,
  },
  {
    name: 'Soutpansberg Pass Road Climb',
    slug: 'soutpansberg-pass-road-climb',
    description:
      'A challenging road climbing route from Pretoria North up the Soutpansberg/Balmoral area through Maubane and the Springbokvlakte plateau. The pass climbs steeply out of the Apies River valley onto the Highveld escarpment with open grassland views. A sustained 15 km effort taking riders from 1,000 m to over 1,500 m elevation. One of Pretoria\'s hardest local climbs used for altitude training.',
    discipline: 'road',
    difficulty: 'advanced',
    surface: 'tarmac',
    distance_km: 55,
    elevation_m: 980,
    est_time_min: 145,
    province: 'Gauteng',
    region: 'Tshwane',
    town: 'Pretoria North',
    lat: -25.5833,
    lng: 28.2167,
    tags: ['climb', 'pass', 'altitude', 'highveld', 'training', 'escarpment', 'challenging'],
    is_featured: false,
  },

  // ══════════════════════════════════════════════════════════════════════
  // SHARED JOBURG ↔ PRETORIA EVENT & SPORTIVE ROUTES
  // ══════════════════════════════════════════════════════════════════════

  {
    name: 'Cape Town Cycle Tour Training Route (Joburg)',
    slug: 'cape-town-cycle-tour-training-joburg',
    description:
      'The standard Joburg preparation route used by cyclists training for the Cape Town Cycle Tour. The 105 km loop replicates the CTCT\'s elevation profile: starting flat through Midrand and Kyalami, adding steady climbs through Muldersdrift and returning via the Magaliesberg Road. Most Joburg clubs run this route 8–10 weeks before the CTCT. The route closely mirrors the Cape\'s 109 km challenge on Highveld terrain.',
    discipline: 'road',
    difficulty: 'advanced',
    surface: 'tarmac',
    distance_km: 105,
    elevation_m: 1100,
    est_time_min: 255,
    province: 'Gauteng',
    region: 'City of Johannesburg',
    town: 'Johannesburg',
    lat: -26.0667,
    lng: 28.0167,
    tags: ['CTCT-training', 'cape-town-prep', '100km', 'club-ride', 'saturday', 'highveld'],
    is_featured: false,
  },
  {
    name: 'Joburg Inner City Heritage Cycling Route',
    slug: 'joburg-inner-city-heritage-cycling',
    description:
      'A guided urban cycling tour of Johannesburg\'s inner city heritage sites. The route links Constitution Hill, the Apartheid Museum, Newtown Cultural Precinct, Market Theatre, Gandhi Square and the Old Fort — all on bicycle. Largely flat through the CBD with some short sharp climbs on Bree Street and Twist Street. Best ridden early Sunday morning when roads are quiet. A unique perspective on South Africa\'s most complex city.',
    discipline: 'road',
    difficulty: 'beginner',
    surface: 'tarmac',
    distance_km: 22,
    elevation_m: 120,
    est_time_min: 75,
    province: 'Gauteng',
    region: 'City of Johannesburg',
    town: 'Johannesburg',
    lat: -26.2041,
    lng: 28.0473,
    tags: ['heritage', 'CBD', 'apartheid-museum', 'constitution-hill', 'newtown', 'guided', 'cultural'],
    is_featured: false,
  },
  {
    name: 'Magaliesberg Pass Cycling Classic',
    slug: 'magaliesberg-pass-cycling-classic',
    description:
      'The full Magaliesberg cycling classic loop from Pretoria or Joburg — a 130 km epic combining the R512, Magaliesberg Pass (Olifantsnek), the valley floor, and return via Schoemansville and Hartbeespoort. Three significant mountain pass climbs and the iconic Hartbeespoort Dam descent make this one of Gauteng\'s most complete road cycling challenges. A full-day effort requiring strong legs and good navigation.',
    discipline: 'road',
    difficulty: 'advanced',
    surface: 'tarmac',
    distance_km: 130,
    elevation_m: 1680,
    est_time_min: 320,
    province: 'Gauteng',
    region: 'West Rand',
    town: 'Hekpoort',
    lat: -25.9667,
    lng: 27.7167,
    tags: ['magaliesberg', 'olifantsnek', 'hartbeespoort', 'classic', 'epic', 'full-day', 'three-passes'],
    is_featured: true,
  },
  {
    name: 'Centurion Zwartkops Raceway Loop',
    slug: 'centurion-zwartkops-raceway-loop',
    description:
      'A popular Pretoria road loop based on Centurion, circling the Zwartkops Raceway and looping through Irene, Lyttelton and Doringkloof. The route is largely flat with one moderate climb at Nelmapius Drive. The Irene dairy section adds a pastoral feel. Weekly club time trials are held on this corridor by the Multiprint Cycling Club and Centurion Cycle Club, making it one of Pretoria\'s most ridden training roads.',
    discipline: 'road',
    difficulty: 'beginner',
    surface: 'tarmac',
    distance_km: 38,
    elevation_m: 190,
    est_time_min: 82,
    province: 'Gauteng',
    region: 'Tshwane',
    town: 'Centurion',
    lat: -25.8583,
    lng: 28.1917,
    tags: ['zwartkops', 'time-trial', 'club-ride', 'centurion', 'irene', 'training', 'flat'],
    is_featured: false,
  },
]

async function main() {
  console.log(`\n🚴 Seeding ${routes.length} additional Joburg & Pretoria routes...\n`)

  let added = 0
  let skipped = 0

  for (const r of routes) {
    const exists = await sql`SELECT id FROM routes WHERE slug = ${r.slug}`
    if (exists.length > 0) {
      console.log(`  ⏭  SKIP: ${r.name}`)
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

  const [gauteng]  = await sql`SELECT COUNT(*) AS c FROM routes WHERE province = 'Gauteng'`
  const [joburg]   = await sql`SELECT COUNT(*) AS c FROM routes WHERE region IN ('City of Johannesburg','Ekurhuleni','West Rand','Sedibeng')`
  const [tshwane]  = await sql`SELECT COUNT(*) AS c FROM routes WHERE region ILIKE '%tshwane%'`
  const [total]    = await sql`SELECT COUNT(*) AS c FROM routes`

  console.log('\n──────────────────────────────────────────────────')
  console.log(`✅ Done: ${added} added | ${skipped} skipped`)
  console.log(`📊 Gauteng total:   ${gauteng.c}`)
  console.log(`📊 Joburg area:     ${joburg.c}`)
  console.log(`📊 Pretoria area:   ${tshwane.c}`)
  console.log(`📊 All routes:      ${total.c}`)
}

main().catch(console.error)
