'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { PageHeader, Table, Button, Empty } from '@/components/admin/primitives'
import { Plus, Users } from 'lucide-react'

interface ListRow {
  id: string
  name: string
  description: string | null
  member_count: number
  created_at: string
}

export default function ListsPage() {
  const [rows, setRows] = useState<ListRow[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/marketing/lists')
      const data = await res.json()
      setRows(data.lists ?? [])
    } finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])

  async function create() {
    if (!newName.trim()) return
    const res = await fetch('/api/admin/marketing/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() || undefined }),
    })
    if (res.ok) {
      setCreating(false)
      setNewName(''); setNewDesc('')
      load()
    }
  }

  const fmt = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

  const tableRows = rows.map(r => ({
    id: r.id,
    cells: [
      <div key="n">
        <Link href={`/admin/marketing/lists/${r.id}`} style={{ fontWeight: 700, color: 'var(--admin-text)', textDecoration: 'none' }}>
          {r.name}
        </Link>
        {r.description && (
          <div style={{ fontSize: 11, color: 'var(--admin-text-dim)', marginTop: 2, maxWidth: 420 }}>{r.description}</div>
        )}
      </div>,
      <div key="m" style={{ fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <Users size={13} /> {r.member_count.toLocaleString()}
      </div>,
      <div key="c" style={{ fontSize: 12, color: 'var(--admin-text-dim)' }}>{fmt(r.created_at)}</div>,
    ],
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Contact lists"
        subtitle="Static audiences you curate by hand — waitlist subscribers, journalists, shop owners, partners. Use alongside segments in campaigns."
        actions={<Button variant="primary" size="sm" onClick={() => setCreating(true)}><Plus size={14} /> New list</Button>}
      />

      {creating && (
        <div style={{ padding: 16, background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: 10, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="List name" style={{ flex: 1, minWidth: 200, padding: '8px 10px', fontSize: 13, background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border)', borderRadius: 6, color: 'var(--admin-text)' }} />
          <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)" style={{ flex: 2, minWidth: 240, padding: '8px 10px', fontSize: 13, background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border)', borderRadius: 6, color: 'var(--admin-text)' }} />
          <Button variant="primary" size="sm" onClick={create} disabled={!newName.trim()}>Create</Button>
          <Button variant="ghost" size="sm" onClick={() => setCreating(false)}>Cancel</Button>
        </div>
      )}

      {loading ? <Empty message="Loading…" /> : (
        <Table head={['Name', 'Members', 'Created']} rows={tableRows} empty="No contact lists yet." />
      )}
    </div>
  )
}
