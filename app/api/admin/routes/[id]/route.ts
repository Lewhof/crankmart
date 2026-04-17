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
    const body = await request.json()

    const sets: string[] = []

    const str = (v: unknown) => `'${String(v).replace(/'/g, "''")}'`
    const num = (v: unknown) => v != null && v !== '' ? parseFloat(String(v)) : 'NULL'
    const int = (v: unknown) => v != null && v !== '' ? parseInt(String(v)) : 'NULL'
    const bool = (v: unknown) => v ? 'true' : 'false'

    if ('name' in body) sets.push(`name = ${str(body.name)}`)
    if ('slug' in body) sets.push(`slug = ${str(body.slug)}`)
    else if ('name' in body && body.name) sets.push(`slug = ${str(slugify(body.name))}`)
    if ('description' in body) sets.push(`description = ${body.description ? str(body.description) : 'NULL'}`)
    if ('status' in body) sets.push(`status = ${str(body.status)}`)
    if ('discipline' in body) sets.push(`discipline = ${body.discipline ? str(body.discipline) : 'NULL'}`)
    if ('difficulty' in body) sets.push(`difficulty = ${body.difficulty ? str(body.difficulty) : 'NULL'}`)
    if ('surface' in body) sets.push(`surface = ${body.surface ? str(body.surface) : 'NULL'}`)
    if ('distance_km' in body) sets.push(`distance_km = ${num(body.distance_km)}`)
    if ('elevation_m' in body) sets.push(`elevation_m = ${int(body.elevation_m)}`)
    if ('est_time_min' in body) sets.push(`est_time_min = ${int(body.est_time_min)}`)
    if ('province' in body) sets.push(`province = ${body.province ? str(body.province) : 'NULL'}`)
    if ('region' in body) sets.push(`region = ${body.region ? str(body.region) : 'NULL'}`)
    if ('town' in body) sets.push(`town = ${body.town ? str(body.town) : 'NULL'}`)
    if ('lat' in body) sets.push(`lat = ${num(body.lat)}`)
    if ('lng' in body) sets.push(`lng = ${num(body.lng)}`)
    if ('website_url' in body) sets.push(`website_url = ${body.website_url ? str(body.website_url) : 'NULL'}`)
    if ('contact_email' in body) sets.push(`contact_email = ${body.contact_email ? str(body.contact_email) : 'NULL'}`)
    if ('contact_phone' in body) sets.push(`contact_phone = ${body.contact_phone ? str(body.contact_phone) : 'NULL'}`)
    if ('gpx_url' in body) sets.push(`gpx_url = ${body.gpx_url ? str(body.gpx_url) : 'NULL'}`)
    if ('is_featured' in body) sets.push(`is_featured = ${bool(body.is_featured)}`)
    if ('is_verified' in body) sets.push(`is_verified = ${bool(body.is_verified)}`)
    if ('facilities' in body) sets.push(`facilities = '${JSON.stringify(body.facilities || {}).replace(/'/g, "''")}'`)
    if ('tags' in body) {
      const tags = Array.isArray(body.tags) ? body.tags : []
      sets.push(`tags = ARRAY[${tags.map((t: string) => `'${String(t).replace(/'/g, "''")}'`).join(',')}]::text[]`)
    }

    sets.push(`image_count = (SELECT COUNT(*) FROM route_images WHERE route_id = '${id.replace(/'/g, "''")}'::uuid)`)
    sets.push(`updated_at = NOW()`)

    if (sets.length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 })

    const patchCountry = await getAdminCountry()
    const patchSeeAll = isSuperadminSession(adminCheck.session) && request.nextUrl.searchParams.get('all') === '1'
    const safeId = id.replace(/'/g, "''")
    const patchCountryCond = patchSeeAll ? '' : ` AND country = '${patchCountry.replace(/'/g, "''")}'`
    const result = await db.execute(sql.raw(`
      UPDATE routes SET ${sets.join(', ')}
      WHERE id = '${safeId}' ${patchCountryCond}
      RETURNING *
    `))
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
