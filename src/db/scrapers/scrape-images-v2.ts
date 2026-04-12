// Load .env.local before any imports
import { readFileSync } from 'fs'
try {
  readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  })
} catch {}

import * as cheerio from 'cheerio'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)
const MAX_PER_ROUTE = 8
const TIMEOUT_MS = 12000

// Image quality filters
const BAD = [
  /logo/i, /icon/i, /favicon/i, /avatar/i, /spinner/i, /placeholder/i,
  /\/wp-includes\//i, /1x1/i, /spacer/i, /pixel\.gif/i, /blank\.gif/i,
  /\.svg(\?|$)/i, /badge/i, /button/i, /arrow/i, /star\.png/i,
  /social/i, /share/i, /tweet/i, /fb-/i, /whatsapp/i,
]
const GOOD_EXT = /\.(jpg|jpeg|png|webp)(\?|$)/i

// Score an image URL — higher = better
function scoreImage(url: string): number {
  const u = url.toLowerCase()
  let score = 0
  if (u.includes('gallery') || u.includes('photo') || u.includes('image')) score += 3
  if (u.includes('cycling') || u.includes('mtb') || u.includes('bike') || u.includes('trail')) score += 5
  if (u.includes('uploads') || u.includes('media') || u.includes('content')) score += 2
  // Penalise small images by filename hint
  const dim = u.match(/-(\d+)x(\d+)/)
  if (dim && (parseInt(dim[1]) < 300 || parseInt(dim[2]) < 200)) score -= 4
  // Prefer wider images
  if (u.includes('-1024') || u.includes('-1200') || u.includes('-1600') || u.includes('w=800') || u.includes('w=1200')) score += 3
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

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CycleMartBot/1.0 +https://cyclemart.co.za)' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    redirect: 'follow',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

async function scrapePageImages(url: string): Promise<{ url: string; score: number }[]> {
  const html = await fetchHtml(url)
  const $ = cheerio.load(html)
  const found = new Map<string, number>()

  // og:image / twitter:image
  for (const sel of ['meta[property="og:image"]', 'meta[name="twitter:image"]', 'meta[property="og:image:secure_url"]']) {
    const c = $(sel).attr('content')
    if (c) { const a = abs(c, url); if (a && isGood(a)) found.set(a, (found.get(a) ?? 0) + scoreImage(a) + 10) }
  }

  // <img> tags
  $('img').each((_, el) => {
    // Try srcset first (pick largest)
    const srcset = $(el).attr('srcset') || $(el).attr('data-srcset')
    if (srcset) {
      const best = srcset.split(',')
        .map(s => { const [u, w] = s.trim().split(/\s+/); return { u, w: parseInt(w ?? '0') } })
        .sort((a, b) => b.w - a.w)[0]
      if (best?.u) { const a = abs(best.u, url); if (a && isGood(a)) found.set(a, (found.get(a) ?? 0) + scoreImage(a) + 2) }
    }
    for (const attr of ['src', 'data-src', 'data-lazy-src', 'data-original', 'data-full-url']) {
      const v = $(el).attr(attr)
      if (v) { const a = abs(v, url); if (a && isGood(a)) found.set(a, (found.get(a) ?? 0) + scoreImage(a)) }
    }
  })

  // Background images in style attrs
  $('[style*="url("]').each((_, el) => {
    const style = $(el).attr('style') ?? ''
    const matches = style.match(/url\(['"]?([^'")\s]+)['"]?\)/g) ?? []
    matches.forEach(m => {
      const inner = m.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '')
      const a = abs(inner, url)
      if (a && isGood(a)) found.set(a, (found.get(a) ?? 0) + scoreImage(a))
    })
  })

  // data-bg, data-background
  $('[data-bg],[data-background]').each((_, el) => {
    const v = $(el).attr('data-bg') || $(el).attr('data-background')
    if (v) { const a = abs(v, url); if (a && isGood(a)) found.set(a, (found.get(a) ?? 0) + scoreImage(a)) }
  })

  return Array.from(found.entries())
    .map(([url, score]) => ({ url, score }))
    .sort((a, b) => b.score - a.score)
}

// Build candidate subpages to try for a venue
function gallerySubpages(baseUrl: string): string[] {
  try {
    const u = new URL(baseUrl)
    const base = u.origin
    return [
      baseUrl,
      `${base}/gallery`,
      `${base}/photos`,
      `${base}/images`,
      `${base}/activities`,
      `${base}/mountain-biking`,
      `${base}/mtb`,
      `${base}/trails`,
      `${base}/cycling`,
    ]
  } catch { return [baseUrl] }
}

