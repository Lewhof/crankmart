/**
 * Seed the `regions` table.
 * Run: npx tsx src/db/seed-regions.ts
 *
 * Idempotent — uses ON CONFLICT (country, code) DO NOTHING.
 */

import { db } from './index'
import { regions } from './schema'
import { sql } from 'drizzle-orm'

const ZA_PROVINCES = [
  { code: 'GP', name: 'Gauteng',        order: 1 },
  { code: 'WC', name: 'Western Cape',   order: 2 },
  { code: 'KZN', name: 'KwaZulu-Natal', order: 3 },
  { code: 'EC', name: 'Eastern Cape',   order: 4 },
  { code: 'FS', name: 'Free State',     order: 5 },
  { code: 'LP', name: 'Limpopo',        order: 6 },
  { code: 'MP', name: 'Mpumalanga',     order: 7 },
  { code: 'NC', name: 'Northern Cape',  order: 8 },
  { code: 'NW', name: 'North West',     order: 9 },
]

async function main() {
  console.log('Seeding ZA regions…')
  for (const p of ZA_PROVINCES) {
    await db
      .insert(regions)
      .values({
        country: 'za',
        code: p.code,
        name: p.name,
        type: 'province',
        displayOrder: p.order,
      })
      .onConflictDoNothing({ target: [regions.country, regions.code] })
  }
  const count = await db.execute(sql`SELECT count(*)::int AS n FROM regions WHERE country = 'za'`)
  console.log(`ZA regions seeded. Row count: ${JSON.stringify(count)}`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
