import { NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

const ARTICLES = [
  {
    title: 'Beers and Nortje Make History at 2026 Absa Cape Epic',
    slug: 'beers-nortje-cape-epic-2026-champions',
    excerpt: 'Matt Beers and Tristan Nortje became the first all-South African team to win the Absa Cape Epic in over two decades, securing a hard-fought GC victory on the final stage.',
    body: `Matt Beers and Tristan Nortje made history at the 2026 Absa Cape Epic, becoming the first all-South African team to win the event in over two decades. The Toyota Specialized Imbuko pair secured the overall GC win after a dramatic final stage through the Cape Winelands.

Trailing overnight leaders Luca Braidot and Simone Avondetto by just 13 seconds heading into the Grand Finale, the South African pair needed to finish ahead of the Italians. In a calculated and courageous ride, Beers and Nortje finished third on the day — enough to seal the overall win.

Nortje suffered a heavy crash in the second half of the stage but pushed through the pain with Beers supporting him through the difficult technical sections. "This is what we trained for," Beers said after crossing the line in tears. "To do it with Tristan, who gave everything despite being hurt — I'm so proud."

In the women's elite race, Candice Lill and Alessandra Keller dominated the week-long race, claiming their seventh stage win out of eight to seal the overall GC victory.

The race ran from Paarl through to Stellenbosch over eight stages, drawing over 4,500 teams from 68 nations — cementing its reputation as the world's greatest mountain bike stage race.`,
    cover: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=450&fit=crop',
    category: 'racing',
    tags: ['Cape Epic', 'Matt Beers', 'Tristan Nortje', 'Candice Lill', 'Stage Race'],
    author: 'CrankMart Sports Desk',
    featured: true,
    days: 3,
    views: 2140,
  },
  {
    title: 'Ryan Gibbons Wins 2026 UCI Cape Town Cycle Tour in Photo Finish',
    slug: 'gibbons-cape-town-cycle-tour-2026',
    excerpt: 'Ryan Gibbons (Fly Cool Collective) edged out Jaedon Terlouw in a dramatic sprint to win the 2026 UCI Cape Town Cycle Tour in a time of 2:33:06.',
    body: `Ryan Gibbons delivered a stunning performance to win the 2026 UCI Cape Town Cycle Tour, crossing the line in 2:33:06 — just milliseconds ahead of Toyota Specialized's Jaedon Terlouw in one of the most dramatic finishes in the race's 47-year history.

Gibbons, racing for Fly Cool Collective, used his road sprinting experience to edge out Terlouw — a mountain biking crossover star — who threatened to become the first MTB specialist to win the iconic road event.

Ryno Schutte of team Nessa finished third just a second later, with Callum Fairweather and Stefan de Bod rounding out the top five.

"This race has always been a dream for me," said Gibbons, who previously competed at the Tour de France. "To win it in front of this crowd, on home roads, means everything."

Over 35,000 riders participated in the recreational ride, with the elite race serving as the flagship event. The UCI gravel qualifier category also attracted a large field, with all qualifiers heading to the UCI Gran Fondo World Championships later in the year.`,
    cover: 'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=800&h=450&fit=crop',
    category: 'racing',
    tags: ['Cape Town Cycle Tour', 'Ryan Gibbons', 'Road Cycling', 'UCI'],
    author: 'CrankMart Sports Desk',
    featured: false,
    days: 19,
    views: 1580,
  },
  {
    title: 'Pritzen and Stehli Power to Stunning Stage 3 Win at Cape Epic',
    slug: 'pritzen-stehli-cape-epic-stage-3-2026',
    excerpt: 'South African Marc Pritzen and Swiss partner Felix Stehli (Honeycomb 226ers) attacked with 40km to go to win the longest stage of the 2026 Absa Cape Epic.',
    body: `South African Marc Pritzen and Swiss partner Felix Stehli of the Honeycomb 226ers team delivered one of the most commanding performances of the 2026 Absa Cape Epic, winning the gruelling Stage 3 from Montagu to Greyton on what was the race's longest stage at 140km.

The pair attacked with 40km remaining and could not be brought back, riding a tactically superb final section to win the stage. For Pritzen, it was a breakthrough result at the sport's most prestigious stage race.

"We knew Stage 3 would suit us — the long rolling sections play to our endurance strengths," Pritzen said post-stage. "Felix and I trusted the plan and executed it perfectly."

Wout Alleman and Martin Stosek finished second, while overnight leaders Matt Beers and Tristan Nortje rode conservatively to protect their GC position in third.

The stage win marks a significant achievement for the Honeycomb 226ers program, which has invested heavily in developing South African talent alongside international partners.`,
    cover: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&h=450&fit=crop',
    category: 'racing',
    tags: ['Cape Epic', 'Marc Pritzen', 'Stage Race', 'MTB'],
    author: 'CrankMart Sports Desk',
    featured: false,
    days: 10,
    views: 743,
  },
  {
    title: 'Stefan de Bod Claims National ITT Title in Blistering Heat',
    slug: 'stefan-de-bod-national-itt-2026',
    excerpt: 'Stefan de Bod (Pure Endurance) rode away with the Elite Men\'s Individual Time Trial title at the 2026 SA National Road, Time Trial & Para Cycling Championships hosted in Midvaal.',
    body: `Stefan de Bod put in a powerhouse ride to claim the Elite Men's Individual Time Trial title at the 2026 South African National Road, Time Trial and Para Cycling Championships, hosted by Midvaal Local Municipality.

Racing in blistering conditions with temperatures around 35°C, de Bod covered 143km of 14.5km laps in dominant fashion. Byron Munton finished second with Alan Hatherly completing the podium.

"We had a late start at 13:00 with the temps around 35 degrees — it was laps of 14.5km for a total of 143km. Solid day out," de Bod said afterwards. The result added the ITT national jersey to his palmares, following an impressive road season where he has consistently placed at the top of domestic results.

As an U23 rider last year, de Bod won the overall road race in Oudtshoorn and was awarded the South African Road Champion's jersey. His progression through the ranks has been marked, and cycling watchers expect him to be competitive on the international stage soon.

The women's ITT saw another strong South African performance, with Cycling SA celebrating strong participation numbers at the championships across all categories.`,
    cover: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=800&h=450&fit=crop',
    category: 'racing',
    tags: ['National Championships', 'Stefan de Bod', 'Time Trial', 'Road Cycling'],
    author: 'CrankMart Sports Desk',
    featured: false,
    days: 25,
    views: 612,
  },
  {
    title: 'Schwarzbauer and Gaze Take Back-to-Back Stage Wins at Cape Epic',
    slug: 'schwarzbauer-gaze-stage-4-cape-epic-2026',
    excerpt: 'Canyon\'s Sam Gaze and Luca Schwarzbauer secured a second stage victory at the 2026 Absa Cape Epic, beating overall race leaders Braidot and Avondetto in a thrilling sprint.',
    body: `Sam Gaze and Luca Schwarzbauer of Canyon claimed their second stage win of the 2026 Absa Cape Epic on Stage 4, once again beating GC leaders Luca Braidot and Simone Avondetto across the line.

The stage win moved the New Zealand–German pair into third overall. Schwarzbauer and Gaze have been the form team of the race's middle stages, combining Gaze's XC world championship pedigree with Schwarzbauer's race-reading ability to devastating effect.

"We didn't plan to be aggressive on Stage 4, but the race played into our hands," said Gaze. "We'll keep our options open on the remaining stages."

GC leader Matt Beers and Tristan Nortje finished fourth on the stage, staying out of trouble and maintaining their lead. The overall standings continued to be tightly contested between three teams heading into the decisive final stages.

The stage covered 90km with 2,400m of climbing through the spectacular Du Toitskloof mountain range, providing dramatic scenery and challenging technical descents.`,
    cover: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&h=450&fit=crop',
    category: 'racing',
    tags: ['Cape Epic', 'Sam Gaze', 'Luca Schwarzbauer', 'Canyon', 'Stage Race'],
    author: 'CrankMart Sports Desk',
    featured: false,
    days: 8,
    views: 489,
  },
  {
    title: 'Garden Route Giro 2026: Route Revealed for SA\'s Premier Gravel Race',
    slug: 'garden-route-giro-route-2026',
    excerpt: 'Organisers of the Garden Route Giro have confirmed the three-day gravel route from Jakkalsvlei to ANEW Resort Wilderness, promising over 2,800m of climbing through stunning biomes.',
    body: `Organisers of the Garden Route Giro have officially revealed the full three-day route for the 2026 edition, confirming what many riders have called the most scenic gravel stage race in South Africa.

Starting at Jakkalsvlei Private Cellar and finishing at ANEW Resort Wilderness, the route traverses multiple biomes — including indigenous forest, fynbos, and coastal scrubland — with over 2,800m of climbing spread across the three stages.

"We wanted riders to experience the full richness of the Garden Route, not just the tar roads that tourists see," said race director Carl Breytenbach. "This route takes you through the heart of it."

Stage 1 covers 80km from Jakkalsvlei through the Langkloof with 950m of elevation. Stage 2 is the queen stage at 105km and 1,400m of climbing through the Outeniqua foothills. Stage 3 completes the journey into Wilderness with a spectacular coastal descent to the finish.

Limited entries are still available, and organisers are encouraging riders to register early. The race has quickly established itself as a flagship event on the South African gravel calendar since its inaugural edition in 2023.`,
    cover: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=800&h=450&fit=crop',
    category: 'events',
    tags: ['Garden Route Giro', 'Gravel', 'Stage Race', 'Events'],
    author: 'CrankMart Sports Desk',
    featured: false,
    days: 6,
    views: 934,
  },
]

export async function GET() {
  try {
    // First delete all BikeHub Staff articles
    await db.execute(sql.raw(`DELETE FROM news_articles WHERE author_name = 'BikeHub Staff'`))

    let seeded = 0
    for (const a of ARTICLES) {
      const publishedAt = new Date(Date.now() - a.days * 86400000)
      const tagsArray = a.tags.length > 0
        ? `ARRAY[${a.tags.map(t => `'${t.replace(/'/g, "''")}'`).join(',')}]::text[]`
        : `ARRAY[]::text[]`

      await db.execute(sql.raw(`
        INSERT INTO news_articles (title, slug, excerpt, body, cover_image_url, category, tags, author_name, status, is_featured, views_count, published_at)
        VALUES (
          '${a.title.replace(/'/g, "''")}',
          '${a.slug}',
          '${a.excerpt.replace(/'/g, "''")}',
          '${a.body.replace(/'/g, "''")}',
          '${a.cover}',
          '${a.category}',
          ${tagsArray},
          '${a.author}',
          'approved',
          ${a.featured},
          ${a.views},
          '${publishedAt.toISOString()}'
        )
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          excerpt = EXCLUDED.excerpt,
          body = EXCLUDED.body,
          cover_image_url = EXCLUDED.cover_image_url,
          author_name = EXCLUDED.author_name,
          is_featured = EXCLUDED.is_featured,
          views_count = EXCLUDED.views_count
      `))
      seeded++
    }
    return NextResponse.json({ success: true, seeded })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
