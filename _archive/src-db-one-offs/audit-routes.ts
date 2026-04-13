import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
const envFile = readFileSync('.env.local', 'utf-8')
for (const line of envFile.split('\n')) {
  const [k,...v] = line.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim()
}
const sql = neon(process.env.DATABASE_URL!)

async function main() {
  // ── TOTALS ───────────────────────────────────────────────────────────
  const [total]     = await sql`SELECT COUNT(*) AS c FROM routes`
  const [totalLoops]= await sql`SELECT COUNT(*) AS c FROM route_loops`
  console.log(`\n📊 Total routes: ${total.c}  |  Total loops: ${totalLoops.c}\n`)

  // ── DUPLICATE SLUGS ──────────────────────────────────────────────────
  console.log('═══ DUPLICATE SLUGS ═══')
  const dupSlugs = await sql`
    SELECT slug, COUNT(*) AS c FROM routes
    GROUP BY slug HAVING COUNT(*) > 1 ORDER BY c DESC
  `
  if (dupSlugs.length === 0) console.log('  ✅ No duplicate slugs')
  else dupSlugs.forEach((r:any) => console.log(`  ❌ "${r.slug}" appears ${r.c}x`))

  // ── DUPLICATE NAMES ──────────────────────────────────────────────────
  console.log('\n═══ DUPLICATE NAMES ═══')
  const dupNames = await sql`
    SELECT name, COUNT(*) AS c FROM routes
    GROUP BY name HAVING COUNT(*) > 1 ORDER BY c DESC
  `
  if (dupNames.length === 0) console.log('  ✅ No duplicate names')
  else dupNames.forEach((r:any) => console.log(`  ⚠️  "${r.name}" appears ${r.c}x`))

  // ── ROUTES WITH NO LOOPS — BY PROVINCE ───────────────────────────────
  console.log('\n═══ ROUTES WITH NO LOOPS (by province) ═══')
  const noLoopsByProv = await sql`
    SELECT r.province, COUNT(*) AS c
    FROM routes r
    WHERE NOT EXISTS (SELECT 1 FROM route_loops rl WHERE rl.route_id = r.id)
    GROUP BY r.province ORDER BY c DESC
  `
  noLoopsByProv.forEach((r:any) => console.log(`  ${String(r.province||'NULL').padEnd(22)} ${r.c} routes missing loops`))

  const [totalNoLoops] = await sql`
    SELECT COUNT(*) AS c FROM routes r
    WHERE NOT EXISTS (SELECT 1 FROM route_loops rl WHERE rl.route_id = r.id)
  `
  console.log(`\n  Total routes with no loops: ${totalNoLoops.c}`)

  // ── DETAILED LIST OF NO-LOOP ROUTES ──────────────────────────────────
  if (Number(totalNoLoops.c) > 0) {
    console.log('\n═══ FULL LIST — NO LOOPS ═══')
    const noLoopRoutes = await sql`
      SELECT r.province, r.town, r.name, r.slug, r.discipline
      FROM routes r
      WHERE NOT EXISTS (SELECT 1 FROM route_loops rl WHERE rl.route_id = r.id)
      ORDER BY r.province, r.town, r.name
    `
    noLoopRoutes.forEach((r:any) =>
      console.log(`  [${r.province}] ${r.town} — ${r.name} (${r.discipline}) | ${r.slug}`)
    )
  }

  // ── PROVINCE SUMMARY ─────────────────────────────────────────────────
  console.log('\n═══ PROVINCE SUMMARY (routes / loops) ═══')
  const provSummary = await sql`
    SELECT 
      r.province,
      COUNT(DISTINCT r.id) AS routes,
      COUNT(rl.id) AS loops,
      COUNT(DISTINCT CASE WHEN NOT EXISTS (SELECT 1 FROM route_loops rl2 WHERE rl2.route_id = r.id) THEN r.id END) AS no_loops
    FROM routes r
    LEFT JOIN route_loops rl ON rl.route_id = r.id
    GROUP BY r.province ORDER BY routes DESC
  `
  provSummary.forEach((r:any) =>
    console.log(`  ${String(r.province||'NULL').padEnd(22)} routes: ${String(r.routes).padStart(3)}  loops: ${String(r.loops).padStart(4)}  no-loops: ${r.no_loops}`)
  )
}
main().catch(console.error)
