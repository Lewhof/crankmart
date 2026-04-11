import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { sql, or } from 'drizzle-orm'

interface ConversationRow {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: string;
  status: string;
  buyer_unread_count: number;
  seller_unread_count: number;
  listing_title: string;
  listing_slug: string;
  listing_image: string | null;
  last_message: string | null;
  buyer_name: string;
  buyer_email: string;
  buyer_avatar: string | null;
  seller_name: string;
  seller_email: string;
  seller_avatar: string | null;
}

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const uid = session.user.id
  
  try {
    const result = await db.execute(sql`
      SELECT 
        c.id, c.listing_id, c.buyer_id, c.seller_id, c.last_message_at, c.status,
        c.buyer_unread_count, c.seller_unread_count,
        l.title as listing_title, l.slug as listing_slug,
        (SELECT image_url FROM listing_images WHERE listing_id = c.listing_id ORDER BY display_order ASC LIMIT 1) as listing_image,
        (SELECT body FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        buyer.name as buyer_name, buyer.email as buyer_email, buyer.avatar_url as buyer_avatar,
        seller.name as seller_name, seller.email as seller_email, seller.avatar_url as seller_avatar
      FROM conversations c
      JOIN listings l ON l.id = c.listing_id
      JOIN users buyer ON buyer.id = c.buyer_id
      JOIN users seller ON seller.id = c.seller_id
      WHERE c.buyer_id = ${uid} OR c.seller_id = ${uid}
      ORDER BY c.last_message_at DESC
    `)
    
    return NextResponse.json(result.rows ?? result)
  } catch (error: unknown) {
    console.error('Get conversations error:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch conversations'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
