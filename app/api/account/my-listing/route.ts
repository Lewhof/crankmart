import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { businesses } from '@/db/schema'
import { eq } from 'drizzle-orm'

const ALLOWED_FIELDS = ['name', 'description', 'phone', 'email', 'website', 'address', 'suburb', 'city', 'province', 'brandsStocked', 'services', 'hours'] as const
type AllowedField = typeof ALLOWED_FIELDS[number]

type BusinessUpdate = {
  name?: string
  description?: string
  phone?: string
  email?: string
  website?: string
  address?: string
  suburb?: string
  city?: string
  province?: string
  brandsStocked?: string[]
  services?: string[]
  hours?: Record<string, string>
  updatedAt?: Date
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.claimedBy, session.user.id))
    .limit(1)

  if (!business) return NextResponse.json({ business: null })
  return NextResponse.json({ business })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [business] = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(eq(businesses.claimedBy, session.user.id))
    .limit(1)

  if (!business) return NextResponse.json({ error: 'No listing found' }, { status: 404 })

  const body = await req.json()

  const updates: BusinessUpdate = { updatedAt: new Date() }
  for (const field of ALLOWED_FIELDS) {
    if (field in body) {
      (updates as Record<string, unknown>)[field] = body[field]
    }
  }

  await db.update(businesses)
    .set(updates)
    .where(eq(businesses.id, business.id))

  return NextResponse.json({ success: true })
}
