/**
 * CLI entry for orchestrated seeding.
 *
 *   tsx src/db/seeds/index.ts --all
 *   tsx src/db/seeds/index.ts --entity=events
 *   tsx src/db/seeds/index.ts --entity=routes --region=gauteng
 *   tsx src/db/seeds/index.ts --dry-run
 *
 * Admin API equivalent: POST /api/admin/seed
 */
import { runOrchestrator, summariseResults } from './orchestrator'

function parseArgs(argv: string[]) {
  const out: Record<string, string | boolean> = {}
  for (const a of argv.slice(2)) {
    if (a === '--all') out.all = true
    else if (a === '--dry-run') out.dryRun = true
    else if (a.startsWith('--entity=')) out.entity = a.slice('--entity='.length)
    else if (a.startsWith('--region=')) out.region = a.slice('--region='.length)
  }
  return out
}

async function main() {
  const args = parseArgs(process.argv)
  if (!args.all && !args.entity) {
    console.error('Usage: tsx src/db/seeds/index.ts --all | --entity=<businesses|routes|events> [--region=<slug>] [--dry-run]')
    process.exit(1)
  }

  const opts = {
    entity: (args.entity as 'businesses' | 'routes' | 'events' | undefined) ?? undefined,
    region: (args.region as string | undefined) ?? undefined,
    dryRun: Boolean(args.dryRun),
  }

  console.log(`🌱 Seed run starting${opts.dryRun ? ' (dry-run)' : ''}`, opts)
  const results = await runOrchestrator(opts)
  const { totals } = summariseResults(results)

  for (const r of results) {
    const err = r.errors.length ? ` errors=${r.errors.length}` : ''
    console.log(`  ${r.entity}/${r.region}: +${r.inserted} ~${r.updated} skip=${r.skipped}${err}`)
    for (const e of r.errors) console.log(`    ✗ ${e.slug}: ${e.message}`)
  }
  console.log(`\nTotals: +${totals.inserted} inserted, ~${totals.updated} updated, skip=${totals.skipped}, errors=${totals.errors}`)
  process.exit(totals.errors > 0 ? 2 : 0)
}

main().catch((e) => {
  console.error('Seed run failed:', e)
  process.exit(1)
})
