import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function main() {
  // Get all listings with their category slugs
  const rows = await sql`
    SELECT l.id, c.slug as cat_slug
    FROM listings l
    JOIN listing_categories c ON l.category_id = c.id
    WHERE l.status = 'active'
    ORDER BY l.created_at
  `

  const FRAME_SIZES = ['XS', 'S', 'M', 'L', 'XL']
  const MTB_WHEEL   = ['27.5"', '29"']
  const MTB_TRAVEL  = ['100-120mm', '130-150mm', '160mm+']
  const MTB_SUSP    = ['Full Sus', 'Hardtail']
  const ROAD_GROUP  = ['Shimano 105', 'Shimano Ultegra', 'Shimano Dura-Ace', 'SRAM Rival', 'SRAM Force', 'SRAM Red']
  const ROAD_TYPE   = ['Endurance', 'Aero', 'Climbing']
  const GRAV_GROUP  = ['Shimano GRX', 'SRAM Rival AXS', 'SRAM Force AXS', 'Campagnolo Ekar']
  const GRAV_TYRE   = ['35-40mm', '40-45mm', '45mm+']
  const END_WHEEL   = ['27.5"', '29"', 'Mixed']
  const END_TRAVEL  = ['150-160mm', '160mm+', '170mm+']
  const HELM_SIZE   = ['XS/S', 'S/M', 'M/L', 'L/XL']
  const HELM_TYPE   = ['Road', 'MTB Trail', 'Enduro', 'XC']
  const SHOE_SIZE   = ['EU40', 'EU41', 'EU42', 'EU43', 'EU44', 'EU45', 'EU46']
  const SHOE_TYPE   = ['Road', 'MTB Clipless', 'MTB Flat', 'Gravel']
  const APP_SIZE    = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  const APP_GENDER  = ['Mens', 'Womens', 'Unisex']
  const APP_TYPE    = ['Jersey', 'Bib Shorts', 'Jacket', 'Gilet', 'Kit']
  const SUSP_TYPE   = ['Fork', 'Rear Shock', 'Fork + Shock']
  const SUSP_TRVL   = ['100mm', '120mm', '140mm', '150mm', '160mm', '170mm']
  const SUSP_AXLE   = ['15mm TA', '20mm TA', 'QR']
  const EBIKE_MOTOR = ['Bosch Performance CX', 'Shimano EP8', 'Yamaha PW-X3', 'Specialized SL 1.1']
  const EBIKE_BAT   = ['250Wh', '320Wh', '500Wh', '625Wh', '750Wh']

  const pick = <T>(arr: T[], i: number) => arr[i % arr.length]

  let updated = 0
  for (let i = 0; i < rows.length; i++) {
    const { id, cat_slug } = rows[i] as { id: string; cat_slug: string }
    let attrs: Record<string, string | boolean> = {}

    switch (cat_slug) {
      case 'mtb':
        attrs = {
          suspension: pick(MTB_SUSP, i),
          frameSize:  pick(FRAME_SIZES, i + 1),
          wheelSize:  pick(MTB_WHEEL, i),
          travel:     pick(MTB_TRAVEL, i),
        }
        break
      case 'enduro':
        attrs = {
          suspension: 'Full Sus',
          frameSize:  pick(FRAME_SIZES, i + 2),
          wheelSize:  pick(END_WHEEL, i),
          travel:     pick(END_TRAVEL, i),
        }
        break
      case 'road-bike':
        attrs = {
          frameSize: pick(FRAME_SIZES, i),
          groupset:  pick(ROAD_GROUP, i),
          frameType: pick(ROAD_TYPE, i),
        }
        break
      case 'gravel-bike':
        attrs = {
          frameSize: pick(FRAME_SIZES, i + 1),
          groupset:  pick(GRAV_GROUP, i),
          tyreWidth: pick(GRAV_TYRE, i),
        }
        break
      case 'helmets':
        attrs = {
          size: pick(HELM_SIZE, i),
          type: pick(HELM_TYPE, i),
          mips: i % 3 !== 0,
        }
        break
      case 'shoes':
        attrs = {
          size: pick(SHOE_SIZE, i),
          type: pick(SHOE_TYPE, i),
        }
        break
      case 'gear-apparel':
        attrs = {
          size:   pick(APP_SIZE, i),
          gender: pick(APP_GENDER, i),
          type:   pick(APP_TYPE, i),
        }
        break
      case 'suspension':
        attrs = {
          type:   pick(SUSP_TYPE, i),
          travel: pick(SUSP_TRVL, i),
          axle:   pick(SUSP_AXLE, i),
        }
        break
      case 'e-bikes':
        attrs = {
          motor:     pick(EBIKE_MOTOR, i),
          battery:   pick(EBIKE_BAT, i),
          frameSize: pick(FRAME_SIZES, i),
        }
        break
      case 'frames':
        attrs = {
          frameSize:  pick(FRAME_SIZES, i),
          material:   pick(['Carbon', 'Aluminium', 'Steel', 'Titanium'], i),
          discipline: pick(['MTB', 'Road', 'Gravel', 'Enduro'], i),
        }
        break
      default:
        continue
    }

    await sql`UPDATE listings SET attributes = ${JSON.stringify(attrs)}::jsonb WHERE id = ${id}`
    updated++
    process.stdout.write(`\r  Updated ${updated}/${rows.length}`)
  }

  console.log(`\n✅ ${updated} listings updated with varied attributes`)
}

main().catch(console.error)
