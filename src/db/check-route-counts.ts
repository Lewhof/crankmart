import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
const envFile = readFileSync('.env.local', 'utf-8')
for (const line of envFile.split('\n')) {
  const [k,...v] = line.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim()
}
const sql = neon(process.env.DATABASE_URL!)
async function main() {
  const [total] = await sql`SELECT COUNT(*) AS c FROM routes`
  console.log(`\nTotal routes: ${total.c}\n`)

  // By province
  console.log('═══ BY PROVINCE ═══')
  const provinces = await sql`SELECT province, COUNT(*) AS c FROM routes GROUP BY province ORDER BY c DESC`
  provinces.forEach((r:any) => console.log(`  ${String(r.province || 'NULL').padEnd(20)} ${r.c}`))

  // By top cities/towns
  console.log('\n═══ TOP 30 TOWNS ═══')
  const towns = await sql`SELECT town, province, COUNT(*) AS c FROM routes GROUP BY town, province ORDER BY c DESC LIMIT 30`
  towns.forEach((r:any) => console.log(`  ${String(r.town).padEnd(28)} [${r.province}]  ${r.c}`))

  // Low-count provinces breakdown by town
  console.log('\n═══ NORTH WEST TOWNS ═══')
  const nw = await sql`SELECT town, COUNT(*) AS c FROM routes WHERE province = 'North West' GROUP BY town ORDER BY c DESC`
  nw.forEach((r:any) => console.log(`  ${r.town}: ${r.c}`))

  console.log('\n═══ NORTHERN CAPE TOWNS ═══')
  const nc = await sql`SELECT town, COUNT(*) AS c FROM routes WHERE province = 'Northern Cape' GROUP BY town ORDER BY c DESC`
  nc.forEach((r:any) => console.log(`  ${r.town}: ${r.c}`))

  console.log('\n═══ EASTERN CAPE TOWNS ═══')
  const ec = await sql`SELECT town, COUNT(*) AS c FROM routes WHERE province = 'Eastern Cape' GROUP BY town ORDER BY c DESC`
  ec.forEach((r:any) => console.log(`  ${r.town}: ${r.c}`))

  // Routes with no loops
  const [noLoops] = await sql`
    SELECT COUNT(*) AS c FROM routes r
    WHERE NOT EXISTS (SELECT 1 FROM route_loops rl WHERE rl.route_id = r.id)
  `
  console.log(`\n═══ ROUTES WITH NO LOOPS: ${noLoops.c} ═══`)

  // Discipline breakdown
  console.log('\n═══ BY DISCIPLINE ═══')
  const disc = await sql`SELECT discipline, COUNT(*) AS c FROM routes GROUP BY discipline ORDER BY c DESC`
  disc.forEach((r:any) => console.log(`  ${r.discipline}: ${r.c}`))
}
main().catch(console.error)
