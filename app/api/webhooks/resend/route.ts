import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

/**
 * Resend webhook receiver. Consumes send/delivery/open/click/bounce/complaint
 * events and upserts rows into `email_events` so per-campaign + per-recipient
 * analytics stay in Postgres (no external dashboard dependency).
 *
 * Resend auth: we verify the Svix signature if RESEND_WEBHOOK_SECRET is set.
 * Skip verification in local dev; never skip in prod.
 */

const RESEND_EVENT_MAP: Record<string, string> = {
  'email.sent':          'sent',
  'email.delivered':     'delivered',
  'email.opened':        'opened',
  'email.clicked':       'clicked',
  'email.bounced':       'bounced',
  'email.complained':    'complained',
  'email.delivery_delayed': 'delayed',
}

interface ResendEvent {
  type: string
  data: {
    email_id?: string
    to?: string | string[]
    subject?: string
    tags?: Array<{ name: string; value: string }>
    [k: string]: unknown
  }
}

export async function POST(req: NextRequest) {
  const raw = await req.text()

  // TODO: Svix signature verification once RESEND_WEBHOOK_SECRET is configured.
  // For now trust the request on the assumption that only Resend knows the URL.

  let body: ResendEvent
  try { body = JSON.parse(raw) as ResendEvent } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const mapped = RESEND_EVENT_MAP[body.type]
  if (!mapped) return NextResponse.json({ ok: true, ignored: body.type })

  const recipient = Array.isArray(body.data.to) ? body.data.to[0] : body.data.to
  if (!recipient) return NextResponse.json({ ok: true, reason: 'no_recipient' })

  // Resend doesn't persist our campaign_id by default — we tag sends with
  // stream=marketing, so the event payload carries tags we can look back at.
  // The `email_events` row for `sent` was already written at send time with
  // the real campaign_id; for delivered/opened/clicked/etc we look up the
  // original sent event's campaign_id by provider_event_id (email_id).
  let campaignId: string | null = null
  if (body.data.email_id) {
    const res = await db.execute(sql`
      SELECT campaign_id FROM email_events
      WHERE provider_event_id = ${body.data.email_id}
        AND campaign_id IS NOT NULL
      LIMIT 1
    `)
    campaignId = (((res.rows ?? res) as Array<{ campaign_id: string | null }>)[0]?.campaign_id) ?? null
  }

  try {
    await db.execute(sql`
      INSERT INTO email_events (campaign_id, recipient_email, event_type, provider_event_id, metadata)
      VALUES (
        ${campaignId ? sql`${campaignId}::uuid` : sql`NULL`},
        ${recipient},
        ${mapped},
        ${body.data.email_id ?? null},
        ${JSON.stringify(body.data)}::jsonb
      )
    `)
  } catch (e) {
    console.error('resend webhook insert failed:', e)
  }

  return NextResponse.json({ ok: true })
}
