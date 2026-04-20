import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { checkAdminApi } from '@/lib/admin'
import { ADMIN_COUNTRY_COOKIE } from '@/lib/admin-country'
import { isActiveCountry } from '@/lib/country'

export async function POST(request: NextRequest) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check

  const { country } = (await request.json().catch(() => ({}))) as { country?: string }
  if (!isActiveCountry(country)) {
    return NextResponse.json({ error: 'Invalid country' }, { status: 400 })
  }

  const store = await cookies()
  // httpOnly: false — this is an operator UX preference, not a security
  // boundary (admin access is enforced by checkAdminApi above). Admin
  // client components (app/admin/routes/*) read it via document.cookie to
  // render country-appropriate dropdowns. Must match proxy.ts attributes.
  store.set(ADMIN_COUNTRY_COOKIE, country, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })

  return NextResponse.json({ ok: true, country })
}
