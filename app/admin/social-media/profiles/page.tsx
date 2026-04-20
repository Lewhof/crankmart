'use client'

import { useEffect, useState } from 'react'
import { Card, PageHeader, Button, StatusPill, Empty } from '@/components/admin/primitives'
import { Plus, Trash2, Save } from 'lucide-react'
import { PLATFORM_META } from '@/lib/social'

type Profile = {
  id: string
  platform: string
  handle: string
  url: string
  country: string
  display_in_footer: boolean
  is_active: boolean
  sort_order: number
}

const PLATFORMS = Object.keys(PLATFORM_META)

export default function SocialProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newPlatform, setNewPlatform] = useState('instagram')
  const [newHandle, setNewHandle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [country, setCountry] = useState('za')

  const load = async () => {
    setLoading(true)
    const r = await fetch(`/api/admin/social-media/profiles?country=${country}`, { cache: 'no-store' })
    if (r.ok) setProfiles((await r.json()).profiles)
    setLoading(false)
  }
  useEffect(() => { load() }, [country])

  const add = async () => {
    if (!newHandle.trim()) return
    setAdding(true)
    const r = await fetch('/api/admin/social-media/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: newPlatform, handle: newHandle.trim(), url: newUrl.trim() || undefined, country }),
    })
    setAdding(false)
    if (r.ok) { setNewHandle(''); setNewUrl(''); load() }
    else { const e = await r.json(); alert(e.error || 'Failed') }
  }

  const update = async (p: Profile, patch: Partial<Profile>) => {
    await fetch(`/api/admin/social-media/profiles/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handle: patch.handle, url: patch.url,
        displayInFooter: patch.display_in_footer, isActive: patch.is_active,
        sortOrder: patch.sort_order,
      }),
    })
    load()
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this profile? Footer + sameAs JSON-LD will update next request.')) return
    await fetch(`/api/admin/social-media/profiles/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <PageHeader
        title="Social Profiles"
        subtitle="These handles drive the footer icon row and Organization.sameAs JSON-LD — the signal Google uses to link CrankMart to its verified social presence."
        actions={
          <select
            value={country}
            onChange={e => setCountry(e.target.value)}
            style={{
              background: 'var(--admin-surface-2)',
              border: '1px solid var(--admin-border)',
              color: 'var(--admin-text)',
              borderRadius: 6,
              padding: '6px 10px',
              fontSize: 13,
            }}
          >
            <option value="za">South Africa (za)</option>
            <option value="au">Australia (au)</option>
          </select>
        }
      />

      <Card padded>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 10 }}>Add / upsert profile</div>
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 1fr auto', gap: 8, alignItems: 'center' }}>
          <select value={newPlatform} onChange={e => setNewPlatform(e.target.value)} style={inputStyle}>
            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <input placeholder="handle (e.g. crankmartsa)" value={newHandle} onChange={e => setNewHandle(e.target.value)} style={inputStyle} />
          <input placeholder="override URL (optional, https://…)" value={newUrl} onChange={e => setNewUrl(e.target.value)} style={inputStyle} />
          <Button variant="primary" onClick={add} disabled={adding || !newHandle}>
            <Plus size={14} /> Add
          </Button>
        </div>
        <p style={{ margin: '8px 0 0', fontSize: 11, color: 'var(--admin-text-dim)' }}>
          URL auto-built from platform + handle if left blank. Upserts on (platform, country).
        </p>
      </Card>

      <div style={{ marginTop: 16 }}>
        {loading ? (
          <div style={{ color: 'var(--admin-text-dim)', fontSize: 13 }}>Loading…</div>
        ) : profiles.length === 0 ? (
          <Empty message={`No profiles for ${country}. Add one above.`} />
        ) : (
          <Card padded={false}>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {profiles.map((p, i) => (
                <li key={p.id} style={{ padding: '12px 16px', borderTop: i === 0 ? 'none' : '1px solid var(--admin-border)', display: 'grid', gridTemplateColumns: '120px 1fr 1fr 90px 110px auto', gap: 10, alignItems: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text)', textTransform: 'capitalize' }}>{p.platform}</div>
                  <input
                    defaultValue={p.handle}
                    onBlur={e => e.target.value !== p.handle && update(p, { handle: e.target.value })}
                    style={inputStyle}
                  />
                  <input
                    defaultValue={p.url}
                    onBlur={e => e.target.value !== p.url && update(p, { url: e.target.value })}
                    style={inputStyle}
                  />
                  <label style={{ fontSize: 11, color: 'var(--admin-text-dim)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="checkbox" checked={p.display_in_footer} onChange={e => update(p, { display_in_footer: e.target.checked })} />
                    footer
                  </label>
                  <StatusPill label={p.is_active ? 'active' : 'inactive'} tone={p.is_active ? 'success' : 'neutral'} />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Button size="sm" onClick={() => update(p, { is_active: !p.is_active })}><Save size={12} /> {p.is_active ? 'Pause' : 'Activate'}</Button>
                    <Button size="sm" variant="danger" onClick={() => remove(p.id)}><Trash2 size={12} /></Button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'var(--admin-surface-2)',
  border: '1px solid var(--admin-border)',
  color: 'var(--admin-text)',
  borderRadius: 6,
  padding: '6px 10px',
  fontSize: 13,
  width: '100%',
}
