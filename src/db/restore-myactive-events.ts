import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

const PLACEHOLDER_COVER = "https://cyclemart.fibreflow.app/images/events/event-placeholder.jpg";
const COVER = "/images/03-hero-event-startline.jpg";

const EVENTS = [
  { name: "Golden Gate MTB Challenge", slug: "golden-gate-mtb-challenge", city: "Clarens", province: "Free State" },
  { name: "Sneeuberg Crawl MTB", slug: "sneeuberg-crawl-mtb", city: "Murraysburg", province: "Western Cape" },
  { name: "Houw Hoek MTB Tour", slug: "houw-hoek-mtb-tour", city: "Hermanus", province: "Western Cape" },
  { name: "The Canola Roller", slug: "the-canola-roller", city: "Greyton", province: "Western Cape" },
  { name: "Tsitsikamma 3-Day MTB", slug: "tsitsikamma-3day-mtb", city: "Plettenberg Bay", province: "Western Cape" },
  { name: "Bay by Bike MTB Race", slug: "bay-by-bike-mtb", city: "Port Elizabeth", province: "Eastern Cape" },
  { name: "Zest Fruit Trans Elands", slug: "zest-fruit-trans-elands", city: "Elands Bay", province: "Western Cape" },
  { name: "Nieu Bethesda MTB", slug: "nieu-bethesda-mtb", city: "Nieu-Bethesda", province: "Eastern Cape" },
  { name: "Jackal Dash MTB Challenge", slug: "jackal-dash-mtb", city: "Jansenville", province: "Eastern Cape" },
  { name: "Luxliner Route 66", slug: "luxliner-route-66", city: "Grahamstown", province: "Eastern Cape" },
  { name: "Tour de Addo", slug: "tour-de-addo", city: "Addo", province: "Eastern Cape" },
];

async function run() {
  for (const e of EVENTS) {
    const exists = await sql`SELECT id FROM businesses WHERE slug = ${e.slug}`;
    if (exists.length > 0) { console.log(`  exists: ${e.slug}`); continue; }
    await sql`
      INSERT INTO businesses (name, slug, city, province, business_type, website, listing_status, cover_url, created_at, updated_at)
      VALUES (${e.name}, ${e.slug}, ${e.city}, ${e.province}, 'event_organiser', 'https://events.myactive.co.za', 'active', ${COVER}, NOW(), NOW())
    `;
    console.log(`  ✓ ${e.name}`);
  }
  const total = await sql`SELECT COUNT(*) as n FROM businesses`;
  console.log(`\nTotal: ${(total[0] as any).n}`);
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
