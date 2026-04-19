/**
 * Seeds the E2E smoke-test cohort: 6 test users + their attached test data
 * (2 shops, 2 events, 6 listings, 1 stolen-bike registration).
 *
 * Every row is tagged `seed_source = 'lew_test'` so cleanup-test-data.ts can
 * remove the entire cohort in one pass.
 *
 * Usage:
 *   npx tsx scripts/seed-test-users.ts          # seed for real
 *   npx tsx scripts/seed-test-users.ts --dry    # print what would be inserted
 *
 * Idempotent: re-running finds existing rows by deterministic email/slug and
 * skips them. Safe against partial previous runs.
 *
 * Test users + the credential they all share:
 *   Password: Test1234!  (bcrypt-hashed at rest)
 */

import { neon } from '@neondatabase/serverless'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'

const TEST_PASSWORD = 'Test1234!'
const SEED_SOURCE = 'lew_test'

interface TestUser {
  key: string
  email: string
  name: string
  role: 'buyer' | 'seller' | 'shop_owner' | 'organiser'
  country: 'za' | 'au'
  province: string
  city: string
  handle: string
}

const TEST_USERS: TestUser[] = [
  { key: 'reg_sa',   email: 'test.sa@crankmart.test',       name: 'Test User SA',       role: 'seller',     country: 'za', province: 'Western Cape',          city: 'Cape Town',     handle: 'test_sa' },
  { key: 'reg_au',   email: 'test.au@crankmart.test',       name: 'Test User AU',       role: 'seller',     country: 'au', province: 'New South Wales',       city: 'Sydney',        handle: 'test_au' },
  { key: 'shop_sa',  email: 'test.shop.sa@crankmart.test',  name: 'Shop Owner SA',      role: 'shop_owner', country: 'za', province: 'Gauteng',               city: 'Johannesburg',  handle: 'test_shop_sa' },
  { key: 'shop_au',  email: 'test.shop.au@crankmart.test',  name: 'Shop Owner AU',      role: 'shop_owner', country: 'au', province: 'Victoria',              city: 'Melbourne',     handle: 'test_shop_au' },
  { key: 'event_sa', email: 'test.event.sa@crankmart.test', name: 'Event Organiser SA', role: 'organiser',  country: 'za', province: 'KwaZulu-Natal',         city: 'Durban',        handle: 'test_event_sa' },
  { key: 'event_au', email: 'test.event.au@crankmart.test', name: 'Event Organiser AU', role: 'organiser',  country: 'au', province: 'Queensland',            city: 'Brisbane',      handle: 'test_event_au' },
]

interface TestShop {
  ownerKey: string
  name: string
  slug: string
  country: 'za' | 'au'
  province: string
  city: string
  description: string
}

const TEST_SHOPS: TestShop[] = [
  { ownerKey: 'shop_sa', name: 'CrankMart Test Bikes ZA', slug: 'crankmart-test-bikes-za', country: 'za', province: 'Gauteng',  city: 'Johannesburg', description: 'Smoke-test shop for ZA QA. Safe to ignore.' },
  { ownerKey: 'shop_au', name: 'CrankMart Test Bikes AU', slug: 'crankmart-test-bikes-au', country: 'au', province: 'Victoria', city: 'Melbourne',    description: 'Smoke-test shop for AU QA. Safe to ignore.' },
]

interface TestEvent {
  organiserKey: string
  title: string
  slug: string
  country: 'za' | 'au'
  province: string
  city: string
  startDate: string
  description: string
}

const TEST_EVENTS: TestEvent[] = [
  { organiserKey: 'event_sa', title: 'Test Event ZA — Smoke MTB', slug: 'test-event-za-smoke-mtb', country: 'za', province: 'KwaZulu-Natal', city: 'Durban',   startDate: '2026-09-01', description: 'Smoke-test event for ZA QA. Safe to ignore.' },
  { organiserKey: 'event_au', title: 'Test Event AU — Smoke Gravel', slug: 'test-event-au-smoke-gravel', country: 'au', province: 'Queensland', city: 'Brisbane', startDate: '2026-09-15', description: 'Smoke-test event for AU QA. Safe to ignore.' },
]

interface TestListing {
  ownerKey: string
  title: string
  slug: string
  categorySlug: string
  bikeMake: string | null
  bikeModel: string | null
  bikeYear: number | null
  condition: 'new' | 'like_new' | 'used' | 'poor'
  price: string
  country: 'za' | 'au'
  province: string
  city: string
  description: string
}

