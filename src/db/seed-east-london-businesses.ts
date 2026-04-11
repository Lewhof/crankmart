/**
 * Seed East London cycling businesses
 * Run: DATABASE_URL="..." npx tsx src/db/seed-east-london-businesses.ts
 */
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

const businesses = [
  // ── SHOPS ───────────────────────────────────────────────────────────────
  {
    name: "Cycle HQ East London",
    slug: "cycle-hq-east-london",
    description: "East London's dedicated cycling hub in Transkei Road, Beacon Bay. Stocks a wide variety of bicycle brands, accessories, clothing, spares and supplements. Full workshop offering major and minor services, bike setups and repairs. Also serves as a point for Funtrax MTB Club memberships.",
    business_type: "shop",
    website: null,
    email: null,
    phone: "043 735 1137",
    address: "Shop 4, Clifton Close, Transkei Road",
    city: "East London",
    province: "Eastern Cape",
    postal_code: "5241",
    brands_stocked: [],
    services: ["Bike sales", "Workshop", "Bike setup", "Parts & accessories", "Clothing", "Supplements"],
    location_lat: -32.9730,
    location_lng: 27.9340,
  },
  {
    name: "East London Cycles",
    slug: "east-london-cycles",
    description: "Established bike shop with two locations in East London (Argyle St and Vincent). Full range of bicycles, maintenance services, parts, clothing, accessories and replacement components. Long-serving the local cycling community.",
    business_type: "shop",
    website: null,
    email: "ahand@telkomsa.net",
    phone: "+27 43 743 3315",
    address: "12 Argyle Street",
    city: "East London",
    province: "Eastern Cape",
    postal_code: "5201",
    brands_stocked: [],
    services: ["Bike sales", "Workshop", "Parts & accessories", "Clothing", "Spares"],
    location_lat: -33.0148,
    location_lng: 27.9063,
  },
  {
    name: "Bike Yard East London",
    slug: "bike-yard-east-london",
    description: "Trek Bikes preferred retailer in Beacon Bay, East London. Based at Aloe Industrial Park on Bonza Bay Road, stocking the full Trek range including road, mountain, gravel and electric bikes with a full workshop and expert staff.",
    business_type: "shop",
    website: "https://www.trekbikes.com/za/en_ZA/store/623944/",
    email: null,
    phone: "082 896 0115",
    address: "Unit 8, Aloe Industrial Park, Motor City Bonza Bay Road, Beacon Bay",
    city: "East London",
    province: "Eastern Cape",
    postal_code: "5241",
    brands_stocked: ["Trek"],
    services: ["Bike sales", "Workshop", "E-bikes", "Road bikes", "MTB", "Gravel bikes"],
    location_lat: -32.9760,
    location_lng: 27.9210,
  },

  // ── SERVICE CENTERS ─────────────────────────────────────────────────────
  {
    name: "Getafix Cycles",
    slug: "getafix-cycles-east-london",
    description: "East London's specialist bicycle service centre offering a convenient Collect-Repair-Deliver service in partnership with BMC. Expert bike fitting, race support and full workshop repairs. Serving road cyclists and MTB riders across the Buffalo City area.",
    business_type: "service_center",
    website: "https://www.getafixcycles.com",
    email: "craig@getafixcycles.com",
    phone: "083 452 0242",
    address: "East London",
    city: "East London",
    province: "Eastern Cape",
    postal_code: "5201",
    brands_stocked: ["BMC"],
    services: ["Collect-Repair-Deliver", "Bike fitting", "Race support", "Workshop", "Kids cycling clinic"],
    location_lat: -33.0100,
    location_lng: 27.9050,
  },
  {
    name: "Peak Performance Coaching EL",
    slug: "peak-performance-coaching-el",
    description: "UCI Level 2 certified coaching by Eben Hartslief, based in East London. Specialises in triathlon, road cycling, MTB marathon and cross-country racing. Offers 1-on-1 coaching, consultations and training camps for athletes of all levels.",
    business_type: "service_center",
    website: null,
    email: null,
    phone: null,
    address: "East London",
    city: "East London",
    province: "Eastern Cape",
    postal_code: "5201",
    brands_stocked: [],
    services: ["Cycling coaching", "Triathlon coaching", "MTB coaching", "Training camps", "Race preparation"],
    location_lat: -33.0200,
    location_lng: 27.9100,
  },

  // ── EVENT ORGANISERS ────────────────────────────────────────────────────
  {
    name: "K2K MTB East London",
    slug: "k2k-mtb-east-london",
    description: "The Kwelera to Kei annual mountain bike event — one of the Eastern Cape's most popular MTB races. Offers a 70km full route and a 33km Mini K2K, starting from Crossways Village on the East Coast Resorts Road. Scenic coastal and valley terrain.",
    business_type: "event_organiser",
    website: "https://www.k2kmtb.co.za",
    email: null,
    phone: null,
    address: "Crossways Village, East Coast Resorts Road",
    city: "East London",
    province: "Eastern Cape",
    postal_code: "5201",
    brands_stocked: [],
    services: ["MTB events", "70km race", "33km race", "Coastal trails"],
    location_lat: -32.9800,
    location_lng: 28.0200,
  },
  {
    name: "Imana Wild Ride",
    slug: "imana-wild-ride",
    description: "South Africa's original mountain biking stage race — four days, nearly 200km along the Wild Coast starting near the Great Kei River, approximately 80km north of East London. An iconic bucket-list event combining epic trails, coastal scenery and Wild Coast culture.",
    business_type: "event_organiser",
    website: "https://www.imanawildride.co.za",
    email: null,
    phone: null,
    address: "Great Kei River Mouth, Wild Coast",
    city: "East London",
    province: "Eastern Cape",
    postal_code: "5201",
    brands_stocked: [],
    services: ["MTB stage race", "4-day event", "Wild Coast trails", "Endurance events"],
    location_lat: -32.6700,
    location_lng: 28.3700,
  },
  {
    name: "Funtrax MTB Club",
    slug: "funtrax-mtb-club-east-london",
    description: "East London's leading mountain bike club, organising regular group rides, MTB events and trail work days across the Buffalo City area. Active in promoting MTB in the region and maintaining local trails. Memberships available through Cycle HQ.",
    business_type: "event_organiser",
    website: null,
    email: "funtrax@mweb.co.za",
    phone: null,
    address: "East London",
    city: "East London",
    province: "Eastern Cape",
    postal_code: "5201",
    brands_stocked: [],
    services: ["MTB group rides", "MTB events", "Trail maintenance", "Club membership"],
    location_lat: -33.0000,
    location_lng: 27.9100,
  },
  {
    name: "Day Trippers Eastern Cape MTB",
    slug: "day-trippers-eastern-cape-mtb",
    description: "Multi-day Eastern Cape MTB tour operator offering wildlife and adventure cycling experiences through the Eastern Cape, concluding in East London. Guided tours through rugged terrain with opportunities to spot the Big Five. Tailored for all skill levels.",
    business_type: "tour_operator",
    website: "https://daytrippers.co.za",
    email: null,
    phone: null,
    address: "East London",
    city: "East London",
    province: "Eastern Cape",
    postal_code: "5201",
    brands_stocked: [],
    services: ["Guided MTB tours", "Multi-day tours", "Wildlife cycling", "Eastern Cape tours"],
    location_lat: -33.0100,
    location_lng: 27.9100,
  },
];

async function run() {
  console.log(`\n🚴 Seeding ${businesses.length} East London businesses...\n`);
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
        ${null}, ${b.location_lat ?? null}, ${b.location_lng ?? null},
        false, false,
        NOW(), NOW()
      )
    `;
    console.log(`  ✓ ${b.name}`);
    added++;
  }

  const total = await sql`SELECT COUNT(*) AS count FROM businesses WHERE city = 'East London'`;
  const grandTotal = await sql`SELECT COUNT(*) AS count FROM businesses`;
  console.log(`\n${"─".repeat(50)}`);
  console.log(`✅ Done: ${added} added | ${skipped} skipped`);
  console.log(`📊 East London total: ${(total[0] as any).count}`);
  console.log(`📊 All businesses total: ${(grandTotal[0] as any).count}`);
  process.exit(0);
}

run().catch((e) => { console.error("Fatal:", e); process.exit(1); });
