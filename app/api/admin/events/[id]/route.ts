import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

interface ActionRequest {
  action: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const adminCheck = await checkAdminApi()
    if (adminCheck instanceof NextResponse) return adminCheck
    const { action } = (await request.json()) as ActionRequest
    const { id } = await params

    if (action === 'approve') {
      await db.execute(
        sql.raw(`UPDATE events SET moderation_status = 'approved' WHERE id = '${id}'`),
      )
      return NextResponse.json({ success: true, action: 'approved' })
    } else if (action === 'reject') {
      await db.execute(
        sql.raw(`UPDATE events SET moderation_status = 'rejected' WHERE id = '${id}'`),
      )
      return NextResponse.json({ success: true, action: 'rejected' })
    } else if (action === 'feature') {
      await db.execute(sql.raw(`UPDATE events SET is_featured = true WHERE id = '${id}'`))
      return NextResponse.json({ success: true, action: 'featured' })
    } else if (action === 'unfeature') {
      await db.execute(sql.raw(`UPDATE events SET is_featured = false WHERE id = '${id}'`))
      return NextResponse.json({ success: true, action: 'unfeatured' })
    } else if (action === 'delete') {
      await db.execute(sql.raw(`UPDATE events SET status = 'cancelled' WHERE id = '${id}'`))
      return NextResponse.json({ success: true, action: 'deleted' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: unknown) {
    console.error('Event action error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
