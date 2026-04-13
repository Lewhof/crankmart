import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
const envFile = readFileSync('.env.local', 'utf-8')
for (const line of envFile.split('\n')) {
  const [k,...v] = line.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim()
}
const sql = neon(process.env.DATABASE_URL!)
async function main() {
  const rows = await sql`SELECT name, slug, town, discipline FROM routes WHERE province = 'Free State' ORDER BY town, name`
  console.log('Free State routes:', rows.length)
  rows.forEach((r:any) => console.log(`  [${r.town}] ${r.name} | ${r.slug}`))
}
main().catch(console.error)
