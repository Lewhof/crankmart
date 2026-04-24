/**
 * Removes everything seeded by `seed-test-users.ts` from the database.
 *
 * Strategy: deletes by an explicit list of test emails (since they live on
 * the real @crankmart.com production domain, we cannot match by domain — we
 * have to match the exact 6 addresses), plus shops/events tagged
 * `source = 'lew_test'`, plus the known stolen-test serial. Cascading FKs
 * handle dependent rows where defined.
 *
 * Usage:
 *   npx tsx scripts/cleanup-test-data.ts        # delete for real
 *   npx tsx scripts/cleanup-test-data.ts --dry  # preview counts only
 *
 * Idempotent. Safe to run when nothing is seeded (no-ops cleanly).
 */

import { neon } from '@neondatabase/serverless'

const SEED_SOURCE = 'lew_test'
const STOLEN_TEST_SERIAL = 'TEST-STOLEN-001'

// Keep in sync with TEST_USERS in seed-test-users.ts.
const TEST_EMAILS = [
  'test.sa@crankmart.com',
  'test.au@crankmart.com',
  'test.shop.sa@crankmart.com',
  'test.shop.au@crankmart.com',
  'test.event.sa@crankmart.com',
  'test.event.au@crankmart.com',
]

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set')

  // Hard guard: refuse to run against anything but a test branch. The TEST_ENV
  // sentinel is only set in .env.test (see scripts/README.test-db.md). If
  // someone accidentally loads .env.local / .env.production, this stops them
  // before any DELETE statement runs.
  if (process.env.TEST_ENV !== 'true') {
    console.error('✗ Refusing to run: TEST_ENV != "true".')
    console.error('  Cleanup only runs against the Neon test branch.')
    console.error('  Use:  npx tsx --env-file=.env.test scripts/cleanup-test-data.ts')
    console.error('  Or:   npm run cleanup:test')
    process.exit(1)
  }

  const dry = process.argv.includes('--dry')
  const sql = neon(url)

  console.log(`Test-data cleanup — ${dry ? 'DRY RUN' : 'LIVE'}\n`)

  // Count before / preview
  const userRows = await sql`SELECT id, email FROM users WHERE email = ANY(${TEST_EMAILS}::text[])`
  const userIds = userRows.map(r => r.id as string)

  const shopRows = await sql`SELECT id, slug FROM businesses WHERE source = ${SEED_SOURCE}`
  const eventRows = await sql`SELECT id, slug FROM events WHERE source = ${SEED_SOURCE}`
  const listingRows = userIds.length > 0
    ? await sql`SELECT id, slug FROM listings WHERE seller_id = ANY(${userIds}::uuid[])`
    : []
  const stolenRows = await sql`SELECT id FROM stolen_reports WHERE serial_number = ${STOLEN_TEST_SERIAL}`

  console.log('Found:')
  console.log(`  users:    ${userRows.length}`)
  console.log(`  shops:    ${shopRows.length}`)
  console.log(`  events:   ${eventRows.length}`)
  console.log(`  listings: ${listingRows.length}`)
  console.log(`  stolen:   ${stolenRows.length}`)

  if (dry) {
    console.log('\nDry run — nothing deleted. Re-run without --dry to apply.')
    return
  }

  if (userRows.length === 0 && shopRows.length === 0 && eventRows.length === 0 && stolenRows.length === 0) {
    console.log('\nNothing to clean up.')
    return
  }

  console.log('\nDeleting…')

  // Order matters: delete dependents first to avoid FK constraints.

  // 1. Stolen reports (referenced by reporter_user_id, can't kill user yet)
  if (stolenRows.length > 0) {
    await sql`DELETE FROM stolen_reports WHERE serial_number = ${STOLEN_TEST_SERIAL}`
    console.log(`  ✓ deleted ${stolenRows.length} stolen report(s)`)
  }
  if (userIds.length > 0) {
    const r = await sql`DELETE FROM stolen_reports WHERE reporter_user_id = ANY(${userIds}::uuid[]) RETURNING id`
    if (r.length > 0) console.log(`  ✓ deleted ${r.length} additional stolen report(s) from test reporters`)
  }

  // 2. Listings owned by test users (also clears listing_images via cascade if FK is set,
  //    otherwise we'd need to delete images first — schema uses ON DELETE CASCADE).
  if (userIds.length > 0) {
    const r = await sql`DELETE FROM listings WHERE seller_id = ANY(${userIds}::uuid[]) RETURNING id`
    console.log(`  ✓ deleted ${r.length} listing(s)`)
  }

  // 3. Events tagged seed_source OR organised by test users
  if (eventRows.length > 0) {
    await sql`DELETE FROM events WHERE source = ${SEED_SOURCE}`
    console.log(`  ✓ deleted ${eventRows.length} event(s) by source`)
  }
  if (userIds.length > 0) {
    const r = await sql`DELETE FROM events WHERE organiser_user_id = ANY(${userIds}::uuid[]) RETURNING id`
    if (r.length > 0) console.log(`  ✓ deleted ${r.length} additional event(s) by organiser`)
  }

  // 4. Conversations + messages where test users are buyer or seller
  if (userIds.length > 0) {
    const conv = await sql`
      DELETE FROM conversations
      WHERE buyer_id = ANY(${userIds}::uuid[]) OR seller_id = ANY(${userIds}::uuid[])
      RETURNING id
    `
    if (conv.length > 0) console.log(`  ✓ deleted ${conv.length} conversation(s)`)
  }

  // 5. Saved-listing rows for test users (table is listing_saves)
  if (userIds.length > 0) {
    try {
      const r = await sql`DELETE FROM listing_saves WHERE user_id = ANY(${userIds}::uuid[]) RETURNING listing_id`
      if (r.length > 0) console.log(`  ✓ deleted ${r.length} listing save(s)`)
    } catch { /* table may not exist in older migrations */ }
  }

  // 6. Shops tagged seed_source OR claimed by test users
  if (userIds.length > 0) {
    const r = await sql`UPDATE businesses SET claimed_by = NULL, claimed_at = NULL, status = 'pending', verified = false WHERE claimed_by = ANY(${userIds}::uuid[]) RETURNING id`
    if (r.length > 0) console.log(`  ✓ unlinked ${r.length} non-test shop(s) claimed by test users`)
  }
  if (shopRows.length > 0) {
    await sql`DELETE FROM businesses WHERE source = ${SEED_SOURCE}`
    console.log(`  ✓ deleted ${shopRows.length} shop(s)`)
  }

  // 7. Comments / community participation by test users (best-effort, schemas vary)
  if (userIds.length > 0) {
    try {
      const r = await sql`DELETE FROM comments WHERE user_id = ANY(${userIds}::uuid[]) RETURNING id`
      if (r.length > 0) console.log(`  ✓ deleted ${r.length} comment(s)`)
    } catch { /* comments table may not exist or use different FK */ }
    try {
      const r = await sql`DELETE FROM comment_reactions WHERE user_id = ANY(${userIds}::uuid[]) RETURNING comment_id`
      if (r.length > 0) console.log(`  ✓ deleted ${r.length} reaction(s)`)
    } catch { /* table may not exist */ }
  }

  // 8. Finally users themselves
  if (userIds.length > 0) {
    await sql`DELETE FROM users WHERE email = ANY(${TEST_EMAILS}::text[])`
    console.log(`  ✓ deleted ${userRows.length} user(s)`)
  }

  console.log('\n✅ Cleanup complete.')
}

main().catch(e => { console.error('cleanup failed:', e); process.exit(1) })
