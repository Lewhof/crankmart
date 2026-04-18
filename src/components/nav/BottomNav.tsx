'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Map, Users, Calendar, CircleUser } from 'lucide-react'

// "Sell" is intentionally not in the bottom nav — it's always visible as a
// primary CTA in the TopNav, and doubling it up wastes a thumb-reach slot.
const navItems = [
  { href: '/browse',     label: 'Browse',    icon: LayoutGrid },
  { href: '/routes',     label: 'Routes',    icon: Map },
  { href: '/community',  label: 'Community', icon: Users },
  { href: '/events',     label: 'Events',    icon: Calendar },
  { href: '/account',    label: 'Account',   icon: CircleUser },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="cm-bottom-nav fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#ebebeb] md:hidden" style={{ height: '60px' }}>
      <div className="flex max-w-4xl mx-auto h-full">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 gap-1 text-[11px] font-medium transition-colors ${
                isActive ? 'text-[#0D1B2A]' : 'text-gray-400 hover:text-[#0D1B2A]'
              }`}
            >
              <Icon className={`w-[22px] h-[22px] stroke-[1.5]`} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