async function getBestImages(routeName: string, websiteUrl: string, existingUrls: Set<string>): Promise<string[]> {
  const collected = new Map<string, number>()
  const pages = gallerySubpages(websiteUrl)

  for (const page of pages) {
    try {
      const imgs = await scrapePageImages(page)
      imgs.forEach(({ url, score }) => {
        if (!existingUrls.has(url)) collected.set(url, Math.max(collected.get(url) ?? -999, score))
      })
      if (collected.size >= MAX_PER_ROUTE * 3) break // enough candidates
      await new Promise(r => setTimeout(r, 400))
    } catch { /* skip subpage */ }
  }

  return Array.from(collected.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_PER_ROUTE)
    .map(([url]) => url)
}

async function main() {
  console.log('🖼️  Enhanced venue image scraper v2\n')

  // Target routes with < 3 images that have a scrapeable website
  const routes = await sql`
    SELECT r.id, r.name, r.website_url, r.discipline,
           COUNT(DISTINCT ri.url) as img_count
    FROM routes r
    LEFT JOIN route_images ri ON ri.route_id = r.id AND ri.source = 'venue'
    WHERE r.website_url IS NOT NULL
      AND r.website_url != ''
      AND r.website_url NOT LIKE '%facebook%'
      AND r.website_url NOT LIKE '%instagram%'
      AND r.website_url NOT LIKE '%booking.com%'
      AND r.website_url NOT LIKE '%tripadvisor%'
    GROUP BY r.id, r.name, r.website_url, r.discipline
    HAVING COUNT(DISTINCT ri.url) < 3
    ORDER BY COUNT(DISTINCT ri.url) ASC, r.created_at DESC
    LIMIT 120
  `

  console.log(`Routes to enhance: ${routes.length}\n`)
  let totalInserted = 0, routesUpdated = 0

  for (let i = 0; i < routes.length; i++) {
    const r = routes[i] as any
    process.stdout.write(`  [${i + 1}/${routes.length}] ${r.name.slice(0, 42).padEnd(42)} `)

    try {
      // Get existing image URLs to avoid dupes
      const existing = await sql`SELECT url FROM route_images WHERE route_id = ${r.id}`
      const existingUrls = new Set((existing as any[]).map(x => x.url))

      const imgs = await getBestImages(r.name, r.website_url, existingUrls)
      if (imgs.length === 0) { process.stdout.write('— no images found\n'); continue }

      // Remove old unsplash/seed placeholders first
      const hasRealNew = imgs.some(u => !u.includes('unsplash.com'))
      if (hasRealNew) {
        await sql`DELETE FROM route_images WHERE route_id = ${r.id} AND source IN ('seed','unsplash')`
      }

      let inserted = 0
      const startOrder = parseInt(r.img_count as string) || 0
      for (let j = 0; j < imgs.length; j++) {
        try {
          await sql`
            INSERT INTO route_images (id, route_id, url, is_primary, display_order, source, alt_text)
            VALUES (gen_random_uuid(), ${r.id}, ${imgs[j]}, ${j === 0 && startOrder === 0}, ${startOrder + j}, 'venue', ${r.name})
            ON CONFLICT DO NOTHING
          `
          inserted++
        } catch { /* dup */ }
      }

      if (inserted > 0) {
        const primary = imgs[0]
        await sql`
          UPDATE routes
          SET hero_image_url = ${primary}, primary_image_url = ${primary},
              image_count = (SELECT COUNT(*) FROM route_images WHERE route_id = ${r.id}),
              updated_at = NOW()
          WHERE id = ${r.id}
        `
        totalInserted += inserted
        routesUpdated++
        process.stdout.write(`✅ +${inserted} images (total: ${startOrder + inserted})\n`)
      } else {
        process.stdout.write('— 0 new (all duplicates)\n')
      }
    } catch (e: any) {
      process.stdout.write(`❌ ${(e.message ?? '').slice(0, 45)}\n`)
    }

    await new Promise(r => setTimeout(r, 600))
  }

  // Final dedup pass
  await sql`
    DELETE FROM route_images WHERE id IN (
      SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY route_id, url ORDER BY
          CASE source WHEN 'venue' THEN 1 WHEN 'mtbtrailssa' THEN 2 ELSE 3 END
        ) rn FROM route_images
      ) x WHERE rn > 1
    )
  `

  const [total, multiImg] = await Promise.all([
    sql`SELECT COUNT(*) FROM route_images`,
    sql`SELECT COUNT(*) FROM (SELECT route_id FROM route_images GROUP BY route_id HAVING COUNT(DISTINCT url) >= 3) x`,
  ])

  console.log(`\n────────────────────────────────────────────`)
  console.log(`  Routes enhanced : ${routesUpdated}`)
  console.log(`  Images inserted : ${totalInserted}`)
  console.log(`  Total in DB     : ${(total as any[])[0].count}`)
  console.log(`  Routes with 3+  : ${(multiImg as any[])[0].count}`)
  console.log(`────────────────────────────────────────────`)
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
