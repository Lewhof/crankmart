import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

const events = [
  // January
  { title:'WTF MTB Challenge', slug:'wtf-mtb-2026', type:'fun_ride', city:'Midrand', province:'Gauteng', venue:'Prime View Adventure & Leisure, Olifantsfontein', start:'2026-01-10', end:'2026-01-10', entry:'https://www.racespace.co.za/race/5469-wtf-mtb-challenge', organiser:'WTF Events', org_web:'https://events.myactive.co.za', distance:'10km / 20km / 40km / 60km', desc:'Free-entry MTB challenge at Prime View Adventure & Leisure in Olifantsfontein, Midrand. Four distances from 10km to 60km. E-bikes welcome. Great start to the GP cycling year with a fun community atmosphere. January 10, 2026.' },
  { title:'Summer Fast One MTB', slug:'summer-fast-one-mtb-2026', type:'race', city:'Randvaal', province:'Gauteng', venue:'Cafe Du Cirque, Daleside', start:'2026-01-18', end:'2026-01-18', entry:'https://www.racespace.co.za/race/5585-summer-fast-one-mtb', organiser:'Fast One Events', org_web:'https://events.myactive.co.za', distance:'20km / 40km / 60km / 75km', desc:'Popular annual summer MTB race at Cafe Du Cirque, Daleside near Randvaal. Four distances from 20km to 75km through the scenic Vaal highveld terrain. Great community event kicking off the GP MTB season. January 18, 2026.' },
  // February
  { title:'Luxliner Route 66 — 3-Day MTB', slug:'luxliner-route66-3day-2026', type:'stage_race', city:'Magaliesburg', province:'Gauteng', venue:'Mount Grace Hotel & Spa', start:'2026-02-15', end:'2026-02-17', entry:'https://www.racespace.co.za/race/5878-the-luxliner-route-66-3-day-mtb-experience', organiser:'Luxliner Events', org_web:'https://events.myactive.co.za', distance:'45km / 60km per day', desc:'3-day luxury MTB experience based at Mount Grace Hotel & Spa in the Magaliesberg. Premium lodge accommodation combined with guided trail riding through the Magalies mountains. Relaxed, scenic atmosphere. February 15–17, 2026.' },
  { title:'Luxliner Route 66 — 2-Day Gravel', slug:'luxliner-route66-gravel-2026', type:'stage_race', city:'Magaliesburg', province:'Gauteng', venue:'Mount Grace Hotel & Spa', start:'2026-02-28', end:'2026-03-01', entry:'https://www.racespace.co.za/race/5877-the-luxliner-route-66-2-day-gravel-experience', organiser:'Luxliner Events', org_web:'https://events.myactive.co.za', distance:'80km / 155km', desc:'2-day gravel experience at Mount Grace Hotel & Spa, Magaliesburg. 80km and 155km gravel routes through the scenic Magalies mountains with luxury hotel accommodation. February 28 – March 1, 2026.' },
  { title:'Jackal Dash MTB Challenge', slug:'jackal-dash-2026', type:'race', city:'Johannesburg', province:'Gauteng', venue:'Heron Bridge College', start:'2026-02-21', end:'2026-02-21', entry:'https://www.racespace.co.za/race/6022-jackal-dash-mtb-challenge', organiser:'Jackal Dash Events', org_web:'https://events.myactive.co.za', distance:'45km / 65km', desc:'Popular MTB challenge at Heron Bridge College in the Johannesburg area. Two distances: 45km and 65km. E-bikes welcome. Well-organised community event with scenic trails. February 21, 2026.' },
  // March
  { title:'XCOSA MTB Park Rides — Pretoria', slug:'xcosa-mtb-pretoria-2026', type:'fun_ride', city:'Pretoria', province:'Gauteng', venue:'Voortrekker Monument', start:'2026-03-14', end:'2026-03-14', entry:'https://www.racespace.co.za/race/6376-xcosa-events-mtb-park-rides', organiser:'XCOSA Events', org_web:'https://events.myactive.co.za', distance:'25km', desc:'XCOSA MTB Park Rides at the iconic Voortrekker Monument in Pretoria. 25km trail ride through the historical Monument grounds and surrounding trails. Monthly community rides with a social atmosphere. March 14, 2026.' },
  { title:'Mont Blanc Ride for a Reason', slug:'mont-blanc-ride-2026', type:'fun_ride', city:'Johannesburg', province:'Gauteng', venue:'Taroko Trail Park, Klipfontein', start:'2026-03-28', end:'2026-03-28', entry:'https://www.racespace.co.za/race/6380-mont-blanc-ride-for-a-reason', organiser:'Mont Blanc Events', org_web:'https://events.myactive.co.za', distance:'10km / 25km / 45km / 65km', desc:'Charity MTB ride at Taroko Trail Park, Klipfontein, Johannesburg. Four distances from 10km to 65km. Riding for a cause — community fundraiser with a great trail atmosphere east of Joburg. March 28, 2026.' },
  // April
  { title:'Fedgroup Cradle 100', slug:'fedgroup-cradle-100-2026', type:'stage_race', city:'Muldersdrift', province:'Gauteng', venue:'Fedgroup Trails, Avianto Estate', start:'2026-04-11', end:'2026-04-12', entry:'https://www.fedgrouptrails.co.za/cradle-100', organiser:'Fedgroup Trails', org_web:'https://www.fedgrouptrails.co.za', distance:'10km / 25km / 45km / 100km (2-day stage)', desc:'Annual MTB event on 80km+ of trails in the Cradle of Humankind, 45km from Joburg. Distances from 10km to a 2-day 100km stage race across Avianto and Cradle Moon estates. Spectacular Muldersdrift landscape. April 11–12, 2026.' },
  // May
  { title:'Doornpoort MTB Challenge', slug:'doornpoort-mtb-2026', type:'race', city:'Pretoria', province:'Gauteng', venue:'Doornpoort, Pretoria', start:'2026-05-23', end:'2026-05-23', entry:'https://events.myactive.co.za', organiser:'MyActive Events', org_web:'https://events.myactive.co.za', distance:'2km / 15km / 30km / 60km / 80km', desc:'Annual MTB challenge at Doornpoort, Pretoria North. Five distances from a 2km family ride to an 80km challenge. Scenic trails in the northern Pretoria area. May 23, 2026.' },
  // September
  { title:'Die Krip MTB Challenge', slug:'die-krip-mtb-2026', type:'race', city:'Magaliesburg', province:'Gauteng', venue:'Die Krip Guest Farm', start:'2026-09-05', end:'2026-09-05', entry:'https://events.myactive.co.za', organiser:'MyActive Events', org_web:'https://events.myactive.co.za', distance:'6km / 11km / 16km / 25km / 40km / 80km / 100km', desc:'Annual MTB challenge at Die Krip Guest Farm in the beautiful Magaliesberg. Seven distances from 6km family fun to a 100km challenge through the spectacular Magalies mountains. September 5, 2026.' },
  // Road events from CSA calendar
  { title:'Ikusasa Lathu International Cycling Festival', slug:'ikusasa-lathu-cycling-2026', type:'festival', city:'Johannesburg', province:'Gauteng', venue:'Johannesburg', start:'2026-08-21', end:'2026-08-25', entry:'https://www.cyclingsa.com', organiser:'Cycling South Africa', org_web:'https://www.cyclingsa.com', distance:'Various road distances', desc:'International cycling festival in Johannesburg hosted by Cycling South Africa. Multi-day festival of cycling culture, racing, and community events. Part of the national CSA calendar. August 21–25, 2026.' },
  { title:'SA National Road & Time Trial Championships', slug:'sa-road-tt-champs-2026', type:'race', city:'Johannesburg', province:'Gauteng', venue:'Southern Gauteng', start:'2026-02-05', end:'2026-02-07', entry:'https://www.cyclingsa.com', organiser:'Cycling South Africa', org_web:'https://www.cyclingsa.com', distance:'Road race / TT', desc:'SA National Road Cycling and Time Trial Championships held in Southern Gauteng. Elite SA cyclists compete for national champion jerseys across road race, criterium, and time trial disciplines. February 5–7, 2026.' },
  { title:'Dischem Ride for Sight', slug:'dischem-ride-for-sight-2026', type:'fun_ride', city:'Johannesburg', province:'Gauteng', venue:'East Rand', start:'2026-02-15', end:'2026-02-15', entry:'https://events.myactive.co.za', organiser:'Ride for Sight Foundation', org_web:'https://www.rideforeyes.co.za', distance:'Various distances', desc:'Annual charity cycling event raising funds for eye care and vision research. Ride for Sight takes place in the East Rand area of Gauteng. One of SA\'s most important charity cycling events. February 15, 2026.' },
  { title:'Meals on Wheels Cycling Challenge', slug:'meals-on-wheels-cycling-2026', type:'fun_ride', city:'Johannesburg', province:'Gauteng', venue:'Southern Gauteng', start:'2026-08-16', end:'2026-08-16', entry:'https://events.myactive.co.za', organiser:'Meals on Wheels SA', org_web:'https://events.myactive.co.za', distance:'Various distances', desc:'Annual cycling charity event supporting Meals on Wheels South Africa. Part of the Mzansi Series. Riders of all levels raise funds for feeding schemes across the country. August 16, 2026.' },
  { title:'Spring Gravel Event — Gauteng', slug:'spring-gravel-gauteng-2026', type:'race', city:'Johannesburg', province:'Gauteng', venue:'Southern Gauteng', start:'2026-09-20', end:'2026-09-20', entry:'https://events.myactive.co.za', organiser:'SA Gravel Series', org_web:'https://events.myactive.co.za', distance:'Gravel distances', desc:'SA Gravel Series round in Southern Gauteng. Part of the national gravel cycling championship series. September 20, 2026.' },
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
