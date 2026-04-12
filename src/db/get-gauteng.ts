import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);
async function run() {
  const r = await sql`SELECT name, slug, website, cover_url FROM businesses WHERE province = 'Gauteng' AND business_type IN ('shop','service_center','brand') ORDER BY name`;
  r.forEach((b: any) => console.log(`${b.cover_url?.includes('placeholder') || !b.cover_url ? '⚠' : '✓'} ${b.name} | ${b.website || '—'}`));
  console.log(`\nTotal: ${r.length}`);
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
