/**
 * Seeds Australia-scoped data so /au/* pages aren't empty on launch day.
 *
 * Usage:
 *   npx tsx scripts/seed-au.ts           # seed everything
 *   npx tsx scripts/seed-au.ts --dry     # print counts only
 *
 * Idempotent per slug — re-running won't duplicate. Seed sellers use deterministic
 * emails so re-runs find existing users and re-use them.
 */

import { neon } from '@neondatabase/serverless'
import { randomUUID } from 'crypto'

// ─── Shops (60) ─────────────────────────────────────────────────────────
// Curated from public Australian bike-retailer store locators (Giant, Trek,
// Specialized dealer networks, 99 Bikes chain, major independents per state).
interface ShopSeed {
  name: string
  slug: string
  city: string
  province: string // AU state name
  business_type?: 'shop' | 'brand' | 'service_center' | 'tour_operator' | 'event_organiser'
  website?: string
  description?: string
}

const AU_SHOPS: ShopSeed[] = [
  // NSW
  { name: 'Giant Sydney',                 slug: 'giant-sydney',                 city: 'Sydney',      province: 'New South Wales', website: 'https://www.giant-sydney.com.au' },
  { name: 'Trek Bicycle Store Sydney',    slug: 'trek-sydney',                  city: 'Sydney',      province: 'New South Wales' },
  { name: 'Bikebug',                      slug: 'bikebug',                      city: 'Sydney',      province: 'New South Wales', website: 'https://www.bikebug.com.au' },
  { name: 'Clarence Street Cyclery',      slug: 'clarence-street-cyclery',      city: 'Sydney',      province: 'New South Wales' },
  { name: 'Cheeky Transport',             slug: 'cheeky-transport',             city: 'Newtown',     province: 'New South Wales' },
  { name: '99 Bikes Alexandria',          slug: '99-bikes-alexandria',          city: 'Alexandria',  province: 'New South Wales' },
  { name: '99 Bikes Parramatta',          slug: '99-bikes-parramatta',          city: 'Parramatta',  province: 'New South Wales' },
  { name: 'Velo Cycles Newcastle',        slug: 'velo-cycles-newcastle',        city: 'Newcastle',   province: 'New South Wales' },
  { name: 'Manly Cycles',                 slug: 'manly-cycles',                 city: 'Manly',       province: 'New South Wales' },
  { name: 'Blue Mountains Bike Shed',     slug: 'blue-mountains-bike-shed',     city: 'Katoomba',    province: 'New South Wales' },
  { name: 'Rollin Cycles',                slug: 'rollin-cycles',                city: 'Byron Bay',   province: 'New South Wales' },

  // VIC
  { name: 'Giant Melbourne',              slug: 'giant-melbourne',              city: 'Melbourne',   province: 'Victoria' },
  { name: 'Trek Bicycle Richmond',        slug: 'trek-richmond',                city: 'Richmond',    province: 'Victoria' },
  { name: 'Bicycle Superstore',           slug: 'bicycle-superstore',           city: 'Hawthorn',    province: 'Victoria', website: 'https://www.bicyclesuperstore.com.au' },
  { name: 'St Kilda Cycles',              slug: 'st-kilda-cycles',              city: 'St Kilda',    province: 'Victoria' },
  { name: 'Commuter Cycles',              slug: 'commuter-cycles-brunswick',    city: 'Brunswick',   province: 'Victoria' },
  { name: 'FYXO',                         slug: 'fyxo',                         city: 'Melbourne',   province: 'Victoria' },
  { name: 'Pushys Geelong',               slug: 'pushys-geelong',               city: 'Geelong',     province: 'Victoria' },
  { name: 'Cecil Walker Cycles',          slug: 'cecil-walker-cycles',          city: 'Geelong',     province: 'Victoria' },
  { name: 'Wheel Science',                slug: 'wheel-science',                city: 'Ballarat',    province: 'Victoria' },
  { name: 'Bendigo Cycles',               slug: 'bendigo-cycles',               city: 'Bendigo',     province: 'Victoria' },

  // QLD
  { name: 'Giant Brisbane',               slug: 'giant-brisbane',               city: 'Brisbane',    province: 'Queensland' },
  { name: '99 Bikes Brisbane City',       slug: '99-bikes-brisbane-city',       city: 'Brisbane',    province: 'Queensland' },
  { name: 'Epic Cycles',                  slug: 'epic-cycles',                  city: 'Brisbane',    province: 'Queensland' },
  { name: 'Flanagan Cycles',              slug: 'flanagan-cycles',              city: 'Noosa',       province: 'Queensland' },
  { name: 'Bicycle Centre Sunshine Coast',slug: 'bicycle-centre-sunshine-coast',city: 'Maroochydore',province: 'Queensland' },
  { name: 'Cycle Zone',                   slug: 'cycle-zone',                   city: 'Gold Coast',  province: 'Queensland' },
  { name: 'Cairns Cycles',                slug: 'cairns-cycles',                city: 'Cairns',      province: 'Queensland' },
  { name: 'Townsville Cycles',            slug: 'townsville-cycles',            city: 'Townsville',  province: 'Queensland' },
  { name: 'Reid Cycles Brisbane',         slug: 'reid-cycles-brisbane',         city: 'Brisbane',    province: 'Queensland' },

  // WA
  { name: 'Giant Perth',                  slug: 'giant-perth',                  city: 'Perth',       province: 'Western Australia' },
  { name: 'Glen Parker Cycles',           slug: 'glen-parker-cycles',           city: 'Perth',       province: 'Western Australia' },
  { name: 'Fremantle Cycles',             slug: 'fremantle-cycles',             city: 'Fremantle',   province: 'Western Australia' },
  { name: 'About Bike',                   slug: 'about-bike',                   city: 'Perth',       province: 'Western Australia' },
  { name: 'Lifecycle Cycles',             slug: 'lifecycle-cycles',             city: 'Scarborough', province: 'Western Australia' },
  { name: 'Bike Force Osborne Park',      slug: 'bike-force-osborne-park',      city: 'Osborne Park',province: 'Western Australia' },
  { name: 'Margaret River Cycles',        slug: 'margaret-river-cycles',        city: 'Margaret River', province: 'Western Australia' },

  // SA
  { name: 'Giant Adelaide',               slug: 'giant-adelaide',               city: 'Adelaide',    province: 'South Australia' },
  { name: 'Norwood Parade Cycles',        slug: 'norwood-parade-cycles',        city: 'Norwood',     province: 'South Australia' },
  { name: 'Cycle Loft',                   slug: 'cycle-loft',                   city: 'Adelaide',    province: 'South Australia' },
  { name: 'Treadly Bike Shop',            slug: 'treadly-bike-shop',            city: 'Adelaide',    province: 'South Australia' },
  { name: 'Bike Society',                 slug: 'bike-society',                 city: 'Adelaide',    province: 'South Australia' },

  // TAS
  { name: 'Avanti Plus Hobart',           slug: 'avanti-plus-hobart',           city: 'Hobart',      province: 'Tasmania' },
  { name: 'Giant Hobart',                 slug: 'giant-hobart',                 city: 'Hobart',      province: 'Tasmania' },
  { name: 'Launceston Cycles',            slug: 'launceston-cycles',            city: 'Launceston',  province: 'Tasmania' },
  { name: 'Vertigo MTB',                  slug: 'vertigo-mtb',                  city: 'Derby',       province: 'Tasmania', description: 'MTB rentals + service at the Blue Derby trailhead.' },

  // ACT
  { name: 'Canberra Cycles',              slug: 'canberra-cycles',              city: 'Canberra',    province: 'Australian Capital Territory' },
  { name: 'Bike Culture',                 slug: 'bike-culture-canberra',        city: 'Canberra',    province: 'Australian Capital Territory' },
  { name: 'Cyclepath Belconnen',          slug: 'cyclepath-belconnen',          city: 'Belconnen',   province: 'Australian Capital Territory' },

  // NT
  { name: 'Darwin Cycles',                slug: 'darwin-cycles',                city: 'Darwin',      province: 'Northern Territory' },
  { name: 'Alice Cycles',                 slug: 'alice-cycles',                 city: 'Alice Springs',province: 'Northern Territory' },

  // Online + brand listings
  { name: 'BikeExchange',                 slug: 'bikeexchange-au',              city: 'Melbourne',   province: 'Victoria', business_type: 'brand', website: 'https://www.bikeexchange.com.au' },
  { name: 'Pushys',                       slug: 'pushys',                       city: 'Sydney',      province: 'New South Wales', business_type: 'brand', website: 'https://www.pushys.com.au' },
  { name: 'Torpedo7',                     slug: 'torpedo7',                     city: 'Online',      province: 'Victoria', business_type: 'brand', website: 'https://www.torpedo7.com.au' },
  { name: 'Wiggle Australia',             slug: 'wiggle-au',                    city: 'Online',      province: 'New South Wales', business_type: 'brand', website: 'https://www.wiggle.com.au' },
  { name: 'Polygon Bikes Australia',      slug: 'polygon-bikes-au',             city: 'Melbourne',   province: 'Victoria', business_type: 'brand' },
  { name: 'Malvern Star',                 slug: 'malvern-star',                 city: 'Melbourne',   province: 'Victoria', business_type: 'brand' },
  { name: 'Reid Cycles',                  slug: 'reid-cycles',                  city: 'Melbourne',   province: 'Victoria', business_type: 'brand' },

  // Tour operators + service
  { name: 'Blue Derby Pods Ride',         slug: 'blue-derby-pods-ride',         city: 'Derby',       province: 'Tasmania', business_type: 'tour_operator' },
  { name: 'Thredbo MTB Hire',             slug: 'thredbo-mtb-hire',             city: 'Thredbo',     province: 'New South Wales', business_type: 'service_center' },
  { name: 'Rocky Trail Entertainment',    slug: 'rocky-trail-entertainment',    city: 'Sydney',      province: 'New South Wales', business_type: 'event_organiser' },
]

