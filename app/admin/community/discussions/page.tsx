'use client'

import { useEffect, useState, useCallback } from 'react'
import { PageHeader, Table, StatusPill, Button, Empty } from '@/components/admin/primitives'

interface Comment {
  id: string
  target_type: string
  target_id: string
  parent_id: string | null
  status: string
  body: string
  created_at: string
  edited_at: string | null
  email: string
  name: string
  handle: string | null
}

const TABS = [
  { key: 'approved', label: 'Approved' },
  { key: 'removed',  label: 'Removed' },
] as const

const TYPE_OPTIONS = ['all', 'listing', 'event', 'route', 'news', 'stolen_report', 'lost_report']

export default function CommunityDiscussionsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<typeof TABS[number]['key']>('approved')
  const [type, setType] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async (t: string, y: string, p: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status: t, targetType: y, page: p.toString() })
      const res = await fetch(`/api/admin/community/discussions?${params}`)
      const data = await res.json()
      setComments(data.comments ?? [])
      setTotalPages(data.pagination?.totalPages ?? 1)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(tab, type, page) }, [tab, type, page, load])

  async function act(id: string, action: 'remove' | 'restore') {
    setBusy(`${id}:${action}`)
    try {
      await fetch(`/api/admin/community/discussions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      await load(tab, type, page)
    } finally {
      setBusy(null)
    }
  }

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '8px 14px', background: 'none', border: 'none',
    borderBottom: active ? '2px solid var(--admin-accent)' : '2px solid transparent',
    color: active ? 'var(--admin-accent)' : 'var(--admin-text-dim)',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
  })
  const typeBtn = (active: boolean): React.CSSProperties => ({
    padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', borderRadius: 6,
    border: '1px solid',
    borderColor: active ? 'var(--admin-accent)' : 'var(--admin-border)',
    background: active ? 'color-mix(in oklch, var(--admin-accent) 20%, transparent)' : 'var(--admin-surface-2)',
    color: active ? 'var(--admin-accent)' : 'var(--admin-text)',
    textTransform: 'capitalize',
  })

  const rows = comments.map(c => ({
    id: c.id,
    cells: [
      <div key="u" style={{ fontSize: 12 }}>
        <div style={{ color: 'var(--admin-text)', fontWeight: 600 }}>{c.name}</div>
        <div style={{ color: 'var(--admin-text-dim)', fontSize: 11, marginTop: 2 }}>
          {c.handle ? '@' + c.handle : c.email}
        </div>
      </div>,
      <div key="t" style={{ fontSize: 12, color: 'var(--admin-text-dim)', textTransform: 'capitalize' }}>
        {c.target_type.replace('_', ' ')}{c.parent_id ? ' · reply' : ''}
      </div>,
      <div key="b" style={{ maxWidth: 440, fontSize: 13, color: 'var(--admin-text)', whiteSpace: 'pre-wrap', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
        {c.body}
      </div>,
      <StatusPill key="s" label={c.status} tone={c.status === 'approved' ? 'success' : 'danger'} />,
      <div key="d" style={{ fontSize: 12, color: 'var(--admin-text-dim)' }}>
        {new Date(c.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
      </div>,
      <div key="a" style={{ display: 'flex', gap: 6 }}>
        {c.status === 'approved' && (
          <Button variant="danger" size="sm" onClick={() => act(c.id, 'remove')} disabled={!!busy}>Remove</Button>
        )}
        {c.status === 'removed' && (
          <Button variant="ghost" size="sm" onClick={() => act(c.id, 'restore')} disabled={!!busy}>Restore</Button>
        )}
      </div>,
    ],
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader title="Discussions" subtitle="All user comments across listings, events, routes, news, and the stolen/lost registry." />

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', borderBottom: '1px solid var(--admin-border)' }}>
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => { setTab(key); setPage(1) }} style={tabBtn(tab === key)}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--admin-text-dim)', textTransform: 'uppercase', letterSpacing: '.3px' }}>Type:</span>
        {TYPE_OPTIONS.map(t => (
          <button key={t} onClick={() => { setType(t); setPage(1) }} style={typeBtn(type === t)}>
            {t === 'all' ? 'All' : t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <Empty message="Loading…" />
      ) : (
        <Table head={['Author', 'Target', 'Body', 'Status', 'Posted', 'Actions']} rows={rows} empty="No comments in this view" />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>← Prev</Button>
        <span style={{ fontSize: 12, color: 'var(--admin-text-dim)' }}>Page {page} of {totalPages}</span>
        <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next →</Button>
      </div>
    </div>
  )
}
