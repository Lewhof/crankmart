/**
 * Query-based segment materialisation. A segment's `query_json` is a small
 * DSL of filters that compile to a SQL query returning `{ user_id, email }`
 * rows. Deliberately limited in vocabulary so the admin UI is a form, not
 * a SQL editor.
 *
 * Each top-level key is ANDed together. Arrays inside a key are ORed.
 *
 * Supported fields (country always injected from segment.country):
 *   role                 — array of 'buyer' | 'seller' | 'shop_owner'
 *   emailVerified        — boolean
 *   createdAfter         — ISO date string (users joined after)
 *   createdBefore        — ISO date string
 *   province             — array of province/state names (matches users.province or profile_province)
 *   hasListings          — boolean (any active listings)
 *   hasSoldListings      — boolean
 *   hasClaimedBusiness   — boolean
 *   waitlistOnly         — boolean (users from waitlist table, joined via email)
 *   excludeUnsubscribed  — boolean (always recommended; defaults true at call site)
 */

import 'server-only'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import type { Country } from './country'

export interface SegmentQuery {
  role?: Array<'buyer' | 'seller' | 'shop_owner' | 'admin' | 'superadmin'>
  emailVerified?: boolean
  createdAfter?: string
  createdBefore?: string
  province?: string[]
  hasListings?: boolean
  hasSoldListings?: boolean
  hasClaimedBusiness?: boolean
  waitlistOnly?: boolean
  excludeUnsubscribed?: boolean
}

export interface MaterialisedContact {
  userId: string | null
  email: string
  name?: string | null
  handle?: string | null
}

/**
 * Resolve a segment to a concrete list of (user_id, email) rows. Performs the
 * query as a single SQL with optional LATERAL joins so we never ship 10k
 * round-trips at send time.
 */
export async function materialiseSegment(
  country: Country,
  q: SegmentQuery,
  opts: { limit?: number } = {},
): Promise<MaterialisedContact[]> {
  const parts: ReturnType<typeof sql>[] = [sql`u.country = ${country}`]
  parts.push(sql`u.is_active = true AND u.banned_at IS NULL`)

  if (q.role && q.role.length > 0) {
    parts.push(sql`u.role::text = ANY(${q.role})`)
  }
  if (typeof q.emailVerified === 'boolean') {
    parts.push(q.emailVerified ? sql`u.email_verified = true` : sql`u.email_verified = false`)
  }
  if (q.createdAfter) parts.push(sql`u.created_at >= ${q.createdAfter}::timestamp`)
  if (q.createdBefore) parts.push(sql`u.created_at < ${q.createdBefore}::timestamp`)
  if (q.province && q.province.length > 0) {
    parts.push(sql`(u.province = ANY(${q.province}) OR u.profile_province = ANY(${q.province}))`)
  }
  if (q.hasListings) {
    parts.push(sql`EXISTS(SELECT 1 FROM listings l WHERE l.seller_id = u.id AND l.status = 'active')`)
  }
  if (q.hasSoldListings) {
    parts.push(sql`EXISTS(SELECT 1 FROM listings l WHERE l.seller_id = u.id AND l.status = 'sold')`)
  }
  if (q.hasClaimedBusiness) {
    parts.push(sql`EXISTS(SELECT 1 FROM businesses b WHERE b.claimed_by = u.id)`)
  }
  if (q.excludeUnsubscribed !== false) {
    // Unsubscribed users never receive marketing — the email_events table
    // tracks complaint + unsubscribed events; exclude both.
    parts.push(sql`NOT EXISTS(
      SELECT 1 FROM email_events e
      WHERE e.recipient_email = u.email
        AND e.event_type IN ('complained', 'unsubscribed')
    )`)
  }

  // Waitlist-only switches to the waitlist table as the source — rare but
  // useful for pre-launch comms.
  if (q.waitlistOnly) {
    const waitRes = await db.execute(sql`
      SELECT email
      FROM waitlist
      WHERE country = ${country}
      ORDER BY created_at DESC
      ${opts.limit ? sql`LIMIT ${opts.limit}` : sql``}
    `)
    const rows = (waitRes.rows ?? waitRes) as Array<{ email: string }>
    return rows.map(r => ({ userId: null, email: r.email }))
  }

  const whereClause = parts.reduce<ReturnType<typeof sql>>(
    (acc, p, i) => i === 0 ? p : sql`${acc} AND ${p}`,
    sql``,
  )

  const res = await db.execute(sql`
    SELECT u.id AS user_id, u.email, u.name, u.handle
    FROM users u
    WHERE ${whereClause}
    ORDER BY u.created_at DESC
    ${opts.limit ? sql`LIMIT ${opts.limit}` : sql``}
  `)

  const rows = (res.rows ?? res) as Array<{
    user_id: string; email: string; name: string; handle: string | null
  }>
  return rows.map(r => ({
    userId: r.user_id,
    email: r.email,
    name: r.name,
    handle: r.handle,
  }))
}

/** Cheap count-only variant for "Live preview: 1,234 recipients" UX. */
export async function countSegment(country: Country, q: SegmentQuery): Promise<number> {
  const res = await materialiseSegment(country, q)
  return res.length
}
