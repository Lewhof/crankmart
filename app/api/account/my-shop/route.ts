import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { getCountry } from '@/lib/country'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id
  const country = await getCountry()

  // Query by owner_id (live DB column) OR claimed_by (schema column added via migration)
  const result = await db.execute(sql`
    SELECT
      id, name, slug, description,
      business_type, city, province,
      logo_url, cover_url,
      listing_status AS status,
      is_verified, is_premium,
      views_count, rating, review_count,
      boost_tier, boost_expires_at,
      website, phone, email, whatsapp
    FROM businesses
    WHERE country = ${country}
      AND (owner_id = ${userId} OR (claimed_by IS NOT NULL AND claimed_by = ${userId}))
    LIMIT 1
  `)

  const rows = (result.rows ?? result) as Record<string, unknown>[]
  if (!rows.length) return NextResponse.json(null)

  return NextResponse.json(rows[0])
}
