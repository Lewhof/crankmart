/**
 * Clean irrelevant hero images from routes.
 * Sets hero_image_url = NULL for images that are:
 * - UI elements (dummy, loader, btn, menu icons)
 * - Wrong venue (image belongs to a different park/place)
 * - Accommodation photos (chalets, cabins) on cycling routes
 * - Generic OG/logo-only images with no cycling content
 * - 4x4/other sport banners on cycling routes
 */
import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
const envFile = readFileSync('.env.local', 'utf-8')
for (const line of envFile.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && v.length) process.env[k.trim()] = v.join('=').trim()
}
const sql = neon(process.env.DATABASE_URL!)

const removals: Array<{ slug: string; reason: string }> = [
  // ── UI elements / broken placeholders ──────────────────────────────
  { slug: '3-rivers-trails',                reason: 'dummy.png — RevSlider placeholder, no content' },
  { slug: 'j-bay-bike-park',                reason: 'dummy.png — RevSlider placeholder, no content' },
  { slug: 'rocky-bay-resort',               reason: 'dummy.png — RevSlider placeholder, no content' },
  { slug: 'rietvlei-trails',                reason: 'loader_1.png — page loading spinner, not an image' },
  { slug: 'cycle-lab-bike-park',            reason: 'menu.png — navigation menu icon, not a photo' },
  { slug: 'eselfontein-farm-mtb-trails',    reason: 'menu-close.png — UI close button, not a photo' },
  { slug: 'dirtopia-trail-centre',          reason: 'linkcmp.png — Facebook share plugin button' },
  { slug: 'giba-gorge',                     reason: 'btn.png — button graphic, not a photo' },
  { slug: 'sabie-mtb-trails',               reason: 'm_home.gif — homepage GIF, no cycling content' },
  { slug: 'van-gaalen-kaasmakerij',         reason: 'quality_auto image — automated quality check file' },

  // ── Accommodation photos on cycling routes ──────────────────────────
  { slug: 'marloth-mtb-park',               reason: 'accomo1.gif — accommodation photo, not trail/cycling' },
  { slug: 'mountain-sanctuary-park',        reason: 'cabin-640x480.jpg — cabin accommodation photo' },
  { slug: 'tranquilitas-adventure-farm',    reason: 'featured-chalets.jpg — chalets accommodation photo' },

  // ── Wrong venue images (image belongs to a different place) ─────────
  { slug: 'kaapsehoop-mountain-bike-trails', reason: 'verkykerskop image used — Kaapsehoop MP, Verkykerskop FS (different province)' },
  { slug: 'paarl-mountain-mtb-trails',       reason: 'hartspad image used — Hartspad NW, Paarl Mountain WC (different province)' },
  { slug: 'tulbagh-mtb-trails',              reason: 'tokai image used — Tokai Cape Town, Tulbagh is 80km away' },
  { slug: 'trails-end-bike-hotel',           reason: 'karkloof KZN image used — Trails End is WC, Karkloof is KZN' },
  { slug: 'kleinmond-mtb-trails',            reason: 'rocky-bay image used — Rocky Bay KZN, Kleinmond is WC' },
  { slug: 'grootvadersbosch-nature-reserve-mtb', reason: 'ingeli image used — Ingeli KZN, Grootvadersbosch is WC' },
  { slug: 'anysberg-nature-reserve-mtb',     reason: 'wines2wales event image — Anysberg NR, not Wines2Whales event' },
  { slug: 'sanparks-garden-route-mtb-trails',reason: 'Kruger NP image used — Garden Route is 1500km from Kruger' },
  { slug: 'buffelsdrift-rust-de-winter',     reason: 'birdhiking.co.za banner — wrong website entirely' },
  { slug: 'ingeli-forest-trails',            reason: 'butterflies-for-africa.org image — wrong site/venue' },
  { slug: 'riemvasmaak-mtb-route',           reason: 'khamkirri.co.za awards badge — wrong venue entirely' },

  // ── Generic SANParks Facebook OG (same generic logo on multiple routes) ──
  { slug: 'augrabies-falls-national-park',   reason: 'generic SANParks Facebook OG image — not route-specific' },
  { slug: 'richtersveld-donkey-trail',        reason: 'generic SANParks Facebook OG image — not route-specific' },
  { slug: 'ai-aisrichtersveld-transfrontier-park', reason: 'generic SANParks Facebook OG image — not route-specific' },
  { slug: 'kruger-national-park-mtb-trails', reason: 'generic SANParks Facebook OG image — not route-specific' },

  // ── Logo/emblem only — no visual cycling content ────────────────────
  { slug: 'camelroc-guest-farm-mountain-bike-trails', reason: 'Emblem+copy.png — logo emblem only, no trail/cycling photo' },
  { slug: 'koranna-getaway-mountain-bike-trail',       reason: 'header160x198 — tiny header image (160×198px), no useful content' },
  { slug: 'grace-college-trails',             reason: 'GC-BADGE-NAME — school badge logo, no cycling photo' },
  { slug: 'rhebokskloof-paarl-mtb',           reason: 'Gift-Launch image — product launch photo, not cycling/trail' },
  { slug: 'meerendal-wine-estate-mtb',        reason: 'removebg-preview — transparent PNG logo cutout, no photo content' },
  { slug: 'camelroc-guest-farm-mountain-bike-trails', reason: 'squarespace emblem logo — no visual trail content' },

  // ── Wrong sport / activity ───────────────────────────────────────────
  { slug: 'hennops-mtb-trails',              reason: '4x4-banner.png — 4×4 off-road vehicle banner, not cycling' },

  // ── Other clearly irrelevant ─────────────────────────────────────────
  { slug: 'lochs-hoek-farm',                 reason: 'directions.jpg — directions/map image, not a trail photo' },
  { slug: 'clearwater-trails',               reason: 'BC_Location_001 — location establishment photo, not trail' },
  { slug: 'holla-trails',                    reason: 'h1-top-background-image.png — generic page background, no cycling content' },
  { slug: 'bsorah-adventures',               reason: 'bsorah-sunset-banner — property sunset photo, not cycling-specific' },
]