// ─── Routes (30) — landmarks + popular trails ──────────────────────────
interface RouteSeed {
  slug: string
  name: string
  discipline: 'road' | 'mtb' | 'gravel' | 'urban' | 'bikepacking'
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  distanceKm: number
  elevationM: number
  province: string
  town: string
  description: string
}

const AU_ROUTES: RouteSeed[] = [
  { slug: 'thredbo-all-mountain',   name: 'Thredbo All Mountain',             discipline: 'mtb',    difficulty: 'advanced',    distanceKm: 14,  elevationM: 600,  province: 'New South Wales', town: 'Thredbo', description: 'Lift-accessed alpine descents — Kosciuszko Flow, Cannonball, Merritts. Shoulder-season dust and spring corn both shine.' },
  { slug: 'stromlo-xc',             name: 'Mount Stromlo XC Loop',            discipline: 'mtb',    difficulty: 'intermediate',distanceKm: 18,  elevationM: 500,  province: 'Australian Capital Territory', town: 'Canberra', description: 'The former 2009 Worlds course. Fast, flowy, deceptively technical.' },
  { slug: 'blue-derby-atlas',       name: 'Blue Derby — Atlas to Town',       discipline: 'mtb',    difficulty: 'intermediate',distanceKm: 22,  elevationM: 700,  province: 'Tasmania', town: 'Derby', description: 'The signature pointy-end of the Blue Derby network — Atlas to Roxanne to town.' },
  { slug: 'you-yangs-xc',           name: 'You Yangs XC',                     discipline: 'mtb',    difficulty: 'intermediate',distanceKm: 25,  elevationM: 450,  province: 'Victoria', town: 'Little River', description: 'Granite, gum trees, and one of Melbourne\'s most popular mid-week MTB stops.' },
  { slug: 'lysterfield-red-loop',   name: 'Lysterfield Red Loop',             discipline: 'mtb',    difficulty: 'intermediate',distanceKm: 20,  elevationM: 430,  province: 'Victoria', town: 'Lysterfield', description: 'Red-rated XC classic on Melbourne\'s eastern fringe — home of the 2006 Commonwealth Games course.' },
  { slug: 'falls-creek-flow',       name: 'Falls Creek Flow Town',            discipline: 'mtb',    difficulty: 'intermediate',distanceKm: 16,  elevationM: 480,  province: 'Victoria', town: 'Falls Creek', description: 'Aussie Alps summer flow-trail network — Big Red, Hard Yakka, Whistlepipe.' },
  { slug: 'mt-buller-epic',         name: 'Mount Buller Epic',                discipline: 'mtb',    difficulty: 'advanced',    distanceKm: 40,  elevationM: 1100, province: 'Victoria', town: 'Mount Buller', description: 'Full-day alpine epic on Victoria\'s most extensive high-country trail network.' },
  { slug: 'rotorua-of-nsw-awaba',   name: 'Awaba MTB Park',                   discipline: 'mtb',    difficulty: 'intermediate',distanceKm: 20,  elevationM: 390,  province: 'New South Wales', town: 'Cooranbong', description: 'Lake Macquarie\'s trail hub — tight, twisting singletrack in a shaded forest.' },
  { slug: 'glenrock-loop',          name: 'Glenrock Classic Loop',            discipline: 'mtb',    difficulty: 'intermediate',distanceKm: 28,  elevationM: 600,  province: 'New South Wales', town: 'Newcastle', description: 'Ocean views + coastal rainforest singletrack, a few minutes from downtown Newcastle.' },
  { slug: 'majura-pines-loop',      name: 'Majura Pines Loop',                discipline: 'mtb',    difficulty: 'beginner',    distanceKm: 12,  elevationM: 150,  province: 'Australian Capital Territory', town: 'Canberra', description: 'The beginner-friendly Canberra staple — shaded pine plantation with signed intermediate offshoots.' },
  { slug: 'kowen-forest-loop',      name: 'Kowen Forest Big Loop',            discipline: 'mtb',    difficulty: 'advanced',    distanceKm: 35,  elevationM: 750,  province: 'Australian Capital Territory', town: 'Canberra', description: 'The longer, hillier sibling to Sparrow Hill. Endurance terrain.' },
  { slug: 'beach-road-melbourne',   name: 'Beach Road Melbourne',             discipline: 'road',   difficulty: 'beginner',    distanceKm: 48,  elevationM: 120,  province: 'Victoria', town: 'Melbourne', description: 'The St Kilda to Mordialloc bunch-ride classic. Flat, fast, unavoidable weekend traffic.' },
  { slug: 'kinglake-road-loop',     name: 'Kinglake Loop',                    discipline: 'road',   difficulty: 'intermediate',distanceKm: 95,  elevationM: 1700, province: 'Victoria', town: 'Melbourne', description: 'Melbourne\'s classic hills loop via Kinglake + St Andrews. Coffee at the summit.' },
  { slug: 'dandenong-climbs',       name: 'Dandenong Ranges Climb Set',       discipline: 'road',   difficulty: 'advanced',    distanceKm: 70,  elevationM: 2200, province: 'Victoria', town: 'Melbourne', description: 'Links The Wall, Mt Dandenong, The Crescent, Terry\'s Avenue, and Inverness Rd. Brutal.' },
  { slug: '7-peaks-mt-hotham',      name: '7 Peaks — Mount Hotham',           discipline: 'road',   difficulty: 'expert',      distanceKm: 30,  elevationM: 1400, province: 'Victoria', town: 'Harrietville', description: '30km climb with an average grade of 4.6% — one of the toughest in the 7 Peaks Challenge.' },
  { slug: '7-peaks-falls-creek',    name: '7 Peaks — Falls Creek',            discipline: 'road',   difficulty: 'advanced',    distanceKm: 30,  elevationM: 1300, province: 'Victoria', town: 'Mount Beauty', description: 'Classic Bogong High Plains haul via Howmans Gap. 7 Peaks staple.' },
  { slug: 'royal-nat-park-loop',    name: 'Royal National Park Loop',         discipline: 'road',   difficulty: 'intermediate',distanceKm: 80,  elevationM: 900,  province: 'New South Wales', town: 'Sutherland', description: 'Sydney\'s standard bunch-ride south from the Royal with Stanwell Park rollers.' },
  { slug: 'akuna-bay-loop',         name: 'Akuna Bay Loop',                   discipline: 'road',   difficulty: 'advanced',    distanceKm: 65,  elevationM: 1200, province: 'New South Wales', town: 'Sydney', description: 'Sydney\'s Ku-ring-gai classic — West Head, Akuna Bay descent, McCarrs + Church Point.' },
  { slug: 'corso-brisbane',         name: 'Brisbane River Loop',              discipline: 'road',   difficulty: 'beginner',    distanceKm: 32,  elevationM: 200,  province: 'Queensland', town: 'Brisbane', description: 'Riverside paths and a gentle city loop — the standard new-rider intro in Brisbane.' },
  { slug: 'mt-coot-tha-reps',       name: 'Mount Coot-tha Reps',              discipline: 'road',   difficulty: 'intermediate',distanceKm: 25,  elevationM: 700,  province: 'Queensland', town: 'Brisbane', description: 'Short-and-sharp Brisbane climb, 3km at 6%, rep it until the legs fail.' },
  { slug: 'gold-coast-hinterland',  name: 'Gold Coast Hinterland Loop',       discipline: 'road',   difficulty: 'advanced',    distanceKm: 110, elevationM: 2000, province: 'Queensland', town: 'Gold Coast', description: 'The classic Currumbin Valley / Numinbah / Springbrook Road loop.' },
  { slug: 'king-of-the-mountain',   name: 'Willunga Hill',                    discipline: 'road',   difficulty: 'intermediate',distanceKm: 3,   elevationM: 250,  province: 'South Australia', town: 'Willunga', description: 'The Tour Down Under summit finish — 3km at 7.5%. Bring a photographer.' },
  { slug: 'kangaroo-island-loop',   name: 'Kangaroo Island East End Loop',    discipline: 'gravel', difficulty: 'intermediate',distanceKm: 75,  elevationM: 1000, province: 'South Australia', town: 'Penneshaw', description: 'Remote gravel + light coastal singletrack on SA\'s best-kept cycling secret.' },
  { slug: 'pinn-rail-trail',        name: 'Pinnaroo Rail Trail',              discipline: 'gravel', difficulty: 'beginner',    distanceKm: 55,  elevationM: 180,  province: 'South Australia', town: 'Tailem Bend', description: 'Easy rail-trail pedal across the Mallee. Wildflowers in spring.' },
  { slug: 'otway-gravel-grind',     name: 'Otway Gravel Grind',               discipline: 'gravel', difficulty: 'advanced',    distanceKm: 90,  elevationM: 1800, province: 'Victoria', town: 'Apollo Bay', description: 'Rainforest gravel + steep logging roads — rough, remote, stunning.' },
  { slug: 'munda-biddi',            name: 'Munda Biddi Trail — Full',         discipline: 'bikepacking', difficulty: 'advanced', distanceKm: 1000, elevationM: 9500, province: 'Western Australia', town: 'Mundaring', description: '1,000km Perth-to-Albany bikepacking trail. Plan a fortnight minimum.' },
  { slug: 'bicentennial-hunter',    name: 'Bicentennial National Trail — Hunter', discipline: 'bikepacking', difficulty: 'expert', distanceKm: 350, elevationM: 6000, province: 'New South Wales', town: 'Scone', description: 'A Hunter Valley slab of Australia\'s 5,330km bikepacking spine.' },
  { slug: 'canberra-centenary',     name: 'Canberra Centenary Trail',         discipline: 'bikepacking', difficulty: 'intermediate', distanceKm: 145, elevationM: 2200, province: 'Australian Capital Territory', town: 'Canberra', description: 'A weekend loop around the ACT — paved + gravel mix, easy logistics.' },
  { slug: 'brisbane-valley-rail',   name: 'Brisbane Valley Rail Trail',       discipline: 'gravel', difficulty: 'beginner',    distanceKm: 160, elevationM: 800,  province: 'Queensland', town: 'Wulkuraka', description: 'Australia\'s longest rail trail — 161km across the Brisbane Valley.' },
  { slug: 'tasmanian-trail',        name: 'Tasmanian Trail',                  discipline: 'bikepacking', difficulty: 'expert',  distanceKm: 480, elevationM: 9000, province: 'Tasmania', town: 'Devonport', description: 'Devonport to Dover — the north-south Tasmanian backbone, gravel-heavy.' },
]

