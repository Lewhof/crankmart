/**
 * Seed Durban / KZN cycling businesses
 * Run: DATABASE_URL="..." npx tsx src/db/seed-durban-businesses.ts
 */
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

const businesses = [
  // ── SHOPS ───────────────────────────────────────────────────────────────
  {
    name: "Cyclesphere Durban",
    slug: "cyclesphere-durban",
    description: "KZN's biggest Giant Bicycles stockist, based in Morningside, Durban. Full range of Giant road, MTB, gravel, women's and kids bikes. Large accessories department and an online-bookable workshop for services. Multiple contact lines for sales, orders and workshop.",
    business_type: "shop",
    website: "https://www.cyclesphere.co.za",
    email: "sales@cyclesphere.co.za",
    phone: "031 312 2559",
    address: "2 Gordon Road, Morningside",
    city: "Durban",
    province: "KwaZulu-Natal",
    postal_code: "4001",
    brands_stocked: ["Giant"],
    services: ["Bike sales", "Workshop", "Parts & accessories", "Online booking"],
    location_lat: -29.8324,
    location_lng: 31.0096,
  },
  {
    name: "DVH Cycles Durban",
    slug: "dvh-cycles-durban",
    description: "Performance cycling specialist at Broadway Shopping Centre, Durban North. Stocks Zipp, Reynolds, Black Inc, Vittoria and Pirelli wheels and tyres. Full range of apparel, components, indoor trainers and cycling nutrition. Workshop and repair services on-site.",
    business_type: "shop",
    website: "https://dvhcycles.co.za",
    email: "sales@dvhcycles.co.za",
    phone: "+27 83 546 1335",
    address: "Shop 5, Broadway Shopping Centre, Swapo Road, Durban North",
    city: "Durban",
    province: "KwaZulu-Natal",
    postal_code: "4051",
    brands_stocked: ["Zipp", "Reynolds", "Vittoria", "Pirelli"],
    services: ["Bike sales", "Workshop", "Wheels & tyres", "Indoor trainers", "Nutrition"],
    location_lat: -29.7827,
    location_lng: 31.0279,
  },
  {
    name: "Republic Sport Adventure Durban",
    slug: "republic-sport-adventure-durban",
    description: "Scott bicycles dealer in Durban North. Stocks Scott road, MTB and gravel bikes, plus Silverback, Axis and Avalanche. Dedicated bike service department headed by Toni Pedro. Also carries paddling accessories.",
    business_type: "shop",
    website: "https://bicyclesouth.co.za/listings/republic-sport-adventure/",
    email: null,
    phone: "+27 60 977 0894",
    address: "2 Lothian Road, Durban North",
    city: "Durban",
    province: "KwaZulu-Natal",
    postal_code: "4051",
    brands_stocked: ["Scott", "Silverback", "Axis", "Avalanche"],
    services: ["Bike sales", "Workshop", "MTB", "Road bikes", "Paddling accessories"],
    location_lat: -29.7830,
    location_lng: 31.0290,
  },
  {
    name: "Leigh's Cycle Centre Durban",
    slug: "leighs-cycle-centre-durban",
    description: "Premium Umhlanga bike shop specialising in bespoke custom bicycles. Features a dedicated MTB section, road, women's and kids bikes, a professional bike fitting studio and a full service centre. Strong community cycling club with regular rides.",
    business_type: "shop",
    website: "https://cyclecentre.co.za",
    email: "susan@cyclecentre.co.za",
    phone: "081 067 1117",
    address: "39 Meridian Drive, Unit 8 Meridian Park, Gateway Umhlanga",
    city: "Durban",
    province: "KwaZulu-Natal",
    postal_code: "4321",
    brands_stocked: [],
    services: ["Custom bikes", "Bike fitting", "Workshop", "Club rides", "MTB", "Road bikes"],
    location_lat: -29.7285,
    location_lng: 31.0783,
  },
  {
    name: "Cycle Specialist",
    slug: "cycle-specialist-durban",
    description: "Trek Bikes preferred retailer at Glen Ashley, Durban. Full range of Trek electric, mountain, road, gravel and kids bikes. Quality equipment and clothing. Friendly expert staff serving the northern Durban cycling community.",
    business_type: "shop",
    website: "https://cyclespecialist.co.za",
    email: null,
    phone: "031 572 5431",
    address: "Rooftop of Eastmans Superspar, 42 Ashley Ave, Glen Ashley",
    city: "Durban",
    province: "KwaZulu-Natal",
    postal_code: "4051",
    brands_stocked: ["Trek"],
    services: ["Bike sales", "E-bikes", "Workshop", "Clothing & gear"],
    location_lat: -29.7950,
    location_lng: 31.0350,
  },

  // ── SERVICE / COACHING ──────────────────────────────────────────────────
  {
    name: "Cadence Cycling Performance",
    slug: "cadence-cycling-durban",
    description: "Durban's dedicated cycling performance centre with studios in Durban North and Hillcrest. Structured training for all levels from beginner to podium — endurance, speed, strength and climbing. Coach-led sessions, indoor training and personalised programmes.",
    business_type: "service_center",
    website: "https://cadencecycling.co.za",
    email: null,
    phone: "031 563 6869",
    address: "Durban North",
    city: "Durban",
    province: "KwaZulu-Natal",
    postal_code: "4051",
    brands_stocked: [],
    services: ["Cycling coaching", "Indoor training", "Endurance training", "Performance coaching", "Group sessions"],
    location_lat: -29.7850,
    location_lng: 31.0300,
  },

  // ── EVENT ORGANISERS ────────────────────────────────────────────────────
  {
    name: "Amashova Durban Classic",
    slug: "amashova-durban-classic",
    description: "South Africa's oldest road cycling classic, held annually from Howick to Durban. Distances of 38km, 65km, 106km and 132km — a true bucket-list race for every South African cyclist. One of the most scenic and iconic events on the SA cycling calendar.",
    business_type: "event_organiser",
    website: "https://www.shova.co.za",
    email: null,
    phone: null,
    address: "Howick to Durban, KwaZulu-Natal",
    city: "Durban",
    province: "KwaZulu-Natal",
    postal_code: "4001",
    brands_stocked: [],
    services: ["Road racing", "38km route", "65km route", "106km route", "132km route"],
    location_lat: -29.8587,
    location_lng: 31.0218,
  },
  {
    name: "East Coast Cycling Club",
    slug: "east-coast-cycling-club",
    description: "One of Durban's oldest, largest and most inclusive cycling clubs. Saturday and Sunday road rides from Suncoast Casino and MTB rides from Cornubia Mall or Sibaya Casino. Multiple pace groups for all abilities — from beginners to elite riders.",
    business_type: "event_organiser",
    website: "https://eccc.co.za",
    email: null,
    phone: null,
    address: "Suncoast Casino, Durban",
    city: "Durban",
    province: "KwaZulu-Natal",
    postal_code: "4001",
    brands_stocked: [],
    services: ["Road rides", "MTB rides", "Club membership", "Group rides", "Racing"],
    location_lat: -29.8480,
    location_lng: 31.0348,
  },
  {
    name: "KAP Sani2C",
    slug: "kap-sani2c",
    description: "One of South Africa's most celebrated MTB stage races — three days from the Sani Pass foothills to the KZN South Coast. Adventure, Race and Non-Stop options. World-class trails through Drakensberg foothills, valleys and indigenous forests with a legendary finish at Scottburgh beach.",
    business_type: "event_organiser",
    website: "https://sani2c.co.za",
    email: null,
    phone: null,
    address: "Underberg to Scottburgh, KwaZulu-Natal",
    city: "Durban",
    province: "KwaZulu-Natal",
    postal_code: "4001",
    brands_stocked: [],
    services: ["MTB stage race", "3-day event", "Adventure category", "Race category"],
    location_lat: -29.9000,
    location_lng: 30.6000,
  },

  // ── TOUR OPERATOR ───────────────────────────────────────────────────────
  {
    name: "Kamberg Cycle Tours",
    slug: "kamberg-cycle-tours",
    description: "Guided e-bike and MTB tours through the KwaZulu-Natal Midlands and Drakensberg foothills. Fully supported tours with accommodation, meals, luggage transfers and backup vehicles. Routes customised to rider ability — from casual to technical. Based near Kamberg, KZN.",
    business_type: "tour_operator",
    website: null,
    email: null,
    phone: null,
    address: "Kamberg, KwaZulu-Natal Midlands",
    city: "Durban",
    province: "KwaZulu-Natal",
    postal_code: "3300",
    brands_stocked: [],
    services: ["Guided MTB tours", "E-bike tours", "Multi-day tours", "Drakensberg rides", "Accommodation included"],
    location_lat: -29.3700,
    location_lng: 29.6500,
  },
];

async function run() {
  console.log(`\n🚴 Seeding ${businesses.length} Durban businesses...\n`);
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

  const total = await sql`SELECT COUNT(*) AS count FROM businesses WHERE city = 'Durban'`;
  const grandTotal = await sql`SELECT COUNT(*) AS count FROM businesses`;
  console.log(`\n${"─".repeat(50)}`);
  console.log(`✅ Done: ${added} added | ${skipped} skipped`);
  console.log(`📊 Durban total: ${(total[0] as any).count}`);
  console.log(`📊 All businesses total: ${(grandTotal[0] as any).count}`);
  process.exit(0);
}

run().catch((e) => { console.error("Fatal:", e); process.exit(1); });
