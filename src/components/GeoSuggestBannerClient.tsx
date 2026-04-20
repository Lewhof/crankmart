'use client'

/**
 * Dismissible banner client island. A 30-day cookie (`geo_suggest_dismissed`)
 * keyed on the target country silences the banner per-target: a ZA user who
 * visits /au and dismisses still sees the banner later if they ever land on
 * a different target (no forced re-suggest spam).
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X, Globe } from 'lucide-react'

const COOKIE = 'geo_suggest_dismissed'
const MAX_AGE_DAYS = 30

function readDismissedTargets(): Set<string> {
  if (typeof document === 'undefined') return new Set()
  const m = document.cookie.split('; ').find(c => c.startsWith(`${COOKIE}=`))
  if (!m) return new Set()
  return new Set(decodeURIComponent(m.split('=')[1]).split(','))
}

function writeDismissedTargets(set: Set<string>) {
  const maxAge = MAX_AGE_DAYS * 24 * 60 * 60
  document.cookie = `${COOKIE}=${encodeURIComponent([...set].join(','))}; max-age=${maxAge}; path=/; samesite=lax`
}

export function GeoSuggestBannerClient({
  targetCountry,
  targetName,
  targetStatus,
}: {
  targetCountry: string
  targetName: string
  targetStatus: 'live' | 'coming-soon'
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Respect dismissal — only show once per target per cookie lifetime.
    setVisible(!readDismissedTargets().has(targetCountry))
  }, [targetCountry])

  function dismiss() {
    const set = readDismissedTargets()
    set.add(targetCountry)
    writeDismissedTargets(set)
    setVisible(false)
  }

  if (!visible) return null

  // Coming-soon target → link to that country's home page (Coming Soon gate
  // displays from there). Live target → link straight to /<country>.
  const href = `/${targetCountry}`
  const note =
    targetStatus === 'coming-soon'
      ? `— launching soon`
      : ''

  return (
    <div
      role="region"
      aria-label="Geolocation suggestion"
      style={{
        background: 'var(--color-night-ride, #0D1B2A)',
        color: '#fff',
        fontSize: 13,
        padding: '8px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <Globe size={14} />
        Looks like you&apos;re in {targetName}.
      </span>
      <Link
        href={href}
        prefetch={false}
        style={{
          padding: '4px 12px',
          background: '#fff',
          color: 'var(--color-night-ride, #0D1B2A)',
          textDecoration: 'none',
          borderRadius: 4,
          fontWeight: 700,
          fontSize: 12,
        }}
      >
        Switch to {targetName} {note} →
      </Link>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          background: 'transparent', border: 'none', color: 'rgba(255,255,255,.7)',
          cursor: 'pointer', padding: 4, display: 'inline-flex', alignItems: 'center',
        }}
      >
        <X size={14} />
      </button>
    </div>
  )
}