// ─── Events (15) ────────────────────────────────────────────────────────
interface EventSeed {
  slug: string
  title: string
  eventType: 'race' | 'fun_ride' | 'sportive' | 'expo' | 'club_event' | 'charity_ride'
  startDate: string // ISO
  endDate?: string
  province: string
  city: string
  venue?: string
  distance?: string
  website?: string
  entryUrl?: string
  organiser?: string
  description: string
}

const AU_EVENTS: EventSeed[] = [
  { slug: 'tour-down-under-2027',     title: 'Santos Tour Down Under 2027',    eventType: 'race', startDate: '2027-01-17', endDate: '2027-01-24', province: 'South Australia', city: 'Adelaide', website: 'https://tourdownunder.com.au', organiser: 'Events South Australia', description: 'WorldTour season opener. 7 stages, summit finish on Willunga.' },
  { slug: 'cadel-evans-road-race-2027', title: 'Cadel Evans Great Ocean Road Race 2027', eventType: 'race', startDate: '2027-02-07', province: 'Victoria', city: 'Geelong', website: 'https://www.cadelevansgreatoceanroadrace.com.au', description: 'UCI 1.WWT / 1.Pro — the Australian one-day classic.' },
  { slug: 'crocodile-trophy-2026',    title: 'Crocodile Trophy 2026',          eventType: 'race', startDate: '2026-10-10', endDate: '2026-10-17', province: 'Queensland', city: 'Cairns', description: '8-stage MTB epic across Far North Queensland. 500km+, bucket-list tier.' },
  { slug: 'port-to-port-mtb-2027',    title: 'Port to Port MTB 2027',          eventType: 'race', startDate: '2027-05-12', endDate: '2027-05-15', province: 'New South Wales', city: 'Hunter Valley', website: 'https://porttoportmtb.com.au', description: '4-day MTB stage race through the Hunter Valley and Newcastle.' },
  { slug: 'peaks-challenge-falls-creek', title: 'Peaks Challenge Falls Creek 2027', eventType: 'sportive', startDate: '2027-03-07', province: 'Victoria', city: 'Falls Creek', distance: '235km', description: 'Australia\'s toughest single-day road sportive. 4,500m+ climbing.' },
  { slug: 'spring-cycle-2026',        title: 'Sydney Spring Cycle 2026',       eventType: 'fun_ride', startDate: '2026-10-18', province: 'New South Wales', city: 'Sydney', distance: '55km', description: 'Harbour-Bridge-to-Olympic-Park family ride with a closed-road start.' },
  { slug: 'around-the-bay-2026',      title: 'Around the Bay 2026',            eventType: 'sportive', startDate: '2026-10-04', province: 'Victoria', city: 'Melbourne', distance: '210km', website: 'https://www.aroundthebay.com.au', description: 'The classic Port Phillip Bay loop. Pick your distance 20–300km.' },
  { slug: 'reef-to-reef-mtb-2027',    title: 'Reef to Reef MTB 2027',          eventType: 'race', startDate: '2027-07-22', endDate: '2027-07-25', province: 'Queensland', city: 'Port Douglas', description: 'Great Barrier Reef to Atherton Tablelands. 250km over 4 days.' },
  { slug: 'swiss-peaks-australia',    title: 'Swiss Peaks Australia 2027',     eventType: 'sportive', startDate: '2027-03-22', province: 'Victoria', city: 'Bright', distance: '140km', description: 'Alpine gran fondo linking Mt Buffalo + Mt Hotham foothills.' },
  { slug: 'derby-enduro-2027',        title: 'Blue Derby Enduro 2027',         eventType: 'race', startDate: '2027-02-14', endDate: '2027-02-15', province: 'Tasmania', city: 'Derby', description: '2-day enduro on the iconic Blue Derby trails.' },
  { slug: 'wagga-wagga-gran-fondo',   title: 'Wagga Wagga Gran Fondo 2026',    eventType: 'sportive', startDate: '2026-11-01', province: 'New South Wales', city: 'Wagga Wagga', distance: '120km', description: 'Riverina rolling-hills gran fondo. A friendly weekend.' },
  { slug: 'shimano-grip-2027',        title: 'Shimano GRIP MTB 2027',          eventType: 'race', startDate: '2027-04-18', province: 'Victoria', city: 'Forrest', description: 'Iconic singletrack-rich XC marathon in the Otways.' },
  { slug: 'noosa-enduro-2027',        title: 'Noosa MTB Enduro 2027',          eventType: 'race', startDate: '2027-06-14', province: 'Queensland', city: 'Noosa', description: 'Coastal MTB enduro at Tewantin State Forest.' },
  { slug: 'rapha-prestige-melbourne', title: 'Rapha Prestige Melbourne 2026',  eventType: 'fun_ride', startDate: '2026-11-22', province: 'Victoria', city: 'Melbourne', distance: '150km', description: '4-rider team endurance ride through Victorian high country. Invitation + ballot.' },
  { slug: 'ceduna-cycle-challenge',   title: 'Ceduna Cycle Challenge 2027',    eventType: 'sportive', startDate: '2027-09-05', province: 'South Australia', city: 'Ceduna', distance: '100km', description: 'Eyre Peninsula coastal sportive with a charity-ride vibe.' },
]

