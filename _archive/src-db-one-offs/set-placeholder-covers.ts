import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

// Use existing hero image as placeholder — real cycling shop photo
const PLACEHOLDER = "/images/04-hero-bike-shop.jpg";

async function run() {
  const result = await sql`
    UPDATE businesses
    SET cover_url = ${PLACEHOLDER}, updated_at = NOW()
    WHERE (cover_url IS NULL OR cover_url = '')
    AND province = 'Western Cape'
    AND business_type IN ('shop','service_center')
    RETURNING name, slug
  `;
  console.log(`\n=== Set placeholder on ${result.length} shops ===`);
  result.forEach((r: any) => console.log(`  ✓ ${r.name}`));

  // Also set placeholder across ALL provinces for any shop missing a cover
  const all = await sql`
    UPDATE businesses
    SET cover_url = ${PLACEHOLDER}, updated_at = NOW()
    WHERE (cover_url IS NULL OR cover_url = '')
    AND business_type IN ('shop','service_center')
    RETURNING name, city, province
  `;
  if (all.length > 0) {
    console.log(`\n=== Also set placeholder on ${all.length} shops in other provinces ===`);
    all.forEach((r: any) => console.log(`  ✓ ${r.name} (${r.city}, ${r.province})`));
  }

  // Final check
  const nocover = await sql`
    SELECT COUNT(*) as n FROM businesses 
    WHERE business_type IN ('shop','service_center')
    AND (cover_url IS NULL OR cover_url = '')
  `;
  console.log(`\nShops still without cover: ${(nocover[0] as any).n}`);
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
