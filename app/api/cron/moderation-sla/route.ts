import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { sendEmail } from '@/lib/email'

const SLA_HOURS = 24

interface QueueRow {
  entity: string
  id: string
  title: string
  age_hours: number
}

/**
 * Moderation SLA cron. Runs hourly (via vercel.json crons).
 * Emails ADMIN_ALERT_EMAIL if any listing/event/business/news article
 * has been in moderation_status='pending' for >24 h.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminEmail = process.env.ADMIN_ALERT_EMAIL || 'info@crankmart.com'
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://crankmart.com'

  try {
    const rows: QueueRow[] = []

    const queries: Array<{ label: string; sql: ReturnType<typeof sql> }> = [
      {
        label: 'listings',
        sql: sql`
          SELECT 'listing' AS entity, id::text, title,
            EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600.0 AS age_hours
          FROM listings
          WHERE moderation_status = 'pending'
            AND created_at < NOW() - INTERVAL '${sql.raw(String(SLA_HOURS))} hours'
          ORDER BY created_at ASC LIMIT 50
        `,
      },
      {
        label: 'events',
        sql: sql`
          SELECT 'event' AS entity, id::text, title,
            EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600.0 AS age_hours
          FROM events
          WHERE moderation_status = 'pending'
            AND created_at < NOW() - INTERVAL '${sql.raw(String(SLA_HOURS))} hours'
          ORDER BY created_at ASC LIMIT 50
        `,
      },
      {
        label: 'news',
        sql: sql`
          SELECT 'news' AS entity, id::text, title,
            EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600.0 AS age_hours
          FROM news_articles
          WHERE status = 'pending'
            AND created_at < NOW() - INTERVAL '${sql.raw(String(SLA_HOURS))} hours'
          ORDER BY created_at ASC LIMIT 50
        `,
      },
      {
        label: 'businesses',
        sql: sql`
          SELECT 'business' AS entity, id::text, name AS title,
            EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600.0 AS age_hours
          FROM businesses
          WHERE status = 'pending'
            AND created_at < NOW() - INTERVAL '${sql.raw(String(SLA_HOURS))} hours'
          ORDER BY created_at ASC LIMIT 50
        `,
      },
    ]

    for (const q of queries) {
      try {
        const res = await db.execute(q.sql)
        const list = ((res.rows ?? res) as unknown as QueueRow[]) || []
        rows.push(...list.map(r => ({ ...r, age_hours: Math.round(Number(r.age_hours)) })))
      } catch (err) {
        console.error(`moderation-sla ${q.label} query failed:`, err)
      }
    }

    if (rows.length === 0) {
      return NextResponse.json({ ok: true, pending: 0 })
    }

    const byEntity = rows.reduce<Record<string, QueueRow[]>>((acc, r) => {
      (acc[r.entity] ||= []).push(r)
      return acc
    }, {})

    const lines = Object.entries(byEntity).map(([entity, items]) => {
      const inner = items
        .slice(0, 10)
        .map(i => `<li>${i.title} &mdash; ${i.age_hours}h old</li>`)
        .join('')
      const extra = items.length > 10 ? `<li>&hellip; and ${items.length - 10} more</li>` : ''
      return `<h3 style="margin:24px 0 8px;font-size:15px">${entity} (${items.length})</h3><ul style="padding-left:20px;margin:0;color:#374151;font-size:14px">${inner}${extra}</ul>`
    }).join('')

    const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,sans-serif">
  <div style="max-width:640px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ebebeb">
    <div style="background:#0D1B2A;padding:24px 32px"><div style="color:#fff;font-size:20px;font-weight:800">CrankMart Moderation SLA</div></div>
    <div style="padding:28px 32px">
      <p style="margin:0 0 12px;font-size:15px;color:#1a1a1a">${rows.length} item${rows.length === 1 ? '' : 's'} pending moderation for over ${SLA_HOURS} hours.</p>
      ${lines}
      <a href="${baseUrl}/admin/listings" style="display:inline-block;margin-top:24px;background:#0D1B2A;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">Open moderation queue &rarr;</a>
    </div>
  </div>
</body></html>`

    await sendEmail({
      to: adminEmail,
      subject: `[CrankMart] ${rows.length} item${rows.length === 1 ? '' : 's'} pending moderation > 24h`,
      html,
      fromEmail: 'info@crankmart.com',
      fromName: 'CrankMart Alerts',
    })

    return NextResponse.json({ ok: true, pending: rows.length })
  } catch (err) {
    console.error('moderation-sla cron error:', err)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
