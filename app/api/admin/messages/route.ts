import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { getAdminCountry, isSuperadminSession } from '@/lib/admin-country'

interface ConversationWithDetails {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  status: string;
  message_count: number;
  last_message_at: string;
  listing_title: string;
  buyer_name: string;
  seller_name: string;
}

interface PaginationData {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

interface CountRow {
  count: number | string;
}

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdminApi()
    if (adminCheck instanceof NextResponse) return adminCheck
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const offset = (page - 1) * limit

    const country = await getAdminCountry()
    const seeAll = isSuperadminSession(adminCheck.session) && searchParams.get('all') === '1'
    const countryFilter = seeAll ? sql`` : sql` AND l.country = ${country}`

    const result = await db.execute(sql`
      SELECT
        c.id, c.listing_id, c.buyer_id, c.seller_id, c.status,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) as message_count,
        c.last_message_at,
        l.title as listing_title,
        (SELECT name FROM users WHERE id = c.buyer_id) as buyer_name,
        (SELECT name FROM users WHERE id = c.seller_id) as seller_name
      FROM conversations c
      JOIN listings l ON l.id = c.listing_id
      WHERE 1=1 ${countryFilter}
      ORDER BY c.last_message_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `)

    const conversations = (result.rows || []) as unknown as ConversationWithDetails[]

    const countResult = await db.execute(sql`
      SELECT COUNT(*) as count FROM conversations c
      JOIN listings l ON l.id = c.listing_id
      WHERE 1=1 ${countryFilter}
    `)
    const totalCount = parseInt(((countResult.rows?.[0] as unknown as CountRow | undefined)?.count || '0').toString())
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      conversations,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
    })
  } catch (error: unknown) {
    console.error('Messages error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
