import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

// CrankMart launch blog posts — Phase 1 GEO/SEO
// Authorised by Hein (CEO) via Elon (CTO) — 2026-03-28

interface BlogPost {
  title: string
  slug: string
  excerpt: string
  body: string
  category: string
  tags: string[]
  featured: boolean
}

const BLOG_POSTS: BlogPost[] = [
  {
    title: 'Best Bike Shops in Cape Town — The Complete 2026 Guide',
    slug: 'best-bike-shops-cape-town-2026',
    excerpt:
      "Cape Town is South Africa's cycling heartland. With world-class routes, a booming cycling community, and events like the Cape Town Cycle Tour drawing thousands annually, the Mother City has everything a cyclist needs — including some of the best bike shops in the country.",
    body: `# Best Bike Shops in Cape Town — The Complete 2026 Guide

Cape Town is South Africa's cycling heartland. With world-class routes, a booming cycling community, and events like the Cape Town Cycle Tour drawing thousands annually, the Mother City has everything a cyclist needs — including some of the best bike shops in the country.

Whether you're hunting for a high-end road bike, a rugged MTB, gravel gear, or just a quick repair, Cape Town's bike shops range from tiny neighbourhood specialists to full-service megastores. This guide covers every major area of the city, from the City Bowl to the Winelands, so you can find the shop that's right for you.

Find all Cape Town bike shops on [CrankMart](https://crankmart.com/directory?city=Cape+Town).

---

## City Bowl & Surrounding Areas

The City Bowl remains the retail heart of Cape Town, with easy access from Table Mountain to the Waterfront.

### Cycle Works Cape Town

Cycle Works is the go-to destination for serious road cyclists in the City Bowl. They stock premium brands like Trek, Specialized, and Giant, plus a dedicated section for components and accessories. Cycle Works offers professional bike fitting using video analysis — essential if you're training for the Cycle Tour or racing.

**What to expect:** Expert fitting, premium road bikes, component sourcing, race-focused advice, professional mechanics.

### The Bicycle Hub

Housed near the V&A Waterfront, The Bicycle Hub is one of Cape Town's most accessible bike shops for tourists and locals alike. It's a family-friendly shop with a huge range — road bikes, MTBs, hybrids, kids' bikes, and a vast selection of helmets, lights, and safety gear.

---

## Atlantic Seaboard

The Atlantic Seaboard's cycling scene is centred on the beachfront cycle paths and the demanding Chapman's Peak and Suikerbossie climbs.

### Pedal Power Association Shop

The PPA shop is the heartbeat of Cape Town's cycling community. Beyond the shop floor — stocked with a wide range of commuter and recreational gear — the PPA runs regular group rides, advocacy campaigns, and events. It's a one-stop-shop for cyclists who want to be part of the Cape Town cycling culture.

### Atlantic Cycles

A boutique shop on the Seaboard catering to high-end road cyclists. Atlantic Cycles stocks a curated range of premium road bikes and components, with a focus on aerodynamic race setups and custom builds for serious athletes.

---

## Southern Suburbs

The Southern Suburbs — from Observatory to Constantia — are home to some of Cape Town's most popular cycling routes and several outstanding bike shops.

### Cape Cycle

One of the oldest and most respected bike shops in the Southern Suburbs, Cape Cycle stocks a comprehensive range of road bikes, MTBs, and accessories. The team has deep roots in the Cape cycling community and provides honest, knowledgeable advice to cyclists at every level.

### Cycletec

Cycletec focuses on performance cycling with a strong emphasis on road bikes and triathlon equipment. The shop has a well-equipped workshop for high-end repairs and builds, and the staff are experienced competitors who understand what serious athletes need.

---

## Northern Suburbs

The Northern Suburbs — Bellville, Parow, Brackenfell — have a growing cycling community fuelled by the Tygerberg Hills and Boland routes.

### Bike Shop Northern Suburbs

An accessible shop with a wide range for recreational cyclists and commuters. Good selection of entry-level to mid-range road and mountain bikes, with a solid repair workshop and friendly service.

---

## Winelands (Stellenbosch & Paarl)

The Cape Winelands are a cycling paradise, home to dramatic mountain passes, wine farm routes, and some of SA's best MTB trails.

### Cycle Lab Stellenbosch

Cycle Lab Stellenbosch is the flagship store for the Cycle Lab chain in the Winelands. Stocking a massive range of road bikes, MTBs, and accessories from all major brands, it's the go-to shop for serious cyclists in the wine country. Professional fitting, workshop services, and a huge accessories floor make it a complete cycling destination.

---

## How to Find More Cape Town Bike Shops

Browse the full directory of Cape Town bike shops on [CrankMart](https://crankmart.com/directory?city=Cape+Town). Each listing includes contact details, opening hours, brands stocked, services offered, and customer reviews.

Whether you're looking for a bike fitting specialist, a specific brand, or just the nearest shop for emergency repairs, CrankMart's Cape Town directory has you covered.`,
    category: 'guides',
    tags: ['bike shops', 'Cape Town', 'cycling', 'Western Cape', 'road bikes', 'MTB'],
    featured: false,
  },
  {
    title: 'Best Bike Shops in Johannesburg — The Complete 2026 Guide',
    slug: 'best-bike-shops-johannesburg-2026',
    excerpt:
      "Johannesburg is South Africa's cycling powerhouse. With the iconic 94.7 Cycle Challenge drawing over 35,000 riders annually, a thriving commuter cycling culture, and booming MTB scene, Joburg has some of the best bike shops in the country.",
    body: `# Best Bike Shops in Johannesburg — The Complete 2026 Guide

Johannesburg is South Africa's cycling powerhouse. With the iconic 94.7 Cycle Challenge drawing over 35,000 riders annually, a thriving commuter cycling culture, and booming MTB scene on routes from Cradle to Muldersdrift, Joburg has some of the best bike shops in the country.

Find all Johannesburg bike shops on [CrankMart](https://crankmart.com/directory?city=Johannesburg).

---

## Sandton & Northern Suburbs

Sandton and surrounds — Fourways, Bryanston, Rivonia — are home to many of Joburg's best-stocked bike shops, catering to the affluent cycling market with premium brands and full workshop services.

### Cycle Lab Sandton

Cycle Lab Sandton is one of the largest cycling retailers in South Africa. Spread across a massive floor space, the shop stocks every major road bike, MTB, and gravel bike brand. The fitting studio uses cutting-edge technology to ensure your bike is perfectly dialled for your anatomy. The workshop handles everything from basic tune-ups to full custom builds.

**What to expect:** Massive selection, expert fitting, all major brands, full workshop, accessories megastore.

### Pro Bikes Fourways

Pro Bikes is a premium cycling retailer focused on high-performance road bikes and triathlon equipment. Sandton's competitive cycling community relies on Pro Bikes for race-spec components, professional fitting, and expert advice.

---

## Randburg & Roodepoort

West Rand cycling has exploded in recent years, with Roodepoort and Randburg becoming hubs for MTB riders heading to Cradle Country trails.

### Randburg Cycles

A well-established shop serving the Randburg cycling community for decades. Good range of road bikes, MTBs, and commuter bikes, with a reliable workshop and knowledgeable staff who know the local trails and routes.

### MTB Warehouse Roodepoort

As the name suggests, MTB Warehouse is the destination for mountain bikers on the West Rand. Stocking all major MTB brands, a huge components selection, and trail-specific accessories, it's the first stop for riders heading to Cradle or Muldersdrift.

---

## Midrand & Centurion

The Midrand corridor has seen major retail development, with several excellent bike shops serving the growing cycling communities between Joburg and Pretoria.

### Cycle Lab Midrand

Another flagship Cycle Lab location, Midrand serves cyclists across the northern corridor with the same massive selection and professional services as Sandton. Particularly popular with commuters and recreational riders from the surrounding suburbs.

---

## East Rand (Boksburg, Benoni, Germiston)

The East Rand cycling scene is centred on road cycling, with popular sportives and group rides throughout the year.

### East Rand Cycles

Serving the East Rand cycling community with a strong selection of road bikes, commuter options, and essential accessories. Known for competitive pricing and a friendly, no-pressure approach to sales.

---

## The 94.7 Cycle Challenge Connection

Joburg's premier cycling event, the 94.7 Cycle Challenge, draws preparation from bike shops across the city every year. Most shops ramp up stock and workshop capacity in the months leading up to the race. If you're training for the 94.7, most Joburg bike shops can advise on gear selection, bike setup, and training routes.

Check the [CrankMart events calendar](https://crankmart.com/events) for 94.7 registration details and other Joburg cycling events.

---

## How to Find More Johannesburg Bike Shops

Browse the full directory of Johannesburg bike shops on [CrankMart](https://crankmart.com/directory?city=Johannesburg). Each listing includes contact details, opening hours, brands stocked, and services offered.`,
    category: 'guides',
    tags: ['bike shops', 'Johannesburg', 'cycling', 'Gauteng', '94.7 Cycle Challenge', 'MTB'],
    featured: false,
  },
  {
    title: 'South Africa Cycling Events Calendar 2026 — Every Race, Sportive & Gran Fondo',
    slug: 'cycling-events-south-africa-2026',
    excerpt:
      'South Africa is one of the world\'s premier cycling destinations. From the iconic Cape Town Cycle Tour to the brutal Attakwas Extreme MTB race, the 94.7 Cycle Challenge to the multi-day Cape Pioneer Trek, the 2026 calendar is packed with world-class events.',
    body: `# South Africa Cycling Events Calendar 2026 — Every Race, Sportive & Gran Fondo

South Africa is one of the world's premier cycling destinations. From the iconic Cape Town Cycle Tour to the brutal Attakwas Extreme mountain bike race, the 94.7 Cycle Challenge to the multi-day Cape Pioneer Trek, the calendar is packed with world-class events.

Find all 2026 cycling events on [CrankMart's events calendar](https://crankmart.com/events).

---

## Flagship Road Events

### Cape Town Cycle Tour (CTCT)

The Cape Town Cycle Tour is South Africa's biggest cycling event and one of the largest individually timed cycle races in the world. The 109km route around the Cape Peninsula is iconic — from Cape Town through Hout Bay, over Chapman's Peak, around the southern tip, and back through the Winelands.

- **Distance:** 109km
- **Location:** Cape Town, Western Cape
- **Entry:** Registration opens several months before race day — check [crankmart.com/events](https://crankmart.com/events)

### 94.7 Cycle Challenge

Johannesburg's premier cycling event draws over 35,000 riders to the roads of Gauteng every November. The 94.7 is more than a race — it's Joburg's annual cycling festival, with multiple distances to suit all riders.

- **Distance:** 94.7km (and shorter distances)
- **Location:** Johannesburg, Gauteng
- **Entry:** Registration opens mid-year

### Bestmed Jock Tour

The Bestmed Jock Tour is a popular multi-stage road cycling event based in Mpumalanga. Competitive but accessible, it's a favourite for club cyclists looking for a stage race experience.

---

## Major MTB Events

### Absa Cape Epic

The Absa Cape Epic is widely regarded as the world's greatest mountain bike stage race. Eight days, approximately 650km, and around 15,000m of climbing through the Cape Winelands — it's not for the faint-hearted. Elite, competitive, and amateur categories run simultaneously.

- **Duration:** 8 stages over 9 days
- **Location:** Cape Winelands, Western Cape

### Attakwas Extreme MTB Challenge

The Attakwas is South Africa's hardest single-day MTB race. 130km through the Outeniqua Mountains from Attakhaskloof to George, with brutal climbing and technical terrain. Completing the Attakwas is a badge of honour in the SA MTB community.

- **Distance:** ~130km
- **Location:** George / Outeniqua Mountains, Western Cape

### Cape Pioneer Trek

The Cape Pioneer Trek is a multi-stage MTB stage race through the dramatic landscapes of the Western and Southern Cape. Six stages, world-class trails, and some of the most scenic riding in South Africa.

- **Duration:** 6 stages
- **Location:** Western Cape / Southern Cape

### Sani2C

Sani2C takes riders from Sani Pass down to the KwaZulu-Natal South Coast over three days, covering approximately 260km. The views from the Drakensberg into the Midlands are unmatched, and the race has a well-deserved reputation for both its scenery and its well-organised trail experience.

- **Duration:** 3 stages (~260km total)
- **Location:** KwaZulu-Natal

---

## Gran Fondos & Sportives

### Momentum Health Attakwas-NG Gran Fondo

A gran fondo version of the iconic Attakwas route, offering multiple distances for riders who want the Attakwas experience without the extreme demands of the race itself.

### Gravel & Adventure Events

South Africa's gravel and adventure cycling scene has exploded in recent years. Events like the Gravel & Tar and various informal bikepacking routes have grown to attract hundreds of participants.

---

## How to Enter SA Cycling Events

Most major SA cycling events open registration months in advance and fill up quickly — particularly the CTCT and 94.7. Key tips:

1. **Register early** — popular events sell out in minutes when registration opens
2. **Check CrankMart** — [crankmart.com/events](https://crankmart.com/events) lists all events with registration links
3. **Medical requirements** — most events require a medical certificate for riders over a certain age
4. **Gear up** — visit a local bike shop (find yours on [CrankMart](https://crankmart.com/directory)) for race preparation advice

---

Browse the full 2026 cycling events calendar at [crankmart.com/events](https://crankmart.com/events).`,
    category: 'events',
    tags: ['events', 'cycling calendar', 'South Africa', 'Cape Town Cycle Tour', 'MTB', 'Cape Epic', '94.7'],
    featured: true,
  },
  {
    title: "What is CrankMart? South Africa's Cycling Marketplace Explained",
    slug: 'what-is-crankmart-sa-cycling-marketplace',
    excerpt:
      "CrankMart is South Africa's first dedicated online cycling marketplace and business directory, connecting cyclists with bike shops, brands, coaches, gear retailers, and cycling services across the country.",
    body: `# What is CrankMart? South Africa's Cycling Marketplace Explained

CrankMart is South Africa's first dedicated online cycling marketplace and business directory, connecting cyclists with bike shops, brands, coaches, gear retailers, and cycling services across the country. It solves the fragmentation problem that has plagued the SA cycling community for years — the fact that there's been no single, authoritative place to find cycling businesses, gear, events, and services all in one platform.

Visit [crankmart.com](https://crankmart.com) to explore the full platform.

---

## What Does CrankMart Do?

CrankMart brings together every part of the South African cycling ecosystem in one place:

### Business Directory

The CrankMart [business directory](https://crankmart.com/directory) lists bike shops, cycling brands, coaches, mechanics, tour operators, and cycling clubs across South Africa. Each listing includes full contact details, location, services, brands stocked, opening hours, and customer reviews.

Whether you're looking for a bike shop in Cape Town, a cycling coach in Johannesburg, or a mobile mechanic in Durban, CrankMart's directory makes it easy to find exactly what you need.

### Classifieds

The CrankMart classifieds section lets cyclists buy and sell second-hand bikes, components, and gear. List your old road bike, find a bargain MTB, or source rare components — all within a cycling-specific community that understands the market.

### Events Calendar

The [CrankMart events calendar](https://crankmart.com/events) lists every major cycling race, sportive, gran fondo, and charity ride in South Africa. From the Cape Town Cycle Tour to the Absa Cape Epic, the 94.7 Cycle Challenge to local club rides — if it's on the SA cycling calendar, it's on CrankMart.

---

## Why CrankMart Exists

Before CrankMart, South African cyclists had to search across multiple platforms to find what they needed:
- Facebook groups for second-hand gear
- Google for bike shops (with inconsistent results)
- Event-specific websites for race information
- WhatsApp groups for local club rides

CrankMart consolidates all of this into one cycling-specific platform, built for South African cyclists by people who understand the local market.

---

## Who is CrankMart For?

**Cyclists:** Find bike shops near you, buy and sell gear, discover upcoming events, connect with coaches.

**Bike Shops & Cycling Businesses:** List your business for free and reach thousands of SA cyclists searching for your services. [List your business](https://crankmart.com/list).

**Event Organisers:** Publish your event to reach the entire SA cycling community.

**Cycling Brands:** Build your brand presence in the SA market with a dedicated brand listing.

---

## Is CrankMart Free?

Basic business listings on CrankMart are completely free. There are no hidden fees for standard directory listings. Premium features and advertising options may be available in the future.

[List your cycling business for free](https://crankmart.com/list) today.

---

## Who Built CrankMart?

CrankMart is a product of H10 Holdings (Pty) Ltd, a South African technology company. It was built to serve the South African cycling community — one of the most passionate and active cycling communities in the world.

For questions, partnerships, or media enquiries: [info@crankmart.com](mailto:info@crankmart.com)`,
    category: 'guides',
    tags: ['CrankMart', 'about', 'cycling marketplace', 'South Africa', 'bike directory'],
    featured: false,
  },
]

