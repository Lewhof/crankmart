'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Business {
  id: string
  name: string
  slug: string
  phone: string | null
  email: string | null
  website: string | null
  address: string | null
  suburb: string | null
  city: string | null
  province: string | null
  description: string | null
}

interface Props {
  business: Business
  token: string
}

export default function ClaimForm({ business, token }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: business.name,
    phone: business.phone ?? '',
    email: business.email ?? '',
    website: business.website ?? '',
    address: business.address ?? '',
    suburb: business.suburb ?? '',
    city: business.city ?? '',
    province: business.province ?? '',
    description: business.description ?? '',
    consent: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: string, value: string | boolean) => {
    setForm(f => ({ ...f, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.phone && !form.email) {
      setError('Please provide at least a phone number or email address.')
      return
    }
    if (!form.consent) {
      setError('Please accept the POPIA consent to continue.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/directory/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to claim listing')
      router.push(`/directory/${data.slug}?claimed=1`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', boxSizing: 'border-box' as const,
    padding: '10px 12px', border: '1.5px solid #e4e4e7', borderRadius: 8,
    fontSize: 14, color: '#1a1a1a', background: '#fff',
    outline: 'none',
  }
  const labelStyle = { fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5 }

  return (
    <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1.5px solid #ebebeb', borderRadius: 12, padding: '28px 24px' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1a1a1a', margin: '0 0 20px' }}>
        Verify & edit your listing details
      </h2>

      <div style={{ display: 'grid', gap: 16 }}>
        <div>
          <label style={labelStyle}>Business Name *</label>
          <input style={inputStyle} value={form.name} onChange={e => handleChange('name', e.target.value)} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Phone</label>
            <input style={inputStyle} type="tel" value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="e.g. 021 555 1234" />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="info@yourshop.co.za" />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Website</label>
          <input style={inputStyle} type="url" value={form.website} onChange={e => handleChange('website', e.target.value)} placeholder="https://yourshop.co.za" />
        </div>

        <div>
          <label style={labelStyle}>Street Address</label>
          <input style={inputStyle} value={form.address} onChange={e => handleChange('address', e.target.value)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Suburb</label>
            <input style={inputStyle} value={form.suburb} onChange={e => handleChange('suburb', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>City</label>
            <input style={inputStyle} value={form.city} onChange={e => handleChange('city', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Province</label>
            <input style={inputStyle} value={form.province} onChange={e => handleChange('province', e.target.value)} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder="Tell cyclists what makes your shop special..." />
        </div>

        <div style={{ background: '#f9fafb', borderRadius: 8, padding: '14px 16px', border: '1px solid #e4e4e7' }}>
          <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 10px', lineHeight: 1.6 }}>
            <strong>POPIA Notice:</strong> CycleMart will store and display the information above to help SA cyclists find your business. Your contact details will be shown on your public listing. You may request removal at any time by emailing info@cyclemart.co.za.
          </p>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.consent} onChange={e => handleChange('consent', e.target.checked)} style={{ marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#374151' }}>I consent to CycleMart storing and displaying this information in accordance with POPIA.</span>
          </label>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#991B1B', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading}
          style={{ padding: '13px', background: '#0D1B2A', color: '#fff', border: 'none', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 800, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Verifying…' : 'Verify & Claim My Listing →'}
        </button>
      </div>
    </form>
  )
}
