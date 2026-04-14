import { neon } from '@neondatabase/serverless'

async function main() {
  const sql = neon(process.env.DATABASE_URL!)
  for (const table of ['events', 'businesses']) {
    const rows = await sql.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position`,
      [table]
    )
    console.log(`\n=== ${table} ===`)
    console.log(rows.map((r: { column_name: string }) => r.column_name).join(', '))
  }
}
main().catch(e => { console.error(e); process.exit(1) })
