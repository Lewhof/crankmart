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
const TIMEOUT_MS = 15000

const BAD = [
  /logo/i, /icon/i, /favicon/i, /avatar/i, /spinner/i, /placeholder/i,
  /\/wp-includes\//i, /1x1/i, /spacer/i, /pixel\.gif/i, /blank\.gif/i,
  /\.svg(\?|$)/i, /badge/i, /button/i, /arrow/i, /social/i, /share/i,
  /wp-content\/themes/i, /screenshot/i, /thumbnail.*\d{1,2}x\d{1,2}[^0-9]/i,
]
const GOOD_EXT = /\.(jpg|jpeg|png|webp)(\?|$)/i

function scoreImage(url: string): number {
  const u = url.toLowerCase()
  let score = 0
  if (u.includes('gallery') || u.includes('photo') || u.includes('image')) score += 3
  if (u.includes('cycling') || u.includes('mtb') || u.includes('bike') || u.includes('trail')) score += 5
  if (u.includes('uploads') || u.includes('media') || u.includes('content')) score += 2
  const dim = u.match(/-(\d+)x(\d+)/)
  if (dim && (parseInt(dim[1]) < 400 || parseInt(dim[2]) < 300)) score -= 5
  if (u.includes('-1024') || u.includes('-1200') || u.includes('-1600') || u.includes('w=800') || u.includes('w=1200')) score += 3
  return score
}

function isGood(url: string): boolean {
  if (!GOOD_EXT.test(url)) return false
  return !BAD.some(p => p.test(url))
}

function abs(src: string, base: string): string | null {
  if (!src || src.startsWith('data:')) return null
  try { return new URL(src, base).href } catch { return null }
}

