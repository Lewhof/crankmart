import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const adminCheck = await checkAdminApi()
    if (adminCheck instanceof NextResponse) return adminCheck

    const { id, imageId } = await params
    const body = await request.json()
    const safeId = id.replace(/'/g, "''")
    const safeImgId = imageId.replace(/'/g, "''")

    if (body.is_primary === true) {
      await db.execute(sql.raw(`
        UPDATE route_images SET is_primary = false WHERE route_id = '${safeId}'
      `))
    }

    const sets: string[] = []
    if ('alt_text' in body) sets.push(`alt_text = ${body.alt_text ? `'${body.alt_text.replace(/'/g, "''")}'` : 'NULL'}`)
    if ('is_primary' in body) sets.push(`is_primary = ${body.is_primary ? 'true' : 'false'}`)
    if ('display_order' in body) sets.push(`display_order = ${parseInt(String(body.display_order)) || 0}`)

    if (sets.length > 0) {
      await db.execute(sql.raw(`
        UPDATE route_images SET ${sets.join(', ')}
        WHERE id = '${safeImgId}' AND route_id = '${safeId}'
      `))
    }

    // Update route hero/primary URL
    await db.execute(sql.raw(`
      UPDATE routes SET
        hero_image_url = COALESCE(
          (SELECT url FROM route_images WHERE route_id = '${safeId}' AND is_primary = true LIMIT 1),
          (SELECT url FROM route_images WHERE route_id = '${safeId}' ORDER BY uploaded_at ASC LIMIT 1)
        ),
        primary_image_url = COALESCE(
          (SELECT url FROM route_images WHERE route_id = '${safeId}' AND is_primary = true LIMIT 1),
          (SELECT url FROM route_images WHERE route_id = '${safeId}' ORDER BY uploaded_at ASC LIMIT 1)
        )
      WHERE id = '${safeId}'
    `))

    const result = await db.execute(sql.raw(`
      SELECT * FROM route_images WHERE id = '${safeImgId}'
    `))
    return NextResponse.json((result.rows?.[0] || (result as unknown as unknown[])[0]))
  } catch (err) {
    console.error('PATCH /api/admin/routes/[id]/images/[imageId] error:', err)
    return NextResponse.json({ error: 'Failed to update image' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const adminCheck = await checkAdminApi()
    if (adminCheck instanceof NextResponse) return adminCheck

    const { id, imageId } = await params
    const safeId = id.replace(/'/g, "''")
    const safeImgId = imageId.replace(/'/g, "''")

    // Check if deleting primary
    const imgResult = await db.execute(sql.raw(`
      SELECT is_primary FROM route_images WHERE id = '${safeImgId}'
    `))
    const wasPrimary = ((imgResult.rows?.[0] || (imgResult as unknown as unknown[])[0]) as any)?.is_primary

    await db.execute(sql.raw(`
      DELETE FROM route_images WHERE id = '${safeImgId}' AND route_id = '${safeId}'
    `))

    // If deleted was primary, promote next image
    if (wasPrimary) {
      await db.execute(sql.raw(`
        UPDATE route_images SET is_primary = true
        WHERE id = (
          SELECT id FROM route_images WHERE route_id = '${safeId}'
          ORDER BY display_order ASC, uploaded_at ASC LIMIT 1
        )
      `))
    }

    // Update route image_count and hero/primary URL
    await db.execute(sql.raw(`
      UPDATE routes SET
        image_count = (SELECT COUNT(*) FROM route_images WHERE route_id = '${safeId}'),
        hero_image_url = (SELECT url FROM route_images WHERE route_id = '${safeId}' AND is_primary = true LIMIT 1),
        primary_image_url = (SELECT url FROM route_images WHERE route_id = '${safeId}' AND is_primary = true LIMIT 1)
      WHERE id = '${safeId}'
    `))

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/admin/routes/[id]/images/[imageId] error:', err)
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 })
  }
}
