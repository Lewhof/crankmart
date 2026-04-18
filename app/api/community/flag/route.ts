import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { limiters, clientKey, check, rateLimitHeaders } from '@/lib/ratelimit'
import { isFlagReason, isTargetType } from '@/lib/community'
import { sendEmail } from '@/lib/email'
import { getCountry } from '@/lib/country'

const FLAG_TARGET_TYPES = ['comment', 'listing', 'event', 'route', 'news', 'stolen_report', 'lost_report'] as const

/**
 * POST /api/community/flag
 * Body: { targetType, targetId, reason, notes? }
 *
 * Anonymous flags allowed (use IP-based rate limit) but logged-in is preferred
 * for follow-up. Each flag bumps an admin email so triage can happen quickly.
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  const reporterId = session?.user?.id ?? null

  // IP-keyed when anonymous so a logged-out actor can't flood us.
  const rlKey = reporterId ? `flag:${reporterId}` : 'flag:anon'
  const rl = await check(limiters.flagSubmit, clientKey(req, rlKey))
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Too many reports from this account.' },
      { status: 429, headers: rateLimitHeaders(rl) },
    )
  }

  let body: { targetType?: string; targetId?: string; reason?: string; notes?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (!body.targetType || !(FLAG_TARGET_TYPES as readonly string[]).includes(body.targetType)) {
    // Also accept the comment-thread types from isTargetType so callers don't
    // have to know the difference.
    if (!isTargetType(body.targetType ?? '')) {
      return NextResponse.json({ error: 'Invalid target type' }, { status: 400 })
    }
  }
  if (!body.targetId || !body.reason) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (!isFlagReason(body.reason)) {
    return NextResponse.json({ error: 'Invalid reason' }, { status: 400 })
  }

  const country = await getCountry()
  await db.execute(sql`
    INSERT INTO content_flags (target_type, target_id, reporter_id, reason, notes, country)
    VALUES (
      ${body.targetType},
      ${body.targetId}::uuid,
      ${reporterId ? sql`${reporterId}::uuid` : sql`NULL`},
      ${body.reason},
      ${body.notes ?? null},
      ${country}
    )
  `)

  // Best-effort admin email — do NOT block the response on it.
  try {
    const adminEmail = process.env.ADMIN_ALERT_EMAIL || 'info@crankmart.com'
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://crankmart.com'
    sendEmail({
      to: adminEmail,
      subject: `[CrankMart] Flag: ${body.targetType} — ${body.reason}`,
      html: `<p>A new content flag was submitted.</p>
<ul>
  <li>Target: ${body.targetType} / <code>${body.targetId}</code></li>
  <li>Reason: ${body.reason}</li>
  <li>Reporter: ${session?.user?.email || 'anonymous'}</li>
  <li>Notes: ${body.notes ? body.notes.slice(0, 500) : '—'}</li>
</ul>
<p><a href="${baseUrl}/admin/community/flags">Review in admin →</a></p>`,
    }).catch(() => {})
  } catch {}

  return NextResponse.json({ ok: true })
}
