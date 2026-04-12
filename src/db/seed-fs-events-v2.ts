import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

const fsEvents = [
  { title:'Race2TheSky', slug:'race2thesky-2026', type:'race', city:'Fouriesburg', province:'Free State', venue:'Uitzicht Game Lodge', start:'2026-02-07', end:'2026-02-07', entry:'https://oryxendurance.co.za/page33.html', organiser:'Oryx Endurance', org_web:'https://oryxendurance.co.za', distance:'35km / 87km / 165km', desc:'Ultimate gravel biking adventure in the Eastern Free State. Starting from Uitzicht Game Lodge near Fouriesburg with the dramatic Lesotho border mountains as backdrop. Three distances: Dash (35km), Quest (87km), and the epic 100 Miler (165km). E-bikes welcome. Part of the Oryx Endurance circuit. February 2026.' },
  { title:'Munga Grit: Trans Xhariep', slug:'munga-grit-trans-xhariep-2026', type:'stage_race', city:'Gariep Dam', province:'Free State', venue:'Gariep Dam', start:'2026-03-20', end:'2026-03-22', entry:'https://themunga.com/munga-grit-trans-xhariep', organiser:'The Munga', org_web:'https://themunga.com', distance:'70km / 160km / 500km', desc:'Munga ultra-endurance MTB/gravel event circling South Africa\'s largest dam — the Gariep. The 50-hour 500km challenge is one of SA\'s most extreme. Also 70km and 160km distances. Set at 1,300m elevation where the Orange River meets the Karoo. March 20–22, 2026.' },
  { title:'The MATSA', slug:'the-matsa-2026', type:'race', city:'Free State', province:'Free State', venue:'Kandirri Game Lodge', start:'2026-03-28', end:'2026-03-28', entry:'https://oryxendurance.co.za', organiser:'Oryx Endurance', org_web:'https://oryxendurance.co.za', distance:'35km / 87km / 165km', desc:'Oryx Endurance gravel adventure from Kandirri Game Lodge, Free State. Dash (35km), Quest (87km), and 100 Miler (165km) options. E-bikes welcome. Spectacular open Free State landscape. March 28, 2026.' },
  { title:'Gravel Rush: Lion and Tiger Edition', slug:'gravel-rush-lion-tiger-2026', type:'race', city:'Kroonstad', province:'Free State', venue:'Boskoppie Lion and Tiger Reserve', start:'2026-04-11', end:'2026-04-11', entry:'https://themunga.com', organiser:'The Munga', org_web:'https://themunga.com', distance:'165km / 265km', desc:'Gravel ultra held at Boskoppie Lion and Tiger Reserve near Kroonstad. 165km and 265km routes across vast Free State plains inside a unique game reserve. Organised by The Munga team. April 11, 2026.' },
  { title:'Sandstone Unbound', slug:'sandstone-unbound-2026', type:'stage_race', city:'Fouriesburg', province:'Free State', venue:'Uitzicht Private Game Reserve', start:'2026-04-23', end:'2026-04-27', entry:'https://www.oryxendurance.co.za/page13.html', organiser:'Oryx Endurance', org_web:'https://oryxendurance.co.za', distance:'270km over 4 days', desc:'A 4-day 270km supported gravel adventure through the ancient Witteberge mountains of the Eastern Free State. Non-competitive, open to MTB and gravel bikes. Five nights accommodation at Uitzicht Private Game Reserve included. April 23–27, 2026.' },
  { title:'Golden Gate MTB Challenge', slug:'golden-gate-mtb-2026', type:'race', city:'Clarens', province:'Free State', venue:'Golden Gate Highlands National Park', start:'2026-05-01', end:'2026-05-01', entry:'https://events.myactive.co.za', organiser:'MyActive Events', org_web:'https://events.myactive.co.za', distance:'22km / 44km', desc:'MTB and trail run set in the spectacular Golden Gate Highlands National Park near Clarens. Routes of 22km and 44km explore the park\'s iconic golden sandstone cliffs and mountain scenery. Family-friendly, for a great cause. May 1, 2026.' },
  { title:'Sungazer', slug:'sungazer-2026', type:'race', city:'Free State', province:'Free State', venue:"Tiffany's Function Venue", start:'2026-05-30', end:'2026-05-30', entry:'https://oryxendurance.co.za', organiser:'Oryx Endurance', org_web:'https://oryxendurance.co.za', distance:'44km / 87km', desc:'Part of the Oryx Endurance Free State circuit. Dash (44km) and Quest (87km) distances. Open to e-bikes. Classic rolling Free State landscape. May 30, 2026.' },
  { title:'Race2TheKaroo', slug:'race2thekaroo-2026', type:'race', city:'Free State', province:'Free State', venue:'Klipkraal Farm Stall', start:'2026-08-29', end:'2026-08-29', entry:'https://oryxendurance.co.za', organiser:'Oryx Endurance', org_web:'https://oryxendurance.co.za', distance:'46km / 85km / 165km', desc:'Gravel adventure on the Free State / Karoo border, based at Klipkraal Farm Stall. Dash (46km), Quest (85km), and 100 Miler (165km). Part of the Oryx Endurance circuit. E-bikes welcome. August 29, 2026.' },
  { title:'Battle of the Bikes', slug:'battle-of-the-bikes-2026', type:'race', city:'Jacobsdal', province:'Free State', venue:'Jacobsdal Inn', start:'2026-10-03', end:'2026-10-03', entry:'https://oryxendurance.co.za', organiser:'Oryx Endurance', org_web:'https://oryxendurance.co.za', distance:'140km', desc:'A gravel and e-bike challenge at Jacobsdal Inn on the Free State / Northern Cape border. 140km route through remote Karoo desert plains. Unique desert landscape event. October 3, 2026.' },
  { title:'Zuikerkop MTB Challenge', slug:'zuikerkop-mtb-2026', type:'race', city:'Clocolan', province:'Free State', venue:'Zuikerkop Country Game Lodge', start:'2026-10-10', end:'2026-10-10', entry:'https://events.myactive.co.za', organiser:'MyActive Events', org_web:'https://events.myactive.co.za', distance:'6km / 11km / 16km / 20km / 30km / 60km', desc:'Annual MTB challenge at Zuikerkop Country Game Lodge, Clocolan in the eastern Free State foothills. Six distances from 6km family rides to 60km — something for every rider. October 10, 2026.' },
];

// Province colour placeholder
const COLOR = '6b4a1a';

async function main() {
  let added = 0, skipped = 0;
  for (const e of fsEvents) {
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
  console.log('\nUpcoming events by province:');
  byProv.forEach((r: any) => console.log(`  ${r.province || 'unset'}: ${r.c}`));
}
main().catch(console.error);
