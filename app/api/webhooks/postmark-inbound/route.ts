import { NextRequest, NextResponse } from 'next/server'
import { appendTicketMessage, findTicketFromInboundEmail } from '@/lib/tickets'

/**
 * Inbound email webhook — Postmark format. Delivers a parsed email JSON payload
 * including StrippedTextReply (quote-stripped) + Headers. We match the reply
 * back to an existing ticket via In-Reply-To / References headers and append
 * an inbound message, or fall back to [CM-xxxx] in the subject line.
 *
 * No reply-matching? Log it for admin review. We do NOT create a new ticket
 * from unknown inbound email by default — too much phishing / spam surface.
 */

interface PostmarkInboundPayload {
  From?: string
  FromName?: string
  To?: string
  Subject?: string
  MessageID?: string // Postmark's ID (not RFC 5322)
  TextBody?: string
  HtmlBody?: string
  StrippedTextReply?: string
  Headers?: Array<{ Name: string; Value: string }>
}

function getHeader(payload: PostmarkInboundPayload, name: string): string | null {
  const entry = payload.Headers?.find(h => h.Name.toLowerCase() === name.toLowerCase())
  return entry?.Value ?? null
}

export async function POST(req: NextRequest) {
  const secret = process.env.POSTMARK_INBOUND_SECRET
  if (secret) {
    // Postmark adds a URL query param `?token=` — check it matches.
    const provided = req.nextUrl.searchParams.get('token')
    if (provided !== secret) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
  }

  let payload: PostmarkInboundPayload
  try {
    payload = await req.json() as PostmarkInboundPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const inReplyTo = getHeader(payload, 'In-Reply-To')
  const referencesRaw = getHeader(payload, 'References')
  const references = referencesRaw?.split(/\s+/).filter(Boolean) ?? []
  const rfcMessageId = getHeader(payload, 'Message-ID')

  const match = await findTicketFromInboundEmail({
    inReplyTo,
    references,
    subject: payload.Subject,
  })

  if (!match) {
    console.log('[postmark-inbound] unmatched reply', { from: payload.From, subject: payload.Subject })
    return NextResponse.json({ ok: true, matched: false })
  }

  const bodyText = (payload.StrippedTextReply || payload.TextBody || '').trim()
  if (!bodyText) {
    return NextResponse.json({ ok: true, matched: true, empty: true })
  }

  await appendTicketMessage({
    ticketId: match.ticketId,
    authorType: 'user',
    direction: 'inbound',
    bodyText,
    bodyHtml: payload.HtmlBody ?? undefined,
    emailMessageId: rfcMessageId ?? payload.MessageID ?? undefined,
    emailInReplyTo: inReplyTo ?? undefined,
  })

  return NextResponse.json({ ok: true, ticketId: match.ticketId })
}
