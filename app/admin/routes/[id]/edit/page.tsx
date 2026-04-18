'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Star, Trash2, GripVertical } from 'lucide-react'
import { adminCountryFromCookie, getProvincesStatic } from '@/lib/regions-static'

const DISCIPLINES = ['road', 'mtb', 'gravel', 'urban', 'bikepacking']
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced', 'expert']
const SURFACES = ['tarmac', 'gravel', 'singletrack', 'mixed']

const DISCIPLINE_COLORS: Record<string, { bg: string; color: string }> = {
  road:        { bg: '#EFF6FF', color: '#1D4ED8' },
  mtb:         { bg: '#F0FDF4', color: '#166534' },
  gravel:      { bg: '#FFF7ED', color: '#9A3412' },
  urban:       { bg: '#F5F3FF', color: '#6D28D9' },
  bikepacking: { bg: '#FEF9C3', color: '#854D0E' },
}
const DIFFICULTY_COLORS: Record<string, { bg: string; color: string }> = {
  beginner:     { bg: '#F0FDF4', color: '#166534' },
  intermediate: { bg: '#FFF7ED', color: '#9A3412' },
  advanced:     { bg: '#FEF2F2', color: '#991B1B' },
  expert:       { bg: '#1a1a1a', color: '#fff' },
}

const FACILITY_OPTIONS = ['Parking', 'Toilets', 'Coffee', 'Showers', 'Wash Bay', 'Restaurant', 'Bike Shop', 'Bike Repair']

interface RouteImage {
  id: string; url: string; thumb_url: string | null; alt_text: string | null
  is_primary: boolean; display_order: number
}

