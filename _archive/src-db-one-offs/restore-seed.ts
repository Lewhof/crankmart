import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'
import fs from 'fs'
import path from 'path'

// WebSocket transport for persistent connection from Node
neonConfig.webSocketConstructor = ws as any

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function getTableColumns(table: string): Promise<Set<string>> {
  const res = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND table_schema = 'public'`,
    [table]
  )
  return new Set(res.rows.map((r: any) => r.column_name))
}

async function insertRows(table: string, rows: any[], opts: { transformEmail?: boolean } = {}) {
  if (!rows || rows.length === 0) return 0
  const dbCols = await getTableColumns(table)
  let inserted = 0
  let skipped = 0

  for (const original of rows) {
    const row = opts.transformEmail && original.email && typeof original.email === 'string'
      ? { ...original, email: original.email.replace(/@cyclemart\.co\.za$/i, '@crankmart.com') }
      : original
    const keys = Object.keys(row).filter(k => dbCols.has(k))
    if (keys.length === 0) { skipped++; continue }

    const vals = keys.map(k => row[k])
    const cols = keys.map(k => `"${k}"`).join(',')
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(',')

    try {
      await pool.query(
        `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
        vals
      )
      inserted++
    } catch (e) {
      skipped++
      const msg = (e as Error).message
      if (skipped <= 3) console.log(`  ⚠ ${table} skip: ${msg.slice(0, 140)}`)
    }
  }

  console.log(`  ${table}: ${inserted} inserted, ${skipped} skipped`)
  return inserted
}

async function run() {
  const backupPath = path.join(process.cwd(), 'backups', 'pre-cleanup-20260326-1810.json')
  const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'))

  console.log('🌱 Restoring /za seed from backup (WebSocket pool)…\n')

  await insertRows('listing_categories', data.listing_categories)
  await pool.query(`SELECT setval('listing_categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM listing_categories))`)

  await insertRows('users', data.users, { transformEmail: true })
  await insertRows('listings', data.listings)
  await insertRows('listing_images', data.listing_images)
  await insertRows('businesses', data.businesses, { transformEmail: true })
  await insertRows('events', data.events, { transformEmail: true })

  const counts = await pool.query(`
    SELECT
      (SELECT count(*)::int FROM users) as users,
      (SELECT count(*)::int FROM listing_categories) as categories,
      (SELECT count(*)::int FROM listings) as listings,
      (SELECT count(*)::int FROM listing_images) as images,
      (SELECT count(*)::int FROM businesses) as businesses,
      (SELECT count(*)::int FROM events) as events
  `)
  console.log('\n✅ Done. Row counts:')
  console.log(counts.rows[0])
  await pool.end()
}

run().catch(async e => { console.error('Restore failed:', e); await pool.end(); process.exit(1) })
