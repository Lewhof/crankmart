import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { readFileSync } from 'fs'

const posts = [
  { file: '/home/hein/.openclaw/workspace/cyclemart/content/blog/best-bike-shops-cape-town-2026.md', slug: 'best-bike-shops-cape-town-2026', category: 'guides', featured: true },
  { file: '/home/hein/.openclaw/workspace/cyclemart/content/blog/best-bike-shops-johannesburg-2026.md', slug: 'best-bike-shops-johannesburg-2026', category: 'guides', featured: false },
  { file: '/home/hein/.openclaw/workspace/cyclemart/content/blog/cycling-events-south-africa-2026.md', slug: 'cycling-events-south-africa-2026', category: 'events', featured: true },
  { file: '/home/hein/.openclaw/workspace/cyclemart/content/blog/what-is-cyclemart-sa-cycling-marketplace.md', slug: 'what-is-cyclemart-sa-cycling-marketplace', category: 'about', featured: false },
]

async function main() {
  for (const p of posts) {
    const raw = readFileSync(p.file, 'utf-8')
    const titleMatch = raw.match(/^title:\s*["']?(.+?)["']?\s*$/m)
    const descMatch = raw.match(/^description:\s*["']?(.+?)["']?\s*$/m)
    const title = titleMatch ? titleMatch[1].trim() : p.slug
    const excerpt = descMatch ? descMatch[1].trim() : title
    const body = raw.replace(/^---[\s\S]*?---\n/, '').trim()

    await db.execute(sql.raw(`
      INSERT INTO news_articles (title, slug, excerpt, body, category, author_name, author_email, status, is_featured, views_count, published_at)
      VALUES (
        '${title.replace(/'/g, "''")}',
        '${p.slug}',
        '${excerpt.replace(/'/g, "''")}',
        '${body.replace(/'/g, "''")}',
        '${p.category}',
        'CycleMart Editorial',
        'editorial@cyclemart.co.za',
        'published',
        ${p.featured},
        0,
        NOW()
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        body = EXCLUDED.body,
        status = 'published',
        is_featured = EXCLUDED.is_featured,
        updated_at = NOW()
    `))
    console.log('✅ Seeded:', title)
  }
  console.log('\nAll 4 blog posts seeded.')
  process.exit(0)
}

main().catch(e => { console.error('❌ Error:', e.message); process.exit(1) })
