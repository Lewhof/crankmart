import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

const SA_LISTINGS = [
  { make: 'Trek', model: 'Fuel EX 9.8 GX', year: 2023, cat: 17, cond: 'like_new', price: 32500, city: 'Cape Town', province: 'Western Cape', desc: 'Selling my Trek Fuel EX 9.8 GX after upgrading to a bigger bike. Full GX Eagle drivetrain, Fox Factory suspension front and rear, RockShox Super Deluxe rear shock. Carbon frame, size Medium. Only done about 800km, serviced 2 months ago. Minor scratches on chainstay from trail riding. All original parts, still have the box. Reason for selling: upgraded to a Yeti SB150. Comes with original water bottle cage, instruction manuals and warranty card.' },
  { make: 'Specialized', model: 'S-Works Tarmac SL7', year: 2022, cat: 18, cond: 'used', price: 65000, city: 'Johannesburg', province: 'Gauteng', desc: 'S-Works Tarmac SL7 in immaculate condition. SRAM Red eTap AXS 12-speed, Roval CLX 50 wheels, size 54cm. This is the top-of-the-range road bike from Specialized. I am the second owner, purchased from a friend. Used for club rides and the occasional gran fondo. Serviced at The Bicycle Company 3 months ago. New tyres (Turbo Cotton) fitted 500km ago. Weight is approximately 6.8kg. Not negotiable at this price.' },
  { make: 'Giant', model: 'Trance X Advanced Pro 29 1', year: 2023, cat: 20, cond: 'like_new', price: 45000, city: 'Pretoria', province: 'Gauteng', desc: 'Giant Trance X Advanced Pro 29 in Large, barely used (under 500km). Fox 36 Factory fork, Fox Float X Factory rear shock, Shimano XTR drivetrain. Maxxis Minion DHF/DHR tyres, Giant Carbon wheelset. This is a full carbon enduro-ready trail bike. Selling because I moved to Cape Town and dont have time to ride anymore. Still under warranty. Includes Shimano SPD pedals as a bonus.' },
  { make: 'Santa Cruz', model: 'Hightower CC X01', year: 2021, cat: 20, cond: 'used', price: 55000, city: 'Stellenbosch', province: 'Western Cape', desc: 'Santa Cruz Hightower CC with X01 Eagle drivetrain. This is the 29er all-mountain version, size Large. Carbon frame in great condition, a few chain suck marks but nothing structural. Fox 36 fork with GRIP2 damper, Fox DHX2 Factory rear. Roval Traverse wheels. Tyres replaced 6 months ago with Minion DHF front and DHR rear. Ideal for Jonkershoek and Tokai trails. Motivated to sell.' },
  { make: 'Cannondale', model: 'SuperSix EVO Hi-MOD Disc', year: 2022, cat: 18, cond: 'like_new', price: 48000, city: 'Sandton', province: 'Gauteng', desc: 'Cannondale SuperSix EVO Hi-MOD with Shimano Ultegra Di2 groupset. Size 52cm (suits 170-178cm). Only 2000km on the bike - used purely for club rides on weekends. Mavic Cosmic Pro Carbon wheels, Cannondale HollowGram crank. No crashes, full service history at Cycle Lab. Includes Wahoo mount, spare cleats and original pedals. This bike is an absolute rocket.' },
  { make: 'Trek', model: 'Marlin 5', year: 2023, cat: 17, cond: 'used', price: 6500, city: 'Durban', province: 'KwaZulu-Natal', desc: 'Trek Marlin 5 mountain bike, size Medium. Shimano Altus groupset, hydraulic disc brakes, 29 inch wheels. Perfect entry-level MTB in good condition. Some cosmetic wear but mechanically 100%. New brake pads fitted. Good for beginners or as a commuter bike. Used mostly on weekends in Krantzkloof. Selling as I have upgraded.' },
  { make: 'Scott', model: 'Addict RC 10', year: 2022, cat: 18, cond: 'used', price: 38000, city: 'Cape Town', province: 'Western Cape', desc: 'Scott Addict RC 10 with Shimano Dura-Ace Di2. Size 54cm. This is Scott is lightest road race bike, weighing just over 7kg. Full carbon, Syncros Creston Aero handlebar. Used for racing and training, approximately 8000km total. Serviced every 2000km. Minor scratch on the seat tube from a bottle cage rub. Mavic Cosmic Elite wheels included.' },
  { make: 'Yeti', model: 'SB130 Lunch Ride TURQ', year: 2022, cat: 20, cond: 'like_new', price: 72000, city: 'Cape Town', province: 'Western Cape', desc: 'Yeti SB130 Lunch Ride TURQ frame kit with SRAM X01 Eagle built up. Size Medium, 130mm rear travel, 140mm Fox 36 fork. This is Yetis most versatile trail bike. Only 1200km from new. Full suspension tune done at Chain Reaction 4 months ago. Comes with Yeti frame protection, spare bolts kit. Maxxis Minion DHF 2.5 front and Dissector 2.4 rear, EXO+. Reason selling: bought a DH bike.' },
  { make: 'Merida', model: 'Scultura Team', year: 2023, cat: 18, cond: 'new', price: 42000, city: 'Johannesburg', province: 'Gauteng', desc: 'Brand new Merida Scultura Team in Medium, never ridden. Bought from Merida SA, still has the protective film on the frame. Shimano Ultegra R8150 Di2 groupset, Fulcrum Racing 400 wheels. This is the 2023 model, available in LBS for R52000. Selling because I received it as a gift but already have a road bike. 100% genuine, comes with full warranty and receipt from Merida SA.' },
  { make: 'Canyon', model: 'Neuron CF 9', year: 2023, cat: 17, cond: 'like_new', price: 28000, city: 'Knysna', province: 'Western Cape', desc: 'Canyon Neuron CF 9, size Large, carbon frame. This is a 120mm travel all-mountain hardtail killer. SRAM GX Eagle 12-speed, RockShox Pike RC fork, DT Swiss M1900 wheels. Only 600km, used on the Knysna Forest trails. Pristine condition, no scratches. Canyon direct price was R34000. Selling because relocating to the UK.' },
  { make: 'Trek', model: 'Domane SL 6 Disc', year: 2022, cat: 18, cond: 'used', price: 22000, city: 'Pretoria', province: 'Gauteng', desc: 'Trek Domane SL 6 Disc endurance road bike. Size 56cm, Shimano 105 Di2 groupset, hydraulic disc brakes. IsoSpeed decoupler front and rear for supreme comfort on rough roads. Bontrager Paradigm Elite wheelset. Used for long-distance riding and charity events. Around 5000km on the clock. Well maintained, full history at Trek dealer.' },
  { make: 'Specialized', model: 'Stumpjumper EVO Expert', year: 2021, cat: 20, cond: 'used', price: 35000, city: 'Johannesburg', province: 'Gauteng', desc: 'Specialized Stumpjumper EVO Expert 29, size S4. This is the modern geometry aggressive trail bike. SRAM GX Eagle, Fox 36 Factory fork, Fox Float X Factory rear shock. Carbon frame, DT Swiss wheels. Some wear on the lower shock mount but fully functional. New Maxxis Assegai/DHR combo fitted 3 months ago. Frame is the standout feature here - geometry is perfect for technical trails.' },
  { make: 'Orbea', model: 'Orca M20', year: 2023, cat: 18, cond: 'like_new', price: 26000, city: 'Cape Town', province: 'Western Cape', desc: 'Orbea Orca M20 in size 51cm, only 1500km. Shimano Ultegra mechanical groupset, Mavic Aksium wheels. This is Orbeas lightweight race bike. Very comfortable geometry for a racing bike. Used for club rides and two sportives. No accidents, full service done 2 months ago at Bicycle Emporium. Selling to fund a triathlon bike purchase.' },
  { make: 'Giant', model: 'Reign Advanced Pro 29 0', year: 2022, cat: 20, cond: 'used', price: 52000, city: 'Durban', province: 'KwaZulu-Natal', desc: 'Giant Reign Advanced Pro 29, size Large. Shimano XTR 12-speed, Fox Factory suspension throughout. Carbon frame and carbon wheels (Giant Carbon 2-ply). This is the full-tilt enduro bike from Giant. Used for Cascades and some racing. Approximately 3000km, serviced at Giant Durban. Some trail rash on the chainstay and lower links, nothing serious. Price is firm.' },
  { make: 'Cube', model: 'Agree C:68X SLT', year: 2022, cat: 19, cond: 'like_new', price: 31000, city: 'Johannesburg', province: 'Gauteng', desc: 'Cube Agree C:68X SLT gravel bike, size 56cm. SRAM Force 1x12, carbon frame, DT Swiss GR1600 wheels. 40mm tyre clearance, perfect for mixed surfaces. Serviced at Cube dealer. Only 2000km, mostly used on gravel routes around Hartbeespoort and Magaliesberg. Handlebar flare of 16 degrees makes it very comfortable. Includes mudguard mounts and fender kit.' },
  { make: 'Trek', model: 'Checkpoint SL 7', year: 2023, cat: 19, cond: 'new', price: 36000, city: 'Cape Town', province: 'Western Cape', desc: 'Trek Checkpoint SL 7 gravel bike, brand new, size 56cm. SRAM Rival XPLR AXS 12-speed wireless, IsoSpeed decoupler. Carbon frame with supreme compliance. Bontrager GR2 Team Issue 40mm tyres. Comes with Trek 60-day returns policy. Retail is R44000 at Trek dealers. Selling because I ordered two by mistake - genuine sale, receipt available on request.' },
  { make: 'Specialized', model: 'Diverge Expert Carbon', year: 2022, cat: 19, cond: 'used', price: 29000, city: 'Pretoria', province: 'Gauteng', desc: 'Specialized Diverge Expert Carbon, size 58cm. SRAM Rival 1x12, future shock 2.0 front suspension. Used extensively for gravel racing including Cape Pioneer and the Gravel and Tar series. Approximately 6000km. Frame in great shape, fork has some small scratches. New drivetrain components fitted 1000km ago. DT Swiss G1800 wheels with 38mm Pathfinder tyres.' },
  { make: 'Scott', model: 'Spark RC 900 Pro', year: 2022, cat: 17, cond: 'like_new', price: 58000, city: 'Cape Town', province: 'Western Cape', desc: 'Scott Spark RC 900 Pro XC race bike, size Medium. Shimano XTR 12-speed, Fox 34 SC fork, Fox Float DPS rear shock. Carbon frame and carbon wheels. Only used for 4 XCO races and some training rides, total approximately 400km. This bike is ridiculously fast on XC tracks. Racing team upgrade means I need to let this go. Full warranty still valid.' },
  { make: 'Merida', model: 'One-Twenty 9000', year: 2022, cat: 17, cond: 'used', price: 18000, city: 'Sandton', province: 'Gauteng', desc: 'Merida One-Twenty 9000, size Large. Shimano XTR 12-speed, Fox 34 Float fork, Fox Float DPX2 rear. Alloy frame but everything else is top spec. Excellent condition for its age, approximately 4000km. Services done at Merida SA dealer every 1000km. Great value hardcore trail hardtail. Selling because I am moving to a full suspension bike.' },
  { make: 'Cannondale', model: 'Topstone Carbon Lefty 3', year: 2023, cat: 19, cond: 'like_new', price: 39000, city: 'Stellenbosch', province: 'Western Cape', desc: 'Cannondale Topstone Carbon Lefty 3 gravel bike, size Large. Shimano GRX 600 2x11, Cannondale Lefty Oliver 30mm travel fork, SAVE compliance system. Only 800km from new. This is the most unique gravel bike on the market with the Lefty fork. Perfect for Winelands gravel routes. Selling to fund a triathlon build. Retail R48000.' },
  { make: 'Trek', model: 'Slash 9.8 GX', year: 2021, cat: 21, cond: 'used', price: 44000, city: 'Johannesburg', province: 'Gauteng', desc: 'Trek Slash 9.8 GX enduro/DH ready bike. Size Large, 170mm travel. SRAM GX Eagle drivetrain, Fox 38 Factory fork, Fox DHX2 Factory rear shock. This is Treks most capable all-mountain bike. Has been raced at Witemsberg and some local enduro events. Frame has proper enduro battle scars but is structurally perfect. All pivot bearings replaced 6 months ago. Truvativ Descendant carbon bars.' },
  { make: 'Giant', model: 'TCR Advanced SL 0 Disc', year: 2021, cat: 18, cond: 'used', price: 62000, city: 'Cape Town', province: 'Western Cape', desc: 'Giant TCR Advanced SL 0 Disc with Shimano Dura-Ace Di2 R9270. Size M/L. Giant proprietary carbon wheels (Giant SLR 1 36 Carbon), Giant Contact SL carbon bar. This is Giants top road race bike. Has done approximately 10000km but always serviced and maintained to perfection. Used for Argus, Cape Town Cycle Tour and club racing. Comes with original wheels and all service records.' },
  { make: 'Specialized', model: 'Rockhopper Expert 29', year: 2023, cat: 17, cond: 'new', price: 12500, city: 'Durban', province: 'KwaZulu-Natal', desc: 'Brand new Specialized Rockhopper Expert 29 in size Large, never ridden. Shimano Deore 12-speed, RockShox Judy Silver fork, hydraulic disc brakes. Purchased from Adventure Inc but decided to go full suspension instead. Full warranty, receipt available. Current retail price R14500. Perfect beginner to intermediate MTB.' },
  { make: 'Orbea', model: 'Rise M-LTD', year: 2022, cat: 17, cond: 'like_new', price: 85000, city: 'Cape Town', province: 'Western Cape', desc: 'Orbea Rise M-LTD eMTB, size Large. Shimano XTR 12-speed, Fox 36 Factory fork, Fox Float X2 Factory rear. Orbea own motor system (light eMTB motor, 360Wh battery). Carbon frame, Mavic Deemax wheels. Only 900km, battery health at 98%. This is a featherlight eMTB that rides like a normal bike. Perfect for Tokai and Jonkershoek. Reason selling: health reasons, cannot ride anymore.' },
  { make: 'Canyon', model: 'Aeroad CFR eTap', year: 2022, cat: 18, cond: 'used', price: 70000, city: 'Johannesburg', province: 'Gauteng', desc: 'Canyon Aeroad CFR with SRAM Red eTap AXS. Size M (fits 175-185cm). The definitive aero road bike. Shimano DI2 power meter crank fitted additionally. 5000km, serviced at Canyon dealer (Tread & Pedal). ENVE SES 4.5 wheelset included. Comes with the original Canyon SL Disc wheelset as bonus. No crashes, always garaged. Very reluctant sale.' },
  { make: 'Trek', model: 'Top Fuel 9.9 XTR', year: 2023, cat: 17, cond: 'like_new', price: 59000, city: 'Pretoria', province: 'Gauteng', desc: 'Trek Top Fuel 9.9 XTR Race, size Medium. Shimano XTR M9100 throughout, Fox Factory suspension. This is the pinnacle of XC racing bikes from Trek. Only used for 3 XCO races and some training, approximately 250km total. The team at Trek says this is the most laterally stiff XC bike they have ever made. Reason for selling: switching to road cycling after injury.' },
]

