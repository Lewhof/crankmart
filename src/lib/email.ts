/**
 * Unified email transport. Prefers Resend when RESEND_API_KEY is set, falls
 * back to SMTP via Nodemailer + site_settings for the legacy path. Returns a
 * messageId so ticketing can persist RFC 5322 Message-IDs for threaded replies.
 *
 * Template helpers are re-exported from ./email-templates (client-safe).
 */

import nodemailer from 'nodemailer'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

interface SendOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  /** Override the sender address (e.g. for no-reply flows). Defaults to info@crankmart.com. */
  fromEmail?: string
  fromName?: string
  /** Optional RFC 5322 In-Reply-To — used by ticketing to chain replies. */
  inReplyTo?: string
  /** Optional message-id-style headers for threading. */
  references?: string[]
  /** Tag messages by stream (marketing | transactional | ticketing) for per-stream analytics. */
  stream?: 'transactional' | 'marketing' | 'ticketing'
  /** Optional reply-to address — ticketing replies route to a parseable subdomain. */
  replyTo?: string
}

export interface SendResult {
  ok: boolean
  /** Provider-assigned ID (Resend id or SMTP Message-ID). Empty when ok=false. */
  messageId?: string
  reason?: string
}

async function getSmtpConfig() {
  const result = await db.execute(
    sql`SELECT key, value FROM site_settings WHERE key LIKE 'smtp_%' OR key = 'email_notifications_enabled'`,
  )
  const rows = (result.rows ?? result) as Array<{ key: string; value: string }>
  const config: Record<string, string> = {}
  rows.forEach(r => { config[r.key] = r.value })
  return config
}

/** Return 'resend' when we have the key, 'smtp' otherwise. */
export function getEmailTransport(): 'resend' | 'smtp' {
  return process.env.RESEND_API_KEY ? 'resend' : 'smtp'
}

async function sendViaResend(o: SendOptions, senderEmail: string, senderName: string): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY!
  const body: Record<string, unknown> = {
    from: `${senderName} <${senderEmail}>`,
    to: Array.isArray(o.to) ? o.to : [o.to],
    subject: o.subject,
    html: o.html,
    ...(o.text ? { text: o.text } : {}),
    ...(o.replyTo ? { reply_to: o.replyTo } : {}),
    ...(o.inReplyTo || o.references ? {
      headers: {
        ...(o.inReplyTo ? { 'In-Reply-To': o.inReplyTo } : {}),
        ...(o.references ? { 'References': o.references.join(' ') } : {}),
      },
    } : {}),
    ...(o.stream ? { tags: [{ name: 'stream', value: o.stream }] } : {}),
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.text().catch(() => '')
      console.error('Resend send failed:', res.status, err)
      return { ok: false, reason: `resend_${res.status}` }
    }
    const data = await res.json() as { id: string }
    return { ok: true, messageId: data.id }
  } catch (e) {
    console.error('Resend send threw:', e)
    return { ok: false, reason: 'resend_network' }
  }
}

async function sendViaSmtp(o: SendOptions, senderEmail: string, senderName: string): Promise<SendResult> {
  const config = await getSmtpConfig()
  if (config.email_notifications_enabled !== 'true') return { ok: false, reason: 'disabled' }
  if (!config.smtp_host || !config.smtp_user) return { ok: false, reason: 'not_configured' }

  const transporter = nodemailer.createTransport({
    host: config.smtp_host,
    port: parseInt(config.smtp_port || '587'),
    secure: config.smtp_secure === 'tls' || config.smtp_secure === 'true',
    auth: { user: config.smtp_user, pass: config.smtp_pass },
  })

  const info = await transporter.sendMail({
    from: `"${senderName}" <${senderEmail}>`,
    to: o.to,
    subject: o.subject,
    html: o.html,
    text: o.text,
    replyTo: o.replyTo,
    inReplyTo: o.inReplyTo,
    references: o.references,
  })
  return { ok: true, messageId: info.messageId }
}

/**
 * Allowlist guard for non-prod environments. When `EMAIL_ALLOWLIST` is set
 * (comma-separated; supports `*@domain.com` suffix wildcards), any send whose
 * recipients aren't ALL on the list is dropped. Returns `ok: false` so callers
 * (e.g. ticket reply route) treat the block as a delivery failure — important
 * because callers persist `messageId` for RFC 5322 thread chaining and a
 * silently-skipped send would write `null` and break In-Reply-To. Unset in
 * prod, so this is a no-op there.
 *
 * Wildcard patterns must contain a `.` after the `@` (rejects bare `*@` which
 * would otherwise match every email address). Patterns without `@` are
 * rejected entirely (typo-safe; fails closed).
 */
function isAllowedRecipient(addr: string, allowlist: string[]): boolean {
  const lower = addr.trim().toLowerCase()
  if (!lower.includes('@')) return false
  return allowlist.some(pattern => {
    const p = pattern.toLowerCase()
    if (p.startsWith('*@')) {
      const domain = p.slice(2)
      if (!domain.includes('.')) return false
      return lower.endsWith('@' + domain)
    }
    if (!p.includes('@')) return false
    return lower === p
  })
}

export async function sendEmail(o: SendOptions): Promise<SendResult> {
  const allowlistRaw = process.env.EMAIL_ALLOWLIST
  if (allowlistRaw) {
    const allowlist = allowlistRaw.split(',').map(s => s.trim()).filter(Boolean)
    const recipients = Array.isArray(o.to) ? o.to : [o.to]
    const blocked = recipients.filter(r => !isAllowedRecipient(r, allowlist))
    if (blocked.length > 0) {
      const safeSubject = o.subject.replace(/[\r\n]/g, ' ').slice(0, 80)
      console.log(`[email allowlist] dropped send to ${blocked.join(', ')} (subject: "${safeSubject}")`)
      return { ok: false, reason: 'allowlist_blocked' }
    }
  }

  const senderName = o.fromName ?? process.env.RESEND_FROM_NAME ?? 'CrankMart'
  const senderEmail = o.fromEmail ?? process.env.RESEND_FROM_EMAIL ?? 'info@crankmart.com'

  if (getEmailTransport() === 'resend') {
    return sendViaResend(o, senderEmail, senderName)
  }
  return sendViaSmtp(o, senderEmail, senderName)
}

// Template helpers — re-exported from the client-safe module.
export {
  newMessageEmail,
  listingPublishedEmail,
  listingExpiryReminderEmail,
  shopClaimTouch1Email,
  shopClaimTouch2Email,
  shopClaimTouch3Email,
  shopVerifiedEmail,
  eventOrganizerTouch1Email,
  eventVerifiedEmail,
  boostRenewalEmail,
  adListingInviteEmail,
} from './email-templates'
