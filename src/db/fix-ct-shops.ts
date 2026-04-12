import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

const AI_COVER = "https://crankmart.fibreflow.app/shop-covers/generic-bikeshop-ct.png";
const AI_TRISPORTS = "https://crankmart.fibreflow.app/shop-covers/trisports-ct.png";
const PLACEHOLDER = "/images/shop-placeholder.jpg"; // use existing CrankMart placeholder

async function run() {
  // ── 1. Find all duplicates ──
  console.log("\n=== Finding duplicates ===");
  const dups = await sql`
    SELECT website, COUNT(*) as cnt, array_agg(id ORDER BY created_at) as ids, array_agg(name ORDER BY created_at) as names
    FROM businesses
    WHERE website IS NOT NULL AND website != ''
    GROUP BY website
    HAVING COUNT(*) > 1
    ORDER BY cnt DESC
  `;
  dups.forEach((d: any) => console.log(`  ${d.website} → ${d.cnt}x | ids: ${d.ids.join(', ')}`));

  // ── 2. Remove AI images ──
  console.log("\n=== Removing AI cover images ===");
  const aiRemoved = await sql`
    UPDATE businesses 
    SET cover_url = NULL, updated_at = NOW()
    WHERE cover_url IN (${AI_COVER}, ${AI_TRISPORTS})
    RETURNING name, slug
  `;
  aiRemoved.forEach((r: any) => console.log(`  ✓ cleared: ${r.name}`));
  console.log(`  ${aiRemoved.length} AI images removed`);

  // ── 3. Delete exact duplicate slugs (keep older/richer entry) ──
  console.log("\n=== Merging duplicates ===");

  // CWC Cycles: keep cwc-cycles-cape-town (has cover), delete cwcycles
  const cwc = await sql`DELETE FROM businesses WHERE slug = 'cwcycles' RETURNING name`;
  console.log(`  CWC: deleted ${cwc.length} → ${cwc[0]?.name}`);

  // Pro Bikes: keep probikes-ct (has logo), delete pro-bikes-cape-town  
  const pb1 = await sql`DELETE FROM businesses WHERE slug = 'pro-bikes-cape-town' RETURNING name`;
  console.log(`  Pro Bikes: deleted ${pb1.length} → ${pb1[0]?.name}`);

  // Canyon Café: two workshop entries — keep the one with logo (check)
  const canyon = await sql`
    SELECT id, slug, name, logo_url, cover_url FROM businesses 
    WHERE slug LIKE 'canyon-cafe%' AND city = 'Cape Town'
    ORDER BY created_at
  `;
  console.log(`  Canyon Cafe entries: ${canyon.length}`);
  canyon.forEach((r: any) => console.log(`    ${r.slug} | logo:${r.logo_url?'✓':'✗'} cover:${r.cover_url?'✓':'✗'}`));
  if (canyon.length > 1) {
    // keep the one with a logo
    const keep = canyon.find((r: any) => r.logo_url) || canyon[0];
    const del = canyon.filter((r: any) => r.id !== keep.id);
    for (const d of del) {
      await sql`DELETE FROM businesses WHERE id = ${d.id}`;
      console.log(`  Canyon: deleted ${d.slug}`);
    }
  }

  // ── 4. Final count ──
  const remaining = await sql`
    SELECT COUNT(*) as n FROM businesses WHERE province = 'Western Cape'
  `;
  const nocover = await sql`
    SELECT name, slug FROM businesses 
    WHERE province = 'Western Cape' AND business_type IN ('shop','service_center')
    AND (cover_url IS NULL OR cover_url = '')
    ORDER BY name
  `;
  console.log(`\n=== Done ===`);
  console.log(`  WC total: ${(remaining[0] as any).n}`);
  console.log(`  WC shops with no cover: ${nocover.length}`);
  nocover.forEach((r: any) => console.log(`    ${r.name} (${r.slug})`));
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
