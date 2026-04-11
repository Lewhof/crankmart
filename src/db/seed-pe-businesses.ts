/**
 * Seed Port Elizabeth / Gqeberha cycling businesses
 * Run: DATABASE_URL="..." npx tsx src/db/seed-pe-businesses.ts
 */
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const businesses = [
  // ── SHOPS ───────────────────────────────────────────────────────────────
  {
    name: "Coimbra Cycle Centre",
    slug: "coimbra-cycle-centre",
    description: "The oldest independent cycling dealer in Port Elizabeth, established in 1966. Voted the top bike shop in the Eastern Cape. Stocks Santa Cruz, Scott, Cube and more. Full workshop, bike fitting, and a second branch in St Francis Bay.",
    business_type: "shop",
    website: "https://coimbracycles.co.za",
    email: "info@coimbracycles.co.za",
    phone: "+27 41 581 3310",
    address: "87 Main Road, Walmer",
    city: "Port Elizabeth",
    province: "Eastern Cape",
    postal_code: "6070",
    brands_stocked: ["Santa Cruz", "Scott", "Cube"],
    services: ["Bike sales", "Workshop", "Bike fitting", "Parts & accessories"],
    opening_year: 1966,
    location_lat: -33.9800,
    location_lng: 25.5819,
  },
  {
    name: "CycloPro PE",
    slug: "cyclopro-pe",
    description: "One of Port Elizabeth's largest cycle outlets, founded 40 years ago. Preferred Trek retailer and agent for Giant, Cannondale and GT. Full-service workshop, specialist bike fitting using ErgoFit and Shimano systems, and expert wheel building.",
    business_type: "shop",
    website: "https://www.cyclopro.co.za",
    email: "info@cyclopro.co.za",
    phone: "041 368 7244",
    address: "Shop 8, Walmer Downs Family Centre, William Moffett Expressway, Walmer Downs",
    city: "Port Elizabeth",
    province: "Eastern Cape",
    postal_code: "6045",
    brands_stocked: ["Trek", "Giant", "Cannondale", "GT", "Avalanche"],
    services: ["Bike sales", "Workshop", "Bike fitting", "Wheel building", "Parts & accessories"],
    opening_year: 1984,
    location_lat: -33.9974,
    location_lng: 25.5685,
  },
  {
    name: "Action Cycles",
    slug: "action-cycles-pe",
    description: "One of Port Elizabeth's most established bike shops, the leading Specialized retailer in Nelson Mandela Bay. Offers Retül bike fitting, a fully equipped workshop using Hub Tiger service coordination, and a wide range of Specialized road, MTB and e-bikes.",
    business_type: "shop",
    website: "https://actioncycles.co.za",
    email: null,
    phone: "+27 41 581 6499",
    address: "Walmer, Port Elizabeth",
    city: "Port Elizabeth",
    province: "Eastern Cape",
    postal_code: "6070",
    brands_stocked: ["Specialized"],
    services: ["Bike sales", "Workshop", "Retül bike fitting", "E-bikes", "Online store"],
    location_lat: -33.9784,
    location_lng: 25.5766,
  },
  {
    name: "Wayne Pheiffer Cycles",
    slug: "wayne-pheiffer-cycles",
    description: "Two-location bike shop in Port Elizabeth (Linton Grange and Humewood) with over 25 years serving local cyclists. Wide range of bikes, clothing, accessories, helmets and nutrition supplements. Friendly service and expert workshop repairs.",
    business_type: "shop",
    website: "https://waynepheiffercycles.co.za",
    email: null,
    phone: "041 360 7500",
    address: "Spar Centre, Cape Road, Linton Grange",
    city: "Port Elizabeth",
    province: "Eastern Cape",
    postal_code: "6025",
    brands_stocked: ["Argon 18", "Avalanche"],
    services: ["Bike sales", "Workshop", "Clothing & accessories", "Nutrition"],
    location_lat: -33.9571,
    location_lng: 25.5405,
  },
  {
    name: "Bike & Pedal",
    slug: "bike-and-pedal-pe",
    description: "Local bike shop in Newton Park, Port Elizabeth, offering a range of bicycles, parts and accessories including Volcan, Maxxis and Avalanche products. Workshop repairs and servicing available.",
    business_type: "shop",
    website: "https://bikeandpedal.co.za",
    email: "info@bikeandpedal.co.za",
    phone: "+27 41 364 0110",
    address: "65 4th Avenue, Newton Park",
    city: "Port Elizabeth",
    province: "Eastern Cape",
    postal_code: "6045",
    brands_stocked: ["Volcan", "Maxxis", "Avalanche"],
    services: ["Bike sales", "Workshop", "Parts & accessories"],
    location_lat: -33.9610,
    location_lng: 25.5492,
  },

  // ── SERVICE CENTERS ─────────────────────────────────────────────────────
  {
    name: "Crafted Cycles",
    slug: "crafted-cycles-gqeberha",
    description: "Boutique bicycle workshop in South End, Gqeberha. Owner Jamie Loots holds international mechanic certifications and a professional MTB background. One-on-one customer-to-mechanic experience, pre-owned bike sales, and SA distributor for ONZA tyres.",
    business_type: "service_center",
    website: "https://www.craftedcycles.co.za",
    email: null,
    phone: null,
    address: "27 Webber Street, South End",
    city: "Port Elizabeth",
    province: "Eastern Cape",
    postal_code: "6001",
    brands_stocked: ["ONZA"],
    services: ["Workshop", "Bike servicing", "Pre-owned bike sales", "Components", "Accessories"],
    location_lat: -33.9637,
    location_lng: 25.6107,
  },
  {
    name: "RevolutionCor Bike Skills",
    slug: "revolutioncor-pe",
    description: "MTB skills instructor and coach based in Port Elizabeth. Neal Corbett offers personalized mountain bike coaching, bicycle fitting and guided tours. Helping riders of all levels improve their technique and confidence on the trail.",
    business_type: "service_center",
    website: "https://revolutioncor.co.za",
    email: null,
    phone: null,
    address: "Port Elizabeth",
    city: "Port Elizabeth",
    province: "Eastern Cape",
    postal_code: "6001",
    brands_stocked: [],
    services: ["MTB coaching", "Bike fitting", "Tour guiding", "Skills instruction"],
    location_lat: -33.9600,
    location_lng: 25.6022,
  },

  // ── EVENT ORGANISERS ────────────────────────────────────────────────────
  {
    name: "The Herald Cycle Tour",
    slug: "herald-cycle-tour",
    description: "Port Elizabeth's iconic annual cycling event held at Pollok Beach, Summerstrand. Offers competitive road races, MTB races and a Quest multi-discipline event. One of the Eastern Cape's most popular cycling days for families, recreational and competitive riders.",
    business_type: "event_organiser",
    website: "https://heraldcycletour.co.za",
    email: null,
    phone: null,
    address: "Pollok Beach, Summerstrand",
    city: "Port Elizabeth",
    province: "Eastern Cape",
    postal_code: "6001",
    brands_stocked: [],
    services: ["Road racing", "MTB racing", "Multi-discipline events", "Family cycling events"],
    location_lat: -34.0097,
    location_lng: 25.6565,
  },
  {
    name: "FatTracks MTB Club",
    slug: "fattracks-mtb-club",
    description: "The oldest mountain bike club in South Africa, established in 1989 in Port Elizabeth. FatTracks builds and maintains free trails in the Baakens Valley and across Nelson Mandela Bay. Hosts group rides, MTB events and the MTB component of the Herald Cycle Tour.",
    business_type: "event_organiser",
    website: "https://fattracks.co.za",
    email: null,
    phone: null,
    address: "Baakens Valley, Port Elizabeth",
    city: "Port Elizabeth",
    province: "Eastern Cape",
    postal_code: "6001",
    brands_stocked: [],
    services: ["MTB trail building", "Group rides", "Events", "Trail access"],
    opening_year: 1989,
    location_lat: -33.9714,
    location_lng: 25.5989,
  },

  // ── SERVICE / COACHING ──────────────────────────────────────────────────
  {
    name: "OnYourBike Coaching",
    slug: "onyourbike-coaching-pe",
    description: "Personal training and sports coaching based in Port Elizabeth, specialising in multisport (triathlon) and cycling. Steven Shirley offers tailored training programmes, race nutrition guidance and equipment advice for cyclists and triathletes.",
    business_type: "service_center",
    website: "https://onyourbike.co.za",
    email: null,
    phone: null,
    address: "Port Elizabeth",
    city: "Port Elizabeth",
    province: "Eastern Cape",
    postal_code: "6001",
    brands_stocked: [],
    services: ["Cycling coaching", "Triathlon coaching", "Training programmes", "Race nutrition"],
    location_lat: -33.9580,
    location_lng: 25.5970,
  },
];

async function run() {
  console.log(`\n🚴 Seeding ${businesses.length} Port Elizabeth businesses...\n`);
  let added = 0, skipped = 0;

  for (const b of businesses) {
    // Check if slug already exists
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

  const total = await sql`SELECT COUNT(*) AS count FROM businesses WHERE city = 'Port Elizabeth'`;
  console.log(`\n${"─".repeat(50)}`);
  console.log(`✅ Done: ${added} added | ${skipped} skipped`);
  console.log(`📊 Port Elizabeth total: ${(total[0] as any).count}`);
  process.exit(0);
}

run().catch((e) => { console.error("Fatal:", e); process.exit(1); });
