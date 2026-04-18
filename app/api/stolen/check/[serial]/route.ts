import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { limiters, clientKey, check } from '@/lib/ratelimit'
import { brandSerialKey, isPlausibleSerial, normaliseSerial } from '@/lib/serial'
import { searchBikeIndex, formatBikeIndexHit } from '@/lib/bike-index'

export type CheckState = 'reported_stolen' | 'no_record'

interface Match {
  source: 'bike_index' | 'crankmart'
  sourceLabel: string
  sourceUrl?: string
  reportedAt: string | null
  confidence: 'exact' | 'partial'
  brand?: string
  model?: string
  sapsCaseNo?: string
  stolenLocation?: string
}

export interface CheckResponse {
  state: CheckState
  matches: Match[]
  cached: boolean
  cachedAt?: string
}

const CACHE_TTL_SECONDS = 24 * 3600

export async function GET(request: NextRequest, { params }: { params: Promise<{ serial: string }> }) {
  const rl = await check(limiters.stolenCheck, clientKey(request))
  if (!rl.ok) {
    return NextResponse.json({ error: 'Too many lookups. Try again later.' }, { status: 429 })
  }

  const { serial: rawSerial } = await params
  const brand = request.nextUrl.searchParams.get('brand') || ''
  if (!isPlausibleSerial(rawSerial)) {
    return NextResponse.json({ error: 'Serial looks invalid — check for typos.' }, { status: 400 })
  }

  const key = brandSerialKey(brand || 'unknown', rawSerial)

  // 1. Cache hit?
  try {
    const cached = await db.execute(sql`
      SELECT result, fetched_at, ttl_seconds FROM serial_lookup_cache
      WHERE cache_key = ${key}
        AND fetched_at > NOW() - (ttl_seconds || ' seconds')::interval
      LIMIT 1
    `)
    const row = (cached.rows?.[0] ?? (cached as unknown as unknown[])[0]) as { result: CheckResponse; fetched_at: string } | undefined
    if (row) {
      return NextResponse.json({ ...row.result, cached: true, cachedAt: row.fetched_at })
    }
  } catch (e) {
    console.error('Cache read failed:', e)
  }

  // 2. Live lookup — internal + external in parallel.
  const normalSerial = normaliseSerial(rawSerial)
  const [internalRes, externalHits] = await Promise.all([
    db.execute(sql`
      SELECT source, external_id, brand, model, saps_case_no, stolen_location, created_at
      FROM stolen_reports
      WHERE status = 'approved' AND serial_number = ${normalSerial}
        AND (${brand === ''} OR LOWER(brand) = LOWER(${brand}))
      ORDER BY created_at DESC LIMIT 5
    `),
    searchBikeIndex(rawSerial, brand || undefined),
  ])

  const matches: Match[] = []

  const internalRows = (internalRes.rows ?? internalRes) as Array<{
    source: string
    external_id: string | null
    brand: string
    model: string | null
    saps_case_no: string | null
    stolen_location: string | null
    created_at: string
  }>
  internalRows.forEach(r => {
    matches.push({
      source: 'crankmart',
      sourceLabel: 'CrankMart Registry',
      reportedAt: r.created_at,
      confidence: 'exact',
      brand: r.brand,
      model: r.model || undefined,
      sapsCaseNo: r.saps_case_no || undefined,
      stolenLocation: r.stolen_location || undefined,
    })
  })

  externalHits.forEach(b => matches.push(formatBikeIndexHit(b)))

  const response: CheckResponse = {
    state: matches.length > 0 ? 'reported_stolen' : 'no_record',
    matches,
    cached: false,
  }

  // 3. Write-through cache.
  try {
    await db.execute(sql`
      INSERT INTO serial_lookup_cache (cache_key, result, fetched_at, ttl_seconds)
      VALUES (${key}, ${JSON.stringify(response)}::jsonb, NOW(), ${CACHE_TTL_SECONDS})
      ON CONFLICT (cache_key) DO UPDATE SET
        result = EXCLUDED.result, fetched_at = NOW(), ttl_seconds = EXCLUDED.ttl_seconds
    `)
  } catch (e) {
    console.error('Cache write failed:', e)
  }

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': response.state === 'no_record'
        ? 'public, s-maxage=300, stale-while-revalidate=3600'
        : 'private, no-store',
    },
  })
}
