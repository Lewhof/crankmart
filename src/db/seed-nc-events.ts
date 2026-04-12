import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

const events = [
  {
    title: 'Orania Helpmekaar Vasbyt',
    slug: 'orania-helpmekaar-vasbyt-2026',
    type: 'race',
    city: 'Orania',
    province: 'Northern Cape',
    venue: 'Orania',
    start: '2026-04-30', end: '2026-04-30',
    entry: 'https://www.racespace.co.za/race/6499-orania-helpmekaar-vasbyt',
    organiser: 'Orania Events',
    org_web: 'https://www.orania.co.za',
    distance: '36km / 71km / 74km / 150km',
    desc: 'The Orania Helpmekaar Vasbyt — a characterful MTB and trail event in the heart of Orania in the Northern Cape. Four distances from 36km to 150km through the dramatic Karoo landscape along the Orange River. Community fundraiser with a unique Karoo atmosphere. April 30, 2026.',
  },
  {
    title: 'Karoo Lazy Hippo MTB',
    slug: 'karoo-lazy-hippo-mtb-2026',
    type: 'stage_race',
    city: 'Hanover',
    province: 'Northern Cape',
    venue: 'New Holme & Mieliefontein Guest Farm',
    start: '2026-05-17', end: '2026-05-17',
    entry: 'https://www.racespace.co.za/race/6422-karoo-lazy-hippo-mtb',
    organiser: 'Karoo Events',
    org_web: 'https://events.myactive.co.za',
    distance: '140km',
    desc: 'A premium 140km MTB experience through the remote Great Karoo between New Holme and Mieliefontein Guest Farm near Hanover. One of the most isolated and scenically dramatic cycling events in South Africa — endless Karoo plains, epic skies, and silence. May 17, 2026.',
  },
  {
    title: 'Tanqua Kuru Bicycle Race',
    slug: 'tanqua-kuru-bicycle-race-2026',
    type: 'race',
    city: 'Calvinia',
    province: 'Northern Cape',
    venue: 'Tankwa Tented Camp, R355',
    start: '2026-05-29', end: '2026-05-29',
    entry: 'https://www.racespace.co.za/race/6427-the-tanqua-kuru-bicycle-race',
    organiser: 'Tanqua Events',
    org_web: 'https://events.myactive.co.za',
    distance: '115km / 174km',
    desc: 'A gravel cycling race in the spectacular Tankwa Karoo near Calvinia, Northern Cape — the same harsh terrain that hosts the Tankwa Trek MTB stage race. Two epic distances: 115km and 174km across the remote Karoo. Set in one of SA\'s most dramatic and isolated landscapes. May 29, 2026.',
  },
  {
    title: 'Trans-Augrabies Stage Race',
    slug: 'trans-augrabies-2026',
    type: 'stage_race',
    city: 'Augrabies',
    province: 'Northern Cape',
    venue: 'Augrabies Falls National Park',
    start: '2026-06-14', end: '2026-06-19',
    entry: 'https://www.transaugrabies.co.za',
    organiser: 'Trans-Augrabies Events',
    org_web: 'https://www.transaugrabies.co.za',
    distance: '19km–208km (stage race)',
    desc: 'A thrilling multi-format endurance stage race set in the heart of the Northern Cape around Augrabies Falls National Park and the Green Kalahari. Choose MTB, Gravel Bike, or Trail Running — each with unique routes across untamed landscapes. Eight distance options from 19km to 208km over multiple stages. Truly one of SA\'s most spectacular race settings. June 14–19, 2026.',
  },
  {
    title: 'Dorperland MTB Challenge',
    slug: 'dorperland-mtb-nc-2026',
    type: 'race',
    city: 'Kenhardt',
    province: 'Northern Cape',
    venue: 'Main Street, Kenhardt',
    start: '2026-06-27', end: '2026-06-27',
    entry: 'https://www.racespace.co.za/race/6438-dorperland-mtb-challenge',
    organiser: 'Kenhardt Events',
    org_web: 'https://events.myactive.co.za',
    distance: '15km / 50km / 110km / 145km',
    desc: 'Annual MTB and gravel challenge in Kenhardt, a remote Karoo town in the Northern Cape. Four distances from 15km to 145km through the open Karoo sheep-farming countryside. Named after the iconic Dorper sheep breed of the region. Community event with a genuine Karoo welcome. June 27, 2026.',
  },
  {
    title: 'Moep 2 Sea MTB',
    slug: 'moep-2-sea-mtb-2026',
    type: 'race',
    city: 'Nigramoep',
    province: 'Northern Cape',
    venue: 'Nigramoep',
    start: '2026-08-02', end: '2026-08-02',
    entry: 'https://www.racespace.co.za/race/6443-moep-2-sea-mtb',
    organiser: 'Moep 2 Sea Events',
    org_web: 'https://events.myactive.co.za',
    distance: '250km',
    desc: 'A spectacular 250km MTB epic from the Namaqualand interior to the Atlantic coast. Starting from Nigramoep in the Northern Cape and ending at the sea — this is an iconic South African bucket-list ride through the remote Namaqualand desert and flower plains. August 2, 2026.',
  },
  {
    title: 'Namaqua Flower MTB',
    slug: 'namaqua-flower-mtb-2026',
    type: 'race',
    city: "O'Kiep",
    province: 'Northern Cape',
    venue: "O'Kiep, Namaqualand",
    start: '2026-08-09', end: '2026-08-09',
    entry: 'https://www.racespace.co.za/race/6451-namaqua-flower-mtb',
    organiser: 'Namaqualand Events',
    org_web: 'https://events.myactive.co.za',
    distance: '5km / 12km / 19km / 42km / 62km / 150km',
    desc: 'Annual MTB and trail event during Namaqualand\'s famous wildflower season near O\'Kiep, Northern Cape. Six distances from 5km family rides to a 150km epic through the world\'s most spectacular flower display. One of the most photogenic cycling events in South Africa — orange and purple carpets of flowers across the Namaqualand plains. August 9, 2026.',
  },
  {
    title: 'Namaqua Quest MTB Stage Race',
    slug: 'namaqua-quest-2026',
    type: 'stage_race',
    city: 'Springbok',
    province: 'Northern Cape',
    venue: 'Namakwa / Springbok',
    start: '2026-09-11', end: '2026-09-13',
    entry: 'https://namaquaquest.co.za',
    organiser: 'Namaqua Quest',
    org_web: 'https://namaquaquest.co.za',
    distance: '3-day stage race',
    desc: 'The Namaqua Quest returns September 11–13, 2026 in the spectacular Namakwa region near Springbok, Northern Cape. A 3-day MTB and trail running stage race through flower-covered valleys, rugged Namaqualand mountains, ancient canyons, and plains roamed by gemsbok, zebra and springbok. One of the most visually stunning cycling events in Africa. Timed for the spring wildflower season.',
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
    console.log('ADDED:', e.title, '|', e.city, '|', e.start);
    added++;
  }
  console.log(`\nDone: ${added} added, ${skipped} skipped`);
  const byProv = await sql`SELECT province, COUNT(*) as c FROM events WHERE status='pending_review' GROUP BY province ORDER BY c DESC` as any[];
  console.log('\nFull calendar:');
  byProv.forEach((r: any) => console.log(`  ${r.province || 'unset'}: ${r.c}`));
}
main().catch(console.error);
