'use client'

import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { TopNav } from './TopNav'
import { BottomNav } from './BottomNav'
import { Footer } from './Footer'

export function ConditionalLayout({
  children,
  geoBanner,
}: {
  children: React.ReactNode
  geoBanner?: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as { role?: string } | undefined)?.role
  const isAdmin = role === 'admin' || role === 'superadmin'

  // Hide chrome on admin routes (own layout) and on the root Coming Soon page for non-admins.
  const hideChrome = pathname.startsWith('/admin') || (pathname === '/' && !isAdmin)

  if (hideChrome) {
    return <>{children}</>
  }

  return (
    <>
      {geoBanner}
      <TopNav />
      <main className="pb-20 md:pb-0">
        {children}
      </main>
      <Footer />
      <BottomNav />
    </>
  )
}