// ─── Listings (40) ──────────────────────────────────────────────────────
interface ListingSeed {
  slug: string
  title: string
  price: string // AUD — plausible retail used-market
  condition: 'new' | 'like_new' | 'used' | 'poor'
  province: string
  city: string
  description: string
  bikeMake?: string
  bikeModel?: string
  bikeYear?: number
  seller: 'alex' | 'jordan' | 'sam' | 'riley' | 'kim'
  categorySlug: string
}

const AU_LISTINGS: ListingSeed[] = [
  { slug: 'trek-slash-8-2024-mint-au', title: 'Trek Slash 8 2024 — Mint Condition', price: '6500', condition: 'like_new', province: 'Victoria', city: 'Melbourne', bikeMake: 'Trek', bikeModel: 'Slash 8', bikeYear: 2024, seller: 'alex', categorySlug: 'enduro', description: 'Bought Feb 2025, ~20 rides. Fox 38 + X2 rear, SRAM GX AXS T-Type. Full service history.' },
  { slug: 'specialized-stumpjumper-evo-au', title: 'Specialized Stumpjumper Evo 2023', price: '5200', condition: 'used', province: 'New South Wales', city: 'Sydney', bikeMake: 'Specialized', bikeModel: 'Stumpjumper Evo', bikeYear: 2023, seller: 'jordan', categorySlug: 'trail-mtb', description: 'S4, carbon frame. Sram GX Eagle, Fox 36 150mm. Honest used condition, loved but looked-after.' },
  { slug: 'giant-trance-x-29-au', title: 'Giant Trance X 29 Advanced 2 2024', price: '4800', condition: 'like_new', province: 'Queensland', city: 'Brisbane', bikeMake: 'Giant', bikeModel: 'Trance X 29', bikeYear: 2024, seller: 'sam', categorySlug: 'trail-mtb', description: 'L, carbon frame, XT drivetrain. Under 500km, full Giant warranty transfers.' },
  { slug: 'santa-cruz-hightower-c-au', title: 'Santa Cruz Hightower C 2023', price: '7500', condition: 'like_new', province: 'Victoria', city: 'Melbourne', bikeMake: 'Santa Cruz', bikeModel: 'Hightower', bikeYear: 2023, seller: 'riley', categorySlug: 'trail-mtb', description: 'XL carbon C frame, Fox Performance Elite, SLX 12s. Reluctant sale.' },
  { slug: 'norco-sight-c2-au', title: 'Norco Sight C2 2022', price: '3800', condition: 'used', province: 'Tasmania', city: 'Derby', bikeMake: 'Norco', bikeModel: 'Sight', bikeYear: 2022, seller: 'kim', categorySlug: 'enduro', description: 'Lives at Blue Derby. New tyres, recent lower-leg service on the 38.' },
  { slug: 'yt-jeffsy-core-3-au', title: 'YT Jeffsy Core 3 2024', price: '4400', condition: 'like_new', province: 'New South Wales', city: 'Thredbo', bikeMake: 'YT', bikeModel: 'Jeffsy', bikeYear: 2024, seller: 'alex', categorySlug: 'trail-mtb', description: 'L, Fox 36 + X2, SRAM GX Transmission. One Thredbo season, immaculate.' },
  { slug: 'canyon-spectral-au', title: 'Canyon Spectral CFR 2023', price: '6200', condition: 'used', province: 'Australian Capital Territory', city: 'Canberra', bikeMake: 'Canyon', bikeModel: 'Spectral', bikeYear: 2023, seller: 'jordan', categorySlug: 'trail-mtb', description: 'Top-spec CFR. Stromlo + Kowen weekly rider. New chain + cassette. M.' },
  { slug: 'cannondale-scalpel-au', title: 'Cannondale Scalpel Carbon 2 2023', price: '4500', condition: 'like_new', province: 'Queensland', city: 'Noosa', bikeMake: 'Cannondale', bikeModel: 'Scalpel', bikeYear: 2023, seller: 'sam', categorySlug: 'xc', description: 'XC race-ready, Lefty Ocho fork, XX SL. Sub-11kg.' },
  { slug: 'pivot-mach-4-sl-au', title: 'Pivot Mach 4 SL 2024', price: '7800', condition: 'like_new', province: 'Victoria', city: 'Ballarat', bikeMake: 'Pivot', bikeModel: 'Mach 4 SL', bikeYear: 2024, seller: 'riley', categorySlug: 'xc', description: 'XTR Di2 build. Ex-shop demo, under 30 hours.' },
  { slug: 'transition-patrol-au', title: 'Transition Patrol Carbon 2022', price: '3900', condition: 'used', province: 'Western Australia', city: 'Margaret River', bikeMake: 'Transition', bikeModel: 'Patrol', bikeYear: 2022, seller: 'kim', categorySlug: 'enduro', description: 'Margaret River rider. New Zeb + Super Deluxe + tyres.' },

  { slug: 'giant-tcr-advanced-pro-au', title: 'Giant TCR Advanced Pro 1 2024', price: '5400', condition: 'like_new', province: 'Victoria', city: 'Melbourne', bikeMake: 'Giant', bikeModel: 'TCR Advanced Pro', bikeYear: 2024, seller: 'alex', categorySlug: 'road-bike', description: 'Ultegra Di2, SLR1 wheels. Medium. Under 1,000km.' },
  { slug: 'specialized-tarmac-sl7-au', title: 'Specialized Tarmac SL7 Expert 2023', price: '6900', condition: 'used', province: 'New South Wales', city: 'Sydney', bikeMake: 'Specialized', bikeModel: 'Tarmac SL7', bikeYear: 2023, seller: 'jordan', categorySlug: 'road-bike', description: '56, Ultegra mechanical, Roval Rapide CL wheels. Honest used condition.' },
  { slug: 'trek-madone-slr6-au', title: 'Trek Madone SLR 6 2022', price: '5500', condition: 'used', province: 'Queensland', city: 'Gold Coast', bikeMake: 'Trek', bikeModel: 'Madone SLR', bikeYear: 2022, seller: 'sam', categorySlug: 'road-bike', description: 'Aero beast, 56, Ultegra. Small chip on top tube pictured.' },
  { slug: 'cannondale-synapse-au', title: 'Cannondale Synapse Carbon 3 2024', price: '3800', condition: 'like_new', province: 'South Australia', city: 'Adelaide', bikeMake: 'Cannondale', bikeModel: 'Synapse', bikeYear: 2024, seller: 'riley', categorySlug: 'road-bike', description: 'Endurance geo, GRX 2x. Perfect for Willunga days + Peaks Challenge training.' },
  { slug: 'bmc-roadmachine-au', title: 'BMC Roadmachine 01 Three 2023', price: '6400', condition: 'like_new', province: 'Victoria', city: 'Geelong', bikeMake: 'BMC', bikeModel: 'Roadmachine', bikeYear: 2023, seller: 'alex', categorySlug: 'road-bike', description: 'Carbon endurance race bike. Red AXS. 54.' },
  { slug: 'pinarello-dogma-f-au', title: 'Pinarello Dogma F 2022', price: '9800', condition: 'used', province: 'New South Wales', city: 'Sydney', bikeMake: 'Pinarello', bikeModel: 'Dogma F', bikeYear: 2022, seller: 'jordan', categorySlug: 'road-bike', description: 'Dura-Ace Di2, Princeton wheels. 53. Rare colourway.' },
  { slug: 'cervelo-caledonia-5-au', title: 'Cervélo Caledonia-5 2024', price: '7200', condition: 'like_new', province: 'Queensland', city: 'Brisbane', bikeMake: 'Cervélo', bikeModel: 'Caledonia-5', bikeYear: 2024, seller: 'sam', categorySlug: 'road-bike', description: 'Force AXS, Reserve 40|44. 56. Mint.' },
  { slug: 'orbea-orca-m30-au', title: 'Orbea Orca M30 2023', price: '3600', condition: 'used', province: 'Victoria', city: 'Melbourne', bikeMake: 'Orbea', bikeModel: 'Orca', bikeYear: 2023, seller: 'riley', categorySlug: 'road-bike', description: 'Carbon road, 105 Di2. 54. Small gravel rash on seat stay.' },
  { slug: 'merida-scultura-au', title: 'Merida Scultura Endurance 5000 2023', price: '3400', condition: 'used', province: 'Western Australia', city: 'Perth', bikeMake: 'Merida', bikeModel: 'Scultura Endurance', bikeYear: 2023, seller: 'kim', categorySlug: 'road-bike', description: 'Light endurance carbon, 105 R7100. 54.' },
  { slug: 'scott-addict-rc-au', title: 'Scott Addict RC 30 2024', price: '5900', condition: 'like_new', province: 'Australian Capital Territory', city: 'Canberra', bikeMake: 'Scott', bikeModel: 'Addict RC', bikeYear: 2024, seller: 'alex', categorySlug: 'road-bike', description: 'Light and stiff, Ultegra Di2. 56. Perfect Canberra bunch-ride weapon.' },

  { slug: '3t-exploro-race-au', title: '3T Exploro Race GRX 2023', price: '4800', condition: 'like_new', province: 'Victoria', city: 'Apollo Bay', bikeMake: '3T', bikeModel: 'Exploro', bikeYear: 2023, seller: 'jordan', categorySlug: 'gravel-bike', description: 'Aero gravel bike, GRX Di2. Set up for Otway Gravel Grind.' },
  { slug: 'specialized-diverge-au', title: 'Specialized Diverge Comp Carbon 2024', price: '5200', condition: 'like_new', province: 'South Australia', city: 'Adelaide', bikeMake: 'Specialized', bikeModel: 'Diverge', bikeYear: 2024, seller: 'sam', categorySlug: 'gravel-bike', description: 'Future Shock, GRX RX820. Stunning Limestone/Slate colourway. 54.' },
  { slug: 'canyon-grizl-cf-au', title: 'Canyon Grizl CF SL 7 2023', price: '3200', condition: 'used', province: 'New South Wales', city: 'Byron Bay', bikeMake: 'Canyon', bikeModel: 'Grizl', bikeYear: 2023, seller: 'riley', categorySlug: 'gravel-bike', description: 'Bikepacking-ready, GRX 2x. M. Loaded and ridden to Brisbane.' },
  { slug: 'open-upper-au', title: 'OPEN UPPER 2022', price: '6800', condition: 'like_new', province: 'Victoria', city: 'Melbourne', bikeMake: 'OPEN', bikeModel: 'UPPER', bikeYear: 2022, seller: 'alex', categorySlug: 'gravel-bike', description: 'Boutique gravel, Force AXS XPLR. Reserve 40/44. M.' },
  { slug: 'salsa-cutthroat-au', title: 'Salsa Cutthroat C 2023', price: '4500', condition: 'used', province: 'Tasmania', city: 'Hobart', bikeMake: 'Salsa', bikeModel: 'Cutthroat', bikeYear: 2023, seller: 'kim', categorySlug: 'gravel-bike', description: 'Carbon bikepacking rig, set up for the Munda Biddi. Frame bag included.' },

  { slug: 'specialized-turbo-vado-sl-au', title: 'Specialized Turbo Vado SL 4.0 2023', price: '3800', condition: 'like_new', province: 'New South Wales', city: 'Sydney', bikeMake: 'Specialized', bikeModel: 'Turbo Vado SL', bikeYear: 2023, seller: 'jordan', categorySlug: 'e-urban', description: 'Commuter eBike, range-extender included. Under 1,500km.' },
  { slug: 'trek-powerfly-9-au', title: 'Trek Powerfly 9 Equipped 2024', price: '6800', condition: 'like_new', province: 'Queensland', city: 'Brisbane', bikeMake: 'Trek', bikeModel: 'Powerfly 9', bikeYear: 2024, seller: 'sam', categorySlug: 'e-mtb', description: 'Bosch CX 750Wh, Fox Performance suspension. Full service.' },
  { slug: 'giant-trance-x-e-plus-au', title: 'Giant Trance X E+ Pro 2 2023', price: '5400', condition: 'used', province: 'Victoria', city: 'Falls Creek', bikeMake: 'Giant', bikeModel: 'Trance X E+', bikeYear: 2023, seller: 'riley', categorySlug: 'e-mtb', description: 'Yamaha SyncDrive Pro, 750Wh. Loved at Falls Creek.' },
  { slug: 'merida-eone-sixty-au', title: 'Merida eONE-SIXTY 9000 2022', price: '4200', condition: 'used', province: 'Western Australia', city: 'Perth', bikeMake: 'Merida', bikeModel: 'eONE-SIXTY', bikeYear: 2022, seller: 'kim', categorySlug: 'e-mtb', description: 'Shimano EP8, 630Wh. Full power, full warranty.' },
  { slug: 'specialized-turbo-levo-au', title: 'Specialized Turbo Levo Carbon 2024', price: '8900', condition: 'like_new', province: 'New South Wales', city: 'Thredbo', bikeMake: 'Specialized', bikeModel: 'Turbo Levo', bikeYear: 2024, seller: 'alex', categorySlug: 'e-mtb', description: 'S-Works spec, 700Wh. One Thredbo season.' },

  { slug: 'fox-38-factory-au', title: 'Fox 38 Factory 170mm 29"', price: '1200', condition: 'like_new', province: 'Victoria', city: 'Melbourne', seller: 'jordan', categorySlug: 'front-forks', description: 'Kashima coating, GRIP2, ~30 hours. Fresh lowers service.' },
  { slug: 'rockshox-zeb-ult-au', title: 'RockShox Zeb Ultimate 170mm 29"', price: '950', condition: 'used', province: 'Queensland', city: 'Gold Coast', seller: 'sam', categorySlug: 'front-forks', description: 'Charger 3, Buttercups. Recent service.' },
  { slug: 'xx1-eagle-transmission-au', title: 'SRAM XX SL Eagle Transmission', price: '1800', condition: 'like_new', province: 'Australian Capital Territory', city: 'Canberra', seller: 'riley', categorySlug: 'drivetrain', description: 'Full kit, cranks, chain, cassette, AXS shifter. Lightly used.' },
  { slug: 'dt-swiss-xmc-1501-wheels-au', title: 'DT Swiss XMC 1501 29" Wheelset', price: '850', condition: 'used', province: 'New South Wales', city: 'Sydney', seller: 'kim', categorySlug: 'wheelsets', description: 'Carbon hookless, Boost. Minor cosmetic scuffs, true + round.' },
  { slug: 'hunt-xc-race-wheels-au', title: 'Hunt XC Race Carbon Wheelset', price: '900', condition: 'like_new', province: 'Victoria', city: 'Melbourne', seller: 'alex', categorySlug: 'wheelsets', description: 'XC-race tuned, Boost. Near-new.' },

  { slug: 'giant-tcr-cheap-au', title: 'Giant TCR SL 1 2020', price: '1800', condition: 'used', province: 'Victoria', city: 'Geelong', bikeMake: 'Giant', bikeModel: 'TCR SL', bikeYear: 2020, seller: 'jordan', categorySlug: 'road-bike', description: 'Aluminium, 105. 54. Honest older bike, still rolls nicely.' },
  { slug: 'norco-fluid-used-au', title: 'Norco Fluid FS 1 2021', price: '1500', condition: 'used', province: 'Queensland', city: 'Brisbane', bikeMake: 'Norco', bikeModel: 'Fluid FS 1', bikeYear: 2021, seller: 'sam', categorySlug: 'trail-mtb', description: 'Budget trail rig. L. Chain + cassette due.' },
  { slug: 'merida-reacto-au', title: 'Merida Reacto 6000 2021', price: '2400', condition: 'used', province: 'South Australia', city: 'Adelaide', bikeMake: 'Merida', bikeModel: 'Reacto', bikeYear: 2021, seller: 'riley', categorySlug: 'road-bike', description: 'Aero, 105 mechanical. 54. Scratched top tube.' },
  { slug: 'cube-acid-hardtail-au', title: 'Cube Acid 29 Hardtail 2022', price: '900', condition: 'used', province: 'Western Australia', city: 'Perth', bikeMake: 'Cube', bikeModel: 'Acid', bikeYear: 2022, seller: 'kim', categorySlug: 'hardtail-mtb', description: 'Budget hardtail, Deore 1x. 18". Good starter rig.' },
]

