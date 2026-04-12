import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

const UPDATES = [
  // Action Cycles — real shop interior photo (3MB hero)
  { slug: "action-cycles-pe", cover_url: "https://actioncycles.co.za/cdn/shop/files/shop2.jpg?v=1759841717" },
  // Coimbra Cycle Centre — professional workshop photo
  { slug: "coimbra-cycle-centre", cover_url: "https://coimbracycles.co.za/wp-content/uploads/2025/02/MAR00007_.webp" },
  // Crafted Cycles — store photo Jan 2025
  { slug: "crafted-cycles-gqeberha", cover_url: "https://www.craftedcycles.co.za/wp-content/uploads/2025/01/DSC_7371.jpg" },
  // CycloPro PE — bike setup photo
  { slug: "cyclopro-pe", cover_url: "https://www.cyclopro.co.za/wp-content/uploads/2018/06/bike_setup_home1.jpg" },
  // Wayne Pheiffer Cycles — shop/cafe photo
  { slug: "wayne-pheiffer-cycles", cover_url: "https://waynepheiffercycles.co.za/wp-content/uploads/2019/09/large_wayne-coffee.jpg" },
  // RevolutionCor — OG image
  { slug: "revolutioncor-pe", cover_url: "https://revolutioncor.co.za/wp-content/uploads/2025/03/cropped-cropped-1741438478819.jpg" },
];

async function run() {
  console.log(`\n=== Updating ${UPDATES.length} PE shop cover images ===\n`);
  let ok = 0;
  for (const u of UPDATES) {
    const r = await sql`
      UPDATE businesses SET cover_url = ${u.cover_url}, updated_at = NOW()
      WHERE slug = ${u.slug}
      RETURNING name
    `;
    if (r.length) { console.log(`✓ ${r[0].name}`); ok++; }
    else console.log(`✗ not found: ${u.slug}`);
  }
  console.log(`\n${ok}/${UPDATES.length} updated`);

  // Show all PE shops final state
  const pe = await sql`
    SELECT name, cover_url FROM businesses
    WHERE province = 'Eastern Cape' AND city ILIKE '%port%'
    ORDER BY name
  `;
  console.log(`\n=== PE shops final state ===`);
  pe.forEach((r: any) => {
    const src = r.cover_url?.includes('placeholder') ? '⚠ placeholder' : r.cover_url ? '✓ real' : '✗ none';
    console.log(`  ${src} ${r.name}`);
  });
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
