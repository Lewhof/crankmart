import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

const BIKE_IMAGES = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=450&fit=crop',
  'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&h=450&fit=crop',
  'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=600&h=450&fit=crop',
  'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=600&h=450&fit=crop',
  'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600&h=450&fit=crop',
  'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&h=450&fit=crop',
  'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=600&h=450&fit=crop',
  'https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=600&h=450&fit=crop',
]

const PROVINCES = ['Western Cape','Gauteng','KwaZulu-Natal','Eastern Cape','Free State','Limpopo']
const CITIES: Record<string,string> = {
  'Western Cape':'Cape Town','Gauteng':'Johannesburg','KwaZulu-Natal':'Durban',
  'Eastern Cape':'Port Elizabeth','Free State':'Bloemfontein','Limpopo':'Polokwane'
}

function slug(title: string, idx: number) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') + '-' + idx
}

const LISTINGS_BY_CATEGORY: Array<{
  categoryId: number, categorySlug: string, items: Array<{
    title: string, make: string, model: string, year: number,
    price: number, condition: string, description: string
  }>
}> = [
  {
    categoryId: 17, categorySlug: 'mtb',
    items: [
      { title: 'Trek Fuel EX 9.8', make: 'Trek', model: 'Fuel EX 9.8', year: 2023, price: 32500, condition: 'used', description: 'Full suspension trail bike in excellent condition.' },
      { title: 'Yeti SB130 Lunch Ride', make: 'Yeti', model: 'SB130 LR', year: 2022, price: 72000, condition: 'like_new', description: 'Barely ridden, full SRAM GX Eagle build.' },
      { title: 'Santa Cruz Hightower CC', make: 'Santa Cruz', model: 'Hightower CC X01', year: 2023, price: 55000, condition: 'like_new', description: 'Carbon full suspension, immaculate condition.' },
      { title: 'Specialized Stumpjumper Evo', make: 'Specialized', model: 'Stumpjumper Evo Expert', year: 2021, price: 38000, condition: 'used', description: 'Trail shredder, few scratches but mechanically perfect.' },
      { title: 'Norco Sight C2', make: 'Norco', model: 'Sight C2', year: 2022, price: 29000, condition: 'used', description: 'Carbon trail bike, Shimano SLX build.' },
    ]
  },
  {
    categoryId: 18, categorySlug: 'road-bike',
    items: [
      { title: 'Specialized S-Works Tarmac SL7', make: 'Specialized', model: 'S-Works Tarmac SL7', year: 2022, price: 65000, condition: 'like_new', description: 'Top-end race bike, Dura-Ace Di2, immaculate.' },
      { title: 'Trek Emonda SLR', make: 'Trek', model: 'Emonda SLR 7', year: 2023, price: 48000, condition: 'like_new', description: 'Ultralight climbing machine, barely used.' },
      { title: 'Cannondale SuperSix EVO', make: 'Cannondale', model: 'SuperSix EVO Hi-MOD Disc', year: 2022, price: 48000, condition: 'used', description: 'Race-ready, Shimano Ultegra Di2.' },
      { title: 'Giant TCR Advanced SL', make: 'Giant', model: 'TCR Advanced SL 0 Disc', year: 2021, price: 42000, condition: 'used', description: 'Aero road rocket, perfect for racing.' },
      { title: 'Cervelo R5', make: 'Cervelo', model: 'R5 Disc', year: 2022, price: 58000, condition: 'like_new', description: 'Lightweight, stiff, incredible climber.' },
    ]
  },
  {
    categoryId: 19, categorySlug: 'gravel-bike',
    items: [
      { title: 'Canyon Grail CF SLX', make: 'Canyon', model: 'Grail CF SLX 8 Di2', year: 2023, price: 45000, condition: 'new', description: 'Brand new, unridden demo bike.' },
      { title: 'Specialized Diverge Expert', make: 'Specialized', model: 'Diverge Expert Carbon', year: 2022, price: 38000, condition: 'like_new', description: 'Future Shock 2.0, barely 500km on it.' },
      { title: 'Trek Checkpoint SL 6', make: 'Trek', model: 'Checkpoint SL 6 eTap', year: 2022, price: 36000, condition: 'used', description: 'SRAM Force eTap AXS, great all-rounder.' },
      { title: 'Orbea Terra M20', make: 'Orbea', model: 'Terra M20', year: 2023, price: 28000, condition: 'used', description: 'Aluminium gravel, budget-friendly adventure bike.' },
    ]
  },
  {
    categoryId: 20, categorySlug: 'enduro',
    items: [
      { title: 'Santa Cruz Bronson CC', make: 'Santa Cruz', model: 'Bronson CC X01 AXS', year: 2023, price: 68000, condition: 'like_new', description: 'Enduro weapon, AXS transmission.' },
      { title: 'Specialized Enduro Expert', make: 'Specialized', model: 'Enduro Expert', year: 2022, price: 48000, condition: 'used', description: '170mm travel, ready to send it.' },
      { title: 'Trek Slash 9.8', make: 'Trek', model: 'Slash 9.8 GX AXS', year: 2023, price: 52000, condition: 'like_new', description: 'Big mountain enduro, barely used.' },
    ]
  },
  {
    categoryId: 2, categorySlug: 'frames',
    items: [
      { title: 'Canyon Aeroad CF SLX Frame', make: 'Canyon', model: 'Aeroad CF SLX Frame', year: 2022, price: 22000, condition: 'like_new', description: 'Frame + fork only, no scratches.' },
      { title: 'Santa Cruz Tallboy Frame', make: 'Santa Cruz', model: 'Tallboy CC Frame', year: 2021, price: 18000, condition: 'used', description: 'Carbon MTB frame, medium size.' },
      { title: 'Specialized Roubaix Frame', make: 'Specialized', model: 'Roubaix Pro Frame', year: 2022, price: 15000, condition: 'used', description: 'S-Works level frame, future shock ready.' },
    ]
  },
  {
    categoryId: 3, categorySlug: 'suspension',
    items: [
      { title: 'Fox 36 Factory 160mm', make: 'Fox', model: '36 Factory 160mm', year: 2023, price: 8500, condition: 'like_new', description: 'GRIP2 damper, Kashima coating.' },
      { title: 'RockShox Lyrik Ultimate', make: 'RockShox', model: 'Lyrik Ultimate 160mm', year: 2022, price: 7200, condition: 'used', description: 'Charger 3 RC2 damper, great condition.' },
      { title: 'Fox Float X2 Factory', make: 'Fox', model: 'Float X2 Factory Shock', year: 2023, price: 6800, condition: 'like_new', description: 'Rear shock, 230x60mm, barely used.' },
    ]
  },
  {
    categoryId: 9, categorySlug: 'gear-apparel',
    items: [
      { title: 'Castelli Gabba RoS Jersey', make: 'Castelli', model: 'Gabba RoS Jersey', year: 2023, price: 1800, condition: 'like_new', description: 'Size Medium, worn twice, waterproof.' },
      { title: 'Rapha Pro Team Bib Shorts', make: 'Rapha', model: 'Pro Team Bib Shorts II', year: 2023, price: 2200, condition: 'new', description: 'Brand new with tags, size Large.' },
      { title: 'Troy Lee Designs Stage Kit', make: 'Troy Lee Designs', model: 'Stage Kit Jersey + Shorts', year: 2022, price: 1500, condition: 'used', description: 'MTB kit, size Large, good condition.' },
    ]
  },
  {
    categoryId: 10, categorySlug: 'helmets',
    items: [
      { title: 'Bell Super Air R MIPS', make: 'Bell', model: 'Super Air R MIPS', year: 2023, price: 3200, condition: 'like_new', description: 'Convertible enduro/trail helmet, size Medium.' },
      { title: 'POC Tectal Race MIPS', make: 'POC', model: 'Tectal Race MIPS', year: 2022, price: 2800, condition: 'used', description: 'XC/trail helmet, Uranium Black, size M/L.' },
      { title: 'Giro Aether MIPS Road', make: 'Giro', model: 'Aether MIPS', year: 2023, price: 4200, condition: 'new', description: 'Top-end road helmet, white/silver, size Medium.' },
    ]
  },
  {
    categoryId: 11, categorySlug: 'shoes',
    items: [
      { title: 'Shimano RX8 Gravel Shoes', make: 'Shimano', model: 'RX8 Gravel Shoes', year: 2023, price: 2400, condition: 'like_new', description: 'Size EU43, worn 3 times.' },
      { title: 'Specialized S-Works Vent Road', make: 'Specialized', model: 'S-Works Vent Road Shoes', year: 2022, price: 5500, condition: 'used', description: 'EU43, carbon sole, speed laces.' },
      { title: 'Five Ten Kestrel Lace', make: 'Five Ten', model: 'Kestrel Lace MTB', year: 2023, price: 1800, condition: 'new', description: 'EU44, flat pedal MTB shoe.' },
    ]
  },
  {
    categoryId: 13, categorySlug: 'e-bikes',
    items: [
      { title: 'Specialized Turbo Levo SL', make: 'Specialized', model: 'Turbo Levo SL Expert Carbon', year: 2023, price: 85000, condition: 'like_new', description: 'Light e-MTB, 320Wh battery, barely 100km.' },
      { title: 'Trek Rail 9.8 XT', make: 'Trek', model: 'Rail 9.8 XT', year: 2022, price: 72000, condition: 'used', description: 'Bosch Performance CX, full carbon.' },
      { title: 'Giant Trance X Advanced E+', make: 'Giant', model: 'Trance X Advanced E+ 1', year: 2023, price: 68000, condition: 'like_new', description: 'Yamaha motor, 625Wh, excellent.' },
    ]
  },
]

