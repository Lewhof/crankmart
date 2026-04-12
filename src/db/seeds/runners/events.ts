import { db } from '@/db'
import { events } from '@/db/schema'
import { sql } from 'drizzle-orm'
import type { EventSeed, RegionFile, SeedResult } from '../types'

const SOURCE_PREFIX = 'seed:events'

export async function runEventsSeed(
  file: RegionFile<EventSeed>,
  opts: { dryRun?: boolean } = {},
): Promise<SeedResult> {
  const source = `${SOURCE_PREFIX}:${file.region}`
  const result: SeedResult = {
    entity: 'events',
    region: file.region,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  }

  if (opts.dryRun) {
    result.skipped = file.rows.length
    return result
  }

  for (const row of file.rows) {
    try {
      const ret = await db
        .insert(events)
        .values({ ...row, source })
        .onConflictDoUpdate({
          target: events.slug,
          set: {
            title: row.title,
            description: row.description,
            eventType: row.eventType,
            status: row.status,
            startDate: row.startDate,
            endDate: row.endDate,
            province: row.province,
            city: row.city,
            venue: row.venue,
            distance: row.distance,
            entryFee: row.entryFee,
            entryUrl: row.entryUrl,
            websiteUrl: row.websiteUrl,
            bannerUrl: row.bannerUrl,
            organiserName: row.organiserName,
            organiserEmail: row.organiserEmail,
            organiserPhone: row.organiserPhone,
            source,
            updatedAt: sql`now()`,
          },
        })
        .returning({ id: events.id, createdAt: events.createdAt, updatedAt: events.updatedAt })

      const r = ret[0]
      if (r && r.createdAt && r.updatedAt && r.createdAt.getTime() === r.updatedAt.getTime()) {
        result.inserted++
      } else {
        result.updated++
      }
    } catch (e) {
      result.errors.push({ slug: row.slug, message: (e as Error).message })
    }
  }

  return result
}
