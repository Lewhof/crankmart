'use client'

import { useEffect, useState } from 'react'
import { Check, Star, Trash2, Camera, X } from 'lucide-react'

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

const TYPE_CONFIG: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  all:             { label: 'All',              emoji: '🏢', color: '#374151', bg: '#F3F4F6' },
  shop:            { label: 'Shops',            emoji: '🛒', color: '#1D4ED8', bg: '#EFF6FF' },
  brand:           { label: 'Brands',           emoji: '🏷️',  color: '#7C3AED', bg: '#F5F3FF' },
  service_center:  { label: 'Service Centres',  emoji: '🔧', color: '#065F46', bg: '#D1FAE5' },
  tour_operator:   { label: 'Tour Operators',   emoji: '🗺️',  color: '#92400E', bg: '#FEF3C7' },
  event_organiser: { label: 'Event Organisers', emoji: '🏁', color: '#9F1239', bg: '#FFF1F2' },
}

export default function DirectoryPage() {
  const [businesses, setBusinesses]       = useState<Business[]>([])
  const [loading, setLoading]             = useState(true)
  const [page, setPage]                   = useState(1)
  const [totalPages, setTotalPages]       = useState(1)
  const [totalCount, setTotalCount]       = useState(0)
  const [typeFilter, setTypeFilter]       = useState('all')
  const [counts, setCounts]               = useState<Record<string, number>>({})
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [editingId, setEditingId]         = useState<string | null>(null)
  const [editingLogoBuf, setEditingLogoBuf]   = useState<string | null>(null)
  const [editingCoverBuf, setEditingCoverBuf] = useState<string | null>(null)
  const [uploadLoading, setUploadLoading] = useState(false)

  const fetchBusinesses = async (p = page, type = typeFilter) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: p.toString(), type })
      const res  = await fetch(`/api/admin/directory?${params}`)
      const data = await res.json()
      setBusinesses(data.businesses || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotalCount(data.pagination?.totalCount || 0)
      if (data.counts) setCounts(data.counts)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBusinesses(page, typeFilter) }, [page, typeFilter])

  const handleTabChange = (type: string) => {
    setTypeFilter(type)
    setPage(1)
  }

  const handleAction = async (id: string, action: string) => {
    setActionLoading(id)
    try {
      await fetch(`/api/admin/directory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      await fetchBusinesses(page, typeFilter)
    } catch (e) { console.error(e) }
    finally { setActionLoading(null) }
  }

  const handleFileUpload = async (file: File, type: 'logo' | 'cover') => {
    setUploadLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/directory/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const data = await res.json()
        if (type === 'logo') setEditingLogoBuf(data.url)
        else setEditingCoverBuf(data.url)
      }
    } catch (e) { console.error(e) }
    finally { setUploadLoading(false) }
  }

  const handleSaveImages = async (id: string) => {
    setUploadLoading(true)
    try {
      const business = businesses.find(b => b.id === id)
      await fetch(`/api/admin/directory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logo_url:  editingLogoBuf  ?? business?.logo_url,
          cover_url: editingCoverBuf ?? business?.cover_url,
        }),
      })
      await fetchBusinesses(page, typeFilter)
      closeEditModal()
    } catch (e) { console.error(e) }
    finally { setUploadLoading(false) }
  }

  const openEditModal = (b: Business) => {
    setEditingId(b.id)
    setEditingLogoBuf(b.logo_url || null)
    setEditingCoverBuf(b.cover_url || null)
  }

  const closeEditModal = () => {
    setEditingId(null)
    setEditingLogoBuf(null)
    setEditingCoverBuf(null)
  }

  const editingBusiness = businesses.find(b => b.id === editingId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', margin: '0 0 4px' }}>Business Directory</h1>
        <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>{totalCount > 0 ? `${totalCount.toLocaleString()} ${typeFilter !== 'all' ? TYPE_CONFIG[typeFilter]?.label.toLowerCase() : 'businesses'}` : 'Manage businesses in the cycling directory'}</p>
      </div>

      {/* Type tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', borderBottom: '2px solid #ebebeb', paddingBottom: 0 }}>
        {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
          const count = key === 'all'
            ? Object.entries(counts).filter(([k]) => k !== 'all').reduce((s, [, v]) => s + v, 0)
            : counts[key] || 0
          const active = typeFilter === key
          return (
            <button key={key} onClick={() => handleTabChange(key)}
              style={{
                padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                background: 'none', border: 'none',
                borderBottom: active ? '2px solid #0D1B2A' : '2px solid transparent',
                color: active ? '#0D1B2A' : '#9a9a9a',
                marginBottom: -2,
                display: 'flex', alignItems: 'center', gap: 6,
                whiteSpace: 'nowrap',
              }}>
              <span>{cfg.emoji}</span>
              {cfg.label}
              {count > 0 && (
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 10,
                  background: active ? '#0D1B2A' : '#f0f0f0',
                  color: active ? '#fff' : '#6b7280',
                }}>{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 8, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
            <div style={{ width: 28, height: 28, border: '3px solid #ebebeb', borderTopColor: '#0D1B2A', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
            <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
          </div>
        ) : businesses.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9a9a9a', fontSize: 14 }}>
            No {typeFilter !== 'all' ? TYPE_CONFIG[typeFilter]?.label.toLowerCase() : 'businesses'} found
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#fafafa', borderBottom: '2px solid #f0f0f0' }}>
                    {['Name', 'Type', 'City', 'Province', 'Premium', 'Verified', 'Views', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {businesses.map(b => {
                    const typeCfg = TYPE_CONFIG[b.business_type] || TYPE_CONFIG.all
                    return (
                      <tr key={b.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                        {/* Name */}
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: 6, flexShrink: 0,
                              background: b.logo_url ? `url(${b.logo_url}) center/cover` : '#0D1B2A',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontSize: 13, fontWeight: 700,
                            }}>
                              {!b.logo_url && b.name[0]}
                            </div>
                            <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{b.name}</span>
                          </div>
                        </td>
                        {/* Type badge */}
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                            background: typeCfg.bg, color: typeCfg.color,
                            whiteSpace: 'nowrap',
                          }}>
                            {typeCfg.emoji} {b.business_type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', color: '#374151' }}>{b.city || '—'}</td>
                        <td style={{ padding: '12px 14px', color: '#374151' }}>{b.province || '—'}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                            background: b.is_premium ? '#EFF6FF' : '#F3F4F6',
                            color: b.is_premium ? '#1D4ED8' : '#6B7280',
                          }}>
                            {b.is_premium ? '⭐ Premium' : 'Standard'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          {b.is_verified
                            ? <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: '#D1FAE5', color: '#065F46' }}>✓ Verified</span>
                            : <span style={{ color: '#d1d5db', fontSize: 12 }}>—</span>
                          }
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0D1B2A' }}>
                          {Number(b.views_count || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <button onClick={() => openEditModal(b)} disabled={!!actionLoading}
                              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, border: '1.5px solid #e4e4e7', background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#374151' }}>
                              <Camera size={12} /> Images
                            </button>
                            <button onClick={() => handleAction(b.id, b.is_premium ? 'unfeature' : 'feature')} disabled={!!actionLoading}
                              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, border: 'none', background: b.is_premium ? '#FEF3C7' : '#EFF6FF', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: b.is_premium ? '#92400E' : '#1D4ED8' }}>
                              <Star size={12} /> {b.is_premium ? 'Unfeature' : 'Feature'}
                            </button>
                            {!b.is_verified && (
                              <button onClick={() => handleAction(b.id, 'verify')} disabled={!!actionLoading}
                                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, border: 'none', background: '#D1FAE5', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#065F46' }}>
                                <Check size={12} /> Verify
                              </button>
                            )}
                            <button onClick={() => handleAction(b.id, 'delete')} disabled={!!actionLoading}
                              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, border: 'none', background: '#FEE2E2', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#991B1B' }}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ padding: '14px 16px', borderTop: '1px solid #ebebeb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}
                style={{ padding: '7px 16px', borderRadius: 6, border: '1.5px solid #e4e4e7', background: page === 1 ? '#f5f5f5' : '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, opacity: page === 1 ? 0.5 : 1 }}>
                ← Prev
              </button>
              <span style={{ fontSize: 13, color: '#9a9a9a' }}>Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                style={{ padding: '7px 16px', borderRadius: 6, border: '1.5px solid #e4e4e7', background: page === totalPages ? '#f5f5f5' : '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, opacity: page === totalPages ? 0.5 : 1 }}>
                Next →
              </button>
            </div>
          </>
        )}
      </div>

      {/* Edit Images Modal */}
      {editingId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={closeEditModal}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, maxWidth: 480, width: '90%', maxHeight: '85vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Edit Images</h2>
                <p style={{ fontSize: 12, color: '#9a9a9a', margin: '4px 0 0' }}>{editingBusiness?.name}</p>
              </div>
              <button onClick={closeEditModal} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={20} /></button>
            </div>

            {/* Logo */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Logo</div>
              <div style={{ height: 100, background: '#f5f5f5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 8 }}>
                {editingLogoBuf
                  ? <img src={editingLogoBuf} alt="logo" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  : <span style={{ color: '#9a9a9a', fontSize: 13 }}>No logo</span>}
              </div>
              <input type="file" id="logo-input" accept="image/jpeg,image/png,image/webp" onChange={e => { const f = e.currentTarget.files?.[0]; if (f) handleFileUpload(f, 'logo') }} style={{ display: 'none' }} />
              <button onClick={() => document.getElementById('logo-input')?.click()} disabled={uploadLoading}
                style={{ width: '100%', padding: '9px', borderRadius: 8, border: '1.5px solid #e4e4e7', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                {uploadLoading ? 'Uploading…' : 'Choose Logo'}
              </button>
            </div>

            {/* Cover */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Cover Image</div>
              <div style={{ height: 140, background: '#f5f5f5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 8 }}>
                {editingCoverBuf
                  ? <img src={editingCoverBuf} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ color: '#9a9a9a', fontSize: 13 }}>No cover</span>}
              </div>
              <input type="file" id="cover-input" accept="image/jpeg,image/png,image/webp" onChange={e => { const f = e.currentTarget.files?.[0]; if (f) handleFileUpload(f, 'cover') }} style={{ display: 'none' }} />
              <button onClick={() => document.getElementById('cover-input')?.click()} disabled={uploadLoading}
                style={{ width: '100%', padding: '9px', borderRadius: 8, border: '1.5px solid #e4e4e7', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                {uploadLoading ? 'Uploading…' : 'Choose Cover'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => handleSaveImages(editingId)} disabled={uploadLoading}
                style={{ flex: 1, padding: '10px', background: '#0D1B2A', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, opacity: uploadLoading ? 0.6 : 1 }}>
                Save
              </button>
              <button onClick={closeEditModal}
                style={{ flex: 1, padding: '10px', background: '#f3f4f6', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
