import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { limiters, clientKey, check, rateLimitHeaders } from '@/lib/ratelimit'
import { isPlausibleSerial, normaliseSerial } from '@/lib/serial'
import { sendEmail } from '@/lib/email'
import { getCountry } from '@/lib/country'

interface ReportBody {
  serial?: string
  brand: string
  model?: string
  year?: number
  colour?: string
  lastSeenDate?: string
  lastSeenLocation?: string
  proofPhotoUrl?: string
  description?: string
  rewardText?: string
  notes?: string
}

/**
 * POST /api/community/lost/report
 *
 * Submit a lost-bike report. No SAPS gating — all entries land 'pending'
 * for admin review since there's no objective proof tier the way SAPS
 * provides for stolen reports.
 */
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to report a lost bike.' }, { status: 401 })
  }

  const rl = await check(limiters.lostReport, clientKey(request, `lost:${session.user.id}`))
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Too many reports from this account. Try again tomorrow.' },
      { status: 429, headers: rateLimitHeaders(rl) },
    )
  }

  let body: ReportBody
  try {
    body = (await request.json()) as ReportBody
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.brand) {
    return NextResponse.json({ error: 'Brand is required.' }, { status: 400 })
  }
  if (body.serial && !isPlausibleSerial(body.serial)) {
    return NextResponse.json({ error: 'Serial looks invalid — check for typos.' }, { status: 400 })
  }

  const normalSerial = body.serial ? normaliseSerial(body.serial) : null
  const country = await getCountry()

  try {
    const res = await db.execute(sql`
      INSERT INTO lost_reports (
        serial_number, brand, model, year, colour,
        last_seen_date, last_seen_location,
        reporter_user_id, reporter_email, proof_photo_url,
        description, reward_text, notes, country
      ) VALUES (
        ${normalSerial}, ${body.brand}, ${body.model || null}, ${body.year || null}, ${body.colour || null},
        ${body.lastSeenDate ? new Date(body.lastSeenDate).toISOString().slice(0, 10) : null},
        ${body.lastSeenLocation || null},
        ${session.user.id}::uuid, ${session.user.email || null},
        ${body.proofPhotoUrl || null},
        ${body.description || null}, ${body.rewardText || null}, ${body.notes || null},
        ${country}
      )
      RETURNING id
    `)
    const id = ((res.rows ?? res) as Array<{ id: string }>)[0]?.id

    // Best-effort admin notification.
    const adminEmail = process.env.ADMIN_ALERT_EMAIL || 'info@crankmart.com'
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://crankmart.com'
    sendEmail({
      to: adminEmail,
      subject: `[CrankMart] New lost-bike report: ${body.brand} ${body.model || ''}`.trim(),
      html: `<p>A new lost-bike report was submitted.</p>
<ul>
  <li>Brand: ${body.brand}${body.model ? ' — ' + body.model : ''}${body.year ? ' (' + body.year + ')' : ''}</li>
  <li>Serial: ${body.serial || '—'}${normalSerial ? ' (normalised: ' + normalSerial + ')' : ''}</li>
  <li>Last seen: ${body.lastSeenLocation || '—'}${body.lastSeenDate ? ' on ' + body.lastSeenDate : ''}</li>
  <li>Reporter: ${session.user.email || session.user.id}</li>
</ul>
<p><a href="${baseUrl}/admin/stolen-reports">Review in admin →</a></p>`,
    }).catch(() => {})

    return NextResponse.json({ ok: true, id, status: 'pending' })
  } catch (e) {
    console.error('Lost report insert error:', e)
    return NextResponse.json({ error: 'Could not save report' }, { status: 500 })
  }
}
