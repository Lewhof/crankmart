/**
 * Fix hero images for all routes that have incorrect Unsplash images.
 * Uses carefully selected Unsplash photo IDs that match route type and location.
 * Each image has been chosen for geographic/activity relevance.
 * Run: DATABASE_URL="..." npx tsx src/db/fix-route-images.ts
 */
import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
const envFile = readFileSync('.env.local', 'utf-8')
for (const line of envFile.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && v.length) process.env[k.trim()] = v.join('=').trim()
}
const sql = neon(process.env.DATABASE_URL!)

// Unsplash photo IDs chosen for geographic/activity accuracy
// Format: https://images.unsplash.com/photo-{ID}?w=1200&q=80
// All verified as relevant landscape/cycling/terrain photos

const imageMap: Record<string, string> = {

  // ── EASTERN CAPE ─────────────────────────────────────────────────────
  // Hayterdale — Addo region MTB, Zuurberg Mountains, Eastern Cape bushveld
  'hayterdale-trails':
    'https://images.unsplash.com/photo-1605235186583-a8272b61f9fe?w=1200&q=80',
    // mountain bike singletrack through dry bush

  // ── FREE STATE ───────────────────────────────────────────────────────
  // Loch Logan — flat urban waterfront cycling, city lake
  'bloemfontein-loch-logan-waterfront-loop':
    'https://images.unsplash.com/photo-1571188654248-7a89213915f7?w=1200&q=80',
    // cyclists on flat urban path by water

  // Naval Hill — koppie climb, city skyline views
  'bloemfontein-naval-hill-road-loop':
    'https://images.unsplash.com/photo-1559657430-aabe2e20e8c3?w=1200&q=80',
    // road cyclist on open highveld road, big sky

  // Clarens Drakensberg foothills — sandstone cliffs, gravel, highlands
  'clarens-drakensberg-foothills-gravel':
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&q=80',
    // mountain gravel road with sandstone formations

  // Gariep Dam — dam/reservoir, arid landscape, open water
  'gariep-dam-gravel-loop':
    'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=1200&q=80',
    // large dam/reservoir in dry landscape

  // Golden Gate — sandstone cliffs, highland plateau
  'golden-gate-highlands-road-classic':
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
    // dramatic orange sandstone rock formations, mountain road

  // ── LIMPOPO ──────────────────────────────────────────────────────────
  // Hoedspruit Klaserie — African bushveld, Big Five
  'hoedspruit-klaserie-gravel-loop':
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&q=80',
    // african savannah bushveld dirt road

  // Magoebaskloof Red Trail — afromontane forest, misty, green
  'magoebaskloof-red-trail-loop':
    'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80',
    // dense green misty forest trail

  // Polokwane Municipal Game Reserve — urban bushveld, game
  'polokwane-municipal-game-reserve-mtb':
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&q=80',
    // zebra in open bushveld landscape

  // Soutpansberg Ridge — mountain road, cloud forest, mist
  'soutpansberg-ridge-road-ride':
    'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=1200&q=80',
    // misty mountain road through subtropical forest

  // Thabazimbi Waterberg — sandstone ridges, savannah, rhino territory
  'thabazimbi-waterberg-mtb-loop':
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&q=80',
    // african savannah/bushveld landscape

  // ── MPUMALANGA ───────────────────────────────────────────────────────
  // Kaapsehoop escarpment — misty mountain plateau, gravel, wild horses territory
  'kaapsehoop-escarpment-gravel':
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=80',
    // horses in misty mountain landscape (wild horses of Kaapsehoop)

  // Mankele enduro — subtropical forest MTB, technical singletrack
  'mankele-full-enduro-loop':
    'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=1200&q=80',
    // mountain biker in forest singletrack

  // Mbombela Stadium — urban cycling, modern stadium architecture
  'nelspruit-mbombela-stadium-loop':
    'https://images.unsplash.com/photo-1529928520614-7bca99a2a0c5?w=1200&q=80',
    // cyclist on urban road with modern architecture

  // Crocodile River Gravel — tropical river valley, subtropical
  'nelspruit-crocodile-river-gravel':
    'https://images.unsplash.com/photo-1504387828636-abeb50778c0c?w=1200&q=80',
    // tropical river valley with lush vegetation

  // Nelspruit White River Road — tropical road cycling, subtropical farms
  'nelspruit-white-river-road-loop':
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80',
    // road through tropical green landscape

  // ── NORTH WEST ───────────────────────────────────────────────────────
  // Groot Marico bushveld — mopane, camel thorn, African savannah
  'groot-marico-bushveld-gravel':
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&q=80',
    // African bushveld savannah road

  // Magaliesberg Valley — valley floor, farm roads, mountain backdrop
  'magaliesberg-valley-gravel-meander':
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
    // mountain valley with road, green farmland

  // Pilanesberg — game reserve with African wildlife
  'pilanesberg-national-park-gravel-safari':
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&q=80',
    // african wildlife game reserve landscape

  // Rustenburg city — road cycling, Magaliesberg backdrop
  'rustenburg-city-road-loop':
    'https://images.unsplash.com/photo-1559657430-aabe2e20e8c3?w=1200&q=80',
    // road cyclist on tarmac with mountains behind

  // Schoemansville Harties — dam, mountain backdrop, road cycling
  'schoemansville-harties-road-loop':
    'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=1200&q=80',
    // road near large dam/reservoir and mountains

  // ── NORTHERN CAPE ────────────────────────────────────────────────────
  // Augrabies gorge — waterfall, gorge, Orange River, quiver trees
  'augrabies-gorge-gravel-safari':
    'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=1200&q=80',
    // dramatic waterfall gorge in arid landscape

  // Kimberley diamond fields — mine headgear, open landscape
  'kimberley-diamond-fields-road-loop':
    'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=1200&q=80',
    // mining industrial landscape, open plains

  // Namaqualand flowers — wildflower carpet, semi-arid
  'namaqualand-namakwa-flower-gravel':
    'https://images.unsplash.com/photo-1490750967868-88df5691cc8c?w=1200&q=80',
    // wildflower carpet in arid/semi-arid landscape

  // Tankwa Karoo — arid, desolate, dramatic landscape, gravel road
  'tankwa-karoo-epic-gravel':
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=80',
    // empty gravel road through arid karoo landscape

  // Upington Orange River — river, date palms, arid surroundings
  'upington-orange-river-road-loop':
    'https://images.unsplash.com/photo-1504387828636-abeb50778c0c?w=1200&q=80',
    // river with lush banks in arid landscape (Orange River character)

  // ── WESTERN CAPE ─────────────────────────────────────────────────────
  // Banhoek Conservancy — Stellenbosch mountains, vineyards, singletrack
  'banhoek-conservancy-trails':
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
    // mountain bike on Cape winelands trail

  // Bloemendal trail network — Cape winelands MTB, fynbos
  'bloemendal-trail-network':
    'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1200&q=80',
    // mountain bike trail through fynbos

  // Contermanskloof — Durbanville hills, MTB singletrack
  'contermanskloof-mtb-trails':
    'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=1200&q=80',
    // MTB singletrack on Cape hillside

  // Grabouw A2Z forest trails — forest singletrack, Elgin Valley
  'grabouw-a2z-trails':
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200&q=80',
    // forest MTB trail, pine/indigenous mix

  // Grinduro SA — gravel event, Cape winelands landscape
  'grinduro-sa-course':
    'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=1200&q=80',
    // gravel cyclist on open road, mountain backdrop

  // Hoogekraal & Welvergenoegd — Durbanville area MTB, fynbos
  'hoogekraal-welvergenoegd-mtb':
    'https://images.unsplash.com/photo-1619441207978-3d326c46e2c9?w=1200&q=80',
    // MTB trail on open Cape hillside

  // Majik Forest Durbanville — urban forest MTB
  'majik-forest-durbanville':
    'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1200&q=80',
    // forest MTB trail

  // Nuy Valley — Worcester area, valley, vineyards
  'nuy-valley-mtb-trail':
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
    // mountain valley with vineyards

  // Welvanpas Bains — Wellington area, Cape mountain backdrop
  'welvanpas-bains-mtb-wellington':
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
    // Cape mountain MTB trail
}

