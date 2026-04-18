'use client'

/**
 * Site-visible superadmin country toggle. Lives in TopNav for admins + superadmins
 * so QA across /za and /au doesn't require a round-trip into /admin. Reads the
 * existing admin_country cookie that CountrySwitcher writes; POSTs the same
 * /api/admin/country endpoint to flip and refresh.
 *
 * Invisible to non-admin sessions — never a concern for public users.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Globe } from 'lucide-react'
import { REGIONS_STATIC } from '@/lib/regions-static'
import { getCountryConfig } from '@/lib/country-config'

// Client-safe country list — Object.keys(REGIONS_STATIC) mirrors ACTIVE_COUNTRIES
// without dragging in next/headers via src/lib/country.ts.
const COUNTRIES = Object.keys(REGIONS_STATIC) as Array<keyof typeof REGIONS_STATIC>

export function SuperadminCountryToggle() {
  const { data: session } = useSession()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const role = (session?.user as { role?: string } | undefined)?.role
  if (role !== 'admin' && role !== 'superadmin') return null

  // Read current pick from cookie so the button label reflects the active context.
  const current = typeof document !== 'undefined'
    ? (document.cookie.split('; ').find(c => c.startsWith('admin_country='))?.split('=')[1] ?? 'za')
    : 'za'

  async function pick(c: string) {
    if (c === current) { setOpen(false); return }
    setBusy(true)
    try {
      await fetch('/api/admin/country', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ country: c }),
      })
      router.refresh()
    } finally {
      setBusy(false)
      setOpen(false)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        title={`Admin country: ${current.toUpperCase()}`}
        disabled={busy}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          width: 'auto', minWidth: 34, height: 34, padding: '0 8px',
          borderRadius: 2,
          color: 'rgba(255,255,255,0.85)',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.15)',
          cursor: 'pointer',
          fontSize: 11, fontWeight: 800, letterSpacing: .5,
        }}
      >
        <Globe size={14} />
        {current.toUpperCase()}
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 55 }}
          />
          <div
            role="listbox"
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 6px)',
              minWidth: 180,
              background: '#fff',
              border: '1px solid #ebebeb',
              borderRadius: 4,
              padding: 4,
              zIndex: 60,
              boxShadow: '0 12px 32px rgba(0,0,0,.18)',
            }}
          >
            <div style={{ padding: '6px 10px 8px', fontSize: 10, fontWeight: 700, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: .6 }}>
              Admin country context
            </div>
            {COUNTRIES.map(c => {
              const cfg = getCountryConfig(c)
              const active = c === current
              return (
                <button
                  key={c}
                  role="option"
                  aria-selected={active}
                  onClick={() => pick(c)}
                  disabled={busy}
                  style={{
                    display: 'flex', width: '100%', alignItems: 'center', gap: 8,
                    padding: '8px 10px', textAlign: 'left',
                    background: active ? '#f5f5f5' : 'transparent',
                    border: 'none', borderRadius: 3,
                    color: '#1a1a1a', fontSize: 13, fontWeight: active ? 700 : 500,
                    cursor: busy ? 'default' : 'pointer',
                  }}
                >
                  <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, fontWeight: 700, width: 26 }}>
                    {c.toUpperCase()}
                  </span>
                  <span style={{ flex: 1 }}>{cfg.name}</span>
                  {active && <span style={{ fontSize: 11, color: 'var(--color-primary)' }}>●</span>}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
