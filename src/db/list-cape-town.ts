import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);
async function run() {
  const rows = await sql`
    SELECT id, name, slug, business_type, city, province, website, logo_url, cover_url, address
    FROM businesses
    WHERE province = 'Western Cape'
    ORDER BY city, name
  `;
  console.log(`\n=== Western Cape businesses: ${rows.length} ===\n`);
  rows.forEach((r: any) => {
    const logo = r.logo_url ? '✓' : '✗';
    const cover = r.cover_url ? '✓' : '✗';
    console.log(`[${r.id}] ${r.name} | ${r.business_type} | ${r.city} | logo:${logo} cover:${cover} | ${r.website||'—'}`);
  });
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
