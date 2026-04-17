import crypto from 'crypto'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { sendEmail } from './email'

const TOKEN_TTL_HOURS = 24

export async function issueVerifyToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000)
  await db.execute(sql`
    INSERT INTO email_verify_tokens (token, user_id, expires_at)
    VALUES (${token}, ${userId}::uuid, ${expiresAt.toISOString()})
  `)
  return token
}

export async function sendVerificationEmail(opts: {
  to: string
  name: string | null
  token: string
}): Promise<void> {
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://crankmart.com'
  const verifyUrl = `${baseUrl}/api/auth/verify?token=${opts.token}`
  const firstName = opts.name?.split(' ')[0] || 'there'
  const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ebebeb">
    <div style="background:#0D1B2A;padding:28px 32px">
      <div style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px">CrankMart</div>
    </div>
    <div style="padding:32px">
      <h2 style="margin:0 0 8px;font-size:20px;color:#1a1a1a">Confirm your email</h2>
      <p style="margin:0 0 24px;color:#6b7280;font-size:14px">Hi ${firstName}, click the button below to confirm your CrankMart account. This link expires in 24 hours.</p>
      <a href="${verifyUrl}" style="display:block;text-align:center;background:#0D1B2A;color:#fff;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:16px">
        Confirm email &rarr;
      </a>
      <p style="font-size:12px;color:#9a9a9a;text-align:center;margin:0">If you didn't register on CrankMart, you can safely ignore this email.</p>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #ebebeb;font-size:12px;color:#9a9a9a;text-align:center">
      <a href="https://crankmart.com" style="color:#0D1B2A">crankmart.com</a>
    </div>
  </div>
</body></html>`

  await sendEmail({
    to: opts.to,
    subject: 'Confirm your CrankMart email',
    html,
    fromEmail: 'info@crankmart.com',
    fromName: 'CrankMart',
  })
}

export async function isEmailVerified(userId: string): Promise<boolean> {
  const res = await db.execute(sql`SELECT email_verified FROM users WHERE id = ${userId}::uuid LIMIT 1`)
  const row = ((res.rows ?? res) as Array<{ email_verified: boolean }>)[0]
  return !!row?.email_verified
}
