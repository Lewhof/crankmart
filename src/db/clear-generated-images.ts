import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
const e = readFileSync('.env.local','utf-8')
for (const l of e.split('\n')) { const [k,...v]=l.split('='); if(k&&v.length) process.env[k.trim()]=v.join('=').trim() }
const sql = neon(process.env.DATABASE_URL!)

async function main() {
  // Count before
  const [before] = await sql`SELECT COUNT(*) AS c FROM routes WHERE hero_image_url IS NOT NULL AND hero_image_url != ''`
  const [unsplash] = await sql`SELECT COUNT(*) AS c FROM routes WHERE hero_image_url LIKE '%unsplash%'`

  console.log(`\nBefore: ${before.c} routes with images (${unsplash.c} are Unsplash/generated)\n`)

  // Show what we're clearing
  const toRemove = await sql`SELECT slug, name, hero_image_url FROM routes WHERE hero_image_url LIKE '%unsplash%' ORDER BY name`
  console.log('Clearing Unsplash images (self-assigned, not scraped):')
  toRemove.forEach((r:any) => console.log(`  🗑️  ${r.name}`))

  // Clear all Unsplash images — these were all self-assigned by us
  await sql`UPDATE routes SET hero_image_url = NULL WHERE hero_image_url LIKE '%unsplash%'`

  // Verify what remains
  const remaining = await sql`
    SELECT 
      CASE 
        WHEN hero_image_url LIKE '/attached_assets%' OR hero_image_url LIKE '/uploads%' THEN 'local-upload'
        WHEN hero_image_url LIKE '%wp-content%' OR hero_image_url LIKE '%wordpress%' THEN 'venue-wordpress'
        WHEN hero_image_url LIKE '%wixstatic%' THEN 'venue-wix'
        WHEN hero_image_url LIKE '%squarespace%' THEN 'venue-squarespace'
        WHEN hero_image_url LIKE '%springnest%' OR hero_image_url LIKE '%sa-venues%' THEN 'venue-other'
        ELSE 'venue-other'
      END AS source,
      COUNT(*) AS c
    FROM routes
    WHERE hero_image_url IS NOT NULL AND hero_image_url != ''
    GROUP BY 1 ORDER BY c DESC
  `

  const [after] = await sql`SELECT COUNT(*) AS c FROM routes WHERE hero_image_url IS NOT NULL AND hero_image_url != ''`
  const [nulls] = await sql`SELECT COUNT(*) AS c FROM routes WHERE hero_image_url IS NULL OR hero_image_url = ''`

  console.log(`\n──────────────────────────────────────────────────`)
  console.log(`✅ ${toRemove.length} generated images cleared`)
  console.log(`📊 Routes with genuine scraped images: ${after.c}`)
  console.log(`📊 Routes with no image (grey): ${nulls.c}`)
  console.log('\n📋 Remaining images by source (all real venue photos):')
  remaining.forEach((r:any) => console.log(`  ${String(r.source).padEnd(22)} ${r.c}`))
}
main().catch(console.error)
