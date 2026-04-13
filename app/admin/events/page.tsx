'use client'

import { useState, useEffect, useCallback } from 'react'
import { Check, X, Star, Eye, Search, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import {
  PageHeader, Card, Table, StatusPill, toneForStatus, Button, Empty,
} from '@/components/admin/primitives'

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

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [actioning, setActioning] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })

  const fetchEvents = useCallback(async (status: string, q: string, p: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status, page: String(p) })
      if (q) params.set('search', q)
      const res = await fetch(`/api/admin/events?${params}`)
      const data = await res.json()
      setEvents(data.events || [])
      setPagination({ total: data.pagination?.total ?? 0, pages: data.pagination?.pages ?? 1 })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchEvents(filter, search, page) }, [filter, search, page, fetchEvents])

  async function action(id: string, act: 'approve' | 'reject' | 'feature') {
    setActioning(id)
    try {
      await fetch('/api/admin/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: act }),
      })
      if (act === 'feature') {
        setEvents(prev => prev.map(e => e.id === id ? { ...e, is_featured: !e.is_featured } : e))
      } else {
        fetchEvents(filter, search, page)
      }
    } finally {
      setActioning(null)
    }
  }

  const fmt = (d: string) =>
    d ? new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px',
    borderRadius: 6,
    border: '1px solid',
    borderColor: active ? 'var(--admin-accent)' : 'var(--admin-border)',
    background: active ? 'color-mix(in oklch, var(--admin-accent) 20%, transparent)' : 'var(--admin-surface-2)',
    color: active ? 'var(--admin-accent)' : 'var(--admin-text)',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  })

  const rows = events.map(ev => ({
    id: ev.id,
    cells: [
      <div key="t">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          {ev.is_featured && <Star size={11} style={{ color: 'var(--admin-warn)' }} />}
          <span style={{ fontWeight: 600 }}>{ev.title}</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--admin-text-dim)' }}>
          {ev.city}{ev.province ? `, ${ev.province}` : ''}
          {ev.organiser_name ? ` · ${ev.organiser_name}` : ''}
        </div>
      </div>,
      <StatusPill key="ty" label={ev.discipline || ev.event_type || '—'} tone="neutral" />,
      <span key="d" style={{ color: 'var(--admin-text-dim)' }}>{fmt(ev.event_date_start)}</span>,
      <StatusPill key="s" label={ev.status} tone={toneForStatus(ev.status === 'upcoming' ? 'active' : ev.status)} />,
      <span key="v">{ev.views_count ?? 0}</span>,
      <span key="c">{ev.entry_clicks ?? 0}</span>,
      <div key="a" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <Button variant="ghost" size="sm" href={`/events/${ev.slug}`}><Eye size={12} /> View</Button>
        <Button variant={ev.is_featured ? 'primary' : 'ghost'} size="sm" onClick={() => action(ev.id, 'feature')} disabled={actioning === ev.id}>
          <Star size={12} />
        </Button>
        {ev.status === 'pending' && (
          <>
            <Button variant="primary" size="sm" onClick={() => action(ev.id, 'approve')} disabled={actioning === ev.id}>
              <Check size={12} />
            </Button>
            <Button variant="danger" size="sm" onClick={() => action(ev.id, 'reject')} disabled={actioning === ev.id}>
              <X size={12} />
            </Button>
          </>
        )}
        {ev.status === 'rejected' && (
          <Button variant="primary" size="sm" onClick={() => action(ev.id, 'approve')} disabled={actioning === ev.id}>
            <Check size={12} /> Restore
          </Button>
        )}
      </div>,
    ],
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Events"
        subtitle={`${pagination.total} event${pagination.total !== 1 ? 's' : ''} total`}
      />

      <Card>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {STATUS_TABS.map(t => (
              <button key={t.key} onClick={() => { setFilter(t.key); setPage(1) }} style={tabBtn(filter === t.key)}>
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 6, flex: 1, minWidth: 220 }}>
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (setSearch(searchInput), setPage(1))}
              placeholder="Search title, city, organiser…"
              style={{
                flex: 1,
                padding: '7px 12px',
                border: '1px solid var(--admin-border)',
                background: 'var(--admin-surface-2)',
                color: 'var(--admin-text)',
                borderRadius: 6,
                fontSize: 13,
              }}
            />
            <Button variant="primary" size="sm" onClick={() => { setSearch(searchInput); setPage(1) }}>
              <Search size={13} />
            </Button>
            {search && (
              <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setSearchInput(''); setPage(1) }}>
                Clear
              </Button>
            )}
          </div>

          <Button variant="ghost" size="sm" onClick={() => fetchEvents(filter, search, page)} disabled={loading}>
            <RefreshCw size={12} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
          </Button>
        </div>
      </Card>

      {loading ? (
        <Empty message="Loading events…" />
      ) : events.length === 0 ? (
        <Empty message={`No ${filter !== 'all' ? filter : ''} events${search ? ` matching "${search}"` : ''}`} />
      ) : (
        <Table
          head={['Event', 'Type', 'Date', 'Status', 'Views', 'Clicks', 'Actions']}
          rows={rows}
        />
      )}

      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
            <ChevronLeft size={13} /> Prev
          </Button>
          <span style={{ fontSize: 12, color: 'var(--admin-text-dim)' }}>
            Page {page} of {pagination.pages} · {pagination.total} events
          </span>
          <Button variant="ghost" size="sm" disabled={page === pagination.pages} onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}>
            Next <ChevronRight size={13} />
          </Button>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
