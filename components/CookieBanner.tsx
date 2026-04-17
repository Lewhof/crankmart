'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'cm_consent_v1'

interface Consent {
  analytics: boolean
  ads: boolean
  ts: number
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer?: any[]
    cmOpenCookieBanner?: () => void
  }
}

function gtag(...args: unknown[]) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(args)
}

function applyConsent(c: Pick<Consent, 'analytics' | 'ads'>) {
  gtag('consent', 'update', {
    analytics_storage:  c.analytics ? 'granted' : 'denied',
    ad_storage:         c.ads       ? 'granted' : 'denied',
    ad_user_data:       c.ads       ? 'granted' : 'denied',
    ad_personalization: c.ads       ? 'granted' : 'denied',
  })
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  const open = useCallback(() => setVisible(true), [])

  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        setVisible(true)
        return
      }
      const c = JSON.parse(raw) as Consent
      applyConsent(c)
    } catch {
      setVisible(true)
    }
    window.cmOpenCookieBanner = open
    return () => { delete window.cmOpenCookieBanner }
  }, [open])

  const save = (choice: Pick<Consent, 'analytics' | 'ads'>) => {
    const record: Consent = { ...choice, ts: Date.now() }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(record)) } catch {}
    applyConsent(choice)
    setVisible(false)
  }

  if (!mounted || !visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        right: 16,
        maxWidth: 640,
        margin: '0 auto',
        zIndex: 9999,
        background: 'rgba(13, 27, 42, 0.96)',
        color: '#fff',
        border: '1px solid rgba(255,255,255,.12)',
        borderRadius: 14,
        padding: '18px 20px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,.35)',
        fontSize: 14,
        lineHeight: 1.55,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
        Cookies &amp; privacy
      </div>
      <p style={{ margin: '0 0 14px', color: 'rgba(255,255,255,.75)' }}>
        We use essential cookies to run CrankMart, and optional analytics cookies to improve the site.
        You can accept all, decline the optional ones, or change your mind any time via the footer.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => save({ analytics: true, ads: true })}
          style={{
            flex: '1 1 160px',
            padding: '10px 16px',
            background: '#818cf8',
            color: '#0a0f1e',
            border: 'none',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Accept all
        </button>
        <button
          type="button"
          onClick={() => save({ analytics: false, ads: false })}
          style={{
            flex: '1 1 160px',
            padding: '10px 16px',
            background: 'rgba(255,255,255,.08)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,.18)',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Decline optional
        </button>
      </div>
    </div>
  )
}
