import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { getAdminCountry, isSuperadminSession } from '@/lib/admin-country'

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

    const country = await getAdminCountry()
    const seeAll = isSuperadminSession(adminCheck.session) && request.nextUrl.searchParams.get('all') === '1'
    const g = seeAll ? sql`` : sql` AND country = ${country}`

    if (action === 'approve') {
      await db.execute(sql`UPDATE listings SET moderation_status = 'approved' WHERE id = ${id} ${g}`)
      return NextResponse.json({ success: true, action: 'approved' })
    } else if (action === 'reject') {
      await db.execute(sql`UPDATE listings SET moderation_status = 'rejected' WHERE id = ${id} ${g}`)
      return NextResponse.json({ success: true, action: 'rejected' })
    } else if (action === 'delete') {
      await db.execute(sql`UPDATE listings SET status = 'removed' WHERE id = ${id} ${g}`)
      return NextResponse.json({ success: true, action: 'deleted' })
    } else if (action === 'feature') {
      await db.execute(sql`UPDATE listings SET is_featured = true, featured_expires_at = NOW() + INTERVAL '7 days' WHERE id = ${id} ${g}`)
      return NextResponse.json({ success: true, action: 'featured' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: unknown) {
    console.error('Listing action error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