// ─── Stolen reports (5) ─────────────────────────────────────────────────
interface StolenSeed {
  serial: string
  brand: string
  model?: string
  year?: number
  colour?: string
  sapsCaseNo?: string // "Police case number" in AU context
  stolenDate: string // ISO
  stolenLocation: string
  description: string
}

const AU_STOLEN: StolenSeed[] = [
  { serial: 'WTU198A4K2231', brand: 'Trek', model: 'Slash 8', year: 2023, colour: 'Gloss Raw Carbon', sapsCaseNo: 'E12345678',  stolenDate: '2026-03-14', stolenLocation: 'Northcote, Melbourne VIC', description: 'Locked outside Café Racer, cut lock. GX Transmission, 38 Factory.' },
  { serial: 'GT24M78L9012', brand: 'Giant', model: 'Trance X 29', year: 2024, colour: 'Midnight Blue', sapsCaseNo: 'NSW2026-447812', stolenDate: '2026-04-02', stolenLocation: 'Newtown, Sydney NSW', description: 'Garage break-in. L frame. Fox Performance suspension.' },
  { serial: 'SPEC56P41W7A', brand: 'Specialized', model: 'Stumpjumper Evo', year: 2022, colour: 'Satin Forest Green', stolenDate: '2026-02-28', stolenLocation: 'Mt Coot-tha, Brisbane QLD', description: 'Stolen out of ute tray at Summit car park. Dented top tube from previous crash.' },
  { serial: 'SCB29XH03B12', brand: 'Santa Cruz', model: 'Hightower', year: 2023, colour: 'Matte Black', sapsCaseNo: 'TAS26-0091', stolenDate: '2026-03-21', stolenLocation: 'Derby township TAS', description: 'Stolen from Blue Derby accommodation. XL. Reserve 30 HD wheels.' },
  { serial: 'CAN22S8K4C99', brand: 'Cannondale', model: 'SuperSix EVO', year: 2022, colour: 'Riot Red', sapsCaseNo: 'SA26/887', stolenDate: '2026-01-09', stolenLocation: 'Norwood, Adelaide SA', description: 'Stolen off bike rack at coffee stop. 54. Ultegra mechanical.' },
]

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set')
  const dry = process.argv.includes('--dry')
  const sql = neon(url)

  console.log(`AU seed — ${dry ? 'DRY RUN' : 'LIVE'}`)

  if (dry) {
    console.log(`Would seed: ${AU_SHOPS.length} shops, ${AU_ROUTES.length} routes, ${AU_EVENTS.length} events, ${AU_LISTINGS.length} listings, ${AU_STOLEN.length} stolen`)
    return
  }

  // ── 1. Seed sellers (5 dummy users) ──────────────────────────────────
  const SELLERS = [
    { key: 'alex',   name: 'Alex Thompson',   email: 'au-seed-alex@crankmart.au',   city: 'Melbourne',  province: 'Victoria' },
    { key: 'jordan', name: 'Jordan Park',     email: 'au-seed-jordan@crankmart.au', city: 'Sydney',     province: 'New South Wales' },
    { key: 'sam',    name: 'Sam Nguyen',      email: 'au-seed-sam@crankmart.au',    city: 'Brisbane',   province: 'Queensland' },
    { key: 'riley',  name: 'Riley Fischer',   email: 'au-seed-riley@crankmart.au',  city: 'Canberra',   province: 'Australian Capital Territory' },
    { key: 'kim',    name: 'Kim Patel',       email: 'au-seed-kim@crankmart.au',    city: 'Perth',      province: 'Western Australia' },
  ] as const
  const sellerIdByKey: Record<string, string> = {}
  for (const s of SELLERS) {
    const existing = await sql`SELECT id FROM users WHERE email = ${s.email} LIMIT 1`
    if (existing[0]) {
      sellerIdByKey[s.key] = existing[0].id as string
      continue
    }
    const id = randomUUID()
    const handle = s.email.split('@')[0]
    await sql`
      INSERT INTO users (id, email, name, role, country, province, city, handle, email_verified, is_active)
      VALUES (${id}, ${s.email}, ${s.name}, 'seller', 'au', ${s.province}, ${s.city}, ${handle}, true, true)
    `
    sellerIdByKey[s.key] = id
  }
  console.log(`✓ sellers: ${Object.keys(sellerIdByKey).length}`)

  // ── 2. Shops ──────────────────────────────────────────────────────────
  let shopsInserted = 0
  for (const s of AU_SHOPS) {
    try {
      const r = await sql`
        INSERT INTO businesses (name, slug, business_type, country, province, city, website, description, status, source)
        VALUES (
          ${s.name}, ${s.slug}, ${s.business_type ?? 'shop'}, 'au',
          ${s.province}, ${s.city},
          ${s.website ?? null}, ${s.description ?? null},
          'pending', 'seed-au'
        )
        ON CONFLICT (slug) DO NOTHING
        RETURNING id
      `
      if (r.length > 0) shopsInserted++
    } catch (e) { console.error(`× shop ${s.slug}:`, (e as Error).message) }
  }
  console.log(`✓ shops: ${shopsInserted}/${AU_SHOPS.length}`)

  // ── 3. Routes ─────────────────────────────────────────────────────────
  let routesInserted = 0
  for (const r of AU_ROUTES) {
    try {
      const res = await sql`
        INSERT INTO routes (slug, name, description, discipline, difficulty, distance_km, elevation_m,
          country, province, town, status, is_verified, source)
        VALUES (
          ${r.slug}, ${r.name}, ${r.description}, ${r.discipline}, ${r.difficulty},
          ${r.distanceKm}, ${r.elevationM},
          'au', ${r.province}, ${r.town}, 'approved', true, 'seed-au'
        )
        ON CONFLICT (slug) DO NOTHING
        RETURNING id
      `
      if (res.length > 0) routesInserted++
    } catch (e) { console.error(`× route ${r.slug}:`, (e as Error).message) }
  }
  console.log(`✓ routes: ${routesInserted}/${AU_ROUTES.length}`)

  // ── 4. Events ─────────────────────────────────────────────────────────
  let eventsInserted = 0
  for (const e of AU_EVENTS) {
    try {
      const res = await sql`
        INSERT INTO events (slug, title, description, event_type, status, start_date, end_date,
          country, province, city, venue, distance, website_url, entry_url, organiser_name,
          is_scraped, scrape_source, moderation_status, source)
        VALUES (
          ${e.slug}, ${e.title}, ${e.description}, ${e.eventType}, 'verified',
          ${e.startDate}, ${e.endDate ?? null},
          'au', ${e.province}, ${e.city}, ${e.venue ?? null},
          ${e.distance ?? null}, ${e.website ?? null}, ${e.entryUrl ?? null}, ${e.organiser ?? null},
          true, 'seed-au', 'approved', 'seed-au'
        )
        ON CONFLICT (slug) DO NOTHING
        RETURNING id
      `
      if (res.length > 0) eventsInserted++
    } catch (err) { console.error(`× event ${e.slug}:`, (err as Error).message) }
  }
  console.log(`✓ events: ${eventsInserted}/${AU_EVENTS.length}`)

  // ── 5. Listings ───────────────────────────────────────────────────────
  let listingsInserted = 0
  for (const l of AU_LISTINGS) {
    try {
      // look up category id
      const cat = await sql`SELECT id FROM listing_categories WHERE slug = ${l.categorySlug} LIMIT 1`
      if (!cat[0]) { console.warn(`× listing ${l.slug}: category ${l.categorySlug} missing`); continue }
      const sellerId = sellerIdByKey[l.seller]
      if (!sellerId) { console.warn(`× listing ${l.slug}: seller ${l.seller} missing`); continue }
      const res = await sql`
        INSERT INTO listings (seller_id, category_id, title, slug, description,
          bike_make, bike_model, bike_year, condition, price, country, province, city, status, moderation_status)
        VALUES (
          ${sellerId}::uuid, ${cat[0].id}, ${l.title}, ${l.slug}, ${l.description},
          ${l.bikeMake ?? null}, ${l.bikeModel ?? null}, ${l.bikeYear ?? null},
          ${l.condition}, ${l.price}, 'au', ${l.province}, ${l.city}, 'active', 'approved'
        )
        ON CONFLICT (slug) DO NOTHING
        RETURNING id
      `
      if (res.length > 0) listingsInserted++
    } catch (err) { console.error(`× listing ${l.slug}:`, (err as Error).message) }
  }
  console.log(`✓ listings: ${listingsInserted}/${AU_LISTINGS.length}`)

  // ── 6. Stolen reports ─────────────────────────────────────────────────
  let stolenInserted = 0
  for (const s of AU_STOLEN) {
    try {
      // use the first seeded AU seller as reporter so each report has an owner
      const reporterId = sellerIdByKey.alex
      const res = await sql`
        INSERT INTO stolen_reports (serial_number, brand, model, year, colour,
          source, status, saps_case_no, stolen_date, stolen_location,
          reporter_user_id, notes, country)
        VALUES (
          ${s.serial}, ${s.brand}, ${s.model ?? null}, ${s.year ?? null}, ${s.colour ?? null},
          'crankmart', 'approved', ${s.sapsCaseNo ?? null},
          ${s.stolenDate}, ${s.stolenLocation},
          ${reporterId}::uuid, ${s.description}, 'au'
        )
        ON CONFLICT DO NOTHING
        RETURNING id
      `
      if (res.length > 0) stolenInserted++
    } catch (err) { console.error(`× stolen ${s.serial}:`, (err as Error).message) }
  }
  console.log(`✓ stolen: ${stolenInserted}/${AU_STOLEN.length}`)

  console.log('\n✅ AU seed complete.')
}

main().catch(e => { console.error('seed failed:', e); process.exit(1) })
