import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await db.execute(sql`
      SELECT u.id, u.name, u.province, u.city, u.created_at as "createdAt",
        COUNT(l.id) FILTER (WHERE l.status = 'active') as "listingCount"
      FROM users u
      LEFT JOIN listings l ON l.seller_id = u.id
      WHERE u.id = ${id}
      GROUP BY u.id, u.name, u.province, u.city, u.created_at
    `)
    const rows = (result.rows ?? result) as any[]
    if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (error) {
    console.error('Seller profile error:', error)
    return NextResponse.json({ error: 'Failed to fetch seller' }, { status: 500 })
  }
}
