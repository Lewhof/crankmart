import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

const UPDATES: { slug: string; cover_url: string }[] = [
  {
    slug: "gear-change-cape-town",
    cover_url: "https://gearchange.co.za/cdn/shop/files/2304__resize__cbbe438a4978665f2d3dc71899e3a2b5_1ee0902f-29d9-499c-b6b7-946b7e67c7eb.jpg?v=1771506232",
  },
  {
    slug: "cwc-cycles-cape-town",
    cover_url: "https://cwcycles.co.za/uploads/blocks/16123446731.png",
  },
  {
    slug: "olympic-cycles-cape-town",
    cover_url: "https://www.olympiccycles.co.za/cdn/shop/files/Untitled-1_1f8eab1e-1c52-4164-8670-afa0c25da6c7_1800x1000.jpg?v=1733326508",
  },
  {
    slug: "summit-bikes-ct",
    cover_url: "https://www.summitbikes.co.za/modules/tvcmsslider/views/img/8a13df250c3f769f38f3_IMG_20251125_124531 - Copy.jpg",
  },
  {
    slug: "joc-cycles-cape-town",
    cover_url: "https://www.joccycles.co.za/wp-content/uploads/2020/02/29062585_216367865769203_116770484216922112_n.jpg",
  },
  {
    slug: "canyon-cafe-workshop-cape-town",
    cover_url: "https://canyoncafe.co.za/cdn/shop/files/canyoncafe_logo_clean_1bccafc6-d315-4f22-bb0e-16603cb8c252.png?height=628&pad_color=ffffff&v=1770731067&width=1200",
  },
  {
    slug: "freewheel-cycles-cape-town",
    cover_url: "https://freewheel.co.za/cdn/shop/files/FC_LOGO-BLUE_9619e7cb-91d0-4104-a33d-3cba604ae482.jpg?v=1720438062",
  },
  {
    slug: "east-city-cycles-cape-town",
    cover_url: "https://eastcitycycles.com/cdn/shop/files/Transparent_background_logo_bigger_1e5ac8e9-3646-4fab-82c6-ba28fd6120e4_1200x1200.png?v=1614309060",
  },
  {
    slug: "bike-addict-online",
    cover_url: "https://bike-addict.co.za/cdn/shop/files/fhd-Colorful-Background-Dynamic-Waves-AI-Generated-4K-Wallpaper_1400x.jpg",
  },
];

async function run() {
  console.log(`\n=== Updating ${UPDATES.length} cover images ===\n`);
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

  // Remaining missing
  const still = await sql`
    SELECT name, slug, website FROM businesses 
    WHERE province = 'Western Cape' 
    AND business_type IN ('shop','service_center')
    AND (cover_url IS NULL OR cover_url = '')
    ORDER BY name
  `;
  console.log(`\n=== Still missing covers (${still.length}) ===`);
  still.forEach((r: any) => console.log(`  ${r.name} | ${r.website || '—'}`));
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