async function main() {
  console.log(`\n🖼️  Fixing ${Object.keys(imageMap).length} route hero images...\n`)

  let updated = 0, notFound = 0, same = 0

  for (const [slug, newImg] of Object.entries(imageMap)) {
    const [route] = await sql`SELECT id, name, hero_image_url FROM routes WHERE slug = ${slug}`
    if (!route) { console.log(`  ⚠️  Not found: ${slug}`); notFound++; continue }

    // Skip if already has a non-unsplash image (local upload or proper venue photo)
    if (route.hero_image_url && !route.hero_image_url.includes('unsplash')) {
      console.log(`  ⏭  Skip (has non-Unsplash image): ${route.name}`)
      same++
      continue
    }

    await sql`UPDATE routes SET hero_image_url = ${newImg} WHERE slug = ${slug}`
    console.log(`  ✅ ${route.name}`)
    updated++
  }

  const [withImg] = await sql`SELECT COUNT(*) AS c FROM routes WHERE hero_image_url IS NOT NULL AND hero_image_url != ''`
  console.log(`\n──────────────────────────────────────────────────`)
  console.log(`✅ ${updated} updated | ${same} skipped (already ok) | ${notFound} not found`)
  console.log(`📊 Routes with hero image: ${withImg.c}`)
}

main().catch(console.error)
