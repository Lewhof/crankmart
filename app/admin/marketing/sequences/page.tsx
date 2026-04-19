'use client'

import { useEffect, useState, useCallback } from 'react'
import { PageHeader, Table, StatusPill, Button, Empty } from '@/components/admin/primitives'
import { Zap } from 'lucide-react'

interface SequenceRow {
  id: string
  name: string
  description: string | null
  trigger_type: string
  status: 'draft' | 'active' | 'paused' | 'archived'
  step_count: number
  active_enrollments: number
  created_at: string
}

const TONE: Record<SequenceRow['status'], 'neutral' | 'success' | 'warn' | 'accent'> = {
  draft:    'neutral',
  active:   'success',
  paused:   'warn',
  archived: 'neutral',
}

export default function SequencesPage() {
  const [rows, setRows] = useState<SequenceRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/marketing/sequences')
      const data = await res.json()
      setRows(data.sequences ?? [])
    } finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])

  async function toggle(r: SequenceRow) {
    const next = r.status === 'active' ? 'paused' : 'active'
    await fetch(`/api/admin/marketing/sequences/${r.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    load()
  }

  const fmt = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

  const tableRows = rows.map(r => ({
    id: r.id,
    cells: [
      <div key="n">
        <strong>{r.name}</strong>
        <div style={{ fontSize: 11, color: 'var(--admin-text-dim)', marginTop: 2 }}>
          Trigger: <code>{r.trigger_type}</code> · {r.step_count} step{r.step_count === 1 ? '' : 's'}
          {r.description && <div style={{ marginTop: 2, maxWidth: 420 }}>{r.description}</div>}
        </div>
      </div>,
      <StatusPill key="s" label={r.status} tone={TONE[r.status]} />,
      <div key="e" style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <Zap size={12} /> <strong>{r.active_enrollments}</strong>
        <span style={{ color: 'var(--admin-text-dim)', fontWeight: 400 }}>active</span>
      </div>,
      <div key="c" style={{ fontSize: 12, color: 'var(--admin-text-dim)' }}>{fmt(r.created_at)}</div>,
      <div key="a" style={{ display: 'flex', gap: 6 }}>
        {r.status === 'active' ? (
          <Button variant="ghost" size="sm" onClick={() => toggle(r)}>Pause</Button>
        ) : r.status === 'paused' || r.status === 'draft' ? (
          <Button variant="primary" size="sm" onClick={() => toggle(r)}>Activate</Button>
        ) : null}
      </div>,
    ],
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Sequences"
        subtitle="Multi-step flows — business-claim touch 1/2/3, post-signup welcomes, shop-onboarding nudges. Active sequences fire via QStash callbacks with a cron safety-net."
      />

      {loading ? <Empty message="Loading…" /> : (
        <Table head={['Sequence', 'Status', 'Enrollments', 'Created', 'Actions']} rows={tableRows}
          empty="No sequences yet. Create one via the API — builder UI lands in the next polish pass." />
      )}
    </div>
  )
}
