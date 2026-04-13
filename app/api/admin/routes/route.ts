import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { getAdminCountry, isSuperadminSession } from '@/lib/admin-country'

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdminApi()
    if (adminCheck instanceof NextResponse) return adminCheck

    const { searchParams } = request.nextUrl
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const discipline = searchParams.get('discipline') || 'all'
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const limit = 20
    const offset = (page - 1) * limit

    const country = await getAdminCountry()
    const seeAll = isSuperadminSession(adminCheck.session) && searchParams.get('all') === '1'
    const countryFilter = seeAll ? sql`` : sql` AND r.country = ${country}`
    const statusFilter     = status !== 'all' ? sql` AND r.status = ${status}` : sql``
    const disciplineFilter = discipline !== 'all' ? sql` AND r.discipline = ${discipline}` : sql``
    const searchFilter     = search ? sql` AND (r.name ILIKE ${'%' + search + '%'} OR r.province ILIKE ${'%' + search + '%'} OR r.town ILIKE ${'%' + search + '%'})` : sql``

    const result = await db.execute(
      sql`
        SELECT r.id, r.slug, r.name, r.discipline, r.difficulty, r.province, r.town,
               r.distance_km, r.status, r.is_featured, r.is_verified,
               r.hero_image_url, r.primary_image_url, r.created_at,
               COUNT(ri.id)::int as image_count_live
        FROM routes r
        LEFT JOIN route_images ri ON ri.route_id = r.id
        WHERE 1=1
        ${countryFilter}
        ${statusFilter}
        ${disciplineFilter}
        ${searchFilter}
        GROUP BY r.id
        ORDER BY r.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
    )

    const countResult = await db.execute(
      sql`SELECT COUNT(*) as count FROM routes r WHERE 1=1 ${statusFilter} ${disciplineFilter} ${searchFilter}`,
    )
    const totalCount = parseInt((countResult.rows?.[0] as any)?.count || '0')

    return NextResponse.json({
      routes: result.rows || [],
      total: totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    })
  } catch (err) {
    console.error('GET /api/admin/routes error:', err)
    return NextResponse.json({ error: 'Failed to fetch routes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await checkAdminApi()
    if (adminCheck instanceof NextResponse) return adminCheck

    const body = await request.json()
    const {
      name, description, discipline, difficulty, surface,
      distance_km, elevation_m, est_time_min,
      province, region, town, lat, lng,
      website_url, contact_email, contact_phone, gpx_url,
      facilities, tags, is_featured, is_verified,
    } = body

    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

    const slug = slugify(name)
    const facilitiesJson = facilities ? JSON.stringify(facilities) : '{}'
    const tagsArray = tags && tags.length ? tags : []

    const insertCountry = await getAdminCountry()
    const insert = await db.execute(
      sql`
        INSERT INTO routes (
          country, slug, name, description, discipline, difficulty, surface,
          distance_km, elevation_m, est_time_min,
          province, region, town, lat, lng,
          website_url, contact_email, contact_phone, gpx_url,
          facilities, tags, is_featured, is_verified, status,
          image_count, created_at, updated_at
        ) VALUES (
          ${insertCountry},
          ${slug},
          ${name},
          ${description ?? null},
          ${discipline ?? null},
          ${difficulty ?? null},
          ${surface ?? null},
          ${distance_km != null ? parseFloat(distance_km) : null},
          ${elevation_m != null ? parseInt(elevation_m) : null},
          ${est_time_min != null ? parseInt(est_time_min) : null},
          ${province ?? null},
          ${region ?? null},
          ${town ?? null},
          ${lat != null ? parseFloat(lat) : null},
          ${lng != null ? parseFloat(lng) : null},
          ${website_url ?? null},
          ${contact_email ?? null},
          ${contact_phone ?? null},
          ${gpx_url ?? null},
          ${facilitiesJson},
          ${tagsArray},
          ${is_featured ? true : false},
          ${is_verified ? true : false},
          'pending',
          0, NOW(), NOW()
        ) RETURNING id, slug
      `,
    )

    const row = (insert.rows?.[0] || (insert as unknown as unknown[])[0]) as any
    return NextResponse.json({ id: row.id, slug: row.slug }, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/routes error:', err)
    return NextResponse.json({ error: 'Failed to create route' }, { status: 500 })
  }
}
