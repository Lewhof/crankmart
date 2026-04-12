import nodemailer from 'nodemailer'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

async function getSmtpConfig() {
  const result = await db.execute(
    sql`SELECT key, value FROM site_settings WHERE key LIKE 'smtp_%' OR key = 'email_notifications_enabled'`
  )
  const rows = (result.rows ?? result) as Array<{ key: string; value: string }>
  const config: Record<string, string> = {}
  rows.forEach((r) => {
    config[r.key] = r.value
  })
  return config
}

export async function sendEmail({
  to,
  subject,
  html,
  fromEmail,
  fromName,
}: {
  to: string
  subject: string
  html: string
  /** Override the sender address (e.g. for no-reply flows). Defaults to info@crankmart.com */
  fromEmail?: string
  fromName?: string
}) {
  const config = await getSmtpConfig()
  if (config.email_notifications_enabled !== 'true') {
    return { ok: false, reason: 'disabled' }
  }
  if (!config.smtp_host || !config.smtp_user) {
    return { ok: false, reason: 'not_configured' }
  }

  const transporter = nodemailer.createTransport({
    host: config.smtp_host,
    port: parseInt(config.smtp_port || '587'),
    secure: config.smtp_secure === 'true',
    auth: { user: config.smtp_user, pass: config.smtp_pass },
  })

  const senderName  = fromName  ?? config.smtp_from_name  ?? 'CrankMart'
  const senderEmail = fromEmail ?? config.smtp_from_email ?? 'info@crankmart.com'

  await transporter.sendMail({
    from: `"${senderName}" <${senderEmail}>`,
    to,
    subject,
    html,
  })
  return { ok: true }
}

// Email templates

// Re-export pure template functions from client-safe module
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
