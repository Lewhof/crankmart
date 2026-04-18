import 'server-only'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import type { Country } from './country'

export type TicketStatus = 'todo' | 'snoozed' | 'done'
export type TicketPriority = 'urgent' | 'high' | 'normal' | 'low'

const SLA_HOURS_BY_PRIORITY: Record<TicketPriority, number> = {
  urgent: 4,
  high:   24,
  normal: 72,
  low:    168, // 1 week
}

export interface CreateTicketInput {
  country: Country
  subject: string
  priority?: TicketPriority
  category?: string
  requesterUserId?: string | null
  requesterEmail?: string | null
  requesterName?: string | null
  /** Exactly one source_* — caller enforces. */
  sourceListingId?: string
  sourceFlagId?: string
  sourceStolenReportId?: string
  sourceLostReportId?: string
  sourceNewsArticleId?: string
  sourceBusinessId?: string
  sourceContactId?: string
  initialMessageText: string
  initialMessageHtml?: string
  initialMessageId?: string | null
}

/**
 * Creates a ticket + its first inbound message atomically, including the
 * priority-based SLA computation. Returns the new ticket ID.
 */
export async function createTicket(input: CreateTicketInput): Promise<string> {
  const ticketId = randomUUID()
  const priority: TicketPriority = input.priority ?? 'normal'
  const slaHours = SLA_HOURS_BY_PRIORITY[priority]

  await db.execute(sql`
    INSERT INTO tickets (
      id, country, subject, priority, category,
      requester_user_id, requester_email, requester_name,
      sla_target_hours, sla_due_at,
      source_listing_id, source_flag_id, source_stolen_report_id,
      source_lost_report_id, source_news_article_id, source_business_id,
      source_contact_id
    ) VALUES (
      ${ticketId}::uuid, ${input.country}, ${input.subject.slice(0, 500)},
      ${priority}, ${input.category ?? null},
      ${input.requesterUserId ? sql`${input.requesterUserId}::uuid` : sql`NULL`},
      ${input.requesterEmail ?? null}, ${input.requesterName ?? null},
      ${slaHours}, NOW() + make_interval(hours => ${slaHours}),
      ${input.sourceListingId ? sql`${input.sourceListingId}::uuid` : sql`NULL`},
      ${input.sourceFlagId ? sql`${input.sourceFlagId}::uuid` : sql`NULL`},
      ${input.sourceStolenReportId ? sql`${input.sourceStolenReportId}::uuid` : sql`NULL`},
      ${input.sourceLostReportId ? sql`${input.sourceLostReportId}::uuid` : sql`NULL`},
      ${input.sourceNewsArticleId ? sql`${input.sourceNewsArticleId}::uuid` : sql`NULL`},
      ${input.sourceBusinessId ? sql`${input.sourceBusinessId}::uuid` : sql`NULL`},
      ${input.sourceContactId ? sql`${input.sourceContactId}::uuid` : sql`NULL`}
    )
  `)

  await db.execute(sql`
    INSERT INTO ticket_messages (
      ticket_id, author_type, author_id, direction,
      body_html, body_text, email_message_id
    ) VALUES (
      ${ticketId}::uuid, 'user', ${input.requesterUserId ? sql`${input.requesterUserId}::uuid` : sql`NULL`},
      'inbound',
      ${input.initialMessageHtml ?? null}, ${input.initialMessageText},
      ${input.initialMessageId ?? null}
    )
  `)

  return ticketId
}

/**
 * Appends a message to a ticket. Updates first_response_at when appropriate
 * and recomputes status / first-response markers.
 */
export async function appendTicketMessage(opts: {
  ticketId: string
  authorType: 'user' | 'admin' | 'system'
  authorId?: string | null
  direction: 'inbound' | 'outbound' | 'internal_note'
  bodyText: string
  bodyHtml?: string
  emailMessageId?: string | null
  emailInReplyTo?: string | null
}): Promise<void> {
  await db.execute(sql`
    INSERT INTO ticket_messages (
      ticket_id, author_type, author_id, direction,
      body_html, body_text, email_message_id, email_in_reply_to
    ) VALUES (
      ${opts.ticketId}::uuid, ${opts.authorType},
      ${opts.authorId ? sql`${opts.authorId}::uuid` : sql`NULL`},
      ${opts.direction},
      ${opts.bodyHtml ?? null}, ${opts.bodyText},
      ${opts.emailMessageId ?? null}, ${opts.emailInReplyTo ?? null}
    )
  `)

  // First admin outbound OR internal note marks first_response_at.
  if (opts.direction === 'outbound' && opts.authorType === 'admin') {
    await db.execute(sql`
      UPDATE tickets
      SET first_response_at = COALESCE(first_response_at, NOW()),
          updated_at = NOW()
      WHERE id = ${opts.ticketId}::uuid
    `)
  } else {
    await db.execute(sql`UPDATE tickets SET updated_at = NOW() WHERE id = ${opts.ticketId}::uuid`)
  }
}

/**
 * Finds a ticket from an inbound email's headers. Tries In-Reply-To /
 * References first (exact match on stored Message-IDs), falls back to a
 * subject-match strategy of the form "[CM-<first8>]".
 */
export async function findTicketFromInboundEmail(opts: {
  inReplyTo?: string | null
  references?: string[] | null
  subject?: string | null
}): Promise<{ ticketId: string; country: Country } | null> {
  const ids = [
    ...(opts.inReplyTo ? [opts.inReplyTo] : []),
    ...(opts.references ?? []),
  ].filter(Boolean)

  if (ids.length > 0) {
    const res = await db.execute(sql`
      SELECT t.id, t.country
      FROM ticket_messages m
      JOIN tickets t ON t.id = m.ticket_id
      WHERE m.email_message_id = ANY(${ids})
      LIMIT 1
    `)
    const row = ((res.rows ?? res) as Array<{ id: string; country: Country }>)[0]
    if (row) return { ticketId: row.id, country: row.country }
  }

  // Subject-line fallback — `[CM-<first8>] Subject…`
  if (opts.subject) {
    const match = opts.subject.match(/\[CM-([0-9a-f]{8})\]/i)
    if (match) {
      const prefix = match[1]
      const res = await db.execute(sql`
        SELECT id, country FROM tickets WHERE id::text LIKE ${prefix + '%'} LIMIT 1
      `)
      const row = ((res.rows ?? res) as Array<{ id: string; country: Country }>)[0]
      if (row) return { ticketId: row.id, country: row.country }
    }
  }

  return null
}