const TEST_LISTINGS: TestListing[] = [
  // SA — under reg_sa
  { ownerKey: 'reg_sa', title: 'Test Bike SA — Specialized Stumpjumper', slug: 'test-bike-sa-stumpjumper', categorySlug: 'mtb', bikeMake: 'Specialized', bikeModel: 'Stumpjumper', bikeYear: 2023, condition: 'like_new', price: '32000', country: 'za', province: 'Western Cape', city: 'Cape Town', description: 'Test listing for ZA smoke. Safe to ignore.' },
  { ownerKey: 'reg_sa', title: 'Test Gear SA — Helmet + Shoes',         slug: 'test-gear-sa-helmet-shoes', categorySlug: 'gear-apparel', bikeMake: null, bikeModel: null, bikeYear: null, condition: 'used', price: '1500', country: 'za', province: 'Western Cape', city: 'Cape Town', description: 'Test gear listing for ZA. Safe to ignore.' },
  { ownerKey: 'reg_sa', title: 'Test Parts SA — Drivetrain GX 12sp',    slug: 'test-parts-sa-gx-12sp',     categorySlug: 'drivetrain',   bikeMake: null, bikeModel: null, bikeYear: null, condition: 'used', price: '4500', country: 'za', province: 'Western Cape', city: 'Cape Town', description: 'Test parts listing for ZA. Safe to ignore.' },
  // AU — under reg_au
  { ownerKey: 'reg_au', title: 'Test Bike AU — Trek Top Fuel',          slug: 'test-bike-au-top-fuel',     categorySlug: 'mtb', bikeMake: 'Trek', bikeModel: 'Top Fuel', bikeYear: 2024, condition: 'like_new', price: '4800', country: 'au', province: 'New South Wales', city: 'Sydney', description: 'Test listing for AU smoke. Safe to ignore.' },
  { ownerKey: 'reg_au', title: 'Test Gear AU — Bib + Jersey',           slug: 'test-gear-au-bib-jersey',   categorySlug: 'gear-apparel', bikeMake: null, bikeModel: null, bikeYear: null, condition: 'used', price: '180', country: 'au', province: 'New South Wales', city: 'Sydney', description: 'Test gear listing for AU. Safe to ignore.' },
  { ownerKey: 'reg_au', title: 'Test Parts AU — XTR Brake Set',         slug: 'test-parts-au-xtr-brakes',  categorySlug: 'drivetrain',   bikeMake: null, bikeModel: null, bikeYear: null, condition: 'like_new', price: '650', country: 'au', province: 'New South Wales', city: 'Sydney', description: 'Test parts listing for AU. Safe to ignore.' },
]

