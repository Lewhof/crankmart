import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { limiters, clientKey, check, rateLimitHeaders } from '@/lib/ratelimit'

export async function POST(request: NextRequest) {
  const rl = await check(limiters.authWrite, clientKey(request, 'register'))
  if (!rl.ok) {
    return NextResponse.json({ error: 'Too many registration attempts. Try again in a minute.' }, { status: 429, headers: rateLimitHeaders(rl) })
  }

  try {
    const { name, email, password, province } = await request.json()

    if (!name || !email || !password || !province) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (existing.length > 0) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await db.insert(users).values({
      name,
      email,
      passwordHash,
      province,
      role: 'buyer',
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
