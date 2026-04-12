/**
 * Seed Stellenbosch cycling businesses
 * Run: DATABASE_URL="..." npx tsx src/db/seed-stellenbosch-businesses.ts
 */
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

const businesses = [
  // ── SHOPS ───────────────────────────────────────────────────────────────
  {
    name: "Flandria Cycles Stellenbosch",
    slug: "flandria-cycles-stellenbosch",
    description: "Long-established bicycle shop at the Stelmark Centre in Stellenbosch. High-quality bike sales and expert repairs, branded accessories and gadgets, CO₂ gas refills, and locksmith services. Known for exceptional customer service and a highly skilled team.",
    business_type: "shop",
    website: "https://flandria.co.za",
    email: "info@flandria.co.za",
    phone: "+27 21 887 1533",
    address: "Stelmark Centre, cnr Banghoek Ave & Andringa St",
    city: "Stellenbosch",
    province: "Western Cape",
    postal_code: "7600",
    brands_stocked: [],
    services: ["Bike sales", "Workshop", "Parts & accessories", "Gas refills", "Locksmith"],
    location_lat: -33.9328,
    location_lng: 18.8608,
  },
  {
    name: "Hellsend Bike Shop",
    slug: "hellsend-bike-shop",
    description: "Premier mountain bike destination on Dorp Street, Stellenbosch. Official Trek retailer stocking electric, mountain, road and gravel bikes. Expert repair and maintenance workshop on-site. Part of the Hellsend Bike Compound, home to Commencal South Africa.",
    business_type: "shop",
    website: "https://www.trekbikes.com/za/en_ZA/store/373780/",
    email: null,
    phone: "021 887 3417",
    address: "59 Dorp Street",
    city: "Stellenbosch",
    province: "Western Cape",
    postal_code: "7600",
    brands_stocked: ["Trek", "Commencal"],
    services: ["Bike sales", "E-bikes", "Workshop", "MTB", "Road bikes", "Gravel bikes"],
    location_lat: -33.9360,
    location_lng: 18.8623,
  },
  {
    name: "Commencal South Africa",
    slug: "commencal-south-africa",
    description: "Official Commencal brand showroom and headquarters for South Africa, located at the Hellsend Bike Compound in Stellenbosch. Showcases the latest Commencal mountain bikes with a full-service workshop, demo centre and direct brand support.",
    business_type: "brand",
    website: "https://commencal-store.co.za",
    email: null,
    phone: "+27 21 887 3417",
    address: "Hellsend Bike Compound, 59 Dorp Street",
    city: "Stellenbosch",
    province: "Western Cape",
    postal_code: "7600",
    brands_stocked: ["Commencal"],
    services: ["Brand showroom", "Demo centre", "Workshop", "Direct sales"],
    location_lat: -33.9360,
    location_lng: 18.8623,
  },
  {
    name: "Mason's Bike Inn",
    slug: "masons-bike-inn",
    description: "Full-service bike shop in Eikestad Mall, Stellenbosch. Stocks GT, Schwinn, Mongoose, Merida and Avalanche. Experienced mechanics, free bike set-up with every service, and a convenient collect & drop-off facility. Home bike repair service available by appointment.",
    business_type: "shop",
    website: null,
    email: null,
    phone: null,
    address: "No 7 Beyers Walk, Eikestad Mall",
    city: "Stellenbosch",
    province: "Western Cape",
    postal_code: "7600",
    brands_stocked: ["GT", "Schwinn", "Mongoose", "Merida", "Avalanche"],
    services: ["Bike sales", "Workshop", "Collect & drop-off", "Home repair service"],
    location_lat: -33.9375,
    location_lng: 18.8597,
  },

  // ── TOUR OPERATORS ──────────────────────────────────────────────────────
  {
    name: "Ride In Bike Hire & Tours",
    slug: "ride-in-stellenbosch",
    description: "Stellenbosch's leading bike rental and guided tour company. Huge fleet including e-bikes, full-suspension MTB, hardtail, gravel, road and town bikes. Two locations: Black Horse Centre in town and Jonkershoek for trail rides. Pre-booking recommended.",
    business_type: "tour_operator",
    website: "https://ridein.co.za",
    email: "gavin@ridein.co.za",
    phone: "+27 79 576 0548",
    address: "The Black Horse Centre, cnr Mark St & Dorp St",
    city: "Stellenbosch",
    province: "Western Cape",
    postal_code: "7600",
    brands_stocked: [],
    services: ["Bike rental", "E-bike rental", "Guided tours", "MTB trails", "Jonkershoek rides"],
    location_lat: -33.9340,
    location_lng: 18.8631,
  },
  {
    name: "Bikes n Wines",
    slug: "bikes-n-wines-stellenbosch",
    description: "Unique wine and cycling experience based at Skilpadvlei Farm on the Polkadraai Road. Guided e-bike and MTB tours through Stellenbosch vineyards with wine tastings and gourmet lunches at award-winning estates. Half-day and full-day options for all fitness levels.",
    business_type: "tour_operator",
    website: "https://bikesnwines.com",
    email: null,
    phone: "+27 21 823 8790",
    address: "Skilpadvlei Farm, M12 Polkadraai Road",
    city: "Stellenbosch",
    province: "Western Cape",
    postal_code: "7604",
    brands_stocked: [],
    services: ["E-bike tours", "MTB tours", "Wine tasting rides", "Guided tours", "Gourmet cycling"],
    location_lat: -33.9780,
    location_lng: 18.8020,
  },
  {
    name: "Cape Vélo",
    slug: "cape-velo-stellenbosch",
    description: "Guided cycling tours and premium bike rental in Stellenbosch and the Cape Winelands. Road, mountain and gravel bike options for individuals and groups. Bespoke winelands cycling experiences tailored to skill level and interests.",
    business_type: "tour_operator",
    website: "https://capevelo.com",
    email: "info@capevelo.com",
    phone: "+27 76 111 4657",
    address: "Stellenbosch",
    city: "Stellenbosch",
    province: "Western Cape",
    postal_code: "7600",
    brands_stocked: [],
    services: ["Guided tours", "Bike rental", "Road cycling", "MTB tours", "Gravel tours", "Winelands rides"],
    location_lat: -33.9349,
    location_lng: 18.8601,
  },

  // ── EVENT ORGANISERS ────────────────────────────────────────────────────
  {
    name: "Weekend Warrior Stellenbosch",
    slug: "weekend-warrior-stellenbosch",
    description: "Family-focused two-day MTB stage race at Devonbosch in Stellenbosch. One of the Cape Winelands' most popular cycling weekends, combining competitive racing with scenic Stellenbosch trails. Open to all categories including families and recreational riders.",
    business_type: "event_organiser",
    website: "https://www.weekend-warrior.co.za",
    email: null,
    phone: null,
    address: "Devonbosch, Stellenbosch",
    city: "Stellenbosch",
    province: "Western Cape",
    postal_code: "7600",
    brands_stocked: [],
    services: ["Stage race", "MTB events", "Family cycling", "Two-day events"],
    location_lat: -33.9100,
    location_lng: 18.8350,
  },
  {
    name: "Wine Lands Cycling Club",
    slug: "wine-lands-cycling-club",
    description: "One of South Africa's largest cycling clubs with over 2,000 members. Manages 180+ km of MTB trails across iconic wine farms at the foot of the Helderberg mountains. Founding member of Wine Lands Trails, the regional trail network. Caters to road and MTB riders at all levels.",
    business_type: "event_organiser",
    website: "https://winelandscyclingclub.co.za",
    email: null,
    phone: null,
    address: "Helderberg, Stellenbosch",
    city: "Stellenbosch",
    province: "Western Cape",
    postal_code: "7600",
    brands_stocked: [],
    services: ["MTB trail access", "Club rides", "Trail building", "Road cycling", "Day permits"],
    opening_year: 2004,
    location_lat: -34.0250,
    location_lng: 18.8420,
  },

  // ── SERVICE CENTER ──────────────────────────────────────────────────────
  {
    name: "Canyon Café Stellenbosch",
    slug: "canyon-cafe-stellenbosch",
    description: "Canyon Bicycles SA powerseller and showroom in Stellenbosch with an attached workshop, coffee bar, rental bikes and guided tours. SOX Footwear stockist and full range of Canyon spare parts, clothing and accessories. The go-to spot for Canyon riders in the Winelands.",
    business_type: "shop",
    website: "https://canyoncafe.co.za",
    email: null,
    phone: null,
    address: "Stellenbosch",
    city: "Stellenbosch",
    province: "Western Cape",
    postal_code: "7600",
    brands_stocked: ["Canyon", "SOX Footwear"],
    services: ["Bike sales", "Workshop", "Bike rental", "Guided tours", "Coffee bar", "Parts & accessories"],
    location_lat: -33.9350,
    location_lng: 18.8620,
  },
];

