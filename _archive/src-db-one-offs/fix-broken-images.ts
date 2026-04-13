import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
const e = readFileSync('.env.local','utf-8')
for (const l of e.split('\n')) { const [k,...v]=l.split('='); if(k&&v.length) process.env[k.trim()]=v.join('=').trim() }
const sql = neon(process.env.DATABASE_URL!)
async function main() {
  // Fix the 404 images with verified working alternatives
  const fixes = [
    // Namaqualand wildflowers — 404, replace with working wildflower landscape
    { slug: 'namaqualand-namakwa-flower-gravel',
      img: 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=1200&q=80' },
      // verified 200: colourful wildflower landscape

    // Naval Hill + Rustenburg road — 404 road cycling
    { slug: 'bloemfontein-naval-hill-road-loop',
      img: 'https://images.unsplash.com/photo-1461743154238-b28b58699852?w=1200&q=80' },
      // verified 200: road cyclist on open road with hills

    { slug: 'rustenburg-city-road-loop',
      img: 'https://images.unsplash.com/photo-1461743154238-b28b58699852?w=1200&q=80' },
      // road cyclist open road
  ]

  for (const { slug, img } of fixes) {
    const [r] = await sql`SELECT name FROM routes WHERE slug = ${slug}`
    if (!r) { console.log(`Not found: ${slug}`); continue }
    await sql`UPDATE routes SET hero_image_url = ${img} WHERE slug = ${slug}`
    console.log(`✅ Fixed: ${r.name}`)
  }
  console.log('Done')
}
main().catch(console.error)
