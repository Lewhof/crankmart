import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql, SQL } from 'drizzle-orm'
import { getCountry } from '@/lib/country'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const discipline    = searchParams.get('discipline')
    const province      = searchParams.get('province')
    const city          = searchParams.get('city')
    const difficulty    = searchParams.get('difficulty')
    const distanceRange = searchParams.get('distanceRange')
    const search        = searchParams.get('search')
    const limit         = Math.min(parseInt(searchParams.get('limit') || '24'), 100)
    const page          = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const offset        = (page - 1) * limit

    // Parse proximity params
    const userLat = parseFloat(searchParams.get('lat') || '')
    const userLng = parseFloat(searchParams.get('lng') || '')
    const nearbyKm = parseInt(searchParams.get('nearbyKm') || '0')
    const hasProximity = !isNaN(userLat) && !isNaN(userLng) && nearbyKm > 0

    const country = await getCountry()

    // Build parameterized WHERE fragments
    const filters: SQL[] = [sql`r.country = ${country}`]

    if (discipline && discipline !== 'all') {
      filters.push(sql`r.discipline = ${discipline}`)
    }
    if (province) {
      filters.push(sql`r.province ILIKE ${'%' + province + '%'}`)
    }
    if (city) {
      filters.push(sql`r.town ILIKE ${'%' + city + '%'}`)
    }
    if (difficulty && difficulty !== 'all') {
      filters.push(sql`r.difficulty = ${difficulty}`)
    }
    if (distanceRange) {
      if (distanceRange === 'under30')  filters.push(sql`r.distance_km < 30`)
      if (distanceRange === '30to60')   filters.push(sql`r.distance_km >= 30 AND r.distance_km < 60`)
      if (distanceRange === '60to100')  filters.push(sql`r.distance_km >= 60 AND r.distance_km < 100`)
      if (distanceRange === 'over100')  filters.push(sql`r.distance_km >= 100`)
    }
    if (search) {
      const term = `%${search}%`
      filters.push(sql`(r.name ILIKE ${term} OR r.town ILIKE ${term} OR r.province ILIKE ${term} OR r.region ILIKE ${term})`)
    }

    const extraFilters = filters.reduce((acc, f) => sql`${acc} AND ${f}`)

    // Proximity formula (uses r. alias)
    const distFormulaSql = hasProximity
      ? sql`(6371 * acos(LEAST(1.0, cos(radians(${userLat})) * cos(radians(r.lat::float)) * cos(radians(r.lng::float) - radians(${userLng})) + sin(radians(${userLat})) * sin(radians(r.lat::float)))))`
      : null

    const proximityFilter = distFormulaSql
      ? sql` AND r.lat IS NOT NULL AND r.lng IS NOT NULL AND ${distFormulaSql} <= ${nearbyKm}`
      : sql``

    // Count query
    const filterClause = sql` AND ${extraFilters}`
    const countResult = await db.execute(
      sql`SELECT COUNT(*) as total FROM routes r WHERE r.status = 'approved'${filterClause}${proximityFilter}`
    )
    const total = parseInt((countResult.rows?.[0] as any)?.total ?? 0)

    // ORDER BY
    const orderBySql = distFormulaSql
      ? sql`ORDER BY ${distFormulaSql} ASC`
      : sql`ORDER BY r.is_featured DESC, r.created_at DESC`

    const distanceColSql = distFormulaSql
      ? sql`, ROUND(${distFormulaSql}::numeric, 1) as distance_from_user`
      : sql``

    // Main select with loop_difficulties aggregated
    const result = await db.execute(sql`
      SELECT
        r.id, r.slug, r.name, r.description, r.discipline, r.difficulty, r.surface,
        r.distance_km, r.elevation_m, r.est_time_min,
        r.province, r.region, r.town, r.lat, r.lng,
        r.hero_image_url, r.facilities, r.tags,
        r.website_url, r.is_verified, r.is_featured,
        r.views_count, r.saves_count,
        COALESCE(
          (SELECT array_agg(DISTINCT rl.difficulty::text ORDER BY rl.difficulty::text)
           FROM route_loops rl
           WHERE rl.route_id = r.id AND rl.difficulty IS NOT NULL),
          ARRAY[]::text[]
        ) AS loop_difficulties
        ${distanceColSql}
      FROM routes r
      WHERE r.status = 'approved'${filterClause}${proximityFilter}
      ${orderBySql}
      LIMIT ${limit} OFFSET ${offset}
    `)
    const routes = result.rows ?? result

    return NextResponse.json({
      routes,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (e: any) {
    console.error('Routes API error:', e?.message || String(e), e?.cause || '')
    return NextResponse.json({ error: 'Failed to fetch routes' }, { status: 500 })
  }
}
