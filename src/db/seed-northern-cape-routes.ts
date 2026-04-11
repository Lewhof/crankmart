/**
 * Seed Northern Cape cycling routes + route_loops
 * Run: DATABASE_URL="..." npx tsx src/db/seed-northern-cape-routes.ts
 *
 * Covers: Upington, Kimberley additions, Colesberg, De Aar,
 * Pofadder, Loeriesfontein, Calvinia additions, Prieska, Douglas,
 * Namaqualand additions, Augrabies additions, Beaufort West border
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
  'upington-orange-river-road-loop':
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80',
  'kimberley-diamond-fields-road-loop':
    'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80',
  'namaqualand-namakwa-flower-gravel':
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80',
  'augrabies-gorge-gravel-safari':
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80',
  'tankwa-karoo-epic-gravel':
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200&q=80',
}

const data = [

  // ══════════════════════════════════════════════════════════════════════
  // UPINGTON — GREEN KALAHARI
  // ══════════════════════════════════════════════════════════════════════
  {
    route: {
      name: 'Upington Orange River Road Loop',
      slug: 'upington-orange-river-road-loop',
      description:
        'A scenic road loop from Upington along both banks of the Orange River — the lifeblood of the arid Northern Cape. The route crosses the Orange on the historic Upington bridge, follows the north bank through the Spitsdrift wine-grape estates and returns via the south bank through Louisvale and Keimoes approach roads. Date palms, vineyards and the glittering Orange River contrast dramatically with the surrounding red Kalahari dunes. A bucket-list Karoo road ride.',
      discipline: 'road', difficulty: 'intermediate', surface: 'tarmac',
      distance_km: 75, elevation_m: 280, est_time_min: 175,
      province: 'Northern Cape', region: 'ZF Mgcawu', town: 'Upington',
      lat: -28.4478, lng: 21.2561,
      tags: ['upington', 'orange-river', 'date-palms', 'vineyards', 'kalahari', 'louisvale', 'keimoes'],
      is_featured: true,
    },
    loops: [
      { name: 'Upington Short River Loop', distance_km: 30, difficulty: 'beginner', category: 'green', subtitle: 'Town + river bank', description: 'A flat 30 km loop along the Orange River banks closest to Upington. Date palms, vineyards and great river views. Easy and scenic.', display_order: 1 },
      { name: 'Upington Full River Loop', distance_km: 75, difficulty: 'intermediate', category: 'blue', subtitle: 'Both banks circuit', description: 'The full 75 km dual-bank loop crossing both Upington bridges and circling all the Orange River grape estates. The classic Upington ride.', display_order: 2 },
      { name: 'Upington Kalahari Extended', distance_km: 110, difficulty: 'advanced', category: 'red', subtitle: 'River + red dunes approach', description: 'Extended 110 km loop venturing into the red Kalahari dunes north of Upington before returning along the river. Epic Kalahari cycling.', display_order: 3 },
    ],
  },
  {
    route: {
      name: 'Kalahari Oranje-Senqu Gravel Loop',
      slug: 'kalahari-oranje-senqu-gravel-loop',
      description:
        'A remote gravel adventure through the Kalahari dunes north-west of Upington in the ZF Mgcawu district. The route follows farm tracks across the iconic red sand dunes of the Kalahari through camel-thorn acacia and grey camel-thorn woodland. The silence is absolute, the stars are extraordinary at night, and wildlife including gemsbok, springbok, red hartebeest and brown hyena are all resident. A serious remote gravel experience in one of the world\'s most distinct desert landscapes.',
      discipline: 'gravel', difficulty: 'advanced', surface: 'gravel',
      distance_km: 80, elevation_m: 320, est_time_min: 270,
      province: 'Northern Cape', region: 'ZF Mgcawu', town: 'Upington',
      lat: -28.2000, lng: 21.0000,
      tags: ['kalahari', 'red-dunes', 'gemsbok', 'camel-thorn', 'remote', 'silence', 'brown-hyena', 'stars'],
      is_featured: false,
    },
    loops: [
      { name: 'Kalahari Short Dune Loop', distance_km: 35, difficulty: 'intermediate', category: 'blue', subtitle: 'Red dune circuit', description: 'A 35 km loop through the nearest red dune fields. Soft sand sections alternate with harder camel-thorn tracks. Gemsbok sightings likely.', display_order: 1 },
      { name: 'Kalahari Epic Gravel', distance_km: 80, difficulty: 'advanced', category: 'red', subtitle: 'Full remote dune traverse', description: 'The full 80 km deep Kalahari loop. Self-sufficient riding required — no services. The real remote Northern Cape experience.', display_order: 2 },
    ],
  },
  {
    route: {
      name: 'Keimoes and Kakamas Wine Route Gravel',
      slug: 'keimoes-kakamas-wine-route-gravel',
      description:
        'A gravel meander through the Orange River wine estates between Keimoes and Kakamas — the heartland of South Africa\'s desert wine country. The route follows irrigation canal roads and farm tracks between vineyards, lucerne fields and the Orange River channels. The Spitsdrift, Orange River Cellars and Oranjerivier Co-op wineries are all accessible on this route. An unusual combination of Cape Dutch wine estate architecture and stark Kalahari desert surroundings.',
      discipline: 'gravel', difficulty: 'beginner', surface: 'gravel',
      distance_km: 45, elevation_m: 160, est_time_min: 150,
      province: 'Northern Cape', region: 'ZF Mgcawu', town: 'Keimoes',
      lat: -28.6833, lng: 20.9667,
      tags: ['keimoes', 'kakamas', 'wine-estates', 'orange-river', 'vineyards', 'irrigation-canals', 'desert-wine'],
      is_featured: false,
    },
    loops: [
      { name: 'Wine Estate Short Loop', distance_km: 20, difficulty: 'beginner', category: 'green', subtitle: 'Canal roads + vineyard circuit', description: 'A flat 20 km loop on the best-surfaced canal roads between the Orange River Cellars estates. Easy and very scenic.', display_order: 1 },
      { name: 'Keimoes Kakamas Full Loop', distance_km: 45, difficulty: 'beginner', category: 'blue', subtitle: 'Full wine route circuit', description: 'The complete 45 km wine route gravel loop linking all major estates between Keimoes and Kakamas. Perfect cycling holiday route.', display_order: 2 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // KIMBERLEY
  // ══════════════════════════════════════════════════════════════════════
  {
    route: {
      name: 'Kimberley Diamond Fields Road Loop',
      slug: 'kimberley-diamond-fields-road-loop',
      description:
        'A comprehensive road loop around Kimberley — the diamond capital of the world and birthplace of South Africa\'s mining industry. The route circles the iconic Big Hole (the world\'s largest hand-dug excavation), links the historical mining suburbs of Beaconsfield, Kenilworth and Belgravia and sweeps north through Bultfontein and Dutoitspan mine areas. De Beers mine infrastructure dominates the skyline throughout. A uniquely industrial-historical South African cycling experience.',
      discipline: 'road', difficulty: 'intermediate', surface: 'tarmac',
      distance_km: 68, elevation_m: 320, est_time_min: 160,
      province: 'Northern Cape', region: 'Frances Baard', town: 'Kimberley',
      lat: -28.7282, lng: 24.7499,
      tags: ['kimberley', 'big-hole', 'diamonds', 'de-beers', 'mining', 'beaconsfield', 'bultfontein', 'heritage'],
      is_featured: true,
    },
    loops: [
      { name: 'Big Hole Heritage Loop', distance_km: 28, difficulty: 'beginner', category: 'green', subtitle: 'Mining heritage circuit', description: 'A 28 km loop around the Big Hole and historic Kimberley mining suburbs. Flat, accessible and rich in diamond-rush history.', display_order: 1 },
      { name: 'Kimberley City Loop', distance_km: 68, difficulty: 'intermediate', category: 'blue', subtitle: 'Full diamond fields circuit', description: 'The full 68 km city loop circling all four major diamond mines and the historic CBD. The definitive Kimberley cycling experience.', display_order: 2 },
      { name: 'Kimberley Extended Plains Loop', distance_km: 100, difficulty: 'advanced', category: 'red', subtitle: 'City + Barkly West approach', description: 'Extended 100 km loop adding the Barkly West alluvial diamond diggings on the Vaal River for a serious Karoo road effort.', display_order: 3 },
    ],
  },
  {
    route: {
      name: 'Barkly West Vaal River Diamond Diggings Gravel',
      slug: 'barkly-west-vaal-river-gravel',
      description:
        'A gravel ride along the Vaal River near Barkly West — the site of South Africa\'s first diamond discovery in 1867 (the Eureka diamond). The route follows the river bank on farm access roads through the historic alluvial diamond digging sites, still actively worked by small-scale diggers. The Vaal River gorge, ancient fig trees and the unchanged landscape of the 1860s diamond rush make this an extraordinary historical gravel ride.',
      discipline: 'gravel', difficulty: 'intermediate', surface: 'gravel',
      distance_km: 52, elevation_m: 240, est_time_min: 175,
      province: 'Northern Cape', region: 'Frances Baard', town: 'Barkly West',
      lat: -28.5333, lng: 24.5167,
      tags: ['barkly-west', 'eureka-diamond', 'vaal-river', 'diamond-diggings', 'alluvial', '1867', 'history', 'gorge'],
      is_featured: false,
    },
    loops: [
      { name: 'Barkly West Short Gravel', distance_km: 24, difficulty: 'beginner', category: 'green', subtitle: 'Vaal river bank loop', description: 'A 24 km loop along the most accessible Vaal River bank roads. Active diamond diggings visible throughout.', display_order: 1 },
      { name: 'Diamond Diggings Full Loop', distance_km: 52, difficulty: 'intermediate', category: 'blue', subtitle: 'Full historical circuit', description: 'The complete 52 km gravel circuit through all the major 1867 alluvial diamond sites on both sides of the Vaal.', display_order: 2 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // COLESBERG / DE AAR — KAROO CROSSROADS
  // ══════════════════════════════════════════════════════════════════════
  {
    route: {
      name: 'Colesberg Karoo Road Loop',
      slug: 'colesberg-karoo-road-loop',
      description:
        'A road loop from Colesberg — the crossroads of South Africa where the N1 meets the N9 and N10. The route heads into the Renosterberg mountains and loops through the sparse Karoo sheep farms on the R369 and district roads. Colesberg sits at the border of three provinces (NC, Free State, EC) and the Karoo landscape here is wide, flat-bottomed, ringed by dolerite koppies and utterly vast. A meditative Karoo road ride with no traffic.',
      discipline: 'road', difficulty: 'intermediate', surface: 'tarmac',
      distance_km: 65, elevation_m: 480, est_time_min: 160,
      province: 'Northern Cape', region: 'Pixley Ka Seme', town: 'Colesberg',
      lat: -30.7231, lng: 25.0975,
      tags: ['colesberg', 'karoo', 'renosterberg', 'N1-crossroads', 'dolerite-koppies', 'sheep-farms', 'three-provinces'],
      is_featured: false,
    },
    loops: [
      { name: 'Colesberg Short Karoo Loop', distance_km: 30, difficulty: 'beginner', category: 'green', subtitle: 'Town + koppies circuit', description: 'A 30 km loop through the dolerite koppies immediately around Colesberg. Great Karoo views with minimal traffic.', display_order: 1 },
      { name: 'Colesberg Renosterberg Loop', distance_km: 65, difficulty: 'intermediate', category: 'blue', subtitle: 'Full Renosterberg circuit', description: 'The full 65 km Karoo loop into the Renosterberg reserve approaches and back via sheep farm district roads.', display_order: 2 },
      { name: 'Colesberg Three-Province Epic', distance_km: 95, difficulty: 'advanced', category: 'red', subtitle: 'Three-province boundary ride', description: 'Extended 95 km loop crossing the Free State and Eastern Cape borders in a single ride — the only place in SA where you can do this on a bicycle.', display_order: 3 },
    ],
  },
  {
    route: {
      name: 'De Aar Karoo Plains Gravel',
      slug: 'de-aar-karoo-plains-gravel',
      description:
        'A remote gravel ride through the flat Karoo plains around De Aar — South Africa\'s largest railway junction and the windiest town in the country (wind farms surround it). The route follows farm service roads across the classic open Karoo with its short scrubby vegetation, dolerite koppies and unobstructed 360° horizons. The De Aar wind farm on the route\'s northern flank makes for dramatic cycling scenery.',
      discipline: 'gravel', difficulty: 'intermediate', surface: 'gravel',
      distance_km: 58, elevation_m: 210, est_time_min: 195,
      province: 'Northern Cape', region: 'Pixley Ka Seme', town: 'De Aar',
      lat: -30.6453, lng: 24.0072,
      tags: ['de-aar', 'karoo-plains', 'wind-farm', 'railway-junction', 'remote', '360-horizon', 'wind'],
      is_featured: false,
    },
    loops: [
      { name: 'De Aar Short Plains Loop', distance_km: 25, difficulty: 'beginner', category: 'green', subtitle: 'Local farm roads', description: 'A 25 km loop on the best-maintained farm roads around De Aar. Flat Karoo with wind turbine scenery.', display_order: 1 },
      { name: 'De Aar Wind Farm Loop', distance_km: 58, difficulty: 'intermediate', category: 'blue', subtitle: 'Full wind farm circuit', description: 'The 58 km loop circumnavigating the De Aar wind farm on farm service roads. Dramatic turbine scenery and fierce Karoo wind.', display_order: 2 },
    ],
  },
  {
    route: {
      name: 'Prieska Orange River Gravel',
      slug: 'prieska-orange-river-gravel',
      description:
        'A gravel ride from Prieska along the Orange River on the Northern Cape / Free State border. The route follows the Orange River bank through the unique Prieska Copper Mine landscape — Prieska has one of South Africa\'s richest copper and manganese deposits. Farm tracks and river bank roads link the mining infrastructure with the lush irrigated fields along the Orange River. Remote, industrial and beautiful.',
      discipline: 'gravel', difficulty: 'intermediate', surface: 'gravel',
      distance_km: 55, elevation_m: 260, est_time_min: 185,
      province: 'Northern Cape', region: 'ZF Mgcawu', town: 'Prieska',
      lat: -29.6667, lng: 22.7500,
      tags: ['prieska', 'orange-river', 'copper-mine', 'manganese', 'industrial', 'border-ride', 'irrigation'],
      is_featured: false,
    },
    loops: [
      { name: 'Prieska Short River Loop', distance_km: 25, difficulty: 'beginner', category: 'green', subtitle: 'River bank circuit', description: 'A 25 km loop along the most accessible Orange River bank roads near Prieska. Flat, scenic and historically interesting.', display_order: 1 },
      { name: 'Prieska Mining Gravel Loop', distance_km: 55, difficulty: 'intermediate', category: 'blue', subtitle: 'River + copper mine circuit', description: 'The full 55 km loop incorporating the copper mine area and Orange River farming belt. Unique industrial-Karoo scenery.', display_order: 2 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // NAMAQUALAND ADDITIONS
  // ══════════════════════════════════════════════════════════════════════
  {
    route: {
      name: 'Namaqualand Namakwa Flower Gravel Loop',
      slug: 'namaqualand-namakwa-flower-gravel',
      description:
        'A spectacular gravel loop through the Namaqualand flower belt — one of the world\'s great natural spectacles during August/September when millions of wild flowers carpet the semi-arid plains. The route from Springbok links the Skilpad Wildflower Reserve (Namaqua NP), the Loeriesfontein area and the granite koppies of the Hantam region. Orange gazanias, purple vygies and yellow daisies transform the usually austere Karoo landscape into a riot of colour.',
      discipline: 'gravel', difficulty: 'advanced', surface: 'gravel',
      distance_km: 95, elevation_m: 720, est_time_min: 310,
      province: 'Northern Cape', region: 'Namakwa', town: 'Springbok',
      lat: -29.6647, lng: 17.8865,
      tags: ['namaqualand', 'wildflowers', 'skilpad', 'gazania', 'vygie', 'flower-season', 'hantam', 'namakwa-NP'],
      is_featured: true,
    },
    loops: [
      { name: 'Flower Route Short Loop', distance_km: 35, difficulty: 'intermediate', category: 'blue', subtitle: 'Skilpad + koppies circuit', description: 'A 35 km loop through the Skilpad Wildflower Reserve and surrounding granite koppies. Best ridden Aug–Sep during flower season.', display_order: 1 },
      { name: 'Namaqualand Full Gravel', distance_km: 95, difficulty: 'advanced', category: 'red', subtitle: 'Full flower belt circuit', description: 'The epic 95 km loop through the complete Namaqualand flower belt. A once-in-a-lifetime cycling experience during flower season.', display_order: 2 },
    ],
  },
  {
    route: {
      name: 'Loeriesfontein Wind Farm Gravel',
      slug: 'loeriesfontein-wind-farm-gravel',
      description:
        'A gravel ride through the Loeriesfontein area of the Hantam Karoo — home to two of South Africa\'s largest wind farms (Loeriesfontein 1 & 2, totalling 200 turbines). The route links the wind farm access roads through the open Karoo scrubland with 360° views over the semi-arid plains. The Hantam National Botanical Garden near Calvinia is an optional extension. A unique Karoo gravel experience dominated by the scale of the wind energy infrastructure.',
      discipline: 'gravel', difficulty: 'intermediate', surface: 'gravel',
      distance_km: 60, elevation_m: 350, est_time_min: 200,
      province: 'Northern Cape', region: 'Namakwa', town: 'Loeriesfontein',
      lat: -30.9833, lng: 19.4333,
      tags: ['loeriesfontein', 'wind-farm', '200-turbines', 'hantam-karoo', 'renewable-energy', 'open-plains', 'hantam-garden'],
      is_featured: false,
    },
    loops: [
      { name: 'Wind Farm Short Loop', distance_km: 28, difficulty: 'beginner', category: 'green', subtitle: 'Turbine circuit', description: 'A 28 km loop through the nearest wind farm access roads. Flat to rolling Karoo with dramatic turbine scenery.', display_order: 1 },
      { name: 'Loeriesfontein Full Gravel', distance_km: 60, difficulty: 'intermediate', category: 'blue', subtitle: 'Full wind farm circuit', description: 'The complete 60 km loop through both Loeriesfontein wind farms. Big Karoo sky and 200 turbines make this a uniquely dramatic ride.', display_order: 2 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // AUGRABIES / GREEN KALAHARI ADDITIONS
  // ══════════════════════════════════════════════════════════════════════
  {
    route: {
      name: 'Augrabies Gorge Gravel Safari',
      slug: 'augrabies-gorge-gravel-safari',
      description:
        'A gravel safari through the Augrabies Falls National Park — home to the Orange River\'s thundering 56 m main falls and an 18 km granite gorge. The park\'s internal gravel roads wind through quiver tree (kokerboom) forest, moon landscape rock formations and the gorge rim with views down into the churning Orange River. Klipspringer, gemsbok and black rhino are resident in the park. One of South Africa\'s most dramatic and alien cycling landscapes.',
      discipline: 'gravel', difficulty: 'intermediate', surface: 'gravel',
      distance_km: 48, elevation_m: 380, est_time_min: 165,
      province: 'Northern Cape', region: 'ZF Mgcawu', town: 'Augrabies Falls',
      lat: -28.5953, lng: 20.3406,
      tags: ['augrabies', 'quiver-tree', 'gorge', 'orange-river', 'black-rhino', 'moon-landscape', 'waterfall', 'national-park'],
      is_featured: true,
    },
    loops: [
      { name: 'Augrabies Short Park Loop', distance_km: 20, difficulty: 'beginner', category: 'green', subtitle: 'Falls + quiver tree forest', description: 'A 20 km loop past the main falls viewpoints and through the kokerboom quiver tree forest. The most accessible Augrabies cycling experience.', display_order: 1 },
      { name: 'Augrabies Gorge Loop', distance_km: 35, difficulty: 'intermediate', category: 'blue', subtitle: 'Full gorge rim circuit', description: 'The 35 km gorge rim loop with dramatic views down into the Orange River chasm. Klipspringer on the rocks throughout.', display_order: 2 },
      { name: 'Augrabies Full Safari', distance_km: 48, difficulty: 'advanced', category: 'red', subtitle: 'Complete park circuit', description: 'The full 48 km park circuit including the remote southern sections with black rhino territory. Guide recommended.', display_order: 3 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // TANKWA KAROO EXPANSION
  // ══════════════════════════════════════════════════════════════════════
  {
    route: {
      name: 'Tankwa Karoo Epic Gravel',
      slug: 'tankwa-karoo-epic-gravel',
      description:
        'One of South Africa\'s hardest and most celebrated gravel routes — the Tankwa Karoo. The route traverses the Tankwa Karoo National Park and surrounding farm roads through what many consider the most remote and desolate landscape in the country. The Ouberg Pass (one of SA\'s most dramatic mountain passes), Matjiesfontein salt pan and the Wolfskop section define this epic. Burnbrae Pass and the Nieuwoudtville plateau complete a circuit used by the Tankwa Gravel Race.',
      discipline: 'gravel', difficulty: 'expert', surface: 'gravel',
      distance_km: 130, elevation_m: 1850, est_time_min: 450,
      province: 'Northern Cape', region: 'Namakwa', town: 'Calvinia',
      lat: -32.1333, lng: 19.7833,
      tags: ['tankwa-karoo', 'ouberg-pass', 'burnbrae', 'wolfskop', 'expert', 'remote', 'race-route', 'epic', 'two-day'],
      is_featured: true,
    },
    loops: [
      { name: 'Tankwa Short Loop', distance_km: 45, difficulty: 'advanced', category: 'blue', subtitle: 'Ouberg Pass + salt pan', description: 'A 45 km loop over the Ouberg Pass and through the Matjiesfontein salt pan. A serious undertaking requiring self-sufficiency.', display_order: 1 },
      { name: 'Tankwa Classic Loop', distance_km: 90, difficulty: 'expert', category: 'red', subtitle: 'Wolfskop + Burnbrae circuit', description: 'The 90 km race circuit including Wolfskop and Burnbrae Pass. The benchmark Tankwa Karoo one-day gravel challenge.', display_order: 2 },
      { name: 'Tankwa Epic Two-Day', distance_km: 130, difficulty: 'expert', category: 'black', subtitle: 'Full national park traverse', description: 'The full 130 km two-day traverse of the Tankwa Karoo National Park. Water carrying critical — no services. A once-in-a-lifetime gravel experience.', display_order: 3 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // SUTHERLAND ADDITION
  // ══════════════════════════════════════════════════════════════════════
  {
    route: {
      name: 'Sutherland Astronomy Road Loop',
      slug: 'sutherland-astronomy-road-loop',
      description:
        'A road loop from Sutherland — the coldest town in South Africa (minimum temps of -20°C in winter) and home to the South African Large Telescope (SALT), the largest optical telescope in the Southern Hemisphere. The route circles the observatory plateau on the Roggeveld escarpment at 1,450 m with extraordinary Karoo views and the giant telescope domes visible throughout. Best cycled in summer to avoid extreme cold.',
      discipline: 'road', difficulty: 'intermediate', surface: 'tarmac',
      distance_km: 55, elevation_m: 620, est_time_min: 140,
      province: 'Northern Cape', region: 'Karoo Hoogland', town: 'Sutherland',
      lat: -32.3667, lng: 20.6667,
      tags: ['sutherland', 'SALT', 'telescope', 'roggeveld', 'observatory', 'coldest-town', 'astronomy', 'escarpment'],
      is_featured: false,
    },
    loops: [
      { name: 'Sutherland Short Loop', distance_km: 25, difficulty: 'beginner', category: 'green', subtitle: 'Observatory circuit', description: 'A 25 km loop around the observatory plateau with SALT dome views. Best ridden at sunset for stargazing preparation.', display_order: 1 },
      { name: 'Sutherland Roggeveld Loop', distance_km: 55, difficulty: 'intermediate', category: 'blue', subtitle: 'Full plateau circuit', description: 'The full 55 km Roggeveld escarpment loop with 360° Karoo panoramas and the observatory complex as a constant landmark.', display_order: 2 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // RICHTERSVELD / NAMAQUALAND COAST
  // ══════════════════════════════════════════════════════════════════════
  {
    route: {
      name: 'Port Nolloth Namaqualand Coast Road',
      slug: 'port-nolloth-namaqualand-coast-road',
      description:
        'A wild coastal road ride along the Namaqualand / Richtersveld Atlantic coast between Port Nolloth and Alexander Bay — the most remote stretch of cycling coastline in South Africa. The N7 coastal road hugs the cold Atlantic with offshore diamond mining vessels visible at sea, massive sand dunes rolling to the water\'s edge and the Orange River mouth at Alexander Bay. Fierce Atlantic winds, cold fog and extraordinary desolation define this unique cycling experience.',
      discipline: 'road', difficulty: 'advanced', surface: 'tarmac',
      distance_km: 80, elevation_m: 420, est_time_min: 210,
      province: 'Northern Cape', region: 'Namakwa', town: 'Port Nolloth',
      lat: -29.2517, lng: 16.8683,
      tags: ['port-nolloth', 'alexander-bay', 'namaqualand-coast', 'diamond-mining', 'Atlantic', 'fog', 'desolate', 'orange-river-mouth'],
      is_featured: false,
    },
    loops: [
      { name: 'Port Nolloth Short Coastal', distance_km: 30, difficulty: 'intermediate', category: 'blue', subtitle: 'Harbour + dune circuit', description: 'A 30 km loop from Port Nolloth harbour through the diamond dunes. Cold, windy and extraordinarily desolate.', display_order: 1 },
      { name: 'Namaqualand Coast Full Ride', distance_km: 80, difficulty: 'advanced', category: 'red', subtitle: 'Alexander Bay + Orange mouth', description: 'The full 80 km coastal road to Alexander Bay and the Orange River mouth. One of South Africa\'s most remote road rides.', display_order: 2 },
    ],
  },
]

async function main() {
  console.log(`\n🏜️  Seeding ${data.length} Northern Cape routes + loops...\n`)

  let routesAdded = 0, routesSkipped = 0, loopsAdded = 0, loopsSkipped = 0

  for (const { route: r, loops } of data) {
    let routeId: string
    const exists = await sql`SELECT id FROM routes WHERE slug = ${r.slug}`

    if (exists.length > 0) {
      routeId = exists[0].id
      console.log(`  ⏭  SKIP route: ${r.name}`)
      routesSkipped++
    } else {
      const heroImg = heroImages[r.slug] || null
      const [ins] = await sql`
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
        ) RETURNING id
      `
      routeId = ins.id
      console.log(`  ✅ ${r.name}${heroImg ? ' 🖼' : ''}`)
      routesAdded++
    }

    for (const loop of loops) {
      const le = await sql`SELECT id FROM route_loops WHERE route_id = ${routeId} AND name = ${loop.name}`
      if (le.length > 0) { loopsSkipped++; continue }
      await sql`
        INSERT INTO route_loops (route_id, name, distance_km, difficulty, category, subtitle, description, display_order)
        VALUES (
          ${routeId}, ${loop.name}, ${loop.distance_km},
          ${loop.difficulty}::route_difficulty, ${loop.category},
          ${loop.subtitle}, ${loop.description}, ${loop.display_order}
        )
      `
      console.log(`     🔁 ${loop.name} (${loop.distance_km} km · ${loop.category})`)
      loopsAdded++
    }
  }

  // Also add loops to existing NC routes that have none
  console.log('\n  🔍 Checking existing NC routes for missing loops...')
  const existing = await sql`
    SELECT r.id, r.name, r.slug FROM routes r
    WHERE r.province = 'Northern Cape'
    AND NOT EXISTS (SELECT 1 FROM route_loops rl WHERE rl.route_id = r.id)
  `
  if (existing.length > 0) {
    console.log(`  ⚠️  ${existing.length} existing NC routes still have no loops:`)
    existing.forEach((r: any) => console.log(`     - ${r.name}`))
  } else {
    console.log('  ✅ All NC routes have loops!')
  }

  const [nc]       = await sql`SELECT COUNT(*) AS c FROM routes WHERE province = 'Northern Cape'`
  const [ncLoops]  = await sql`SELECT COUNT(rl.id) AS c FROM route_loops rl JOIN routes r ON r.id=rl.route_id WHERE r.province='Northern Cape'`
  const [total]    = await sql`SELECT COUNT(*) AS c FROM routes`
  const [allLoops] = await sql`SELECT COUNT(*) AS c FROM route_loops`

  console.log('\n──────────────────────────────────────────────────')
  console.log(`✅ Routes: ${routesAdded} added | ${routesSkipped} skipped`)
  console.log(`🔁 Loops:  ${loopsAdded} added | ${loopsSkipped} skipped`)
  console.log(`📊 Northern Cape routes:   ${nc.c}`)
  console.log(`📊 Northern Cape loops:    ${ncLoops.c}`)
  console.log(`📊 All routes total:       ${total.c}`)
  console.log(`📊 All route_loops total:  ${allLoops.c}`)
}

main().catch(console.error)
