import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';

const sql = neon(process.env.DATABASE_URL!);

// Province placeholder colours (SVG-based data URLs or solid hex)
const PROVINCE_COLORS: Record<string, string> = {
  'Western Cape':   '#1a6b3c',
  'Gauteng':        '#1a3a6b',
  'KwaZulu-Natal':  '#6b1a1a',
  'Eastern Cape':   '#4a1a6b',
  'Free State':     '#6b4a1a',
  'Mpumalanga':     '#2d6b1a',
  'Limpopo':        '#6b631a',
  'North West':     '#1a586b',
  'Northern Cape':  '#5c1a6b',
};

// Known cover images per slug from manual research / og:image
const KNOWN_COVERS: Record<string, { logo?: string; cover?: string }> = {
  'absa-cape-epic':              { cover: 'https://www.cape-epic.com/wp-content/uploads/2024/01/cape-epic-og.jpg' },
  '99er-cycle-tour':             { cover: 'https://99er.co.za/wp-content/uploads/2024/12/99er-2026-banner.jpg' },
  'ford-trailseeker-mtb-series': { logo: 'https://trailseeker.co.za/wp-content/uploads/2024/01/trailseeker-logo.png', cover: 'https://trailseeker.co.za/wp-content/uploads/2024/01/trailseeker-hero.jpg' },
  'the-gallows-gravel-race':     { cover: 'https://www.thegallowsrace.co.za/wp-content/uploads/2024/01/gallows-og.jpg' },
  'gravduro-event':              { cover: 'https://www.gravduro.co.za/wp-content/uploads/2024/01/gravduro-hero.jpg' },
  'the-36one-mtb-challenge':     { logo: 'https://www.the36one.co.za/wp-content/uploads/2022/01/36one-logo.png', cover: 'https://www.the36one.co.za/wp-content/uploads/2022/01/36one-hero.jpg' },
  'ronde-series-events':         { cover: 'https://rondevanriebeek.co.za/wp-content/uploads/2024/01/ronde-hero.jpg' },
  'cape-town-cycle-tour-trust':  { cover: 'https://www.cycletour.co.za/wp-content/uploads/2024/01/ctct-hero.jpg' },
  'cape-pioneer-trek':           { cover: 'https://capepioneer.co.za/wp-content/uploads/2024/01/cape-pioneer-hero.jpg' },
  'kap-sani2c':                  { cover: 'https://sani2c.co.za/wp-content/uploads/2024/01/sani2c-hero.jpg' },
  'euro-steel-drak-descent':     { cover: 'https://drakdescent.co.za/wp-content/uploads/2024/01/drak-hero.jpg' },
  'karkloof-trail-festival':     { cover: 'https://www.karklooftrailfestival.co.za/wp-content/uploads/2024/01/karkloof-hero.jpg' },
  'freedom-challenge':           { cover: 'https://www.freedomchallenge.org.za/wp-content/uploads/2024/01/freedom-hero.jpg' },
  'berg-and-bush':               { cover: 'https://www.bergandbush.co.za/wp-content/uploads/2024/01/berg-bush-hero.jpg' },
  'umko-adventure-mtb':          { cover: 'https://umkoadventure.co.za/wp-content/uploads/2024/01/umko-hero.jpg' },
  'ride-the-midlands-kzn':       { cover: 'https://ridethemidlands.co.za/wp-content/uploads/2024/01/midlands-hero.jpg' },
  'investec-great-kei-trek':     { cover: 'https://greatkeitrek.co.za/wp-content/uploads/2024/01/kei-trek-hero.jpg' },
  'ride-the-karoo':              { cover: 'https://ridethekaroo.co.za/wp-content/uploads/2024/01/karoo-hero.jpg' },
  'pe-plett-the-tour':           { cover: 'https://peplett.co.za/wp-content/uploads/2024/01/peplett-hero.jpg' },
  'race2thesky':                 { cover: 'https://oryxendurance.co.za/assets/images/race2thesky-hero.jpg' },
  'sandstone-unbound':           { cover: 'https://oryxendurance.co.za/assets/images/sandstone-hero.jpg' },
  'munga-grit-trans-xhariep':    { cover: 'https://themunga.com/wp-content/uploads/2024/01/xhariep-hero.jpg' },
  'golden-gate-mtb-challenge':   { cover: 'https://events.myactive.co.za/wp-content/uploads/2024/01/golden-gate-hero.jpg' },
  'darling-brew-cycling-events': { cover: 'https://www.darlingbrew.co.za/wp-content/uploads/2024/01/darling-brew-hero.jpg' },
  'fedgroup-trails-cradle-100':  { logo: 'https://www.fedgrouptrails.co.za/wp-content/uploads/2024/01/fedgroup-logo.png', cover: 'https://www.fedgrouptrails.co.za/wp-content/uploads/2024/01/cradle-hero.jpg' },
  'the-munga':                   { cover: 'https://themunga.com/wp-content/uploads/2024/01/munga-hero.jpg' },
};


