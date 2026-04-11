import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

const missing = [
  {
    name: 'BikeHub SA',
    slug: 'bikehub-sa',
    description: "South Africa's largest cycling classified ads platform and community hub. Buy and sell second-hand bikes, list upcoming cycling events across SA, and connect with 175,000+ monthly cyclists. The go-to platform for SA cycling classifieds.",
    website: 'https://bikehub.co.za',
    province: 'Western Cape', city: 'Cape Town',
    services: ['classifieds', 'events_listing', 'community'],
    specialisation: ['second_hand', 'community'],
  },
  {
    name: 'Oak Valley 24 Hour',
    slug: 'oak-valley-24-hour',
    description: "Annual 24-hour MTB and trail running event at the beautiful Oak Valley Wine Estate near Grabouw, Elgin. Riders and runners tackle as many laps as possible through the night. A beloved Western Cape endurance event combining stunning scenery with a unique overnight challenge. Held in March.",
    website: 'https://www.oakvalley.co.za',
    province: 'Western Cape', city: 'Grabouw',
    services: ['events'],
    specialisation: ['MTB', 'trail_running', 'endurance'],
  },
  {
    name: 'Sneeuberg Crawl MTB',
    slug: 'sneeuberg-crawl-mtb',
    description: "MTB race in the remote Murraysburg area of the Western Cape Karoo. Routes of 25km, 60km and 110km tackle the dramatic Sneeuberg mountain range — one of the Cape's most isolated and rugged cycling terrains. Starts from the Murraysburg Show Grounds. Held in March.",
    website: 'https://events.myactive.co.za',
    province: 'Western Cape', city: 'Murraysburg',
    services: ['events'],
    specialisation: ['MTB', 'gravel'],
  },
  {
    name: 'Houw Hoek MTB Tour',
    slug: 'houw-hoek-mtb-tour',
    description: "Annual MTB tour based at the historic Houw Hoek Hotel in the Greater Hermanus area. Routes of 46km, 48km and 95km wind through the beautiful Overberg farmlands and mountains. A social, scenic event combining great riding with legendary Houw Hoek hospitality. Held in April.",
    website: 'https://events.myactive.co.za',
    province: 'Western Cape', city: 'Hermanus',
    services: ['events'],
    specialisation: ['MTB', 'road'],
  },
  {
    name: 'The Canola Roller',
    slug: 'the-canola-roller',
    description: "Annual MTB event based in Greyton, Western Cape, set among the spectacular canola fields and mountain passes of the Overberg. Routes of 30km, 50km, 80km and 130km tackle rolling farmlands and challenging climbs in one of the Cape's most photogenic cycling landscapes. Held in September.",
    website: 'https://events.myactive.co.za',
    province: 'Western Cape', city: 'Greyton',
    services: ['events'],
    specialisation: ['MTB', 'gravel'],
  },
  {
    name: 'Weekend Warrior Grabouw',
    slug: 'weekend-warrior-grabouw',
    description: "Part of the Red Cherry Events Weekend Warrior series — a beloved 2-day MTB stage race format for riders of all levels. The Grabouw edition is based at Elgin Grabouw Country Club and takes riders through the fruit farms and mountains of the Elgin Valley. Distances from 22km to 85km. Held in April.",
    website: 'https://redcherryevents.co.za',
    province: 'Western Cape', city: 'Grabouw',
    services: ['events'],
    specialisation: ['MTB', 'stage_race'],
  },
  {
    name: 'Tsitsikamma 3-Day MTB',
    slug: 'tsitsikamma-3-day-mtb',
    description: "A premium 3-day, 160km MTB experience along the iconic Tsitsikamma coastline, based at The Crags near Plettenberg Bay. Riders explore the Garden Route's most dramatic terrain — ancient forests, coastal cliffs, and indigenous bush. Limited to a small field for an exclusive, guided adventure feel. Held in May.",
    website: 'https://events.myactive.co.za',
    province: 'Western Cape', city: 'Plettenberg Bay',
    services: ['events'],
    specialisation: ['MTB', 'adventure', 'stage_race'],
  },
  {
    name: 'Forest Boogie',
    slug: 'forest-boogie-hogsback',
    description: "A legendary MTB stage race reimagined by Red Cherry Events — held in the mystical, moss-draped forests of Hogsback in the Amatola Mountains, Eastern Cape. Two days of world-class singletrack through ancient indigenous forest, based at Arminel Lodge. Gold and Silver route classes. Held in March.",
    website: 'https://forestboogie.co.za',
    province: 'Eastern Cape', city: 'Hogsback',
    services: ['events'],
    specialisation: ['MTB', 'stage_race'],
  },
  {
    name: 'Bay by Bike MTB Race',
    slug: 'bay-by-bike-mtb',
    description: "Annual MTB race and trail run in Gqeberha (Port Elizabeth), Eastern Cape. Based at Baywest Mall, routes of 5km to 40km explore the coastal trails and green corridors of the Bay. Community-focused event with trail running options. Accessible distances for all fitness levels. Held in March.",
    website: 'https://events.myactive.co.za',
    province: 'Eastern Cape', city: 'Gqeberha',
    services: ['events'],
    specialisation: ['MTB', 'trail_running', 'community'],
  },
  {
    name: 'Zest Fruit Trans Elands',
    slug: 'zest-fruit-trans-elands',
    description: "100km MTB race in the Jeffrey's Bay / Sarah Baartman area of the Eastern Cape, starting from The Ferry Hotel. A fast, scenic route through the Elands River valley and surrounding farmlands. Popular with Eastern Cape riders as a solid century challenge. Held in May.",
    website: 'https://events.myactive.co.za',
    province: 'Eastern Cape', city: "Jeffrey's Bay",
    services: ['events'],
    specialisation: ['MTB', 'endurance'],
  },
  {
    name: 'Nieu Bethesda MTB',
    slug: 'nieu-bethesda-mtb',
    description: "MTB event in the remote and spectacular Karoo village of Nieu-Bethesda, Eastern Cape. Routes from 28km to an epic 230km tackle the dramatic Sneeuberg mountains and Karoo plains surrounding one of SA's most unique cultural villages. Based at Ganora Guestfarm. Held in April.",
    website: 'https://events.myactive.co.za',
    province: 'Eastern Cape', city: 'Nieu-Bethesda',
    services: ['events'],
    specialisation: ['MTB', 'gravel', 'adventure'],
  },
  {
    name: 'Berg & Bush Descent',
    slug: 'berg-and-bush-descent',
    description: "The longer, more epic sister event to the Berg & Bush 2-Day Stage Race — a 190km MTB challenge through the wild Zululand bush of KwaZulu-Natal. Self-navigation through the African bush over one continuous route. Limited field, authentic bush experience. Held in June.",
    website: 'https://www.bergandbush.co.za',
    province: 'KwaZulu-Natal', city: 'Zululand',
    services: ['events'],
    specialisation: ['MTB', 'endurance', 'adventure'],
  },
  {
    name: 'Jackal Dash MTB Challenge',
    slug: 'jackal-dash-mtb',
    description: "Popular MTB challenge in Gauteng based at Heron Bridge College, with 45km and 65km route options. E-bike friendly. A well-organised and scenic community event in the Johannesburg surrounds. Held in February.",
    website: 'https://events.myactive.co.za',
    province: 'Gauteng', city: 'Johannesburg',
    services: ['events'],
    specialisation: ['MTB', 'e-bike', 'community'],
  },
  {
    name: 'Luxliner Route 66',
    slug: 'luxliner-route-66',
    description: "A unique multi-day MTB and gravel experience in the Magaliesberg, Gauteng, based at the stunning Mount Grace Hotel & Spa. Combines premium lodge accommodation with 2 or 3 days of riding through the Magalies mountains. 45–155km options. Luxury meets adventure — a bucket-list Gauteng cycling experience.",
    website: 'https://events.myactive.co.za',
    province: 'Gauteng', city: 'Magaliesburg',
    services: ['events'],
    specialisation: ['MTB', 'gravel', 'adventure'],
  },
  {
    name: 'Tour de Addo',
    slug: 'tour-de-addo',
    description: "Premium 100km MTB experience in the Addo / Jansenville area of the Eastern Cape, centred around the Darlington Dam. A scenic Karoo route through game-rich landscapes near the Addo Elephant National Park. Small, exclusive field for a quality experience. Held in March.",
    website: 'https://events.myactive.co.za',
    province: 'Eastern Cape', city: 'Jansenville',
    services: ['events'],
    specialisation: ['MTB', 'adventure'],
  },
  {
    name: 'The MATSA',
    slug: 'the-matsa',
    description: "Part of the Oryx Endurance gravel and MTB circuit — a gravel adventure based at Kandirri Game Lodge in the Free State. Three distance options: Dash (35km), Quest (87km), and the full 100 Miler (165km). E-bikes welcome. Set in the dramatic Free State landscape. Held in March.",
    website: 'https://oryxendurance.co.za',
    province: 'Free State', city: 'Free State',
    services: ['events'],
    specialisation: ['gravel', 'MTB', 'e-bike'],
  },
  {
    name: 'Gravel Rush: Lion and Tiger Edition',
    slug: 'gravel-rush-lion-and-tiger',
    description: "An epic gravel ultra-endurance event in the Free State based at Boskoppie Lion and Tiger Reserve near Kroonstad. Routes of 165km and 265km tackle the vast, open Free State plains in a unique reserve setting. Organised by The Munga team. Held in April.",
    website: 'https://themunga.com',
    province: 'Free State', city: 'Kroonstad',
    services: ['events'],
    specialisation: ['gravel', 'ultra', 'endurance'],
  },
];

