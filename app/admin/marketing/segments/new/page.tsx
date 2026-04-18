'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageHeader, Button, Card } from '@/components/admin/primitives'
import { Users, Loader, ArrowLeft } from 'lucide-react'

const SA_PROVINCES = ['Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','Northern Cape','North West','Western Cape']
const AU_STATES = ['New South Wales','Victoria','Queensland','Western Australia','South Australia','Tasmania','Northern Territory','Australian Capital Territory']

interface SegmentQuery {
  role?: string[]
  emailVerified?: boolean
  createdAfter?: string
  createdBefore?: string
  province?: string[]
  hasListings?: boolean
  hasSoldListings?: boolean
  hasClaimedBusiness?: boolean
  waitlistOnly?: boolean
  excludeUnsubscribed?: boolean
}

export default function NewSegmentPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [query, setQuery] = useState<SegmentQuery>({ excludeUnsubscribed: true })
  const [size, setSize] = useState<number | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const provinces = useMemo(() => [...SA_PROVINCES, ...AU_STATES], [])

  // Debounced size preview whenever the query changes.
  useEffect(() => {
    let cancel = false
    const t = setTimeout(async () => {
      setPreviewing(true)
      try {
        const res = await fetch('/api/admin/marketing/segments/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        })
        const data = await res.json()
        if (!cancel) setSize(data.size ?? 0)
      } finally {
        if (!cancel) setPreviewing(false)
      }
    }, 400)
    return () => { cancel = true; clearTimeout(t) }
  }, [query])

  async function save() {
    if (!name.trim()) { setError('Name required'); return }
    setError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/admin/marketing/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description, query }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error || 'Save failed'); return
      }
      router.push('/admin/marketing/segments')
    } finally { setSaving(false) }
  }

  const toggleArrayVal = (key: 'role' | 'province', val: string) => {
    setQuery(q => {
      const current = (q[key] as string[]) ?? []
      const next = current.includes(val) ? current.filter(x => x !== val) : [...current, val]
      return { ...q, [key]: next.length ? next : undefined }
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Link href="/admin/marketing/segments" style={{ fontSize: 12, color: 'var(--admin-text-dim)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <ArrowLeft size={12} /> All segments
        </Link>
      </div>
      <PageHeader title="New segment" subtitle="Define filters; recipients are computed at send time." />

      <Card>
        <div style={{ display: 'grid', gap: 14 }}>
          <Field label="Name">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Active sellers — last 30 days" style={inputStyle} />
          </Field>
          <Field label="Description (optional)">
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Who are we talking to here?" style={inputStyle} />
          </Field>
        </div>
      </Card>

      <Card>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>Filters</h3>
        <div style={{ display: 'grid', gap: 16 }}>

          <Field label="Role">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['buyer', 'seller', 'shop_owner'].map(r => (
                <Chip key={r} active={(query.role ?? []).includes(r)} onClick={() => toggleArrayVal('role', r)}>{r}</Chip>
              ))}
            </div>
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Joined after">
              <input type="date" value={query.createdAfter?.slice(0, 10) ?? ''} onChange={e => setQuery(q => ({ ...q, createdAfter: e.target.value || undefined }))} style={inputStyle} />
            </Field>
            <Field label="Joined before">
              <input type="date" value={query.createdBefore?.slice(0, 10) ?? ''} onChange={e => setQuery(q => ({ ...q, createdBefore: e.target.value || undefined }))} style={inputStyle} />
            </Field>
          </div>

          <Field label="Province / state">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {provinces.map(p => (
                <Chip key={p} active={(query.province ?? []).includes(p)} onClick={() => toggleArrayVal('province', p)}>{p}</Chip>
              ))}
            </div>
          </Field>

          <Field label="Activity">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Toggle checked={!!query.emailVerified} onChange={v => setQuery(q => ({ ...q, emailVerified: v ? true : undefined }))} label="Email verified" />
              <Toggle checked={!!query.hasListings} onChange={v => setQuery(q => ({ ...q, hasListings: v ? true : undefined }))} label="Has active listings" />
              <Toggle checked={!!query.hasSoldListings} onChange={v => setQuery(q => ({ ...q, hasSoldListings: v ? true : undefined }))} label="Has sold a bike" />
              <Toggle checked={!!query.hasClaimedBusiness} onChange={v => setQuery(q => ({ ...q, hasClaimedBusiness: v ? true : undefined }))} label="Owns a shop" />
              <Toggle checked={!!query.waitlistOnly} onChange={v => setQuery(q => ({ ...q, waitlistOnly: v ? true : undefined }))} label="Waitlist only" />
            </div>
          </Field>
        </div>
      </Card>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--admin-text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: .4 }}>
              Live preview
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, fontSize: 22, fontWeight: 800 }}>
              <Users size={20} />
              {previewing ? '…' : (size?.toLocaleString() ?? '—')}
              <span style={{ fontSize: 12, color: 'var(--admin-text-dim)', fontWeight: 500 }}>recipients</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/admin/marketing/segments"><Button variant="ghost" size="sm">Cancel</Button></Link>
            <Button variant="primary" size="sm" onClick={save} disabled={saving || !name.trim()}>
              {saving && <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />}
              Save segment
            </Button>
          </div>
        </div>
        {error && <div style={{ marginTop: 12, fontSize: 13, color: 'var(--admin-danger)' }}>{error}</div>}
      </Card>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', fontSize: 13,
  background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border)', borderRadius: 6,
  color: 'var(--admin-text)', outline: 'none', boxSizing: 'border-box',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--admin-text-dim)', textTransform: 'uppercase', letterSpacing: .3, marginBottom: 5 }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 10px', fontSize: 12, fontWeight: 600, borderRadius: 6,
      background: active ? 'color-mix(in oklch, var(--admin-accent) 20%, transparent)' : 'var(--admin-surface-2)',
      color: active ? 'var(--admin-accent)' : 'var(--admin-text)',
      border: '1px solid', borderColor: active ? 'var(--admin-accent)' : 'var(--admin-border)',
      cursor: 'pointer', textTransform: 'capitalize',
    }}>{children}</button>
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', fontSize: 12, fontWeight: 600,
      borderRadius: 6,
      background: checked ? 'color-mix(in oklch, var(--admin-accent) 20%, transparent)' : 'var(--admin-surface-2)',
      color: checked ? 'var(--admin-accent)' : 'var(--admin-text)',
      border: '1px solid', borderColor: checked ? 'var(--admin-accent)' : 'var(--admin-border)',
      cursor: 'pointer',
    }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ width: 12, height: 12 }} />
      {label}
    </label>
  )
}
