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
    {
      title: 'Absa Cape Epic',
      description: 'Africa\'s leading three-day mountain bike stage race in the Western Cape.',
      discipline: ['MTB Stage Race'],
      city: 'Wellington',
      province: 'Western Cape',
      venueName: 'Wellington, WC',
      eventTypeId: 1,
      eventDateStart: '2026-03-12',
      eventDateEnd: '2026-03-14',
      entryUrl: 'https://entryninja.com/events/cape-epic',
      isFeatured: true,
    },
    {
      title: 'JoBerg2C',
      description: '7-day mountain bike stage race from Johannesburg to Cape Town.',
      discipline: ['MTB Stage Race'],
      city: 'Johannesburg',
      province: 'Multi-province',
      venueName: 'Johannesburg to Cape Town',
      eventTypeId: 1,
      eventDateStart: '2026-11-08',
      eventDateEnd: '2026-11-15',
      entryUrl: 'https://entryninja.com/events/joberg2c',
      isFeatured: true,
    },
    {
      title: 'Attakwas Extreme',
      description: 'Multi-day mountain bike endurance race in the Attakwas Swartberg.',
      discipline: ['MTB Endurance'],
      city: 'De Rust',
      province: 'Western Cape',
      venueName: 'Attakwas, WC',
      eventTypeId: 1,
      eventDateStart: '2026-01-30',
      eventDateEnd: '2026-02-01',
      entryUrl: 'https://entryninja.com/events/attakwas',
      isFeatured: false,
    },
    {
      title: 'Wines2Whales',
      description: '3-day mountain bike race through the Drakenstein Mountains and valleys.',
      discipline: ['MTB Stage Race'],
      city: 'Franschhoek',
      province: 'Western Cape',
      venueName: 'Franschhoek to Hermanus',
      eventTypeId: 1,
      eventDateStart: '2026-11-20',
      eventDateEnd: '2026-11-22',
      entryUrl: 'https://entryninja.com/events/wines2whales',
      isFeatured: true,
    },
    {
      title: 'Momentum Health Tankwa Trek',
      description: 'Ultra-distance 4-day mountain bike stage race in the Tankwa Karoo.',
      discipline: ['MTB Stage Race'],
      city: 'Clanwilliam',
      province: 'Western Cape',
      venueName: 'Tankwa Karoo',
      eventTypeId: 1,
      eventDateStart: '2026-02-19',
      eventDateEnd: '2026-02-22',
      entryUrl: 'https://entryninja.com/events/tankwa-trek',
      isFeatured: false,
    },
    {
      title: 'Cape Pioneer Trek',
      description: 'Professional 4-day point-to-point mountain bike stage race.',
      discipline: ['MTB Stage Race'],
      city: 'Villiersdorp',
      province: 'Western Cape',
      venueName: 'Cape to Hermanus region',
      eventTypeId: 1,
      eventDateStart: '2026-10-08',
      eventDateEnd: '2026-10-11',
      entryUrl: 'https://entryninja.com/events/cape-pioneer',
      isFeatured: true,
    },
    {
      title: 'Sani2C',
      description: '5-day mountain bike race in the Drakensberg region.',
      discipline: ['MTB Stage Race'],
      city: 'Himeville',
      province: 'KwaZulu-Natal',
      venueName: 'Sani Pass region',
      eventTypeId: 1,
      eventDateStart: '2026-05-14',
      eventDateEnd: '2026-05-18',
      entryUrl: 'https://entryninja.com/events/sani2c',
      isFeatured: false,
    },
    {
      title: 'Absa Cape Town Cycle Tour',
      description: '109km iconic mass participation road cycling event in Cape Town.',
      discipline: ['Road Sportive'],
      city: 'Cape Town',
      province: 'Western Cape',
      venueName: 'Cape Town',
      eventTypeId: 2,
      eventDateStart: '2026-03-08',
      eventDateEnd: '2026-03-08',
      entryUrl: 'https://entryninja.com/events/cape-town-cycle-tour',
      isFeatured: true,
    },
    {
      title: '94.7 Cycle Challenge',
      description: 'Gauteng\'s premier road cycling sportive with 94km and 59km routes.',
      discipline: ['Road Sportive'],
      city: 'Johannesburg',
      province: 'Gauteng',
      venueName: 'Johannesburg',
      eventTypeId: 2,
      eventDateStart: '2026-11-07',
      eventDateEnd: '2026-11-07',
      entryUrl: 'https://entryninja.com/events/947-cycle-challenge',
      isFeatured: false,
    },
    {
      title: 'Dischem Pharmacy Race to the Sun',
      description: 'Annual cycling race from the Winelands to the coast.',
      discipline: ['Road Race'],
      city: 'Paarl',
      province: 'Western Cape',
      venueName: 'Paarl to Hermanus',
      eventTypeId: 1,
      eventDateStart: '2026-02-07',
      eventDateEnd: '2026-02-07',
      entryUrl: 'https://entryninja.com/events/race-to-sun',
      isFeatured: false,
    },
    {
      title: 'Gravel & Tar Classic',
      description: 'Mixed-terrain gravel cycling adventure in the Western Cape.',
      discipline: ['Gravel'],
      city: 'Greyton',
      province: 'Western Cape',
      venueName: 'Greyton area',
      eventTypeId: 2,
      eventDateStart: '2026-06-20',
      eventDateEnd: '2026-06-20',
      entryUrl: 'https://entryninja.com/events/gravel-tar',
      isFeatured: false,
    },
    {
      title: 'Rock & Rut MTB Challenge',
      description: 'Technical mountain bike race in Gauteng with challenging singletrack.',
      discipline: ['MTB Race'],
      city: 'Roodepoort',
      province: 'Gauteng',
      venueName: 'Cradle MTB Park',
      eventTypeId: 1,
      eventDateStart: '2026-07-18',
      eventDateEnd: '2026-07-18',
      entryUrl: 'https://entryninja.com/events/rock-rut',
      isFeatured: false,
    },
    {
      title: 'Karoo to Coast',
      description: 'Scenic road cycling race from the Karoo plateau to the coast.',
      discipline: ['Road Race'],
      city: 'Grahamstown',
      province: 'Eastern Cape',
      venueName: 'Grahamstown to Hermanus',
      eventTypeId: 1,
      eventDateStart: '2026-08-15',
      eventDateEnd: '2026-08-15',
      entryUrl: 'https://entryninja.com/events/karoo-coast',
      isFeatured: false,
    },
    {
      title: 'Amashova Classic',
      description: '106km iconic road cycling race in KwaZulu-Natal.',
      discipline: ['Road Sportive'],
      city: 'Durban',
      province: 'KwaZulu-Natal',
      venueName: 'Durban area',
      eventTypeId: 2,
      eventDateStart: '2026-10-24',
      eventDateEnd: '2026-10-24',
      entryUrl: 'https://entryninja.com/events/amashova',
      isFeatured: false,
    },
    {
      title: 'Berg & Bush MTB',
      description: '3-day mountain bike stage race in the Drakensberg region.',
      discipline: ['MTB Stage Race'],
      city: 'Bergville',
      province: 'KwaZulu-Natal',
      venueName: 'Drakensberg mountains',
      eventTypeId: 1,
      eventDateStart: '2026-09-11',
      eventDateEnd: '2026-09-13',
      entryUrl: 'https://entryninja.com/events/berg-bush',
      isFeatured: false,
    },
  ]

  for (const event of eventsData) {
    const slug = await generateSlug(event.title)
    try {
      await sql`
        INSERT INTO events (
          title, slug, description, discipline, event_type,
          event_date_start, event_date_end, city, province, venue_name,
          entry_url, is_featured, status, created_at, updated_at
        ) VALUES (
          ${event.title}, ${slug}, ${event.description}, 
          ${event.discipline}, ${event.eventTypeId},
          ${event.eventDateStart}, ${event.eventDateEnd}, 
          ${event.city}, ${event.province}, ${event.venueName},
          ${event.entryUrl}, ${event.isFeatured}, 'active',
          now(), now()
        )
      `
      console.log(`✅ Created: ${event.title}`)
    } catch (err) {
      console.error(`❌ Error creating ${event.title}:`, err)
    }
  }

  console.log('✅ Seeding complete: 15 events created')
  process.exit(0)
}

main()
