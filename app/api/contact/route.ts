import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { auth } from '@/auth'
import { limiters, clientKey, check, rateLimitHeaders } from '@/lib/ratelimit'
import { getCountry } from '@/lib/country'
import { createTicket } from '@/lib/tickets'
import { createHash } from 'crypto'

/**
 * Public contact-us endpoint. Writes a row to `contact_submissions` then
 * creates a ticket linked back to it. IP is hashed (not stored raw) so we
 * can rate-limit repeat spammers without PII.
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id ?? null
  const email = session?.user?.email ?? null

  const rl = await check(limiters.reports, clientKey(req, userId ? `contact:${userId}` : 'contact:anon'))
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Too many messages. Try again in a few minutes.' },
      { status: 429, headers: rateLimitHeaders(rl) },
    )
  }

  let body: { name?: string; email?: string; subject?: string; body?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

  const name = (body.name ?? session?.user?.name ?? '').trim()
  const fromEmail = (body.email ?? email ?? '').trim().toLowerCase()
  const subject = (body.subject ?? '').trim()
  const message = (body.body ?? '').trim()

  if (!fromEmail.includes('@')) return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  if (message.length < 10) return NextResponse.json({ error: 'Message too short' }, { status: 400 })
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const country = await getCountry()
  const ipHash = createHash('sha256').update(clientKey(req)).digest('hex').slice(0, 32)
  const userAgent = (req.headers.get('user-agent') ?? '').slice(0, 255)

  const subRes = await db.execute(sql`
    INSERT INTO contact_submissions (country, name, email, subject, body, ip_hash, user_agent)
    VALUES (${country}, ${name}, ${fromEmail}, ${subject || null}, ${message}, ${ipHash}, ${userAgent})
    RETURNING id
  `)
  const contactId = ((subRes.rows ?? subRes) as Array<{ id: string }>)[0].id

  const ticketId = await createTicket({
    country,
    subject: subject || `Contact from ${name}`,
    priority: 'normal',
    category: 'contact',
    requesterUserId: userId,
    requesterEmail: fromEmail,
    requesterName: name,
    sourceContactId: contactId,
    initialMessageText: message,
  })

  return NextResponse.json({ ok: true, ticketId })
}