async function seed() {
  console.log('🌱 Seeding CrankMart database...')

  // Create 5 test users
  console.log('Creating test users...')
  const testUsers = [
    { email: 'admin@crankmart.com', name: 'CrankMart Admin', role: 'admin', province: 'Western Cape', city: 'Cape Town' },
    { email: 'marcus@crankmart.com', name: 'Marcus van der Berg', role: 'seller', province: 'Gauteng', city: 'Johannesburg' },
    { email: 'emma@crankmart.com', name: 'Emma Pretorius', role: 'buyer', province: 'Western Cape', city: 'Cape Town' },
    { email: 'thabo@crankmart.com', name: 'Thabo Nkosi', role: 'seller', province: 'KwaZulu-Natal', city: 'Durban' },
    { email: 'sarah@crankmart.com', name: 'Sarah Mitchell', role: 'seller', province: 'Western Cape', city: 'Stellenbosch' },
  ]

  // Insert users one at a time to avoid conflicts
  const userIds: string[] = []
  for (const u of testUsers) {
    try {
      const existing = await sql`SELECT id FROM users WHERE email = ${u.email} LIMIT 1`
      if (existing.length > 0) {
        userIds.push(existing[0].id as string)
        console.log(`  User exists: ${u.email}`)
      } else {
        const result = await sql`
          INSERT INTO users (email, name, role, province, city, email_verified, is_active, password_hash)
          VALUES (${u.email}, ${u.name}, ${u.role as string}::user_role, ${u.province}, ${u.city}, true, true, 'testpass123')
          RETURNING id
        `
        userIds.push(result[0].id as string)
        console.log(`  Created user: ${u.email}`)
      }
    } catch (e) {
      console.log(`  Skipping user ${u.email}: ${(e as Error).message}`)
      userIds.push('00000000-0000-0000-0000-000000000001')
    }
  }

  // Check if listings already seeded
  const existingListings = await sql`SELECT count(*) as cnt FROM listings`
  if (parseInt(existingListings[0].cnt as string) > 0) {
    console.log(`\n✅ ${existingListings[0].cnt} listings already exist — skipping listing seed`)
    return
  }

  console.log('\nCreating 25 listings...')
  let listingCount = 0
  for (const item of SA_LISTINGS) {
    try {
      const sellerId = userIds[Math.floor(Math.random() * (userIds.length - 1)) + 1] // skip admin
      const slug = `${item.make.toLowerCase()}-${item.model.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${item.year}-${Date.now()}-${listingCount}`
      const isBoosted = listingCount < 5
      
      const result = await sql`
        INSERT INTO listings (
          seller_id, category_id, title, slug, description,
          bike_make, bike_model, bike_year, condition, price,
          negotiable, seller_type, province, city, status,
          moderation_status, boost_enabled, is_featured,
          views_count, saves_count
        ) VALUES (
          ${sellerId}, ${item.cat}, ${`${item.make} ${item.model}`}, ${slug}, ${item.desc},
          ${item.make}, ${item.model}, ${item.year}, ${item.cond}::condition, ${item.price},
          true, 'private'::seller_type, ${item.province}, ${item.city}, 'active'::listing_status,
          'approved'::moderation_status, ${isBoosted}, ${isBoosted},
          ${Math.floor(Math.random() * 500)}, ${Math.floor(Math.random() * 50)}
        ) RETURNING id
      `
      
      // Add placeholder image URL
      const listingId = result[0].id
      await sql`
        INSERT INTO listing_images (listing_id, image_url, display_order)
        VALUES (${listingId as string}, ${'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'}, 0)
      `
      
      listingCount++
      if (listingCount % 5 === 0) console.log(`  ${listingCount} listings created...`)
    } catch (e) {
      console.log(`  Failed listing "${item.make} ${item.model}": ${(e as Error).message}`)
    }
  }

  console.log(`\n✅ Seed complete: ${listingCount} listings created`)
}

seed().catch(console.error)
