'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Edit2, Trash2 } from 'lucide-react'

interface AdminRoute {
  id: string; slug: string; name: string; discipline: string; difficulty: string
  province: string; town: string; distance_km: number; status: string
  is_featured: boolean; hero_image_url: string | null; image_count_live: number
  created_at: string
}

const DISCIPLINE_COLORS: Record<string, { bg: string; color: string }> = {
  road:        { bg: '#EFF6FF', color: '#1D4ED8' },
  mtb:         { bg: '#F0FDF4', color: '#166534' },
  gravel:      { bg: '#FFF7ED', color: '#9A3412' },
  urban:       { bg: '#F5F3FF', color: '#6D28D9' },
  bikepacking: { bg: '#FEF9C3', color: '#854D0E' },
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  approved: { bg: '#F0FDF4', color: '#166534' },
  pending:  { bg: '#FFF7ED', color: '#9A3412' },
  rejected: { bg: '#FEF2F2', color: '#991B1B' },
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
  const [status, setStatus] = useState('all')
  const [discipline, setDiscipline] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchRoutes = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status, discipline, page: String(page), limit: '20' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/routes?${params}`)
      const data = await res.json()
      setRoutes(data.routes || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchRoutes() }, [status, discipline, page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchRoutes()
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete route "${name}"? This will also delete all its images.`)) return
    setDeletingId(id)
    try {
      await fetch(`/api/admin/routes/${id}`, { method: 'DELETE' })
      setRoutes(prev => prev.filter(r => r.id !== id))
    } finally { setDeletingId(null) }
  }

  const handleStatusToggle = async (route: AdminRoute) => {
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
    } finally { setTogglingId(null) }
  }

  const pill = (label: string, colors: { bg: string; color: string }, onClick?: () => void, disabled?: boolean) => (
    <span
      onClick={disabled ? undefined : onClick}
      style={{
        padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
        background: colors.bg, color: colors.color,
        cursor: onClick && !disabled ? 'pointer' : 'default',
        userSelect: 'none',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </span>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', margin: '0 0 4px' }}>Routes</h1>
            <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>{total} routes total</p>
          </div>
          <Link href="/admin/routes/new"
            style={{ padding: '8px 18px', background: '#0D1B2A', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            + Add Route
          </Link>
        </div>

        {/* Search + filters */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebeb', padding: '16px 20px', marginBottom: 16 }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name, province, town…"
              style={{ flex: 1, minWidth: 200, padding: '8px 12px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 13 }}
            />
            <button type="submit"
              style={{ padding: '8px 16px', background: '#0D1B2A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Search
            </button>
          </form>
        </div>

        {/* Status tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {['all', 'approved', 'pending', 'rejected'].map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1) }}
              style={{ padding: '7px 16px', borderRadius: 8, border: '1.5px solid', borderColor: status === s ? '#0D1B2A' : '#e4e4e7', background: status === s ? '#0D1B2A' : '#fff', color: status === s ? '#fff' : '#1a1a1a', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          {/* Discipline filter */}
          <select value={discipline} onChange={e => { setDiscipline(e.target.value); setPage(1) }}
            style={{ padding: '7px 12px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 13, background: '#fff', cursor: 'pointer' }}>
            <option value="all">All Disciplines</option>
            <option value="road">Road</option>
            <option value="mtb">MTB</option>
            <option value="gravel">Gravel</option>
            <option value="urban">Urban</option>
            <option value="bikepacking">Bikepacking</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9a9a9a' }}>Loading…</div>
        ) : routes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', background: '#fff', borderRadius: 12, border: '1px solid #ebebeb' }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>No routes found</p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebeb', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #ebebeb' }}>
                  <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#6b7280', textAlign: 'left', width: 52 }}>IMG</th>
                  <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#6b7280', textAlign: 'left' }}>NAME</th>
                  <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#6b7280', textAlign: 'left' }}>DISCIPLINE</th>
                  <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#6b7280', textAlign: 'left' }}>DIFFICULTY</th>
                  <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#6b7280', textAlign: 'left' }}>PROVINCE</th>
                  <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#6b7280', textAlign: 'right' }}>KM</th>
                  <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#6b7280', textAlign: 'center' }}>IMGS</th>
                  <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#6b7280', textAlign: 'left' }}>STATUS</th>
                  <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#6b7280', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: i < routes.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <td style={{ padding: '10px 12px' }}>
                      {r.hero_image_url ? (
                        <img src={r.hero_image_url} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid #ebebeb' }} />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: 6, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🚴</div>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{r.name}</div>
                      {r.town && <div style={{ fontSize: 12, color: '#9a9a9a' }}>{r.town}</div>}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {r.discipline && pill(r.discipline, DISCIPLINE_COLORS[r.discipline] || { bg: '#f0f0f0', color: '#333' })}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {r.difficulty && <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>{r.difficulty}</span>}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 13, color: '#6b7280' }}>{r.province || '—'}</td>
                    <td style={{ padding: '10px 12px', fontSize: 13, color: '#6b7280', textAlign: 'right' }}>
                      {r.distance_km != null ? `${r.distance_km}` : '—'}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{ padding: '2px 7px', background: r.image_count_live > 0 ? '#E9ECF5' : '#f0f0f0', color: r.image_count_live > 0 ? '#0D1B2A' : '#9a9a9a', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                        {r.image_count_live}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {pill(r.status, STATUS_COLORS[r.status] || { bg: '#f0f0f0', color: '#333' },
                        () => handleStatusToggle(r), togglingId === r.id)}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <Link href={`/admin/routes/${r.id}/edit`}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', border: '1.5px solid #e4e4e7', borderRadius: 7, fontSize: 12, fontWeight: 600, color: '#1a1a1a', textDecoration: 'none' }}>
                          <Edit2 size={12} /> Edit
                        </Link>
                        <button onClick={() => handleDelete(r.id, r.name)} disabled={deletingId === r.id}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: '#FEF2F2', color: '#991B1B', opacity: deletingId === r.id ? 0.5 : 1 }}>
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: '7px 16px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: page === 1 ? 'default' : 'pointer', background: '#fff', color: '#1a1a1a', opacity: page === 1 ? 0.4 : 1 }}>
              ← Prev
            </button>
            <span style={{ fontSize: 13, color: '#6b7280' }}>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ padding: '7px 16px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: page === totalPages ? 'default' : 'pointer', background: '#fff', color: '#1a1a1a', opacity: page === totalPages ? 0.4 : 1 }}>
              Next →
            </button>
          </div>
        )}
    </div>
  )
}
