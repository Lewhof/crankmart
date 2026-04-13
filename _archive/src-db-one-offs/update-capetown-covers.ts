/**
 * Update cover images for Cape Town shops from scraped website assets
 */
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

const COVER_UPDATES: { slug: string; cover_url: string; note: string }[] = [
  {
    slug: "gear-change-bicycle-store",
    cover_url: "https://gearchange.co.za/cdn/shop/files/2304__resize__cbbe438a4978665f2d3dc71899e3a2b5_1ee0902f-29d9-499c-b6b7-946b7e67c7eb.jpg?v=1771506232",
    note: "Hero banner from gearchange.co.za homepage"
  },
  {
    slug: "cwc-cycles",
    cover_url: "https://cwcycles.co.za/uploads/blocks/16123446731.png",
    note: "Homepage block image from cwcycles.co.za"
  },
  {
    slug: "cwcycles",
    cover_url: "https://cwcycles.co.za/uploads/blocks/16123446731.png",
    note: "Homepage block image from cwcycles.co.za (duplicate)"
  },
  {
    slug: "olympic-cycles",
    cover_url: "https://www.olympiccycles.co.za/cdn/shop/files/Untitled-1_1f8eab1e-1c52-4164-8670-afa0c25da6c7_1800x1000.jpg?v=1733326508",
    note: "Homepage hero from olympiccycles.co.za"
  },
  {
    slug: "summit-bikes",
    cover_url: "https://www.summitbikes.co.za/modules/tvcmsslider/views/img/8a13df250c3f769f38f3_IMG_20251125_124531 - Copy.jpg",
    note: "Store interior from summitbikes.co.za slider"
  },
  {
    slug: "flandria-cycles-stellenbosch",
    cover_url: "https://flandria.co.za/wp-content/uploads/2022/11/FSC-content-bikes-f.jpg",
    note: "Bikes section banner from flandria.co.za"
  },
  {
    slug: "joc-cycles",
    cover_url: "https://www.joccycles.co.za/wp-content/uploads/2020/02/29062585_216367865769203_116770484216922112_n.jpg",
    note: "Store/team photo from joccycles.co.za"
  },
  {
    slug: "canyon-cafe-workshop",
    cover_url: "https://canyoncafe.co.za/cdn/shop/files/canyoncafe_logo_clean_1bccafc6-d315-4f22-bb0e-16603cb8c252.png?height=628&pad_color=ffffff&v=1770731067&width=1200",
    note: "OG image from canyoncafe.co.za (logo on white — best available)"
  },
  {
    slug: "canyon-cafe-stellenbosch",
    cover_url: "https://canyoncafe.co.za/cdn/shop/files/canyoncafe_logo_clean_1bccafc6-d315-4f22-bb0e-16603cb8c252.png?height=628&pad_color=ffffff&v=1770731067&width=1200",
    note: "OG image from canyoncafe.co.za"
  },
];

async function run() {
  console.log(`\n=== Updating ${COVER_UPDATES.length} Cape Town shop cover images ===\n`);
  
  let updated = 0;
  let missed = 0;

  for (const u of COVER_UPDATES) {
    const result = await sql`
      UPDATE businesses 
      SET cover_url = ${u.cover_url}, updated_at = NOW()
      WHERE slug = ${u.slug}
      RETURNING name, slug
    `;
    if (result.length > 0) {
      console.log(`✓ ${result[0].name} (${u.slug})`);
      console.log(`  → ${u.cover_url.substring(0, 80)}...`);
      updated++;
    } else {
      console.log(`✗ Not found: ${u.slug}`);
      missed++;
    }
  }

  console.log(`\n=== Done: ${updated} updated, ${missed} not found ===`);

  // Also flag shops with no cover still
  const missing = await sql`
    SELECT name, slug, website 
    FROM businesses 
    WHERE province = 'Western Cape' 
    AND business_type IN ('shop', 'service_center')
    AND (cover_url IS NULL OR cover_url = '')
    ORDER BY name
  `;
  console.log(`\n=== WC shops still missing covers (${missing.length}) ===`);
  missing.forEach((r: any) => console.log(`  ${r.name} | ${r.website || '—'}`));
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
