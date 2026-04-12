// Load .env.local manually before any imports that need DATABASE_URL
import { readFileSync } from 'fs'
try {
  const env = readFileSync('.env.local', 'utf8')
  env.split('\n').forEach(line => {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  })
} catch {}

import * as cheerio from 'cheerio'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

const SKIP_DOMAINS = ['facebook.com', 'instagram.com', 'twitter.com', 'sanparks.org', 'sa-venues.com', 'booking.com', 'tripadvisor']
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|webp|gif)(\?|$)/i
const MIN_IMG_SIZE_HINT = 200 // skip images with w/h < 200 in URL
const MAX_IMAGES_PER_ROUTE = 8

// Bad patterns — logos, icons, spinners, avatars
const BAD_PATTERNS = [
  /logo/i, /icon/i, /favicon/i, /avatar/i, /spinner/i, /placeholder/i,
  /banner.*small/i, /thumb.*logo/i, /pixel/i, /tracking/i,
  /\/wp-includes\//i, /\/assets\/img\/ui\//i,
  /1x1/i, /spacer/i, /loading/i,
]

function isGoodImage(url: string): boolean {
  if (!IMAGE_EXTENSIONS.test(url)) return false
  if (BAD_PATTERNS.some(p => p.test(url))) return false
  // Skip tiny images hinted by filename (e.g. -50x50, _thumb_)
  if (/-\d{1,3}x\d{1,3}[^/]*\.(jpg|jpeg|png|webp)/i.test(url)) {
    const match = url.match(/-(\d+)x(\d+)/i)
    if (match && (parseInt(match[1]) < MIN_IMG_SIZE_HINT || parseInt(match[2]) < MIN_IMG_SIZE_HINT)) return false
  }
  return true
}

function toAbsolute(src: string, base: string): string | null {
  if (!src || src.startsWith('data:')) return null
  try {
    return new URL(src, base).href
  } catch {
    return null
  }
}

async function scrapeImages(url: string): Promise<string[]> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CycleMartBot/1.0 +https://cyclemart.co.za)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return []
    const html = await res.text()
    const $ = cheerio.load(html)
    const imgs = new Set<string>()

    // 1. og:image / twitter:image meta (often best quality hero)
    const ogImg = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content')
    if (ogImg) {
      const abs = toAbsolute(ogImg, url)
      if (abs && isGoodImage(abs)) imgs.add(abs)
    }

    // 2. All <img> tags — prefer large srcset candidates
    $('img').each((_, el) => {
      const srcset = $(el).attr('srcset')
      if (srcset) {
        // Pick largest srcset candidate
        const candidates = srcset.split(',').map(s => s.trim().split(/\s+/))
        const largest = candidates.reduce((best, cur) => {
          const w = parseInt(cur[1]?.replace('w', '') ?? '0')
          const bw = parseInt(best[1]?.replace('w', '') ?? '0')
          return w > bw ? cur : best
        }, candidates[0])
        const abs = toAbsolute(largest?.[0] ?? '', url)
        if (abs && isGoodImage(abs)) imgs.add(abs)
      }

      const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src')
      if (src) {
        const abs = toAbsolute(src, url)
        if (abs && isGoodImage(abs)) imgs.add(abs)
      }
    })

    // 3. CSS background-image in style attrs
    $('[style]').each((_, el) => {
      const style = $(el).attr('style') ?? ''
      const match = style.match(/url\(['"]?([^'")\s]+)['"]?\)/g)
      if (match) {
        match.forEach(m => {
          const inner = m.replace(/url\(['"]?/, '').replace(/['"]?\)/, '')
          const abs = toAbsolute(inner, url)
          if (abs && isGoodImage(abs)) imgs.add(abs)
        })
      }
    })

    return Array.from(imgs).slice(0, MAX_IMAGES_PER_ROUTE)
  } catch {
    return []
  }
}

async function main() {
  console.log('🖼️  Venue image scraper starting...\n')

  // Get routes that need images (< 2 unique images, have a scrapeable website)
  const routes = await sql`
    SELECT r.id, r.name, r.website_url, r.hero_image_url,
           COUNT(DISTINCT ri.url) as img_count
    FROM routes r
    LEFT JOIN route_images ri ON ri.route_id = r.id
    WHERE r.website_url IS NOT NULL
      AND r.website_url != ''
      AND r.website_url NOT LIKE '%facebook%'
      AND r.website_url NOT LIKE '%instagram%'
      AND r.website_url NOT LIKE '%booking.com%'
      AND r.website_url NOT LIKE '%tripadvisor%'
      AND r.website_url NOT LIKE '%sanparks.org%'
    GROUP BY r.id, r.name, r.website_url, r.hero_image_url
    HAVING COUNT(DISTINCT ri.url) < 3
    ORDER BY r.created_at DESC
    LIMIT 150
  `

  console.log(`Routes to scrape: ${routes.length}`)
  let totalInserted = 0
  let routesUpdated = 0
  const errors: string[] = []

  for (let i = 0; i < routes.length; i++) {
    const r = routes[i] as any
    process.stdout.write(`  [${i + 1}/${routes.length}] ${r.name.slice(0, 45).padEnd(45)} `)

    try {
      const imgs = await scrapeImages(r.website_url)
      if (imgs.length === 0) {
        process.stdout.write('— no images\n')
        continue
      }

      // Delete old placeholder images (unsplash/seed) if we found real ones
      const hasRealImages = imgs.some(u => !u.includes('unsplash.com'))
      if (hasRealImages) {
        await sql`DELETE FROM route_images WHERE route_id = ${r.id} AND source IN ('seed', 'unsplash')`
      }

      // Insert new images
      let inserted = 0
      for (let j = 0; j < imgs.length; j++) {
        const imgUrl = imgs[j]
        try {
          await sql`
            INSERT INTO route_images (id, route_id, url, is_primary, display_order, source, alt_text)
            VALUES (gen_random_uuid(), ${r.id}, ${imgUrl}, ${j === 0}, ${j}, 'venue', ${r.name})
            ON CONFLICT DO NOTHING
          `
          inserted++
        } catch { /* skip dup */ }
      }

      if (inserted > 0) {
        // Update route hero + image_count
        await sql`
          UPDATE routes SET
            hero_image_url    = ${imgs[0]},
            primary_image_url = ${imgs[0]},
            image_count       = ${inserted},
            updated_at        = NOW()
          WHERE id = ${r.id}
        `
        totalInserted += inserted
        routesUpdated++
        process.stdout.write(`✅ ${inserted} images\n`)
      } else {
        process.stdout.write('— 0 inserted (all duplicates)\n')
      }
    } catch (e: any) {
      process.stdout.write(`❌ ${e.message?.slice(0, 40)}\n`)
      errors.push(`${r.name}: ${e.message?.slice(0, 60)}`)
    }

    // Polite rate limit — 800ms between requests
    await new Promise(r => setTimeout(r, 800))
  }

  console.log(`\n─── Results ───────────────────────────────`)
  console.log(`  Routes scraped  : ${routes.length}`)
  console.log(`  Routes updated  : ${routesUpdated}`)
  console.log(`  Images inserted : ${totalInserted}`)
  if (errors.length) console.log(`  Errors          : ${errors.length} (first 3: ${errors.slice(0, 3).join('; ')})`)
  console.log(`────────────────────────────────────────────`)
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
