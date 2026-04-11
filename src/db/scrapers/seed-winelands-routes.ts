// Load .env.local before any imports
import { readFileSync } from 'fs'
try {
  readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  })
} catch {}

import { neon } from '@neondatabase/serverless'
import * as cheerio from 'cheerio'

const sql = neon(process.env.DATABASE_URL!)
const TIMEOUT_MS = 14000

// ─── MISSING ROUTES ──────────────────────────────────────────────────────────
const NEW_ROUTES = [
  // DURBANVILLE
  {
    slug: 'meerendal-wine-estate-mtb',
    name: 'Meerendal Wine Estate MTB',
    description: 'Ideal for beginners and endurance training. Trails wind through vineyards past the upper dam, up the Stairway to Heaven switchbacks, and optionally up Dorstberg — rebuilt in 2023 with flowing switchbacks rewarding with Table Mountain views. The Esther Suss berms and Burry Stander descent are crowd favourites. Day permits available at the gate.',
    discipline: 'mtb', difficulty: 'beginner', surface: 'singletrack',
    distance_km: 23.4, elevation_m: 380, est_time_min: 120,
    province: 'Western Cape', region: 'Durbanville', town: 'Durbanville',
    lat: -33.8170, lng: 18.6290,
    website_url: 'https://meerendal.co.za',
    tags: ['wine-estate', 'day-permit', 'berms', 'family-friendly', 'dorstberg'],
    routeVariants: [
      { name: 'Short Loop', category: 'green', distance: 4.8, difficulty: 'beginner', description: 'Quick family loop around the estate, beginner friendly' },
      { name: 'Medium Loop', category: 'blue', distance: 13.1, difficulty: 'intermediate', description: 'Includes Stairway to Heaven and Burry Stander descent' },
      { name: 'Full Dorstberg', category: 'red', distance: 23.4, difficulty: 'advanced', description: 'Complete route including Dorstberg switchback climb and technical descent' },
    ],
  },
  {
    slug: 'bloemendal-trail-network',
    name: 'Bloemendal Trail Network',
    description: 'A family-friendly network on Bloemendal Wine Estate with a dedicated kids\' pump track. The lower trails are perfect for beginners and children. The upper region connects to Hillcrest and Contermanskloof for more advanced riding with jump tracks and flowy singletrack. Managed by Tygerberg Mountain Bike Club.',
    discipline: 'mtb', difficulty: 'beginner', surface: 'singletrack',
    distance_km: 20, elevation_m: 290, est_time_min: 90,
    province: 'Western Cape', region: 'Durbanville', town: 'Durbanville',
    lat: -33.8100, lng: 18.6050,
    website_url: 'https://www.bloemendalestate.co.za',
    tags: ['family-friendly', 'pump-track', 'wine-estate', 'kids', 'TMTBC'],
    routeVariants: [
      { name: 'Kids & Family Loop', category: 'green', distance: 5, difficulty: 'beginner', description: 'Gentle farm roads and pump track, suitable for all ages' },
      { name: 'Main Network', category: 'blue', distance: 14, difficulty: 'intermediate', description: 'Full trail network including upper connecting trails' },
      { name: 'Advanced Upper Region', category: 'red', distance: 20, difficulty: 'advanced', description: 'Connects to Hillcrest and Contermanskloof for technical riding' },
    ],
  },
  {
    slug: 'hoogekraal-welvergenoegd-mtb',
    name: 'Hoogekraal & Welvergenoegd MTB Trails',
    description: 'A favourite for seasoned riders. The main Hoogekraal loop is 8.5 km of technical singletrack with jump tracks, extending to 24 km when combined with the Welvergenoegd trails. Known for rocky technical sections and fast descents through indigenous bush.',
    discipline: 'mtb', difficulty: 'advanced', surface: 'singletrack',
    distance_km: 24, elevation_m: 420, est_time_min: 150,
    province: 'Western Cape', region: 'Durbanville', town: 'Durbanville',
    lat: -33.7980, lng: 18.6500,
    website_url: 'https://tmtbc.co.za',
    tags: ['jump-tracks', 'technical', 'advanced', 'TMTBC'],
    routeVariants: [
      { name: 'Hoogekraal Main Loop', category: 'blue', distance: 8.5, difficulty: 'intermediate', description: '8.5 km core loop with jump tracks and technical singletrack' },
      { name: 'Hoogekraal + Welvergenoegd', category: 'red', distance: 24, difficulty: 'advanced', description: 'Full combined network — challenging technical riding for experienced riders' },
    ],
  },
  {
    slug: 'majik-forest-durbanville',
    name: 'Majik Forest MTB Trails',
    description: 'A popular green belt between wine farms and suburban Durbanville. A long narrow singletrack corridor through indigenous trees, shared with hikers. Great for quick after-work rides — easy to navigate with marked trails. Free access.',
    discipline: 'mtb', difficulty: 'beginner', surface: 'singletrack',
    distance_km: 12, elevation_m: 150, est_time_min: 60,
    province: 'Western Cape', region: 'Durbanville', town: 'Durbanville',
    lat: -33.8350, lng: 18.6150,
    website_url: 'https://tmtbc.co.za',
    tags: ['free-access', 'after-work', 'green-belt', 'shared-trail'],
    routeVariants: [
      { name: 'Forest Loop', category: 'green', distance: 6, difficulty: 'beginner', description: 'Short loop through indigenous trees, perfect for beginners' },
      { name: 'Extended Network', category: 'blue', distance: 12, difficulty: 'intermediate', description: 'Full trail network exploring the entire green belt corridor' },
    ],
  },
  {
    slug: 'contermanskloof-mtb-trails',
    name: 'Contermanskloof MTB Trails',
    description: 'Intermediate-level trails taking 60–90 minutes to complete, with well-marked route options. Includes technical black routes for experienced riders and a beginner-friendly green route. Connects with Bloemendal and Hillcrest upper network.',
    discipline: 'mtb', difficulty: 'intermediate', surface: 'singletrack',
    distance_km: 18, elevation_m: 350, est_time_min: 90,
    province: 'Western Cape', region: 'Durbanville', town: 'Durbanville',
    lat: -33.8000, lng: 18.5833,
    website_url: 'https://tmtbc.co.za',
    tags: ['intermediate', 'technical', 'TMTBC', 'day-permit'],
    routeVariants: [
      { name: 'Green Beginner Route', category: 'green', distance: 6, difficulty: 'beginner', description: 'Marked green route for beginners — easy singletrack' },
      { name: 'Intermediate Main Loop', category: 'blue', distance: 12, difficulty: 'intermediate', description: 'Main intermediate loop, 60–90 min, well marked' },
      { name: 'Black Technical Route', category: 'black', distance: 18, difficulty: 'expert', description: 'Technical black route for advanced riders' },
    ],
  },

  // STELLENBOSCH — MISSING ROUTES
  {
    slug: 'simonsberg-wine-trails',
    name: 'Simonsberg Wine Trails',
    description: 'World-class singletrack network through the Simonsberg wine estates — Muratie, Delheim, Uitkyk, Knorhoek, and Plaisir de Merle. Diverse terrain through forests, vineyards, and fynbos-covered mountainsides. Muratie joined the Wine Lands Trails network in 2025, adding beginner ABC trail and advanced technical singletracks. Routes range from 18–25 km.',
    discipline: 'mtb', difficulty: 'intermediate', surface: 'singletrack',
    distance_km: 25, elevation_m: 680, est_time_min: 180,
    province: 'Western Cape', region: 'Stellenbosch', town: 'Stellenbosch',
    lat: -33.8850, lng: 18.8750,
    website_url: 'https://winelandscyclingclub.co.za',
    tags: ['wine-estate', 'Muratie', 'Delheim', 'Uitkyk', 'forest', 'Cape-Epic'],
    routeVariants: [
      { name: 'ABC Beginner Trail', category: 'green', distance: 8, difficulty: 'beginner', description: 'Beginner-friendly loop through Muratie vineyards — 2025 addition' },
      { name: 'Intermediate Vineyard Loop', category: 'blue', distance: 18, difficulty: 'intermediate', description: 'Classic Simonsberg loop through forests and vineyards' },
      { name: 'Full Network Advanced', category: 'red', distance: 25, difficulty: 'advanced', description: 'All estates linked — technical singletracks through the Simonsberg' },
    ],
  },
  {
    slug: 'banhoek-conservancy-trails',
    name: 'Banhoek Conservancy Trails',
    description: 'Pristine singletrack in the Banhoek Valley near Stellenbosch. Features the Banhoek Game Trail, Dwarsrivier Valley Trail, and the challenging Botmaskop Trail. Includes trails through Boschendal farm. Permits obtained online or at farm locations. A truly wild experience with mountain views and river crossings.',
    discipline: 'mtb', difficulty: 'advanced', surface: 'singletrack',
    distance_km: 32, elevation_m: 850, est_time_min: 240,
    province: 'Western Cape', region: 'Franschhoek', town: 'Franschhoek',
    lat: -33.9100, lng: 18.9800,
    website_url: 'https://banhoekconservancy.co.za',
    tags: ['conservancy', 'Boschendal', 'Botmaskop', 'technical', 'permit-required'],
    routeVariants: [
      { name: 'Dwarsrivier Valley Trail', category: 'blue', distance: 14, difficulty: 'intermediate', description: 'Valley trail with river crossings and fynbos views' },
      { name: 'Banhoek Game Trail', category: 'red', distance: 22, difficulty: 'advanced', description: 'Technical singletrack through game country with mountain views' },
      { name: 'Botmaskop Challenge', category: 'black', distance: 32, difficulty: 'expert', description: 'The hardest route — Botmaskop summit and technical descent, serious climbing' },
    ],
  },
  {
    slug: 'boschendal-trail-centre',
    name: 'Boschendal Trail Centre',
    description: 'A world-class trail centre on the historic Boschendal estate in Franschhoek. Routes for all ages from the easy 4 km Yellow Route to the challenging 23 km Black XL. Lush tree canopy, technical rock gardens, river crossings, and banked berms. Part of the Wines2Whales race series. Restaurant and wine tasting on-site.',
    discipline: 'mtb', difficulty: 'intermediate', surface: 'singletrack',
    distance_km: 23, elevation_m: 580, est_time_min: 180,
    province: 'Western Cape', region: 'Franschhoek', town: 'Franschhoek',
    lat: -33.8960, lng: 19.0310,
    website_url: 'https://www.boschendal.com/adventures/trail-centre/',
    tags: ['trail-centre', 'wine-estate', 'Wines2Whales', 'family-friendly', 'restaurant'],
    routeVariants: [
      { name: 'Yellow Route', category: 'green', distance: 4, difficulty: 'beginner', description: 'Easy 4 km family-friendly loop, gentle terrain through vineyards' },
      { name: 'Blue Route', category: 'blue', distance: 10, difficulty: 'intermediate', description: 'Classic Boschendal loop with forest sections and berms' },
      { name: 'Red Route', category: 'red', distance: 16, difficulty: 'advanced', description: 'Technical sections, rock gardens and river crossings' },
      { name: 'Black XL Route', category: 'black', distance: 23, difficulty: 'expert', description: 'Full epic — all features, maximum climbing, the full Boschendal experience' },
    ],
  },

  // PAARL / WELLINGTON
  {
    slug: 'welvanpas-bains-mtb-wellington',
    name: 'Welvanpas Bains MTB Trails',
    description: 'Highly regarded network in the Hawekwa Mountains near Wellington. Four route options from 15 km moderate to 30 km advanced, combinable for a 56 km challenging ride. Rocky jeep tracks, steep singletrack descents, and fast-flowing sections through fynbos and vineyards with Hawekwa Mountain views.',
    discipline: 'mtb', difficulty: 'intermediate', surface: 'singletrack',
    distance_km: 30, elevation_m: 820, est_time_min: 210,
    province: 'Western Cape', region: 'Wellington', town: 'Wellington',
    lat: -33.6400, lng: 19.0200,
    website_url: 'https://tmtbc.co.za',
    tags: ['Hawekwa', 'rocky', 'technical', 'fynbos', 'day-permit'],
    routeVariants: [
      { name: 'Short Route (15 km)', category: 'blue', distance: 15, difficulty: 'intermediate', description: 'Moderate 15 km route with good mix of jeep track and singletrack' },
      { name: 'Medium Route (22 km)', category: 'red', distance: 22, difficulty: 'advanced', description: 'More climbing, technical singletrack descents' },
      { name: 'Full Route (30 km)', category: 'red', distance: 30, difficulty: 'advanced', description: 'Full 30 km advanced network through the Hawekwa Mountains' },
      { name: 'Epic Combination (56 km)', category: 'black', distance: 56, difficulty: 'expert', description: 'All routes combined — a full-day epic adventure' },
    ],
  },
  {
    slug: 'rhebokskloof-paarl-mtb',
    name: 'Rhebokskloof Wine Estate MTB',
    description: 'A scenic MTB experience on Rhebokskloof Wine Estate outside Paarl. Routes from 3 km family loops to 21 km more challenging routes with climbs offering Paarl Mountain views. Dirt roads and singletrack wind through vineyards and orchards. Wine tasting at the end is a must.',
    discipline: 'mtb', difficulty: 'beginner', surface: 'singletrack',
    distance_km: 21, elevation_m: 320, est_time_min: 120,
    province: 'Western Cape', region: 'Paarl', town: 'Paarl',
    lat: -33.7100, lng: 18.9700,
    website_url: 'https://rhebokskloof.co.za',
    tags: ['wine-estate', 'family-friendly', 'scenic', 'wine-tasting'],
    routeVariants: [
      { name: 'Family Loop', category: 'green', distance: 3, difficulty: 'beginner', description: 'Short 3 km family loop on easy dirt roads through vineyards' },
      { name: 'Vineyard Route', category: 'blue', distance: 14, difficulty: 'intermediate', description: '14 km leisurely route with Paarl Mountain views' },
      { name: 'Full Estate Ride', category: 'red', distance: 21, difficulty: 'advanced', description: '21 km full route with climbing and technical sections' },
    ],
  },

  // ELGIN VALLEY
  {
    slug: 'oak-valley-paul-cluver-trails',
    name: 'Oak Valley & Paul Cluver Wine Trails',
    description: 'Well-maintained Cape Epic trails in the Elgin Valley through two iconic wine estates. Features bridges, berms, and switchbacks through diverse apple orchards, indigenous forest, and mountain fynbos. Routes from 14 km for beginners to 75 km for fit riders. Part of the Wines2Whales race course.',
    discipline: 'mtb', difficulty: 'intermediate', surface: 'singletrack',
    distance_km: 36, elevation_m: 980, est_time_min: 240,
    province: 'Western Cape', region: 'Elgin', town: 'Elgin',
    lat: -34.1750, lng: 19.1250,
    website_url: 'https://paulcluver.com',
    tags: ['Cape-Epic', 'Wines2Whales', 'orchards', 'forest', 'technical'],
    routeVariants: [
      { name: 'Beginner Loop (14 km)', category: 'green', distance: 14, difficulty: 'beginner', description: 'Gentle 14 km intro route through orchards and forest' },
      { name: 'Intermediate (36 km)', category: 'blue', distance: 36, difficulty: 'intermediate', description: 'Classic Oak Valley loop — Cape Epic course sections' },
      { name: 'Epic Route (75 km)', category: 'black', distance: 75, difficulty: 'expert', description: '75 km full day epic — both estates linked, serious climbing' },
    ],
  },
  {
    slug: 'grabouw-a2z-trails',
    name: 'Grabouw A-2-Z Forest Trails',
    description: 'Relatively new trail system in the Grabouw Forest comprising 26 sections of singletrack forming a 36 km circular route. Challenging climbs through pine forest with technical descents, flowing berms, and breathtaking views over the Elgin Valley and mountains.',
    discipline: 'mtb', difficulty: 'advanced', surface: 'singletrack',
    distance_km: 36, elevation_m: 1100, est_time_min: 270,
    province: 'Western Cape', region: 'Elgin', town: 'Grabouw',
    lat: -34.1720, lng: 19.0580,
    website_url: 'https://grabouwmtb.co.za',
    tags: ['forest', 'technical', 'berms', 'Cape-Epic', 'new-trails'],
    routeVariants: [
      { name: 'Half Circuit', category: 'blue', distance: 18, difficulty: 'intermediate', description: 'First half of the A-2-Z circuit — good warm-up to the full route' },
      { name: 'Full A-2-Z (26 sections)', category: 'red', distance: 36, difficulty: 'advanced', description: 'All 26 singletrack sections — the full forest experience' },
    ],
  },
]

