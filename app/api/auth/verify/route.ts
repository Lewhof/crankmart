import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') || ''
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://crankmart.com'

  const redirect = (status: 'success' | 'invalid' | 'expired' | 'used') =>
    NextResponse.redirect(`${baseUrl}/verify?status=${status}`, 303)

  if (!token || token.length > 255) return redirect('invalid')

  try {
    const res = await db.execute(sql`
      SELECT user_id, expires_at, consumed_at
      FROM email_verify_tokens
      WHERE token = ${token}
      LIMIT 1
    `)
    const row = ((res.rows ?? res) as Array<{ user_id: string; expires_at: string; consumed_at: string | null }>)[0]
    if (!row) return redirect('invalid')
    if (row.consumed_at) return redirect('used')
    if (new Date(row.expires_at) < new Date()) return redirect('expired')

    await db.execute(sql`
      UPDATE users SET email_verified = true WHERE id = ${row.user_id}::uuid
    `)
    await db.execute(sql`
      UPDATE email_verify_tokens SET consumed_at = NOW() WHERE token = ${token}
    `)
    return redirect('success')
  } catch (e) {
    console.error('Email verify error:', e)
    return redirect('invalid')
  }
}
