import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/db'
import { sql, or, and, ne } from 'drizzle-orm'

const PostMessageSchema = z.object({
  body: z.string().min(1, 'Message cannot be empty'),
})

interface ConversationRow {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  [key: string]: unknown;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { conversationId } = await params
  const uid = session.user.id
  
  try {
    // Verify access using parameterised query
    const conv = await db.execute(sql`SELECT * FROM conversations WHERE id = ${conversationId} AND (buyer_id = ${uid} OR seller_id = ${uid})`)
    const convRows = (conv.rows ?? conv) as ConversationRow[]
    if (!convRows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
    // Mark read
    const c = convRows[0]
    if (c.buyer_id === uid) {
      await db.execute(sql`UPDATE conversations SET buyer_unread_count = 0 WHERE id = ${conversationId}`)
    } else {
      await db.execute(sql`UPDATE conversations SET seller_unread_count = 0 WHERE id = ${conversationId}`)
    }
    await db.execute(sql`UPDATE messages SET is_read = true WHERE conversation_id = ${conversationId} AND sender_id != ${uid}`)
    
    const messages = await db.execute(sql`SELECT * FROM messages WHERE conversation_id = ${conversationId} ORDER BY created_at ASC`)
    return NextResponse.json({ conversation: c, messages: (messages.rows ?? messages) })
  } catch (error: unknown) {
    console.error('Get thread error:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch thread'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { conversationId } = await params
  const uid = session.user.id
  
  const data = await request.json()
  const validation = PostMessageSchema.safeParse(data)
  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid message payload', details: validation.error }, { status: 400 })
  }
  const { body } = validation.data
  
  try {
    const conv = await db.execute(sql`SELECT * FROM conversations WHERE id = ${conversationId} AND (buyer_id = ${uid} OR seller_id = ${uid})`)
    const convRows = (conv.rows ?? conv) as ConversationRow[]
    if (!convRows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const c = convRows[0]
    
    const msg = await db.execute(sql`INSERT INTO messages (conversation_id, sender_id, body) VALUES (${conversationId}, ${uid}, ${body.trim()}) RETURNING *`)
    const newMsg = (msg.rows ?? msg)[0]
    
    // Increment other party unread using parameterised query
    if (c.buyer_id === uid) {
      await db.execute(sql`UPDATE conversations SET last_message_at = NOW(), seller_unread_count = seller_unread_count + 1 WHERE id = ${conversationId}`)
    } else {
      await db.execute(sql`UPDATE conversations SET last_message_at = NOW(), buyer_unread_count = buyer_unread_count + 1 WHERE id = ${conversationId}`)
    }
    
    return NextResponse.json(newMsg)
  } catch (error: unknown) {
    console.error('Send message error:', error)
    const message = error instanceof Error ? error.message : 'Failed to send message'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
