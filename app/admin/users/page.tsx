'use client'

import { useEffect, useState, useCallback } from 'react'
import { Shield, ShieldOff, Ban, Check } from 'lucide-react'
import {
  PageHeader, Card, Table, StatusPill, toneForStatus, Button, Empty,
} from '@/components/admin/primitives'

interface User {
  id: string
  name: string
  email: string
  avatar_url: string
  created_at: string
  role: string | null
  status: string
  listing_count: number
}

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [adminOnly, setAdminOnly] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        search,
        adminOnly: adminOnly.toString(),
      })
      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      setUsers(data.users ?? [])
      setTotalPages(data.pagination?.totalPages ?? 1)
    } finally {
      setLoading(false)
    }
  }, [page, search, adminOnly])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  async function handleAction(id: string, action: string) {
    setActionLoading(id)
    try {
      await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      await fetchUsers()
    } finally {
      setActionLoading(null)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '7px 10px',
    borderRadius: 6,
    border: '1px solid var(--admin-border)',
    background: 'var(--admin-surface-2)',
    color: 'var(--admin-text)',
    fontSize: 13,
  }
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    marginBottom: 6,
    color: 'var(--admin-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '.3px',
  }

  const rows = users.map(u => ({
    id: u.id,
    cells: [
      <div key="u" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--admin-surface-2)',
          border: '1px solid var(--admin-border)',
          color: 'var(--admin-text)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700,
        }}>{initials(u.name || '?')}</div>
        <div>
          <div style={{ fontWeight: 600 }}>{u.name}</div>
          {(u.role === 'admin' || u.role === 'superadmin') && <StatusPill label={u.role} tone="accent" />}
        </div>
      </div>,
      <span key="e" style={{ color: 'var(--admin-text-dim)' }}>{u.email}</span>,
      <span key="d" style={{ color: 'var(--admin-text-dim)' }}>{new Date(u.created_at).toLocaleDateString()}</span>,
      <span key="l">{u.listing_count}</span>,
      <StatusPill key="s" label={u.status === 'banned' ? 'Banned' : 'Active'} tone={toneForStatus(u.status === 'banned' ? 'banned' : 'active')} />,
      <div key="a" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {(u.role === 'admin' || u.role === 'superadmin') ? (
          <Button variant="danger" size="sm" onClick={() => handleAction(u.id, 'remove_admin')} disabled={!!actionLoading}>
            <ShieldOff size={12} /> Demote
          </Button>
        ) : (
          <Button variant="primary" size="sm" onClick={() => handleAction(u.id, 'make_admin')} disabled={!!actionLoading}>
            <Shield size={12} /> Promote
          </Button>
        )}
        {u.status === 'banned' ? (
          <Button variant="primary" size="sm" onClick={() => handleAction(u.id, 'unban')} disabled={!!actionLoading}>
            <Check size={12} /> Unban
          </Button>
        ) : (
          <Button variant="danger" size="sm" onClick={() => handleAction(u.id, 'ban')} disabled={!!actionLoading}>
            <Ban size={12} /> Ban
          </Button>
        )}
      </div>,
    ],
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader title="Users" subtitle="Manage accounts, admin roles and bans" />

      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div>
            <label style={labelStyle}>Search</label>
            <input
              type="text"
              placeholder="Name or email…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--admin-text)' }}>
              <input type="checkbox" checked={adminOnly} onChange={e => { setAdminOnly(e.target.checked); setPage(1) }} />
              <span style={{ fontSize: 13 }}>Admin only</span>
            </label>
          </div>
        </div>
      </Card>

      {loading ? (
        <Empty message="Loading users…" />
      ) : (
        <Table head={['User', 'Email', 'Joined', 'Listings', 'Status', 'Actions']} rows={rows} empty="No users match." />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(Math.max(1, page - 1))}>← Prev</Button>
        <span style={{ color: 'var(--admin-text-dim)', fontSize: 12 }}>Page {page} of {totalPages}</span>
        <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage(Math.min(totalPages, page + 1))}>Next →</Button>
      </div>
    </div>
  )
}
