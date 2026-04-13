import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { getAdminCountry } from '@/lib/admin-country'
import { ACTIVE_COUNTRIES } from '@/lib/country'
import { AdminShell } from '@/components/admin/AdminShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/admin')

  const roleResult = await db.execute(
    sql`SELECT role FROM users WHERE id = ${session.user.id}`,
  )
  const row = (roleResult.rows ?? roleResult)[0] as { role?: string } | undefined
  const isAdmin = row?.role === 'admin' || row?.role === 'superadmin'
  if (!isAdmin) redirect('/')

  const isSuperadmin = row?.role === 'superadmin'
  const country = await getAdminCountry()

  return (
    <AdminShell
      country={country}
      isSuperadmin={isSuperadmin}
      activeCountries={[...ACTIVE_COUNTRIES]}
      userEmail={session.user.email ?? null}
    >
      {children}
    </AdminShell>
  )
}
