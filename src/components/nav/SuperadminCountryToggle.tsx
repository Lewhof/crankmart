'use client'

/**
 * Site-visible superadmin country toggle. Lives in TopNav for admins + superadmins
 * so QA across /za and /au doesn't require a round-trip into /admin.
 *
 * Source of truth for the active country is the URL path (countryFromPath).
 * The httpOnly admin_country cookie can't be read from JS, so deriving from
 * the URL is the only reliable way to keep the button label correct.
 *
 * On pick: navigate to /<newCountry>/<rest-of-path> and POST the cookie
 * (admin pages still read it via getAdminCountry() to scope queries).
 *
 * Invisible to non-admin sessions — never a concern for public users.
 */

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Globe } from 'lucide-react'
import { REGIONS_STATIC, countryFromPath } from '@/lib/regions-static'
import { getCountryConfig } from '@/lib/country-config'

const COUNTRIES = Object.keys(REGIONS_STATIC) as Array<keyof typeof REGIONS_STATIC>

export function SuperadminCountryToggle() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const role = (session?.user as { role?: string } | undefined)?.role
  if (role !== 'admin' && role !== 'superadmin') return null

  const current = countryFromPath(pathname)

  async function pick(c: string) {
    if (c === current) { setOpen(false); return }
    setBusy(true)
    try {
      // Sync the admin filter cookie so /admin pages scope to the new country.
      await fetch('/api/admin/country', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ country: c }),
      }).catch(() => {})

      // Build the new URL by replacing (or prepending) the country segment.
      const segments = (pathname ?? '/').split('/').filter(Boolean)
      const first = segments[0]
      const hasCountryPrefix = first === 'za' || first === 'au'
      const rest = hasCountryPrefix ? segments.slice(1) : segments
      const target = `/${c}${rest.length ? '/' + rest.join('/') : ''}`
      router.push(target)
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
