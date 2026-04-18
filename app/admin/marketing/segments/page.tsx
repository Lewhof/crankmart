'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { PageHeader, Table, Button, Empty } from '@/components/admin/primitives'
import { Plus, Users } from 'lucide-react'

interface SegmentRow {
  id: string
  name: string
  description: string | null
  last_size: number | null
  last_materialized_at: string | null
  created_at: string
}

export default function SegmentsPage() {
  const [rows, setRows] = useState<SegmentRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/marketing/segments')
      const data = await res.json()
      setRows(data.segments ?? [])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  const tableRows = rows.map(r => ({
    id: r.id,
    cells: [
      <div key="n">
        <Link href={`/admin/marketing/segments/${r.id}`} style={{ fontWeight: 700, color: 'var(--admin-text)', textDecoration: 'none' }}>
          {r.name}
        </Link>
        {r.description && (
          <div style={{ fontSize: 11, color: 'var(--admin-text-dim)', marginTop: 2, maxWidth: 420 }}>{r.description}</div>
        )}
      </div>,
      <div key="sz" style={{ fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <Users size={13} /> {r.last_size?.toLocaleString() ?? '—'}
      </div>,
      <div key="m" style={{ fontSize: 12, color: 'var(--admin-text-dim)' }}>{fmt(r.last_materialized_at)}</div>,
      <div key="c" style={{ fontSize: 12, color: 'var(--admin-text-dim)' }}>{fmt(r.created_at)}</div>,
    ],
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Segments"
        subtitle="Query-based audiences — define the criteria, the system materialises the recipients at send time. Segments + contact lists are both valid campaign targets."
        actions={(
          <Link href="/admin/marketing/segments/new">
            <Button variant="primary" size="sm">
              <Plus size={14} /> New segment
            </Button>
          </Link>
        )}
      />

      {loading ? <Empty message="Loading…" /> : (
        <Table head={['Name', 'Size', 'Last updated', 'Created']} rows={tableRows} empty="No segments yet." />
      )}
    </div>
  )
}
