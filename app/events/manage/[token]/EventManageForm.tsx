'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Event {
  id: string
  title: string
  description: string | null
  eventType: string | null
  startDate: Date
  endDate: Date | null
  province: string | null
  city: string | null
  venue: string | null
  distance: string | null
  entryFee: string | null
  entryUrl: string | null
  websiteUrl: string | null
  organiserName: string | null
  organiserEmail: string | null
  organiserPhone: string | null
}

interface Props {
  event: Event
  token: string
}

export default function EventManageForm({ event, token }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({
    title: event.title,
    description: event.description ?? '',
    eventType: event.eventType ?? 'race',
    startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
    endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
    province: event.province ?? '',
    city: event.city ?? '',
    venue: event.venue ?? '',
    distance: event.distance ?? '',
    entryFee: event.entryFee ?? '',
    entryUrl: event.entryUrl ?? '',
    websiteUrl: event.websiteUrl ?? '',
    organiserName: event.organiserName ?? '',
    organiserEmail: event.organiserEmail ?? '',
    organiserPhone: event.organiserPhone ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleChange = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }))
    setSaved(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/events/manage/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/events/manage/${token}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to remove event')
      router.push('/events?removed=1')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to remove event.')
      setDeleting(false)
    }
  }

  const inputStyle = {
    width: '100%', boxSizing: 'border-box' as const,
    padding: '10px 12px', border: '1.5px solid #e4e4e7', borderRadius: 8,
    fontSize: 14, color: '#1a1a1a', background: '#fff', outline: 'none',
  }
  const labelStyle = { fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5 }

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1.5px solid #ebebeb', borderRadius: 12, padding: '28px 24px', marginBottom: 16 }}>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1a1a1a', margin: '0 0 20px' }}>Event Details</h2>

        <div style={{ display: 'grid', gap: 16 }}>
          <div>
            <label style={labelStyle}>Event Title *</label>
            <input style={inputStyle} value={form.title} onChange={e => handleChange('title', e.target.value)} required />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} value={form.description} onChange={e => handleChange('description', e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Event Type</label>
              <select style={inputStyle} value={form.eventType} onChange={e => handleChange('eventType', e.target.value)}>
                {['race', 'sportive', 'fun_ride', 'social_ride', 'training_camp', 'expo', 'club_event', 'charity_ride'].map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Distance</label>
              <input style={inputStyle} value={form.distance} onChange={e => handleChange('distance', e.target.value)} placeholder="e.g. 42km / 84km / 112km" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Start Date & Time *</label>
              <input style={inputStyle} type="datetime-local" value={form.startDate} onChange={e => handleChange('startDate', e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>End Date & Time</label>
              <input style={inputStyle} type="datetime-local" value={form.endDate} onChange={e => handleChange('endDate', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Province</label>
              <input style={inputStyle} value={form.province} onChange={e => handleChange('province', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>City</label>
              <input style={inputStyle} value={form.city} onChange={e => handleChange('city', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Venue</label>
              <input style={inputStyle} value={form.venue} onChange={e => handleChange('venue', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Entry Fee</label>
              <input style={inputStyle} value={form.entryFee} onChange={e => handleChange('entryFee', e.target.value)} placeholder="e.g. R350" />
            </div>
            <div>
              <label style={labelStyle}>Entry URL</label>
              <input style={inputStyle} type="url" value={form.entryUrl} onChange={e => handleChange('entryUrl', e.target.value)} placeholder="https://" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Event Website</label>
            <input style={inputStyle} type="url" value={form.websiteUrl} onChange={e => handleChange('websiteUrl', e.target.value)} placeholder="https://" />
          </div>

          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Organiser Contact</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Name</label>
                <input style={inputStyle} value={form.organiserName} onChange={e => handleChange('organiserName', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} type="email" value={form.organiserEmail} onChange={e => handleChange('organiserEmail', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input style={inputStyle} type="tel" value={form.organiserPhone} onChange={e => handleChange('organiserPhone', e.target.value)} />
              </div>
            </div>
          </div>

          {error && (
            <div style={{ background: '#FEE2E2', color: '#991B1B', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>{error}</div>
          )}
          {saved && (
            <div style={{ background: '#D1FAE5', color: '#065F46', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>Changes saved.</div>
          )}

          <button type="submit" disabled={loading}
            style={{ padding: '12px', background: '#0D1B2A', color: '#fff', border: 'none', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Remove event */}
      <div style={{ background: '#fff', border: '1.5px solid #FEE2E2', borderRadius: 12, padding: '20px 24px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#991B1B', marginBottom: 6 }}>Remove Event</div>
        <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 14px', lineHeight: 1.5 }}>
          This will mark the event as cancelled and remove your edit access. This cannot be undone.
        </p>
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)}
            style={{ padding: '9px 18px', background: '#FEE2E2', color: '#991B1B', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
            Remove Event
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleDelete} disabled={deleting}
              style={{ padding: '9px 18px', background: '#DC2626', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
              {deleting ? 'Removing…' : 'Yes, Remove'}
            </button>
            <button onClick={() => setConfirmDelete(false)}
              style={{ padding: '9px 18px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
