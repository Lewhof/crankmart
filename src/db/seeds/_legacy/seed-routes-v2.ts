import { neon } from '@neondatabase/serverless'

// Load .env.local manually
import { readFileSync } from 'fs'
const envFile = readFileSync('.env.local', 'utf-8')
for (const line of envFile.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && v.length) process.env[k.trim()] = v.join('=').trim()
}

const sql = neon(process.env.DATABASE_URL!)

const routes = [
  // ── GAUTENG (8 more) ──────────────────────────────────────────────────
  {
    name: 'Cradle of Humankind Gravel Ride', slug: 'cradle-of-humankind-gravel-ride',
    description: 'A scenic gravel route through the UNESCO World Heritage Site of the Cradle of Humankind. Rolling hills, dolomite koppies, and game farm roads make this a truly unique Highveld adventure.',
    discipline: 'gravel', difficulty: 'intermediate', surface: 'gravel',
    distance_km: 65, elevation_m: 780, est_time_min: 210,
    province: 'Gauteng', region: 'West Rand', town: 'Mogale City',
    lat: -26.0167, lng: 27.6833,
    tags: ['UNESCO', 'fossils', 'game-farms', 'highveld', 'scenic'],
    is_featured: false,
  },
  {
    name: 'Suikerbosrand Nature Reserve Loop', slug: 'suikerbosrand-nature-reserve-loop',
    description: 'Mountain bike trails through the Suikerbosrand Nature Reserve south of Joburg. Rocky singletrack, wildlife sightings, and sweeping Highveld views over the veld.',
    discipline: 'mtb', difficulty: 'intermediate', surface: 'dirt',
    distance_km: 42, elevation_m: 520, est_time_min: 150,
    province: 'Gauteng', region: 'Sedibeng', town: 'Heidelberg',
    lat: -26.5167, lng: 28.3500,
    tags: ['nature-reserve', 'wildlife', 'singletrack', 'highveld'],
    is_featured: false,
  },
  {
    name: 'Magaliesberg Valley Road Ride', slug: 'magaliesberg-valley-road-ride',
    description: 'A classic road cycling escape from Joburg into the ancient Magaliesberg mountain range. Winding passes, quiet farm roads and stunning views into the valley.',
    discipline: 'road', difficulty: 'intermediate', surface: 'tarmac',
    distance_km: 95, elevation_m: 1100, est_time_min: 240,
    province: 'Gauteng', region: 'Magaliesberg', town: 'Hekpoort',
    lat: -25.9500, lng: 27.7167,
    tags: ['mountain-pass', 'escape-joburg', 'scenic', 'road-classic'],
    is_featured: true,
  },
  {
    name: 'Hennops River Gravel Trail', slug: 'hennops-river-gravel-trail',
    description: 'A technical gravel route following the Hennops River valley north of Centurion. River crossings, rocky jeep tracks and great birdlife along this underrated Pretoria escape.',
    discipline: 'gravel', difficulty: 'intermediate', surface: 'gravel',
    distance_km: 38, elevation_m: 320, est_time_min: 120,
    province: 'Gauteng', region: 'Tshwane', town: 'Centurion',
    lat: -25.8553, lng: 28.1883,
    tags: ['river-crossings', 'birdlife', 'jeep-track', 'pretoria'],
    is_featured: false,
  },
  {
    name: 'Hartebeespoort Dam Rim Ride', slug: 'hartebeespoort-dam-rim-ride',
    description: 'A popular weekend road loop circumnavigating the Hartebeespoort Dam. Cafes, mountain views and easy access from both Joburg and Pretoria. Perfect for a big group ride.',
    discipline: 'road', difficulty: 'beginner', surface: 'tarmac',
    distance_km: 55, elevation_m: 380, est_time_min: 130,
    province: 'Gauteng', region: 'Magaliesberg', town: 'Hartbeespoort',
    lat: -25.7500, lng: 27.8833,
    tags: ['dam', 'group-ride', 'weekend', 'coffee-stop', 'beginner-friendly'],
    is_featured: false,
  },
  {
    name: 'Waterval Boven Descent', slug: 'waterval-boven-descent',
    description: 'One of Mpumalanga\'s most thrilling road descents. The route drops from the Highveld escarpment down to Waterval Boven with dramatic waterfalls and cliff faces.',
    discipline: 'road', difficulty: 'advanced', surface: 'tarmac',
    distance_km: 72, elevation_m: 1450, est_time_min: 195,
    province: 'Mpumalanga', region: 'Nkangala', town: 'Waterval Boven',
    lat: -25.6500, lng: 30.3667,
    tags: ['descent', 'waterfall', 'escarpment', 'epic-views', 'technical'],
    is_featured: true,
  },
  {
    name: 'Joburg Parks Road Sportive', slug: 'joburg-parks-road-sportive',
    description: 'A curated route through Joburg\'s northern suburbs linking the major parks — Delta Park, Emmarentia, Melrose and Zoo Lake. Great for mid-week training and exploring green Joburg.',
    discipline: 'road', difficulty: 'beginner', surface: 'tarmac',
    distance_km: 32, elevation_m: 210, est_time_min: 75,
    province: 'Gauteng', region: 'City of Johannesburg', town: 'Johannesburg',
    lat: -26.1415, lng: 28.0195,
    tags: ['parks', 'urban', 'training', 'social', 'morning-ride'],
    is_featured: false,
  },
  {
    name: 'Cullinan Diamond Mine Circuit', slug: 'cullinan-diamond-mine-circuit',
    description: 'A heritage road ride around the historic diamond-mining town of Cullinan east of Pretoria. Quiet farm roads, old mine infrastructure and a charming Victorian village centre.',
    discipline: 'road', difficulty: 'beginner', surface: 'tarmac',
    distance_km: 48, elevation_m: 290, est_time_min: 110,
    province: 'Gauteng', region: 'Tshwane East', town: 'Cullinan',
    lat: -25.6833, lng: 28.5167,
    tags: ['heritage', 'diamonds', 'village', 'quiet-roads', 'historic'],
    is_featured: false,
  },

  // ── WESTERN CAPE (8 more) ─────────────────────────────────────────────
  {
    name: 'Elgin Valley Orchard Loop', slug: 'elgin-valley-orchard-loop',
    description: 'A stunning road ride through the apple and pear orchards of the Elgin Valley. Rolling terrain between Grabouw and Elgin with mountain backdrops and farm stalls en route.',
    discipline: 'road', difficulty: 'intermediate', surface: 'tarmac',
    distance_km: 62, elevation_m: 640, est_time_min: 165,
    province: 'Western Cape', region: 'Overberg', town: 'Grabouw',
    lat: -34.1667, lng: 19.0167,
    tags: ['orchards', 'farming', 'mountain-views', 'scenic', 'fruit-valley'],
    is_featured: false,
  },
  {
    name: 'Swartberg Pass Gravel Epic', slug: 'swartberg-pass-gravel-epic',
    description: 'One of South Africa\'s great gravel challenges. The Swartberg Pass is an unpaved national monument linking Prince Albert to Oudtshoorn. Steep, remote and utterly spectacular.',
    discipline: 'gravel', difficulty: 'expert', surface: 'gravel',
    distance_km: 48, elevation_m: 2200, est_time_min: 300,
    province: 'Western Cape', region: 'Klein Karoo', town: 'Prince Albert',
    lat: -33.2167, lng: 22.0333,
    tags: ['mountain-pass', 'national-monument', 'remote', 'historic-road', 'epic'],
    is_featured: true,
  },
  {
    name: 'Robertson Wine Valley Ride', slug: 'robertson-wine-valley-ride',
    description: 'A gentle wine valley road ride through Robertson and McGregor. Vineyard-lined roads, mountain backdrops and excellent winery stops make this a perfect leisure route.',
    discipline: 'road', difficulty: 'beginner', surface: 'tarmac',
    distance_km: 45, elevation_m: 280, est_time_min: 110,
    province: 'Western Cape', region: 'Breede River Valley', town: 'Robertson',
    lat: -33.8000, lng: 19.8833,
    tags: ['wine', 'valley', 'vineyards', 'leisure', 'wine-tasting'],
    is_featured: false,
  },
  {
    name: 'Paardeberg Gravel Farms', slug: 'paardeberg-gravel-farms',
    description: 'A scenic gravel exploration around the Paardeberg granite dome near Malmesbury. Farm roads, fynbos, wheat fields and quiet gravel tracks through the Swartland.',
    discipline: 'gravel', difficulty: 'intermediate', surface: 'gravel',
    distance_km: 58, elevation_m: 420, est_time_min: 170,
    province: 'Western Cape', region: 'Swartland', town: 'Malmesbury',
    lat: -33.4600, lng: 18.7300,
    tags: ['swartland', 'granite', 'fynbos', 'farm-roads', 'wheat-fields'],
    is_featured: false,
  },
  {
    name: 'Tulbagh Valley Road Ride', slug: 'tulbagh-valley-road-ride',
    description: 'A beautiful road ride through the historic Tulbagh Valley surrounded by the Winterhoek Mountains. Quiet roads, fruit farms, and a beautifully preserved 18th-century main street.',
    discipline: 'road', difficulty: 'beginner', surface: 'tarmac',
    distance_km: 40, elevation_m: 310, est_time_min: 95,
    province: 'Western Cape', region: 'Cape Winelands', town: 'Tulbagh',
    lat: -33.2833, lng: 19.1333,
    tags: ['historic', 'mountain-valley', 'fruit-farms', 'heritage'],
    is_featured: false,
  },
  {
    name: 'Knysna Forest MTB Trails', slug: 'knysna-forest-mtb-trails',
    description: 'Singletrack through the indigenous Knysna forests. Ancient yellowwood trees, fern-lined trails and the possibility of spotting forest elephants on this magical Garden Route ride.',
    discipline: 'mtb', difficulty: 'intermediate', surface: 'dirt',
    distance_km: 30, elevation_m: 480, est_time_min: 135,
    province: 'Western Cape', region: 'Garden Route', town: 'Knysna',
    lat: -34.0356, lng: 23.0474,
    tags: ['indigenous-forest', 'singletrack', 'elephants', 'garden-route', 'yellowwood'],
    is_featured: true,
  },
  {
    name: 'Montagu Mountain Gravel Loop', slug: 'montagu-mountain-gravel-loop',
    description: 'A gravel adventure in the Langeberg mountains above Montagu. Rocky mountain passes, stunning valley views and access to the famous Montagu hot springs at the end.',
    discipline: 'gravel', difficulty: 'advanced', surface: 'gravel',
    distance_km: 55, elevation_m: 980, est_time_min: 210,
    province: 'Western Cape', region: 'Cape Winelands', town: 'Montagu',
    lat: -33.7833, lng: 20.1167,
    tags: ['mountain-pass', 'hot-springs', 'langeberg', 'rocky', 'reward'],
    is_featured: false,
  },
  {
    name: 'Hemel-en-Aarde Valley Gravel', slug: 'hemel-en-aarde-valley-gravel',
    description: 'Gravel riding through the premium wine valley behind Hermanus. Famous Pinot Noir vineyards, fynbos corridors and mountain views over Walker Bay make this an exceptional route.',
    discipline: 'gravel', difficulty: 'intermediate', surface: 'gravel',
    distance_km: 44, elevation_m: 510, est_time_min: 150,
    province: 'Western Cape', region: 'Overberg', town: 'Hermanus',
    lat: -34.4000, lng: 19.2500,
    tags: ['wine-valley', 'fynbos', 'pinot-noir', 'walker-bay', 'premium'],
    is_featured: false,
  },

  // ── KWAZULU-NATAL (8 more) ────────────────────────────────────────────
  {
    name: 'Valley of a Thousand Hills Road Ride', slug: 'valley-of-a-thousand-hills-road-ride',
    description: 'Dramatic road cycling through the iconic Valley of a Thousand Hills west of Durban. Steep climbs, sweeping valley views and traditional Zulu homesteads along the route.',
    discipline: 'road', difficulty: 'advanced', surface: 'tarmac',
    distance_km: 78, elevation_m: 1350, est_time_min: 230,
    province: 'KwaZulu-Natal', region: 'iLembe', town: 'Hillcrest',
    lat: -29.7667, lng: 30.7667,
    tags: ['valley', 'zulu-culture', 'climbs', 'iconic', 'scenic'],
    is_featured: true,
  },
  {
    name: 'Midlands Meander Gravel Route', slug: 'midlands-meander-gravel-route',
    description: 'Gravel riding through the KZN Midlands linking craft studios, cheese farms and trout dams. The Midlands Meander road network translates perfectly into gravel adventure.',
    discipline: 'gravel', difficulty: 'intermediate', surface: 'gravel',
    distance_km: 68, elevation_m: 720, est_time_min: 210,
    province: 'KwaZulu-Natal', region: 'uMgungundlovu', town: 'Nottingham Road',
    lat: -29.4000, lng: 30.1333,
    tags: ['meander', 'midlands', 'cheese', 'craft', 'trout', 'gravel'],
    is_featured: false,
  },
  {
    name: 'Drakensberg Foothills MTB', slug: 'drakensberg-foothills-mtb',
    description: 'Mountain biking in the foothills below the Drakensberg. Access to world-class singletrack in the Cathedral Peak and Champagne Castle areas with dramatic basalt cliff backdrops.',
    discipline: 'mtb', difficulty: 'advanced', surface: 'dirt',
    distance_km: 35, elevation_m: 820, est_time_min: 165,
    province: 'KwaZulu-Natal', region: 'uThukela', town: 'Winterton',
    lat: -28.8000, lng: 29.5333,
    tags: ['drakensberg', 'singletrack', 'basalt', 'cathedral-peak', 'mountain'],
    is_featured: true,
  },
  {
    name: 'Umgeni River Gorge Gravel', slug: 'umgeni-river-gorge-gravel',
    description: 'A gravel route following the Umgeni River gorge near Howick. The famous Howick Falls, river crossings and indigenous bush make this a wild KZN adventure.',
    discipline: 'gravel', difficulty: 'intermediate', surface: 'gravel',
    distance_km: 40, elevation_m: 560, est_time_min: 145,
    province: 'KwaZulu-Natal', region: 'uMgungundlovu', town: 'Howick',
    lat: -29.4833, lng: 30.2333,
    tags: ['waterfall', 'river', 'gorge', 'indigenous-bush', 'howick'],
    is_featured: false,
  },
  {
    name: 'North Coast Beach Road Ride', slug: 'north-coast-beach-road-ride',
    description: 'A flat coastal road ride along the KZN North Coast from Ballito to Salt Rock. Ocean breezes, sugar cane fields and access to beach stops make this an easy seaside cruise.',
    discipline: 'road', difficulty: 'beginner', surface: 'tarmac',
    distance_km: 38, elevation_m: 180, est_time_min: 85,
    province: 'KwaZulu-Natal', region: 'iLembe', town: 'Ballito',
    lat: -29.5333, lng: 31.2167,
    tags: ['coastal', 'flat', 'ocean', 'sugar-cane', 'beach', 'easy'],
    is_featured: false,
  },
  {
    name: 'Giants Castle Game Reserve Ride', slug: 'giants-castle-game-reserve-ride',
    description: 'A gravel and jeep-track ride through the Giants Castle Game Reserve in the central Drakensberg. Eland, black eagles and cave paintings accessible on this remote wilderness route.',
    discipline: 'gravel', difficulty: 'advanced', surface: 'gravel',
    distance_km: 50, elevation_m: 950, est_time_min: 210,
    province: 'KwaZulu-Natal', region: 'uThukela', town: 'Estcourt',
    lat: -29.2500, lng: 29.5000,
    tags: ['game-reserve', 'eland', 'cave-paintings', 'remote', 'drakensberg'],
    is_featured: false,
  },
  {
    name: 'Durban Beachfront to Umhlanga', slug: 'durban-beachfront-to-umhlanga',
    description: 'A popular urban coastal ride from Durban beachfront along the Blue Flag beaches to Umhlanga Rocks. Flat, fast and perfect for early morning training or a social weekend spin.',
    discipline: 'road', difficulty: 'beginner', surface: 'tarmac',
    distance_km: 28, elevation_m: 120, est_time_min: 65,
    province: 'KwaZulu-Natal', region: 'eThekwini', town: 'Durban',
    lat: -29.8667, lng: 31.0333,
    tags: ['coastal', 'flat', 'urban', 'beach', 'morning-ride', 'social'],
    is_featured: false,
  },
  {
    name: 'Karkloof Enduro Trails', slug: 'karkloof-enduro-trails',
    description: 'World-class enduro singletrack in the Karkloof Forest above Howick. Host of major enduro races, with machine-built trails through indigenous mistbelt forest.',
    discipline: 'mtb', difficulty: 'advanced', surface: 'dirt',
    distance_km: 28, elevation_m: 740, est_time_min: 130,
    province: 'KwaZulu-Natal', region: 'uMgungundlovu', town: 'Howick',
    lat: -29.4667, lng: 30.2000,
    tags: ['enduro', 'singletrack', 'mistbelt-forest', 'race-venue', 'karkloof'],
    is_featured: true,
  },

  // ── EASTERN CAPE (6 more) ─────────────────────────────────────────────
  {
    name: 'Addo Elephant Park Gravel Rim', slug: 'addo-elephant-park-gravel-rim',
    description: 'A gravel route on the boundary of Addo Elephant National Park near Port Elizabeth. Flat citrus farmlands, game-fenced boundaries and possible elephant sightings from the road.',
    discipline: 'gravel', difficulty: 'beginner', surface: 'gravel',
    distance_km: 55, elevation_m: 280, est_time_min: 150,
    province: 'Eastern Cape', region: 'Cacadu', town: 'Addo',
    lat: -33.5500, lng: 25.7333,
    tags: ['elephants', 'game-park', 'citrus', 'flat', 'national-park'],
    is_featured: false,
  },
  {
    name: 'Hogsback Forest Trail', slug: 'hogsback-forest-trail',
    description: 'Mountain biking through the mystical Hogsback forests in the Amatola Mountains. Ancient indigenous trees, waterfalls and mist-shrouded singletrack on this Eastern Cape gem.',
    discipline: 'mtb', difficulty: 'intermediate', surface: 'dirt',
    distance_km: 24, elevation_m: 580, est_time_min: 110,
    province: 'Eastern Cape', region: 'Amathole', town: 'Hogsback',
    lat: -32.5833, lng: 26.9333,
    tags: ['forest', 'waterfalls', 'mist', 'indigenous', 'mystical', 'amatola'],
    is_featured: false,
  },
  {
    name: 'Port Elizabeth Beach Loop', slug: 'port-elizabeth-beach-loop',
    description: 'A popular road and beachfront cycling route in Gqeberha (Port Elizabeth). Flat beachfront promenade, Summerstrand coastal road and suburban parks on this accessible city ride.',
    discipline: 'road', difficulty: 'beginner', surface: 'tarmac',
    distance_km: 35, elevation_m: 150, est_time_min: 80,
    province: 'Eastern Cape', region: 'Nelson Mandela Bay', town: 'Gqeberha',
    lat: -33.9600, lng: 25.6020,
    tags: ['beach', 'urban', 'promenade', 'flat', 'coastal', 'pe'],
    is_featured: false,
  },
  {
    name: 'Graaff-Reinet Karoo Gravel', slug: 'graaff-reinet-karoo-gravel',
    description: 'Gravel riding in the heart of the Great Karoo around the "Gem of the Karoo." Dramatic Camdeboo rock formations, game reserve borders and stark Karoo landscapes on vast farm roads.',
    discipline: 'gravel', difficulty: 'intermediate', surface: 'gravel',
    distance_km: 75, elevation_m: 420, est_time_min: 225,
    province: 'Eastern Cape', region: 'Cacadu', town: 'Graaff-Reinet',
    lat: -32.2500, lng: 24.5333,
    tags: ['karoo', 'camdeboo', 'rock-formations', 'remote', 'vast'],
    is_featured: false,
  },
  {
    name: 'Wild Coast Gravel Adventure', slug: 'wild-coast-gravel-adventure',
    description: 'A multi-day gravel adventure along the Wild Coast. Crossing rivers, staying in rural villages and riding clifftop paths with Indian Ocean views make this a bucket-list SA route.',
    discipline: 'gravel', difficulty: 'expert', surface: 'gravel',
    distance_km: 120, elevation_m: 1600, est_time_min: 480,
    province: 'Eastern Cape', region: 'OR Tambo', town: 'Coffee Bay',
    lat: -31.9833, lng: 29.1500,
    tags: ['wild-coast', 'multi-day', 'villages', 'clifftop', 'bucket-list', 'rivers'],
    is_featured: true,
  },
  {
    name: 'Tsitsikamma Coastal Trail Ride', slug: 'tsitsikamma-coastal-trail-ride',
    description: 'Road and gravel riding through the Tsitsikamma coastal zone. Ancient forests, dramatic coastline and the iconic Storms River Mouth feature on this Garden Route epic.',
    discipline: 'gravel', difficulty: 'intermediate', surface: 'gravel',
    distance_km: 58, elevation_m: 720, est_time_min: 190,
    province: 'Eastern Cape', region: 'Sarah Baartman', town: 'Storms River',
    lat: -33.9833, lng: 23.8833,
    tags: ['tsitsikamma', 'coastal', 'ancient-forest', 'storms-river', 'garden-route'],
    is_featured: false,
  },

  // ── LIMPOPO (5 more) ──────────────────────────────────────────────────
  {
    name: 'Magoebaskloof Mountain Pass', slug: 'magoebaskloof-mountain-pass',
    description: 'One of Limpopo\'s most scenic road descents through the Magoebaskloof pass. Dense indigenous forest, tea plantations, waterfalls and sweeping views over the escarpment.',
    discipline: 'road', difficulty: 'advanced', surface: 'tarmac',
    distance_km: 65, elevation_m: 1250, est_time_min: 185,
    province: 'Limpopo', region: 'Mopani', town: 'Tzaneen',
    lat: -23.8333, lng: 30.1667,
    tags: ['mountain-pass', 'tea', 'waterfalls', 'forest', 'escarpment', 'scenic'],
    is_featured: true,
  },
  {
    name: 'Waterberg Gravel Safari', slug: 'waterberg-gravel-safari',
    description: 'Gravel riding through the Waterberg biosphere reserve. Malaria-free game country, ancient sandstone formations and rough farm roads make this a true bush cycling adventure.',
    discipline: 'gravel', difficulty: 'advanced', surface: 'gravel',
    distance_km: 90, elevation_m: 680, est_time_min: 285,
    province: 'Limpopo', region: 'Waterberg', town: 'Vaalwater',
    lat: -24.3000, lng: 28.1000,
    tags: ['biosphere', 'game', 'sandstone', 'bush', 'malaria-free', 'safari'],
    is_featured: false,
  },
  {
    name: 'Blouberg Mountain Gravel Loop', slug: 'blouberg-mountain-gravel-loop',
    description: 'A remote gravel loop around Blouberg in the far north of Limpopo. The blue mountain dominates the landscape of this remote cycling expedition through traditional Venda villages.',
    discipline: 'gravel', difficulty: 'expert', surface: 'gravel',
    distance_km: 85, elevation_m: 1100, est_time_min: 300,
    province: 'Limpopo', region: 'Vhembe', town: 'Bochum',
    lat: -22.9500, lng: 29.0500,
    tags: ['remote', 'venda', 'villages', 'expedition', 'blue-mountain'],
    is_featured: false,
  },
  {
    name: 'Tzaneen Avocado Country Road Ride', slug: 'tzaneen-avocado-country-road-ride',
    description: 'A road ride through Limpopo\'s lush avocado and mango farming region around Tzaneen. Surprising greenery, gentle hills and farm store stops on this fertile subtropical route.',
    discipline: 'road', difficulty: 'beginner', surface: 'tarmac',
    distance_km: 52, elevation_m: 380, est_time_min: 125,
    province: 'Limpopo', region: 'Mopani', town: 'Tzaneen',
    lat: -23.8333, lng: 30.1833,
    tags: ['avocado', 'mango', 'subtropical', 'farms', 'green', 'fertile'],
    is_featured: false,
  },
  {
    name: 'Louis Trichardt Mountain Pass Circuit', slug: 'louis-trichardt-mountain-pass-circuit',
    description: 'Road cycling through the passes around Louis Trichardt in the Soutpansberg mountains. The Wylliespoort and Bothas Pass combination creates a dramatic mountain circuit.',
    discipline: 'road', difficulty: 'advanced', surface: 'tarmac',
    distance_km: 70, elevation_m: 1180, est_time_min: 210,
    province: 'Limpopo', region: 'Vhembe', town: 'Louis Trichardt',
    lat: -23.0500, lng: 29.9167,
    tags: ['mountain-pass', 'soutpansberg', 'circuit', 'climbs', 'passes'],
    is_featured: false,
  },

  // ── MPUMALANGA (5 more) ───────────────────────────────────────────────
  {
    name: 'Blyde River Canyon Rim Ride', slug: 'blyde-river-canyon-rim-ride',
    description: 'Road cycling along the rim of the Blyde River Canyon — one of the largest canyons in the world. The Three Rondavels and Bourke\'s Luck Potholes are visible en route.',
    discipline: 'road', difficulty: 'intermediate', surface: 'tarmac',
    distance_km: 58, elevation_m: 820, est_time_min: 160,
    province: 'Mpumalanga', region: 'Ehlanzeni', town: 'Graskop',
    lat: -24.9333, lng: 30.8333,
    tags: ['canyon', 'three-rondavels', 'potholes', 'panorama-route', 'epic-views'],
    is_featured: true,
  },
  {
    name: 'Sabie Forestry Gravel Trails', slug: 'sabie-forestry-gravel-trails',
    description: 'Gravel riding through the commercial forestry roads around Sabie. Fast, smooth gravel through pine and eucalyptus plantations with stunning waterfalls accessible as side trips.',
    discipline: 'gravel', difficulty: 'intermediate', surface: 'gravel',
    distance_km: 48, elevation_m: 560, est_time_min: 155,
    province: 'Mpumalanga', region: 'Ehlanzeni', town: 'Sabie',
    lat: -25.1000, lng: 30.7833,
    tags: ['forestry', 'waterfalls', 'plantations', 'fast-gravel', 'panorama'],
    is_featured: false,
  },
  {
    name: 'Dullstroom Highlands MTB', slug: 'dullstroom-highlands-mtb',
    description: 'Mountain biking on the open Mpumalanga Highlands around Dullstroom. Moorland, trout streams, wattle forests and fly-fishing dams on this high-altitude cool-weather escape.',
    discipline: 'mtb', difficulty: 'intermediate', surface: 'dirt',
    distance_km: 32, elevation_m: 380, est_time_min: 120,
    province: 'Mpumalanga', region: 'Nkangala', town: 'Dullstroom',
    lat: -25.4000, lng: 30.1167,
    tags: ['highlands', 'trout', 'moorland', 'high-altitude', 'cool', 'dullstroom'],
    is_featured: false,
  },
  {
    name: 'Long Tom Pass Road Ride', slug: 'long-tom-pass-road-ride',
    description: 'A classic Mpumalanga road climb over the Long Tom Pass from Lydenburg to Sabie. The highest point on the road between Lydenburg and Sabie, with Anglo-Boer War history at the summit.',
    discipline: 'road', difficulty: 'advanced', surface: 'tarmac',
    distance_km: 55, elevation_m: 1380, est_time_min: 175,
    province: 'Mpumalanga', region: 'Ehlanzeni', town: 'Lydenburg',
    lat: -25.1000, lng: 30.4667,
    tags: ['mountain-pass', 'boer-war', 'history', 'climb', 'summit'],
    is_featured: false,
  },
  {
    name: 'Barberton Mountain Land Gravel', slug: 'barberton-mountain-land-gravel',
    description: 'Gravel riding through the ancient Barberton Mountainland — one of the oldest geological formations on Earth. Gold rush history, mountain passes and wild singletrack.',
    discipline: 'gravel', difficulty: 'expert', surface: 'gravel',
    distance_km: 78, elevation_m: 1250, est_time_min: 285,
    province: 'Mpumalanga', region: 'Ehlanzeni', town: 'Barberton',
    lat: -25.7833, lng: 31.0500,
    tags: ['ancient-geology', 'gold-rush', 'mountain-land', 'remote', 'history'],
    is_featured: false,
  },

  // ── FREE STATE (5 more) ───────────────────────────────────────────────
  {
    name: 'Golden Gate Highlands Circuit', slug: 'golden-gate-highlands-circuit',
    description: 'Road and gravel riding through the Golden Gate Highlands National Park. Dramatic sandstone cliffs lit in golden hues, blesbok herds and high-altitude Drakensberg foothills.',
    discipline: 'gravel', difficulty: 'intermediate', surface: 'gravel',
    distance_km: 62, elevation_m: 720, est_time_min: 195,
    province: 'Free State', region: 'Thabo Mofutsanyana', town: 'Clarens',
    lat: -28.5167, lng: 28.5000,
    tags: ['national-park', 'sandstone', 'blesbok', 'golden-cliffs', 'clarens'],
    is_featured: true,
  },
  {
    name: 'Clarens Art Village Road Ride', slug: 'clarens-art-village-road-ride',
    description: 'A scenic road ride from the charming art village of Clarens through the Rooiberge and Witteberg foothills. Sandstone koppies, mountain streams and a thriving local cycling culture.',
    discipline: 'road', difficulty: 'intermediate', surface: 'tarmac',
    distance_km: 48, elevation_m: 540, est_time_min: 135,
    province: 'Free State', region: 'Thabo Mofutsanyana', town: 'Clarens',
    lat: -28.5333, lng: 28.4333,
    tags: ['art-village', 'sandstone', 'mountain-streams', 'clarens', 'scenic'],
    is_featured: false,
  },
  {
    name: 'Bloemfontein Rose Garden Loop', slug: 'bloemfontein-rose-garden-loop',
    description: 'An accessible road and bike path circuit linking Bloemfontein\'s parks and rose gardens. Kings Park, Naval Hill and Loch Logan on this flat urban training route.',
    discipline: 'road', difficulty: 'beginner', surface: 'tarmac',
    distance_km: 28, elevation_m: 130, est_time_min: 65,
    province: 'Free State', region: 'Mangaung', town: 'Bloemfontein',
    lat: -29.1167, lng: 26.2167,
    tags: ['urban', 'parks', 'flat', 'training', 'rose-gardens', 'bloem'],
    is_featured: false,
  },
  {
    name: 'Roodewal Free State Gravel', slug: 'roodewal-free-state-gravel',
    description: 'A classic Free State gravel ride on farm roads through wheat fields, sunflower crops and cattle farms. Big skies, minimal traffic and the pure freedom of Highveld gravel riding.',
    discipline: 'gravel', difficulty: 'beginner', surface: 'gravel',
    distance_km: 55, elevation_m: 240, est_time_min: 155,
    province: 'Free State', region: 'Lejweleputswa', town: 'Bothaville',
    lat: -27.3833, lng: 26.6167,
    tags: ['wheat-fields', 'sunflowers', 'big-skies', 'flat', 'farm-roads', 'highveld'],
    is_featured: false,
  },
  {
    name: 'Ficksburg Cherry Country Ride', slug: 'ficksburg-cherry-country-ride',
    description: 'Road cycling through South Africa\'s cherry capital in the Ficksburg district. Cherry orchards in blossom, Maluti mountain views and farm stall stops on this seasonal delight.',
    discipline: 'road', difficulty: 'intermediate', surface: 'tarmac',
    distance_km: 52, elevation_m: 480, est_time_min: 140,
    province: 'Free State', region: 'Thabo Mofutsanyana', town: 'Ficksburg',
    lat: -28.8833, lng: 27.8833,
    tags: ['cherries', 'orchards', 'maluti-mountains', 'seasonal', 'farm-stalls'],
    is_featured: false,
  },

  // ── NORTH WEST (4 more) ───────────────────────────────────────────────
  {
    name: 'Pilanesberg Safari Gravel', slug: 'pilanesberg-safari-gravel',
    description: 'Gravel riding on the roads surrounding the Pilanesberg Game Reserve crater. Big Five territory, ancient volcanic crater geology and game fence riding make this unique.',
    discipline: 'gravel', difficulty: 'intermediate', surface: 'gravel',
    distance_km: 65, elevation_m: 480, est_time_min: 200,
    province: 'North West', region: 'Bojanala Platinum', town: 'Sun City',
    lat: -25.2500, lng: 27.1000,
    tags: ['game-reserve', 'big-five', 'volcanic-crater', 'safari', 'pilanesberg'],
    is_featured: true,
  },
  {
    name: 'Vryburg Kalahari Gravel Epic', slug: 'vryburg-kalahari-gravel-epic',
    description: 'A remote gravel adventure on the edge of the Kalahari around Vryburg. Red sand roads, thorn bush, cattle farms and big African skies on this wild semi-desert gravel route.',
    discipline: 'gravel', difficulty: 'intermediate', surface: 'gravel',
    distance_km: 85, elevation_m: 280, est_time_min: 255,
    province: 'North West', region: 'Dr Ruth Segomotsi Mompati', town: 'Vryburg',
    lat: -26.9500, lng: 24.7333,
    tags: ['kalahari', 'red-sand', 'thorn-bush', 'remote', 'semi-desert'],
    is_featured: false,
  },
  {
    name: 'Rustenburg Kgaswane MTB Trails', slug: 'rustenburg-kgaswane-mtb-trails',
    description: 'Mountain biking in the Kgaswane Mountain Reserve above Rustenburg. Rocky Magaliesberg singletrack with sweeping views over the platinum belt and Rustenburg valley.',
    discipline: 'mtb', difficulty: 'intermediate', surface: 'dirt',
    distance_km: 25, elevation_m: 580, est_time_min: 110,
    province: 'North West', region: 'Bojanala Platinum', town: 'Rustenburg',
    lat: -25.6667, lng: 27.2500,
    tags: ['nature-reserve', 'singletrack', 'magaliesberg', 'platinum-belt', 'views'],
    is_featured: false,
  },
  {
    name: 'Potchefstroom Dam Circuit', slug: 'potchefstroom-dam-circuit',
    description: 'A flat road circuit around the Potchefstroom Dam popular with Potch cyclists and students. Smooth roads, lake views and good cafe options in the university town make this a social ride.',
    discipline: 'road', difficulty: 'beginner', surface: 'tarmac',
    distance_km: 35, elevation_m: 160, est_time_min: 80,
    province: 'North West', region: 'Dr Kenneth Kaunda', town: 'Potchefstroom',
    lat: -26.7167, lng: 27.1000,
    tags: ['dam', 'flat', 'university', 'social', 'students', 'potch'],
    is_featured: false,
  },

  // ── NORTHERN CAPE (5 more) ────────────────────────────────────────────
  {
    name: 'Namaqualand Flower Route Gravel', slug: 'namaqualand-flower-route-gravel',
    description: 'A seasonal gravel route through Namaqualand during the spring flower season (Aug-Sept). Millions of wild flowers carpeting the semi-desert make this the most spectacular gravel ride in SA.',
    discipline: 'gravel', difficulty: 'intermediate', surface: 'gravel',
    distance_km: 95, elevation_m: 520, est_time_min: 290,
    province: 'Northern Cape', region: 'Namakwa', town: 'Springbok',
    lat: -29.6667, lng: 17.8833,
    tags: ['wildflowers', 'namaqualand', 'seasonal', 'semi-desert', 'spectacular'],
    is_featured: true,
  },
  {
    name: 'Kimberley Big Hole Diamond Route', slug: 'kimberley-big-hole-diamond-route',
    description: 'An urban heritage road ride around Kimberley\'s diamond mining history. The Big Hole, Sol Plaatje museum and historic mine buildings feature on this flat city cycling route.',
    discipline: 'road', difficulty: 'beginner', surface: 'tarmac',
    distance_km: 32, elevation_m: 120, est_time_min: 75,
    province: 'Northern Cape', region: 'Frances Baard', town: 'Kimberley',
    lat: -28.7333, lng: 24.7667,
    tags: ['diamonds', 'heritage', 'big-hole', 'urban', 'historic', 'flat'],
    is_featured: false,
  },
  {
    name: 'Augrabies Falls Desert Ride', slug: 'augrabies-falls-desert-ride',
    description: 'A gravel route through the Augrabies National Park surrounds. The Orange River gorge, desert landscapes and proximity to the thundering Augrabies Falls make this unforgettable.',
    discipline: 'gravel', difficulty: 'advanced', surface: 'gravel',
    distance_km: 70, elevation_m: 380, est_time_min: 225,
    province: 'Northern Cape', region: 'Khara Hais', town: 'Kakamas',
    lat: -28.5833, lng: 20.3333,
    tags: ['desert', 'orange-river', 'national-park', 'gorge', 'waterfalls'],
    is_featured: false,
  },
  {
    name: 'Sutherland Starfields Gravel', slug: 'sutherland-starfields-gravel',
    description: 'A remote gravel route around the world-famous SALT telescope site above Sutherland. At 1450m altitude with the clearest skies in Africa, this is cycling under the stars of the Karoo.',
    discipline: 'gravel', difficulty: 'intermediate', surface: 'gravel',
    distance_km: 55, elevation_m: 420, est_time_min: 175,
    province: 'Northern Cape', region: 'Pixley ka Seme', town: 'Sutherland',
    lat: -32.4000, lng: 20.6667,
    tags: ['telescope', 'stargazing', 'karoo', 'high-altitude', 'remote', 'SALT'],
    is_featured: false,
  },
  {
    name: 'Orania and Orange River Gravel', slug: 'orania-and-orange-river-gravel',
    description: 'Gravel riding along the banks of the mighty Orange River through the Northern Cape\'s pecan and date farming regions. Irrigated farmland, river crossings and vast Karoo perspectives.',
    discipline: 'gravel', difficulty: 'beginner', surface: 'gravel',
    distance_km: 60, elevation_m: 210, est_time_min: 180,
    province: 'Northern Cape', region: 'Pixley ka Seme', town: 'Orania',
    lat: -29.8000, lng: 24.4000,
    tags: ['orange-river', 'pecan', 'date-farms', 'irrigation', 'karoo'],
    is_featured: false,
  },
]

