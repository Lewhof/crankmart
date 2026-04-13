'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  PageHeader, Table, StatusPill, Button, Empty,
} from '@/components/admin/primitives'

interface Business {
  id: string
  name: string
  city: string | null
  province: string | null
  business_type: string
  status: string
  outreach_sent_at: string | null
  claimed_at: string | null
  verified_at: string | null
  created_at: string
  email: string | null
  phone: string | null
}

const STATUS_TABS = [
  { key: 'pending',   label: 'Pending' },
  { key: 'outreach',  label: 'Outreach Sent' },
  { key: 'claimed',   label: 'Claimed' },
  { key: 'suspended', label: 'Suspended' },
]

const TYPE_OPTIONS = ['all', 'shop', 'brand', 'service_center', 'tour_operator', 'event_organiser']

export default function VerificationsPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pending')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [tabCounts, setTabCounts] = useState<Record<string, number>>({})
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchData = useCallback(async (t: string, type: string, p: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status: t, type, page: p.toString() })
      const res = await fetch(`/api/admin/verifications?${params}`)
      const data = await res.json()
      setBusinesses(data.businesses ?? [])
      setTotalPages(data.pagination?.totalPages ?? 1)
      if (data.counts) setTabCounts(data.counts)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData(tab, typeFilter, page) }, [tab, typeFilter, page, fetchData])

  async function handleAction(id: string, action: string) {
    setActionLoading(`${id}:${action}`)
    try {
      await fetch(`/api/admin/verifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      await fetchData(tab, typeFilter, page)
    } finally {
      setActionLoading(null)
    }
  }

  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '8px 14px',
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid var(--admin-accent)' : '2px solid transparent',
    color: active ? 'var(--admin-accent)' : 'var(--admin-text-dim)',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
  })
  const typeBtn = (active: boolean): React.CSSProperties => ({
    padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', borderRadius: 6,
    border: '1px solid',
    borderColor: active ? 'var(--admin-accent)' : 'var(--admin-border)',
    background: active ? 'color-mix(in oklch, var(--admin-accent) 20%, transparent)' : 'var(--admin-surface-2)',
    color: active ? 'var(--admin-accent)' : 'var(--admin-text)',
  })

  const rows = businesses.map(b => ({
    id: b.id,
    cells: [
      <div key="n">
        <div style={{ fontWeight: 600 }}>{b.name}</div>
        {b.email && <div style={{ fontSize: 11, color: 'var(--admin-text-dim)', marginTop: 2 }}>{b.email}</div>}
      </div>,
      <StatusPill key="t" label={b.business_type.replace(/_/g, ' ')} tone="neutral" />,
      <span key="c" style={{ color: 'var(--admin-text-dim)' }}>{b.city || '—'}{b.province ? `, ${b.province}` : ''}</span>,
      <span key="cr" style={{ color: 'var(--admin-text-dim)', fontSize: 12 }}>{fmt(b.created_at)}</span>,
      <span key="o" style={{ color: 'var(--admin-text-dim)', fontSize: 12 }}>{fmt(b.outreach_sent_at)}</span>,
      <span key="cl" style={{ color: 'var(--admin-text-dim)', fontSize: 12 }}>{fmt(b.claimed_at)}</span>,
      <div key="a" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {tab === 'pending' && (
          <Button variant="primary" size="sm" onClick={() => handleAction(b.id, 'send-outreach')} disabled={actionLoading === `${b.id}:send-outreach`}>
            Send Outreach
          </Button>
        )}
        {tab === 'claimed' && (
          <>
            <Button variant="primary" size="sm" onClick={() => handleAction(b.id, 'verify')} disabled={!!actionLoading}>Verify</Button>
            <Button variant="danger" size="sm" onClick={() => handleAction(b.id, 'suspend')} disabled={!!actionLoading}>Suspend</Button>
          </>
        )}
        {tab === 'suspended' && (
          <Button variant="primary" size="sm" onClick={() => handleAction(b.id, 'reinstate')} disabled={!!actionLoading}>Reinstate</Button>
        )}
      </div>,
    ],
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader title="Verifications" subtitle="Review and manage business verification requests" />

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', borderBottom: '1px solid var(--admin-border)' }}>
        {STATUS_TABS.map(({ key, label }) => {
          const count = tabCounts[key] ?? 0
          const active = tab === key
          return (
            <button key={key} onClick={() => { setTab(key); setPage(1) }} style={tabBtn(active)}>
              {label}
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

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--admin-text-dim)', textTransform: 'uppercase', letterSpacing: '.3px' }}>Type:</span>
        {TYPE_OPTIONS.map(t => (
          <button key={t} onClick={() => { setTypeFilter(t); setPage(1) }} style={typeBtn(typeFilter === t)}>
            {t === 'all' ? 'All' : t.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <Empty message="Loading…" />
      ) : (
        <Table
          head={['Name', 'Type', 'City', 'Created', 'Outreach', 'Claimed', 'Actions']}
          rows={rows}
          empty="No businesses in this view"
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>← Prev</Button>
        <span style={{ fontSize: 12, color: 'var(--admin-text-dim)' }}>Page {page} of {totalPages}</span>
        <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next →</Button>
      </div>
    </div>
  )
}
