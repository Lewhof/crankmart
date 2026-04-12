/**
 * Apply a raw SQL migration file against DATABASE_URL.
 * Used for migrations that live outside drizzle-kit's generated flow.
 *
 *   tsx src/db/apply-migration.ts drizzle/0008_add_seed_source.sql
 */
import { readFileSync } from 'fs'
import { neon } from '@neondatabase/serverless'

async function main() {
  const file = process.argv[2]
  if (!file) {
    console.error('Usage: tsx src/db/apply-migration.ts <path/to/file.sql>')
    process.exit(1)
  }

  const raw = readFileSync(file, 'utf8')
  // Strip line comments first so split boundaries aren't broken by them.
  const body = raw
    .split('\n')
    .map((line) => {
      const idx = line.indexOf('--')
      return idx === -1 ? line : line.slice(0, idx)
    })
    .join('\n')
  const statements = body
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  const sql = neon(process.env.DATABASE_URL!)
  for (const stmt of statements) {
    const preview = stmt.replace(/\s+/g, ' ').slice(0, 100)
    console.log(`→ ${preview}`)
    await sql.query(stmt)
  }
  console.log(`✅ applied ${statements.length} statements from ${file}`)
}

main().catch((e) => {
  console.error('Migration failed:', e)
  process.exit(1)
})
