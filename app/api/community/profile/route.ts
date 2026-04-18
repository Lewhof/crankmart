import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { limiters, clientKey, check, rateLimitHeaders } from '@/lib/ratelimit'
import { isValidHandle } from '@/lib/community'

/**
 * GET  /api/community/profile          — own profile (auth required)
 * PATCH /api/community/profile         — update own profile
 *   Body: { handle?, profileBio?, profileCity?, profileProvince?, profileShowCity? }
 *
 * Handle changes go through a uniqueness check + format validation. Email + name
 * stay on the auth/account surface; this endpoint is just the public-facing bits.
 */

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const res = await db.execute(sql`
    SELECT handle, profile_bio, profile_city, profile_province, profile_show_city
    FROM users WHERE id = ${session.user.id}::uuid LIMIT 1
  `)
  const row = ((res.rows ?? res) as Array<{
    handle: string | null
    profile_bio: string | null
    profile_city: string | null
    profile_province: string | null
    profile_show_city: boolean
  }>)[0]

  return NextResponse.json({
    handle: row?.handle ?? null,
    profileBio: row?.profile_bio ?? '',
    profileCity: row?.profile_city ?? '',
    profileProvince: row?.profile_province ?? '',
    profileShowCity: Boolean(row?.profile_show_city),
  })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rl = await check(limiters.profileWrite, clientKey(req, `profile:${session.user.id}`))
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Too many profile changes. Try again later.' },
      { status: 429, headers: rateLimitHeaders(rl) },
    )
  }

  let body: {
    handle?: string
    profileBio?: string
    profileCity?: string
    profileProvince?: string
    profileShowCity?: boolean
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  // Handle change is the only field with hard validation — all others are
  // free-form strings, sanitised but otherwise trusted.
  if (body.handle !== undefined && body.handle !== null) {
    const h = body.handle.trim().toLowerCase()
    if (!isValidHandle(h)) {
      return NextResponse.json(
        { error: 'Handle must be 3–30 chars, lowercase letters/numbers/underscore only.' },
        { status: 400 },
      )
    }
    // Reject if another user owns it (case-insensitive uniqueness via index).
    const taken = await db.execute(sql`
      SELECT 1 FROM users WHERE LOWER(handle) = ${h} AND id <> ${session.user.id}::uuid LIMIT 1
    `)
    if (((taken.rows ?? taken) as unknown[]).length > 0) {
      return NextResponse.json({ error: 'That handle is already taken.' }, { status: 409 })
    }
    body.handle = h
  }

  const bio = body.profileBio !== undefined ? body.profileBio.slice(0, 1000) : undefined
  const city = body.profileCity !== undefined ? body.profileCity.slice(0, 100) : undefined
  const province = body.profileProvince !== undefined ? body.profileProvince.slice(0, 100) : undefined
  const showCity = body.profileShowCity

  await db.execute(sql`
    UPDATE users SET
      handle             = COALESCE(${body.handle ?? null}, handle),
      profile_bio        = COALESCE(${bio ?? null}, profile_bio),
      profile_city       = COALESCE(${city ?? null}, profile_city),
      profile_province   = COALESCE(${province ?? null}, profile_province),
      profile_show_city  = COALESCE(${showCity ?? null}, profile_show_city),
      updated_at         = NOW()
    WHERE id = ${session.user.id}::uuid
  `)

  return NextResponse.json({ ok: true })
}
