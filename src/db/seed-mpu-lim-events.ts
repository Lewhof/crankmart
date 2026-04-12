import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

const events = [
  // ── MPUMALANGA ─────────────────────────────────────────────────────────────
  {
    title: 'Barberton XCM MTB Challenge',
    slug: 'barberton-xcm-2026',
    type: 'race',
    city: 'Barberton',
    province: 'Mpumalanga',
    venue: 'Barberton High School',
    start: '2026-01-31', end: '2026-01-31',
    entry: 'https://www.barbertonxcm.com',
    organiser: 'Round Table 67 Barberton',
    org_web: 'https://www.barbertonxcm.com',
    distance: '20km / 45km / 70km / 90km / 110km',
    desc: 'One of South Africa\'s most beloved single-day MTB events, hosted by Round Table 67 Barberton. Set in the breathtaking terrain of Barberton, Mpumalanga — five race distances from the 20km Fun Ride to the 110km Ultra Marathon. Scenic routes, festive atmosphere, and rugged wilderness trails. All start and finish at Barberton High School. January 31, 2026.',
  },
  {
    title: 'Kosmos 3-in-1',
    slug: 'kosmos-3in1-2026',
    type: 'race',
    city: 'Secunda',
    province: 'Mpumalanga',
    venue: 'Lake Umuzi Waterfront',
    start: '2026-03-14', end: '2026-03-14',
    entry: 'https://www.racespace.co.za/race/6047-kosmos-3-in-1',
    organiser: 'Lake Umuzi Events',
    org_web: 'https://www.lakeumuzi.co.za',
    distance: '4km / 10km / 21km / 42km / 73km',
    desc: 'Annual multisport cycling event at the beautiful Lake Umuzi Waterfront in Secunda, Mpumalanga. Distances from 4km family rides to a 73km challenge. Set on the scenic waterfront with a festive atmosphere. Part of the Secunda cycling calendar. March 14, 2026.',
  },
  {
    title: 'Cosmos 3in1 MTB Stage Race',
    slug: 'cosmos-3in1-mtb-2026',
    type: 'stage_race',
    city: 'Secunda',
    province: 'Mpumalanga',
    venue: 'Lake Umuzi Kamp Oase',
    start: '2026-03-21', end: '2026-03-21',
    entry: 'https://www.entryninja.com/events/83342-cosmos-3in1-mtb-challenge',
    organiser: 'Lake Umuzi Events',
    org_web: 'https://www.lakeumuzi.co.za',
    distance: '10km / 20km / 33km / 43km / 70km / 83km / 100km / 110km',
    desc: 'One-day MTB stage race concept at Lake Umuzi Kamp Oase, Secunda. Eight distance options from 10km to 110km cater to every level. Scenic lakeside terrain in the heart of Mpumalanga. March 21, 2026.',
  },
  {
    title: 'Sabie Classic MTB Race',
    slug: 'sabie-classic-2026',
    type: 'race',
    city: 'Sabie',
    province: 'Mpumalanga',
    venue: 'Sabie Town Centre',
    start: '2026-04-25', end: '2026-04-25',
    entry: 'https://events.myactive.co.za',
    organiser: 'MyActive Events',
    org_web: 'https://events.myactive.co.za',
    distance: '10km / 19km / 40km / 65km',
    desc: 'One of South Africa\'s longest-running MTB races in the beautiful Sabie valley, Mpumalanga. Flowing singletrack, breathtaking forest views, tough climbs and fast descents. Four distances from 10km to 65km suit every rider. Held in the heart of Sabie. April 25, 2026.',
  },
  {
    title: 'Mpumalanga Enduro',
    slug: 'mpumalanga-enduro-2026',
    type: 'race',
    city: 'Sabie',
    province: 'Mpumalanga',
    venue: 'Sabie',
    start: '2026-04-26', end: '2026-04-26',
    entry: 'https://events.myactive.co.za',
    organiser: 'MyActive Events',
    org_web: 'https://events.myactive.co.za',
    distance: 'Enduro format',
    desc: 'SA National Enduro Cup Series round in Sabie, Mpumalanga. Technical enduro MTB racing through the spectacular forests and switchbacks of the Lowveld escarpment. Part of the national enduro championship series. April 26, 2026.',
  },
  {
    title: 'Sabie Xperience Stage Race',
    slug: 'sabie-xperience-2026',
    type: 'stage_race',
    city: 'Sabie',
    province: 'Mpumalanga',
    venue: 'Sabie',
    start: '2026-04-30', end: '2026-05-02',
    entry: 'https://sabiexperience.co.za',
    organiser: 'Sabie Xperience',
    org_web: 'https://sabiexperience.co.za',
    distance: 'Multi-day (3 days)',
    desc: 'South Africa\'s premier 3-day MTB stage race in the heart of Mpumalanga\'s Sabie valley. Epic forest trails, escarpment climbs, and flowing singletrack through some of the country\'s most stunning landscapes. Community atmosphere, family-friendly, great value. Riders keep coming back year after year. April 30 – May 2, 2026.',
  },
  {
    title: 'Wildevy MTB',
    slug: 'wildevy-mtb-2026',
    type: 'race',
    city: 'Mpumalanga',
    province: 'Mpumalanga',
    venue: 'Mpumalanga',
    start: '2026-08-01', end: '2026-08-01',
    entry: 'https://events.myactive.co.za',
    organiser: 'MyActive Events',
    org_web: 'https://events.myactive.co.za',
    distance: 'TBC',
    desc: 'Annual MTB event in Mpumalanga. Set in the Lowveld bushveld with challenging terrain and beautiful wilderness scenery. August 2026.',
  },
  {
    title: 'ATKV Eiland Spa MTB Race',
    slug: 'atkv-eiland-spa-mtb-2026',
    type: 'race',
    city: 'Mpumalanga',
    province: 'Mpumalanga',
    venue: 'ATKV Eiland Spa',
    start: '2026-10-03', end: '2026-10-03',
    entry: 'https://events.myactive.co.za',
    organiser: 'ATKV',
    org_web: 'https://www.atkv.org.za',
    distance: 'TBC',
    desc: 'Annual MTB race at the scenic ATKV Eiland Spa in Mpumalanga. Set along the Olifants River in a spectacular bushveld setting. Family-friendly with distances for all levels. October 3, 2026.',
  },

  // ── LIMPOPO ────────────────────────────────────────────────────────────────
  {
    title: 'Glacier Waterberg Traverse',
    slug: 'waterberg-traverse-2026',
    type: 'stage_race',
    city: 'Vaalwater',
    province: 'Limpopo',
    venue: 'Summerplace Game Reserve',
    start: '2026-05-01', end: '2026-05-03',
    entry: 'https://www.waterbergtraversemtb.co.za',
    organiser: 'Dryland Event Management',
    org_web: 'https://dryland.co.za',
    distance: '3 days · Waterberg Biosphere',
    desc: 'Limpopo\'s premier 3-day MTB stage race set in the spectacular Waterberg Biosphere bushveld. Summerplace Game Reserve — 25 min from Vaalwater, 2.5 hours from Joburg. Wildlife encounters, breathtaking views, renowned trails. Non-competitive traverse format allows relaxed and race pace simultaneously. Organised by Dryland Event Management. May 1–3, 2026.',
  },
  {
    title: 'Marakele MTB',
    slug: 'marakele-mtb-2026',
    type: 'race',
    city: 'Thabazimbi',
    province: 'Limpopo',
    venue: 'Marakele National Park',
    start: '2026-05-23', end: '2026-05-23',
    entry: 'https://events.myactive.co.za',
    organiser: 'MyActive Events',
    org_web: 'https://events.myactive.co.za',
    distance: 'TBC',
    desc: 'Annual MTB race in and around the spectacular Marakele National Park near Thabazimbi, Limpopo. One of the most scenic MTB settings in SA — the Waterberg mountains with possible Big 5 encounters along the route. May 23, 2026.',
  },
  {
    title: 'Enduranova Sport Gravel Stage Race',
    slug: 'enduranova-gravel-2026',
    type: 'stage_race',
    city: 'Limpopo',
    province: 'Limpopo',
    venue: 'Limpopo',
    start: '2026-06-13', end: '2026-06-15',
    entry: 'https://events.myactive.co.za',
    organiser: 'Enduranova Sport',
    org_web: 'https://events.myactive.co.za',
    distance: 'Gravel stage race',
    desc: 'Multi-day gravel stage race in Limpopo organised by Enduranova Sport. Set in the bushveld and mountain terrain of Limpopo province. Part of the growing gravel racing calendar in South Africa. June 13–15, 2026.',
  },
  {
    title: 'Munga 24 Hour Swords — Waterberg',
    slug: 'munga-24hr-waterberg-2026',
    type: 'race',
    city: 'Waterberg',
    province: 'Limpopo',
    venue: 'Laerskool Witpoort, Waterberg',
    start: '2026-02-14', end: '2026-02-15',
    entry: 'https://themunga.com',
    organiser: 'The Munga',
    org_web: 'https://themunga.com',
    distance: '52km / 104km / 260km / 500km',
    desc: 'The Munga 24-Hour Swords Series in the Waterberg, Limpopo — a preparatory event series for the main 1,150km Munga ultra. Weekend Warriors (52km), Mini Munga Mob (104km), and Munga Maniacs (260–500km) categories. Set in the wild Waterberg bushveld. February 14–15, 2026.',
  },
];

async function main() {
  let added = 0, skipped = 0;
  for (const e of events) {
    const exists = await sql`SELECT id FROM events WHERE slug = ${e.slug}`;
    if (exists.length) { console.log('SKIP:', e.title); skipped++; continue; }
    const cover = `https://cyclemart.co.za/uploads/events/${e.slug}.jpg?v=20260330`;
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
    console.log('ADDED:', e.title, '|', e.province, '|', e.start);
    added++;
  }
  console.log(`\nDone: ${added} added, ${skipped} skipped`);
  const byProv = await sql`SELECT province, COUNT(*) as c FROM events WHERE status='pending_review' GROUP BY province ORDER BY c DESC` as any[];
  console.log('\nUpcoming events by province:');
  byProv.forEach((r: any) => console.log(`  ${r.province || 'unset'}: ${r.c}`));
}
main().catch(console.error);
