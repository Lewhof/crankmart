'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const eventTypes = [
  { value: 'race', label: 'Race' },
  { value: 'sportive', label: 'Sportive/Gran Fondo' },
  { value: 'fun_ride', label: 'Fun Ride' },
  { value: 'training_camp', label: 'Training Camp' },
  { value: 'expo', label: 'Expo/Trade Show' },
  { value: 'club_event', label: 'Club Event' },
  { value: 'charity_ride', label: 'Charity Ride' },
]

const provinces = [
  'Western Cape',
  'Eastern Cape',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Free State',
  'North West',
  'Northern Cape',
]

export default function SubmitEventPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    // Step 1: Event Info
    title: '',
    eventType: 'race',
    startDate: '',
    endDate: '',
    description: '',

    // Step 2: Location
    province: '',
    city: '',
    venue: '',

    // Step 3: Details
    distance: '',
    entryFee: '',
    entryUrl: '',
    websiteUrl: '',
    organiserName: '',
    organiserEmail: '',
    organiserPhone: '',
    bannerUrl: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (step < 3) {
      setStep(step + 1)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/events/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit event')
      }

      router.push('/events?submitted=true')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ background: 'white', padding: '20px 0', borderBottom: '1px solid #e0e0e0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-primary)', margin: 0 }}>📅 Submit an Event</h1>
          <Link href="/events" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '600', cursor: 'pointer' }}>← Back</Link>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 16px' }}>
        {/* Progress Indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', gap: '16px' }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ flex: 1, textAlign: 'center' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: s <= step ? '#0D1B2A' : '#e0e0e0',
                  color: s <= step ? 'white' : '#999',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  margin: '0 auto 8px',
                  transition: 'all 0.2s',
                }}
              >
                {s}
              </div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: s <= step ? '#0D1B2A' : '#999' }}>
                {s === 1 ? 'Event Info' : s === 2 ? 'Location' : 'Details'}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ background: '#ffebee', border: '1px solid #ffcdd2', color: '#c62828', padding: '16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: 'white', padding: '32px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {/* STEP 1: EVENT INFO */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#1a1a1a' }}>Event Information</h2>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#1a1a1a' }}>Event Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Cape Town Cycle Challenge"
                  required
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#1a1a1a' }}>Event Type *</label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}
                >
                  {eventTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#1a1a1a' }}>Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#1a1a1a' }}>End Date (if multi-day)</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#1a1a1a' }}>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your event (min 50 characters)..."
                  required
                  rows={5}
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#1a1a1a' }}>Location Details</h2>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#1a1a1a' }}>Province *</label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}
                >
                  <option value="">Select a province</option>
                  {provinces.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#1a1a1a' }}>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g., Cape Town"
                  required
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#1a1a1a' }}>Venue/Start Point</label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="e.g., Mouille Point Promenade"
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}
                />
              </div>
            </div>
          )}

          {/* STEP 3: DETAILS */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#1a1a1a' }}>Event Details & Organiser</h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#1a1a1a' }}>Distance (e.g., 42km)</label>
                  <input
                    type="text"
                    name="distance"
                    value={formData.distance}
                    onChange={handleChange}
                    placeholder="e.g., 42km or 3 days"
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#1a1a1a' }}>Entry Fee</label>
                  <input
                    type="text"
                    name="entryFee"
                    value={formData.entryFee}
                    onChange={handleChange}
                    placeholder="e.g., R500 or Free"
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#1a1a1a' }}>Entry URL (EntryNinja, EventReg, etc.)</label>
                <input
                  type="url"
                  name="entryUrl"
                  value={formData.entryUrl}
                  onChange={handleChange}
                  placeholder="https://entryninja.com/..."
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#1a1a1a' }}>Event Website URL</label>
                <input
                  type="url"
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#1a1a1a' }}>Organiser Name *</label>
                <input
                  type="text"
                  name="organiserName"
                  value={formData.organiserName}
                  onChange={handleChange}
                  placeholder="Your name or organization"
                  required
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#1a1a1a' }}>Organiser Email *</label>
                <input
                  type="email"
                  name="organiserEmail"
                  value={formData.organiserEmail}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#1a1a1a' }}>Organiser Phone</label>
                <input
                  type="tel"
                  name="organiserPhone"
                  value={formData.organiserPhone}
                  onChange={handleChange}
                  placeholder="+27 21 555 0000"
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '32px', justifyContent: 'flex-end' }}>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                style={{ padding: '12px 24px', background: 'white', border: '1px solid #e0e0e0', color: '#1a1a1a', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
              >
                ← Back
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: loading ? '#ccc' : '#0D1B2A',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {step < 3 ? 'Continue →' : loading ? 'Submitting...' : 'Submit Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
