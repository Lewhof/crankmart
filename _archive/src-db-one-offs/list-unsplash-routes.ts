import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
const e = readFileSync('.env.local','utf-8')
for (const l of e.split('\n')) { const [k,...v]=l.split('='); if(k&&v.length) process.env[k.trim()]=v.join('=').trim() }
const sql = neon(process.env.DATABASE_URL!)
async function main() {
  const rows = await sql`SELECT slug, name, discipline, province, town FROM routes WHERE hero_image_url LIKE '%unsplash%' ORDER BY province, name`
  rows.forEach((r:any) => console.log(`${r.slug}|${r.discipline}|${r.province}|${r.town}|${r.name}`))
  console.log(`Total: ${rows.length}`)
}
main().catch(console.error)
