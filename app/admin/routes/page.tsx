'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Edit2, Trash2, Plus } from 'lucide-react'
import {
  PageHeader, Table, StatusPill, Button, Empty,
} from '@/components/admin/primitives'
import { toneForStatus } from '@/components/admin/tone'

interface AdminRoute {
  id: string; slug: string; name: string; discipline: string; difficulty: string
  province: string; town: string; distance_km: number; status: string
  is_featured: boolean; hero_image_url: string | null; image_count_live: number
  created_at: string
}

const STATUS_CYCLE: Record<string, string> = {
  approved: 'pending',
  pending: 'rejected',
  rejected: 'approved',
}

export default function AdminRoutesPage() {
  const [routes, setRoutes] = useState<AdminRoute[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [status, setStatus] = useState('all')
  const [discipline, setDiscipline] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchRoutes = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status, discipline, page: String(page), limit: '20' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/routes?${params}`)
      const data = await res.json()
      setRoutes(data.routes || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } finally {
      setLoading(false)
    }
  }, [status, discipline, page, search])

  useEffect(() => { fetchRoutes() }, [fetchRoutes])

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete route "${name}"? This will also delete all its images.`)) return
    setDeletingId(id)
    try {
      await fetch(`/api/admin/routes/${id}`, { method: 'DELETE' })
      setRoutes(prev => prev.filter(r => r.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  async function handleStatusToggle(route: AdminRoute) {
    const nextStatus = STATUS_CYCLE[route.status] || 'pending'
    setTogglingId(route.id)
    try {
      const res = await fetch(`/api/admin/routes/${route.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (res.ok) {
        setRoutes(prev => prev.map(r => r.id === route.id ? { ...r, status: nextStatus } : r))
      }
    } finally {
      setTogglingId(null)
    }
  }

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px',
    borderRadius: 6,
    border: '1px solid',
    borderColor: active ? 'var(--admin-accent)' : 'var(--admin-border)',
    background: active ? 'color-mix(in oklch, var(--admin-accent) 20%, transparent)' : 'var(--admin-surface-2)',
    color: active ? 'var(--admin-accent)' : 'var(--admin-text)',
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
  })

  const inputStyle: React.CSSProperties = {
    padding: '7px 12px',
    border: '1px solid var(--admin-border)',
    background: 'var(--admin-surface-2)',
    color: 'var(--admin-text)',
    borderRadius: 6, fontSize: 13,
  }

  const rows = routes.map(r => ({
    id: r.id,
    cells: [
      r.hero_image_url
        ? <img key="i" src={r.hero_image_url} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--admin-border)' }} />
        : <div key="i" style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🚴</div>,
      <div key="n">
        <div style={{ fontWeight: 600 }}>{r.name}</div>
        {r.town && <div style={{ fontSize: 11, color: 'var(--admin-text-dim)' }}>{r.town}</div>}
      </div>,
      r.discipline ? <StatusPill key="d" label={r.discipline} tone="neutral" /> : <span key="d" style={{ color: 'var(--admin-text-dim)' }}>—</span>,
      <span key="df" style={{ color: 'var(--admin-text-dim)' }}>{r.difficulty || '—'}</span>,
      <span key="p" style={{ color: 'var(--admin-text-dim)' }}>{r.province || '—'}</span>,
      <span key="km">{r.distance_km != null ? `${r.distance_km}` : '—'}</span>,
      <StatusPill key="img" label={String(r.image_count_live)} tone={r.image_count_live > 0 ? 'accent' : 'neutral'} />,
      <button
        key="s"
        onClick={() => handleStatusToggle(r)}
        disabled={togglingId === r.id}
        style={{ background: 'none', border: 'none', padding: 0, cursor: togglingId === r.id ? 'default' : 'pointer', opacity: togglingId === r.id ? 0.5 : 1 }}
        title="Click to cycle status"
      >
        <StatusPill label={r.status} tone={toneForStatus(r.status)} />
      </button>,
      <div key="a" style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        <Button variant="ghost" size="sm" href={`/admin/routes/${r.id}/edit`}>
          <Edit2 size={12} /> Edit
        </Button>
        <Button variant="danger" size="sm" onClick={() => handleDelete(r.id, r.name)} disabled={deletingId === r.id}>
          <Trash2 size={12} />
        </Button>
      </div>,
    ],
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Routes"
        subtitle={`${total} route${total !== 1 ? 's' : ''} total`}
        actions={
          <Link
            href="/admin/routes/new"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600,
              background: 'var(--admin-accent)', color: '#fff',
              border: '1px solid var(--admin-accent)', textDecoration: 'none',
            }}
          >
            <Plus size={14} /> Add Route
          </Link>
        }
      />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <form
          onSubmit={e => { e.preventDefault(); setSearch(searchInput); setPage(1) }}
          style={{ display: 'flex', gap: 6, flex: 1, minWidth: 220 }}
        >
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search name, province, town…"
            style={{ ...inputStyle, flex: 1 }}
          />
          <Button variant="primary" size="sm" onClick={() => { setSearch(searchInput); setPage(1) }}>Search</Button>
          {search && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setSearchInput(''); setPage(1) }}>Clear</Button>
          )}
        </form>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', 'approved', 'pending', 'rejected'].map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1) }} style={tabBtn(status === s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <select
          value={discipline}
          onChange={e => { setDiscipline(e.target.value); setPage(1) }}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          <option value="all">All Disciplines</option>
          <option value="road">Road</option>
          <option value="mtb">MTB</option>
          <option value="gravel">Gravel</option>
          <option value="urban">Urban</option>
          <option value="bikepacking">Bikepacking</option>
        </select>
      </div>

      {loading ? (
        <Empty message="Loading routes…" />
      ) : (
        <Table
          head={['Img', 'Name', 'Discipline', 'Difficulty', 'Province', 'Km', 'Imgs', 'Status', 'Actions']}
          rows={rows}
          empty="No routes found"
        />
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>← Prev</Button>
          <span style={{ fontSize: 12, color: 'var(--admin-text-dim)' }}>Page {page} of {totalPages}</span>
          <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next →</Button>
        </div>
      )}
    </div>
  )
}
