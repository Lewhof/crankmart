import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const adminCheck = await checkAdminApi()
    if (adminCheck instanceof NextResponse) return adminCheck
    const { action } = await request.json()
    const { id } = await params

    if (action === 'make_admin') {
      await db.execute(sql`UPDATE users SET is_admin = true WHERE id = ${id}`)
      return NextResponse.json({ success: true, action: 'made_admin' })
    } else if (action === 'remove_admin') {
      await db.execute(sql`UPDATE users SET is_admin = false WHERE id = ${id}`)
      return NextResponse.json({ success: true, action: 'removed_admin' })
    } else if (action === 'ban') {
      await db.execute(
        sql`UPDATE users SET status = 'banned', banned_at = NOW() WHERE id = ${id}`,
      )
      return NextResponse.json({ success: true, action: 'banned' })
    } else if (action === 'unban') {
      await db.execute(sql`UPDATE users SET status = 'active', banned_at = NULL WHERE id = ${id}`)
      return NextResponse.json({ success: true, action: 'unbanned' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('User action error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
