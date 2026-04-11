import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
const envFile = readFileSync('.env.local', 'utf-8')
for (const line of envFile.split('\n')) { const [k,...v]=line.split('='); if(k&&v.length) process.env[k.trim()]=v.join('=').trim() }
const sql = neon(process.env.DATABASE_URL!)
async function main() {
  const rows = await sql`
    SELECT slug, name, discipline, province, hero_image_url
    FROM routes WHERE hero_image_url IS NOT NULL AND hero_image_url != ''
    ORDER BY province, name
  `
  console.log(`Routes with hero images: ${rows.length}\n`)
  rows.forEach((r:any) => console.log(`${r.slug}|${r.name}|${r.discipline}|${r.province}|${r.hero_image_url}`))
  const [total] = await sql`SELECT COUNT(*) AS c FROM routes WHERE hero_image_url IS NOT NULL AND hero_image_url != ''`
  const [nulls] = await sql`SELECT COUNT(*) AS c FROM routes WHERE hero_image_url IS NULL OR hero_image_url = ''`
  console.log(`\nWith image: ${total.c} | Without: ${nulls.c}`)
}
main().catch(console.error)
