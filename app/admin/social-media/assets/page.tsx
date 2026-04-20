'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, PageHeader, Button, Empty } from '@/components/admin/primitives'
import { Upload, Trash2, Search } from 'lucide-react'

type Asset = {
  id: string
  url: string
  thumb_url: string | null
  mime: string | null
  width: number | null
  height: number | null
  size_bytes: number | null
  title: string | null
  alt_text: string | null
  tags: string[]
  rights_status: 'owned' | 'ugc_pending' | 'ugc_approved' | 'licensed' | 'unknown'
  created_at: string
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [q, setQ] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async (query = '') => {
    setLoading(true)
    const r = await fetch(`/api/admin/social-media/assets?q=${encodeURIComponent(query)}&limit=100`, { cache: 'no-store' })
    if (r.ok) setAssets((await r.json()).assets)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const onFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const up = await fetch('/api/admin/social-media/assets/upload', { method: 'POST', body: fd })
      if (!up.ok) { alert((await up.json()).error || 'Upload failed'); return }
      const { url, mime, sizeBytes } = await up.json()
      // Probe dims from the browser
      const img = new Image()
      const dims = await new Promise<{ w: number; h: number }>(res => {
        img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight })
        img.onerror = () => res({ w: 0, h: 0 })
        img.src = url
      })
      await fetch('/api/admin/social-media/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, mime, sizeBytes, width: dims.w || null, height: dims.h || null, title: file.name }),
      })
      load(q)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const updateAsset = async (id: string, patch: Partial<Asset>) => {
    await fetch(`/api/admin/social-media/assets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title:        patch.title,
        altText:      patch.alt_text,
        tags:         patch.tags,
        rightsStatus: patch.rights_status,
      }),
    })
    load(q)
  }

  const deleteAsset = async (id: string) => {
    if (!confirm('Delete asset? Posts referencing it keep the reference but image fails.')) return
    await fetch(`/api/admin/social-media/assets/${id}`, { method: 'DELETE' })
    load(q)
  }

  return (
    <div>
      <PageHeader
        title="Asset Library"
        subtitle="Reusable images + video for social posts. Tagged, rights-tracked, Vercel Blob-backed."
        actions={
          <>
            <input ref={fileRef} type="file" accept="image/*,video/mp4" hidden onChange={onFilePicked} />
            <Button variant="primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
              <Upload size={14} /> {uploading ? 'Uploading…' : 'Upload'}
            </Button>
          </>
        }
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-dim)' }} />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load(q)}
            placeholder="Search title / alt text…"
            style={{
              background: 'var(--admin-surface-2)',
              border: '1px solid var(--admin-border)',
              color: 'var(--admin-text)',
              borderRadius: 6,
              padding: '7px 12px 7px 30px',
              fontSize: 13,
              width: '100%',
            }}
          />
        </div>
        <Button onClick={() => load(q)}>Search</Button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--admin-text-dim)', fontSize: 13 }}>Loading…</div>
      ) : assets.length === 0 ? (
        <Empty message="No assets yet. Upload an image or video to start your library." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {assets.map(a => (
            <Card key={a.id} padded={false}>
              <img src={a.thumb_url || a.url} alt={a.alt_text || a.title || ''} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block', borderRadius: '10px 10px 0 0' }} />
              <div style={{ padding: 10 }}>
                <input
                  defaultValue={a.title || ''}
                  onBlur={e => e.target.value !== (a.title || '') && updateAsset(a.id, { title: e.target.value })}
                  placeholder="Title"
                  style={compactInput}
                />
                <input
                  defaultValue={a.alt_text || ''}
                  onBlur={e => e.target.value !== (a.alt_text || '') && updateAsset(a.id, { alt_text: e.target.value })}
                  placeholder="Alt text (for accessibility)"
                  style={{ ...compactInput, marginTop: 4 }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <select
                    defaultValue={a.rights_status}
                    onChange={e => updateAsset(a.id, { rights_status: e.target.value as Asset['rights_status'] })}
                    style={{ ...compactInput, maxWidth: 110 }}
                  >
                    <option value="owned">Owned</option>
                    <option value="licensed">Licensed</option>
                    <option value="ugc_pending">UGC pending</option>
                    <option value="ugc_approved">UGC approved</option>
                    <option value="unknown">Unknown</option>
                  </select>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <a href={a.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--admin-text-dim)' }}>View</a>
                    <button onClick={() => deleteAsset(a.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--admin-danger)' }} aria-label="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

const compactInput: React.CSSProperties = {
  background: 'var(--admin-surface-2)',
  border: '1px solid var(--admin-border)',
  color: 'var(--admin-text)',
  borderRadius: 4,
  padding: '4px 8px',
  fontSize: 12,
  width: '100%',
}
