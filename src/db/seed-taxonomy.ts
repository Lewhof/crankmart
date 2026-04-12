import { db } from './index'
import { listingCategories } from './schema'
import { eq } from 'drizzle-orm'

async function main() {
  // Get existing categories for parent lookups
  const existing = await db.select().from(listingCategories)
  const bySlug = Object.fromEntries(existing.map(c => [c.slug, c.id]))

  type NewCat = { name: string; slug: string; parentId?: number; displayOrder: number }
  const toInsert: NewCat[] = []

  // ── COMPLETE BIKES sub-categories (parent: complete-bikes = 1) ──────────
  const bikeParent = bySlug['complete-bikes']
  const bikeSubs: [string, string][] = [
    ['Trail MTB',             'trail-mtb'],
    ['Dirt Jump',             'dirt-jump'],
    ['Hardtail MTB',          'hardtail-mtb'],
    ['Full-Suspension MTB',   'full-suspension-mtb'],
    ['Fitness / Urban',       'fitness-urban'],
    ['Urban Commuter',        'urban-commuter'],
    ['Cruiser',               'cruiser'],
    ['BMX Race',              'bmx-race'],
    ['Kids Hardtail',         'kids-hardtail'],
    ['Kids Road / Hybrid',    'kids-road-hybrid'],
    ['Balance Bikes',         'balance-bikes'],
    ['Trials',                'trials'],
    ['Fixed Gear / Single Speed', 'fixedgear'],
    ['Folding / Compact',     'folding'],
    ['Fat Bikes',             'fat-bikes'],
    ['Tandem / Multi-rider',  'tandem'],
  ]
  let order = 100
  for (const [name, slug] of bikeSubs) {
    if (!bySlug[slug]) toInsert.push({ name, slug, parentId: bikeParent ?? undefined, displayOrder: order++ })
  }

  // ── E-BIKES sub-categories (parent: e-bikes = 13) ─────────────────────
  const ebikeParent = bySlug['e-bikes']
  const ebikeSubs: [string, string][] = [
    ['E-MTB',                 'e-mtb'],
    ['E-Road / E-Gravel',     'e-road-gravel'],
    ['E-Urban / E-Commuter',  'e-urban'],
    ['E-Bike Motors',         'e-bike-motors'],
    ['E-Bike Batteries',      'e-bike-batteries'],
    ['E-Bike Conversion Kits','e-bike-kits'],
  ]
  for (const [name, slug] of ebikeSubs) {
    if (!bySlug[slug]) toInsert.push({ name, slug, parentId: ebikeParent ?? undefined, displayOrder: order++ })
  }

  // ── FRAMES sub-categories (parent: frames = 2) ─────────────────────────
  const framesParent = bySlug['frames']
  const frameSubs: [string, string][] = [
    ['Road Frames',                   'road-frames'],
    ['Mountain Frames – Hardtail',    'mtb-frames-hardtail'],
    ['Mountain Frames – Full Sus',    'mtb-frames-fullsus'],
    ['Gravel / CX Frames',            'gravel-frames'],
    ['Hybrid / Urban Frames',         'hybrid-frames'],
    ['BMX Frames',                    'bmx-frames'],
    ['E-Bike Frames',                 'e-bike-frames'],
    ['Frame Sets (frame + fork)',     'framesets'],
    ['Vintage / Retro Frames',        'vintage-frames'],
    ['Damaged / Restoration Frames',  'restoration-frames'],
  ]
  for (const [name, slug] of frameSubs) {
    if (!bySlug[slug]) toInsert.push({ name, slug, parentId: framesParent ?? undefined, displayOrder: order++ })
  }

  // ── SUSPENSION sub-categories (parent: suspension = 3) ─────────────────
  const suspParent = bySlug['suspension']
  const suspSubs: [string, string][] = [
    ['Front Forks',           'front-forks'],
    ['Rear Shocks',           'rear-shocks'],
    ['Fork Parts & Upgrades', 'fork-parts'],
    ['Shock Parts & Upgrades','shock-parts'],
    ['Full Suspension Kits',  'full-susp-kits'],
  ]
  for (const [name, slug] of suspSubs) {
    if (!bySlug[slug]) toInsert.push({ name, slug, parentId: suspParent ?? undefined, displayOrder: order++ })
  }

  // ── DRIVETRAIN sub-categories (parent: drivetrain = 5) ─────────────────
  const dtParent = bySlug['drivetrain']
  const dtSubs: [string, string][] = [
    ['Cassettes & Sprockets', 'cassettes'],
    ['Chains',                'chains'],
    ['Chain Guides',          'chain-guides'],
    ['Chainrings & Cranks',   'chainrings'],
    ['Bottom Brackets',       'bottom-brackets'],
    ['Derailleurs & Shifters','derailleurs'],
  ]
  for (const [name, slug] of dtSubs) {
    if (!bySlug[slug]) toInsert.push({ name, slug, parentId: dtParent ?? undefined, displayOrder: order++ })
  }

  // ── WHEELS & TYRES sub-categories (parent: wheels-tyres = 4) ──────────
  const wtParent = bySlug['wheels-tyres']
  const wtSubs: [string, string][] = [
    ['Wheelsets',             'wheelsets'],
    ['Rims',                  'rims'],
    ['Tyres',                 'tyres'],
    ['Hubs',                  'hubs'],
    ['Spokes & Nipples',      'spokes'],
  ]
  for (const [name, slug] of wtSubs) {
    if (!bySlug[slug]) toInsert.push({ name, slug, parentId: wtParent ?? undefined, displayOrder: order++ })
  }

  // ── COCKPIT / CONTROLS sub-cats (parent: cockpit = 7) ──────────────────
  const cockParent = bySlug['cockpit']
  const cockSubs: [string, string][] = [
    ['Brakes & Levers',       'brakes-levers'],
    ['Handlebars',            'handlebars'],
    ['Grips & Bar Tape',      'grips-bartape'],
    ['Headsets & Stems',      'headsets-stems'],
    ['Pedals',                'pedals'],
  ]
  for (const [name, slug] of cockSubs) {
    if (!bySlug[slug]) toInsert.push({ name, slug, parentId: cockParent ?? undefined, displayOrder: order++ })
  }

  // ── GEAR & APPAREL sub-cats (parent: gear-apparel = 9) ─────────────────
  const appParent = bySlug['gear-apparel']
  const appSubs: [string, string][] = [
    ['Jerseys',               'jerseys'],
    ['Bib Shorts & Tights',   'bib-shorts'],
    ['Jackets & Gilets',      'jackets'],
    ['Gloves',                'gloves'],
    ['Socks',                 'socks'],
    ['Base Layers',           'base-layers'],
    ['Casual / Lifestyle',    'casual-apparel'],
    ['Womens Apparel',        'womens-apparel'],
  ]
  for (const [name, slug] of appSubs) {
    if (!bySlug[slug]) toInsert.push({ name, slug, parentId: appParent ?? undefined, displayOrder: order++ })
  }

  // ── GEAR & EQUIPMENT (top-level new categories) ─────────────────────────
  const topLevel: [string, string][] = [
    ['Protection & Armour',   'protection-armour'],
    ['Glasses & Goggles',     'glasses-goggles'],
    ['Lights',                'lights'],
    ['Computers & GPS',       'computers-gps'],
    ['Bags & Backpacks',      'bags-backpacks'],
    ['Bike Racks & Carriers', 'racks-carriers'],
    ['Trainers & Rollers',    'trainers-rollers'],
    ['Nutrition & Supplements','nutrition'],
    ['Services & Coaching',   'services'],
    ['Trades',                'trades'],
  ]
  for (const [name, slug] of topLevel) {
    if (!bySlug[slug]) toInsert.push({ name, slug, displayOrder: order++ })
  }

  if (!toInsert.length) {
    console.log('Nothing to insert — all categories already exist')
    process.exit(0)
  }

  // Insert in batches of 10
  let inserted = 0
  for (let i = 0; i < toInsert.length; i += 10) {
    const batch = toInsert.slice(i, i + 10)
    await db.insert(listingCategories).values(batch.map(c => ({
      name: c.name,
      slug: c.slug,
      parentId: c.parentId ?? null,
      displayOrder: c.displayOrder,
    }))).onConflictDoNothing()
    inserted += batch.length
    process.stdout.write(`\r  ${inserted}/${toInsert.length}`)
  }

  // Final count
  const total = await db.select().from(listingCategories)
  console.log(`\n✅ Inserted ${toInsert.length} categories. Total now: ${total.length}`)
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