// ─── IMAGE SCRAPING ───────────────────────────────────────────────────────────
const BAD = [
  /logo/i, /icon/i, /favicon/i, /avatar/i, /spinner/i, /placeholder/i,
  /\/wp-includes\//i, /1x1/i, /spacer/i, /pixel\.gif/i, /blank\.gif/i,
  /\.svg(\?|$)/i, /badge/i, /button/i, /arrow/i, /social/i, /share/i,
]
const GOOD_EXT = /\.(jpg|jpeg|png|webp)(\?|$)/i

function scoreImage(url: string): number {
  const u = url.toLowerCase()
  let score = 0
  if (u.includes('gallery') || u.includes('photo') || u.includes('image')) score += 3
  if (u.includes('cycling') || u.includes('mtb') || u.includes('bike') || u.includes('trail')) score += 5
  if (u.includes('uploads') || u.includes('media') || u.includes('content')) score += 2
  const dim = u.match(/-(\d+)x(\d+)/)
  if (dim && (parseInt(dim[1]) < 300 || parseInt(dim[2]) < 200)) score -= 4
  if (u.includes('-1024') || u.includes('-1200') || u.includes('-1600')) score += 3
  return score
}

function isGood(url: string): boolean {
  if (!GOOD_EXT.test(url)) return false
  if (BAD.some(p => p.test(url))) return false
  return true
}