// Deduplicate slugs (some listed twice)
const unique = [...new Map(removals.map(r => [r.slug, r])).values()]

async function main() {
  console.log(`\n🧹 Cleaning ${unique.length} irrelevant hero images...\n`)

  let cleaned = 0, notFound = 0, alreadyNull = 0

  for (const { slug, reason } of unique) {
    const [route] = await sql`SELECT id, name, hero_image_url FROM routes WHERE slug = ${slug}`
    if (!route) { console.log(`  ⚠️  Not found: ${slug}`); notFound++; continue }
    if (!route.hero_image_url) { alreadyNull++; continue }

    await sql`UPDATE routes SET hero_image_url = NULL WHERE slug = ${slug}`
    console.log(`  🗑️  ${route.name}`)
    console.log(`       Reason: ${reason}`)
    cleaned++
  }

  const [withImg]    = await sql`SELECT COUNT(*) AS c FROM routes WHERE hero_image_url IS NOT NULL AND hero_image_url != ''`
  const [withoutImg] = await sql`SELECT COUNT(*) AS c FROM routes WHERE hero_image_url IS NULL OR hero_image_url = ''`

  console.log(`\n──────────────────────────────────────────────────`)
  console.log(`✅ ${cleaned} images cleared | ${alreadyNull} already null | ${notFound} not found`)
  console.log(`📊 Routes with hero image:    ${withImg.c}`)
  console.log(`📊 Routes without hero image: ${withoutImg.c}`)

  // Show remaining images by domain for verification
  console.log('\n📋 Remaining images by source domain:')
  const remaining = await sql`
    SELECT 
      CASE 
        WHEN hero_image_url LIKE '%unsplash%' THEN 'unsplash.com'
        WHEN hero_image_url LIKE '%attached_assets%' OR hero_image_url LIKE '/uploads%' THEN 'local upload'
        WHEN hero_image_url LIKE '%wixstatic%' THEN 'wix'
        WHEN hero_image_url LIKE '%squarespace%' THEN 'squarespace'
        WHEN hero_image_url LIKE '%wordpress%' OR hero_image_url LIKE '%wp-content%' THEN 'wordpress sites'
        ELSE 'other'
      END AS source,
      COUNT(*) AS c
    FROM routes
    WHERE hero_image_url IS NOT NULL AND hero_image_url != ''
    GROUP BY 1 ORDER BY c DESC
  `
  remaining.forEach((r: any) => console.log(`  ${String(r.source).padEnd(20)} ${r.c}`))
}

main().catch(console.error)