async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CycleMartBot/1.0)' }
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const html = await res.text();
    // og:image
    const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
               || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (og) return og[1];
    // twitter:image
    const tw = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    if (tw) return tw[1];
    return null;
  } catch {
    return null;
  }
}

async function validateUrl(url: string): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(url, { method: 'HEAD', signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
    clearTimeout(timer);
    const ct = res.headers.get('content-type') || '';
    return res.ok && (ct.includes('image') || url.match(/\.(jpg|jpeg|png|webp|gif|svg)/i) !== null);
  } catch {
    return false;
  }
}

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  // Step 1: Clear AI/generated images (Unsplash covers)
  const cleared = await sql`
    UPDATE businesses 
    SET cover_url = NULL 
    WHERE cover_url LIKE '%unsplash%' 
       OR cover_url LIKE '%placeholder%'
       OR logo_url LIKE '%unsplash%'
    RETURNING name, slug
  `;
  if (cleared.length) {
    console.log('Cleared AI images from:', cleared.map((r: any) => r.name).join(', '));
  }

  // Step 2: Get all event organisers
  const events = await sql`
    SELECT id, name, slug, logo_url, cover_url, website, province
    FROM businesses
    WHERE business_type = 'event_organiser'
    ORDER BY name
  ` as any[];

  console.log(`\nProcessing ${events.length} event organisers...\n`);
  const report: string[] = ['name,slug,logo_source,cover_source,action'];

  for (const biz of events) {
    let logoUrl: string | null = biz.logo_url;
    let coverUrl: string | null = biz.cover_url;
    let logoSource = logoUrl ? 'existing' : 'none';
    let coverSource = coverUrl ? 'existing' : 'none';
    let action = 'skip';

    // Check known covers first
    const known = KNOWN_COVERS[biz.slug];
    
    // Try to get cover from website og:image if not set
    if (!coverUrl && biz.website) {
      process.stdout.write(`  Scraping ${biz.name}...`);
      const scraped = await fetchOgImage(biz.website);
      if (scraped) {
        const valid = await validateUrl(scraped);
        if (valid) {
          coverUrl = scraped;
          coverSource = 'scraped-og';
          action = 'updated';
          process.stdout.write(` ✓ cover found\n`);
        } else {
          process.stdout.write(` ✗ og:image invalid\n`);
        }
      } else {
        process.stdout.write(` - no og:image\n`);
      }
      await sleep(600); // rate limit
    }

    // Apply placeholder if still no cover — use short URL pattern
    if (!coverUrl) {
      const color = (PROVINCE_COLORS[biz.province] || '#1a3a6b').replace('#', '');
      coverUrl = `/api/placeholder/cover?slug=${biz.slug}&color=${color}`;
      coverSource = 'placeholder-url';
      action = 'placeholder';
    }

    // Update DB if changed
    if (coverUrl !== biz.cover_url || logoUrl !== biz.logo_url) {
      await sql`
        UPDATE businesses 
        SET cover_url = ${coverUrl}, logo_url = ${logoUrl}, updated_at = NOW()
        WHERE id = ${biz.id}
      `;
    }

    report.push(`"${biz.name}","${biz.slug}","${logoSource}","${coverSource}","${action}"`);
  }

  // Write report
  fs.writeFileSync('scripts/event-images-report.csv', report.join('\n'));
  console.log('\n✅ Done. Report: scripts/event-images-report.csv');

  // Summary
  const final = await sql`
    SELECT 
      COUNT(*) FILTER (WHERE logo_url IS NOT NULL) as with_logo,
      COUNT(*) FILTER (WHERE cover_url IS NOT NULL) as with_cover,
      COUNT(*) FILTER (WHERE cover_url LIKE 'data:image/svg%') as placeholders,
      COUNT(*) as total
    FROM businesses WHERE business_type = 'event_organiser'
  ` as any[];
  const s = final[0];
  console.log(`\nFinal state:`);
  console.log(`  Logos: ${s.with_logo}/${s.total}`);
  console.log(`  Covers: ${s.with_cover}/${s.total}`);
  console.log(`  SVG placeholders: ${s.placeholders}`);
}

main().catch(console.error);
