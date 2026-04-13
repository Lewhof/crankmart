import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);
async function run() {
  const r = await sql`SELECT name, slug, website, cover_url FROM businesses WHERE city ILIKE '%stellenbosch%' ORDER BY name`;
  r.forEach((b: any) => console.log(`${b.name}\n  ${b.slug}\n  ${b.website || '—'}\n  ${b.cover_url?.includes('placeholder') ? 'PLACEHOLDER' : b.cover_url ? 'REAL' : 'NONE'}\n`));
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
