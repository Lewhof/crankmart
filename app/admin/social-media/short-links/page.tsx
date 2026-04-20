'use client'

import { useEffect, useState } from 'react'
import { Card, PageHeader, Button, StatusPill, Empty } from '@/components/admin/primitives'
import { Plus, Trash2, Copy } from 'lucide-react'

type Link = {
  id: string
  slug: string
  destination: string
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  clicks: number
  expires_at: string | null
  created_at: string
}

export default function ShortLinksPage() {
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    slug: '', destination: '', utmSource: '', utmMedium: 'social',
    utmCampaign: '', utmContent: '',
  })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const r = await fetch('/api/admin/social-media/short-links?limit=200', { cache: 'no-store' })
    if (r.ok) setLinks((await r.json()).links)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const r = await fetch('/api/admin/social-media/short-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (!r.ok) { const e = await r.json(); alert(e.error || 'Failed'); return }
    setForm(f => ({ ...f, slug: '', destination: '', utmCampaign: '', utmContent: '' }))
    load()
  }

  const remove = async (id: string) => {
    if (!confirm('Delete short link? Historical clicks will be lost.')) return
    await fetch(`/api/admin/social-media/short-links/${id}`, { method: 'DELETE' })
    load()
  }

  const copy = async (slug: string) => {
    await navigator.clipboard.writeText(`https://crankmart.com/s/${slug}`)
  }

  const totalClicks = links.reduce((n, l) => n + (l.clicks ?? 0), 0)

  return (
    <div>
      <PageHeader
        title="Short Links"
        subtitle={`UTM-tagged /s/ redirects for social campaigns. Destinations must be crankmart.com. Total clicks: ${totalClicks}.`}
      />

      <Card padded>
        <form onSubmit={create} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 1fr 140px auto', gap: 8, alignItems: 'center' }}>
          <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="slug (auto if blank)" style={inputStyle} />
          <input value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} placeholder="destination: /browse/X or https://crankmart.com/…" style={inputStyle} required />
          <input value={form.utmCampaign} onChange={e => setForm(f => ({ ...f, utmCampaign: e.target.value }))} placeholder="utm_campaign" style={inputStyle} />
          <input value={form.utmSource} onChange={e => setForm(f => ({ ...f, utmSource: e.target.value }))} placeholder="utm_source" style={inputStyle} />
          <Button variant="primary" type="submit" disabled={saving || !form.destination}><Plus size={14} /> Create</Button>
        </form>
      </Card>

      <div style={{ marginTop: 16 }}>
        {loading ? (
          <div style={{ color: 'var(--admin-text-dim)', fontSize: 13 }}>Loading…</div>
        ) : links.length === 0 ? (
          <Empty message="No short links yet. Create one above to start attributing social traffic." />
        ) : (
          <Card padded={false}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead style={{ background: 'var(--admin-surface-2)' }}>
                  <tr>
                    <th style={th}>Slug</th>
                    <th style={th}>Destination</th>
                    <th style={th}>Campaign</th>
                    <th style={th}>Source</th>
                    <th style={th}>Clicks</th>
                    <th style={th}>Created</th>
                    <th style={th}></th>
                  </tr>
                </thead>
                <tbody>
                  {links.map(l => (
                    <tr key={l.id} style={{ borderTop: '1px solid var(--admin-border)' }}>
                      <td style={td}>
                        <code style={{ background: 'var(--admin-surface-2)', padding: '1px 6px', borderRadius: 4 }}>/s/{l.slug}</code>
                      </td>
                      <td style={{ ...td, maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.destination}</td>
                      <td style={td}>{l.utm_campaign || <span style={dim}>—</span>}</td>
                      <td style={td}>{l.utm_source || <span style={dim}>—</span>}</td>
                      <td style={td}><StatusPill label={String(l.clicks)} tone={l.clicks > 0 ? 'accent' : 'neutral'} /></td>
                      <td style={{ ...td, ...dim }}>{new Date(l.created_at).toLocaleDateString()}</td>
                      <td style={td}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Button size="sm" onClick={() => copy(l.slug)}><Copy size={12} /></Button>
                          <Button size="sm" variant="danger" onClick={() => remove(l.id)}><Trash2 size={12} /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
  fontSize: 12,
  width: '100%',
}
const th: React.CSSProperties = { textAlign: 'left', padding: '8px 12px', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.3px', color: 'var(--admin-text-dim)' }
const td: React.CSSProperties = { padding: '8px 12px', color: 'var(--admin-text)', verticalAlign: 'middle' }
const dim: React.CSSProperties = { color: 'var(--admin-text-dim)' }
