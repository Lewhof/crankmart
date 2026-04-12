import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

const events = [
  {
    title: 'Tankwa Trek',
    slug: 'tankwa-trek-north-west-2026',
    type: 'stage_race',
    city: 'North West',
    province: 'North West',
    venue: 'Kaleo Guest Farm',
    start: '2026-02-05', end: '2026-02-08',
    entry: 'https://dryland.co.za/tankwa-trek/',
    organiser: 'Dryland Event Management',
    org_web: 'https://dryland.co.za',
    distance: '267km (4-day UCI stage race)',
    desc: 'The Momentum Medical Scheme Tankwa Trek presented by Biogen — a premier 4-day UCI-status MTB stage race based at Kaleo Guest Farm in the North West / Bokkeveld region. Breathtaking technical trails through the Bokkeveld and Witzenburg area with some of the most unique scenery South Africa has to offer. Attracts elite international riders. February 5–8, 2026.',
  },
  {
    title: 'Nectar AMMSA MTB Festival',
    slug: 'nectar-ammsa-mtb-2026',
    type: 'festival',
    city: 'Buffelspoort',
    province: 'North West',
    venue: 'Nectar Game Lodge',
    start: '2026-03-28', end: '2026-03-28',
    entry: 'https://www.racespace.co.za/race/6381-nectar-ammsa-mtb-festival',
    organiser: 'AMMSA Events',
    org_web: 'https://events.myactive.co.za',
    distance: '7km / 15km / 30km / 40km / 70km',
    desc: 'Annual MTB festival at the beautiful Nectar Game Lodge in Buffelspoort, North West. Five distances from 7km family rides to a 70km challenge. Set in the Magaliesberg foothills with game lodge atmosphere and stunning scenery. Perfect family weekend. March 28, 2026.',
  },
  {
    title: 'Wagpos Pedal & Pace Challenge',
    slug: 'wagpos-pedal-pace-2026',
    type: 'fun_ride',
    city: 'Brits',
    province: 'North West',
    venue: 'Hoërskool Wagpos',
    start: '2026-04-25', end: '2026-04-25',
    entry: 'https://www.racespace.co.za/race/6205-wagpos-pedal-pace-challenge',
    organiser: 'Wagpos School',
    org_web: 'https://events.myactive.co.za',
    distance: '5km / 10km / 15km / 25km / 40km / 70km',
    desc: 'Community MTB and trail running event at Hoërskool Wagpos near Brits, North West. Free entry — six distances from 5km to 70km for cyclists and runners of all levels. School fundraiser with a great community atmosphere in the Magaliesberg bushveld. E-bikes welcome. April 25, 2026.',
  },
  {
    title: 'C2U Bosveld MTB Gravel Challenge',
    slug: 'c2u-bosveld-mtb-2026',
    type: 'race',
    city: 'Brits',
    province: 'North West',
    venue: 'Brits Aerodrome (FABS)',
    start: '2026-08-08', end: '2026-08-08',
    entry: 'https://www.racespace.co.za/race/6148-c2u-bosveld-mtb-gravel-challenge',
    organiser: 'C2U Events',
    org_web: 'https://events.myactive.co.za',
    distance: '8km / 35km / 91km / 156km',
    desc: 'Annual MTB and gravel challenge based at Brits Aerodrome (FABS) in the North West Bosveld. Four distances from 8km to 156km through the scenic bushveld plains and rocky ridges around Brits. E-bikes welcome. Tandem category available. Kids 4km race. August 8, 2026.',
  },
  {
    title: 'Buffelstrap MTB Race',
    slug: 'buffelstrap-mtb-2026',
    type: 'race',
    city: 'Buffelspoort',
    province: 'North West',
    venue: 'ATKV Buffelspoort',
    start: '2026-08-22', end: '2026-08-22',
    entry: 'https://events.myactive.co.za',
    organiser: 'ATKV',
    org_web: 'https://www.atkv.org.za',
    distance: 'Multiple distances',
    desc: 'Popular annual MTB race at ATKV Buffelspoort in the Magaliesberg, North West. One of the Gauteng/North West region\'s favourite community cycling events — great trails, family atmosphere, and the stunning Magaliesberg as backdrop. Part of the CSA national calendar. August 22, 2026.',
  },
  {
    title: 'Grind Gravel — Magaliesberg',
    slug: 'grind-gravel-magaliesberg-2026',
    type: 'race',
    city: 'Magaliesburg',
    province: 'North West',
    venue: 'Valley Lodge & Spa',
    start: '2026-02-07', end: '2026-02-07',
    entry: 'https://www.racespace.co.za/race/5769-the-grind-gravel-heaven-or-hell',
    organiser: 'The Grind Events',
    org_web: 'https://events.myactive.co.za',
    distance: '5km / 10km / 15km / 40km / 70km / 150km',
    desc: 'The Grind — Gravel Heaven or Hell at Valley Lodge & Spa in Magaliesberg. Six distances from 5km trail fun to a 150km gravel epic. One of Gauteng/North West\'s best-value gravel events in the beautiful Magaliesberg mountains. Trail running options alongside the MTB routes. February 7, 2026.',
  },
];

async function main() {
  let added = 0, skipped = 0;
  for (const e of events) {
    const exists = await sql`SELECT id FROM events WHERE slug = ${e.slug}`;
    if (exists.length) { console.log('SKIP:', e.title); skipped++; continue; }
    const cover = `https://crankmart.com/uploads/events/${e.slug}.jpg?v=20260330`;
    await sql`
      INSERT INTO events (
        title, slug, description, event_type, city, province, venue_name,
        event_date_start, event_date_end, entry_url, entry_status, organiser_name,
        organiser_website, discipline, distance, is_featured, cover_image_url,
        status, country, created_at, updated_at
      ) VALUES (
        ${e.title}, ${e.slug}, ${e.desc}, ${e.type}::event_type,
        ${e.city}, ${e.province}, ${e.venue},
        ${e.start}::date, ${e.end}::date,
        ${e.entry}, 'open', ${e.organiser}, ${e.org_web},
        ARRAY[${e.title}], ${e.distance},
        false, ${cover}, 'pending_review', 'ZA', NOW(), NOW()
      )
    `;
    console.log('ADDED:', e.title, '|', e.city, '|', e.start);
    added++;
  }
  console.log(`\nDone: ${added} added, ${skipped} skipped`);
  const byProv = await sql`SELECT province, COUNT(*) as c FROM events WHERE status='pending_review' GROUP BY province ORDER BY c DESC` as any[];
  console.log('\nFull calendar by province:');
  byProv.forEach((r: any) => console.log(`  ${r.province || 'unset'}: ${r.c}`));
}
main().catch(console.error);
