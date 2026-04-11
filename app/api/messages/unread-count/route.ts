import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

interface CountRow {
  count: number;
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ count: 0 })
  const uid = session.user.id
  
  try {
    const result = await db.execute(sql.raw(`
      SELECT COALESCE(SUM(CASE WHEN buyer_id = '${uid}' THEN buyer_unread_count ELSE seller_unread_count END), 0)::int as count
      FROM conversations WHERE buyer_id = '${uid}' OR seller_id = '${uid}'
    `))
    const count = ((result.rows ?? result)[0] as unknown as CountRow | undefined)?.count ?? 0
    return NextResponse.json({ count })
  } catch (error: unknown) {
    console.error('Get unread count error:', error)
    return NextResponse.json({ count: 0 })
  }
}
