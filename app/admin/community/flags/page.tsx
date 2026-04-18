'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { PageHeader, Table, StatusPill, Button, Empty } from '@/components/admin/primitives'

interface Flag {
  id: string
  target_type: string
  target_id: string
  reason: string
  notes: string | null
  status: string
  created_at: string
  reviewed_at: string | null
  reporter_email: string | null
  reporter_handle: string | null
  reporter_name: string | null
}

const TABS = [
  { key: 'pending',   label: 'Pending' },
  { key: 'resolved',  label: 'Resolved' },
  { key: 'dismissed', label: 'Dismissed' },
] as const

export default function CommunityFlagsPage() {
  const [flags, setFlags] = useState<Flag[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<typeof TABS[number]['key']>('pending')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async (t: string, p: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status: t, page: p.toString() })
      const res = await fetch(`/api/admin/community/flags?${params}`)
      const data = await res.json()
      setFlags(data.flags ?? [])
      setTotalPages(data.pagination?.totalPages ?? 1)
      if (data.counts) setCounts(data.counts)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(tab, page) }, [tab, page, load])

  async function act(id: string, action: 'resolve' | 'dismiss' | 'resolve-and-remove') {
    setBusyId(`${id}:${action}`)
    try {
      await fetch(`/api/admin/community/flags/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      await load(tab, page)
    } finally {
      setBusyId(null)
    }
  }

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '8px 14px', background: 'none', border: 'none',
    borderBottom: active ? '2px solid var(--admin-accent)' : '2px solid transparent',
    color: active ? 'var(--admin-accent)' : 'var(--admin-text-dim)',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
  })

  const targetHref = (type: string, id: string) => {
    if (type === 'stolen_report') return `/community/stolen/${id}`
    if (type === 'lost_report')   return `/community/lost/${id}`
    if (type === 'comment')       return null // comments don't have their own detail pages
    return null
  }

  const rows = flags.map(f => ({
    id: f.id,
    cells: [
      <div key="t">
        <div style={{ textTransform: 'capitalize', fontWeight: 700 }}>{f.target_type.replace('_', ' ')}</div>
        {(() => {
          const href = targetHref(f.target_type, f.target_id)
          return href ? (
            <Link href={href} target="_blank" style={{ fontSize: 11, color: 'var(--admin-accent)', fontFamily: 'ui-monospace, monospace' }}>
              {f.target_id.slice(0, 8)}…
            </Link>
          ) : (
            <div style={{ fontSize: 11, color: 'var(--admin-text-dim)', fontFamily: 'ui-monospace, monospace' }}>
              {f.target_id.slice(0, 8)}…
            </div>
          )
        })()}
      </div>,
      <StatusPill key="r" label={f.reason.replace('_', ' ')} tone="warn" />,
      <div key="n" style={{ maxWidth: 320, fontSize: 12, color: 'var(--admin-text)' }}>
        {f.notes || <span style={{ color: 'var(--admin-text-dim)' }}>—</span>}
      </div>,
      <div key="u" style={{ fontSize: 12 }}>
        <div style={{ color: 'var(--admin-text)' }}>{f.reporter_name || 'Anonymous'}</div>
        <div style={{ color: 'var(--admin-text-dim)', fontSize: 11, marginTop: 2 }}>{f.reporter_email || '—'}</div>
      </div>,
      <div key="d" style={{ fontSize: 12, color: 'var(--admin-text-dim)' }}>
        {new Date(f.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
      </div>,
      <div key="a" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {tab === 'pending' && (
          <>
            <Button variant="primary" size="sm" onClick={() => act(f.id, 'resolve')} disabled={!!busyId}>
              Resolve
            </Button>
            {f.target_type === 'comment' && (
              <Button variant="danger" size="sm" onClick={() => act(f.id, 'resolve-and-remove')} disabled={!!busyId}>
                Resolve + remove
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => act(f.id, 'dismiss')} disabled={!!busyId}>
              Dismiss
            </Button>
          </>
        )}
      </div>,
    ],
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Flags"
        subtitle="User-reported content across comments, listings, stolen/lost reports. Resolve or dismiss each flag so the queue stays clean."
      />

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', borderBottom: '1px solid var(--admin-border)' }}>
        {TABS.map(({ key, label }) => {
          const count = counts[key] ?? 0
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
        <Table head={['Target', 'Reason', 'Notes', 'Reporter', 'Submitted', 'Actions']} rows={rows} empty="No flags in this view" />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>← Prev</Button>
        <span style={{ fontSize: 12, color: 'var(--admin-text-dim)' }}>Page {page} of {totalPages}</span>
        <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next →</Button>
      </div>
    </div>
  )
}
