/**
 * Seed Bloemfontein / Free State cycling businesses
 * Run: DATABASE_URL="..." npx tsx src/db/seed-bloemfontein-businesses.ts
 */
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

const businesses = [
  // ── SHOPS ───────────────────────────────────────────────────────────────
  {
    name: "Cycle World Bloemfontein",
    slug: "cycle-world-bloemfontein",
    description: "Established bicycle specialty store and registered cycling club in Bloemfontein. Offers new and select pre-owned bikes, trusted brand parts, accessories and clothing. Full workshop for minor and major repairs. Also organises club rides and local events including the Sungazer 100 Miler.",
    business_type: "shop",
    website: "https://cycleworld.store",
    email: "cycleworld@lantic.net",
    phone: "051 448 0422",
    address: "141 Zastron Street",
    city: "Bloemfontein",
    province: "Free State",
    postal_code: "9305",
    brands_stocked: [],
    services: ["Bike sales", "Workshop", "Pre-owned bikes", "Parts & accessories", "Club rides"],
    location_lat: -29.1088,
    location_lng: 26.2142,
  },
  {
    name: "Enduroplanet",
    slug: "enduroplanet-bloemfontein",
    description: "Official Trek Bikes retailer in the heart of Bloemfontein. Stocks new and pre-owned bikes, quality parts, accessories and apparel. Experienced workshop team handles all maintenance and repairs. Regular shop rides and community events.",
    business_type: "shop",
    website: "https://enduroplanet.co.za",
    email: null,
    phone: "076 551 2783",
    address: "Shop 17A, Pretty Gardens Gym, Du Plessis Avenue, Langenhovenpark",
    city: "Bloemfontein",
    province: "Free State",
    postal_code: "9330",
    brands_stocked: ["Trek"],
    services: ["Bike sales", "Workshop", "Pre-owned bikes", "Parts & accessories", "Shop rides"],
    location_lat: -29.0974,
    location_lng: 26.1762,
  },
  {
    name: "Fastlane Cycles",
    slug: "fastlane-cycles-bloemfontein",
    description: "Specialized retailer in Bloemfontein focused on community and service. Full range of Specialized road, MTB, gravel, kids and e-bikes (Turbo Levo, Turbo Creo, Turbo Vado). Workshop and bike fitting services, CSA-registered cycling club, and a coffee shop — Coffee Lane — on site.",
    business_type: "shop",
    website: "https://fastlanecycles.co.za",
    email: null,
    phone: "051 285 0626",
    address: "Kenneth Kaunda & Christo Groenewald, Helicon Heights",
    city: "Bloemfontein",
    province: "Free State",
    postal_code: "9301",
    brands_stocked: ["Specialized"],
    services: ["Bike sales", "E-bikes", "Workshop", "Bike fitting", "Coffee shop", "Club rides"],
    location_lat: -29.0868,
    location_lng: 26.1721,
  },
  {
    name: "Cyclotech Cycles Bloemfontein",
    slug: "cyclotech-cycles-bloemfontein",
    description: "Bicycle shop at Northridge Mall in Bloemfontein offering high-quality bikes, gear and accessories. Hosts shop events including tech talks and demonstration days for the local cycling community.",
    business_type: "shop",
    website: null,
    email: null,
    phone: "051 433 4968",
    address: "Shop 39, Northridge Mall, Kenneth Kaunda Road",
    city: "Bloemfontein",
    province: "Free State",
    postal_code: "9301",
    brands_stocked: [],
    services: ["Bike sales", "Parts & accessories", "Tech talks", "Demo days"],
    location_lat: -29.0825,
    location_lng: 26.1698,
  },
  {
    name: "The Bike Shop Bloemfontein",
    slug: "the-bike-shop-bloemfontein",
    description: "Bloemfontein bike shop with over 20 years serving local cyclists. Stocks top-quality new and used bikes, accessories, clothing and gear. Expert advice and nationwide shipping available.",
    business_type: "shop",
    website: "https://thebikeshop.digivalie.co.za",
    email: null,
    phone: null,
    address: "64 Nelson Mandela Drive",
    city: "Bloemfontein",
    province: "Free State",
    postal_code: "9301",
    brands_stocked: [],
    services: ["Bike sales", "Pre-owned bikes", "Parts & accessories", "Nationwide shipping"],
    location_lat: -29.1172,
    location_lng: 26.2198,
  },

  // ── SERVICE CENTERS / COACHING ──────────────────────────────────────────
  {
    name: "SPC Academy",
    slug: "spc-academy-bloemfontein",
    description: "Elite endurance performance centre at Pretty Gardens Lifestyle Centre in Bloemfontein. Expert coaching for cyclists, runners and triathletes — road, MTB, skills development, endurance training, gym and Wahoo Indoor Studio sessions. Community-focused and performance-driven.",
    business_type: "service_center",
    website: "https://www.spcacademy.life",
    email: null,
    phone: null,
    address: "Shop 17A & 17B, Pretty Gardens Lifestyle Centre, Du Plessis Avenue, Langenhovenpark",
    city: "Bloemfontein",
    province: "Free State",
    postal_code: "9330",
    brands_stocked: [],
    services: ["Cycling coaching", "MTB coaching", "Triathlon coaching", "Endurance training", "Indoor studio", "Gym"],
    location_lat: -29.0974,
    location_lng: 26.1762,
  },
  {
    name: "DriveTrain Academy",
    slug: "drivetrain-academy",
    description: "Personalised cycling coaching with a holistic, long-term athlete development approach. Head coach Tyronne White holds a UCI Level 1 certification with expertise across road, MTB, gravel and track disciplines. Remote and in-person coaching across South Africa.",
    business_type: "service_center",
    website: "https://drivetrainacademy.com",
    email: null,
    phone: null,
    address: "Bloemfontein",
    city: "Bloemfontein",
    province: "Free State",
    postal_code: "9301",
    brands_stocked: [],
    services: ["Cycling coaching", "Road coaching", "MTB coaching", "Gravel coaching", "Remote coaching", "Training plans"],
    location_lat: -29.1200,
    location_lng: 26.2140,
  },

  // ── EVENT ORGANISERS ────────────────────────────────────────────────────
  {
    name: "Free State Cycle Tour",
    slug: "free-state-cycle-tour",
    description: "The Free State's premier road cycling event, organised by the Pedal Power Association. Held at the SA School of Armour, Tempe Military Base in Bloemfontein, with 105 km and 37 km route options. A Premier Seeding Series event for the Cape Town Cycle Tour.",
    business_type: "event_organiser",
    website: "https://pedalpower.org.za/product/free-state-cycle-tour/",
    email: null,
    phone: null,
    address: "SA School of Armour, Tempe Military Base",
    city: "Bloemfontein",
    province: "Free State",
    postal_code: "9301",
    brands_stocked: [],
    services: ["Road cycling events", "Funride", "Competitive racing"],
    location_lat: -29.0833,
    location_lng: 26.2214,
  },
  {
    name: "Sungazer 100 Miler MTB",
    slug: "sungazer-100-miler",
    description: "The Sungazer 100 Miler is Bloemfontein's flagship mountain bike endurance race, part of the Oryx Endurance series. Caters to e-bike, gravel and traditional MTB disciplines across 100 miles of Free State terrain. A must-do event on the SA MTB calendar.",
    business_type: "event_organiser",
    website: "https://www.oryxendurance.co.za/sungazer.html",
    email: null,
    phone: null,
    address: "Bloemfontein",
    city: "Bloemfontein",
    province: "Free State",
    postal_code: "9301",
    brands_stocked: [],
    services: ["MTB events", "Gravel racing", "E-bike events", "Endurance racing"],
    location_lat: -29.0950,
    location_lng: 26.1800,
  },
  {
    name: "Bloemfontein Cycle Club",
    slug: "bloemfontein-cycle-club",
    description: "One of the established cycling clubs in the Free State, catering to road and MTB riders in and around Bloemfontein. Organises regular club rides, races and social cycling events for members of all abilities.",
    business_type: "event_organiser",
    website: null,
    email: null,
    phone: null,
    address: "Bloemfontein",
    city: "Bloemfontein",
    province: "Free State",
    postal_code: "9301",
    brands_stocked: [],
    services: ["Club rides", "Road racing", "MTB events", "Social cycling"],
    location_lat: -29.1100,
    location_lng: 26.2100,
  },
];

async function run() {
  console.log(`\n🚴 Seeding ${businesses.length} Bloemfontein businesses...\n`);
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

  const total = await sql`SELECT COUNT(*) AS count FROM businesses WHERE city = 'Bloemfontein'`;
  const grandTotal = await sql`SELECT COUNT(*) AS count FROM businesses`;
  console.log(`\n${"─".repeat(50)}`);
  console.log(`✅ Done: ${added} added | ${skipped} skipped`);
  console.log(`📊 Bloemfontein total: ${(total[0] as any).count}`);
  console.log(`📊 All businesses total: ${(grandTotal[0] as any).count}`);
  process.exit(0);
}

run().catch((e) => { console.error("Fatal:", e); process.exit(1); });
