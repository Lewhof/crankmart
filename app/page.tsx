import { auth } from '@/auth'
import ComingSoon from './_home/ComingSoon'
import HomeServer from './_home/HomeServer'

export default async function RootPage() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  const isAdmin = role === 'admin' || role === 'superadmin'

  return isAdmin ? <HomeServer /> : <ComingSoon />
}
