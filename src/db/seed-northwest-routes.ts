/**
 * Seed North West Province cycling routes + route_loops
 * Run: DATABASE_URL="..." npx tsx src/db/seed-northwest-routes.ts
 *
 * Covers: Rustenburg, Klerksdorp, Brits, Mafikeng, Zeerust,
 * Lichtenburg, Wolmaransstad, Pilanesberg additions, Magalies additions,
 * Schoemansville, Thabazimbi border, Groot Marico
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
  'rustenburg-city-road-loop':
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200&q=80',
  'pilanesberg-national-park-gravel-safari':
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80',
  'magaliesberg-valley-gravel-meander':
    'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1200&q=80',
  'schoemansville-harties-road-loop':
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80',
  'groot-marico-bushveld-gravel':
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80',
}

// ── routes + their loops bundled together ──────────────────────────────
const data = [

  // ══════════════════════════════════════════════════════════════════════
  // RUSTENBURG
  // ══════════════════════════════════════════════════════════════════════
  {
    route: {
      name: 'Rustenburg City Road Loop',
      slug: 'rustenburg-city-road-loop',
      description:
        'The standard Rustenburg road cycling training loop used by local clubs. The route leaves the city centre via the R24, climbs through Protea Park and loops via Cashan, Boitekong and the R30 before returning through Geelhoutpark. Rolling Highveld terrain at the foot of the Magaliesberg range with moderate traffic. The Rustenburg Cycling Club holds weekly early-morning time trials on the flat R565 stretch towards Phokeng.',
      discipline: 'road', difficulty: 'intermediate', surface: 'tarmac',
      distance_km: 58, elevation_m: 520, est_time_min: 135,
      province: 'North West', region: 'Bojanala', town: 'Rustenburg',
      lat: -25.6672, lng: 27.2422,
      tags: ['rustenburg', 'training', 'club-ride', 'magaliesberg-foot', 'time-trial', 'R30'],
      is_featured: true,
    },
    loops: [
      { name: 'Rustenburg Short Morning Loop', distance_km: 32, difficulty: 'beginner', category: 'green', subtitle: 'Protea Park + Cashan circuit', description: 'Quick 32 km loop through Protea Park and Cashan for a pre-work spin. Light traffic, good tar, minimal climbing.', display_order: 1 },
      { name: 'Rustenburg Club Loop', distance_km: 58, difficulty: 'intermediate', category: 'blue', subtitle: 'Full R565 training circuit', description: 'The standard 58 km club training loop via Boitekong and the R565 time trial stretch. The benchmark Rustenburg weekend ride.', display_order: 2 },
      { name: 'Rustenburg Century Loop', distance_km: 98, difficulty: 'advanced', category: 'red', subtitle: 'Extended Phokeng plateau', description: 'Extended 98 km loop adding the Phokeng plateau and the Ledig road through the Bafokeng nation for a proper century effort.', display_order: 3 },
    ],
  },
  {
    route: {
      name: 'Rustenburg Kgaswane MTB Extended Loop',
      slug: 'rustenburg-kgaswane-mtb-extended',
      description:
        'An extended MTB loop through the Kgaswane Mountain Reserve — Rustenburg\'s spectacular backyard wilderness — combining all available trail corridors. The reserve rises steeply from the city edge into the Magaliesberg range with rocky quartzite singletrack, indigenous bush and outstanding views over Rustenburg and the Bushveld below. White rhino and sable antelope are commonly sighted. The extended route links the North Slope, Ridge Trail and Valley Return for a full-day effort.',
      discipline: 'mtb', difficulty: 'advanced', surface: 'singletrack',
      distance_km: 42, elevation_m: 890, est_time_min: 185,
      province: 'North West', region: 'Bojanala', town: 'Rustenburg',
      lat: -25.6583, lng: 27.1917,
      tags: ['kgaswane', 'rhino', 'sable', 'quartzite', 'magaliesberg', 'ridge', 'full-day'],
      is_featured: false,
    },
    loops: [
      { name: 'Kgaswane Green Trail', distance_km: 12, difficulty: 'beginner', category: 'green', subtitle: 'Valley floor nature walk', description: 'Easy 12 km valley floor loop suitable for families and beginners. Flat to gently rolling with regular game sightings.', display_order: 1 },
      { name: 'Kgaswane Blue Trail', distance_km: 24, difficulty: 'intermediate', category: 'blue', subtitle: 'North slope + valley return', description: 'The 24 km intermediate loop climbing the north slope for Rustenburg panoramas before descending the valley. Core Kgaswane experience.', display_order: 2 },
      { name: 'Kgaswane Red Extended', distance_km: 42, difficulty: 'advanced', category: 'red', subtitle: 'Full ridge traverse', description: 'The full 42 km extended loop over the Magaliesberg ridge with all technical trail sections. Serious fitness and navigation required.', display_order: 3 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // PILANESBERG — GAME RESERVE CYCLING
  // ══════════════════════════════════════════════════════════════════════
  {
    route: {
      name: 'Pilanesberg National Park Gravel Safari',
      slug: 'pilanesberg-national-park-gravel-safari',
      description:
        'Big Five gravel cycling inside the Pilanesberg National Park — an ancient alkaline volcano crater hosting lion, elephant, rhino, leopard and buffalo in a unique geological landscape. The park\'s internal gravel roads wind through mopane and bushwillow savannah between the circular crater ridges. Guided cycling safaris cover 30–50 km on the loop roads with game ranger escort. An extraordinary combination of geology, wildlife and cycling in a compact 600 km² reserve.',
      discipline: 'gravel', difficulty: 'intermediate', surface: 'gravel',
      distance_km: 45, elevation_m: 380, est_time_min: 165,
      province: 'North West', region: 'Bojanala', town: 'Pilanesberg',
      lat: -25.2500, lng: 27.0833,
      tags: ['pilanesberg', 'big-five', 'volcano-crater', 'guided', 'lion', 'elephant', 'rhino', 'game-drive-by-bike'],
      is_featured: true,
    },
    loops: [
      { name: 'Pilanesberg Short Safari', distance_km: 22, difficulty: 'beginner', category: 'green', subtitle: 'Inner crater loop — guided', description: 'A 22 km guided loop on the inner crater roads near Manyane and Bakgatla gates. High game density, accessible terrain. Guide compulsory.', display_order: 1 },
      { name: 'Pilanesberg Full Safari', distance_km: 45, difficulty: 'intermediate', category: 'blue', subtitle: 'Full crater circuit — guided', description: 'The full 45 km crater circuit linking all major internal loops. Best chance of Big Five sightings. Half-day guided experience.', display_order: 2 },
      { name: 'Pilanesberg Epic Safari', distance_km: 68, difficulty: 'advanced', category: 'red', subtitle: 'Extended outer crater — guided', description: 'Extended 68 km loop incorporating the outer crater management roads. Full-day guided adventure with maximum wildlife exposure.', display_order: 3 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // SCHOEMANSVILLE / HARTIES
  // ══════════════════════════════════════════════════════════════════════
  {
    route: {
      name: 'Schoemansville and Harties Road Loop',
      slug: 'schoemansville-harties-road-loop',
      description:
        'The classic Hartbeespoort Dam road loop based at Schoemansville — the Joburg and Pretoria weekend cycling escape. The route circles the dam via the R512, Schoemansville, Ifafi and Kosmos, incorporating the famous Schoemansville climb on the north shore and the fast sweep through Melodie and Broederstroom on the return. The Harties gondola, elephant sanctuary and cable car are landmarks on the route. One of Gauteng and NW\'s most ridden road loops.',
      discipline: 'road', difficulty: 'intermediate', surface: 'tarmac',
      distance_km: 55, elevation_m: 540, est_time_min: 130,
      province: 'North West', region: 'Bojanala', town: 'Schoemansville',
      lat: -25.7333, lng: 27.8500,
      tags: ['hartbeespoort', 'schoemansville', 'dam-loop', 'R512', 'weekend-escape', 'ifafi', 'kosmos', 'iconic'],
      is_featured: true,
    },
    loops: [
      { name: 'Harties Short Dam Loop', distance_km: 28, difficulty: 'beginner', category: 'green', subtitle: 'North shore + dam wall', description: 'A 28 km loop covering the north shore and dam wall. Flat to rolling, good for beginners and families visiting Harties.', display_order: 1 },
      { name: 'Harties Full Circumnavigation', distance_km: 55, difficulty: 'intermediate', category: 'blue', subtitle: 'Full dam circuit', description: 'The classic 55 km full dam circumnavigation via Schoemansville, Ifafi, Kosmos and Melodie. The definitive Harties road ride.', display_order: 2 },
      { name: 'Harties Magalies Challenge', distance_km: 85, difficulty: 'advanced', category: 'red', subtitle: 'Dam + Magalies pass climb', description: 'Extended 85 km loop adding the Olifantsnek pass ascent above Schoemansville for a serious Magaliesberg climbing challenge.', display_order: 3 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // MAGALIESBERG VALLEY
  // ══════════════════════════════════════════════════════════════════════
  {
    route: {
      name: 'Magaliesberg Valley Gravel Meander',
      slug: 'magaliesberg-valley-gravel-meander',
      description:
        'A scenic gravel meander through the Magaliesberg valley floor — the fertile agricultural belt between the ancient quartzite ridges. The route links farm roads past lavender farms, olive groves, wedding venues and country estates between Magaliesberg village, Hekpoort and the Scheerpoort valley. The Magaliesberg range towers 500 m above the valley on both north and south flanks. Outstanding birding and Highveld bushveld character throughout.',
      discipline: 'gravel', difficulty: 'intermediate', surface: 'gravel',
      distance_km: 52, elevation_m: 420, est_time_min: 170,
      province: 'North West', region: 'Bojanala', town: 'Magaliesberg',
      lat: -25.9833, lng: 27.5500,
      tags: ['magaliesberg-valley', 'lavender', 'olive-groves', 'farm-roads', 'birdlife', 'hekpoort', 'scheerpoort'],
      is_featured: true,
    },
    loops: [
      { name: 'Valley Short Gravel', distance_km: 22, difficulty: 'beginner', category: 'green', subtitle: 'Village + farm road circuit', description: 'A 22 km loop from Magaliesberg village on the best-surfaced farm roads. Easy access, beautiful valley scenery, good for gravel newcomers.', display_order: 1 },
      { name: 'Valley Meander Loop', distance_km: 52, difficulty: 'intermediate', category: 'blue', subtitle: 'Full valley floor circuit', description: 'The full 52 km gravel meander linking Hekpoort, Scheerpoort and the valley estates. The standard Magaliesberg gravel weekend ride.', display_order: 2 },
      { name: 'Magalies Epic Gravel', distance_km: 80, difficulty: 'advanced', category: 'red', subtitle: 'Valley + Olifantsnek gorge', description: 'Extended 80 km loop adding the Olifantsnek gorge and Buffelspoort entry road for a full-day Magaliesberg gravel experience.', display_order: 3 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // BRITS
  // ══════════════════════════════════════════════════════════════════════
  {
    route: {
      name: 'Brits Hartbeespoort Corridor Road Ride',
      slug: 'brits-hartbeespoort-corridor-road',
      description:
        'A road ride through the Brits agricultural corridor connecting Brits town with the Hartbeespoort Dam via the R512 and R27. The route passes through citrus and tobacco farms, the Crocodile River valley and the Magaliesberg foothills. Brits is the gateway to both the Magaliesberg and the Pilanesberg — the road north and west offers quiet farm roads with the mountain range as a constant backdrop.',
      discipline: 'road', difficulty: 'intermediate', surface: 'tarmac',
      distance_km: 65, elevation_m: 480, est_time_min: 155,
      province: 'North West', region: 'Bojanala', town: 'Brits',
      lat: -25.6333, lng: 27.7667,
      tags: ['brits', 'R512', 'citrus', 'tobacco', 'crocodile-river', 'magaliesberg', 'hartbeespoort-gateway'],
      is_featured: false,
    },
    loops: [
      { name: 'Brits Short Farm Loop', distance_km: 30, difficulty: 'beginner', category: 'green', subtitle: 'Citrus farm circuit', description: 'A 30 km beginner loop through the Brits citrus and tobacco farms on flat R512 service roads.', display_order: 1 },
      { name: 'Brits Harties Corridor', distance_km: 65, difficulty: 'intermediate', category: 'blue', subtitle: 'Full R512 corridor loop', description: 'The full 65 km corridor ride to Hartbeespoort and back via a farm road circuit. Rolling with good tar surfaces throughout.', display_order: 2 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // KLERKSDORP
  // ══════════════════════════════════════════════════════════════════════
  {
    route: {
      name: 'Klerksdorp Vaal Triangle Road Loop',
      slug: 'klerksdorp-vaal-triangle-road-loop',
      description:
        'A flat road loop from Klerksdorp through the gold-mining towns of Orkney, Stilfontein and Hartbeesfontein in the South West Gauteng/North West goldfields. The route passes gold mine shaft towers, tailings dams and the wide Vaal River approaches. Klerksdorp is one of South Africa\'s oldest gold-rush towns (1837) and the route\'s gold-mining industrial landscape is uniquely South African.',
      discipline: 'road', difficulty: 'intermediate', surface: 'tarmac',
      distance_km: 72, elevation_m: 280, est_time_min: 170,
      province: 'North West', region: 'Dr Kenneth Kaunda', town: 'Klerksdorp',
      lat: -26.8677, lng: 26.6647,
      tags: ['klerksdorp', 'goldfields', 'orkney', 'stilfontein', 'gold-mines', 'vaal-triangle', 'heritage'],
      is_featured: false,
    },
    loops: [
      { name: 'Klerksdorp Short Loop', distance_km: 35, difficulty: 'beginner', category: 'green', subtitle: 'Orkney circuit', description: 'A 35 km flat loop linking Klerksdorp and Orkney via the R29. Good tar, minimal climbing, industrial goldfields scenery.', display_order: 1 },
      { name: 'Klerksdorp Goldfields Loop', distance_km: 72, difficulty: 'intermediate', category: 'blue', subtitle: 'Full triangle circuit', description: 'The complete 72 km goldfields triangle via Orkney, Stilfontein and Hartbeesfontein. A window into SA\'s deep gold-mining history.', display_order: 2 },
    ],
  },
  {
    route: {
      name: 'Klerksdorp Schoonspruit MTB Trails',
      slug: 'klerksdorp-schoonspruit-mtb-trails',
      description:
        'MTB trails along the Schoonspruit River greenway in Klerksdorp. The Schoonspruit is a small river that winds through the city with a developing trail network linking the western suburbs. Accessible singletrack and dual-track through indigenous riverine bush, wetland areas and open grassland make this Klerksdorp\'s primary mountain bike facility. Popular with local school groups and beginners learning to mountain bike.',
      discipline: 'mtb', difficulty: 'beginner', surface: 'singletrack',
      distance_km: 18, elevation_m: 110, est_time_min: 68,
      province: 'North West', region: 'Dr Kenneth Kaunda', town: 'Klerksdorp',
      lat: -26.8677, lng: 26.6647,
      tags: ['schoonspruit', 'river-trail', 'klerksdorp', 'beginners', 'school-friendly', 'riverine', 'urban'],
      is_featured: false,
    },
    loops: [
      { name: 'Schoonspruit Mini Loop', distance_km: 8, difficulty: 'beginner', category: 'green', subtitle: 'River trail short circuit', description: 'A beginner-friendly 8 km river trail loop. Perfect for children and first-time MTB riders.', display_order: 1 },
      { name: 'Schoonspruit Full Trail', distance_km: 18, difficulty: 'beginner', category: 'blue', subtitle: 'Full greenway circuit', description: 'The complete 18 km greenway loop linking all trail sections. Good for fitness rides and exploring the Klerksdorp river corridor.', display_order: 2 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // POTCHEFSTROOM
  // ══════════════════════════════════════════════════════════════════════
  {
    route: {
      name: 'Potchefstroom NWU Campus Road Loop',
      slug: 'potchefstroom-nwu-campus-road-loop',
      description:
        'A popular road loop based around the North-West University (NWU) campus in Potchefstroom — the sporting heartbeat of the North West Province. The route links the campus, the Mooi River valley roads and the Ikageng township boundary on a rolling 55 km circuit. NWU is one of South Africa\'s leading cycling universities and the campus roads see regular early-morning club training rides. The Vaal River approach on the southern leg adds scenic flat riding.',
      discipline: 'road', difficulty: 'intermediate', surface: 'tarmac',
      distance_km: 55, elevation_m: 350, est_time_min: 130,
      province: 'North West', region: 'Dr Kenneth Kaunda', town: 'Potchefstroom',
      lat: -26.7145, lng: 27.0974,
      tags: ['NWU', 'university', 'potchefstroom', 'mooi-river', 'vaal-approach', 'campus', 'student-cycling'],
      is_featured: false,
    },
    loops: [
      { name: 'NWU Campus Short Loop', distance_km: 28, difficulty: 'beginner', category: 'green', subtitle: 'Campus + Mooi River', description: 'A flat 28 km loop from the NWU campus along the Mooi River valley roads. Ideal for student training rides and beginners.', display_order: 1 },
      { name: 'Potchefstroom Full Loop', distance_km: 55, difficulty: 'intermediate', category: 'blue', subtitle: 'Full city circuit', description: 'The complete 55 km city loop incorporating the Vaal approach and Ikageng boundary roads. Standard Potch club training ride.', display_order: 2 },
      { name: 'Potch Century Loop', distance_km: 90, difficulty: 'advanced', category: 'red', subtitle: 'Extended Vaal Dam route', description: 'Extended 90 km loop heading south towards the Vaal Dam for a proper long training effort. Used to prepare for the Rapport Toer stage through NW.', display_order: 3 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // GROOT MARICO
  // ══════════════════════════════════════════════════════════════════════
  {
    route: {
      name: 'Groot Marico Bushveld Gravel',
      slug: 'groot-marico-bushveld-gravel',
      description:
        'A remote gravel adventure through the Groot Marico district — immortalised by Herman Charles Bosman\'s Oom Schalk Lourens stories as the heart of Bosveld storytelling culture. The route crosses the Marico River on farm roads through mopane and camel-thorn bushveld, passing old Boer farm homesteads, swimming holes and the famous "Marico Bosveld" marula orchards. An extraordinarily atmospheric and culturally rich North West gravel ride.',
      discipline: 'gravel', difficulty: 'intermediate', surface: 'gravel',
      distance_km: 60, elevation_m: 380, est_time_min: 200,
      province: 'North West', region: 'Bojanala', town: 'Groot Marico',
      lat: -25.6167, lng: 26.4500,
      tags: ['groot-marico', 'bosman', 'marico-river', 'mopane', 'marula', 'literary', 'bosveld', 'cultural'],
      is_featured: true,
    },
    loops: [
      { name: 'Marico Short Gravel', distance_km: 28, difficulty: 'beginner', category: 'green', subtitle: 'River valley loop', description: 'A 28 km gravel loop through the most accessible Marico River valley farm roads. Beautiful bushveld with easy navigation.', display_order: 1 },
      { name: 'Groot Marico Full Loop', distance_km: 60, difficulty: 'intermediate', category: 'blue', subtitle: 'Full bushveld circuit', description: 'The full 60 km loop through classic Bosveld country — Oom Schalk territory, marula trees and swimming holes en route.', display_order: 2 },
      { name: 'Marico Zeerust Epic', distance_km: 90, difficulty: 'advanced', category: 'red', subtitle: 'Marico to Zeerust gravel', description: 'Extended 90 km loop linking Groot Marico with Zeerust on remote farm tracks. A long remote gravel day in deep North West.', display_order: 3 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // MAFIKENG / MAHIKENG
  // ══════════════════════════════════════════════════════════════════════
  {
    route: {
      name: 'Mahikeng (Mafikeng) City Road Loop',
      slug: 'mahikeng-city-road-loop',
      description:
        'A road loop through Mahikeng — the capital of the North West Province and site of the famous Siege of Mafeking (1899–1900). The route links the CBD, the historic Mafikeng Game Reserve (within the city boundary), the airport area and the Molopo River valley. The city\'s unique character — a provincial capital with a large game reserve inside it — makes for an unusual urban cycling experience with wildlife visible from the road.',
      discipline: 'road', difficulty: 'beginner', surface: 'tarmac',
      distance_km: 45, elevation_m: 190, est_time_min: 105,
      province: 'North West', region: 'Ngaka Modiri Molema', town: 'Mahikeng',
      lat: -25.8536, lng: 25.6442,
      tags: ['mahikeng', 'mafikeng', 'provincial-capital', 'game-reserve', 'molopo-river', 'siege', 'boer-war', 'historic'],
      is_featured: false,
    },
    loops: [
      { name: 'Mahikeng Short Loop', distance_km: 22, difficulty: 'beginner', category: 'green', subtitle: 'City + game reserve boundary', description: 'A 22 km urban loop around the city centre and game reserve fence. Flat, accessible and historically interesting.', display_order: 1 },
      { name: 'Mahikeng Full City Loop', distance_km: 45, difficulty: 'beginner', category: 'blue', subtitle: 'Full circuit + Molopo valley', description: 'The full 45 km city loop adding the Molopo River valley approach and the Heritage Park area.', display_order: 2 },
    ],
  },
  {
    route: {
      name: 'Mafikeng Game Reserve MTB',
      slug: 'mafikeng-game-reserve-mtb',
      description:
        'MTB trails inside the Mafikeng Game Reserve — uniquely located within the boundaries of Mahikeng city, making it one of very few urban game reserves with mountain bike access. The reserve hosts white rhino, giraffe, zebra, eland and various antelope. Trails wind through dry mopane woodland and open grassland on the city\'s western edge. A rare opportunity to MTB among rhino within a provincial capital city.',
      discipline: 'mtb', difficulty: 'intermediate', surface: 'singletrack',
      distance_km: 20, elevation_m: 160, est_time_min: 78,
      province: 'North West', region: 'Ngaka Modiri Molema', town: 'Mahikeng',
      lat: -25.8700, lng: 25.6200,
      tags: ['mafikeng-game-reserve', 'urban-reserve', 'rhino', 'giraffe', 'mopane', 'unique', 'city-MTB'],
      is_featured: false,
    },
    loops: [
      { name: 'Mafikeng Reserve Short Loop', distance_km: 10, difficulty: 'beginner', category: 'green', subtitle: 'Grassland circuit', description: 'A 10 km easy loop on the open grassland tracks. Good for beginners and families wanting a wildlife MTB experience.', display_order: 1 },
      { name: 'Mafikeng Reserve Full Loop', distance_km: 20, difficulty: 'intermediate', category: 'blue', subtitle: 'Full reserve circuit', description: 'The complete 20 km loop through all reserve zones including the mopane woodland — best chance of rhino sightings.', display_order: 2 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // ZEERUST / LICHTENBURG
  // ══════════════════════════════════════════════════════════════════════
  {
    route: {
      name: 'Zeerust Gravel and Madikwe Border Loop',
      slug: 'zeerust-madikwe-border-gravel-loop',
      description:
        'A remote gravel adventure from Zeerust north towards the Madikwe Game Reserve fence — one of South Africa\'s largest Big Five reserves. The route follows farm tracks and reserve boundary roads through dry mopane bushveld on the Botswana border approaches. The vast open landscape, enormous sky and extreme quiet define this North West gravel experience. Strong winds and corrugated gravel demand good technical cycling.',
      discipline: 'gravel', difficulty: 'advanced', surface: 'gravel',
      distance_km: 75, elevation_m: 320, est_time_min: 245,
      province: 'North West', region: 'Ngaka Modiri Molema', town: 'Zeerust',
      lat: -25.5333, lng: 26.0833,
      tags: ['zeerust', 'madikwe', 'botswana-border', 'mopane', 'remote', 'big-five', 'corrugated-gravel', 'wind'],
      is_featured: false,
    },
    loops: [
      { name: 'Zeerust Short Gravel', distance_km: 35, difficulty: 'intermediate', category: 'blue', subtitle: 'Local farm roads', description: 'A 35 km loop on the more accessible farm roads south of Zeerust. Good introduction to this remote North West gravel region.', display_order: 1 },
      { name: 'Madikwe Border Epic', distance_km: 75, difficulty: 'advanced', category: 'red', subtitle: 'Full border loop', description: 'The full 75 km remote loop to the Madikwe fence and back. Wind, corrugated gravel and extraordinary solitude.', display_order: 2 },
    ],
  },
  {
    route: {
      name: 'Lichtenburg Gravel Plains Loop',
      slug: 'lichtenburg-gravel-plains-loop',
      description:
        'A quiet gravel ride through the vast agricultural plains around Lichtenburg in central North West — once the site of South Africa\'s diamond rush of 1926. The route crosses sunflower, maize and groundnut farms on flat to gently rolling gravel district roads. The 1926 alluvial diamond fields are visible as distinctive low scrapes in the veld. A peaceful, remote and historically fascinating North West gravel loop.',
      discipline: 'gravel', difficulty: 'beginner', surface: 'gravel',
      distance_km: 48, elevation_m: 150, est_time_min: 160,
      province: 'North West', region: 'Ngaka Modiri Molema', town: 'Lichtenburg',
      lat: -26.1500, lng: 26.1667,
      tags: ['lichtenburg', 'diamond-rush', 'sunflower', 'maize', 'plains', 'alluvial-diamonds', 'quiet', 'flat'],
      is_featured: false,
    },
    loops: [
      { name: 'Lichtenburg Short Plains Loop', distance_km: 22, difficulty: 'beginner', category: 'green', subtitle: 'Diamond fields circuit', description: 'A flat 22 km loop through the historic alluvial diamond fields south of Lichtenburg. Accessible and historically interesting.', display_order: 1 },
      { name: 'Lichtenburg Full Plains Loop', distance_km: 48, difficulty: 'beginner', category: 'blue', subtitle: 'Full farm circuit', description: 'The full 48 km loop across sunflower and maize farms. Wide Highveld skies and total quiet — pure North West.', display_order: 2 },
    ],
  },
]

async function main() {
  console.log(`\n🌿 Seeding ${data.length} North West routes + loops...\n`)

  let routesAdded = 0, routesSkipped = 0, loopsAdded = 0, loopsSkipped = 0

  for (const { route: r, loops } of data) {
    // ── Insert route ──────────────────────────────────────────────────
    let routeId: string

    const exists = await sql`SELECT id FROM routes WHERE slug = ${r.slug}`
    if (exists.length > 0) {
      routeId = exists[0].id
      console.log(`  ⏭  SKIP route: ${r.name}`)
      routesSkipped++
    } else {
      const heroImg = heroImages[r.slug] || null
      const [inserted] = await sql`
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
      routeId = inserted.id
      console.log(`  ✅ ${r.name}${heroImg ? ' 🖼' : ''}`)
      routesAdded++
    }

    // ── Insert loops ──────────────────────────────────────────────────
    for (const loop of loops) {
      const loopExists = await sql`SELECT id FROM route_loops WHERE route_id = ${routeId} AND name = ${loop.name}`
      if (loopExists.length > 0) {
        loopsSkipped++
        continue
      }
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

  const [nw]       = await sql`SELECT COUNT(*) AS c FROM routes WHERE province = 'North West'`
  const [nwLoops]  = await sql`SELECT COUNT(rl.id) AS c FROM route_loops rl JOIN routes r ON r.id = rl.route_id WHERE r.province = 'North West'`
  const [total]    = await sql`SELECT COUNT(*) AS c FROM routes`
  const [allLoops] = await sql`SELECT COUNT(*) AS c FROM route_loops`

  console.log('\n──────────────────────────────────────────────────')
  console.log(`✅ Routes: ${routesAdded} added | ${routesSkipped} skipped`)
  console.log(`🔁 Loops:  ${loopsAdded} added | ${loopsSkipped} skipped`)
  console.log(`📊 North West routes:      ${nw.c}`)
  console.log(`📊 North West loops:       ${nwLoops.c}`)
  console.log(`📊 All routes total:       ${total.c}`)
  console.log(`📊 All route_loops total:  ${allLoops.c}`)
}

main().catch(console.error)
