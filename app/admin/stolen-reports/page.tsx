'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  PageHeader, Table, StatusPill, Button, Empty,
} from '@/components/admin/primitives'

interface Report {
  id: string
  serial_number: string
  brand: string
  model: string | null
  year: number | null
  colour: string | null
  source: string
  external_id: string | null
  status: 'pending' | 'approved' | 'rejected' | 'recovered'
  saps_case_no: string | null
  stolen_date: string | null
  stolen_location: string | null
  proof_photo_url: string | null
  notes: string | null
  country: string
  created_at: string
  reviewed_at: string | null
  reporter_email: string | null
  reporter_name: string | null
}

const STATUS_TABS = [
  { key: 'pending',   label: 'Pending' },
  { key: 'approved',  label: 'Approved' },
  { key: 'rejected',  label: 'Rejected' },
  { key: 'recovered', label: 'Recovered' },
] as const

const STATUS_TONE: Record<Report['status'], 'warn' | 'success' | 'danger' | 'accent'> = {
  pending:   'warn',
  approved:  'success',
  rejected:  'danger',
  recovered: 'accent',
}

export default function StolenReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<typeof STATUS_TABS[number]['key']>('pending')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [tabCounts, setTabCounts] = useState<Record<string, number>>({})
  const [actionId, setActionId] = useState<string | null>(null)
  const [photoModal, setPhotoModal] = useState<string | null>(null)

  const fetchData = useCallback(async (t: string, p: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status: t, page: p.toString() })
      const res = await fetch(`/api/admin/stolen-reports?${params}`)
      const data = await res.json()
      setReports(data.reports ?? [])
      setTotalPages(data.pagination?.totalPages ?? 1)
      if (data.counts) setTabCounts(data.counts)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData(tab, page) }, [tab, page, fetchData])

  async function handleAction(id: string, action: 'approve' | 'reject' | 'mark-recovered' | 'mark-pending') {
    setActionId(`${id}:${action}`)
    try {
      await fetch(`/api/admin/stolen-reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      await fetchData(tab, page)
    } finally {
      setActionId(null)
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

  const rows = reports.map(r => ({
    id: r.id,
    cells: [
      <div key="s">
        <div style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700, fontSize: 13 }}>{r.serial_number}</div>
        <div style={{ fontSize: 11, color: 'var(--admin-text-dim)', marginTop: 2 }}>
          {r.brand}{r.model ? ` ${r.model}` : ''}{r.year ? ` · ${r.year}` : ''}
        </div>
      </div>,
      <StatusPill key="st" label={r.status} tone={STATUS_TONE[r.status]} />,
      <div key="sa" style={{ fontSize: 12 }}>
        {r.saps_case_no ? <code style={{ fontFamily: 'ui-monospace, monospace' }}>{r.saps_case_no}</code> : <span style={{ color: 'var(--admin-text-dim)' }}>—</span>}
      </div>,
      <div key="loc" style={{ fontSize: 12, color: 'var(--admin-text-dim)' }}>
        {r.stolen_location || '—'}
        {r.stolen_date && <div style={{ marginTop: 2 }}>{fmt(r.stolen_date)}</div>}
      </div>,
      <div key="rep" style={{ fontSize: 12 }}>
        <div style={{ color: 'var(--admin-text)' }}>{r.reporter_name || '—'}</div>
        <div style={{ color: 'var(--admin-text-dim)', fontSize: 11, marginTop: 2 }}>{r.reporter_email || '—'}</div>
      </div>,
      <div key="cr" style={{ fontSize: 12, color: 'var(--admin-text-dim)' }}>{fmt(r.created_at)}</div>,
      <div key="pf">
        {r.proof_photo_url ? (
          <button
            onClick={() => setPhotoModal(r.proof_photo_url)}
            style={{
              padding: '4px 10px', fontSize: 11, fontWeight: 600,
              background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border)',
              borderRadius: 6, cursor: 'pointer', color: 'var(--admin-text)',
            }}
          >
            View photo
          </button>
        ) : (
          <span style={{ fontSize: 11, color: 'var(--admin-text-dim)' }}>none</span>
        )}
      </div>,
      <div key="a" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {tab === 'pending' && (
          <>
            <Button variant="primary" size="sm" onClick={() => handleAction(r.id, 'approve')} disabled={!!actionId}>
              Approve
            </Button>
            <Button variant="danger" size="sm" onClick={() => handleAction(r.id, 'reject')} disabled={!!actionId}>
              Reject
            </Button>
          </>
        )}
        {tab === 'approved' && (
          <>
            <Button variant="primary" size="sm" onClick={() => handleAction(r.id, 'mark-recovered')} disabled={!!actionId}>
              Mark recovered
            </Button>
            <Button variant="danger" size="sm" onClick={() => handleAction(r.id, 'reject')} disabled={!!actionId}>
              Reject
            </Button>
          </>
        )}
        {tab === 'rejected' && (
          <Button variant="ghost" size="sm" onClick={() => handleAction(r.id, 'mark-pending')} disabled={!!actionId}>
            Reopen
          </Button>
        )}
        {tab === 'recovered' && (
          <Button variant="ghost" size="sm" onClick={() => handleAction(r.id, 'approve')} disabled={!!actionId}>
            Re-approve
          </Button>
        )}
      </div>,
    ],
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Stolen Reports"
        subtitle="Approve verified reports so they appear in the public registry. SAPS case + photo gates auto-approve at submission; manual queue handles the rest."
      />

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

      {loading ? (
        <Empty message="Loading…" />
      ) : (
        <Table
          head={['Serial / Bike', 'Status', 'SAPS', 'Where + when', 'Reporter', 'Submitted', 'Proof', 'Actions']}
          rows={rows}
          empty={`No ${tab} reports.`}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>← Prev</Button>
        <span style={{ fontSize: 12, color: 'var(--admin-text-dim)' }}>Page {page} of {totalPages}</span>
        <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next →</Button>
      </div>

      {photoModal && (
        <div
          onClick={() => setPhotoModal(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, cursor: 'zoom-out',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoModal} alt="Proof of ownership" style={{ maxWidth: '100%', maxHeight: '92vh', borderRadius: 8 }} />
        </div>
      )}
    </div>
  )
}