async function scrapeUrl(url: string): Promise<string[]> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      redirect: 'follow',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const html = await res.text()
    const $ = cheerio.load(html)
    const found = new Map<string, number>()

    // Meta og images (highest priority)
    for (const sel of ['meta[property="og:image"]', 'meta[name="twitter:image"]', 'meta[property="og:image:secure_url"]']) {
      const c = $(sel).attr('content')
      if (c) { const a = abs(c, url); if (a && isGood(a)) found.set(a, (found.get(a) ?? 0) + scoreImage(a) + 15) }
    }

    // Gallery/slideshow containers first
    $('[class*="gallery"] img, [class*="slider"] img, [class*="carousel"] img, [id*="gallery"] img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src')
      if (src) { const a = abs(src, url); if (a && isGood(a)) found.set(a, (found.get(a) ?? 0) + scoreImage(a) + 5) }
    })

    // All images
    $('img').each((_, el) => {
      const srcs = [
        $(el).attr('src'), $(el).attr('data-src'),
        $(el).attr('data-lazy-src'), $(el).attr('data-original'),
      ]
      for (const src of srcs) {
        if (!src) continue
        const a = abs(src, url)
        if (a && isGood(a)) found.set(a, (found.get(a) ?? 0) + scoreImage(a))
      }
      // srcset
      const srcset = $(el).attr('srcset') || $(el).attr('data-srcset')
      if (srcset) {
        const best = srcset.split(',')
          .map(s => { const [u, w] = s.trim().split(/\s+/); return { u, w: parseInt(w ?? '0') } })
          .sort((a, b) => b.w - a.w)[0]
        if (best?.u) { const a = abs(best.u, url); if (a && isGood(a)) found.set(a, (found.get(a) ?? 0) + scoreImage(a) + 2) }
      }
    })

    // Background CSS images
    $('[style]').each((_, el) => {
      const style = $(el).attr('style') ?? ''
      const m = style.match(/url\(['"]?([^'")\s]+)['"]?\)/g)
      if (m) {
        m.forEach(match => {
          const img = match.replace(/url\(['"]?|['"]?\)/g, '')
          const a = abs(img, url); if (a && isGood(a)) found.set(a, (found.get(a) ?? 0) + scoreImage(a) - 1)
        })
      }
    })

    return [...found.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([u]) => u)
  } catch (e: any) {
    throw new Error(`${e.message}`)
  }
}

// Per-route fallback URL list to try
const ROUTE_IMAGE_SOURCES: Record<string, string[]> = {
  'bloemendal-trail-network': [
    'https://www.bloemendalestate.co.za/',
    'https://www.bloemendalestate.co.za/activities/',
    'https://mtbroutes.co.za/trail-detail/bloemendal/',
  ],
  'hoogekraal-welvergenoegd-mtb': [
    'https://mtbroutes.co.za/trail-detail/hoogekraal/',
    'https://tmtbc.co.za/trails/hoogekraal/',
    'https://www.trailforks.com/region/durbanville-34014/',
  ],
  'majik-forest-durbanville': [
    'https://mtbroutes.co.za/trail-detail/majik-forest/',
    'https://tmtbc.co.za',
  ],
  'contermanskloof-mtb-trails': [
    'https://mtbroutes.co.za/trail-detail/contermanskloof/',
    'https://www.contermanskloof.co.za',
  ],
  'banhoek-conservancy-trails': [
    'https://www.banhoekconservancy.co.za',
    'https://mtbroutes.co.za/trail-detail/banhoek/',
    'https://www.boschendal.com/adventures/',
  ],
  'boschendal-trail-centre': [
    'https://www.boschendal.com/adventures/',
    'https://www.boschendal.com',
    'https://mtbroutes.co.za/trail-detail/boschendal/',
  ],
  'welvanpas-bains-mtb-wellington': [
    'https://mtbroutes.co.za/trail-detail/welvanpas/',
    'https://tmtbc.co.za/trails/',
  ],
  'oak-valley-paul-cluver-trails': [
    'https://www.oakvalley.co.za/activities/mountain-biking/',
    'https://www.oakvalley.co.za',
    'https://paulcluver.com',
    'https://mtbroutes.co.za/trail-detail/paul-cluver/',
  ],
  'grabouw-a2z-trails': [
    'https://grabouwmtb.co.za',
    'https://mtbroutes.co.za/trail-detail/grabouw-forest/',
  ],
  'simonsberg-wine-trails': [
    'https://winelandscyclingclub.co.za',
    'https://mtbroutes.co.za/trail-detail/simonsberg/',
    'https://www.muratie.co.za',
    'https://www.delheim.com/visit/activities/',
  ],
  // Existing routes with 0 images
  'grabouw-forest-flow': [
    'https://grabouwmtb.co.za',
    'https://mtbroutes.co.za/trail-detail/grabouw-forest/',
  ],
  'stellenbosch-wine-route-mtb': [
    'https://winelandscyclingclub.co.za',
    'https://stellenboschwinelands.co.za',
    'https://mtbroutes.co.za/trail-detail/stellenbosch/',
  ],
  'paardeberg-gravel-farms': [
    'https://www.paardeberg.co.za',
    'https://mtbroutes.co.za/trail-detail/paardeberg/',
  ],
  'grinduro-sa-course': [
    'https://grinduro.com/south-africa/',
    'https://mtbroutes.co.za/trail-detail/grinduro/',
  ],
  'nuy-valley-mtb-trail': [
    'https://mtbroutes.co.za/trail-detail/nuy-valley/',
    'https://www.worcester.co.za/activities/mountain-biking/',
  ],
  'helshoogte-pass': [
    'https://mtbroutes.co.za/trail-detail/helshoogte/',
  ],
  'du-toitskloof-pass': [
    'https://mtbroutes.co.za/trail-detail/du-toitskloof/',
  ],
  'franschhoek-pass-road': [
    'https://mtbroutes.co.za/trail-detail/franschhoek-pass/',
    'https://www.franschhoek.org.za/activities/cycling/',
  ],
}

async function main() {
  // Get all winelands/durbanville routes with 0 images
  const routes = await sql`
    SELECT id, slug, name, website_url, image_count
    FROM routes
    WHERE province = 'Western Cape'
    AND (
      town ILIKE '%durban%' OR town ILIKE '%stellenbosch%' OR town ILIKE '%paarl%'
      OR town ILIKE '%franschhoek%' OR town ILIKE '%wellington%' OR town ILIKE '%elgin%'
      OR town ILIKE '%grabouw%' OR region ILIKE '%winelands%' OR region ILIKE '%durban%'
      OR slug ILIKE '%boschendal%' OR slug ILIKE '%banhoek%' OR slug ILIKE '%simonsberg%'
      OR slug ILIKE '%welvanpas%' OR slug ILIKE '%oak-valley%' OR slug ILIKE '%grabouw-a2z%'
    )
    AND (image_count = 0 OR image_count IS NULL)
    ORDER BY name
  ` as any[]

  console.log(`Scraping images for ${routes.length} routes...\n`)

  let fixed = 0
  for (const route of routes) {
    const urlsToTry = [
      ...(ROUTE_IMAGE_SOURCES[route.slug] ?? []),
      route.website_url,
    ].filter(Boolean)

    let imgs: string[] = []
    let source = ''

    for (const url of urlsToTry) {
      process.stdout.write(`  ${route.name} → ${url} ... `)
      try {
        imgs = await scrapeUrl(url)
        if (imgs.length > 0) { source = url; console.log(`✅ ${imgs.length} imgs`); break }
        else console.log('0 imgs')
      } catch (e: any) {
        console.log(`❌ ${e.message}`)
      }
    }

    if (imgs.length > 0) {
      await sql`
        UPDATE routes SET
          primary_image_url = ${imgs[0]},
          hero_image_url = ${imgs[0]},
          image_count = ${imgs.length},
          last_scraped_at = NOW()
        WHERE id = ${route.id}
      `
      fixed++
    } else {
      console.log(`  ⚠️  No images found for: ${route.name}`)
    }
  }

  console.log(`\n=== Done: ${fixed}/${routes.length} routes got images ===`)
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
