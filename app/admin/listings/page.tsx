'use client'

import { useEffect, useState, useCallback } from 'react'
import { Eye, Trash2, CheckCircle, XCircle } from 'lucide-react'
import {
  PageHeader, Card, Table, StatusPill, toneForStatus, Button, BulkActionBar, Empty,
} from '@/components/admin/primitives'
import { formatPrice } from '@/lib/currency'
import type { Country } from '@/lib/country'

interface Listing {
  id: string
  title: string
  seller_name: string
  price: string
  country: Country
  status: string
  moderation_status: string
  created_at: string
  thumb_url: string
  category_id: number
  slug: string
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [status, setStatus] = useState('all')
  const [moderation, setModeration] = useState('all')
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selected, setSelected] = useState<string[]>([])

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), status, moderation, search })
      const res = await fetch(`/api/admin/listings?${params}`)
      const data = await res.json()
      setListings(data.listings ?? [])
      setTotalPages(data.pagination?.totalPages ?? 1)
    } finally {
      setLoading(false)
    }
  }, [page, status, moderation, search])

  useEffect(() => { fetchListings() }, [fetchListings])

  async function handleAction(id: string, action: string) {
    setActionLoading(id)
    try {
      await fetch(`/api/admin/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      await fetchListings()
    } finally {
      setActionLoading(null)
    }
  }

  async function bulkAction(action: 'approve' | 'reject' | 'delete') {
    if (!selected.length) return
    setActionLoading('bulk')
    try {
      await Promise.all(selected.map(id =>
        fetch(`/api/admin/listings/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        })
      ))
      setSelected([])
      await fetchListings()
    } finally {
      setActionLoading(null)
    }
  }

  const selectStyle: React.CSSProperties = {
    background: 'var(--admin-surface-2)',
    color: 'var(--admin-text)',
    border: '1px solid var(--admin-border)',
    borderRadius: 6,
    padding: '7px 10px',
    fontSize: 13,
    width: '100%',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    marginBottom: 6,
    color: 'var(--admin-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '.3px',
  }

  const rows = listings.map(l => ({
    id: l.id,
    cells: [
      <span key="t" style={{ fontWeight: 600 }}>{l.title}</span>,
      <span key="s" style={{ color: 'var(--admin-text-dim)' }}>{l.seller_name}</span>,
      <span key="p">{formatPrice(l.country ?? 'za', l.price || '0', { showCents: true })}</span>,
      <StatusPill key="st" label={l.status} tone={toneForStatus(l.status)} />,
      <StatusPill key="m" label={l.moderation_status} tone={toneForStatus(l.moderation_status)} />,
      <div key="a" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {l.moderation_status === 'pending' && (
          <>
            <Button variant="primary" size="sm" onClick={() => handleAction(l.id, 'approve')} disabled={!!actionLoading}>
              <CheckCircle size={12} /> Approve
            </Button>
            <Button variant="danger" size="sm" onClick={() => handleAction(l.id, 'reject')} disabled={!!actionLoading}>
              <XCircle size={12} /> Reject
            </Button>
          </>
        )}
        <Button variant="ghost" size="sm" href={`/browse/${l.slug}`}>
          <Eye size={12} /> View
        </Button>
        <Button variant="danger" size="sm" onClick={() => handleAction(l.id, 'delete')} disabled={!!actionLoading}>
          <Trash2 size={12} />
        </Button>
      </div>,
    ],
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Listings"
        subtitle="Review, moderate and manage all marketplace listings"
      />

      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <div>
            <label style={labelStyle}>Status</label>
            <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} style={selectStyle}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="draft">Draft</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Moderation</label>
            <select value={moderation} onChange={e => { setModeration(e.target.value); setPage(1) }} style={selectStyle}>
              <option value="all">All moderation</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Search</label>
            <input
              type="text"
              placeholder="Title or seller…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              style={selectStyle}
            />
          </div>
        </div>
      </Card>

      {loading ? (
        <Empty message="Loading listings…" />
      ) : (
        <Table
          head={['Title', 'Seller', 'Price', 'Status', 'Moderation', 'Actions']}
          rows={rows}
          empty="No listings match your filters."
          onSelect={setSelected}
          selectedIds={selected}
        />
      )}

      <BulkActionBar count={selected.length} onClear={() => setSelected([])}>
        <Button variant="primary" size="sm" onClick={() => bulkAction('approve')} disabled={!!actionLoading}>Approve</Button>
        <Button variant="danger" size="sm" onClick={() => bulkAction('reject')} disabled={!!actionLoading}>Reject</Button>
        <Button variant="danger" size="sm" onClick={() => bulkAction('delete')} disabled={!!actionLoading}>Delete</Button>
      </BulkActionBar>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 2px' }}>
        <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(Math.max(1, page - 1))}>← Prev</Button>
        <span style={{ color: 'var(--admin-text-dim)', fontSize: 12 }}>Page {page} of {totalPages}</span>
        <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage(Math.min(totalPages, page + 1))}>Next →</Button>
      </div>
    </div>
  )
}
