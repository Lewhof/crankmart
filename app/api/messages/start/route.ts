import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { z } from 'zod'
import { sql, eq, and } from 'drizzle-orm'
import { sendEmail, newMessageEmail } from '@/lib/email'

const StartMessageSchema = z.object({
  listingId: z.string().uuid('Invalid listing ID'),
  body: z.string().min(1, 'Message cannot be empty').max(2000, 'Message exceeds maximum length'),
})

interface ListingRow {
  id: string;
  seller_id: string;
  title: string;
  slug: string;
}

interface ConversationRow {
  id: string;
}

interface UserRow {
  name: string | null;
  email: string;
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const parsed = StartMessageSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Validation failed' }, { status: 400 })
  }

  const { listingId, body } = parsed.data
  
  try {
    // Get listing + seller (using parameterised query)
    const listingResult = await db.execute(
      sql`SELECT id, seller_id, title, slug FROM listings WHERE id = ${listingId}`
    )
    const listing = (listingResult.rows ?? listingResult)[0] as unknown as ListingRow | undefined
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    if (listing.seller_id === session.user.id) return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 })
    
    // Find or create conversation (using parameterised query)
    const existing = await db.execute(
      sql`SELECT id FROM conversations WHERE listing_id = ${listingId} AND buyer_id = ${session.user.id}`
    )
    const rows = (existing.rows ?? existing) as unknown as ConversationRow[]
    
    let conversationId: string
    if (rows.length > 0) {
      conversationId = rows[0].id
    } else {
      const created = await db.execute(
        sql`INSERT INTO conversations (listing_id, buyer_id, seller_id, subject, seller_unread_count) 
            VALUES (${listingId}, ${session.user.id}, ${listing.seller_id}, ${'Re: ' + listing.title}, 1) 
            RETURNING id`
      )
      conversationId = ((created.rows ?? created)[0] as unknown as ConversationRow).id
    }
    
    // Insert message (using parameterised query)
    await db.execute(
      sql`INSERT INTO messages (conversation_id, sender_id, body) VALUES (${conversationId}, ${session.user.id}, ${body.trim()})`
    )
    
    // Update conversation (using parameterised query)
    await db.execute(
      sql`UPDATE conversations SET last_message_at = NOW(), seller_unread_count = seller_unread_count + 1 WHERE id = ${conversationId}`
    )

    // Email notification to seller — fire and forget
    try {
      const sellerResult = await db.execute(
        sql`SELECT name, email FROM users WHERE id = ${listing.seller_id}`
      )
      const seller = ((sellerResult.rows ?? sellerResult)[0] as unknown as UserRow | undefined)
      if (seller?.email) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://crankmart.com'
        await sendEmail({
          to: seller.email,
          subject: `New message about "${listing.title}" on CrankMart`,
          html: newMessageEmail({
            sellerName: seller.name || 'there',
            buyerName: session.user.name || 'A buyer',
            listingTitle: listing.title,
            messagePreview: body.trim().slice(0, 200),
            listingUrl: `${baseUrl}/browse/${listing.slug || listingId}`,
            inboxUrl: `${baseUrl}/account?tab=messages&conversation=${conversationId}`,
          }),
        })
      }
    } catch (emailErr) {
      console.error('Email notification failed (non-fatal):', emailErr)
    }

    return NextResponse.json({ conversationId })
  } catch (error: unknown) {
    console.error('Message start error:', error)
    const message = error instanceof Error ? error.message : 'Failed to start conversation'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
