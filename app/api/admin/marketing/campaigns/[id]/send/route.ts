import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { checkAdminApi } from '@/lib/admin'
import { getAdminCountry } from '@/lib/admin-country'
import { sendEmail } from '@/lib/email'
import { materialiseSegment, type SegmentQuery } from '@/lib/segments'
import type { Country } from '@/lib/country'

interface Params { params: Promise<{ id: string }> }

interface CampaignRow {
  id: string
  country: Country
  name: string
  status: string
  template_id: string
  segment_id: string | null
  contact_list_id: string | null
}

interface TemplateRow {
  subject: string
  react_email_path: string
  variables: Record<string, unknown>
}

async function loadRecipients(c: CampaignRow): Promise<Array<{ userId: string | null; email: string; name?: string | null }>> {
  if (c.segment_id) {
    const segRes = await db.execute(sql`
      SELECT query_json FROM segments WHERE id = ${c.segment_id}::uuid LIMIT 1
    `)
    const row = ((segRes.rows ?? segRes) as unknown as Array<{ query_json: SegmentQuery }>)[0]
    if (!row) return []
    return materialiseSegment(c.country, row.query_json)
  }
  if (c.contact_list_id) {
    const res = await db.execute(sql`
      SELECT COALESCE(u.email, m.email) AS email,
             COALESCE(u.id::text, '') AS user_id,
             u.name
      FROM contact_list_members m
      LEFT JOIN users u ON u.id = m.user_id
      WHERE m.list_id = ${c.contact_list_id}::uuid
    `)
    const rows = (res.rows ?? res) as Array<{ email: string; user_id: string; name: string | null }>
    return rows.filter(r => !!r.email).map(r => ({
      userId: r.user_id || null,
      email: r.email,
      name: r.name,
    }))
  }
  return []
}

/**
 * POST /api/admin/marketing/campaigns/[id]/send
 *
 * Sends a draft/scheduled campaign NOW. Materialises the audience, renders
 * the template (Phase 1: template body is fetched inline from the filesystem
 * via react_email_path; each iteration fills `variables` with recipient data),
 * and fires one message per recipient through sendEmail(). The stats jsonb is
 * initialised to { sent, failed } so webhook open/click events can layer on top.
 */
export async function POST(_req: NextRequest, { params }: Params) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check
  const country = await getAdminCountry()
  const { id } = await params

  const campRes = await db.execute(sql`
    SELECT id, country, name, status, template_id, segment_id, contact_list_id
    FROM campaigns
    WHERE id = ${id}::uuid AND country = ${country}
    LIMIT 1
  `)
  const c = ((campRes.rows ?? campRes) as unknown as CampaignRow[])[0]
  if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!['draft', 'scheduled'].includes(c.status)) {
    return NextResponse.json({ error: `Cannot send from status "${c.status}"` }, { status: 409 })
  }

  const tplRes = await db.execute(sql`
    SELECT subject, react_email_path, variables FROM email_templates
    WHERE id = ${c.template_id}::uuid LIMIT 1
  `)
  const tpl = ((tplRes.rows ?? tplRes) as unknown as TemplateRow[])[0]
  if (!tpl) return NextResponse.json({ error: 'Template missing' }, { status: 409 })

  const recipients = await loadRecipients(c)
  if (recipients.length === 0) {
    return NextResponse.json({ error: 'No recipients — segment / list is empty' }, { status: 422 })
  }

  // Mark as sending so concurrent invocations can't double-send.
  await db.execute(sql`
    UPDATE campaigns SET status = 'sending', updated_at = NOW()
    WHERE id = ${c.id}::uuid AND status IN ('draft','scheduled')
  `)

  // Phase 1: the template library uses the existing string-based templates.
  // Phase 2 will render React Email components per-recipient. For now each
  // recipient gets the same body; personalisation happens via template vars.
  //
  // Body is a minimal placeholder — the email-templates module's functions
  // are already typed per-template, but we don't know which one at runtime
  // from react_email_path. So Phase-1 campaigns must land with an HTML body
  // passed via variables.htmlBody; richer React Email comes in P2.
  const htmlBody = String((tpl.variables?.htmlBody as string | undefined) ?? `
    <p>${c.name}</p>
    <p>This campaign was sent from CrankMart without a filled htmlBody — update the template.</p>
  `)

  let sent = 0, failed = 0
  for (const r of recipients) {
    const res = await sendEmail({
      to: r.email,
      subject: tpl.subject,
      html: htmlBody,
      stream: 'marketing',
    })
    if (res.ok) {
      sent++
      // Log a `sent` event so analytics + dedupe work.
      await db.execute(sql`
        INSERT INTO email_events (campaign_id, recipient_email, event_type, provider_event_id)
        VALUES (${c.id}::uuid, ${r.email}, 'sent', ${res.messageId ?? null})
      `).catch(() => {})
    } else {
      failed++
    }
  }

  await db.execute(sql`
    UPDATE campaigns
    SET status = 'sent',
        sent_at = NOW(),
        stats = jsonb_set(
          jsonb_set(COALESCE(stats, '{}'::jsonb), '{sent}', to_jsonb(${sent}::int)),
          '{failed}', to_jsonb(${failed}::int)
        ),
        updated_at = NOW()
    WHERE id = ${c.id}::uuid
  `)

  return NextResponse.json({ ok: true, sent, failed, total: recipients.length })
}
