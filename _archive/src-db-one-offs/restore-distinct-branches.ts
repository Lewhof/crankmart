import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

// These were deleted as "duplicates" but are actually distinct physical locations
const RESTORE = [
  {
    name: "Cycle Lab Fourways",
    slug: "cycle-lab-fourways",
    city: "Johannesburg", province: "Gauteng",
    business_type: "shop",
    website: "https://www.cyclelab.com",
    description: "Cycle Lab's Fourways Johannesburg store. Premium road, MTB, gravel and e-bikes with expert workshop and bike fitting.",
    listing_status: "active"
  },
  {
    name: "Cycle Lab Rosebank",
    slug: "cycle-lab-rosebank",
    city: "Johannesburg", province: "Gauteng",
    business_type: "shop",
    website: "https://www.cyclelab.com",
    description: "Cycle Lab's Rosebank Johannesburg store. Premium bikes, accessories, Retül fitting and workshop services.",
    listing_status: "active"
  },
  {
    name: "DVH Cycles Durban",
    slug: "dvh-cycles-durban",
    city: "Durban", province: "KwaZulu-Natal",
    business_type: "shop",
    website: "https://dvhcycles.co.za",
    description: "DVH Cycles Durban — road, MTB and gravel bikes with full workshop and accessories.",
    listing_status: "active"
  },
  {
    name: "Republic Sport Adventure Durban",
    slug: "republic-sport-durban",
    city: "Durban", province: "KwaZulu-Natal",
    business_type: "shop",
    website: "https://www.republicse.co.za",
    description: "Republic Sport & Adventure Durban — cycling, outdoor gear and adventure sports.",
    listing_status: "active"
  },
];

const PLACEHOLDER = "/images/04-hero-bike-shop.jpg";

async function run() {
  for (const b of RESTORE) {
    const exists = await sql`SELECT id FROM businesses WHERE slug = ${b.slug}`;
    if (exists.length > 0) { console.log(`  already exists: ${b.slug}`); continue; }
    await sql`
      INSERT INTO businesses (name, slug, city, province, business_type, website, description, listing_status, cover_url, created_at, updated_at)
      VALUES (${b.name}, ${b.slug}, ${b.city}, ${b.province}, ${b.business_type}, ${b.website}, ${b.description}, ${b.listing_status}, ${PLACEHOLDER}, NOW(), NOW())
    `;
    console.log(`  ✓ restored: ${b.name}`);
  }

  const total = await sql`SELECT COUNT(*) as n FROM businesses`;
  console.log(`\nTotal: ${(total[0] as any).n}`);
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
