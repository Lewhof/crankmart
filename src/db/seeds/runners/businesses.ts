import { db } from '@/db'
import { businesses } from '@/db/schema'
import { sql } from 'drizzle-orm'
import type { BusinessSeed, RegionFile, SeedResult } from '../types'

const SOURCE_PREFIX = 'seed:businesses'

export async function runBusinessesSeed(
  file: RegionFile<BusinessSeed>,
  opts: { dryRun?: boolean } = {},
): Promise<SeedResult> {
  const source = `${SOURCE_PREFIX}:${file.region}`
  const result: SeedResult = {
    entity: 'businesses',
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
        .insert(businesses)
        .values({ ...row, source })
        .onConflictDoUpdate({
          target: businesses.slug,
          set: {
            name: row.name,
            businessType: row.businessType,
            description: row.description,
            province: row.province,
            city: row.city,
            suburb: row.suburb,
            address: row.address,
            phone: row.phone,
            whatsapp: row.whatsapp,
            email: row.email,
            website: row.website,
            brandsStocked: row.brandsStocked,
            services: row.services,
            specialisation: row.specialisation,
            seoTags: row.seoTags,
            logoUrl: row.logoUrl,
            bannerUrl: row.bannerUrl,
            locationLat: row.locationLat,
            locationLng: row.locationLng,
            status: row.status,
            verified: row.verified,
            source,
            updatedAt: sql`now()`,
          },
        })
        .returning({ id: businesses.id, createdAt: businesses.createdAt, updatedAt: businesses.updatedAt })

      const r = ret[0]
      // Drizzle neon-http returns both on upsert. Heuristic: createdAt == updatedAt => insert.
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
