import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { limiters, clientKey, check, rateLimitHeaders } from '@/lib/ratelimit'
import { isPlausibleSerial, normaliseSerial } from '@/lib/serial'
import { sendEmail } from '@/lib/email'
import { getCountry } from '@/lib/country'

interface ReportBody {
  serial: string
  brand: string
  model?: string
  year?: number
  colour?: string
  sapsCaseNo?: string
  stolenDate?: string
  stolenLocation?: string
  proofPhotoUrl?: string
  notes?: string
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to report a stolen bike.' }, { status: 401 })

  const rl = await check(limiters.stolenReport, clientKey(request, `stolen:${session.user.id}`))
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

  if (!body.serial || !body.brand) {
    return NextResponse.json({ error: 'Serial number and brand are required.' }, { status: 400 })
  }
  if (!isPlausibleSerial(body.serial)) {
    return NextResponse.json({ error: 'Serial looks invalid — check for typos.' }, { status: 400 })
  }

  const normalSerial = normaliseSerial(body.serial)
  const hasStrongProof = Boolean(body.sapsCaseNo && body.proofPhotoUrl)
  const initialStatus = hasStrongProof ? 'approved' : 'pending'
  const country = await getCountry()

  try {
    const res = await db.execute(sql`
      INSERT INTO stolen_reports (
        serial_number, brand, model, year, colour,
        source, status, saps_case_no, stolen_date, stolen_location,
        reporter_user_id, reporter_email, proof_photo_url, notes, country
      ) VALUES (
        ${normalSerial}, ${body.brand}, ${body.model || null}, ${body.year || null}, ${body.colour || null},
        'crankmart', ${initialStatus}, ${body.sapsCaseNo || null},
        ${body.stolenDate ? new Date(body.stolenDate).toISOString().slice(0, 10) : null},
        ${body.stolenLocation || null},
        ${session.user.id}::uuid, ${session.user.email || null},
        ${body.proofPhotoUrl || null}, ${body.notes || null}, ${country}
      )
      RETURNING id
    `)
    const id = ((res.rows ?? res) as Array<{ id: string }>)[0]?.id

    // Invalidate any cached "no_record" for this serial so future checks see the new report.
    try {
      await db.execute(sql`DELETE FROM serial_lookup_cache WHERE cache_key LIKE ${'%:' + normalSerial}`)
    } catch {}

    // Notify admin — fire-and-forget.
    const adminEmail = process.env.ADMIN_ALERT_EMAIL || 'info@crankmart.com'
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://crankmart.com'
    sendEmail({
      to: adminEmail,
      subject: `[CrankMart] New stolen-bike report: ${body.brand} ${body.model || ''} (${body.serial})`.trim(),
      html: `<p>A new stolen-bike report was submitted.</p>
<ul>
  <li>Serial: ${body.serial} (normalised: ${normalSerial})</li>
  <li>Brand: ${body.brand}${body.model ? ' — ' + body.model : ''}${body.year ? ' (' + body.year + ')' : ''}</li>
  <li>SAPS case: ${body.sapsCaseNo || '—'}</li>
  <li>Location: ${body.stolenLocation || '—'}</li>
  <li>Reporter: ${session.user.email || session.user.id}</li>
  <li>Status: ${initialStatus}</li>
</ul>
<p><a href="${baseUrl}/admin/stolen-reports">Review in admin →</a></p>`,
    }).catch(() => {})

    return NextResponse.json({ ok: true, id, status: initialStatus })
  } catch (e) {
    console.error('Stolen report insert error:', e)
    return NextResponse.json({ error: 'Could not save report' }, { status: 500 })
  }
}
