import { scrapeMTBTrailsSA } from './sources/mtbtrailssa'
import { scrapeTrailforks } from './sources/trailforks'
import { scrapeKomoot } from './sources/komoot'
import { db } from '../index'
import { scrapeRuns } from '../schema'
import { sql } from 'drizzle-orm'

const source = process.argv[2] ?? 'all'

async function main() {
  console.log(`🚴 CrankMart Route Scraper — source: ${source}`)

  const results: Record<string, { added: number; updated: number; errors: string[] }> = {}

  if (source === 'all' || source === 'mtbtrailssa') {
    console.log('\n📍 Scraping mtbtrailssa.co.za...')
    const [run] = await db.insert(scrapeRuns).values({ sourceName: 'mtbtrailssa' }).returning({ id: scrapeRuns.id })
    try {
      results.mtbtrailssa = await scrapeMTBTrailsSA()
      await db.execute(sql`
        UPDATE scrape_runs SET
          finished_at = NOW(),
          routes_found = ${results.mtbtrailssa.added + results.mtbtrailssa.updated},
          routes_added = ${results.mtbtrailssa.added},
          routes_updated = ${results.mtbtrailssa.updated},
          errors = ${JSON.stringify(results.mtbtrailssa.errors)},
          status = 'done'
        WHERE id = ${run.id}
      `)
      console.log(`  ✅ mtbtrailssa: +${results.mtbtrailssa.added} added, ~${results.mtbtrailssa.updated} updated, ${results.mtbtrailssa.errors.length} errors`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      await db.execute(sql`UPDATE scrape_runs SET status = 'failed', finished_at = NOW() WHERE id = ${run.id}`)
      console.error(`  ❌ mtbtrailssa failed: ${msg}`)
    }
  }

  if (source === 'all' || source === 'trailforks') {
    console.log('\n📍 Scraping trailforks.com...')
    const [run] = await db.insert(scrapeRuns).values({ sourceName: 'trailforks' }).returning({ id: scrapeRuns.id })
    try {
      results.trailforks = await scrapeTrailforks()
      await db.execute(sql`
        UPDATE scrape_runs SET
          finished_at = NOW(),
          routes_found = ${results.trailforks.added + results.trailforks.updated},
          routes_added = ${results.trailforks.added},
          routes_updated = ${results.trailforks.updated},
          errors = ${JSON.stringify(results.trailforks.errors)},
          status = 'done'
        WHERE id = ${run.id}
      `)
      console.log(`  ✅ trailforks: +${results.trailforks.added} added, ~${results.trailforks.updated} updated, ${results.trailforks.errors.length} errors`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      await db.execute(sql`UPDATE scrape_runs SET status = 'failed', finished_at = NOW() WHERE id = ${run.id}`)
      console.error(`  ❌ trailforks failed: ${msg}`)
    }
  }

  if (source === 'all' || source === 'komoot') {
    console.log('\n📍 Scraping komoot.com...')
    const [run] = await db.insert(scrapeRuns).values({ sourceName: 'komoot' }).returning({ id: scrapeRuns.id })
    try {
      results.komoot = await scrapeKomoot()
      await db.execute(sql`
        UPDATE scrape_runs SET
          finished_at = NOW(),
          routes_found = ${results.komoot.added + results.komoot.updated},
          routes_added = ${results.komoot.added},
          routes_updated = ${results.komoot.updated},
          errors = ${JSON.stringify(results.komoot.errors)},
          status = 'done'
        WHERE id = ${run.id}
      `)
      console.log(`  ✅ komoot: +${results.komoot.added} added, ~${results.komoot.updated} updated, ${results.komoot.errors.length} errors`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      await db.execute(sql`UPDATE scrape_runs SET status = 'failed', finished_at = NOW() WHERE id = ${run.id}`)
      console.error(`  ❌ komoot failed: ${msg}`)
    }
  }

  console.log('\n✅ Scrape complete.')
  for (const [src, r] of Object.entries(results)) {
    console.log(`  ${src}: +${r.added} added, ~${r.updated} updated, ${r.errors.length} errors`)
    if (r.errors.length > 0) {
      r.errors.slice(0, 5).forEach(e => console.log(`    ⚠️  ${e}`))
      if (r.errors.length > 5) console.log(`    ... and ${r.errors.length - 5} more`)
    }
  }

  process.exit(0)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
