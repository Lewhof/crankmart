import { runBusinessesSeed } from './runners/businesses'
import { runRoutesSeed } from './runners/routes'
import { runEventsSeed } from './runners/events'
import { businessRegions } from './data/businesses'
import { routeRegions } from './data/routes'
import { eventRegions } from './data/events'
import type { SeedResult } from './types'

export type OrchestratorOpts = {
  entity?: 'businesses' | 'routes' | 'events'
  region?: string
  dryRun?: boolean
}

export async function runOrchestrator(opts: OrchestratorOpts = {}): Promise<SeedResult[]> {
  const results: SeedResult[] = []
  const run = async <T>(
    entity: 'businesses' | 'routes' | 'events',
    files: { region: string; rows: T[] }[],
    runner: (f: { region: string; rows: T[] }, o: { dryRun?: boolean }) => Promise<SeedResult>,
  ) => {
    if (opts.entity && opts.entity !== entity) return
    for (const file of files) {
      if (opts.region && opts.region !== file.region) continue
      results.push(await runner(file, { dryRun: opts.dryRun }))
    }
  }

  await run('businesses', businessRegions, runBusinessesSeed)
  await run('routes',     routeRegions,     runRoutesSeed)
  await run('events',     eventRegions,     runEventsSeed)

  return results
}

export function summariseResults(results: SeedResult[]) {
  const totals = results.reduce(
    (acc, r) => {
      acc.inserted += r.inserted
      acc.updated += r.updated
      acc.skipped += r.skipped
      acc.errors += r.errors.length
      return acc
    },
    { inserted: 0, updated: 0, skipped: 0, errors: 0 },
  )
  return { totals, results }
}
