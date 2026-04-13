'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit2, ToggleLeft, ToggleRight, Zap } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────
interface Boost {
  id: string; status: string; amount_cents: number
  starts_at: string | null; expires_at: string | null; created_at: string
  user_email: string; user_name: string
  package_name: string; package_type: string
  listing_title: string | null; business_name: string | null
  event_title: string | null; route_name: string | null
}
interface BoostData {
  boosts: Boost[]; total: number; totalPages: number
  totalRevenueCents: number; monthlyRevenueCents: number
  activeCount: number; pendingCount: number
}
interface Package {
  id: number; type: string; name: string; description: string | null
  duration_days: number | null; price_cents: number
  is_active: boolean; display_order: number
}

// ─── Constants ───────────────────────────────────────────────────────────────
const STATUS_TABS = ['all', 'pending', 'active', 'expired', 'cancelled']

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  pending:   { bg: '#FEF9C3', color: '#854D0E' },
  active:    { bg: '#DCFCE7', color: '#166534' },
  expired:   { bg: 'var(--admin-surface-2)', color: 'var(--admin-text-dim)' },
  cancelled: { bg: '#FEE2E2', color: '#991B1B' },
  failed:    { bg: '#FEE2E2', color: '#991B1B' },
  refunded:  { bg: '#EDE9FE', color: '#5B21B6' },
}

const PACKAGE_TYPES = [
  { value: 'bump',          label: 'Bump Ad',             icon: '⚡', category: 'Listings' },
  { value: 'category_top',  label: 'Category Top',        icon: '⭐', category: 'Listings' },
  { value: 'homepage',      label: 'Homepage Feature',    icon: '🏠', category: 'Listings' },
  { value: 'directory',     label: 'Directory Featured',  icon: '🏪', category: 'Shops' },
  { value: 'event_feature', label: 'Event Feature',       icon: '📅', category: 'Events' },
  { value: 'route_feature', label: 'Route Feature',       icon: '🗺️', category: 'Routes' },
  { value: 'news_feature',  label: 'News Feature',        icon: '📰', category: 'News' },
]

const TYPE_META: Record<string, { icon: string; color: string; category: string }> = Object.fromEntries(
  PACKAGE_TYPES.map(t => [t.value, { icon: t.icon, color: 'var(--admin-text)', category: t.category }])
)

function fmtRand(cents: number) { return `R${(cents / 100).toFixed(2)}` }
function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

const CELL: React.CSSProperties = { padding: '10px 14px', textAlign: 'left' as const }
const TH:   React.CSSProperties = { ...CELL, fontSize: 11, fontWeight: 700, color: 'var(--admin-text-dim)', textTransform: 'uppercase' as const, letterSpacing: '.5px', background: 'var(--admin-surface-2)' }