interface UploadItem {
  file: File; preview: string; status: 'uploading' | 'done' | 'error'; progress: number; error?: string
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function fmtTime(mins: number) {
  if (!mins) return ''
  const h = Math.floor(mins / 60), m = mins % 60
  return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`
}

export default function EditRoutePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)
  const provinces = useMemo(() => getProvincesStatic(adminCountryFromCookie()), [])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [error, setError] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [images, setImages] = useState<RouteImage[]>([])
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const [deletingImgId, setDeletingImgId] = useState<string | null>(null)

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

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/routes/${id}`).then(r => r.json()),
      fetch(`/api/admin/routes/${id}/images`).then(r => r.json()),
    ]).then(([route, imgs]) => {
      if (route.error) { setError(route.error); setLoading(false); return }
      setForm({
        name: route.name || '',
        slug: route.slug || '',
        description: route.description || '',
        status: route.status || 'pending',
        is_featured: !!route.is_featured,
        is_verified: !!route.is_verified,
        discipline: route.discipline || '',
        difficulty: route.difficulty || '',
        surface: route.surface || '',
        distance_km: route.distance_km != null ? String(route.distance_km) : '',
        elevation_m: route.elevation_m != null ? String(route.elevation_m) : '',
        est_time_min: route.est_time_min != null ? String(route.est_time_min) : '',
        province: route.province || '',
        region: route.region || '',
        town: route.town || '',
        lat: route.lat != null ? String(route.lat) : '',
        lng: route.lng != null ? String(route.lng) : '',
        website_url: route.website_url || '',
        contact_email: route.contact_email || '',
        contact_phone: route.contact_phone || '',
        gpx_url: route.gpx_url || '',
        facilities: typeof route.facilities === 'object' && route.facilities ? route.facilities : {},
        tags: Array.isArray(route.tags) ? route.tags : [],
      })
      setImages(Array.isArray(imgs) ? imgs : [])
      setLoading(false)
    }).catch(() => { setError('Failed to load route'); setLoading(false) })
  }, [id])

  const handleNameChange = (name: string) => {
    setForm(prev => ({ ...prev, name }))
  }

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !form.tags.includes(t)) set('tags', [...form.tags, t])
    setTagInput('')
  }
  const removeTag = (tag: string) => set('tags', form.tags.filter(t => t !== tag))

  const handleSave = async () => {
    setSaving(true); setSaveMsg(''); setError('')
    try {
      const payload = {
        ...form,
        distance_km: form.distance_km ? parseFloat(form.distance_km) : null,
        elevation_m: form.elevation_m ? parseInt(form.elevation_m) : null,
        est_time_min: form.est_time_min ? parseInt(form.est_time_min) : null,
        lat: form.lat ? parseFloat(form.lat) : null,
        lng: form.lng ? parseFloat(form.lng) : null,
      }
      const res = await fetch(`/api/admin/routes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
      setSaveMsg('Saved!')
      setTimeout(() => setSaveMsg(''), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally { setSaving(false) }
  }

  const handleSetPrimary = async (imgId: string) => {
    const res = await fetch(`/api/admin/routes/${id}/images/${imgId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_primary: true }),
    })
    if (res.ok) {
      setImages(prev => prev.map(img => ({ ...img, is_primary: img.id === imgId })))
    }
  }

  const handleDeleteImage = async (imgId: string) => {
    if (!confirm('Delete this image?')) return
    setDeletingImgId(imgId)
    const res = await fetch(`/api/admin/routes/${id}/images/${imgId}`, { method: 'DELETE' })
    if (res.ok) {
      const deleted = images.find(i => i.id === imgId)
      let updated = images.filter(i => i.id !== imgId)
      if (deleted?.is_primary && updated.length > 0) {
        updated = updated.map((img, idx) => ({ ...img, is_primary: idx === 0 }))
      }
      setImages(updated)
    }
    setDeletingImgId(null)
  }

  const handleAltChange = async (imgId: string, alt: string) => {
    setImages(prev => prev.map(img => img.id === imgId ? { ...img, alt_text: alt } : img))
    await fetch(`/api/admin/routes/${id}/images/${imgId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alt_text: alt }),
    })
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const newUploads: UploadItem[] = Array.from(files).map(file => ({
      file, preview: URL.createObjectURL(file), status: 'uploading', progress: 0,
    }))
    setUploads(prev => [...prev, ...newUploads])

    for (let i = 0; i < newUploads.length; i++) {
      const item = newUploads[i]
      const startIdx = uploads.length + i
      try {
        // Upload to /api/sell/upload
        const fd = new FormData()
        fd.append('file', item.file)
        const uploadRes = await fetch('/api/sell/upload', { method: 'POST', body: fd })
        if (!uploadRes.ok) throw new Error('Upload failed')
        const { url } = await uploadRes.json()

        // Save to route_images
        const saveRes = await fetch(`/api/admin/routes/${id}/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, alt_text: form.name, is_primary: images.length === 0 && i === 0 }),
        })
        if (!saveRes.ok) throw new Error('Failed to save image')
        const newImg = await saveRes.json()

        setImages(prev => {
          const updated = [...prev, newImg]
          if (images.length === 0 && i === 0) {
            return updated.map((img, idx) => ({ ...img, is_primary: idx === updated.length - 1 }))
          }
          return updated
        })
        setUploads(prev => prev.map((u, idx) => idx === startIdx ? { ...u, status: 'done', progress: 100 } : u))
      } catch (err: unknown) {
        setUploads(prev => prev.map((u, idx) => idx === startIdx
          ? { ...u, status: 'error', error: err instanceof Error ? err.message : 'Failed' }
          : u))
      }
    }
    // Clear done uploads after delay
    setTimeout(() => setUploads(prev => prev.filter(u => u.status !== 'done')), 3000)
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

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #ebebeb', borderTopColor: '#0D1B2A', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  )

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '24px 16px' }}>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#1a1a1a', margin: 0 }}>Edit Route</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9a9a9a' }}>{form.name}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {saveMsg && <span style={{ fontSize: 13, color: '#166534', fontWeight: 600 }}>✓ {saveMsg}</span>}
            {error && <span style={{ fontSize: 13, color: '#991B1B', fontWeight: 600 }}>{error}</span>}
            <a href="/admin/routes" style={{ fontSize: 13, color: '#0D1B2A', textDecoration: 'none' }}>← Routes</a>
            <button onClick={handleSave} disabled={saving}
              style={{ padding: '8px 20px', background: '#0D1B2A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        {/* Section 1: Basic Info */}
        {section('Basic Info', (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</label>
              <input value={form.name} onChange={e => handleNameChange(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
            </div>
            {inp('Slug', 'slug')}
            {inp('Description', 'description', { rows: 4 })}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 13, background: '#fff' }}>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
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

        {/* Section 2: Discipline & Difficulty */}
        {section('Discipline & Difficulty', (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Discipline</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {DISCIPLINES.map(d => {
                  const c = DISCIPLINE_COLORS[d] || { bg: '#f0f0f0', color: '#333' }
                  const active = form.discipline === d
                  return (
                    <button key={d} type="button" onClick={() => set('discipline', active ? '' : d)}
                      style={{ padding: '6px 14px', borderRadius: 20, border: '2px solid', borderColor: active ? c.color : '#e4e4e7', background: active ? c.bg : '#fff', color: active ? c.color : '#6b7280', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
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

        {/* Section 3: Stats */}
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

        {/* Section 4: Location */}
        {section('Location', (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Province</label>
              <select value={form.province} onChange={e => set('province', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 13, background: '#fff' }}>
                <option value="">— select —</option>
                {provinces.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            {grid2(<>{inp('Region', 'region')}{inp('Town', 'town')}</>)}
            {grid2(<>
              {inp('Latitude', 'lat', { type: 'number', placeholder: '-33.9249' })}
              {inp('Longitude', 'lng', { type: 'number', placeholder: '18.4241' })}
            </>)}
          </>
        ))}

        {/* Section 5: Contact & Links */}
        {section('Contact & Links', grid2((
          <>
            {inp('Website URL', 'website_url', { type: 'url' })}
            {inp('GPX URL', 'gpx_url', { type: 'url' })}
            {inp('Contact Email', 'contact_email', { type: 'email' })}
            {inp('Contact Phone', 'contact_phone')}
          </>
        )))}

        {/* Section 6: Facilities */}
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

        {/* Section 7: Tags */}
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

        {/* Section 8: Images */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebeb', padding: '20px 24px', marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1a1a1a', margin: '0 0 16px' }}>Images ({images.length})</h2>

          {/* Existing images */}
          {images.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
              {images.map(img => (
                <div key={img.id} style={{ border: '1.5px solid', borderColor: img.is_primary ? '#D97706' : '#ebebeb', borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
                  {img.is_primary && (
                    <div style={{ position: 'absolute', top: 6, left: 6, zIndex: 2, background: '#D97706', color: '#fff', borderRadius: 20, padding: '2px 7px', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Star size={10} /> Primary
                    </div>
                  )}
                  <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: '#f0f0f0' }}>
                    <img src={img.thumb_url || img.url} alt={img.alt_text || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '8px 10px' }}>
                    <input
                      value={img.alt_text || ''}
                      onChange={e => handleAltChange(img.id, e.target.value)}
                      placeholder="Alt text…"
                      style={{ width: '100%', padding: '5px 8px', border: '1px solid #e4e4e7', borderRadius: 6, fontSize: 11, boxSizing: 'border-box', marginBottom: 6 }}
                    />
                    <div style={{ display: 'flex', gap: 6 }}>
                      {!img.is_primary && (
                        <button onClick={() => handleSetPrimary(img.id)}
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '5px 0', border: '1.5px solid #D97706', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: '#FFF7ED', color: '#9A3412' }}>
                          <Star size={10} /> Set Primary
                        </button>
                      )}
                      <button onClick={() => handleDeleteImage(img.id)} disabled={deletingImgId === img.id}
                        style={{ flex: img.is_primary ? 1 : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '5px 10px', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: '#FEF2F2', color: '#991B1B', opacity: deletingImgId === img.id ? 0.5 : 1 }}>
                        <Trash2 size={10} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
            style={{ border: '2px dashed #e4e4e7', borderRadius: 10, padding: '32px 20px', textAlign: 'center', cursor: 'pointer', background: '#fafafa' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📷</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#6b7280', margin: '0 0 4px' }}>Drop images here or click to browse</p>
            <p style={{ fontSize: 12, color: '#9a9a9a', margin: 0 }}>JPEG, PNG, WebP — multiple files supported</p>
          </div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: 'none' }}
            onChange={e => handleFiles(e.target.files)} />

          {/* Upload previews */}
          {uploads.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 12 }}>
              {uploads.map((u, i) => (
                <div key={i} style={{ border: '1.5px solid #ebebeb', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
                  <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: '#f0f0f0' }}>
                    <img src={u.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: u.status === 'uploading' ? 0.6 : 1 }} />
                  </div>
                  <div style={{ padding: '4px 6px', fontSize: 10, fontWeight: 700, textAlign: 'center',
                    color: u.status === 'done' ? '#166534' : u.status === 'error' ? '#991B1B' : '#9a9a9a' }}>
                    {u.status === 'uploading' ? 'Uploading…' : u.status === 'done' ? '✓ Done' : `✗ ${u.error || 'Error'}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save button */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingBottom: 40 }}>
          <a href="/admin/routes" style={{ padding: '10px 20px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#1a1a1a', textDecoration: 'none' }}>← Back</a>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: '10px 24px', background: '#0D1B2A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