export async function POST() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let seeded = 0
  const errors: string[] = []

  for (const post of BLOG_POSTS) {
    try {
      const tagsLiteral = `ARRAY[${post.tags.map(t => `'${t.replace(/'/g, "''")}'`).join(', ')}]::text[]`
      const titleEsc = post.title.replace(/'/g, "''")
      const slugEsc = post.slug
      const excerptEsc = post.excerpt.replace(/'/g, "''")
      const bodyEsc = post.body.replace(/'/g, "''")
      const catEsc = post.category

      await db.execute(sql.raw(`
        INSERT INTO news_articles (
          title, slug, excerpt, body, category, tags,
          author_name, author_email, status, is_featured,
          views_count, published_at
        ) VALUES (
          '${titleEsc}',
          '${slugEsc}',
          '${excerptEsc}',
          '${bodyEsc}',
          '${catEsc}',
          ${tagsLiteral},
          'CrankMart Editorial',
          'info@crankmart.com',
          'approved',
          ${post.featured},
          0,
          '2026-03-28T08:00:00Z'
        )
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          excerpt = EXCLUDED.excerpt,
          body = EXCLUDED.body,
          is_featured = EXCLUDED.is_featured,
          status = 'approved',
          published_at = EXCLUDED.published_at
      `))
      seeded++
    } catch (err) {
      errors.push(`${post.slug}: ${String(err)}`)
    }
  }

  if (errors.length > 0) {
    return Response.json({ success: false, seeded, errors }, { status: 500 })
  }

  return Response.json({
    success: true,
    seeded,
    message: `Seeded ${seeded} blog posts`,
    slugs: BLOG_POSTS.map(p => p.slug),
  })
}
