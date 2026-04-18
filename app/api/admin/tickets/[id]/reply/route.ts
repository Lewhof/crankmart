import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { checkAdminApi } from '@/lib/admin'
import { getAdminCountry } from '@/lib/admin-country'
import { appendTicketMessage } from '@/lib/tickets'
import { sendEmail } from '@/lib/email'

interface Params { params: Promise<{ id: string }> }

/**
 * Admin reply to a ticket. Writes an outbound message + actually sends the
 * email so the requester receives it. Stamps the Message-ID onto the message
 * so future inbound replies thread correctly.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check
  const country = await getAdminCountry()
  const { id } = await params
  const session = (check as { session: { user?: { id?: string; email?: string; name?: string } } }).session

  let body: { bodyText?: string; bodyHtml?: string; internalNote?: boolean }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }
  if (!body.bodyText?.trim()) return NextResponse.json({ error: 'Body required' }, { status: 400 })

  // Pull requester info so we can build a real email.
  const tRes = await db.execute(sql`
    SELECT id, subject, requester_email, requester_name
    FROM tickets
    WHERE id = ${id}::uuid AND country = ${country}
    LIMIT 1
  `)
  const ticket = ((tRes.rows ?? tRes) as Array<{
    id: string; subject: string; requester_email: string | null; requester_name: string | null
  }>)[0]
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Internal notes stay in-app; no outbound email.
  if (body.internalNote) {
    await appendTicketMessage({
      ticketId: id,
      authorType: 'admin',
      authorId: session.user?.id ?? null,
      direction: 'internal_note',
      bodyText: body.bodyText,
      bodyHtml: body.bodyHtml,
    })
    return NextResponse.json({ ok: true })
  }

  if (!ticket.requester_email) {
    return NextResponse.json({ error: 'Ticket has no requester email to reply to' }, { status: 422 })
  }

  // Pull last inbound Message-ID so we can thread.
  const lastInboundRes = await db.execute(sql`
    SELECT email_message_id FROM ticket_messages
    WHERE ticket_id = ${id}::uuid AND direction = 'inbound' AND email_message_id IS NOT NULL
    ORDER BY created_at DESC LIMIT 1
  `)
  const inReplyTo = ((lastInboundRes.rows ?? lastInboundRes) as Array<{ email_message_id: string }>)[0]?.email_message_id

  // Prefix subject with [CM-<short id>] so subject-match fallback works.
  const shortId = id.replace(/-/g, '').slice(0, 8)
  const subject = ticket.subject.includes(`[CM-${shortId}]`)
    ? ticket.subject
    : `[CM-${shortId}] Re: ${ticket.subject}`

  const replyTo = process.env.POSTMARK_INBOUND_ADDRESS || 'support@crankmart.com'
  const sent = await sendEmail({
    to: ticket.requester_email,
    subject,
    html: body.bodyHtml || `<div style="font-family: system-ui, sans-serif; line-height: 1.55;">${body.bodyText.replace(/\n/g, '<br/>')}</div>`,
    text: body.bodyText,
    replyTo,
    ...(inReplyTo ? { inReplyTo, references: [inReplyTo] } : {}),
    stream: 'ticketing',
  })

  await appendTicketMessage({
    ticketId: id,
    authorType: 'admin',
    authorId: session.user?.id ?? null,
    direction: 'outbound',
    bodyText: body.bodyText,
    bodyHtml: body.bodyHtml,
    emailMessageId: sent.messageId ?? null,
    emailInReplyTo: inReplyTo ?? null,
  })

  return NextResponse.json({ ok: sent.ok, messageId: sent.messageId, reason: sent.reason })
}
