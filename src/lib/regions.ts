/**
 * Country-aware province/state lookup backed by the `regions` table. Replaces
 * the `SA_PROVINCES` constant that was copy-pasted into ~4 client components.
 *
 * Queries server-side (cached) so the list stays authoritative as we add
 * countries. Client components that need it can import the preloaded arrays
 * from `getRegionsFor(country)` or fetch via /api/regions.
 */

import 'server-only'
import { db } from '@/db'
import { regions } from '@/db/schema'
import { asc, eq } from 'drizzle-orm'
import type { Country } from './country'
import { cache } from 'react'

/**
 * Cached once per render — regions change rarely and the table is tiny.
 * React's `cache()` dedupes across the tree within a single request.
 */
export const getRegions = cache(async (country: Country) => {
  const rows = await db
    .select({ code: regions.code, name: regions.name, type: regions.type })
    .from(regions)
    .where(eq(regions.country, country))
    .orderBy(asc(regions.displayOrder), asc(regions.name))
  return rows
})

/** Just the names in display order — handy for simple dropdowns. */
export async function getProvinceNames(country: Country): Promise<string[]> {
  const rows = await getRegions(country)
  return rows.map(r => r.name)
}
