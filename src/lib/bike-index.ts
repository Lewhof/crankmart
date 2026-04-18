/**
 * Thin client for the Bike Index v3 public API.
 *
 * Bike Index (bikeindex.org) is a free, open bike registry — ~1.5M bikes,
 * CORS-enabled, no auth required for stolen-lookup reads. SA coverage
 * comes via their SACBike partnership.
 *
 * We intentionally do NOT depend on an API key — if Bike Index ever
 * introduces one for reads, we'll wire it via env. For writes (posting
 * our reports back to their registry) we'd need an org account; that's
 * a Phase 2 ambition.
 *
 * Docs: https://bikeindex.org/documentation/api_v3
 */

import { normaliseSerial } from './serial'

const BIKE_INDEX_API = 'https://bikeindex.org/api/v3'

export interface BikeIndexBike {
  id: number
  title: string
  serial: string
  manufacturer_name: string
  year: number | null
  frame_model: string | null
  frame_colors: string[] | null
  thumb: string | null
  url: string
  date_stolen: number | null // unix epoch seconds
  stolen_location: string | null
  stolen: boolean
}

export interface BikeIndexSearchResponse {
  bikes: BikeIndexBike[]
}

/**
 * Search Bike Index for bikes matching `serial` + (optionally) `brand`.
 * Stolen-only scope by default since that's what we surface publicly.
 * Returns the raw hits; caller normalises into our unified result shape.
 */
export async function searchBikeIndex(
  serial: string,
  brand?: string,
  opts: { stolenOnly?: boolean } = { stolenOnly: true },
): Promise<BikeIndexBike[]> {
  const s = normaliseSerial(serial)
  if (!s) return []
  const params = new URLSearchParams({
    serial: s,
    stolenness: opts.stolenOnly ? 'stolen' : 'all',
    per_page: '10',
  })
  if (brand) params.set('manufacturer', brand.trim())

  try {
    const res = await fetch(`${BIKE_INDEX_API}/search?${params}`, {
      signal: AbortSignal.timeout(3000),
      headers: { 'Accept': 'application/json' },
    })
    if (!res.ok) return []
    const body = (await res.json()) as BikeIndexSearchResponse
    return Array.isArray(body?.bikes) ? body.bikes : []
  } catch {
    // Timeout / network / schema drift — fail open (return empty) and log.
    // Caller should treat this the same as "no record" rather than blocking
    // a legitimate listing on a transient upstream issue.
    return []
  }
}

/** Format a Bike Index bike into the shape the /check page renders. */
export function formatBikeIndexHit(b: BikeIndexBike) {
  const reportedAt = b.date_stolen ? new Date(b.date_stolen * 1000).toISOString() : null
  return {
    source: 'bike_index' as const,
    sourceLabel: 'Bike Index',
    sourceUrl: b.url,
    reportedAt,
    confidence: 'exact' as const,
    brand: b.manufacturer_name,
    model: b.frame_model || undefined,
    stolenLocation: b.stolen_location || undefined,
  }
}
