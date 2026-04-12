import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { sql as drizzleSql } from 'drizzle-orm'
import { sendEmail } from '@/lib/email'
import crypto from 'crypto'

const ForgotPasswordSchema = z.object({
  email: z.string().email('Valid email address required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = ForgotPasswordSchema.safeParse(body)
    if (!validation.success) {
      return Response.json(
        { error: 'Invalid request body', details: validation.error.issues },
        { status: 400 }
      )
    }

    const email = validation.data.email.trim().toLowerCase()

    const [user] = await db
      .select({ id: users.id, name: users.name, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    // Only proceed if user exists and has a password (not OAuth-only)
    if (user?.id && user.passwordHash) {
      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await db.execute(
        drizzleSql`
          INSERT INTO password_reset_tokens (user_id, token, expires_at)
          VALUES (${user.id}, ${token}, ${expiresAt.toISOString()})
        `
      )

      const baseUrl = process.env.NEXTAUTH_URL ?? 'https://cyclemart.co.za'
      const resetUrl = `${baseUrl}/reset-password?token=${token}`
      const firstName = user.name?.split(' ')[0] ?? 'there'

      const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ebebeb">
    <div style="background:#0D1B2A;padding:28px 32px">
      <div style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px">CycleMart</div>
    </div>
    <div style="padding:32px">
      <h2 style="margin:0 0 8px;font-size:20px;color:#1a1a1a">Reset your password</h2>
      <p style="margin:0 0 24px;color:#6b7280;font-size:14px">Hi ${firstName}, click the button below to reset your CycleMart password. This link expires in 1 hour.</p>
      <a href="${resetUrl}" style="display:block;text-align:center;background:#0D1B2A;color:#fff;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:16px">
        Reset Password &rarr;
      </a>
      <p style="font-size:12px;color:#9a9a9a;text-align:center;margin:0">If you didn&apos;t request this, you can safely ignore this email.</p>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #ebebeb;font-size:12px;color:#9a9a9a;text-align:center">
      <a href="https://cyclemart.co.za" style="color:#0D1B2A">cyclemart.co.za</a>
    </div>
  </div>
</body>
</html>`

      const result = await sendEmail({
        to: email,
        subject: 'Reset your CycleMart password',
        html,
        fromEmail: 'info@cyclemart.co.za',
        fromName: 'CycleMart',
      })

      if (!result.ok) {
        if (result.reason === 'disabled' || result.reason === 'not_configured') {
          return Response.json(
            { error: 'Password reset is not available right now. Please contact info@cyclemart.co.za directly.' },
            { status: 503 }
          )
        }
        return Response.json(
          { error: 'Failed to send the reset email. Please try again later.' },
          { status: 500 }
        )
      }
    }

    // Always return 200 to prevent email enumeration attacks
    return Response.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('not_configured') || message.includes('disabled')) {
      return Response.json(
        { error: 'Password reset is not available right now. Please contact info@cyclemart.co.za directly.' },
        { status: 503 }
      )
    }
    return Response.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 })
  }
}