function abs(src: string, base: string): string | null {
  if (!src || src.startsWith('data:')) return null
  try { return new URL(src, base).href } catch { return null }
}

async function scrapeImages(websiteUrl: string, routeName: string): Promise<string[]> {
  if (!websiteUrl) return []
  try {
    const res = await fetch(websiteUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CycleMartBot/1.0)' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      redirect: 'follow',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const html = await res.text()
    const $ = cheerio.load(html)
    const found = new Map<string, number>()

    for (const sel of ['meta[property="og:image"]', 'meta[name="twitter:image"]']) {
      const c = $(sel).attr('content')
      if (c) { const a = abs(c, websiteUrl); if (a && isGood(a)) found.set(a, (found.get(a) ?? 0) + scoreImage(a) + 10) }
    }

    $('img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src')
      if (src) { const a = abs(src, websiteUrl); if (a && isGood(a)) found.set(a, (found.get(a) ?? 0) + scoreImage(a)) }
    })

    return [...found.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([url]) => url)
  } catch (e: any) {
    console.log(`  ⚠️  Image scrape failed for ${routeName}: ${e.message}`)
    return []
  }
}

// ─── ALSO SCRAPE MISSING IMAGES FOR EXISTING ROUTES ─────────────────────────
async function scrapeExistingRoutes() {
  const existing = await sql`
    SELECT id, name, website_url FROM routes
    WHERE province = 'Western Cape'
    AND (
      town ILIKE '%durban%' OR town ILIKE '%stellenbosch%' OR town ILIKE '%paarl%'
      OR town ILIKE '%franschhoek%' OR town ILIKE '%wellington%' OR town ILIKE '%elgin%'
      OR town ILIKE '%grabouw%' OR region ILIKE '%winelands%' OR region ILIKE '%durban%'
    )
    AND (image_count = 0 OR image_count IS NULL)
    AND website_url IS NOT NULL
  `
  console.log(`\nScraping images for ${existing.length} existing routes with no images...`)
  for (const r of existing) {
    process.stdout.write(`  Scraping ${r.name}... `)
    const imgs = await scrapeImages(r.website_url, r.name)
    if (imgs.length > 0) {
      await sql`
        UPDATE routes SET
          primary_image_url = ${imgs[0]},
          hero_image_url = ${imgs[0]},
          image_count = ${imgs.length},
          last_scraped_at = NOW()
        WHERE id = ${r.id}
      `
      console.log(`✅ ${imgs.length} images`)
    } else {
      console.log(`❌ none`)
    }
  }
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== Winelands/Durbanville Route Seeder ===\n')

  let added = 0, skipped = 0, imgTotal = 0

  for (const r of NEW_ROUTES) {
    // Check if already exists
    const existing = await sql`SELECT id FROM routes WHERE slug = ${r.slug}`
    if ((existing as any[]).length > 0) {
      console.log(`⏭️  Skipped (exists): ${r.name}`)
      skipped++
      continue
    }

    process.stdout.write(`➕ Adding: ${r.name}... `)

    // Scrape images
    const imgs = await scrapeImages(r.website_url ?? '', r.name)
    imgTotal += imgs.length

    // Insert route
    const [row] = await sql`
      INSERT INTO routes (
        slug, name, description, discipline, difficulty, surface,
        distance_km, elevation_m, est_time_min,
        province, region, town, lat, lng,
        website_url, tags, hero_image_url, primary_image_url, image_count,
        is_verified, last_scraped_at, status,
        created_at, updated_at
      ) VALUES (
        ${r.slug}, ${r.name}, ${r.description},
        ${r.discipline}, ${r.difficulty}, ${r.surface},
        ${r.distance_km ?? null}, ${r.elevation_m ?? null}, ${r.est_time_min ?? null},
        ${r.province}, ${r.region}, ${r.town},
        ${String(r.lat)}, ${String(r.lng)},
        ${r.website_url ?? null}, ${r.tags as any},
        ${imgs[0] ?? null}, ${imgs[0] ?? null}, ${imgs.length},
        false, NOW(), 'approved', NOW(), NOW()
      )
      RETURNING id
    ` as any

    const routeId = row.id

    // Insert route variants
    if (r.routeVariants?.length) {
      for (const v of r.routeVariants) {
        await sql`
          INSERT INTO route_loops (
            route_id, name, category, distance_km, difficulty, description, subtitle
          ) VALUES (
            ${routeId}, ${v.name}, ${v.category}, ${v.distance},
            ${v.difficulty},
            ${v.description},
            ${v.category === 'green' ? 'Green Circle' : v.category === 'blue' ? 'Blue Square' : v.category === 'red' ? 'Red Diamond' : 'Black Diamond'}
          )
          ON CONFLICT DO NOTHING
        `
      }
    }

    console.log(`✅ imgs:${imgs.length} variants:${r.routeVariants?.length ?? 0}`)
    added++
  }

  // Scrape images for existing no-image routes
  await scrapeExistingRoutes()

  console.log('\n=== Done ===')
  console.log(`Added: ${added} | Skipped: ${skipped} | Images scraped: ${imgTotal}`)
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
