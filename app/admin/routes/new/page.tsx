'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const SA_PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape',
]

const DISCIPLINES = ['road', 'mtb', 'gravel', 'urban', 'bikepacking']
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced', 'expert']
const SURFACES = ['tarmac', 'gravel', 'singletrack', 'mixed']

const DISCIPLINE_COLORS: Record<string, { bg: string; color: string; active: string }> = {
  road:        { bg: '#EFF6FF', color: '#1D4ED8', active: '#1D4ED8' },
  mtb:         { bg: '#F0FDF4', color: '#166534', active: '#166534' },
  gravel:      { bg: '#FFF7ED', color: '#9A3412', active: '#9A3412' },
  urban:       { bg: '#F5F3FF', color: '#6D28D9', active: '#6D28D9' },
  bikepacking: { bg: '#FEF9C3', color: '#854D0E', active: '#854D0E' },
}
const DIFFICULTY_COLORS: Record<string, { bg: string; color: string }> = {
  beginner:     { bg: '#F0FDF4', color: '#166534' },
  intermediate: { bg: '#FFF7ED', color: '#9A3412' },
  advanced:     { bg: '#FEF2F2', color: '#991B1B' },
  expert:       { bg: '#1a1a1a', color: '#fff' },
}

const FACILITY_OPTIONS = ['Parking', 'Toilets', 'Coffee', 'Showers', 'Wash Bay', 'Restaurant', 'Bike Shop', 'Bike Repair']

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function fmtTime(mins: number) {
  if (!mins) return ''
  const h = Math.floor(mins / 60), m = mins % 60
  return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`
}

export default function NewRoutePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [tagInput, setTagInput] = useState('')

  const [form, setForm] = useState({
    name: '', slug: '', description: '', status: 'pending',
    is_featured: false, is_verified: false,
    discipline: '', difficulty: '', surface: '',
    distance_km: '', elevation_m: '', est_time_min: '',
    province: '', region: '', town: '', lat: '', lng: '',
    website_url: '', contact_email: '', contact_phone: '', gpx_url: '',
    facilities: {} as Record<string, boolean>,
    tags: [] as string[],
  })

  const set = (k: string, v: unknown) => setForm(prev => ({ ...prev, [k]: v }))

  const handleNameChange = (name: string) => {
    setForm(prev => ({ ...prev, name, slug: slugify(name) }))
  }

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !form.tags.includes(t)) {
      set('tags', [...form.tags, t])
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => set('tags', form.tags.filter(t => t !== tag))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true); setError('')
    try {
      const payload = {
        ...form,
        distance_km: form.distance_km ? parseFloat(form.distance_km) : null,
        elevation_m: form.elevation_m ? parseInt(form.elevation_m) : null,
        est_time_min: form.est_time_min ? parseInt(form.est_time_min) : null,
        lat: form.lat ? parseFloat(form.lat) : null,
        lng: form.lng ? parseFloat(form.lng) : null,
        facilities: form.facilities,
      }
      const res = await fetch('/api/admin/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
      const data = await res.json()
      router.push(`/admin/routes/${data.id}/edit`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create route')
      setSaving(false)
    }
  }

  const inp = (label: string, key: string, opts?: { type?: string; rows?: number; placeholder?: string }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      {opts?.rows ? (
        <textarea value={(form as any)[key]} onChange={e => set(key, e.target.value)} rows={opts.rows} placeholder={opts?.placeholder}
          style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
      ) : (
        <input type={opts?.type || 'text'} value={(form as any)[key]} onChange={e => set(key, e.target.value)} placeholder={opts?.placeholder}
          style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
      )}
    </div>
  )

  const section = (title: string, children: React.ReactNode) => (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebeb', padding: '20px 24px', marginBottom: 16 }}>
      <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1a1a1a', margin: '0 0 16px' }}>{title}</h2>
      {children}
    </div>
  )

  const grid2 = (children: React.ReactNode) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>{children}</div>
  )

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '24px 16px' }}>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#1a1a1a', margin: 0 }}>Add New Route</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9a9a9a' }}>You can add images after saving</p>
          </div>
          <a href="/admin/routes" style={{ fontSize: 13, color: '#0D1B2A', textDecoration: 'none' }}>← Routes</a>
        </div>

        {error && <div style={{ background: '#FEF2F2', color: '#991B1B', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, fontWeight: 600 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {section('Basic Info', (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name *</label>
                <input value={form.name} onChange={e => handleNameChange(e.target.value)} required
                  style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
              </div>
              {inp('Slug', 'slug', { placeholder: 'auto-generated from name' })}
              {inp('Description', 'description', { rows: 4 })}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} /> Featured
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.is_verified} onChange={e => set('is_verified', e.target.checked)} /> Verified
                </label>
              </div>
            </>
          ))}

          {section('Discipline & Difficulty', (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Discipline</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {DISCIPLINES.map(d => {
                    const c = DISCIPLINE_COLORS[d] || { bg: '#f0f0f0', color: '#333', active: '#333' }
                    const active = form.discipline === d
                    return (
                      <button key={d} type="button" onClick={() => set('discipline', active ? '' : d)}
                        style={{ padding: '6px 14px', borderRadius: 20, border: '2px solid', borderColor: active ? c.active : '#e4e4e7', background: active ? c.bg : '#fff', color: active ? c.color : '#6b7280', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                        {d}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Difficulty</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {DIFFICULTIES.map(d => {
                    const c = DIFFICULTY_COLORS[d] || { bg: '#f0f0f0', color: '#333' }
                    const active = form.difficulty === d
                    return (
                      <button key={d} type="button" onClick={() => set('difficulty', active ? '' : d)}
                        style={{ padding: '6px 14px', borderRadius: 20, border: '2px solid', borderColor: active ? c.color : '#e4e4e7', background: active ? c.bg : '#fff', color: active ? c.color : '#6b7280', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                        {d}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Surface</label>
                <select value={form.surface} onChange={e => set('surface', e.target.value)}
                  style={{ padding: '8px 12px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 13, background: '#fff', minWidth: 160 }}>
                  <option value="">— select —</option>
                  {SURFACES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </>
          ))}

          {section('Stats', grid2((
            <>
              {inp('Distance (km)', 'distance_km', { type: 'number' })}
              {inp('Elevation (m)', 'elevation_m', { type: 'number' })}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Est. Time (minutes)</label>
                <input type="number" value={form.est_time_min} onChange={e => set('est_time_min', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
                {form.est_time_min && <p style={{ fontSize: 12, color: '#9a9a9a', margin: '4px 0 0' }}>{fmtTime(parseInt(form.est_time_min))}</p>}
              </div>
            </>
          )))}

          {section('Location', (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Province</label>
                <select value={form.province} onChange={e => set('province', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 13, background: '#fff' }}>
                  <option value="">— select —</option>
                  {SA_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              {grid2(<>{inp('Region', 'region')}{inp('Town', 'town')}</>)}
              {grid2(<>
                {inp('Latitude', 'lat', { type: 'number', placeholder: '-33.9249' })}
                {inp('Longitude', 'lng', { type: 'number', placeholder: '18.4241' })}
              </>)}
            </>
          ))}

          {section('Contact & Links', grid2((
            <>
              {inp('Website URL', 'website_url', { type: 'url' })}
              {inp('GPX URL', 'gpx_url', { type: 'url' })}
              {inp('Contact Email', 'contact_email', { type: 'email' })}
              {inp('Contact Phone', 'contact_phone')}
            </>
          )))}

          {section('Facilities', (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
              {FACILITY_OPTIONS.map(f => {
                const key = f.toLowerCase().replace(/ /g, '_')
                return (
                  <label key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input type="checkbox" checked={!!form.facilities[key]} onChange={e => set('facilities', { ...form.facilities, [key]: e.target.checked })} />
                    {f}
                  </label>
                )
              })}
            </div>
          ))}

          {section('Tags', (
            <>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                  placeholder="Type tag + Enter"
                  style={{ flex: 1, padding: '8px 12px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 13 }} />
                <button type="button" onClick={addTag}
                  style={{ padding: '8px 14px', background: '#0D1B2A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Add
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {form.tags.map(tag => (
                  <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#E9ECF5', color: '#0D1B2A', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0D1B2A', fontSize: 14, lineHeight: 1, padding: 0, marginLeft: 2 }}>×</button>
                  </span>
                ))}
              </div>
            </>
          ))}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <a href="/admin/routes" style={{ padding: '10px 20px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#1a1a1a', textDecoration: 'none' }}>Cancel</a>
            <button type="submit" disabled={saving}
              style={{ padding: '10px 24px', background: '#0D1B2A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Creating…' : 'Create Route →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
