import { auth } from '@/auth'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'

export async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/admin')

  const result = await db.execute(sql`SELECT role FROM users WHERE id = ${session.user.id}`)
  const rows = (result.rows ?? result) as Array<{ role: string }>

  if (!rows[0] || (rows[0].role !== 'admin' && rows[0].role !== 'superadmin')) {
    redirect('/')
  }
  return session
}

// For use in API Route Handlers (can't use redirect() there)
export async function checkAdminApi(): Promise<{ session: any } | NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const result = await db.execute(sql`SELECT role FROM users WHERE id = ${session.user.id}`)
  const rows = (result.rows ?? result) as Array<{ role: string }>

  if (!rows[0] || (rows[0].role !== 'admin' && rows[0].role !== 'superadmin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return { session }
}
