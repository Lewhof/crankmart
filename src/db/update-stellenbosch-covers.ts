import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

const UPDATES = [
  { slug: "bikes-n-wines-stellenbosch", cover_url: "https://bikesnwines.com/storage/BikesNWinesHomePageImage.jpg" },
  { slug: "cape-velo-stellenbosch", cover_url: "https://capevelo.com/wp-content/uploads/2019/06/600-x-400-MTB-Homepage-Photo.png" },
  { slug: "commencal-south-africa", cover_url: "https://commencal-store.co.za/cdn/shop/collections/commencal-south-africa-e-bike-collection_1024x1024.jpg?v=1657737958" },
  { slug: "wine-lands-cycling-club", cover_url: "https://winelandscyclingclub.co.za/wp-content/uploads/2024/01/DSC07887-1024x684.jpg" },
];

async function run() {
  console.log(`\n=== Updating ${UPDATES.length} Stellenbosch covers ===\n`);
  let ok = 0;
  for (const u of UPDATES) {
    const r = await sql`UPDATE businesses SET cover_url = ${u.cover_url}, updated_at = NOW() WHERE slug = ${u.slug} RETURNING name`;
    if (r.length) { console.log(`✓ ${r[0].name}`); ok++; }
    else console.log(`✗ not found: ${u.slug}`);
  }

  // Final state
  const all = await sql`SELECT name, cover_url FROM businesses WHERE city ILIKE '%stellenbosch%' ORDER BY name`;
  console.log(`\n=== Stellenbosch final state ===`);
  all.forEach((b: any) => {
    const s = !b.cover_url ? '✗ none' : b.cover_url.includes('placeholder') ? '⚠ placeholder' : '✓ real';
    console.log(`  ${s}  ${b.name}`);
  });
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
