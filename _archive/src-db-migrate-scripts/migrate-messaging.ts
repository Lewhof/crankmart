import { db } from './index'
import { sql } from 'drizzle-orm'

async function main() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        listing_id UUID NOT NULL,
        buyer_id UUID NOT NULL,
        seller_id UUID NOT NULL,
        subject VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        buyer_unread_count INTEGER DEFAULT 0,
        seller_unread_count INTEGER DEFAULT 0,
        last_message_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('✅ Conversations table created')

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL,
        body TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('✅ Messages table created')

    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON conversations(buyer_id)`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_conversations_seller ON conversations(seller_id)`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id)`)
    console.log('✅ Indexes created')
    
    console.log('✅ All messaging tables created successfully')
    process.exit(0)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}
