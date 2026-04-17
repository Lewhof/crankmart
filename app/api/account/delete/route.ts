import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { limiters, clientKey, check, rateLimitHeaders } from '@/lib/ratelimit'

/**
 * POPIA/GDPR right-to-erasure endpoint.
 *
 * Pattern (Q5 resolution): anonymise + tombstone, not hard delete.
 *  - users row: keep for referential integrity, overwrite PII, mark inactive.
 *  - listings: flagged 'deleted' so they drop out of browse but existing
 *    conversations still have a listing to hang off.
 *  - messages / conversations: preserved so the counterparty's inbox
 *    doesn't get holes; sender now renders as "Deleted user".
 *  - saves / favourites: removed — not counterparty-visible.
 *  - auth tokens + password: wiped so no one can log back in.
 *
 * Caller must POST their own email in the body to confirm.
 */
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rl = await check(limiters.authWrite, clientKey(request, `delete:${session.user.id}`))
  if (!rl.ok) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: rateLimitHeaders(rl) })
  }

  let confirmEmail: string
  try {
    const body = await request.json()
    confirmEmail = typeof body?.confirmEmail === 'string' ? body.confirmEmail.trim().toLowerCase() : ''
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!confirmEmail || confirmEmail !== session.user.email.toLowerCase()) {
    return NextResponse.json({ error: 'Email confirmation does not match your account.' }, { status: 400 })
  }

  const userId = session.user.id
  const tombstoneEmail = `deleted-${userId}@deleted.crankmart.invalid`

  try {
    // Run the full teardown in a single statement batch. Neon HTTP driver
    // doesn't expose true transactions but each UPDATE/DELETE is atomic
    // against the row, and the order below is idempotent on retry.
    await db.execute(sql`
      DELETE FROM listing_saves WHERE user_id = ${userId}::uuid
    `)
    await db.execute(sql`
      DELETE FROM route_saves WHERE user_id = ${userId}::uuid
    `).catch(() => { /* table may not exist in older envs */ })
    await db.execute(sql`
      DELETE FROM email_verify_tokens WHERE user_id = ${userId}::uuid
    `).catch(() => {})
    await db.execute(sql`
      DELETE FROM password_reset_tokens WHERE user_id = ${userId}::uuid
    `).catch(() => {})

    // Hide listings from public browse but keep row so existing
    // conversations still have a listing FK to reference.
    await db.execute(sql`
      UPDATE listings
      SET status            = 'deleted',
          moderation_status = 'removed',
          updated_at        = NOW()
      WHERE seller_id = ${userId}::uuid
    `).catch(() => {})

    // Anonymise the user row. email is rewritten to a unique tombstone
    // so the column's unique constraint stays happy.
    await db.execute(sql`
      UPDATE users SET
        email          = ${tombstoneEmail},
        email_verified = false,
        password_hash  = NULL,
        name           = 'Deleted user',
        phone          = NULL,
        avatar_url     = NULL,
        bio            = NULL,
        kyc_status     = 'unverified',
        kyc_document_url = NULL,
        province       = NULL,
        city           = NULL,
        is_active      = false,
        banned_at      = NOW(),
        ban_reason     = 'account deleted by user',
        updated_at     = NOW()
      WHERE id = ${userId}::uuid
    `)

    return NextResponse.json({ ok: true, deleted: true })
  } catch (e) {
    console.error('Account delete error:', e)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
