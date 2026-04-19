'use client'

import { useCallback, useEffect, useState } from 'react'
import { Download, RefreshCw, Mail, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHeader, Card, Table, Button, Empty, StatusPill } from '@/components/admin/primitives'

interface Row {
  id: string
  email: string
  country: string
  referrer: string | null
  created_at: string
}

interface CountryCount {
  country: string
  total: number
}

interface ApiResponse {
  rows: Row[]
  pagination: { page: number; limit: number; total: number; pages: number }
  countryCounts: CountryCount[]
}

const LIMIT = 50

export default function AdminWaitlistPage() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const fetchData = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/waitlist?page=${p}&limit=${LIMIT}`, { cache: 'no-store' })
      if (res.ok) {
        const body = await res.json() as ApiResponse
        setData(body)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData(page) }, [page, fetchData])

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const rows: React.ComponentProps<typeof Table>['rows'] = (data?.rows ?? []).map(r => ({
    id: r.id,
    cells: [
      <span key="e" style={{ fontWeight: 600 }}>{r.email}</span>,
      <StatusPill key="c" label={r.country.toUpperCase()} tone="neutral" />,
      <span key="r" style={{ color: 'var(--admin-text-dim)', fontSize: 12 }}>{r.referrer || '—'}</span>,
      <span key="d" style={{ color: 'var(--admin-text-dim)', fontSize: 12 }}>{fmt(r.created_at)}</span>,
    ],
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Waitlist"
        subtitle={
          data ? `${data.pagination.total} signup${data.pagination.total === 1 ? '' : 's'} total` : 'Loading…'
        }
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" size="sm" onClick={() => fetchData(page)} disabled={loading}>
              <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
            </Button>
            <Button variant="primary" size="sm" href="/api/admin/waitlist?format=csv">
              <Download size={13} /> Export CSV
            </Button>
          </div>
        }
      />

      {data && data.countryCounts.length > 0 && (
        <Card>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {data.countryCounts.map(c => (
              <div key={c.country} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 8, background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border)' }}>
                <Mail size={14} style={{ color: 'var(--admin-text-dim)' }} />
                <span style={{ fontWeight: 700 }}>{c.country.toUpperCase()}</span>
                <span style={{ color: 'var(--admin-text-dim)', fontSize: 13 }}>{c.total}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {loading && !data ? (
        <Empty message="Loading waitlist…" />
      ) : !data || data.rows.length === 0 ? (
        <Empty message="Nobody on the waitlist yet." />
      ) : (
        <Table head={['Email', 'Country', 'Referrer', 'Joined']} rows={rows} />
      )}

      {data && data.pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
            <ChevronLeft size={13} /> Prev
          </Button>
          <span style={{ fontSize: 12, color: 'var(--admin-text-dim)' }}>
            Page {page} of {data.pagination.pages} · {data.pagination.total} signups
          </span>
          <Button variant="ghost" size="sm" disabled={page === data.pagination.pages} onClick={() => setPage(p => p + 1)}>
            Next <ChevronRight size={13} />
          </Button>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
