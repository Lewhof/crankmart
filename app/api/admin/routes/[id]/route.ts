import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { getAdminCountry, isSuperadminSession } from '@/lib/admin-country'

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await checkAdminApi()
    if (adminCheck instanceof NextResponse) return adminCheck

    const { id } = await params
    const country = await getAdminCountry()
    const seeAll = isSuperadminSession(adminCheck.session) && _request.nextUrl.searchParams.get('all') === '1'
    const safeId = id.replace(/'/g, "''")
    const countryCond = seeAll ? '' : ` AND country = '${country.replace(/'/g, "''")}'`
    const result = await db.execute(sql.raw(`
      SELECT * FROM routes WHERE id = '${safeId}' ${countryCond}
    `))
    const route = result.rows?.[0] || (result as unknown as unknown[])[0]
    if (!route) return NextResponse.json({ error: 'Route not found' }, { status: 404 })
    return NextResponse.json(route)
  } catch (err) {
    console.error('GET /api/admin/routes/[id] error:', err)
    return NextResponse.json({ error: 'Failed to fetch route' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await checkAdminApi()
    if (adminCheck instanceof NextResponse) return adminCheck

    const { id } = await params
    const body = await request.json() as Record<string, unknown>

    // Each entry is either `sql\`col = ${value}\`` or null (field not present in body).
    // Drizzle parameterises every ${...} interpolation — SQL injection safe.
    const sets: Array<ReturnType<typeof sql>> = []

    const numOrNull = (v: unknown) =>
      v != null && v !== '' ? parseFloat(String(v)) : null
    const intOrNull = (v: unknown) =>
      v != null && v !== '' ? parseInt(String(v), 10) : null
    const strOrNull = (v: unknown) =>
      v != null && v !== '' ? String(v) : null

    if ('name' in body) sets.push(sql`name = ${String(body.name ?? '')}`)
    if ('slug' in body) sets.push(sql`slug = ${String(body.slug ?? '')}`)
    else if ('name' in body && body.name) sets.push(sql`slug = ${slugify(String(body.name))}`)
    if ('description' in body)  sets.push(sql`description = ${strOrNull(body.description)}`)
    if ('status' in body)       sets.push(sql`status = ${String(body.status ?? '')}`)
    if ('discipline' in body)   sets.push(sql`discipline = ${strOrNull(body.discipline)}`)
    if ('difficulty' in body)   sets.push(sql`difficulty = ${strOrNull(body.difficulty)}`)
    if ('surface' in body)      sets.push(sql`surface = ${strOrNull(body.surface)}`)
    if ('distance_km' in body)  sets.push(sql`distance_km = ${numOrNull(body.distance_km)}`)
    if ('elevation_m' in body)  sets.push(sql`elevation_m = ${intOrNull(body.elevation_m)}`)
    if ('est_time_min' in body) sets.push(sql`est_time_min = ${intOrNull(body.est_time_min)}`)
    if ('province' in body)     sets.push(sql`province = ${strOrNull(body.province)}`)
    if ('region' in body)       sets.push(sql`region = ${strOrNull(body.region)}`)
    if ('town' in body)         sets.push(sql`town = ${strOrNull(body.town)}`)
    if ('lat' in body)          sets.push(sql`lat = ${numOrNull(body.lat)}`)
    if ('lng' in body)          sets.push(sql`lng = ${numOrNull(body.lng)}`)
    if ('website_url' in body)  sets.push(sql`website_url = ${strOrNull(body.website_url)}`)
    if ('contact_email' in body)sets.push(sql`contact_email = ${strOrNull(body.contact_email)}`)
    if ('contact_phone' in body)sets.push(sql`contact_phone = ${strOrNull(body.contact_phone)}`)
    if ('gpx_url' in body)      sets.push(sql`gpx_url = ${strOrNull(body.gpx_url)}`)
    if ('is_featured' in body)  sets.push(sql`is_featured = ${!!body.is_featured}`)
    if ('is_verified' in body)  sets.push(sql`is_verified = ${!!body.is_verified}`)
    if ('facilities' in body) {
      const facilities = JSON.stringify(body.facilities || {})
      sets.push(sql`facilities = ${facilities}::jsonb`)
    }
    if ('tags' in body) {
      const tags = (Array.isArray(body.tags) ? body.tags : []).map(String)
      sets.push(sql`tags = ${tags}::text[]`)
    }

    sets.push(sql`image_count = (SELECT COUNT(*) FROM route_images WHERE route_id = ${id}::uuid)`)
    sets.push(sql`updated_at = NOW()`)

    if (sets.length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 })

    const patchCountry = await getAdminCountry()
    const patchSeeAll = isSuperadminSession(adminCheck.session) && request.nextUrl.searchParams.get('all') === '1'
    const patchCountryCond = patchSeeAll ? sql`` : sql` AND country = ${patchCountry}`

    const result = await db.execute(sql`
      UPDATE routes SET ${sql.join(sets, sql`, `)}
      WHERE id = ${id}::uuid ${patchCountryCond}
      RETURNING *
    `)
    const updated = result.rows?.[0] || (result as unknown as unknown[])[0]
    return NextResponse.json(updated)
  } catch (err) {
    console.error('PATCH /api/admin/routes/[id] error:', err)
    return NextResponse.json({ error: 'Failed to update route' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await checkAdminApi()
    if (adminCheck instanceof NextResponse) return adminCheck

    const { id } = await params
    const delCountry = await getAdminCountry()
    const delSeeAll = isSuperadminSession(adminCheck.session) && _request.nextUrl.searchParams.get('all') === '1'
    const delCountryCond = delSeeAll ? sql`` : sql` AND country = ${delCountry}`

    // Only delete images if the parent route belongs to the admin's country.
    await db.execute(sql`
      DELETE FROM route_images
      WHERE route_id IN (SELECT id FROM routes WHERE id = ${id}::uuid ${delCountryCond})
    `)
    await db.execute(sql`DELETE FROM routes WHERE id = ${id}::uuid ${delCountryCond}`)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/admin/routes/[id] error:', err)
    return NextResponse.json({ error: 'Failed to delete route' }, { status: 500 })
  }
}
