import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
const envFile = readFileSync('.env.local', 'utf-8')
for (const line of envFile.split('\n')) { const [k,...v]=line.split('='); if(k&&v.length) process.env[k.trim()]=v.join('=').trim() }
const sql = neon(process.env.DATABASE_URL!)
async function main() {
  const rows = await sql`
    SELECT r.slug, r.name, r.discipline, r.distance_km, r.difficulty, r.province, r.town
    FROM routes r
    WHERE NOT EXISTS (SELECT 1 FROM route_loops rl WHERE rl.route_id = r.id)
    ORDER BY r.province, r.town, r.name
  `
  console.log(`Routes with no loops: ${rows.length}`)
  rows.forEach((r:any) => console.log(`${r.slug}|${r.name}|${r.discipline}|${r.distance_km}|${r.difficulty}|${r.province}|${r.town}`))
}
main().catch(console.error)
