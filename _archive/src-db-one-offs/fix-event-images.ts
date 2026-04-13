import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

// Definitive manual overrides based on audit:
// - epic-series.com covers BOTH Cape Epic AND Wines2Whales → wrong for Cape Epic
// - FatTracks: their cover is a trail map, not an action photo → replace
// - Wine Lands CC: cover is same as logo (headshot), not event photo → replace
// - CSA: cover is a focus image, not event action → replace with placeholder
// - Freedom Challenge: Wix static image may be logo, not cover → check

const FIXES: Record<string, { cover?: string | null; logo?: string | null; reason: string }> = {
  // Wine 2 Whales — add with user-provided photo + official logo
  'wines2whales': {
    cover: '/images/events/wine2whales-cover.jpg',
    logo: 'https://www.epic-series.com/sites/default/files/styles/logo/public/2025-06/FNB_W2W_ColourOnBlack_Descriptor.png?itok=ZYCr24QJ',
    reason: 'user-provided cover photo, official logo from epic-series.com'
  },
  // Cape Epic: epic-series.com was being shared — use the actual W2W aerial for W2W, use Epic-specific for Cape Epic
  'absa-cape-epic': {
    cover: 'https://www.epic-series.com/sites/default/files/styles/og/public/2025-04/Cape-Epic-2025-Stage-1-Lourensford-Lourensford-1500x1000.jpg',
    reason: 'use Cape Epic specific race image not shared W2W image'
  },
  // FatTracks: trail map is not a cover photo
  'fattracks-mtb-club': {
    cover: null,
    reason: 'trail map image not suitable as cover — use placeholder'
  },
  // Wine Lands CC: same image used for both logo and cover, replace cover
  'wine-lands-cycling-club': {
    cover: null,
    reason: 'cover was same as logo (club photo) — use placeholder'
  },
  // Cycling SA: "Focus Image" is generic promo, not event action
  'cycling-south-africa': {
    cover: null,
    reason: 'generic promo image — use placeholder'
  },
  // Racepass: cover was a generic cycling-top image (not event-specific)
  'racepass-events': {
    cover: null,
    reason: 'generic stock cycling image — use placeholder'
  },
  // Freedom Challenge: Wix static is likely generic site image
  'freedom-challenge': {
    cover: null,
    reason: 'Wix static image — use placeholder; site had no suitable og:image'
  },
  // Herald Cycle Tour: Squarespace image is old logo, not cover
  'herald-cycle-tour': {
    cover: null,
    reason: 'squarespace logo image used as cover — replace with placeholder'
  },
};

const PROVINCE_COLORS: Record<string, string> = {
  'Western Cape': '1a6b3c',
  'Gauteng': '1a3a6b',
  'KwaZulu-Natal': '6b1a1a',
  'Eastern Cape': '4a1a6b',
  'Free State': '6b4a1a',
};

async function main() {
  // Step 1: Insert Wine 2 Whales if missing
  const w2w = await sql`SELECT id FROM businesses WHERE slug = 'wines2whales'`;
  if (!w2w.length) {
    await sql`
      INSERT INTO businesses (name, slug, description, website, province, city, business_type, services, listing_status, cover_url, logo_url, is_verified, created_at, updated_at)
      VALUES (
        'FNB Wines2Whales',
        'wines2whales',
        'One of South Africa''s most beloved 3-day MTB stage races — the FNB Wines2Whales takes riders from the vineyards of Somerset West through the Overberg to the whales of Hermanus. Three editions: Chardonnay (Nov 6–8), Pinotage (Nov 9–11), and Shiraz (Nov 13–15). Part of the Global MTB Epic Series. Spectacular coastal and mountain terrain through the Western Cape. Pairs perfectly with the Cape Epic in the Epic Series portfolio.',
        'https://www.epic-series.com/races/wines2whales',
        'Western Cape',
        'Hermanus',
        'event_organiser',
        ARRAY['events'],
        'active',
        '/images/events/wine2whales-cover.jpg',
        'https://www.epic-series.com/sites/default/files/styles/logo/public/2025-06/FNB_W2W_ColourOnBlack_Descriptor.png?itok=ZYCr24QJ',
        false, NOW(), NOW()
      )
    `;
    console.log('✅ Added: FNB Wines2Whales');
  } else {
    await sql`UPDATE businesses SET cover_url = '/images/events/wine2whales-cover.jpg', logo_url = 'https://www.epic-series.com/sites/default/files/styles/logo/public/2025-06/FNB_W2W_ColourOnBlack_Descriptor.png?itok=ZYCr24QJ', updated_at = NOW() WHERE slug = 'wines2whales'`;
    console.log('✅ Updated: FNB Wines2Whales (cover + logo)');
  }

  // Step 2: Apply all fixes
  for (const [slug, fix] of Object.entries(FIXES)) {
    if (slug === 'wines2whales') continue;
    
    const row = await sql`SELECT id, name, province FROM businesses WHERE slug = ${slug}`;
    if (!row.length) { console.log('SKIP (not found):', slug); continue; }
    const r = row[0] as any;

    let coverVal = fix.cover;
    if (coverVal === null) {
      // Use placeholder
      const color = PROVINCE_COLORS[r.province] || '1a3a6b';
      coverVal = `/api/placeholder/cover?slug=${slug}&color=${color}`;
    }

    if (fix.logo !== undefined) {
      await sql`UPDATE businesses SET cover_url = ${coverVal}, logo_url = ${fix.logo}, updated_at = NOW() WHERE slug = ${slug}`;
    } else {
      await sql`UPDATE businesses SET cover_url = ${coverVal}, updated_at = NOW() WHERE slug = ${slug}`;
    }
    console.log(`✅ Fixed [${fix.reason}]: ${r.name}`);
  }

  // Step 3: Final summary
  const total = await sql`SELECT COUNT(*) as c FROM businesses WHERE business_type = 'event_organiser'`;
  const realImages = await sql`SELECT COUNT(*) as c FROM businesses WHERE business_type = 'event_organiser' AND cover_url NOT LIKE '/api/placeholder%'`;
  const placeholders = await sql`SELECT COUNT(*) as c FROM businesses WHERE business_type = 'event_organiser' AND cover_url LIKE '/api/placeholder%'`;
  const localImages = await sql`SELECT COUNT(*) as c FROM businesses WHERE business_type = 'event_organiser' AND cover_url LIKE '/images/%'`;
  
  console.log(`\n=== FINAL STATE ===`);
  console.log(`Total event organisers: ${(total[0] as any).c}`);
  console.log(`Real scraped images: ${(realImages[0] as any).c}`);
  console.log(`Local uploaded images: ${(localImages[0] as any).c}`);
  console.log(`Colour placeholders: ${(placeholders[0] as any).c}`);
}

main().catch(console.error);
