'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeft, Loader, CheckCircle2, ExternalLink } from 'lucide-react'
import { suggestHandle } from '@/lib/community'
import { countryFromPath, getProvincesStatic } from '@/lib/regions-static'
import { getCountryConfig } from '@/lib/country-config'

export default function AccountProfilePage() {
  const router = useRouter()
  const pathname = usePathname()
  const country = countryFromPath(pathname)
  const provinces = getProvincesStatic(country)
  const regionLabel = getCountryConfig(country).regionLabel
  const { status } = useSession()
  const [form, setForm] = useState({
    handle: '',
    profileBio: '',
    profileCity: '',
    profileProvince: '',
    profileShowCity: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=${encodeURIComponent('/account/profile')}`)
      return
    }
    if (status !== 'authenticated') return
    fetch('/api/community/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setForm({
            handle:          data.handle ?? '',
            profileBio:      data.profileBio ?? '',
            profileCity:     data.profileCity ?? '',
            profileProvince: data.profileProvince ?? '',
            profileShowCity: Boolean(data.profileShowCity),
          })
        }
      })
      .finally(() => setLoading(false))
  }, [status, router])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/community/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle: form.handle.trim() || undefined,
          profileBio: form.profileBio,
          profileCity: form.profileCity,
          profileProvince: form.profileProvince,
          profileShowCity: form.profileShowCity,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Could not save profile.')
        return
      }
      setSavedAt(new Date())
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return <main style={{ textAlign: 'center', padding: 80, color: '#9a9a9a' }}>Loading…</main>
  }

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px 80px', fontFamily: 'system-ui, sans-serif', color: '#1a1a1a' }}>
      <Link href="/account" style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <ArrowLeft size={12} /> My account
      </Link>
      <h1 style={{ fontSize: 26, fontWeight: 900, margin: '10px 0 4px' }}>Public profile</h1>
      <p style={{ margin: '0 0 24px', fontSize: 14, color: '#6b7280', lineHeight: 1.55 }}>
        This is what other riders see at <code>/u/{form.handle || 'your-handle'}</code>.
        We never show your email or phone here.
      </p>

      <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Handle" hint="3–30 characters, lowercase letters, numbers, underscore. Used in your profile URL.">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, color: '#9a9a9a' }}>crankmart.com/u/</span>
            <input
              required
              minLength={3}
              maxLength={30}
              pattern="[a-z0-9_]+"
              value={form.handle}
              onChange={e => setForm(f => ({ ...f, handle: suggestHandle(e.target.value) }))}
              style={{ ...inputStyle, flex: 1 }}
            />
            {form.handle && (
              <Link href={`/u/${form.handle}`} target="_blank" style={{ fontSize: 12, color: '#6b7280', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <ExternalLink size={12} /> View
              </Link>
            )}
          </div>
        </Field>

        <Field label="Bio" hint="A short intro (max 1,000 chars).">
          <textarea
            value={form.profileBio}
            maxLength={1000}
            onChange={e => setForm(f => ({ ...f, profileBio: e.target.value }))}
            placeholder="What do you ride? Where? Your discipline?"
            style={{ ...inputStyle, minHeight: 100, resize: 'vertical', fontFamily: 'inherit' }}
          />
        </Field>

        <Field label={regionLabel}>
          <select value={form.profileProvince} onChange={e => setForm(f => ({ ...f, profileProvince: e.target.value }))} style={inputStyle}>
            <option value="">Don&apos;t show</option>
            {provinces.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>

        <Field label="City">
          <input
            value={form.profileCity}
            onChange={e => setForm(f => ({ ...f, profileCity: e.target.value }))}
            placeholder="e.g. Stellenbosch"
            style={inputStyle}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6b7280', marginTop: 6, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.profileShowCity}
              onChange={e => setForm(f => ({ ...f, profileShowCity: e.target.checked }))}
            />
            Show city on my public profile (off by default — province only)
          </label>
        </Field>

        {error && (
          <div role="alert" style={{ padding: 12, background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: 8, fontSize: 13 }}>
            {error}
          </div>
        )}

        {savedAt && !error && (
          <div style={{ padding: 12, background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', borderRadius: 8, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={14} /> Saved.
          </div>
        )}

        <button
          type="submit"
          disabled={saving || !form.handle.trim()}
          style={{
            padding: '12px 16px', background: 'var(--color-primary)', color: '#fff',
            border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 800,
            cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: 'fit-content',
          }}
        >
          {saving && <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />}
          Save profile
        </button>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </form>
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', fontSize: 14,
  border: '1px solid #d1d5db', borderRadius: 8, outline: 'none', boxSizing: 'border-box',
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>{label}</label>
      {hint && <div style={{ fontSize: 11, color: '#9a9a9a', marginBottom: 6 }}>{hint}</div>}
      {children}
    </div>
  )
}
