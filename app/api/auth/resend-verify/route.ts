import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { issueVerifyToken, sendVerificationEmail } from '@/lib/email-verify'
import { limiters, clientKey, check, rateLimitHeaders } from '@/lib/ratelimit'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = await check(limiters.authWrite, clientKey(request, `resend-verify:${session.user.id}`))
  if (!rl.ok) {
    return NextResponse.json({ error: 'Too many requests. Try again in a minute.' }, { status: 429, headers: rateLimitHeaders(rl) })
  }

  try {
    const res = await db.execute(sql`
      SELECT email, name, email_verified FROM users WHERE id = ${session.user.id}::uuid LIMIT 1
    `)
    const user = ((res.rows ?? res) as Array<{ email: string; name: string | null; email_verified: boolean }>)[0]
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (user.email_verified) return NextResponse.json({ ok: true, alreadyVerified: true })

    const token = await issueVerifyToken(session.user.id)
    await sendVerificationEmail({ to: user.email, name: user.name, token })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Resend verify error:', e)
    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 })
  }
}
