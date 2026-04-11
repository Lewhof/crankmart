import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function main() {
  // Add attributes JSONB column if not exists
  await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '{}'::jsonb`
  console.log('✅ attributes column added')

  // Get categories
  const cats = await sql`SELECT id, slug FROM listing_categories`
  const catMap = Object.fromEntries(cats.map((c: any) => [c.slug, c.id]))

  // Update MTB listings
  await sql`
    UPDATE listings SET attributes = jsonb_build_object(
      'suspension', CASE WHEN RANDOM() > 0.3 THEN 'Full Sus' ELSE 'Hardtail' END,
      'frameSize', (ARRAY['XS','S','M','L','XL'])[floor(random()*5+1)::int],
      'wheelSize', (ARRAY['27.5"','29"'])[floor(random()*2+1)::int],
      'travel', (ARRAY['100-120mm','130-150mm','160mm+'])[floor(random()*3+1)::int]
    )
    WHERE category_id = ${catMap['mtb']}
  `
  console.log('✅ MTB attributes seeded')

  // Update Enduro listings
  await sql`
    UPDATE listings SET attributes = jsonb_build_object(
      'suspension', 'Full Sus',
      'frameSize', (ARRAY['S','M','L','XL'])[floor(random()*4+1)::int],
      'wheelSize', (ARRAY['27.5"','29"','Mixed'])[floor(random()*3+1)::int],
      'travel', (ARRAY['150-160mm','160mm+','170mm+'])[floor(random()*3+1)::int]
    )
    WHERE category_id = ${catMap['enduro']}
  `
  console.log('✅ Enduro attributes seeded')

  // Update Road listings
  await sql`
    UPDATE listings SET attributes = jsonb_build_object(
      'frameSize', (ARRAY['XS','S','M','L','XL'])[floor(random()*5+1)::int],
      'groupset', (ARRAY['Shimano 105','Shimano Ultegra','Shimano Dura-Ace','SRAM Rival','SRAM Force','SRAM Red'])[floor(random()*6+1)::int],
      'frameType', (ARRAY['Endurance','Aero','Climbing'])[floor(random()*3+1)::int]
    )
    WHERE category_id = ${catMap['road-bike']}
  `
  console.log('✅ Road attributes seeded')

  // Update Gravel listings
  await sql`
    UPDATE listings SET attributes = jsonb_build_object(
      'frameSize', (ARRAY['XS','S','M','L','XL'])[floor(random()*5+1)::int],
      'groupset', (ARRAY['Shimano GRX','SRAM Rival AXS','SRAM Force AXS','Campagnolo Ekar'])[floor(random()*4+1)::int],
      'tyreWidth', (ARRAY['35-40mm','40-45mm','45mm+'])[floor(random()*3+1)::int]
    )
    WHERE category_id = ${catMap['gravel-bike']}
  `
  console.log('✅ Gravel attributes seeded')

  // Update Helmets
  await sql`
    UPDATE listings SET attributes = jsonb_build_object(
      'size', (ARRAY['XS/S','S/M','M/L','L/XL'])[floor(random()*4+1)::int],
      'type', (ARRAY['Road','MTB Trail','Enduro','XC'])[floor(random()*4+1)::int],
      'mips', CASE WHEN RANDOM() > 0.3 THEN true ELSE false END
    )
    WHERE category_id = ${catMap['helmets']}
  `
  console.log('✅ Helmet attributes seeded')

  // Update Shoes
  await sql`
    UPDATE listings SET attributes = jsonb_build_object(
      'size', (ARRAY['EU40','EU41','EU42','EU43','EU44','EU45','EU46'])[floor(random()*7+1)::int],
      'type', (ARRAY['Road','MTB Clipless','MTB Flat','Gravel'])[floor(random()*4+1)::int]
    )
    WHERE category_id = ${catMap['shoes']}
  `
  console.log('✅ Shoes attributes seeded')

  // Update Apparel
  await sql`
    UPDATE listings SET attributes = jsonb_build_object(
      'size', (ARRAY['XS','S','M','L','XL','XXL'])[floor(random()*6+1)::int],
      'type', (ARRAY['Jersey','Bib Shorts','Jacket','Gilet','Kit'])[floor(random()*5+1)::int],
      'gender', (ARRAY['Mens','Womens','Unisex'])[floor(random()*3+1)::int]
    )
    WHERE category_id = ${catMap['gear-apparel']}
  `
  console.log('✅ Apparel attributes seeded')

  // Update Suspension
  await sql`
    UPDATE listings SET attributes = jsonb_build_object(
      'type', (ARRAY['Fork','Rear Shock','Fork + Shock'])[floor(random()*3+1)::int],
      'travel', (ARRAY['100mm','120mm','140mm','150mm','160mm','170mm'])[floor(random()*6+1)::int],
      'axle', (ARRAY['15mm TA','20mm TA','QR'])[floor(random()*3+1)::int]
    )
    WHERE category_id = ${catMap['suspension']}
  `
  console.log('✅ Suspension attributes seeded')

  // Update E-Bikes
  await sql`
    UPDATE listings SET attributes = jsonb_build_object(
      'motor', (ARRAY['Bosch Performance CX','Shimano EP8','Yamaha PW-X3','Specialized SL 1.1'])[floor(random()*4+1)::int],
      'battery', (ARRAY['250Wh','320Wh','500Wh','625Wh','750Wh'])[floor(random()*5+1)::int],
      'frameSize', (ARRAY['S','M','L','XL'])[floor(random()*4+1)::int]
    )
    WHERE category_id = ${catMap['e-bikes']}
  `
  console.log('✅ E-Bike attributes seeded')

  console.log('\n✅ All attributes seeded')
}

main().catch(console.error)
