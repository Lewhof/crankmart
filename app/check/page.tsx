'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Search } from 'lucide-react'

export default function CheckIndexPage() {
  const router = useRouter()
  const [serial, setSerial] = useState('')
  const [brand, setBrand] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const s = serial.trim()
    if (!s) return
    setSubmitting(true)
    const qs = brand.trim() ? `?brand=${encodeURIComponent(brand.trim())}` : ''
    router.push(`/check/${encodeURIComponent(s)}${qs}`)
  }

  return (
    <main style={{ maxWidth: 640, margin: '56px auto 96px', padding: '0 20px', fontFamily: 'system-ui, sans-serif', color: '#1a1a1a' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(234,88,12,.12)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldCheck size={22} />
        </div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>Check a bike serial</h1>
      </div>
      <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.55, margin: '0 0 28px' }}>
        Enter a frame serial number to see if it&apos;s been reported stolen on CrankMart or{' '}
        <a href="https://bikeindex.org" target="_blank" rel="noreferrer" style={{ color: '#0D1B2A', fontWeight: 600 }}>Bike Index</a>
        . Always a good idea to check before buying a used bike — it only takes a second.
      </p>

      <form onSubmit={submit} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 22 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
          Serial number
        </label>
        <input
          type="text"
          value={serial}
          onChange={e => setSerial(e.target.value)}
          placeholder="e.g. WTU-12345-ABC"
          autoComplete="off"
          required
          style={{
            width: '100%', padding: '11px 14px', fontSize: 15,
            border: '1.5px solid #d1d5db', borderRadius: 8,
            outline: 'none', boxSizing: 'border-box',
            marginBottom: 14,
          }}
        />

        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
          Brand <span style={{ color: '#9ca3af', fontWeight: 400 }}>(recommended)</span>
        </label>
        <input
          type="text"
          value={brand}
          onChange={e => setBrand(e.target.value)}
          placeholder="e.g. Trek"
          autoComplete="off"
          style={{
            width: '100%', padding: '11px 14px', fontSize: 15,
            border: '1.5px solid #d1d5db', borderRadius: 8,
            outline: 'none', boxSizing: 'border-box',
            marginBottom: 18,
          }}
        />

        <button
          type="submit"
          disabled={submitting || !serial.trim()}
          style={{
            width: '100%', padding: '12px 20px',
            background: 'var(--color-primary)', color: '#fff',
            border: 'none', borderRadius: 8,
            fontSize: 14, fontWeight: 700,
            cursor: submitting ? 'default' : 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: submitting ? 0.7 : 1,
          }}
        >
          <Search size={15} /> Check serial
        </button>
      </form>

      <div style={{ marginTop: 28, fontSize: 13, color: '#6b7280', lineHeight: 1.65 }}>
        <strong>Reminder:</strong> a clean check isn&apos;t a guarantee. Serial numbers can be filed off,
        reports take time to appear, and many thefts are never reported. Always meet in person and
        verify the seller can physically access the bike.
      </div>
    </main>
  )
}
