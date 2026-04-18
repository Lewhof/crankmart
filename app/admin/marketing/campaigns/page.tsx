'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { PageHeader, Table, StatusPill, Button, Empty } from '@/components/admin/primitives'
import { Plus } from 'lucide-react'

interface CampaignRow {
  id: string
  name: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled' | 'failed'
  scheduled_at: string | null
  sent_at: string | null
  stats: { sent?: number; delivered?: number; opened?: number; clicked?: number; bounced?: number; failed?: number }
  created_at: string
  template_name: string | null
  segment_name: string | null
  list_name: string | null
}

const TABS = [
  { key: 'all',       label: 'All' },
  { key: 'draft',     label: 'Drafts' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'sent',      label: 'Sent' },
  { key: 'cancelled', label: 'Cancelled' },
] as const

const TONE: Record<CampaignRow['status'], 'neutral' | 'success' | 'warn' | 'danger' | 'accent'> = {
  draft:     'neutral',
  scheduled: 'warn',
  sending:   'accent',
  sent:      'success',
  cancelled: 'neutral',
  failed:    'danger',
}

export default function CampaignsPage() {
  const [tab, setTab] = useState<typeof TABS[number]['key']>('all')
  const [rows, setRows] = useState<CampaignRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (t: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/marketing/campaigns?status=${t}`)
      const data = await res.json()
      setRows(data.campaigns ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(tab) }, [tab, load])

  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

  const tableRows = rows.map(r => ({
    id: r.id,
    cells: [
      <div key="n">
        <Link href={`/admin/marketing/campaigns/${r.id}`} style={{ fontWeight: 700, color: 'var(--admin-text)', textDecoration: 'none' }}>
          {r.name}
        </Link>
        <div style={{ fontSize: 11, color: 'var(--admin-text-dim)', marginTop: 2 }}>
          {r.template_name ?? '—'}
          {r.segment_name ? ` · segment: ${r.segment_name}` : r.list_name ? ` · list: ${r.list_name}` : ''}
        </div>
      </div>,
      <StatusPill key="s" label={r.status} tone={TONE[r.status]} />,
      <div key="sc" style={{ fontSize: 12, color: 'var(--admin-text-dim)' }}>{fmt(r.scheduled_at)}</div>,
      <div key="st" style={{ fontSize: 12 }}>
        {r.status === 'sent' || r.status === 'sending'
          ? (<>
              <strong>{r.stats.sent ?? 0}</strong>
              <span style={{ color: 'var(--admin-text-dim)' }}> sent</span>
              {typeof r.stats.opened === 'number' && <span style={{ color: 'var(--admin-text-dim)' }}> · {r.stats.opened} opens</span>}
            </>)
          : <span style={{ color: 'var(--admin-text-dim)' }}>—</span>
        }
      </div>,
      <div key="d" style={{ fontSize: 12, color: 'var(--admin-text-dim)' }}>{fmt(r.created_at)}</div>,
    ],
  }))

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '8px 14px', background: 'none', border: 'none',
    borderBottom: active ? '2px solid var(--admin-accent)' : '2px solid transparent',
    color: active ? 'var(--admin-accent)' : 'var(--admin-text-dim)',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Campaigns"
        subtitle="One-off email broadcasts to a segment or contact list. Schedules, open/click analytics, and send status live in one place."
        actions={(
          <Link href="/admin/marketing/campaigns/new">
            <Button variant="primary" size="sm">
              <Plus size={14} /> New campaign
            </Button>
          </Link>
        )}
      />

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', borderBottom: '1px solid var(--admin-border)' }}>
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} style={tabBtn(tab === key)}>{label}</button>
        ))}
      </div>

      {loading ? (
        <Empty message="Loading…" />
      ) : (
        <Table head={['Campaign', 'Status', 'Scheduled', 'Stats', 'Created']} rows={tableRows} empty="No campaigns in this view." />
      )}
    </div>
  )
}
