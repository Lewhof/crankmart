'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight, Clock, AlertCircle } from 'lucide-react'

type NavItem = { label: string; href: string; keywords?: string[] }

const NAV: NavItem[] = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Listings', href: '/admin/listings', keywords: ['classifieds'] },
  { label: 'Users', href: '/admin/users' },
  { label: 'Events', href: '/admin/events' },
  { label: 'News', href: '/admin/news', keywords: ['articles', 'blog'] },
  { label: 'Routes', href: '/admin/routes' },
  { label: 'Directory', href: '/admin/directory', keywords: ['businesses', 'shops'] },
  { label: 'Analytics', href: '/admin/analytics' },
  { label: 'SEO Audit', href: '/admin/seo-audit' },
  { label: 'Boosts', href: '/admin/boosts' },
  { label: 'Messages', href: '/admin/messages' },
  { label: 'Reports', href: '/admin/reports' },
  { label: 'Theme', href: '/admin/theme' },
  { label: 'PayFast', href: '/admin/payfast' },
  { label: 'Verifications', href: '/admin/verifications' },
  { label: 'Email Templates', href: '/admin/email-templates' },
  { label: 'Settings', href: '/admin/settings' },
]

type Pending = { label: string; count: number; href: string }

function fuzzy(q: string, s: string): boolean {
  q = q.toLowerCase()
  s = s.toLowerCase()
  let i = 0
  for (const ch of s) {
    if (ch === q[i]) i++
    if (i === q.length) return true
  }
  return i === q.length
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [pending, setPending] = useState<Pending[]>([])
  const [cursor, setCursor] = useState(0)
  const router = useRouter()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setCursor(0)
    // Lazy-fetch pending queues when palette opens
    fetch('/api/admin/stats')
      .then(r => r.ok ? r.json() : null)
      .then(s => {
        if (!s) return
        const items: Pending[] = []
        if (s.pendingModeration > 0) items.push({ label: `${s.pendingModeration} listings pending moderation`, count: s.pendingModeration, href: '/admin/listings?moderation=pending' })
        setPending(items)
      })
      .catch(() => {})
    // Fetch events pending separately
    fetch('/api/admin/events?status=pending&page=1')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d?.pagination?.total) return
        setPending(p => [...p, { label: `${d.pagination.total} events awaiting review`, count: d.pagination.total, href: '/admin/events?status=pending' }])
      })
      .catch(() => {})
  }, [open])

  const results = useMemo(() => {
    const q = query.trim()
    if (!q) return NAV
    return NAV.filter(n => fuzzy(q, n.label) || (n.keywords ?? []).some(k => fuzzy(q, k)))
  }, [query])

  const combined: Array<{ type: 'pending' | 'nav'; label: string; href: string; hint?: string }> = [
    ...(query ? [] : pending.map(p => ({ type: 'pending' as const, label: p.label, href: p.href }))),
    ...results.map(n => ({ type: 'nav' as const, label: n.label, href: n.href })),
  ]

  function go(item: { href: string }) {
    setOpen(false)
    router.push(item.href)
  }

  if (!open) return null
  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.6)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: '10vh',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, combined.length - 1)) }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)) }
          else if (e.key === 'Enter') { e.preventDefault(); combined[cursor] && go(combined[cursor]) }
        }}
        style={{
          width: 'min(640px, 92vw)',
          background: 'var(--admin-surface)',
          border: '1px solid var(--admin-border)',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--admin-border)' }}>
          <Search size={16} style={{ color: 'var(--admin-text-dim)' }} />
          <input
            autoFocus
            value={query}
            onChange={e => { setQuery(e.target.value); setCursor(0) }}
            placeholder="Search admin…"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--admin-text)',
              fontSize: 15,
              padding: 0,
            }}
          />
          <kbd>Esc</kbd>
        </div>
        <div style={{ maxHeight: 420, overflowY: 'auto', padding: 4 }}>
          {combined.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--admin-text-dim)', fontSize: 13 }}>
              No matches.
            </div>
          ) : (
            combined.map((item, i) => (
              <button
                key={item.href + i}
                onClick={() => go(item)}
                onMouseEnter={() => setCursor(i)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: i === cursor ? 'var(--admin-surface-2)' : 'transparent',
                  border: 'none',
                  color: 'var(--admin-text)',
                  padding: '10px 12px',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                {item.type === 'pending' ? (
                  <AlertCircle size={14} style={{ color: 'var(--admin-warn)' }} />
                ) : (
                  <ArrowRight size={14} style={{ color: 'var(--admin-text-dim)' }} />
                )}
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.type === 'pending' && (
                  <span style={{ fontSize: 11, color: 'var(--admin-text-dim)' }}>Jump →</span>
                )}
              </button>
            ))
          )}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 14px',
            borderTop: '1px solid var(--admin-border)',
            fontSize: 11,
            color: 'var(--admin-text-dim)',
          }}
        >
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> navigate · <kbd>Enter</kbd> open
          </span>
          <span><kbd>⌘K</kbd> toggle</span>
        </div>
      </div>
    </div>
  )
}