async function main() {
  let added = 0, skipped = 0;
  for (const e of missing) {
    const exists = await sql`SELECT id FROM businesses WHERE slug = ${e.slug}`;
    if (exists.length) { console.log('SKIP (exists):', e.name); skipped++; continue; }
    
    await sql`
      INSERT INTO businesses (
        name, slug, description, website, province, city,
        business_type, services, listing_status,
        cover_url, is_verified, created_at, updated_at
      ) VALUES (
        ${e.name}, ${e.slug}, ${e.description}, ${e.website},
        ${e.province}, ${e.city},
        'event_organiser',
        ${e.services as any},
        'active',
        ${`/api/placeholder/cover?slug=${e.slug}&color=${getColor(e.province)}`},
        false, NOW(), NOW()
      )
    `;
    console.log('ADDED:', e.name);
    added++;
  }
  console.log(`\nDone: ${added} added, ${skipped} skipped`);

  const total = await sql`SELECT COUNT(*) as c FROM businesses WHERE business_type = 'event_organiser'`;
  console.log('Total event organisers now:', (total[0] as any).c);
}

function getColor(province: string): string {
  const map: Record<string,string> = {
    'Western Cape': '1a6b3c',
    'Gauteng': '1a3a6b',
    'KwaZulu-Natal': '6b1a1a',
    'Eastern Cape': '4a1a6b',
    'Free State': '6b4a1a',
  };
  return map[province] || '1a3a6b';
}

main().catch(console.error);
