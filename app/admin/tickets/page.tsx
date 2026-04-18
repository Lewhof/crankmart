'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { PageHeader, Table, StatusPill, Button, Empty } from '@/components/admin/primitives'
import { AlertTriangle, Clock } from 'lucide-react'

interface TicketRow {
  id: string
  subject: string
  status: 'todo' | 'snoozed' | 'done'
  priority: 'urgent' | 'high' | 'normal' | 'low'
  category: string | null
  requester_email: string | null
  requester_name: string | null
  assigned_name: string | null
  sla_due_at: string | null
  is_overdue: boolean
  msg_count: number
  created_at: string
}

const TABS = [
  { key: 'todo',    label: 'To do' },
  { key: 'snoozed', label: 'Snoozed' },
  { key: 'done',    label: 'Done' },
  { key: 'all',     label: 'All' },
] as const

const PRI_TONE: Record<TicketRow['priority'], 'neutral' | 'warn' | 'danger' | 'accent'> = {
  urgent: 'danger',
  high:   'warn',
  normal: 'neutral',
  low:    'neutral',
}

export default function TicketsPage() {
  const [tab, setTab] = useState<typeof TABS[number]['key']>('todo')
  const [priority, setPriority] = useState('all')
  const [assigned, setAssigned] = useState<'all' | 'me' | 'unassigned'>('all')
  const [rows, setRows] = useState<TicketRow[]>([])
  const [counts, setCounts] = useState<{ todo: number; snoozed: number; done: number }>({ todo: 0, snoozed: 0, done: 0 })
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status: tab, priority, assigned })
      const res = await fetch(`/api/admin/tickets?${params}`)
      const data = await res.json()
      setRows(data.tickets ?? [])
      if (data.counts) setCounts(data.counts)
    } finally { setLoading(false) }
  }, [tab, priority, assigned])
  useEffect(() => { load() }, [load])

  const timeUntil = (iso: string | null): string => {
    if (!iso) return '—'
    const diffMs = new Date(iso).getTime() - Date.now()
    const mins = Math.round(diffMs / 60000)
    if (mins < 0) return `${Math.round(-mins / 60)}h overdue`
    if (mins < 60) return `${mins}m left`
    const hours = Math.round(mins / 60)
    if (hours < 48) return `${hours}h left`
    return `${Math.round(hours / 24)}d left`
  }

  const tableRows = rows.map(r => ({
    id: r.id,
    cells: [
      <div key="s">
        <Link href={`/admin/tickets/${r.id}`} style={{ fontWeight: 700, color: 'var(--admin-text)', textDecoration: 'none' }}>
          {r.subject}
        </Link>
        <div style={{ fontSize: 11, color: 'var(--admin-text-dim)', marginTop: 2 }}>
          {r.requester_name ?? r.requester_email ?? '—'}
          {r.msg_count > 1 && <span> · {r.msg_count} messages</span>}
          {r.category && <span> · {r.category}</span>}
        </div>
      </div>,
      <div key="p">
        <StatusPill label={r.priority} tone={PRI_TONE[r.priority]} />
      </div>,
      <div key="a" style={{ fontSize: 12 }}>
        {r.assigned_name ?? <span style={{ color: 'var(--admin-text-dim)', fontStyle: 'italic' }}>unassigned</span>}
      </div>,
      <div key="sla" style={{ fontSize: 12, color: r.is_overdue ? 'var(--admin-danger)' : 'var(--admin-text-dim)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {r.is_overdue ? <AlertTriangle size={12} /> : <Clock size={12} />}
        {timeUntil(r.sla_due_at)}
      </div>,
      <div key="c" style={{ fontSize: 12, color: 'var(--admin-text-dim)' }}>
        {new Date(r.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
      </div>,
    ],
  }))

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '8px 14px', background: 'none', border: 'none',
    borderBottom: active ? '2px solid var(--admin-accent)' : '2px solid transparent',
    color: active ? 'var(--admin-accent)' : 'var(--admin-text-dim)',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 6,
  })
  const pillBtn = (active: boolean): React.CSSProperties => ({
    padding: '5px 12px', fontSize: 12, fontWeight: 600, borderRadius: 6,
    background: active ? 'color-mix(in oklch, var(--admin-accent) 20%, transparent)' : 'var(--admin-surface-2)',
    color: active ? 'var(--admin-accent)' : 'var(--admin-text)',
    border: '1px solid', borderColor: active ? 'var(--admin-accent)' : 'var(--admin-border)',
    cursor: 'pointer', textTransform: 'capitalize',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Tickets"
        subtitle="Every inbound action item — contact forms, flags, moderation queues, business-claim replies — routes here. Reply inline; customers get email; threaded replies come back in."
      />

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', borderBottom: '1px solid var(--admin-border)' }}>
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} style={tabBtn(tab === key)}>
            {label}
            {key === 'todo' && counts.todo > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: 'var(--admin-accent)', color: '#fff' }}>{counts.todo}</span>}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--admin-text-dim)', textTransform: 'uppercase', letterSpacing: .3 }}>Priority:</span>
        {['all', 'urgent', 'high', 'normal', 'low'].map(p => (
          <button key={p} onClick={() => setPriority(p)} style={pillBtn(priority === p)}>{p}</button>
        ))}
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--admin-text-dim)', textTransform: 'uppercase', letterSpacing: .3, marginLeft: 12 }}>Assigned:</span>
        {(['all', 'me', 'unassigned'] as const).map(a => (
          <button key={a} onClick={() => setAssigned(a)} style={pillBtn(assigned === a)}>{a}</button>
        ))}
      </div>

      {loading ? <Empty message="Loading…" /> : (
        <Table head={['Subject', 'Priority', 'Assignee', 'SLA', 'Created']} rows={tableRows} empty="No tickets in this view." />
      )}
    </div>
  )
}
