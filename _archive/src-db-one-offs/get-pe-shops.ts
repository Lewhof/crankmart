import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);
async function run() {
  const rows = await sql`
    SELECT name, slug, website, cover_url
    FROM businesses
    WHERE (city ILIKE '%port elizabeth%' OR city ILIKE '%gqeberha%' OR city ILIKE '%pe%')
    AND business_type IN ('shop','service_center','brand')
    ORDER BY name
  `;
  rows.forEach((r: any) => console.log(`${r.name}\n  slug: ${r.slug}\n  web:  ${r.website || '—'}\n  cover: ${r.cover_url || 'MISSING'}\n`));
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