async function run() {
  console.log(`\n🚴 Seeding ${businesses.length} Stellenbosch businesses...\n`);
  let added = 0, skipped = 0;

  for (const b of businesses) {
    const existing = await sql`SELECT id FROM businesses WHERE slug = ${b.slug}`;
    if (existing.length > 0) {
      console.log(`  ⏭  SKIP: ${b.name} (slug exists)`);
      skipped++;
      continue;
    }

    await sql`
      INSERT INTO businesses (
        id, name, slug, description, business_type,
        website, email, phone,
        address, city, province, postal_code,
        brands_stocked, services,
        opening_year, location_lat, location_lng,
        is_verified, is_premium,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        ${b.name}, ${b.slug}, ${b.description}, ${b.business_type}::business_type,
        ${b.website ?? null}, ${b.email ?? null}, ${b.phone ?? null},
        ${b.address}, ${b.city}, ${b.province}, ${b.postal_code ?? null},
        ${b.brands_stocked as string[]}, ${b.services as string[]},
        ${(b as any).opening_year ?? null}, ${b.location_lat ?? null}, ${b.location_lng ?? null},
        false, false,
        NOW(), NOW()
      )
    `;
    console.log(`  ✓ ${b.name}`);
    added++;
  }

  const total = await sql`SELECT COUNT(*) AS count FROM businesses WHERE city = 'Stellenbosch'`;
  const grandTotal = await sql`SELECT COUNT(*) AS count FROM businesses`;
  console.log(`\n${"─".repeat(50)}`);
  console.log(`✅ Done: ${added} added | ${skipped} skipped`);
  console.log(`📊 Stellenbosch total: ${(total[0] as any).count}`);
  console.log(`📊 All businesses total: ${(grandTotal[0] as any).count}`);
  process.exit(0);
}

run().catch((e) => { console.error("Fatal:", e); process.exit(1); });
