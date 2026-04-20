'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, PageHeader, Button, StatusPill } from '@/components/admin/primitives'
import { Copy, Save, Send, ImagePlus, X } from 'lucide-react'
import { PLATFORM_LIMITS, PLATFORM_META, type SocialPlatform } from '@/lib/social-meta'

type Asset = { id: string; url: string; thumb_url: string | null; alt_text: string | null }
type Post = {
  id: string
  status: 'draft' | 'scheduled' | 'published' | 'failed' | 'archived'
  platforms: string[]
  title: string | null
  body: string
  asset_ids: string[]
  utm_campaign: string | null
  scheduled_at: string | null
}

const ALL_PLATFORMS: SocialPlatform[] = Object.keys(PLATFORM_META) as SocialPlatform[]

export default function ComposerPage() {
  const params = useSearchParams()
  const router = useRouter()
  const editId = params.get('id')

  const [post, setPost] = useState<Post>({
    id: '', status: 'draft', platforms: ['instagram', 'facebook'],
    title: '', body: '', asset_ids: [], utm_campaign: '', scheduled_at: null,
  })
  const [assets, setAssets] = useState<Asset[]>([])
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([])
  const [showPicker, setShowPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)

  // Load existing post if editing
  useEffect(() => {
    if (!editId) return
    fetch(`/api/admin/social-media/posts/${editId}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(({ post: p, assets: a }) => {
        if (!p) return
        setPost({
          id: p.id, status: p.status, platforms: p.platforms || [],
          title: p.title || '', body: p.body || '',
          asset_ids: p.asset_ids || [],
          utm_campaign: p.utm_campaign || '',
          scheduled_at: p.scheduled_at,
        })
        setAssets(a || [])
      })
  }, [editId])

  const openPicker = useCallback(async () => {
    const r = await fetch('/api/admin/social-media/assets?limit=48', { cache: 'no-store' })
    if (r.ok) setAvailableAssets((await r.json()).assets)
    setShowPicker(true)
  }, [])

  const attachAsset = (a: Asset) => {
    if (assets.some(x => x.id === a.id)) return
    setAssets(prev => [...prev, a])
    setPost(p => ({ ...p, asset_ids: [...p.asset_ids, a.id] }))
    setShowPicker(false)
  }
  const detachAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id))
    setPost(p => ({ ...p, asset_ids: p.asset_ids.filter(x => x !== id) }))
  }

  const togglePlatform = (p: SocialPlatform) => {
    setPost(s => ({ ...s, platforms: s.platforms.includes(p) ? s.platforms.filter(x => x !== p) : [...s.platforms, p] }))
  }

  const save = async (status?: Post['status']) => {
    setSaving(true)
    const payload = {
      status: status ?? post.status,
      platforms: post.platforms,
      title: post.title || null,
      body: post.body,
      assetIds: post.asset_ids,
      utmCampaign: post.utm_campaign || null,
      scheduledAt: post.scheduled_at,
    }
    const r = post.id
      ? await fetch(`/api/admin/social-media/posts/${post.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      : await fetch('/api/admin/social-media/posts',         { method: 'POST',  headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setSaving(false)
    if (!r.ok) { alert('Save failed'); return null }
    const j = await r.json()
    const newId = j.post?.id ?? post.id
    if (!post.id && newId) router.replace(`/admin/social-media/compose?id=${newId}`)
    setPost(s => ({ ...s, id: newId, status: payload.status as Post['status'] }))
    return newId as string
  }

  const publish = async () => {
    if (publishing) return
    setPublishing(true)
    try {
      const id = post.id || (await save('draft'))
      if (!id) return
      const r = await fetch(`/api/admin/social-media/posts/${id}/publish`, { method: 'POST' })
      if (!r.ok) { alert('Publish failed'); return }
      const { clipboard } = await r.json() as { clipboard: { body: string; title: string | null; platforms: string[]; assetUrls: string[] } }
      const text = [clipboard.title, '', clipboard.body, '', ...clipboard.assetUrls].filter(Boolean).join('\n')
      try {
        await navigator.clipboard.writeText(text)
      } catch {
        alert('Clipboard permission denied — copy payload manually from the composer text box.')
        return
      }
      // Server does NOT mark published; only set that status once we confirm the paste succeeded.
      await fetch(`/api/admin/social-media/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' }),
      })
      alert(`Copied to clipboard — paste into ${clipboard.platforms.join(', ')}.`)
      setPost(s => ({ ...s, status: 'published' }))
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div>
      <PageHeader
        title={post.id ? 'Edit post' : 'Compose post'}
        subtitle="v1 publishing = copy-to-clipboard. Auto-post backends land at v2."
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={() => save('draft')} disabled={saving}><Save size={14} /> Save draft</Button>
            <Button onClick={() => save('scheduled')} disabled={saving || !post.scheduled_at}><Send size={14} /> Schedule</Button>
            <Button variant="primary" onClick={publish} disabled={publishing || post.body.length === 0}><Copy size={14} /> Publish &amp; copy</Button>
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 16 }}>
        {/* Editor */}
        <div style={{ display: 'grid', gap: 12 }}>
          <Card padded>
            <label style={labelStyle}>Title (internal)</label>
            <input value={post.title || ''} onChange={e => setPost(p => ({ ...p, title: e.target.value }))} style={inputStyle} placeholder="Internal reference (optional)" />

            <label style={{ ...labelStyle, marginTop: 12 }}>Body</label>
            <textarea
              value={post.body}
              onChange={e => setPost(p => ({ ...p, body: e.target.value }))}
              rows={8}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              placeholder="Write the post. Line breaks preserved."
            />

            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <Button size="sm" onClick={openPicker}><ImagePlus size={12} /> Attach asset</Button>
              {assets.map(a => (
                <div key={a.id} style={{ position: 'relative' }}>
                  <img src={a.thumb_url || a.url} alt={a.alt_text || ''} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--admin-border)' }} />
                  <button
                    onClick={() => detachAsset(a.id)}
                    style={{ position: 'absolute', top: -6, right: -6, background: 'var(--admin-danger)', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                    aria-label="Remove"
                  ><X size={12} /></button>
                </div>
              ))}
            </div>
          </Card>

          <Card padded>
            <label style={labelStyle}>Schedule</label>
            <input
              type="datetime-local"
              value={post.scheduled_at ? toLocalInput(post.scheduled_at) : ''}
              onChange={e => setPost(p => ({ ...p, scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : null }))}
              style={{ ...inputStyle, maxWidth: 260 }}
            />
            <div style={{ marginTop: 12 }}>
              <label style={labelStyle}>UTM campaign</label>
              <input value={post.utm_campaign || ''} onChange={e => setPost(p => ({ ...p, utm_campaign: e.target.value }))} style={{ ...inputStyle, maxWidth: 320 }} placeholder="eg spring-sale-2026" />
            </div>
          </Card>
        </div>

        {/* Preview + platforms */}
        <div style={{ display: 'grid', gap: 12 }}>
          <Card padded>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.3px' }}>Status</div>
            <StatusPill label={post.status} tone={post.status === 'published' ? 'success' : post.status === 'scheduled' ? 'warn' : 'neutral'} />
          </Card>

          <Card padded>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.3px' }}>Target platforms</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ALL_PLATFORMS.map(p => {
                const selected = post.platforms.includes(p)
                const limit = PLATFORM_LIMITS[p]
                const over = post.body.length > limit.chars
                return (
                  <button
                    key={p}
                    onClick={() => togglePlatform(p)}
                    title={`${PLATFORM_META[p].label} · ${limit.chars} char limit`}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      border: '1px solid ' + (selected ? 'var(--admin-accent)' : 'var(--admin-border)'),
                      background: selected ? 'color-mix(in oklch, var(--admin-accent) 18%, transparent)' : 'var(--admin-surface-2)',
                      color: selected ? 'var(--admin-accent)' : 'var(--admin-text-dim)',
                      cursor: 'pointer',
                    }}
                  >
                    {PLATFORM_META[p].label}
                    {selected && over && <span style={{ marginLeft: 4, color: 'var(--admin-danger)' }}>!</span>}
                  </button>
                )
              })}
            </div>
          </Card>

          <Card padded>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.3px' }}>Char usage</div>
            <div style={{ display: 'grid', gap: 6 }}>
              {post.platforms.map(pp => {
                const lim = PLATFORM_LIMITS[pp as SocialPlatform]
                const pct = Math.min(100, Math.round((post.body.length / lim.chars) * 100))
                const over = post.body.length > lim.chars
                return (
                  <div key={pp}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--admin-text-dim)' }}>
                      <span>{PLATFORM_META[pp as SocialPlatform].label}</span>
                      <span style={{ color: over ? 'var(--admin-danger)' : 'var(--admin-text-dim)' }}>{post.body.length} / {lim.chars}</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--admin-border)', borderRadius: 2, overflow: 'hidden', marginTop: 2 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: over ? 'var(--admin-danger)' : 'var(--admin-accent)' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Asset picker modal */}
      {showPicker && (
        <div onClick={() => setShowPicker(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 90, display: 'grid', placeItems: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: 12, padding: 20, width: 'min(720px, 90vw)', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 14, color: 'var(--admin-text)' }}>Pick an asset</h3>
              <Button size="sm" href="/admin/social-media/assets">Manage assets</Button>
            </div>
            {availableAssets.length === 0 ? (
              <div style={{ padding: 24, color: 'var(--admin-text-dim)', textAlign: 'center', fontSize: 13 }}>
                No assets yet. <a href="/admin/social-media/assets" style={{ color: 'var(--admin-accent)' }}>Upload one</a>.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
                {availableAssets.map(a => (
                  <button
                    key={a.id}
                    onClick={() => attachAsset(a)}
                    style={{ padding: 0, border: '1px solid var(--admin-border)', borderRadius: 6, cursor: 'pointer', overflow: 'hidden', background: 'transparent' }}
                  >
                    <img src={a.thumb_url || a.url} alt={a.alt_text || ''} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function toLocalInput(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const inputStyle: React.CSSProperties = {
  background: 'var(--admin-surface-2)',
  border: '1px solid var(--admin-border)',
  color: 'var(--admin-text)',
  borderRadius: 6,
  padding: '8px 12px',
  fontSize: 13,
  width: '100%',
}
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  color: 'var(--admin-text-dim)',
  fontWeight: 600,
  letterSpacing: '.3px',
  textTransform: 'uppercase',
  marginBottom: 4,
}
