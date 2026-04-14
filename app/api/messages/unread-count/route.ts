import { NextResponse } from 'next/server'
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
    const result = await db.execute(sql`
      SELECT COALESCE(SUM(
        CASE WHEN buyer_id = ${uid} THEN buyer_unread_count ELSE seller_unread_count END
      ), 0)::int AS count
      FROM conversations
      WHERE buyer_id = ${uid} OR seller_id = ${uid}
    `)
    const rows = (result.rows ?? result) as unknown as CountRow[]
    return NextResponse.json({ count: rows[0]?.count ?? 0 })
  } catch (error) {
    console.error('Get unread count error:', error)
    return NextResponse.json({ count: 0 })
  }
}