async function main() {
  // Get test user IDs
  const users = await sql`SELECT id FROM users LIMIT 4`
  if (!users.length) { console.log('No users found — run seed.ts first'); return }

  let total = 0
  for (const cat of LISTINGS_BY_CATEGORY) {
    for (let i = 0; i < cat.items.length; i++) {
      const item = cat.items[i]
      const province = PROVINCES[i % PROVINCES.length]
      const city = CITIES[province]
      const sellerId = users[i % users.length].id as string
      const listingSlug = slug(item.title, Date.now() + total)

      try {
        const [listing] = await sql`
          INSERT INTO listings (
            seller_id, category_id, title, slug, description,
            bike_make, bike_model, bike_year,
            condition, price, negotiable, seller_type,
            province, city, status, moderation_status,
            boost_enabled
          ) VALUES (
            ${sellerId}, ${cat.categoryId}, ${item.title}, ${listingSlug}, ${item.description},
            ${item.make}, ${item.model}, ${item.year},
            ${item.condition}::listing_condition, ${item.price}, true, 'individual'::seller_type,
            ${province}, ${city}, 'active'::listing_status, 'approved'::moderation_status,
            false
          ) RETURNING id
        `
        // Add image
        await sql`
          INSERT INTO listing_images (listing_id, image_url, display_order)
          VALUES (${listing.id as string}, ${BIKE_IMAGES[total % BIKE_IMAGES.length]}, 1)
        `
        total++
      } catch (e: unknown) {
        console.error(`Skip ${item.title}:`, e instanceof Error ? e.message : e)
      }
    }
  }
  console.log(`✅ Seeded ${total} listings across ${LISTINGS_BY_CATEGORY.length} categories`)
}

main().catch(console.error)
