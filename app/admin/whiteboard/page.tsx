'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, X, Trash2, ExternalLink } from 'lucide-react'
import {
  PageHeader, Card, Table, StatusPill, Button, BulkActionBar, Empty,
} from '@/components/admin/primitives'
import type { PillTone } from '@/components/admin/tone'

type Priority = 'urgent' | 'high' | 'medium' | 'low'
type Status = 'backlog' | 'todo' | 'in_progress' | 'done' | 'archived'
type Effort = 's' | 'm' | 'l' | 'xl'

interface Item {
  id: string
  title: string
  description: string | null
  priority: Priority
  status: Status
  effort: Effort | null
  categories: string[]
  sourceUrl: string | null
  owner: string | null
  createdAt: string
  updatedAt: string
}

const PRIORITIES: { value: Priority; label: string; tone: PillTone }[] = [
  { value: 'urgent', label: 'Urgent', tone: 'danger' },
  { value: 'high',   label: 'High',   tone: 'warn' },
  { value: 'medium', label: 'Medium', tone: 'accent' },
  { value: 'low',    label: 'Low',    tone: 'neutral' },
]

const STATUSES: { value: Status; label: string; tone: PillTone }[] = [
  { value: 'backlog',     label: 'Backlog',     tone: 'neutral' },
  { value: 'todo',        label: 'Todo',        tone: 'accent' },
  { value: 'in_progress', label: 'In Progress', tone: 'warn' },
  { value: 'done',        label: 'Done',        tone: 'success' },
  { value: 'archived',    label: 'Archived',    tone: 'neutral' },
]

const EFFORTS: { value: Effort; label: string }[] = [
  { value: 's',  label: 'S' },
  { value: 'm',  label: 'M' },
  { value: 'l',  label: 'L' },
  { value: 'xl', label: 'XL' },
]

const CATEGORIES = ['Customer', 'Admin', 'Infra', 'Compliance', 'SEO', 'Trust', 'Content', 'Mobile', 'Commerce', 'Community']

const PRIORITY_RANK: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 }

function priorityTone(p: Priority): PillTone {
  return PRIORITIES.find(x => x.value === p)?.tone ?? 'neutral'
}
function statusLabel(s: Status): string {
  return STATUSES.find(x => x.value === s)?.label ?? s
}
function statusTone(s: Status): PillTone {
  return STATUSES.find(x => x.value === s)?.tone ?? 'neutral'
}

