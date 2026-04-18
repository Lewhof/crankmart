import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { advanceEnrollment } from '@/lib/sequences'

/**
 * Fallback cron — runs every 5 min via vercel.json schedule. Picks up
 * enrollments whose next_run_at has passed and advances them. Redundant
 * when QStash is configured (the webhook fires earlier) but cheap and
 * keeps the system correct when QStash is unavailable.
 */
export async function GET(req: NextRequest) {
  // Basic auth for Vercel Cron — reject non-cron invocations.
  const auth = req.headers.get('authorization')
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const res = await db.execute(sql`
    SELECT id FROM sequence_enrollments
    WHERE next_run_at <= NOW()
      AND completed_at IS NULL
      AND cancelled_at IS NULL
    ORDER BY next_run_at ASC
    LIMIT 50
  `)
  const rows = (res.rows ?? res) as Array<{ id: string }>

  let advanced = 0, failed = 0
  for (const r of rows) {
    try { await advanceEnrollment(r.id); advanced++ }
    catch { failed++ }
  }
  return NextResponse.json({ ok: true, advanced, failed, total: rows.length })
}