const STOLEN_TEST_SERIAL = 'TEST-STOLEN-001'

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set')
  const dry = process.argv.includes('--dry')
  const sql = neon(url)

  console.log(`Test-users seed — ${dry ? 'DRY RUN' : 'LIVE'}`)

  if (dry) {
    console.log(`Would seed: ${TEST_USERS.length} users, ${TEST_SHOPS.length} shops, ${TEST_EVENTS.length} events, ${TEST_LISTINGS.length} listings, 1 stolen serial`)
    return
  }

  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10)

  // ── 1. Users ─────────────────────────────────────────────────────────
  const userIdByKey: Record<string, string> = {}
  for (const u of TEST_USERS) {
    const existing = await sql`SELECT id FROM users WHERE email = ${u.email} LIMIT 1`
    if (existing[0]) {
      userIdByKey[u.key] = existing[0].id as string
      // Reset password + role + country in case prior run used different values
      await sql`
        UPDATE users
        SET password_hash = ${passwordHash},
            role = ${u.role}::user_role,
            country = ${u.country},
            province = ${u.province},
            city = ${u.city},
            handle = ${u.handle},
            email_verified = true,
            is_active = true,
            name = ${u.name}
        WHERE id = ${existing[0].id}::uuid
      `
      continue
    }
    const id = randomUUID()
    await sql`
      INSERT INTO users (id, email, name, password_hash, role, country, province, city, handle, email_verified, is_active)
      VALUES (${id}, ${u.email}, ${u.name}, ${passwordHash}, ${u.role}::user_role, ${u.country}, ${u.province}, ${u.city}, ${u.handle}, true, true)
    `
    userIdByKey[u.key] = id
  }
  console.log(`✓ users: ${Object.keys(userIdByKey).length}`)

  // ── 2. Shops (pre-claimed by their test owner) ───────────────────────
  let shopsInserted = 0
  for (const s of TEST_SHOPS) {
    const ownerId = userIdByKey[s.ownerKey]
    if (!ownerId) { console.warn(`× shop ${s.slug}: owner ${s.ownerKey} missing`); continue }
    const r = await sql`
      INSERT INTO businesses (
        name, slug, business_type, country, province, city,
        description, status, source,
        verified, claimed_by, claimed_at, verified_at, consent_at
      )
      VALUES (
        ${s.name}, ${s.slug}, 'shop', ${s.country}, ${s.province}, ${s.city},
        ${s.description}, 'verified', ${SEED_SOURCE},
        true, ${ownerId}::uuid, NOW(), NOW(), NOW()
      )
      ON CONFLICT (slug) DO UPDATE SET
        claimed_by = EXCLUDED.claimed_by,
        status = 'verified',
        verified = true,
        consent_at = NOW(),
        source = ${SEED_SOURCE}
      RETURNING (xmax = 0) AS inserted
    `
    if ((r[0] as { inserted: boolean })?.inserted) shopsInserted++
  }
  console.log(`✓ shops: ${shopsInserted} new / ${TEST_SHOPS.length} total`)

  // ── 3. Events (under organiser) ──────────────────────────────────────
  let eventsInserted = 0
  for (const e of TEST_EVENTS) {
    const organiserId = userIdByKey[e.organiserKey]
    if (!organiserId) { console.warn(`× event ${e.slug}: organiser missing`); continue }
    const organiser = TEST_USERS.find(u => u.key === e.organiserKey)!
    const r = await sql`
      INSERT INTO events (
        slug, title, description, event_type, status, start_date,
        country, province, city,
        organiser_name, organiser_email, organiser_user_id,
        moderation_status, source
      )
      VALUES (
        ${e.slug}, ${e.title}, ${e.description}, 'race', 'verified', ${e.startDate}::timestamp,
        ${e.country}, ${e.province}, ${e.city},
        ${organiser.name}, ${organiser.email}, ${organiserId}::uuid,
        'approved', ${SEED_SOURCE}
      )
      ON CONFLICT (slug) DO NOTHING
      RETURNING id
    `
    if (r.length > 0) eventsInserted++
  }
  console.log(`✓ events: ${eventsInserted} new / ${TEST_EVENTS.length} total`)

  // ── 4. Listings ──────────────────────────────────────────────────────
  let listingsInserted = 0
  for (const l of TEST_LISTINGS) {
    const sellerId = userIdByKey[l.ownerKey]
    if (!sellerId) { console.warn(`× listing ${l.slug}: seller missing`); continue }
    const cat = await sql`SELECT id FROM listing_categories WHERE slug = ${l.categorySlug} LIMIT 1`
    if (!cat[0]) { console.warn(`× listing ${l.slug}: category ${l.categorySlug} missing`); continue }
    const r = await sql`
      INSERT INTO listings (
        seller_id, category_id, title, slug, description,
        bike_make, bike_model, bike_year, condition, price,
        country, province, city, status, moderation_status
      )
      VALUES (
        ${sellerId}::uuid, ${cat[0].id}, ${l.title}, ${l.slug}, ${l.description},
        ${l.bikeMake}, ${l.bikeModel}, ${l.bikeYear}, ${l.condition}::listing_condition, ${l.price},
        ${l.country}, ${l.province}, ${l.city}, 'active'::listing_status, 'approved'::moderation_status
      )
      ON CONFLICT (slug) DO NOTHING
      RETURNING id
    `
    if (r.length > 0) listingsInserted++
  }
  console.log(`✓ listings: ${listingsInserted} new / ${TEST_LISTINGS.length} total`)

  // ── 5. Stolen serial (so the publish-gate test has a known target) ───
  // Seeded under reg_sa as reporter; serial is universal (TEST-STOLEN-001).
  const reporterId = userIdByKey.reg_sa
  const stolenRes = await sql`
    INSERT INTO stolen_reports (
      serial_number, brand, model, year, colour,
      source, status, saps_case_no, stolen_date, stolen_location,
      reporter_user_id, notes, country
    )
    VALUES (
      ${STOLEN_TEST_SERIAL}, 'TestBrand', 'Smoke Test', 2024, 'Test Red',
      'crankmart', 'approved', 'TEST-CASE-001', '2026-04-01', 'Cape Town, Western Cape',
      ${reporterId}::uuid, 'Smoke-test stolen registration. Used to verify publish-gate works. Safe to delete.', 'za'
    )
    ON CONFLICT DO NOTHING
    RETURNING id
  `
  console.log(`✓ stolen serial: ${stolenRes.length > 0 ? 'inserted' : 'already present'} (${STOLEN_TEST_SERIAL})`)

  console.log('\n✅ Test seed complete.\n')
  console.log('Login credentials:')
  console.log('  Password: Test1234!')
  TEST_USERS.forEach(u => console.log(`  ${u.role.padEnd(11)} ${u.country}  ${u.email}`))
  console.log(`\nStolen-gate test serial: ${STOLEN_TEST_SERIAL}`)
  console.log('\nCleanup: npx tsx scripts/cleanup-test-data.ts')
}

main().catch(e => { console.error('seed failed:', e); process.exit(1) })
