import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
const envFile = readFileSync('.env.local', 'utf-8')
for (const line of envFile.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && v.length) process.env[k.trim()] = v.join('=').trim()
}
const sql = neon(process.env.DATABASE_URL!)
async function main() {
  const rows = await sql`SELECT name, slug, discipline, distance_km, difficulty, town FROM routes WHERE province = 'Gauteng' ORDER BY town, name`
  console.log('Gauteng routes:', rows.length)
  rows.forEach((r: any) => console.log(`  [${r.town}] ${r.name} | slug: ${r.slug}`))
}
main().catch(console.error)
