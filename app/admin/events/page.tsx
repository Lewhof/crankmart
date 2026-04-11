'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Check, X, Star, Eye, Search, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'

interface AdminEvent {
  id: string
  title: string
  slug: string
  event_type: string
  discipline: string
  city: string
  province: string
  event_date_start: string
  event_date_end: string
  entry_fee: string
  distance: string
  organiser_name: string
  organiser_website: string
  status: string
  is_featured: boolean
  is_verified: boolean
  views_count: number
  entry_clicks: number
  created_at: string
}

const STATUS_TABS = [
  { key: 'all',      label: 'All' },
  { key: 'pending',  label: 'Pending' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'rejected', label: 'Rejected' },
]

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  upcoming: { bg: '#DCFCE7', color: '#166534' },
  pending:  { bg: '#FEF9C3', color: '#854D0E' },
  rejected: { bg: '#FEE2E2', color: '#991B1B' },
  past:     { bg: '#F3F4F6', color: '#6B7280' },
}

export default function AdminEventsPage() {
  const [events, setEvents]       = useState<AdminEvent[]>([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('all')
  const [search, setSearch]       = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [actioning, setActioning] = useState<string | null>(null)
  const [page, setPage]           = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })

  const fetchEvents = useCallback(async (status: string, q: string, p: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status, page: String(p) })
      if (q) params.set('search', q)
      const res  = await fetch(`/api/admin/events?${params}`)
      const data = await res.json()
      setEvents(data.events || [])
      setPagination({ total: data.pagination?.total ?? 0, pages: data.pagination?.pages ?? 1 })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchEvents(filter, search, page) }, [filter, search, page, fetchEvents])

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

  const handleTabChange = (key: string) => {
    setFilter(key)
    setPage(1)
  }

  const action = async (id: string, act: 'approve' | 'reject' | 'feature') => {
    setActioning(id)
    await fetch('/api/admin/events', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: act }),
    })
    if (act === 'feature') {
      setEvents(prev => prev.map(e => e.id === id ? { ...e, is_featured: !e.is_featured } : e))
    } else {
      // Refresh to reflect new status
      fetchEvents(filter, search, page)
    }
    setActioning(null)
  }

  const fmt = (d: string) => d ? new Date(d).toLocaleDateString('en-ZA', { day:'numeric', month:'short', year:'numeric' }) : '—'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', margin: '0 0 4px' }}>Events</h1>
          <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>{pagination.total} event{pagination.total !== 1 ? 's' : ''} total</p>
        </div>

        {/* Controls row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {STATUS_TABS.map(tab => (
              <button key={tab.key} onClick={() => handleTabChange(tab.key)}
                style={{
                  padding: '7px 16px', borderRadius: 8, border: '1.5px solid',
                  borderColor: filter === tab.key ? '#0D1B2A' : '#e4e4e7',
                  background: filter === tab.key ? '#0D1B2A' : '#fff',
                  color: filter === tab.key ? '#fff' : '#1a1a1a',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ display: 'flex', gap: 6, flex: 1, minWidth: 220 }}>
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search title, city, organiser…"
              style={{
                flex: 1, padding: '7px 12px', border: '1.5px solid #e4e4e7',
                borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff',
              }}
            />
            <button onClick={handleSearch}
              style={{ padding: '7px 12px', background: '#0D1B2A', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Search size={14} />
            </button>
            {search && (
              <button onClick={() => { setSearch(''); setSearchInput(''); setPage(1) }}
                style={{ padding: '7px 10px', background: '#f5f5f5', border: '1.5px solid #e4e4e7', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: '#6b7280' }}>
                Clear
              </button>
            )}
          </div>

          {/* Refresh */}
          <button onClick={() => fetchEvents(filter, search, page)} disabled={loading}
            style={{ padding: '7px 10px', background: '#fff', border: '1.5px solid #e4e4e7', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280', fontSize: 13 }}>
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9a9a9a', background: '#fff', borderRadius: 12, border: '1px solid #ebebeb' }}>
            Loading…
          </div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', background: '#fff', borderRadius: 12, border: '1px solid #ebebeb' }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>
              No {filter !== 'all' ? filter : ''} events{search ? ` matching "${search}"` : ''}
            </p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebeb', overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 130px 90px 80px 80px 200px', gap: 0, padding: '10px 20px', borderBottom: '1px solid #ebebeb', background: '#f9f9f9' }}>
              {['Event', 'Type', 'Date', 'Status', 'Views', 'Clicks', 'Actions'].map(h => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
              ))}
            </div>

            {events.map((ev, i) => {
              const statusStyle = STATUS_COLORS[ev.status] || { bg: '#F3F4F6', color: '#6B7280' }
              return (
                <div key={ev.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 100px 130px 90px 80px 80px 200px',
                  gap: 0, padding: '14px 20px', alignItems: 'center',
                  borderBottom: i < events.length - 1 ? '1px solid #f0f0f0' : 'none',
                  background: i % 2 === 0 ? '#fff' : '#fafafa',
                }}>
                  {/* Title + meta */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      {ev.is_featured && <span title="Featured" style={{ fontSize: 11 }}>⭐</span>}
                      {ev.is_verified && <span title="Verified" style={{ fontSize: 11 }}>✅</span>}
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{ev.title}</span>
                    </div>
                    <span style={{ fontSize: 12, color: '#9a9a9a' }}>
                      📍 {ev.city}{ev.province ? `, ${ev.province}` : ''}
                      {ev.organiser_name ? ` · ${ev.organiser_name}` : ''}
                      {ev.entry_fee ? ` · ${ev.entry_fee}` : ''}
                    </span>
                  </div>

                  {/* Type */}
                  <div>
                    <span style={{ padding: '2px 8px', background: '#E9ECF5', color: '#0D1B2A', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                      {ev.discipline || ev.event_type || '—'}
                    </span>
                  </div>

                  {/* Date */}
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {fmt(ev.event_date_start)}
                  </div>

                  {/* Status badge */}
                  <div>
                    <span style={{ padding: '3px 10px', background: statusStyle.bg, color: statusStyle.color, borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                      {ev.status}
                    </span>
                  </div>

                  {/* Views */}
                  <div style={{ fontSize: 13, color: '#6b7280' }}>{ev.views_count ?? 0}</div>

                  {/* Entry clicks */}
                  <div style={{ fontSize: 13, color: '#6b7280' }}>{ev.entry_clicks ?? 0}</div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Link href={`/events/${ev.slug}`} target="_blank" title="View public page"
                      style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 10px', border: '1.5px solid #e4e4e7', borderRadius: 7, fontSize: 12, fontWeight: 600, color: '#1a1a1a', textDecoration: 'none' }}>
                      <Eye size={12} /> View
                    </Link>

                    <button onClick={() => action(ev.id, 'feature')} disabled={actioning === ev.id} title={ev.is_featured ? 'Remove feature' : 'Feature this event'}
                      style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 10px', border: '1.5px solid', borderColor: ev.is_featured ? '#854D0E' : '#e4e4e7', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: ev.is_featured ? '#FEF9C3' : '#fff', color: ev.is_featured ? '#854D0E' : '#1a1a1a' }}>
                      <Star size={12} />
                    </button>

                    {ev.status === 'pending' && (
                      <>
                        <button onClick={() => action(ev.id, 'approve')} disabled={actioning === ev.id}
                          style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 10px', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: '#10B981', color: '#fff' }}>
                          <Check size={12} />
                        </button>
                        <button onClick={() => action(ev.id, 'reject')} disabled={actioning === ev.id}
                          style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 10px', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: '#EF4444', color: '#fff' }}>
                          <X size={12} />
                        </button>
                      </>
                    )}

                    {ev.status === 'rejected' && (
                      <button onClick={() => action(ev.id, 'approve')} disabled={actioning === ev.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 10px', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: '#10B981', color: '#fff' }}>
                        <Check size={12} /> Restore
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 20 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 14px', border: '1.5px solid #e4e4e7', borderRadius: 8, background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, fontSize: 13 }}>
              <ChevronLeft size={14} /> Prev
            </button>
            <span style={{ fontSize: 13, color: '#6b7280' }}>
              Page {page} of {pagination.pages} · {pagination.total} events
            </span>
            <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 14px', border: '1.5px solid #e4e4e7', borderRadius: 8, background: '#fff', cursor: page === pagination.pages ? 'not-allowed' : 'pointer', opacity: page === pagination.pages ? 0.4 : 1, fontSize: 13 }}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}


      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}
