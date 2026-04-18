'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Package, Users, Calendar, Building2, MessageSquare,
  Flag, Menu, X, Settings, Newspaper, BarChart2, Navigation, Palette,
  Zap, SearchCheck, ShieldCheck, ShieldAlert, Mail, CreditCard, Keyboard, Megaphone, ClipboardList, Send,
  Users as UsersIcon, MessageCircle, Flag as FlagIcon, Inbox,
} from 'lucide-react'
import { CommandPalette } from './CommandPalette'
import { CountrySwitcher } from './CountrySwitcher'

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ size?: number }>
  short?: string
}
type NavEntry = NavItem | { label: string; items: NavItem[] }

const NAV: NavEntry[] = [
  { href: '/admin',         label: 'Dashboard', icon: LayoutDashboard, short: 'd' },
  { href: '/admin/tickets', label: 'Tickets',   icon: Inbox,           short: 't' },

  { label: 'Content', items: [
    { href: '/admin/listings',  label: 'Listings',  icon: Package,    short: 'l' },
    { href: '/admin/events',    label: 'Events',    icon: Calendar,   short: 'e' },
    { href: '/admin/directory', label: 'Directory', icon: Building2,  short: 'r' },
    { href: '/admin/news',      label: 'News',      icon: Newspaper,  short: 'n' },
    { href: '/admin/routes',    label: 'Routes',    icon: Navigation },
  ] },

  { label: 'People', items: [
    { href: '/admin/users',           label: 'Users',           icon: Users,         short: 'u' },
    { href: '/admin/verifications',   label: 'Verifications',   icon: ShieldCheck,   short: 'v' },
    { href: '/admin/messages',        label: 'Messages',        icon: MessageSquare, short: 'i' },
  ] },

  { label: 'Community', items: [
    { href: '/admin/community/discussions', label: 'Discussions',    icon: MessageCircle, short: 'c' },
    { href: '/admin/community/flags',       label: 'Flags',          icon: FlagIcon },
    { href: '/admin/stolen-reports',        label: 'Stolen Reports', icon: ShieldAlert,  short: 's' },
    { href: '/admin/community/members',     label: 'Members',        icon: UsersIcon },
  ] },

  { label: 'Commerce', items: [
    { href: '/admin/marketing',            label: 'Marketing',   icon: Megaphone,   short: 'm' },
    { href: '/admin/marketing/campaigns',  label: '· Campaigns', icon: Megaphone },
    { href: '/admin/marketing/segments',   label: '· Segments',  icon: Megaphone },
    { href: '/admin/marketing/lists',      label: '· Lists',     icon: Megaphone },
    { href: '/admin/marketing/templates',  label: '· Templates', icon: Megaphone },
    { href: '/admin/marketing/calendar',   label: '· Calendar',  icon: Megaphone },
    { href: '/admin/waitlist',             label: 'Waitlist',    icon: Send },
    { href: '/admin/boosts',               label: 'Boosts',      icon: Zap },
    { href: '/admin/payfast',              label: 'PayFast',     icon: CreditCard },
  ] },

  { label: 'Insights', items: [
    { href: '/admin/analytics',  label: 'Analytics',  icon: BarChart2 },
    { href: '/admin/reports',    label: 'Reports',    icon: Flag },
    { href: '/admin/whiteboard', label: 'Whiteboard', icon: ClipboardList, short: 'w' },
    { href: '/admin/seo-audit',  label: 'SEO Audit',  icon: SearchCheck },
  ] },

  { label: 'System', items: [
    { href: '/admin/theme',           label: 'Theme',           icon: Palette },
    { href: '/admin/email-templates', label: 'Email Templates', icon: Mail },
    { href: '/admin/settings',        label: 'Settings',        icon: Settings },
  ] },
]

// Flatten for keyboard shortcut lookup
const NAV_FLAT: NavItem[] = NAV.flatMap(entry =>
  'items' in entry ? entry.items : [entry]
)

