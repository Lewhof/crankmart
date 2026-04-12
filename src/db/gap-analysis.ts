import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const rows = await sql`SELECT name, slug FROM businesses WHERE business_type = 'event_organiser' ORDER BY name` as any[];
  const inDB = new Set(rows.map((r: any) => r.slug));
  
  // Everything we researched and intended to add
  const researched = [
    // From seed JSON we built
    { name: 'BikeHub SA', slug: 'bikehub-sa' },
    { name: 'Cycling South Africa (CSA)', slug: 'cycling-south-africa' },
    { name: 'Dryland Event Management', slug: 'dryland-events' },
    { name: 'Chain Gang Events', slug: 'chaingang-events' },
    { name: 'Lenick Promotions', slug: 'lenick-promotions' },
    { name: 'MyActive Events', slug: 'myactive-events' },
    { name: 'Oryx Endurance', slug: 'oryx-endurance' },
    { name: 'Red Cherry Events', slug: 'red-cherry-events' },
    { name: 'ROR Events', slug: 'ror-events' },
    { name: 'Pedal Power Association', slug: 'pedal-power-association' },
    { name: 'Ronde Series Events', slug: 'ronde-series-events' },
    { name: 'Cape Town Cycle Tour Trust', slug: 'cape-town-cycle-tour-trust' },
    { name: 'Cape Pioneer Trek', slug: 'cape-pioneer-trek' },
    { name: 'Absa Cape Epic', slug: 'absa-cape-epic' },
    { name: '99er Cycle Tour', slug: '99er-cycle-tour' },
    { name: 'Ford Trailseeker MTB Series', slug: 'ford-trailseeker-mtb-series' },
    { name: 'The Gallows Gravel Race', slug: 'the-gallows-gravel-race' },
    { name: 'Darling Brew MTB Events', slug: 'darling-brew-cycling-events' },
    { name: 'GravDuro', slug: 'gravduro-event' },
    { name: 'The 36ONE MTB Challenge', slug: 'the-36one-mtb-challenge' },
    { name: 'KAP sani2c', slug: 'kap-sani2c' },
    { name: 'Euro Steel Drak Descent', slug: 'euro-steel-drak-descent' },
    { name: 'Karkloof Trail Festival', slug: 'karkloof-trail-festival' },
    { name: 'Freedom Challenge', slug: 'freedom-challenge' },
    { name: 'Fedgroup Trails — Cradle 100', slug: 'fedgroup-trails-cradle-100' },
    { name: 'The Munga', slug: 'the-munga' },
    { name: 'Cow and Bull MTB & Gravel Endurance', slug: 'cow-and-bull-mtb' },
    { name: 'Berg & Bush MTB Stage Race', slug: 'berg-and-bush' },
    { name: 'Investec Great Kei Trek', slug: 'investec-great-kei-trek' },
    { name: 'Ride The Karoo', slug: 'ride-the-karoo' },
    { name: 'M&G Investments PE Plett', slug: 'pe-plett-the-tour' },
    { name: 'UMKO Adventure MTB', slug: 'umko-adventure-mtb' },
    { name: 'Ride the Midlands', slug: 'ride-the-midlands-kzn' },
    { name: 'Race2TheSky', slug: 'race2thesky' },
    { name: 'Sandstone Unbound', slug: 'sandstone-unbound' },
    { name: 'Munga Grit: Trans Xhariep', slug: 'munga-grit-trans-xhariep' },
    { name: 'Golden Gate MTB Challenge', slug: 'golden-gate-mtb-challenge' },
    { name: 'Racepass', slug: 'racepass-events' },
    // Found on RaceSpace but NEVER added to seed
    { name: 'Oak Valley 24 Hour', slug: 'oak-valley-24-hour' },
    { name: 'Sneeuberg Crawl MTB', slug: 'sneeuberg-crawl-mtb' },
    { name: 'Houw Hoek MTB Tour', slug: 'houw-hoek-mtb-tour' },
    { name: 'The Canola Roller', slug: 'the-canola-roller' },
    { name: 'Weekend Warrior Grabouw', slug: 'weekend-warrior-grabouw' },
    { name: 'Tsitsikamma 3-Day MTB', slug: 'tsitsikamma-3-day-mtb' },
    { name: 'Forest Boogie Hogsback', slug: 'forest-boogie-hogsback' },
    { name: 'Bay by Bike MTB Race', slug: 'bay-by-bike-mtb' },
    { name: 'Zest Fruit Trans Elands', slug: 'zest-fruit-trans-elands' },
    { name: 'Nieu Bethesda MTB', slug: 'nieu-bethesda-mtb' },
    { name: 'Berg & Bush Descent', slug: 'berg-and-bush-descent' },
    { name: 'Jackal Dash MTB', slug: 'jackal-dash-mtb' },
    { name: 'Luxliner Route 66', slug: 'luxliner-route-66' },
    { name: 'Tour de Addo', slug: 'tour-de-addo' },
    { name: 'The MATSA', slug: 'the-matsa' },
    { name: 'Gravel Rush Lion and Tiger', slug: 'gravel-rush-lion-and-tiger' },
  ];

  console.log('\n=== IN DB (from our research) ===');
  researched.filter(r => inDB.has(r.slug)).forEach(r => console.log('  ✅ ' + r.name));
  
  console.log('\n=== MISSING FROM DB (not seeded) ===');
  const missing = researched.filter(r => !inDB.has(r.slug));
  missing.forEach(r => console.log('  ❌ ' + r.name + ' [' + r.slug + ']'));

  console.log('\n=== IN DB BUT NOT IN OUR RESEARCH (pre-existing) ===');
  const researchedSlugs = new Set(researched.map(r => r.slug));
  rows.filter((r: any) => !researchedSlugs.has(r.slug)).forEach((r: any) => console.log('  ➕ ' + r.name + ' [' + r.slug + ']'));
}
main().catch(console.error);
