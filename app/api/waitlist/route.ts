import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { getCountry } from '@/lib/country'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    const trimmed = typeof email === 'string' ? email.trim().toLowerCase() : ''

    if (!EMAIL_RE.test(trimmed) || trimmed.length > 255) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const country = await getCountry()
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = (forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || '').slice(0, 45)
    const ua = (request.headers.get('user-agent') || '').slice(0, 1000)
    const referrer = (request.headers.get('referer') || '').slice(0, 500)

    await db.execute(sql`
      INSERT INTO waitlist (email, country, ip, user_agent, referrer)
      VALUES (${trimmed}, ${country}, ${ip || null}, ${ua || null}, ${referrer || null})
      ON CONFLICT (email, country) DO NOTHING
    `)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Waitlist POST error:', error)
    return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 })
  }
}
