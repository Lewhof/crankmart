import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await checkAdminApi()
    if (adminCheck instanceof NextResponse) return adminCheck

    const { id } = await params
    const result = await db.execute(sql.raw(`
      SELECT * FROM route_images
      WHERE route_id = '${id.replace(/'/g, "''")}'
      ORDER BY is_primary DESC, display_order ASC, uploaded_at ASC
    `))
    return NextResponse.json(result.rows || result)
  } catch (err) {
    console.error('GET /api/admin/routes/[id]/images error:', err)
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await checkAdminApi()
    if (adminCheck instanceof NextResponse) return adminCheck

    const { id } = await params
    const body = await request.json()
    const { url, alt_text, is_primary = false, display_order = 0 } = body

    if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 })

    const safeId = id.replace(/'/g, "''")

    if (is_primary) {
      await db.execute(sql.raw(`
        UPDATE route_images SET is_primary = false WHERE route_id = '${safeId}'
      `))
    }

    const insert = await db.execute(sql.raw(`
      INSERT INTO route_images (route_id, url, alt_text, is_primary, display_order, uploaded_at)
      VALUES (
        '${safeId}',
        '${url.replace(/'/g, "''")}',
        ${alt_text ? `'${alt_text.replace(/'/g, "''")}'` : 'NULL'},
        ${is_primary ? 'true' : 'false'},
        ${parseInt(String(display_order)) || 0},
        NOW()
      ) RETURNING *
    `))

    const newImage = (insert.rows?.[0] || (insert as unknown as unknown[])[0]) as any

    // Update route image count and hero/primary URL
    await db.execute(sql.raw(`
      UPDATE routes SET
        image_count = (SELECT COUNT(*) FROM route_images WHERE route_id = '${safeId}'),
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

    return NextResponse.json(newImage, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/routes/[id]/images error:', err)
    return NextResponse.json({ error: 'Failed to add image' }, { status: 500 })
  }
}
