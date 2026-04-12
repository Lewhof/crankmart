import { neon } from '@neondatabase/serverless'
import fs from 'fs'
import path from 'path'

const sql = neon(process.env.DATABASE_URL!)

// Value maps (backup -> current enum)
const STATUS_MAP: Record<string, string> = {
  upcoming: 'verified',
  pending: 'pending_review',
  approved: 'verified',
  active: 'verified',
  draft: 'draft',
  cancelled: 'cancelled',
  completed: 'completed',
}
const TYPE_MAP: Record<string, string> = { stage_race: 'race' }

// Column renames (backup key -> current column)
const RENAME: Record<string, string> = {
  event_date_start: 'start_date',
  event_date_end: 'end_date',
  organizer_id: 'organiser_user_id',
  cover_image_url: 'banner_url',
  venue_name: 'venue',
}

async function run() {
  const backup = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'backups', 'pre-cleanup-20260326-1810.json'), 'utf8')
  )

  const colRows = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name='events' AND table_schema='public'
  ` as Array<{ column_name: string }>
  const dbCols = new Set(colRows.map(r => r.column_name))

  let inserted = 0, skipped = 0
  for (const orig of backup.events) {
    // Rebuild row with renames applied
    const row: Record<string, any> = {}
    for (const [k, v] of Object.entries(orig)) {
      const targetKey = RENAME[k] ?? k
      row[targetKey] = v
    }
    // Value transforms
    if (row.status && STATUS_MAP[row.status]) row.status = STATUS_MAP[row.status]
    if (row.event_type && TYPE_MAP[row.event_type]) row.event_type = TYPE_MAP[row.event_type]

    // Skip if no start_date (required)
    if (!row.start_date) { skipped++; continue }

    // Only keep columns that exist in current schema
    const keys = Object.keys(row).filter(k => dbCols.has(k))
    const vals = keys.map(k => row[k])
    const cols = keys.map(k => `"${k}"`).join(',')
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(',')

    try {
      await sql.query(
        `INSERT INTO events (${cols}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
        vals
      )
      inserted++
    } catch (e) {
      skipped++
      if (skipped <= 5) console.log(`  skip "${row.title}": ${(e as Error).message.slice(0, 140)}`)
    }
    await new Promise(r => setTimeout(r, 50))
  }

  console.log(`events: ${inserted} inserted, ${skipped} skipped`)
  const c = await sql`SELECT count(*)::int AS n FROM events` as any
  console.log('Total events in DB:', c[0].n)
}

run().catch(e => { console.error(e); process.exit(1) })
