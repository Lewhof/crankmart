'use client'

import { useState } from 'react'

interface Business {
  id: string
  name: string
  description: string | null
  phone: string | null
  email: string | null
  website: string | null
  address: string | null
  suburb: string | null
  city: string | null
  province: string | null
  brandsStocked: string[] | null
  services: string[] | null
  hours: Record<string, unknown> | null
}

interface Props {
  business: Business
}

export default function MyListingForm({ business }: Props) {
  const [form, setForm] = useState({
    name: business.name,
    description: business.description ?? '',
    phone: business.phone ?? '',
    email: business.email ?? '',
    website: business.website ?? '',
    address: business.address ?? '',
    suburb: business.suburb ?? '',
    city: business.city ?? '',
    province: business.province ?? '',
    brandsStocked: (business.brandsStocked ?? []).join(', '),
    services: (business.services ?? []).join(', '),
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }))
    setSaved(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/account/my-listing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          phone: form.phone,
          email: form.email,
          website: form.website,
          address: form.address,
          suburb: form.suburb,
          city: form.city,
          province: form.province,
          brandsStocked: form.brandsStocked.split(',').map(s => s.trim()).filter(Boolean),
          services: form.services.split(',').map(s => s.trim()).filter(Boolean),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setSaved(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', boxSizing: 'border-box' as const,
    padding: '10px 12px', border: '1.5px solid #e4e4e7', borderRadius: 8,
    fontSize: 14, color: '#1a1a1a', background: '#fff', outline: 'none',
  }
  const labelStyle = { fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5 }

  return (
    <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1.5px solid #ebebeb', borderRadius: 12, padding: '28px 24px' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1a1a1a', margin: '0 0 20px' }}>Edit Listing</h2>

      <div style={{ display: 'grid', gap: 16 }}>
        <div>
          <label style={labelStyle}>Business Name *</label>
          <input style={inputStyle} value={form.name} onChange={e => handleChange('name', e.target.value)} required />
        </div>

        <div>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} value={form.description} onChange={e => handleChange('description', e.target.value)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Phone</label>
            <input style={inputStyle} type="tel" value={form.phone} onChange={e => handleChange('phone', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Website</label>
          <input style={inputStyle} type="url" value={form.website} onChange={e => handleChange('website', e.target.value)} placeholder="https://" />
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
          <label style={labelStyle}>Brands Stocked (comma-separated)</label>
          <input style={inputStyle} value={form.brandsStocked} onChange={e => handleChange('brandsStocked', e.target.value)} placeholder="Trek, Specialized, Shimano" />
        </div>

        <div>
          <label style={labelStyle}>Services (comma-separated)</label>
          <input style={inputStyle} value={form.services} onChange={e => handleChange('services', e.target.value)} placeholder="Repairs, Fitting, Rentals" />
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#991B1B', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
            {error}
          </div>
        )}

        {saved && (
          <div style={{ background: '#D1FAE5', color: '#065F46', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>
            Changes saved successfully.
          </div>
        )}

        <button type="submit" disabled={loading}
          style={{ padding: '12px', background: '#0D1B2A', color: '#fff', border: 'none', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
