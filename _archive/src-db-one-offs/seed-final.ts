import { neon } from '@neondatabase/serverless'

async function generateSlug(title: string): Promise<string> {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
}

async function main() {
  const sql = neon(process.env.DATABASE_URL!)

  const eventsData = [
    { title: 'Absa Cape Epic', desc: 'Africa\'s leading three-day mountain bike stage race in the Western Cape.', disc: '{MTB}', city: 'Wellington', prov: 'Western Cape', venue: 'Wellington, WC', start: '2026-03-12', end: '2026-03-14', url: 'https://entryninja.com/events/cape-epic', feat: true },
    { title: 'JoBerg2C', desc: '7-day mountain bike stage race from Johannesburg to Cape Town.', disc: '{MTB}', city: 'Johannesburg', prov: 'Multi-province', venue: 'Johannesburg to Cape Town', start: '2026-11-08', end: '2026-11-15', url: 'https://entryninja.com/events/joberg2c', feat: true },
    { title: 'Attakwas Extreme', desc: 'Multi-day mountain bike endurance race in the Attakwas Swartberg.', disc: '{MTB}', city: 'De Rust', prov: 'Western Cape', venue: 'Attakwas, WC', start: '2026-01-30', end: '2026-02-01', url: 'https://entryninja.com/events/attakwas', feat: false },
    { title: 'Wines2Whales', desc: '3-day mountain bike race through the Drakenstein Mountains and valleys.', disc: '{MTB}', city: 'Franschhoek', prov: 'Western Cape', venue: 'Franschhoek to Hermanus', start: '2026-11-20', end: '2026-11-22', url: 'https://entryninja.com/events/wines2whales', feat: true },
    { title: 'Momentum Health Tankwa Trek', desc: 'Ultra-distance 4-day mountain bike stage race in the Tankwa Karoo.', disc: '{MTB}', city: 'Clanwilliam', prov: 'Western Cape', venue: 'Tankwa Karoo', start: '2026-02-19', end: '2026-02-22', url: 'https://entryninja.com/events/tankwa-trek', feat: false },
    { title: 'Cape Pioneer Trek', desc: 'Professional 4-day point-to-point mountain bike stage race.', disc: '{MTB}', city: 'Villiersdorp', prov: 'Western Cape', venue: 'Cape to Hermanus region', start: '2026-10-08', end: '2026-10-11', url: 'https://entryninja.com/events/cape-pioneer', feat: true },
    { title: 'Sani2C', desc: '5-day mountain bike race in the Drakensberg region.', disc: '{MTB}', city: 'Himeville', prov: 'KwaZulu-Natal', venue: 'Sani Pass region', start: '2026-05-14', end: '2026-05-18', url: 'https://entryninja.com/events/sani2c', feat: false },
    { title: 'Absa Cape Town Cycle Tour', desc: '109km iconic mass participation road cycling event in Cape Town.', disc: '{Road}', city: 'Cape Town', prov: 'Western Cape', venue: 'Cape Town', start: '2026-03-08', end: '2026-03-08', url: 'https://entryninja.com/events/cape-town-cycle-tour', feat: true },
    { title: '94.7 Cycle Challenge', desc: 'Gauteng\'s premier road cycling sportive with 94km and 59km routes.', disc: '{Road}', city: 'Johannesburg', prov: 'Gauteng', venue: 'Johannesburg', start: '2026-11-07', end: '2026-11-07', url: 'https://entryninja.com/events/947-cycle-challenge', feat: false },
    { title: 'Dischem Pharmacy Race to the Sun', desc: 'Annual cycling race from the Winelands to the coast.', disc: '{Road}', city: 'Paarl', prov: 'Western Cape', venue: 'Paarl to Hermanus', start: '2026-02-07', end: '2026-02-07', url: 'https://entryninja.com/events/race-to-sun', feat: false },
    { title: 'Gravel & Tar Classic', desc: 'Mixed-terrain gravel cycling adventure in the Western Cape.', disc: '{Gravel}', city: 'Greyton', prov: 'Western Cape', venue: 'Greyton area', start: '2026-06-20', end: '2026-06-20', url: 'https://entryninja.com/events/gravel-tar', feat: false },
    { title: 'Rock & Rut MTB Challenge', desc: 'Technical mountain bike race in Gauteng with challenging singletrack.', disc: '{MTB}', city: 'Roodepoort', prov: 'Gauteng', venue: 'Cradle MTB Park', start: '2026-07-18', end: '2026-07-18', url: 'https://entryninja.com/events/rock-rut', feat: false },
    { title: 'Karoo to Coast', desc: 'Scenic road cycling race from the Karoo plateau to the coast.', disc: '{Road}', city: 'Grahamstown', prov: 'Eastern Cape', venue: 'Grahamstown to Hermanus', start: '2026-08-15', end: '2026-08-15', url: 'https://entryninja.com/events/karoo-coast', feat: false },
    { title: 'Amashova Classic', desc: '106km iconic road cycling race in KwaZulu-Natal.', disc: '{Road}', city: 'Durban', prov: 'KwaZulu-Natal', venue: 'Durban area', start: '2026-10-24', end: '2026-10-24', url: 'https://entryninja.com/events/amashova', feat: false },
    { title: 'Berg & Bush MTB', desc: '3-day mountain bike stage race in the Drakensberg region.', disc: '{MTB}', city: 'Bergville', prov: 'KwaZulu-Natal', venue: 'Drakensberg mountains', start: '2026-09-11', end: '2026-09-13', url: 'https://entryninja.com/events/berg-bush', feat: false },
  ]

  for (const event of eventsData) {
    const slug = await generateSlug(event.title)
    try {
      await sql`
        INSERT INTO events (
          organizer_id, title, slug, description, discipline,
          event_date_start, event_date_end, city, province, venue_name,
          entry_url, is_featured, status, created_at, updated_at
        ) VALUES (
          '00000000-0000-0000-0000-000000000000'::uuid, 
          ${event.title}, ${slug}, ${event.desc}, ${event.disc}::text[],
          ${event.start}, ${event.end}, 
          ${event.city}, ${event.prov}, ${event.venue},
          ${event.url}, ${event.feat}, 'active',
          now(), now()
        )
      `
      console.log(`✅ Created: ${event.title}`)
    } catch (err: any) {
      if (err.code === '23505') {
        console.log(`ℹ️ Already exists: ${event.title}`)
      } else {
        console.error(`❌ Error creating ${event.title}:`, err.message)
      }
    }
  }

  console.log('\n✅ Events module complete: 15 events seeded')
  process.exit(0)
}

main()