export function AdminShell({
  children,
  country,
  isSuperadmin,
  activeCountries,
  userEmail,
}: {
  children: React.ReactNode
  country: string
  isSuperadmin: boolean
  activeCountries: string[]
  userEmail: string | null
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  // Keyboard nav: `g` then a letter to navigate
  useEffect(() => {
    let gTimer: ReturnType<typeof setTimeout> | null = null
    let awaitingG = false

    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      if (target?.isContentEditable) return

      if (e.key === '?') {
        e.preventDefault()
        setShowHelp(s => !s)
        return
      }
      if (e.key === 'g') {
        awaitingG = true
        if (gTimer) clearTimeout(gTimer)
        gTimer = setTimeout(() => { awaitingG = false }, 1200)
        return
      }
      if (awaitingG) {
        const item = NAV_FLAT.find(n => n.short === e.key.toLowerCase())
        if (item) {
          e.preventDefault()
          router.push(item.href)
        }
        awaitingG = false
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      if (gTimer) clearTimeout(gTimer)
    }
  }, [router])

  function renderLink(item: NavItem) {
    const active = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href))
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setDrawerOpen(false)}
        className={`admin-nav-link ${active ? 'active' : ''}`}
      >
        <item.icon size={15} />
        {item.label}
      </Link>
    )
  }

  return (
    <div data-theme="admin" style={{ minHeight: '100vh', display: 'flex' }}>
      <style>{`
        .admin-sidebar { width: 220px; flex-shrink: 0; background: var(--admin-surface); border-right: 1px solid var(--admin-border); height: 100vh; position: sticky; top: 0; display: flex; flex-direction: column; }
        .admin-nav-link { display: flex; align-items: center; gap: 10px; padding: 8px 14px; margin: 1px 6px; text-decoration: none; color: var(--admin-text-dim); font-size: 13px; border-radius: 6px; font-weight: 500; }
        .admin-nav-link:hover { background: var(--admin-surface-2); color: var(--admin-text); }
        .admin-nav-link.active { background: color-mix(in oklch, var(--admin-accent) 18%, transparent); color: var(--admin-accent); font-weight: 600; }
        .admin-nav-group-label { padding: 14px 14px 6px; font-size: 10.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--admin-text-dim); }
        .admin-nav-group:first-of-type .admin-nav-group-label { padding-top: 10px; }
        .admin-topbar { display: flex; align-items: center; gap: 12px; padding: 10px 20px; border-bottom: 1px solid var(--admin-border); background: var(--admin-surface); position: sticky; top: 0; z-index: 20; }
        .admin-content { flex: 1; min-width: 0; background: var(--admin-bg); }
        .admin-page { padding: 24px 28px; max-width: 1400px; }
        .burger { display: none; }
        @media (max-width: 900px) {
          .admin-sidebar { position: fixed; left: 0; top: 0; z-index: 60; transform: translateX(-100%); transition: transform .2s; box-shadow: 0 0 40px rgba(0,0,0,.15); }
          .admin-sidebar.open { transform: translateX(0); }
          .burger { display: inline-flex; }
          .admin-page { padding: 16px; }
        }
      `}</style>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${drawerOpen ? 'open' : ''}`}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: 14, fontWeight: 800, color: 'var(--admin-text)', textDecoration: 'none', letterSpacing: '.2px' }}>
            🚲 CrankMart
          </Link>
          <button
            onClick={() => setDrawerOpen(false)}
            className="burger"
            aria-label="Close"
            style={{ background: 'transparent', border: 'none', color: 'var(--admin-text-dim)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: '6px 0', flex: 1, overflowY: 'auto' }}>
          {NAV.map(entry => {
            if ('items' in entry) {
              return (
                <div key={entry.label} className="admin-nav-group" role="presentation">
                  <div className="admin-nav-group-label">{entry.label}</div>
                  {entry.items.map(renderLink)}
                </div>
              )
            }
            return renderLink(entry)
          })}
        </div>
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--admin-border)', fontSize: 11, color: 'var(--admin-text-dim)' }}>
          <kbd>⌘K</kbd> search · <kbd>?</kbd> help
        </div>
      </aside>

      {/* Main */}
      <div className="admin-content">
        <div className="admin-topbar">
          <button
            onClick={() => setDrawerOpen(true)}
            className="burger"
            aria-label="Open navigation"
            style={{ background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)', borderRadius: 6, padding: 6, cursor: 'pointer' }}
          >
            <Menu size={16} />
          </button>

          {/* Search trigger */}
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            style={{
              flex: 1,
              maxWidth: 420,
              background: 'var(--admin-surface-2)',
              border: '1px solid var(--admin-border)',
              color: 'var(--admin-text-dim)',
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: 12,
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ flex: 1 }}>Search admin…</span>
            <kbd>⌘K</kbd>
          </button>

          <div style={{ flex: 1 }} />

          <CountrySwitcher current={country} isSuperadmin={isSuperadmin} activeCountries={activeCountries} />

          <button
            onClick={() => setShowHelp(s => !s)}
            title="Keyboard shortcuts (?)"
            style={{ background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border)', color: 'var(--admin-text-dim)', borderRadius: 6, padding: 6, cursor: 'pointer' }}
          >
            <Keyboard size={14} />
          </button>

          {userEmail && (
            <span style={{ fontSize: 12, color: 'var(--admin-text-dim)' }} title={userEmail}>
              {userEmail.split('@')[0]}
            </span>
          )}
        </div>

        <div className="admin-page">{children}</div>
      </div>

      {/* Drawer overlay */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 55 }}
        />
      )}

      <CommandPalette />

      {/* Shortcuts help */}
      {showHelp && (
        <div
          onClick={() => setShowHelp(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: 12, padding: 24, minWidth: 340, maxWidth: 440 }}
          >
            <h3 style={{ margin: '0 0 16px', color: 'var(--admin-text)', fontSize: 15, fontWeight: 700 }}>Keyboard shortcuts</h3>
            <div style={{ display: 'grid', gap: 8, fontSize: 13, color: 'var(--admin-text)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Command palette</span><kbd>⌘K</kbd></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Toggle this help</span><kbd>?</kbd></div>
              <div style={{ height: 1, background: 'var(--admin-border)', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Dashboard</span><span><kbd>g</kbd> <kbd>d</kbd></span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Listings</span><span><kbd>g</kbd> <kbd>l</kbd></span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Events</span><span><kbd>g</kbd> <kbd>e</kbd></span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Directory</span><span><kbd>g</kbd> <kbd>r</kbd></span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>News</span><span><kbd>g</kbd> <kbd>n</kbd></span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Users</span><span><kbd>g</kbd> <kbd>u</kbd></span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Verifications</span><span><kbd>g</kbd> <kbd>v</kbd></span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Discussions</span><span><kbd>g</kbd> <kbd>c</kbd></span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Stolen Reports</span><span><kbd>g</kbd> <kbd>s</kbd></span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Messages (inbox)</span><span><kbd>g</kbd> <kbd>i</kbd></span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Marketing</span><span><kbd>g</kbd> <kbd>m</kbd></span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Whiteboard</span><span><kbd>g</kbd> <kbd>w</kbd></span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
