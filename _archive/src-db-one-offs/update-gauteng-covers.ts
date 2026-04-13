import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

const UPDATES = [
  { slug: "avalanche-south-africa", cover_url: "https://cdn.shopify.com/s/files/1/0614/8826/7429/files/Frame.png?v=1661848093" },
  { slug: "ballistic-bike-trading", cover_url: "https://www.ballisticbiketrading.co.za/wp-content/uploads/2021/06/bioracer.jpg" },
  { slug: "bicycle-power-trading", cover_url: "https://bicyclepower.co.za/wp-content/uploads/2024/08/294348563_431110275699484_6453524270626664364_n.webp" },
  { slug: "giant-south-africa", cover_url: "https://cdn.shopify.com/s/files/1/0684/3396/9453/files/Hero_Banner_-_MB-1_253fc1ef-4268-4385-960c-bccbedb75c35.png?v=1772718197" },
  { slug: "raleigh-bikes-south-africa", cover_url: "https://raleighintl.com/wp-content/uploads/Raleigh-Landing-page.jpg" },
  { slug: "rush-sports", cover_url: "https://rushsports.co.za/cdn/shop/files/20190718-CVR_4109_1024x1024_ee2a622b-a301-43b0-af86-f897d2d647b7.webp?v=1759979661" },
];

async function run() {
  console.log(`\n=== Updating ${UPDATES.length} Gauteng covers ===\n`);
  let ok = 0;
  for (const u of UPDATES) {
    const r = await sql`UPDATE businesses SET cover_url = ${u.cover_url}, updated_at = NOW() WHERE slug = ${u.slug} RETURNING name`;
    if (r.length) { console.log(`✓ ${r[0].name}`); ok++; }
    else console.log(`✗ not found: ${u.slug}`);
  }

  // Final state
  const all = await sql`SELECT name, cover_url FROM businesses WHERE province = 'Gauteng' AND business_type IN ('shop','service_center','brand') ORDER BY name`;
  const real = all.filter((b: any) => b.cover_url && !b.cover_url.includes('placeholder')).length;
  const placeholder = all.filter((b: any) => !b.cover_url || b.cover_url.includes('placeholder')).length;
  console.log(`\n✓ ${real} real  ⚠ ${placeholder} placeholder`);
  all.filter((b: any) => !b.cover_url || b.cover_url.includes('placeholder'))
    .forEach((b: any) => console.log(`  ⚠ ${b.name}`));
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
