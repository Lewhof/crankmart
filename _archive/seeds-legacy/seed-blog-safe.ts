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
    const title = (titleMatch ? titleMatch[1].trim() : p.slug).replace(/—/g, '-')
    const excerpt = (descMatch ? descMatch[1].trim() : title)
    const body = raw.replace(/^---[\s\S]*?---\n/, '').trim()

    // Use parameterised query to avoid escaping issues
    await db.execute(
      sql`INSERT INTO news_articles (title, slug, excerpt, body, category, author_name, author_email, status, is_featured, views_count, published_at)
          VALUES (${title}, ${p.slug}, ${excerpt}, ${body}, ${p.category}, ${'CrankMart Editorial'}, ${'editorial@crankmart.com'}, ${'published'}, ${p.featured}, ${0}, NOW())
          ON CONFLICT (slug) DO UPDATE SET
            title = EXCLUDED.title,
            body = EXCLUDED.body,
            status = 'published',
            is_featured = EXCLUDED.is_featured`
    )
    console.log('✅ Seeded:', title)
  }
  console.log('\nAll 4 blog posts seeded successfully.')
  process.exit(0)
}

main().catch(e => { console.error('❌', e.message); process.exit(1) })
