'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { PageHeader, Table, StatusPill, Button, Empty } from '@/components/admin/primitives'

interface Member {
  id: string
  handle: string | null
  name: string
  email: string
  role: string
  is_active: boolean
  banned_at: string | null
  ban_reason: string | null
  created_at: string
  comments_total: number
  listings_active: number
}

export default function CommunityMembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [qDebounced, setQDebounced] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => { setQDebounced(q); setPage(1) }, 300)
    return () => clearTimeout(t)
  }, [q])

  const load = useCallback(async (query: string, p: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: p.toString() })
      if (query) params.set('q', query)
      const res = await fetch(`/api/admin/community/members?${params}`)
      const data = await res.json()
      setMembers(data.members ?? [])
      setTotalPages(data.pagination?.totalPages ?? 1)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(qDebounced, page) }, [qDebounced, page, load])

  async function act(id: string, action: 'ban' | 'unban') {
    const reason = action === 'ban' ? prompt('Ban reason (shown internally):') : null
    if (action === 'ban' && reason === null) return // cancelled
    setBusy(`${id}:${action}`)
    try {
      await fetch(`/api/admin/community/members/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason: reason || undefined }),
      })
      await load(qDebounced, page)
    } finally {
      setBusy(null)
    }
  }

  const rows = members.map(m => ({
    id: m.id,
    cells: [
      <div key="u" style={{ fontSize: 12 }}>
        <div style={{ color: 'var(--admin-text)', fontWeight: 600 }}>
          {m.name}
          {m.role !== 'buyer' && (
            <StatusPill label={m.role} tone="accent" />
          )}
        </div>
        <div style={{ color: 'var(--admin-text-dim)', fontSize: 11, marginTop: 2 }}>
          {m.handle ? (
            <Link href={`/u/${m.handle}`} target="_blank" style={{ color: 'var(--admin-accent)' }}>@{m.handle}</Link>
          ) : <span style={{ fontStyle: 'italic' }}>no handle</span>}
          {' · '}{m.email}
        </div>
      </div>,
      <div key="s">
        {m.banned_at ? (
          <StatusPill label="banned" tone="danger" />
        ) : (
          <StatusPill label="active" tone="success" />
        )}
        {m.ban_reason && (
          <div style={{ fontSize: 11, color: 'var(--admin-text-dim)', marginTop: 2, maxWidth: 220 }}>
            {m.ban_reason}
          </div>
        )}
      </div>,
      <div key="c" style={{ fontSize: 12 }}>
        <div><strong>{m.comments_total}</strong> <span style={{ color: 'var(--admin-text-dim)' }}>comments</span></div>
        <div><strong>{m.listings_active}</strong> <span style={{ color: 'var(--admin-text-dim)' }}>listings</span></div>
      </div>,
      <div key="d" style={{ fontSize: 12, color: 'var(--admin-text-dim)' }}>
        {new Date(m.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
      </div>,
      <div key="a" style={{ display: 'flex', gap: 6 }}>
        {m.banned_at ? (
          <Button variant="primary" size="sm" onClick={() => act(m.id, 'unban')} disabled={!!busy}>Unban</Button>
        ) : (
          <Button variant="danger" size="sm" onClick={() => act(m.id, 'ban')} disabled={!!busy}>Ban</Button>
        )}
      </div>,
    ],
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader title="Members" subtitle="Search the community by handle / name / email. Ban bad actors; their listings and comments stay but they can&apos;t sign in." />

      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Search handle, name, or email…"
        style={{
          padding: '9px 12px', fontSize: 13, width: '100%', maxWidth: 360,
          border: '1px solid var(--admin-border)', borderRadius: 6,
          background: 'var(--admin-surface-2)', color: 'var(--admin-text)',
        }}
      />

      {loading ? (
        <Empty message="Loading…" />
      ) : (
        <Table head={['User', 'Status', 'Activity', 'Joined', 'Actions']} rows={rows} empty="No members match." />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>← Prev</Button>
        <span style={{ fontSize: 12, color: 'var(--admin-text-dim)' }}>Page {page} of {totalPages}</span>
        <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next →</Button>
      </div>
    </div>
  )
}
