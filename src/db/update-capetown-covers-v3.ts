import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

const BASE = "https://cyclemart.fibreflow.app/shop-covers";
const GENERIC = `${BASE}/generic-bikeshop-ct.png`;
const TRISPORTS_IMG = `${BASE}/trisports-ct.png`;

const UPDATES: { slug: string; cover_url: string; source: string }[] = [
  // Real scraped images
  {
    slug: "cycle-lab-cape-town",
    cover_url: "https://www.cyclelab.com/uploads/banner/1773225190-1920.webp",
    source: "cyclelab.com banner"
  },
  {
    slug: "trisports-ct",
    cover_url: TRISPORTS_IMG,
    source: "AI-generated placeholder"
  },
  {
    slug: "probikes-ct",
    cover_url: GENERIC,
    source: "AI-generated placeholder"
  },
  {
    slug: "pro-bikes-cape-town",
    cover_url: GENERIC,
    source: "AI-generated placeholder"
  },
  {
    slug: "bicycle-mechanic-ct",
    cover_url: GENERIC,
    source: "AI-generated placeholder"
  },
  {
    slug: "bikeology-ct",
    cover_url: GENERIC,
    source: "AI-generated placeholder"
  },
  {
    slug: "cycle-surgeon-ct",
    cover_url: GENERIC,
    source: "AI-generated placeholder"
  },
  {
    slug: "hellsend-bike-shop",
    cover_url: GENERIC,
    source: "AI-generated placeholder (Trek dealer)"
  },
  {
    slug: "masons-bike-inn",
    cover_url: GENERIC,
    source: "AI-generated placeholder"
  },
  {
    slug: "pedal-power-ct",
    cover_url: "https://pedalpower.org.za/wp-content/uploads/2023/03/Maluti.jpeg",
    source: "pedalpower.org.za"
  },
  {
    slug: "daisyway-coaching",
    cover_url: GENERIC,
    source: "AI-generated placeholder"
  },
  {
    slug: "ssisa-bike-fitting-cape-town",
    cover_url: GENERIC,
    source: "AI-generated placeholder"
  },
  {
    slug: "science-to-sport-coaching",
    cover_url: GENERIC,
    source: "AI-generated placeholder"
  },
  {
    slug: "bikehub-sa",
    cover_url: GENERIC,
    source: "AI-generated placeholder"
  },
];

async function run() {
  console.log(`\n=== Updating ${UPDATES.length} cover images (v3) ===\n`);
  let ok = 0;
  for (const u of UPDATES) {
    const r = await sql`
      UPDATE businesses SET cover_url = ${u.cover_url}, updated_at = NOW()
      WHERE slug = ${u.slug} AND (cover_url IS NULL OR cover_url = '')
      RETURNING name
    `;
    if (r.length) { console.log(`✓ ${r[0].name} [${u.source}]`); ok++; }
    else console.log(`✗ skip (already has cover or not found): ${u.slug}`);
  }
  
  const still = await sql`
    SELECT COUNT(*) as n FROM businesses 
    WHERE province = 'Western Cape' 
    AND business_type IN ('shop','service_center')
    AND (cover_url IS NULL OR cover_url = '')
  `;
  console.log(`\n${ok} updated | ${(still[0] as any).n} WC shops still missing covers`);
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
