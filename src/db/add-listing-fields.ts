import { neon } from '@neondatabase/serverless'
const sql = neon(process.env.DATABASE_URL!)

async function main() {
  const cols = [
    `ALTER TABLE listings ADD COLUMN IF NOT EXISTS frame_size VARCHAR(10)`,
    `ALTER TABLE listings ADD COLUMN IF NOT EXISTS wheel_size_inches INT`,
    `ALTER TABLE listings ADD COLUMN IF NOT EXISTS suspension_travel_mm INT`,
    `ALTER TABLE listings ADD COLUMN IF NOT EXISTS frame_material VARCHAR(50)`,
    `ALTER TABLE listings ADD COLUMN IF NOT EXISTS drivetrain_speeds INT`,
    `ALTER TABLE listings ADD COLUMN IF NOT EXISTS brake_type VARCHAR(50)`,
    `ALTER TABLE listings ADD COLUMN IF NOT EXISTS component_brands VARCHAR(255)`,
    `ALTER TABLE listings ADD COLUMN IF NOT EXISTS damage_notes TEXT`,
    `ALTER TABLE listings ADD COLUMN IF NOT EXISTS trade_considered BOOLEAN DEFAULT false`,
    `ALTER TABLE listings ADD COLUMN IF NOT EXISTS original_receipt BOOLEAN DEFAULT false`,
    `ALTER TABLE listings ADD COLUMN IF NOT EXISTS warranty_remaining TEXT`,
    `ALTER TABLE listings ADD COLUMN IF NOT EXISTS recent_upgrades TEXT`,
    `ALTER TABLE listings ADD COLUMN IF NOT EXISTS postal_code VARCHAR(10)`,
    `ALTER TABLE listings ADD COLUMN IF NOT EXISTS colour VARCHAR(50)`,
    `ALTER TABLE listings ADD COLUMN IF NOT EXISTS youtube_url VARCHAR(500)`,
  ]
  for (const q of cols) {
    await sql.query(q)
    process.stdout.write('.')
  }
  console.log('\n✅ All listing fields added')

  // Backfill existing listings with realistic data
  const listings = await sql`SELECT id, bike_make, bike_model, category_id FROM listings WHERE status = 'active'`
  const cats = await sql`SELECT id, slug FROM listing_categories`
  const catMap = Object.fromEntries(cats.map((c: any) => [c.id, c.slug]))

  const FRAME_SIZES    = ['XS','S','M','L','XL']
  const MATERIALS      = ['Carbon','Aluminium','Steel','Titanium']
  const BRAKE_TYPES    = ['Hydraulic Disc','Mechanical Disc','Rim Brake']
  const COMPONENTS     = [
    'Shimano XT, RockShox Pike, SRAM Eagle',
    'Shimano Deore, Fox 34, Shimano SLX',
    'SRAM GX Eagle, Fox 36 Factory, SRAM Code',
    'Shimano Ultegra Di2, Vision Metron wheels',
    'SRAM Red eTap AXS, Zipp 303 wheels',
    'Shimano 105 R7000, Fulcrum Racing wheels',
  ]
  const COLOURS = ['Black','White','Red','Blue','Green','Grey','Orange','Yellow']
  const POSTCODES = ['8001','2000','4001','6001','9301','0699','2520','1200']

  for (let i = 0; i < listings.length; i++) {
    const l = listings[i] as any
    const catSlug = catMap[l.category_id] || ''
    const isBike = ['mtb','road-bike','gravel-bike','enduro','complete-bikes'].includes(catSlug)

    await sql`UPDATE listings SET
      frame_size = ${isBike ? FRAME_SIZES[i % FRAME_SIZES.length] : null},
      wheel_size_inches = ${catSlug === 'mtb' || catSlug === 'enduro' ? (i % 2 === 0 ? 29 : 27) : catSlug === 'road-bike' ? 700 : null},
      suspension_travel_mm = ${['mtb','enduro'].includes(catSlug) ? [120,140,150,160,170][i % 5] : null},
      frame_material = ${isBike ? MATERIALS[i % MATERIALS.length] : null},
      drivetrain_speeds = ${isBike ? [10,11,12][i % 3] : null},
      brake_type = ${isBike ? BRAKE_TYPES[i % BRAKE_TYPES.length] : null},
      component_brands = ${isBike ? COMPONENTS[i % COMPONENTS.length] : null},
      colour = ${COLOURS[i % COLOURS.length]},
      postal_code = ${POSTCODES[i % POSTCODES.length]},
      trade_considered = ${i % 3 === 0},
      original_receipt = ${i % 2 === 0}
    WHERE id = ${l.id}`
    process.stdout.write('.')
  }
  console.log(`\n✅ ${listings.length} listings backfilled`)
}
main().catch(console.error)