async function seed() {
  console.log(`Seeding ${routes.length} new routes...`)
  let inserted = 0
  let skipped = 0

  for (const r of routes) {
    try {
      // Check if slug already exists
      const existing = await sql`SELECT id FROM routes WHERE slug = ${r.slug} LIMIT 1`
      if (existing.length > 0) {
        console.log(`  SKIP: ${r.slug} (already exists)`)
        skipped++
        continue
      }

      await sql`
        INSERT INTO routes (
          slug, name, description, discipline, difficulty, surface,
          distance_km, elevation_m, est_time_min,
          province, region, town, lat, lng,
          hero_image_url, facilities, tags,
          website_url, is_verified, is_featured, status,
          views_count, saves_count
        ) VALUES (
          ${r.slug}, ${r.name}, ${r.description},
          ${r.discipline}, ${r.difficulty}, ${r.surface},
          ${r.distance_km}, ${r.elevation_m}, ${r.est_time_min},
          ${r.province}, ${r.region}, ${r.town},
          ${r.lat}, ${r.lng},
          ${null},
          ${'{}'}::jsonb,
          ${r.tags}::text[],
          ${null},
          ${true},
          ${r.is_featured},
          ${'approved'},
          ${0}, ${0}
        )
      `
      console.log(`  ✅ ${r.name} (${r.province})`)
      inserted++
    } catch (e: any) {
      console.error(`  ❌ ${r.slug}: ${e.message}`)
    }
  }

  console.log(`\nDone: ${inserted} inserted, ${skipped} skipped`)

  // Show totals by province
  const totals = await sql`
    SELECT province, COUNT(*) as count FROM routes WHERE status = 'approved'
    GROUP BY province ORDER BY count DESC
  `
  console.log('\nRoutes by province:')
  for (const row of totals) {
    console.log(`  ${row.province}: ${row.count}`)
  }
}

seed().catch(console.error)
// This won't run — keeping here for reference

