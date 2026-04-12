'use client'

import './mobile.css'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard, Package, Users, Calendar, Building2,
  MessageSquare, Flag, Menu, X, Settings, Newspaper, BarChart2, Navigation, Palette, BookOpen, Zap, SearchCheck,
  ShieldCheck, Mail, CreditCard,
} from 'lucide-react'

const ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/listings', label: 'Listings', icon: Package },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/events', label: 'Events', icon: Calendar },
  { href: '/admin/news', label: 'News', icon: Newspaper },
  { href: '/admin/routes', label: 'Routes', icon: Navigation },
  { href: '/admin/directory', label: 'Directory', icon: Building2 },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/admin/seo-audit', label: 'SEO Audit', icon: SearchCheck },
  { href: '/admin/boosts', label: 'Boosts', icon: Zap },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/reports', label: 'Reports', icon: Flag },
  { href: '/admin/theme', label: 'Theme', icon: Palette },
  { href: '/admin/payfast', label: 'PayFast', icon: CreditCard },
  { href: '/admin/verifications', label: 'Verifications', icon: ShieldCheck },
  { href: '/admin/email-templates', label: 'Email Templates', icon: Mail },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/style-guide', label: 'Style Guide', icon: BookOpen },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  if (status === 'loading') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #ebebeb', borderTopColor: '#0D1B2A', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  )

  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/admin')
    return null
  }

  // Block non-admin users
  const isAdmin = (session?.user as any)?.role === 'admin' ||
                  (session?.user as any)?.role === 'superadmin' ||
                  (session?.user as any)?.is_admin

  if (status === 'authenticated' && session?.user && !isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 48 }}>🔒</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Access Denied</h1>
        <p style={{ color: '#666', margin: 0 }}>You need an admin account to access this area.</p>
        <p style={{ color: '#999', fontSize: 13, margin: 0 }}>Signed in as: {session?.user?.email}</p>
        <a href="/" style={{ marginTop: 8, color: '#0D1B2A', fontWeight: 600, textDecoration: 'none' }}>← Back to CrankMart</a>
      </div>
    )
  }

  const Sidebar = () => (
    <div style={{ width: 200, background: '#fff', borderRight: '1px solid #ebebeb', height: '100vh', position: 'fixed', top: 0, left: 0, display: 'flex', flexDirection: 'column', zIndex: 50 }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #ebebeb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontSize: 16, fontWeight: 800, color: '#0D1B2A', textDecoration: 'none' }}>🚲 CrankMart</Link>
        <button onClick={() => setOpen(false)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer' }} className="sidebar-close">
          <X size={18} />
        </button>
      </div>
      <div style={{ padding: '8px 0', flex: 1, overflowY: 'auto' }}>
        {ITEMS.map(item => {
          const active = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', textDecoration: 'none', background: active ? '#f0f4ff' : 'none', color: active ? '#0D1B2A' : '#6b7280', fontWeight: active ? 700 : 500, fontSize: 14, borderLeft: active ? '3px solid #0D1B2A' : '3px solid transparent' }}>
              <item.icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </div>
      <div style={{ padding: '12px 20px', borderTop: '1px solid #ebebeb' }}>
        <Link href="/" style={{ fontSize: 12, color: '#9a9a9a', textDecoration: 'none' }}>← Back to site</Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>

      {/* Mobile topbar — sticky, outside the flex row so sticky works properly */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ebebeb', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 40 }} className="admin-topbar-mobile">
        <button onClick={() => setOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
          <Menu size={22} />
        </button>
        <span style={{ fontWeight: 800, fontSize: 16, color: '#0D1B2A' }}>Admin</span>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 49, background: 'rgba(0,0,0,.4)' }} onClick={() => setOpen(false)}>
          <div onClick={e => e.stopPropagation()}>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Content row: sidebar + main */}
      <div style={{ display: 'flex' }}>
        {/* Desktop sidebar */}
        <div style={{ width: 200, flexShrink: 0 }} className="admin-sidebar-desktop">
          <Sidebar />
        </div>
        <main style={{ flex: 1, minWidth: 0, padding: 20 }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (min-width: 768px) { .admin-topbar-mobile { display: none !important; } }
        @media (max-width: 767px) { .admin-sidebar-desktop { display: none !important; } }
      `}</style>
    </div>
  )
}
