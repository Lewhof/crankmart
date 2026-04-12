import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

const UPDATES = [
  { slug: "avalanche-bikes-sa", cover_url: "https://cdn.shopify.com/s/files/1/0614/8826/7429/files/Frame.png?v=1661848093" },
  { slug: "raleigh-south-africa", cover_url: "https://raleighintl.com/wp-content/uploads/Raleigh-Landing-page.jpg" },
  { slug: "rushsports-distributor", cover_url: "https://rushsports.co.za/cdn/shop/files/20190718-CVR_4109_1024x1024_ee2a622b-a301-43b0-af86-f897d2d647b7.webp?v=1759979661" },
];

async function run() {
  for (const u of UPDATES) {
    const r = await sql`UPDATE businesses SET cover_url = ${u.cover_url}, updated_at = NOW() WHERE slug = ${u.slug} RETURNING name`;
    console.log(r.length ? `✓ ${r[0].name}` : `✗ not found: ${u.slug}`);
  }

  // Final state
  const all = await sql`SELECT name, cover_url FROM businesses WHERE province = 'Gauteng' AND business_type IN ('shop','service_center','brand') ORDER BY name`;
  const real = all.filter((b: any) => b.cover_url && !b.cover_url.includes('placeholder')).length;
  const ph = all.filter((b: any) => !b.cover_url || b.cover_url.includes('placeholder')).length;
  console.log(`\nGauteng: ✓ ${real} real images  ⚠ ${ph} placeholder (JS-rendered sites — no static images scrapeable)`);
  all.filter((b: any) => !b.cover_url || b.cover_url.includes('placeholder'))
    .forEach((b: any) => console.log(`  ⚠ ${b.name}`));
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
