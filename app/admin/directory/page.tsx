'use client'

import { useEffect, useState, useCallback } from 'react'
import { Check, Star, Trash2, Camera, X } from 'lucide-react'
import {
  PageHeader, Table, StatusPill, Button, Empty,
} from '@/components/admin/primitives'

interface Business {
  id: string
  name: string
  logo_url: string
  cover_url?: string
  business_type: string
  province: string
  city: string
  is_verified: boolean
  is_premium: boolean
  views_count: number
}

const TYPE_CONFIG: Record<string, { label: string; emoji: string }> = {
  all:             { label: 'All',              emoji: '🏢' },
  shop:            { label: 'Shops',            emoji: '🛒' },
  brand:           { label: 'Brands',           emoji: '🏷️' },
  service_center:  { label: 'Service Centres',  emoji: '🔧' },
  tour_operator:   { label: 'Tour Operators',   emoji: '🗺️' },
  event_organiser: { label: 'Event Organisers', emoji: '🏁' },
}

export default function DirectoryPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [typeFilter, setTypeFilter] = useState('all')
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingLogoBuf, setEditingLogoBuf] = useState<string | null>(null)
  const [editingCoverBuf, setEditingCoverBuf] = useState<string | null>(null)
  const [uploadLoading, setUploadLoading] = useState(false)

  const fetchBusinesses = useCallback(async (p: number, type: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: p.toString(), type })
      const res = await fetch(`/api/admin/directory?${params}`)
      const data = await res.json()
      setBusinesses(data.businesses || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotalCount(data.pagination?.totalCount || 0)
      if (data.counts) setCounts(data.counts)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBusinesses(page, typeFilter) }, [page, typeFilter, fetchBusinesses])

  async function handleAction(id: string, action: string) {
    setActionLoading(id)
    try {
      await fetch(`/api/admin/directory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      await fetchBusinesses(page, typeFilter)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleFileUpload(file: File, kind: 'logo' | 'cover') {
    setUploadLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/directory/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const data = await res.json()
        if (kind === 'logo') setEditingLogoBuf(data.url)
        else setEditingCoverBuf(data.url)
      }
    } finally {
      setUploadLoading(false)
    }
  }

  async function handleSaveImages(id: string) {
    setUploadLoading(true)
    try {
      const business = businesses.find(b => b.id === id)
      await fetch(`/api/admin/directory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logo_url: editingLogoBuf ?? business?.logo_url,
          cover_url: editingCoverBuf ?? business?.cover_url,
        }),
      })
      await fetchBusinesses(page, typeFilter)
      closeEditModal()
    } finally {
      setUploadLoading(false)
    }
  }

  function openEditModal(b: Business) {
    setEditingId(b.id)
    setEditingLogoBuf(b.logo_url || null)
    setEditingCoverBuf(b.cover_url || null)
  }
  function closeEditModal() {
    setEditingId(null)
    setEditingLogoBuf(null)
    setEditingCoverBuf(null)
  }
  const editingBusiness = businesses.find(b => b.id === editingId)

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '8px 14px',
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid var(--admin-accent)' : '2px solid transparent',
    color: active ? 'var(--admin-accent)' : 'var(--admin-text-dim)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    whiteSpace: 'nowrap',
  })

  const rows = businesses.map(b => ({
    id: b.id,
    cells: [
      <div key="n" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 6, flexShrink: 0,
          background: b.logo_url ? `url(${b.logo_url}) center/cover` : 'var(--admin-surface-2)',
          border: '1px solid var(--admin-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--admin-text)', fontSize: 12, fontWeight: 700,
        }}>
          {!b.logo_url && b.name[0]}
        </div>
        <span style={{ fontWeight: 600 }}>{b.name}</span>
      </div>,
      <StatusPill key="t" label={`${TYPE_CONFIG[b.business_type]?.emoji || ''} ${b.business_type.replace(/_/g, ' ')}`} tone="neutral" />,
      <span key="c" style={{ color: 'var(--admin-text-dim)' }}>{b.city || '—'}</span>,
      <span key="p" style={{ color: 'var(--admin-text-dim)' }}>{b.province || '—'}</span>,
      b.is_premium
        ? <StatusPill key="pr" label="Premium" tone="accent" />
        : <StatusPill key="pr" label="Standard" tone="neutral" />,
      b.is_verified
        ? <StatusPill key="v" label="Verified" tone="success" />
        : <span key="v" style={{ color: 'var(--admin-text-dim)' }}>—</span>,
      <span key="vi">{Number(b.views_count || 0).toLocaleString()}</span>,
      <div key="a" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <Button variant="ghost" size="sm" onClick={() => openEditModal(b)} disabled={!!actionLoading}>
          <Camera size={12} /> Images
        </Button>
        <Button variant={b.is_premium ? 'ghost' : 'primary'} size="sm" onClick={() => handleAction(b.id, b.is_premium ? 'unfeature' : 'feature')} disabled={!!actionLoading}>
          <Star size={12} /> {b.is_premium ? 'Unfeature' : 'Feature'}
        </Button>
        {!b.is_verified && (
          <Button variant="primary" size="sm" onClick={() => handleAction(b.id, 'verify')} disabled={!!actionLoading}>
            <Check size={12} /> Verify
          </Button>
        )}
        <Button variant="danger" size="sm" onClick={() => handleAction(b.id, 'delete')} disabled={!!actionLoading}>
          <Trash2 size={12} />
        </Button>
      </div>,
    ],
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Business Directory"
        subtitle={totalCount > 0
          ? `${totalCount.toLocaleString()} ${typeFilter !== 'all' ? TYPE_CONFIG[typeFilter]?.label.toLowerCase() : 'businesses'}`
          : 'Manage businesses in the cycling directory'}
      />

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', borderBottom: '1px solid var(--admin-border)' }}>
        {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
          const count = key === 'all'
            ? Object.entries(counts).filter(([k]) => k !== 'all').reduce((s, [, v]) => s + v, 0)
            : counts[key] || 0
          const active = typeFilter === key
          return (
            <button key={key} onClick={() => { setTypeFilter(key); setPage(1) }} style={tabBtn(active)}>
              <span>{cfg.emoji}</span>{cfg.label}
              {count > 0 && (
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 10,
                  background: active ? 'var(--admin-accent)' : 'var(--admin-surface-2)',
                  color: active ? '#fff' : 'var(--admin-text-dim)',
                }}>{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {loading ? (
        <Empty message="Loading businesses…" />
      ) : (
        <Table
          head={['Name', 'Type', 'City', 'Province', 'Premium', 'Verified', 'Views', 'Actions']}
          rows={rows}
          empty={`No ${typeFilter !== 'all' ? TYPE_CONFIG[typeFilter]?.label.toLowerCase() : 'businesses'} found`}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>← Prev</Button>
        <span style={{ fontSize: 12, color: 'var(--admin-text-dim)' }}>Page {page} of {totalPages}</span>
        <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next →</Button>
      </div>

      {editingId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={closeEditModal}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--admin-surface)',
            border: '1px solid var(--admin-border)',
            borderRadius: 12, padding: 24, maxWidth: 480, width: '90%', maxHeight: '85vh', overflow: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--admin-text)', margin: 0 }}>Edit Images</h2>
                <p style={{ fontSize: 12, color: 'var(--admin-text-dim)', margin: '4px 0 0' }}>{editingBusiness?.name}</p>
              </div>
              <button onClick={closeEditModal} style={{ background: 'none', border: 'none', color: 'var(--admin-text-dim)', cursor: 'pointer', padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--admin-text-dim)', textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 8 }}>Logo</div>
              <div style={{ height: 100, background: 'var(--admin-surface-2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 8, border: '1px solid var(--admin-border)' }}>
                {editingLogoBuf ? <img src={editingLogoBuf} alt="logo" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} /> : <span style={{ color: 'var(--admin-text-dim)', fontSize: 13 }}>No logo</span>}
              </div>
              <input type="file" id="logo-input" accept="image/jpeg,image/png,image/webp"
                onChange={e => { const f = e.currentTarget.files?.[0]; if (f) handleFileUpload(f, 'logo') }} style={{ display: 'none' }} />
              <Button variant="ghost" size="sm" onClick={() => document.getElementById('logo-input')?.click()} disabled={uploadLoading}>
                {uploadLoading ? 'Uploading…' : 'Choose Logo'}
              </Button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--admin-text-dim)', textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 8 }}>Cover Image</div>
              <div style={{ height: 140, background: 'var(--admin-surface-2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 8, border: '1px solid var(--admin-border)' }}>
                {editingCoverBuf ? <img src={editingCoverBuf} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'var(--admin-text-dim)', fontSize: 13 }}>No cover</span>}
              </div>
              <input type="file" id="cover-input" accept="image/jpeg,image/png,image/webp"
                onChange={e => { const f = e.currentTarget.files?.[0]; if (f) handleFileUpload(f, 'cover') }} style={{ display: 'none' }} />
              <Button variant="ghost" size="sm" onClick={() => document.getElementById('cover-input')?.click()} disabled={uploadLoading}>
                {uploadLoading ? 'Uploading…' : 'Choose Cover'}
              </Button>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="primary" onClick={() => handleSaveImages(editingId)} disabled={uploadLoading}>Save</Button>
              <Button variant="ghost" onClick={closeEditModal}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