export default function WhiteboardPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [showArchived, setShowArchived] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [editing, setEditing] = useState<Item | 'new' | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/whiteboard')
      const data = await res.json()
      setItems(data.items ?? [])
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => { load() }, [load])

  const filtered = items.filter(i =>
    (showArchived || i.status !== 'archived') &&
    (filterPriority === 'all' || i.priority === filterPriority) &&
    (filterCategory === 'all' || i.categories.includes(filterCategory))
  )

  // Group by status
  const grouped: Record<Status, Item[]> = { backlog: [], todo: [], in_progress: [], done: [], archived: [] }
  for (const i of filtered) grouped[i.status].push(i)
  for (const s of Object.keys(grouped) as Status[]) {
    grouped[s].sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority])
  }

  async function inlineUpdate(id: string, patch: Partial<Item>) {
    await fetch(`/api/admin/whiteboard/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    await load()
  }

  async function bulkUpdate(patch: Partial<Item>) {
    if (!selected.length) return
    await Promise.all(selected.map(id =>
      fetch(`/api/admin/whiteboard/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
    ))
    setSelected([])
    await load()
  }

  function renderRows(list: Item[]) {
    return list.map(item => ({
      id: item.id,
      cells: [
        <button
          key="t"
          onClick={e => { e.stopPropagation(); setEditing(item) }}
          style={{ background: 'none', border: 'none', color: 'var(--admin-text)', cursor: 'pointer', textAlign: 'left', padding: 0, font: 'inherit' }}
        >
          <div style={{ fontWeight: 600 }}>{item.title}</div>
          {item.description && (
            <div style={{ fontSize: 11, color: 'var(--admin-text-dim)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 520 }}>
              {item.description}
            </div>
          )}
        </button>,
        <select
          key="p"
          value={item.priority}
          onChange={e => inlineUpdate(item.id, { priority: e.target.value as Priority })}
          onClick={e => e.stopPropagation()}
          style={selectStyle}
        >
          {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>,
        <select
          key="s"
          value={item.status}
          onChange={e => inlineUpdate(item.id, { status: e.target.value as Status })}
          onClick={e => e.stopPropagation()}
          style={selectStyle}
        >
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>,
        <span key="e" style={{ color: item.effort ? 'var(--admin-text)' : 'var(--admin-text-dim)' }}>
          {item.effort?.toUpperCase() ?? '—'}
        </span>,
        <div key="c" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {item.categories.map(c => <StatusPill key={c} label={c} tone="neutral" />)}
        </div>,
      ],
    }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Whiteboard"
        subtitle={`${items.filter(i => i.status !== 'archived').length} active · ${items.filter(i => i.status === 'archived').length} archived`}
        actions={
          <Button variant="primary" size="sm" onClick={() => setEditing('new')}>
            <Plus size={14} /> Add Item
          </Button>
        }
      />

      <Card>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <label style={labelStyle}>Priority</label>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value as Priority | 'all')} style={selectStyle}>
              <option value="all">All</option>
              {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={selectStyle}>
              <option value="all">All</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--admin-text)', fontSize: 13 }}>
              <input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} />
              Show archived
            </label>
          </div>
        </div>
      </Card>

      {loading ? (
        <Empty message="Loading…" />
      ) : filtered.length === 0 ? (
        <Empty message="No items match your filters. Try clearing them or add a new item." />
      ) : (
        (['backlog', 'todo', 'in_progress', 'done', 'archived'] as Status[]).map(s => {
          const list = grouped[s]
          if (!list.length) return null
          return (
            <div key={s}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <StatusPill label={statusLabel(s)} tone={statusTone(s)} />
                <span style={{ fontSize: 12, color: 'var(--admin-text-dim)' }}>{list.length} item{list.length !== 1 ? 's' : ''}</span>
              </div>
              <Table
                head={['Title', 'Priority', 'Status', 'Effort', 'Categories']}
                rows={renderRows(list)}
                onSelect={setSelected}
                selectedIds={selected}
              />
            </div>
          )
        })
      )}

      <BulkActionBar count={selected.length} onClear={() => setSelected([])}>
        <select onChange={e => { if (e.target.value) bulkUpdate({ priority: e.target.value as Priority }); e.currentTarget.value = '' }} style={{ ...selectStyle, height: 28 }} defaultValue="">
          <option value="" disabled>Set priority…</option>
          {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <select onChange={e => { if (e.target.value) bulkUpdate({ status: e.target.value as Status }); e.currentTarget.value = '' }} style={{ ...selectStyle, height: 28 }} defaultValue="">
          <option value="" disabled>Set status…</option>
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <Button variant="ghost" size="sm" onClick={() => bulkUpdate({ status: 'archived' })}>Archive</Button>
      </BulkActionBar>

      {editing && (
        <ItemDrawer
          item={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={async () => { await load(); setEditing(null) }}
        />
      )}
    </div>
  )
}

// ─── Drawer ────────────────────────────────────────────────────────────

function ItemDrawer({ item, onClose, onSaved }: { item: Item | null; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(item?.title ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [priority, setPriority] = useState<Priority>(item?.priority ?? 'medium')
  const [status, setStatus] = useState<Status>(item?.status ?? 'backlog')
  const [effort, setEffort] = useState<Effort | ''>(item?.effort ?? '')
  const [categories, setCategories] = useState<string[]>(item?.categories ?? [])
  const [sourceUrl, setSourceUrl] = useState(item?.sourceUrl ?? '')
  const [owner, setOwner] = useState(item?.owner ?? '')
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mark dirty on any change
  const mark = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setDirty(true); setError(null) }

  function toggleCat(cat: string) {
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
    setDirty(true)
  }

  async function save() {
    setSaving(true)
    setError(null)
    const body = {
      title: title.trim(),
      description: description || null,
      priority,
      status,
      effort: effort || null,
      categories,
      sourceUrl: sourceUrl || null,
      owner: owner || null,
    }
    try {
      const url = item ? `/api/admin/whiteboard/${item.id}` : '/api/admin/whiteboard'
      const method = item ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      onSaved()
    } catch (e: any) {
      setError(e.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function del() {
    if (!item) return
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return
    setSaving(true)
    const res = await fetch(`/api/admin/whiteboard/${item.id}`, { method: 'DELETE' })
    if (res.ok) onSaved()
    else {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Delete failed')
      setSaving(false)
    }
  }

  function tryClose() {
    if (dirty && !confirm('Discard unsaved changes?')) return
    onClose()
  }

  return (
    <div
      onClick={tryClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 80, display: 'flex', justifyContent: 'flex-end' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(540px, 100vw)',
          height: '100vh',
          background: 'var(--admin-surface)',
          borderLeft: '1px solid var(--admin-border)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 40px rgba(0,0,0,.2)',
        }}
      >
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--admin-text)' }}>
            {item ? 'Edit item' : 'New item'}
          </h2>
          <button onClick={tryClose} style={{ background: 'none', border: 'none', color: 'var(--admin-text-dim)', cursor: 'pointer' }} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Title">
            <input value={title} onChange={e => mark(setTitle)(e.target.value)} style={inputStyle} autoFocus={!item} />
          </Field>

          <Field label="Description (markdown OK)">
            <textarea
              value={description}
              onChange={e => mark(setDescription)(e.target.value)}
              rows={6}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            <Field label="Priority">
              <select value={priority} onChange={e => mark(setPriority)(e.target.value as Priority)} style={selectStyle}>
                {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={status} onChange={e => mark(setStatus)(e.target.value as Status)} style={selectStyle}>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Effort">
              <select value={effort} onChange={e => mark(setEffort)(e.target.value as Effort | '')} style={selectStyle}>
                <option value="">—</option>
                {EFFORTS.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Categories">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => {
                const on = categories.includes(cat)
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCat(cat)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: on ? 'var(--admin-accent)' : 'var(--admin-border)',
                      background: on ? 'color-mix(in oklch, var(--admin-accent) 20%, transparent)' : 'var(--admin-surface-2)',
                      color: on ? 'var(--admin-accent)' : 'var(--admin-text)',
                    }}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Owner">
              <input value={owner} onChange={e => mark(setOwner)(e.target.value)} style={inputStyle} placeholder="Optional" />
            </Field>
            <Field label="Source URL">
              <input value={sourceUrl} onChange={e => mark(setSourceUrl)(e.target.value)} style={inputStyle} placeholder="Optional" />
            </Field>
          </div>

          {item?.sourceUrl && (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--admin-accent)', textDecoration: 'none' }}
            >
              <ExternalLink size={11} /> Open source link
            </a>
          )}

          {error && (
            <div style={{ padding: '10px 12px', background: 'color-mix(in oklch, var(--admin-danger) 15%, transparent)', border: '1px solid color-mix(in oklch, var(--admin-danger) 40%, transparent)', color: 'var(--admin-danger)', borderRadius: 8, fontSize: 12 }}>
              {error}
            </div>
          )}
        </div>

        <div style={{ padding: 14, borderTop: '1px solid var(--admin-border)', display: 'flex', gap: 10, justifyContent: 'space-between' }}>
          <div>
            {item && (
              <Button variant="danger" size="sm" onClick={del} disabled={saving}>
                <Trash2 size={12} /> Delete
              </Button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" size="sm" onClick={tryClose} disabled={saving}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={save} disabled={saving || !title.trim()}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid var(--admin-border)',
  background: 'var(--admin-surface-2)',
  color: 'var(--admin-text)',
  borderRadius: 6,
  fontSize: 13,
  boxSizing: 'border-box',
}
const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
  height: 32,
}
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--admin-text-dim)',
  marginBottom: 6,
}
