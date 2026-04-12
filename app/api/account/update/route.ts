import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { field, value, currentPassword } = body

  if (!field || value === undefined) {
    return NextResponse.json({ error: 'Missing field or value' }, { status: 400 })
  }

  const userId = session.user.id

  if (field === 'name') {
    const name = String(value).trim()
    if (!name || name.length < 2) return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 })
    await db.update(users).set({ name, updatedAt: new Date() }).where(eq(users.id, userId))
    return NextResponse.json({ success: true, name })
  }

  if (field === 'province') {
    const province = value ? String(value).trim() : null
    await db.update(users).set({ province, updatedAt: new Date() }).where(eq(users.id, userId))
    return NextResponse.json({ success: true, province })
  }

  if (field === 'password') {
    if (!currentPassword) return NextResponse.json({ error: 'Current password required' }, { status: 400 })
    const newPassword = String(value)
    if (newPassword.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

    const [user] = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, userId))
    if (!user?.passwordHash) return NextResponse.json({ error: 'No password set on this account' }, { status: 400 })

    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })

    const passwordHash = await bcrypt.hash(newPassword, 12)
    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, userId))
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown field' }, { status: 400 })
}
