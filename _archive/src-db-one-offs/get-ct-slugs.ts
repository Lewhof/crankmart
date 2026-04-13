import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);
async function run() {
  const rows = await sql`
    SELECT name, slug, website, cover_url 
    FROM businesses 
    WHERE province = 'Western Cape'
    AND business_type IN ('shop','service_center')
    AND (cover_url IS NULL OR cover_url = '')
    ORDER BY name
  `;
  rows.forEach((r: any) => console.log(`slug:"${r.slug}" | ${r.name}`));
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
