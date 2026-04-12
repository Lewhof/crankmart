import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { readFileSync } from 'fs'

const posts = [
  { file: '/home/hein/.openclaw/workspace/crankmart/content/blog/best-bike-shops-cape-town-2026.md', slug: 'best-bike-shops-cape-town-2026', category: 'guides', featured: true },
  { file: '/home/hein/.openclaw/workspace/crankmart/content/blog/best-bike-shops-johannesburg-2026.md', slug: 'best-bike-shops-johannesburg-2026', category: 'guides', featured: false },
  { file: '/home/hein/.openclaw/workspace/crankmart/content/blog/cycling-events-south-africa-2026.md', slug: 'cycling-events-south-africa-2026', category: 'events', featured: true },
  { file: '/home/hein/.openclaw/workspace/crankmart/content/blog/what-is-crankmart-sa-cycling-marketplace.md', slug: 'what-is-crankmart-sa-cycling-marketplace', category: 'about', featured: false },
]

async function main() {
  for (const p of posts) {
    const raw = readFileSync(p.file, 'utf-8')
    const titleMatch = raw.match(/^title:\s*["']?(.+?)["']?\s*$/m)
    const descMatch = raw.match(/^description:\s*["']?(.+?)["']?\s*$/m)
    const title = titleMatch ? titleMatch[1].trim() : p.slug
    const excerpt = descMatch ? descMatch[1].trim() : title
    const body = raw.replace(/^---[\s\S]*?---\n/, '').trim()

    // status enum is news_status: pending|approved|rejected|draft — use 'approved'
    await db.execute(
      sql`INSERT INTO news_articles 
          (title, slug, excerpt, body, category, author_name, author_email, status, is_featured, views_count, published_at)
          VALUES (
            ${title}, ${p.slug}, ${excerpt}, ${body}, ${p.category},
            ${'CrankMart Editorial'}, ${'editorial@crankmart.com'},
            'approved',
            ${p.featured},
            ${0},
            NOW()
          )
          ON CONFLICT (slug) DO UPDATE SET
            title = EXCLUDED.title,
            body = EXCLUDED.body,
            status = 'approved',
            is_featured = EXCLUDED.is_featured,
            updated_at = NOW()`
    )
    console.log('Seeded:', title)
  }
  console.log('All 4 blog posts done.')
  process.exit(0)
}

main().catch(e => { console.error('Error:', e.message); process.exit(1) })
