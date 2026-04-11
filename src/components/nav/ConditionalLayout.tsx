'use client'

import { usePathname } from 'next/navigation'
import { TopNav } from './TopNav'
import { BottomNav } from './BottomNav'
import { Footer } from './Footer'

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Hide chrome on admin routes (admin has its own layout)
  const hideChrome = pathname.startsWith('/admin')

  if (hideChrome) {
    return <>{children}</>
  }

  return (
    <>
      <TopNav />
      <main className="pb-20 md:pb-0">
        {children}
      </main>
      <Footer />
      <BottomNav />
    </>
  )
}
