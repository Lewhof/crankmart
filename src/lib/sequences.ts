import 'server-only'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { sendEmail } from './email'
import type { Country } from './country'

/**
 * Sequence engine. Works in two modes depending on whether QStash is
 * configured:
 *
 *   - With QStash (preferred): each step schedules a callback to
 *     /api/webhooks/qstash-sequence after delay_hours via the HTTP API.
 *     The callback advances the enrollment.
 *   - Without QStash (dev / fallback): next_run_at is set; a separate
 *     Vercel Cron polls /api/cron/advance-sequences to pick up due rows.
 *
 * The behaviour is identical from the caller's POV — enrollSequence()
 * queues step 0 immediately, every subsequent step schedules itself.
 */

interface StepRow {
  id: string
  step_order: number
  template_id: string
  delay_hours: number
}

interface TemplateRow {
  subject: string
  variables: Record<string, unknown>
}

interface EnrollmentRow {
  id: string
  sequence_id: string
  user_id: string | null
  email: string | null
  current_step: number
}

function qstashConfigured(): boolean {
  return !!process.env.QSTASH_TOKEN && !!process.env.QSTASH_URL
}

async function scheduleNext(enrollmentId: string, delayHours: number) {
  const dueAt = new Date(Date.now() + delayHours * 3600 * 1000)

  await db.execute(sql`
    UPDATE sequence_enrollments
    SET next_run_at = ${dueAt.toISOString()}::timestamp
    WHERE id = ${enrollmentId}::uuid
  `)

  if (!qstashConfigured()) return

  // Fire-and-forget QStash schedule. If this fails the cron fallback
  // will still advance next_run_at rows eventually.
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
    if (!appUrl) return
    const callbackUrl = `https://${appUrl.replace(/^https?:\/\//, '')}/api/webhooks/qstash-sequence`
    const res = await fetch(`${process.env.QSTASH_URL}/v2/publish/${encodeURIComponent(callbackUrl)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
        'Content-Type': 'application/json',
        'Upstash-Delay': `${delayHours * 60}m`,
      },
      body: JSON.stringify({ enrollmentId }),
    })
    if (res.ok) {
      const data = await res.json() as { messageId?: string }
      if (data.messageId) {
        await db.execute(sql`
          UPDATE sequence_enrollments SET qstash_message_id = ${data.messageId}
          WHERE id = ${enrollmentId}::uuid
        `)
      }
    }
  } catch (e) {
    console.error('QStash schedule failed (non-fatal; cron fallback covers it):', e)
  }
}

/**
 * Enroll a contact into a sequence. Fires step 0 immediately (delay_hours of
 * step 0 is ignored at enrollment — the "immediate" first-touch convention)
 * then schedules step 1.
 */
export async function enrollSequence(opts: {
  sequenceId: string
  userId?: string | null
  email?: string | null
}): Promise<string> {
  const res = await db.execute(sql`
    INSERT INTO sequence_enrollments (sequence_id, user_id, email, current_step)
    VALUES (${opts.sequenceId}::uuid,
            ${opts.userId ? sql`${opts.userId}::uuid` : sql`NULL`},
            ${opts.email ?? null},
            0)
    RETURNING id
  `)
  const enrollmentId = ((res.rows ?? res) as Array<{ id: string }>)[0].id
  await advanceEnrollment(enrollmentId)
  return enrollmentId
}

/**
 * Send the current step, advance current_step, schedule the next. Called by
 * enrollSequence() for step 0 and by the QStash / cron callback for later steps.
 */
export async function advanceEnrollment(enrollmentId: string): Promise<void> {
  const enrollRes = await db.execute(sql`
    SELECT id, sequence_id, user_id, email, current_step
    FROM sequence_enrollments
    WHERE id = ${enrollmentId}::uuid
      AND completed_at IS NULL
      AND cancelled_at IS NULL
    LIMIT 1
  `)
  const enrollment = ((enrollRes.rows ?? enrollRes) as unknown as EnrollmentRow[])[0]
  if (!enrollment) return

  // Only send if the parent sequence is active.
  const seqRes = await db.execute(sql`
    SELECT status, country FROM sequences WHERE id = ${enrollment.sequence_id}::uuid LIMIT 1
  `)
  const seq = ((seqRes.rows ?? seqRes) as Array<{ status: string; country: Country }>)[0]
  if (!seq || seq.status !== 'active') return

  const stepRes = await db.execute(sql`
    SELECT id, step_order, template_id, delay_hours
    FROM sequence_steps
    WHERE sequence_id = ${enrollment.sequence_id}::uuid
      AND step_order = ${enrollment.current_step}
    LIMIT 1
  `)
  const step = ((stepRes.rows ?? stepRes) as unknown as StepRow[])[0]
  if (!step) {
    // No more steps → mark complete.
    await db.execute(sql`
      UPDATE sequence_enrollments SET completed_at = NOW()
      WHERE id = ${enrollment.id}::uuid
    `)
    return
  }

  // Load template + resolve recipient email.
  const tplRes = await db.execute(sql`
    SELECT subject, variables FROM email_templates WHERE id = ${step.template_id}::uuid LIMIT 1
  `)
  const tpl = ((tplRes.rows ?? tplRes) as unknown as TemplateRow[])[0]
  if (!tpl) return

  let recipientEmail = enrollment.email
  if (!recipientEmail && enrollment.user_id) {
    const uRes = await db.execute(sql`SELECT email FROM users WHERE id = ${enrollment.user_id}::uuid LIMIT 1`)
    recipientEmail = ((uRes.rows ?? uRes) as unknown as Array<{ email: string }>)[0]?.email ?? null
  }
  if (!recipientEmail) {
    await db.execute(sql`UPDATE sequence_enrollments SET cancelled_at = NOW() WHERE id = ${enrollment.id}::uuid`)
    return
  }

  const htmlBody = String((tpl.variables?.htmlBody as string | undefined) ?? `<p>${tpl.subject}</p>`)
  await sendEmail({
    to: recipientEmail,
    subject: tpl.subject,
    html: htmlBody,
    stream: 'marketing',
  })

  // Advance + schedule next.
  await db.execute(sql`
    UPDATE sequence_enrollments
    SET current_step = current_step + 1
    WHERE id = ${enrollment.id}::uuid
  `)

  const nextRes = await db.execute(sql`
    SELECT delay_hours FROM sequence_steps
    WHERE sequence_id = ${enrollment.sequence_id}::uuid
      AND step_order = ${enrollment.current_step + 1}
    LIMIT 1
  `)
  const nextStep = ((nextRes.rows ?? nextRes) as Array<{ delay_hours: number }>)[0]
  if (!nextStep) {
    await db.execute(sql`
      UPDATE sequence_enrollments SET completed_at = NOW()
      WHERE id = ${enrollment.id}::uuid
    `)
    return
  }
  await scheduleNext(enrollment.id, nextStep.delay_hours)
}
