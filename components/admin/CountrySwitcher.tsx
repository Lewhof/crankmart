'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, Check, ChevronDown } from 'lucide-react'

const COUNTRY_LABELS: Record<string, string> = {
  za: 'South Africa',
  // au: 'Australia',  // future
}

export function CountrySwitcher({
  current,
  isSuperadmin,
  activeCountries,
}: {
  current: string
  isSuperadmin: boolean
  activeCountries: string[]
}) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const router = useRouter()

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
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 10px',
          background: 'var(--admin-surface-2)',
          border: '1px solid var(--admin-border)',
          color: 'var(--admin-text)',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={busy}
      >
        <Globe size={13} />
        <span>{current.toUpperCase()}</span>
        <span style={{ color: 'var(--admin-text-dim)', fontWeight: 500 }}>
          · {COUNTRY_LABELS[current] || current}
        </span>
        <ChevronDown size={12} style={{ marginLeft: 2 }} />
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          />
          <div
            role="listbox"
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 6px)',
              minWidth: 220,
              background: 'var(--admin-surface)',
              border: '1px solid var(--admin-border)',
              borderRadius: 10,
              padding: 4,
              zIndex: 50,
              boxShadow: '0 12px 32px rgba(0,0,0,.15)',
            }}
          >
            {activeCountries.map(c => (
              <button
                key={c}
                role="option"
                aria-selected={c === current}
                onClick={() => pick(c)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 10px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--admin-text)',
                  fontSize: 13,
                  cursor: 'pointer',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--admin-surface-2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ flex: 1 }}>
                  <strong>{c.toUpperCase()}</strong>
                  <span style={{ marginLeft: 8, color: 'var(--admin-text-dim)', fontWeight: 400 }}>
                    {COUNTRY_LABELS[c] || c}
                  </span>
                </span>
                {c === current && <Check size={14} style={{ color: 'var(--admin-accent)' }} />}
              </button>
            ))}
            {!isSuperadmin && (
              <div
                style={{
                  padding: '8px 10px',
                  fontSize: 11,
                  color: 'var(--admin-text-dim)',
                  borderTop: '1px solid var(--admin-border)',
                  marginTop: 4,
                }}
              >
                Global (all countries) view is superadmin-only.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