// ─── Packages Tab ─────────────────────────────────────────────────────────────
function PackagesTab() {
  const [packages, setPackages]   = useState<Package[]>([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [editing, setEditing]     = useState<Package | null>(null)
  const [saving, setSaving]       = useState(false)
  const [form, setForm]           = useState({ type: 'bump', name: '', description: '', duration_days: '', price_cents: '', display_order: '99' })

  const load = () => {
    setLoading(true)
    fetch('/api/admin/boost-packages').then(r => r.json()).then(setPackages).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ type: 'bump', name: '', description: '', duration_days: '', price_cents: '', display_order: '99' })
    setShowForm(true)
  }

  const openEdit = (pkg: Package) => {
    setEditing(pkg)
    setForm({
      type:          pkg.type,
      name:          pkg.name,
      description:   pkg.description ?? '',
      duration_days: pkg.duration_days != null ? String(pkg.duration_days) : '',
      price_cents:   String(pkg.price_cents),
      display_order: String(pkg.display_order),
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      type:          form.type,
      name:          form.name,
      description:   form.description || null,
      duration_days: form.duration_days ? Number(form.duration_days) : null,
      price_cents:   Number(form.price_cents),
      display_order: Number(form.display_order),
    }
    const url    = editing ? `/api/admin/boost-packages/${editing.id}` : '/api/admin/boost-packages'
    const method = editing ? 'PATCH' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setSaving(false)
    setShowForm(false)
    load()
  }

  const toggleActive = async (pkg: Package) => {
    await fetch(`/api/admin/boost-packages/${pkg.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !pkg.is_active }),
    })
    load()
  }

  // Group by category
  const grouped = PACKAGE_TYPES.map(t => ({
    ...t,
    pkgs: packages.filter(p => p.type === t.value),
  })).filter(g => g.pkgs.length > 0)
  const allTypes = [...new Set(packages.map(p => p.type))]
  const ungrouped = packages.filter(p => !PACKAGE_TYPES.find(t => t.value === p.type))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--admin-text)' }}>Boost Packages</div>
          <div style={{ fontSize: 12, color: 'var(--admin-text-dim)', marginTop: 2 }}>{packages.length} packages · manage pricing and availability</div>
        </div>
        <button onClick={openCreate} style={{ height: 36, padding: '0 16px', background: 'var(--admin-text)', color: 'var(--admin-surface)', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> New Package
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--admin-surface)', borderRadius: 12, padding: 24, width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--admin-text)', marginBottom: 4 }}>{editing ? 'Edit Package' : 'New Boost Package'}</div>

            {[
              { label: 'Package Type', key: 'type', type: 'select' },
              { label: 'Name', key: 'name', type: 'text', placeholder: 'e.g. Homepage Feature – 7 days' },
              { label: 'Description', key: 'description', type: 'text', placeholder: 'Short description shown to users' },
              { label: 'Duration (days)', key: 'duration_days', type: 'number', placeholder: 'Leave blank for once-off' },
              { label: 'Price (cents)', key: 'price_cents', type: 'number', placeholder: 'e.g. 4900 = R49.00' },
              { label: 'Display Order', key: 'display_order', type: 'number', placeholder: '1 = first' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--admin-text)', textTransform: 'uppercase' as const, letterSpacing: '.04em', display: 'block', marginBottom: 5 }}>{field.label}</label>
                {field.type === 'select' ? (
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    style={{ width: '100%', padding: '9px 10px', border: '1.5px solid #e4e4e7', borderRadius: 6, fontSize: 13 }}>
                    {PACKAGE_TYPES.map(t => (
                      <optgroup key={t.category} label={t.category}>
                        <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                      </optgroup>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={form[field.key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    style={{ width: '100%', padding: '9px 10px', border: '1.5px solid #e4e4e7', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' as const }}
                  />
                )}
                {field.key === 'price_cents' && form.price_cents && (
                  <div style={{ fontSize: 11, color: '#059669', marginTop: 3, fontWeight: 600 }}>= {fmtRand(Number(form.price_cents))}</div>
                )}
              </div>
            ))}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
              <button onClick={() => setShowForm(false)} style={{ height: 36, padding: '0 16px', background: 'var(--admin-surface-2)', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.price_cents}
                style={{ height: 36, padding: '0 20px', background: 'var(--admin-text)', color: 'var(--admin-surface)', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: saving ? .6 : 1 }}>
                {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Package'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Package cards grouped */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--admin-text-dim)' }}>Loading…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {PACKAGE_TYPES.map(typeInfo => {
            const pkgs = packages.filter(p => p.type === typeInfo.value)
            if (!pkgs.length) return null
            return (
              <div key={typeInfo.value}>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--admin-text-dim)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {typeInfo.icon} {typeInfo.category} — {typeInfo.label}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {pkgs.map(pkg => (
                    <div key={pkg.id} style={{ background: 'var(--admin-surface)', border: `1.5px solid ${pkg.is_active ? 'var(--admin-border)' : 'var(--admin-border)'}`, borderRadius: 8, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, opacity: pkg.is_active ? 1 : .55 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)' }}>{pkg.name}</span>
                          {!pkg.is_active && <span style={{ fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 3, background: '#fee2e2', color: '#991b1b' }}>INACTIVE</span>}
                        </div>
                        {pkg.description && <div style={{ fontSize: 12, color: 'var(--admin-text-dim)', marginTop: 2 }}>{pkg.description}</div>}
                        <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 12, color: 'var(--admin-text-dim)' }}>
                          <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--admin-text)' }}>{fmtRand(pkg.price_cents)}</span>
                          {pkg.duration_days && <span>· {pkg.duration_days} days</span>}
                          <span>· order: {pkg.display_order}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button onClick={() => openEdit(pkg)} style={{ height: 30, width: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--admin-surface-2)', border: '1px solid #e4e4e7', borderRadius: 6, cursor: 'pointer' }}>
                          <Edit2 size={13} style={{ color: 'var(--admin-text)' }} />
                        </button>
                        <button onClick={() => toggleActive(pkg)} title={pkg.is_active ? 'Deactivate' : 'Activate'}
                          style={{ height: 30, width: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: pkg.is_active ? '#dcfce7' : 'var(--admin-surface-2)', border: `1px solid ${pkg.is_active ? '#bbf7d0' : 'var(--admin-border)'}`, borderRadius: 6, cursor: 'pointer' }}>
                          {pkg.is_active ? <ToggleRight size={15} style={{ color: '#166534' }} /> : <ToggleLeft size={15} style={{ color: 'var(--admin-text-dim)' }} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Boosts Tab ───────────────────────────────────────────────────────────────
function BoostsTab() {
  const [data, setData]     = useState<BoostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('all')
  const [page, setPage]     = useState(1)

  useEffect(() => {
    setLoading(true)
    const p = new URLSearchParams({ status, page: page.toString() })
    fetch(`/api/admin/boosts?${p}`).then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false))
  }, [status, page])

  const handleTab = (tab: string) => { setStatus(tab); setPage(1) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Revenue',  value: data ? fmtRand(data.totalRevenueCents)  : '—', color: 'var(--admin-text)' },
          { label: 'This Month',     value: data ? fmtRand(data.monthlyRevenueCents): '—', color: '#059669' },
          { label: 'Active Boosts',  value: data ? String(data.activeCount)         : '—', color: '#2563EB' },
          { label: 'Pending',        value: data ? String(data.pendingCount)         : '—', color: '#D97706' },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--admin-surface)', borderRadius: 10, border: '1px solid #ebebeb', padding: '16px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--admin-text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #ebebeb', marginBottom: 20 }}>
        {STATUS_TABS.map(tab => (
          <button key={tab} onClick={() => handleTab(tab)} style={{ padding: '8px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: status === tab ? 700 : 500, color: status === tab ? 'var(--admin-text)' : 'var(--admin-text-dim)', borderBottom: status === tab ? '2px solid #0D1B2A' : '2px solid transparent', marginBottom: -1, textTransform: 'capitalize' }}>
            {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--admin-surface)', borderRadius: 10, border: '1px solid #ebebeb', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--admin-text-dim)' }}>Loading…</div>
        ) : !data?.boosts?.length ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--admin-text-dim)' }}>No boosts found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ebebeb' }}>
                  {['ID', 'User', 'Package', 'Target', 'Status', 'Amount', 'Expires'].map(h => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.boosts.map((b, i) => {
                  const badge  = STATUS_BADGE[b.status] ?? { bg: 'var(--admin-surface-2)', color: 'var(--admin-text-dim)' }
                  const meta   = TYPE_META[b.package_type]
                  const bAny = b as unknown as Record<string,unknown>
                  const target = b.listing_title || b.business_name || bAny.event_title as string || bAny.route_name as string || '—'
                  return (
                    <tr key={b.id} style={{ borderBottom: i < data.boosts.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                      <td style={CELL}><span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--admin-text-dim)' }}>{b.id.slice(0, 8)}</span></td>
                      <td style={CELL}>
                        <div style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{b.user_email}</div>
                        {b.user_name && <div style={{ fontSize: 11, color: 'var(--admin-text-dim)' }}>{b.user_name}</div>}
                      </td>
                      <td style={CELL}>
                        <div style={{ fontWeight: 600 }}>{b.package_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--admin-text-dim)' }}>{meta?.icon} {meta?.category ?? b.package_type}</div>
                      </td>
                      <td style={{ ...CELL, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(target)}</td>
                      <td style={CELL}><span style={{ padding: '3px 10px', borderRadius: 20, background: badge.bg, color: badge.color, fontSize: 11, fontWeight: 700 }}>{b.status}</span></td>
                      <td style={{ ...CELL, fontWeight: 700 }}>{fmtRand(b.amount_cents)}</td>
                      <td style={{ ...CELL, color: 'var(--admin-text-dim)' }}>{fmtDate(b.expires_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #ebebeb', background: page === 1 ? 'var(--admin-surface-2)' : 'var(--admin-surface)', cursor: page === 1 ? 'default' : 'pointer', fontSize: 13 }}>
            ← Prev
          </button>
          <span style={{ padding: '6px 14px', fontSize: 13, color: 'var(--admin-text-dim)' }}>Page {page} of {data.totalPages}</span>
          <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}
            style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #ebebeb', background: page === data.totalPages ? 'var(--admin-surface-2)' : 'var(--admin-surface)', cursor: page === data.totalPages ? 'default' : 'pointer', fontSize: 13 }}>
            Next →
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function BoostsPage() {
  const [view, setView] = useState<'boosts' | 'packages'>('boosts')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--admin-text)', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={20} style={{ color: '#F59E0B' }} /> Boosts
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--admin-text-dim)' }}>Manage boost transactions and pricing packages</p>
        </div>
        {/* View switcher */}
        <div style={{ display: 'flex', background: 'var(--admin-surface-2)', borderRadius: 8, padding: 3 }}>
          {[{ id: 'boosts', label: 'Transactions' }, { id: 'packages', label: 'Packages' }].map(v => (
            <button key={v.id} onClick={() => setView(v.id as 'boosts' | 'packages')}
              style={{ padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: view === v.id ? 'var(--admin-surface)' : 'transparent', color: view === v.id ? 'var(--admin-text)' : 'var(--admin-text-dim)', boxShadow: view === v.id ? '0 1px 3px rgba(0,0,0,.1)' : 'none', transition: 'all .12s' }}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {view === 'boosts'    && <BoostsTab />}
      {view === 'packages'  && <PackagesTab />}
    </div>
  )
}
