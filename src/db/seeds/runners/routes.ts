import { db } from '@/db'
import { routes } from '@/db/schema'
import { sql } from 'drizzle-orm'
import type { RouteSeed, RegionFile, SeedResult } from '../types'

const SOURCE_PREFIX = 'seed:routes'

export async function runRoutesSeed(
  file: RegionFile<RouteSeed>,
  opts: { dryRun?: boolean } = {},
): Promise<SeedResult> {
  const source = `${SOURCE_PREFIX}:${file.region}`
  const result: SeedResult = {
    entity: 'routes',
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
        .insert(routes)
        .values({ ...row, source })
        .onConflictDoUpdate({
          target: routes.slug,
          set: {
            name: row.name,
            description: row.description,
            discipline: row.discipline,
            difficulty: row.difficulty,
            surface: row.surface,
            distanceKm: row.distanceKm,
            elevationM: row.elevationM,
            estTimeMin: row.estTimeMin,
            province: row.province,
            region: row.region,
            town: row.town,
            lat: row.lat,
            lng: row.lng,
            gpxUrl: row.gpxUrl,
            heroImageUrl: row.heroImageUrl,
            facilities: row.facilities,
            tags: row.tags,
            websiteUrl: row.websiteUrl,
            contactEmail: row.contactEmail,
            contactPhone: row.contactPhone,
            isVerified: row.isVerified,
            isFeatured: row.isFeatured,
            status: row.status,
            primaryImageUrl: row.primaryImageUrl,
            sourceName: row.sourceName,
            sourceUrl: row.sourceUrl,
            source,
            updatedAt: sql`now()`,
          },
        })
        .returning({ id: routes.id, createdAt: routes.createdAt, updatedAt: routes.updatedAt })

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
