import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
const envFile = readFileSync('.env.local', 'utf-8')
for (const line of envFile.split('\n')) {
  const [k,...v] = line.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim()
}
const sql = neon(process.env.DATABASE_URL!)
async function main() {
  const rows = await sql`
    SELECT r.name, r.slug, r.town, COUNT(rl.id) AS loop_count
    FROM routes r
    LEFT JOIN route_loops rl ON rl.route_id = r.id
    WHERE r.province = 'Free State'
    GROUP BY r.id, r.name, r.slug, r.town
    ORDER BY loop_count ASC, r.town
  `
  console.log('Free State routes + loop counts:\n')
  rows.forEach((r:any) => console.log(`  [${String(r.loop_count).padStart(2)} loops] ${r.name} | ${r.slug}`))
  const noLoops = rows.filter((r:any) => r.loop_count === '0' || r.loop_count === 0)
  console.log(`\n⚠️  Routes with NO loops: ${noLoops.length}`)
  noLoops.forEach((r:any) => console.log(`  - ${r.name} (${r.town})`))
}
main().catch(console.error)
