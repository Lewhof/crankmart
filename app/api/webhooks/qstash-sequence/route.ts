import { NextRequest, NextResponse } from 'next/server'
import { advanceEnrollment } from '@/lib/sequences'

/**
 * QStash callback — fires when a scheduled sequence step is due. Body carries
 * the enrollment id; we look up the current step, send it, and schedule the
 * next. Idempotent — if advanceEnrollment finds the enrollment already
 * advanced (e.g. retry after success), it returns without sending again.
 *
 * TODO: verify QStash's signature header before acting on the payload.
 * For now trust the URL obscurity; enable verification when QSTASH_CURRENT_SIGNING_KEY
 * is set in env.
 */
export async function POST(req: NextRequest) {
  let body: { enrollmentId?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  if (!body.enrollmentId) return NextResponse.json({ error: 'enrollmentId required' }, { status: 400 })

  try {
    await advanceEnrollment(body.enrollmentId)
  } catch (e) {
    console.error('sequence advance failed:', e)
    return NextResponse.json({ error: 'advance_failed' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
