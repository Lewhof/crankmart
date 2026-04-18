'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { PageHeader, StatusPill, Button, Empty, Card } from '@/components/admin/primitives'
import { Loader, Send, StickyNote, UserCheck, ArrowLeft, Clock, AlertTriangle } from 'lucide-react'

interface Ticket {
  id: string
  subject: string
  status: 'todo' | 'snoozed' | 'done'
  priority: 'urgent' | 'high' | 'normal' | 'low'
  category: string | null
  requester_email: string | null
  requester_name: string | null
  assigned_admin_id: string | null
  assigned_name: string | null
  sla_due_at: string | null
  first_response_at: string | null
  resolved_at: string | null
  created_at: string
  source_listing_id: string | null
  source_flag_id: string | null
  source_stolen_report_id: string | null
  source_lost_report_id: string | null
  source_news_article_id: string | null
  source_business_id: string | null
  source_contact_id: string | null
}

interface Message {
  id: string
  author_type: 'user' | 'admin' | 'system'
  author_name: string | null
  direction: 'inbound' | 'outbound' | 'internal_note'
  body_text: string
  body_html: string | null
  created_at: string
}

const PRI_TONE = { urgent: 'danger', high: 'warn', normal: 'neutral', low: 'neutral' } as const
const STATUS_TONE = { todo: 'warn', snoozed: 'accent', done: 'success' } as const

export default function TicketDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [reply, setReply] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [sending, setSending] = useState(false)
  const [newTag, setNewTag] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/tickets/${id}`)
      const data = await res.json()
      setTicket(data.ticket ?? null)
      setMessages(data.messages ?? [])
      setTags(data.tags ?? [])
    } finally { setLoading(false) }
  }, [id])
  useEffect(() => { load() }, [load])

  async function patchTicket(body: Record<string, unknown>) {
    await fetch(`/api/admin/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    load()
  }

  async function sendReply() {
    if (!reply.trim()) return
    setSending(true)
    try {
      await fetch(`/api/admin/tickets/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bodyText: reply, internalNote: isInternal }),
      })
      setReply('')
      setIsInternal(false)
      load()
    } finally { setSending(false) }
  }

  if (loading) return <Empty message="Loading…" />
  if (!ticket) return <Empty message="Ticket not found." />

  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

  const isOverdue = ticket.sla_due_at && new Date(ticket.sla_due_at) < new Date() && ticket.status !== 'done'

  // Build source-entity link (exclusive-belongs-to).
  const sourceLink = ticket.source_listing_id       ? { href: `/admin/listings`, label: 'Listing' }
                    : ticket.source_flag_id          ? { href: `/admin/community/flags`, label: 'Flag' }
                    : ticket.source_stolen_report_id ? { href: `/admin/stolen-reports`, label: 'Stolen report' }
                    : ticket.source_lost_report_id   ? { href: `/admin/stolen-reports`, label: 'Lost report' }
                    : ticket.source_news_article_id  ? { href: `/admin/news`, label: 'News article' }
                    : ticket.source_business_id      ? { href: `/admin/directory`, label: 'Business' }
                    : ticket.source_contact_id       ? { label: 'Contact-us form' }
                    : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Link href="/admin/tickets" style={{ fontSize: 12, color: 'var(--admin-text-dim)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <ArrowLeft size={12} /> All tickets
        </Link>
      </div>
      <PageHeader title={ticket.subject} subtitle={`Opened by ${ticket.requester_name ?? ticket.requester_email ?? 'unknown'} · ${fmt(ticket.created_at)}`} />

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 1fr) 280px' }}>
        {/* Messages timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map(m => {
            const isAdmin = m.author_type === 'admin'
            const isInternalMsg = m.direction === 'internal_note'
            return (
              <Card key={m.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    <StatusPill
                      label={isInternalMsg ? 'internal note' : (isAdmin ? 'admin reply' : 'customer')}
                      tone={isInternalMsg ? 'accent' : isAdmin ? 'success' : 'neutral'}
                    />
                    <span style={{ color: 'var(--admin-text)', fontWeight: 600 }}>{m.author_name ?? ticket.requester_name ?? 'System'}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--admin-text-dim)' }}>{fmt(m.created_at)}</span>
                </div>
                <div style={{ fontSize: 14, color: 'var(--admin-text)', whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>
                  {m.body_text}
                </div>
              </Card>
            )
          })}

          {/* Reply composer */}
          {ticket.status !== 'done' && (
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--admin-text-dim)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} />
                  <StickyNote size={12} /> Internal note (admin-only)
                </label>
              </div>
              <textarea
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder={isInternal ? 'Leave a note for the team (not sent to the customer)…' : `Reply to ${ticket.requester_name ?? ticket.requester_email ?? 'the requester'}…`}
                style={{
                  width: '100%', minHeight: 100, padding: 10, fontSize: 13,
                  background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border)', borderRadius: 6,
                  color: 'var(--admin-text)', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                <Button variant="primary" size="sm" onClick={sendReply} disabled={!reply.trim() || sending}>
                  {sending ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={13} />}
                  {isInternal ? 'Add note' : 'Send reply'}
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card>
            <h3 style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .4, color: 'var(--admin-text-dim)' }}>
              Details
            </h3>
            <dl style={{ display: 'grid', gap: 8, margin: 0, fontSize: 13 }}>
              <SidebarRow label="Status">
                <div style={{ display: 'flex', gap: 4 }}>
                  {(['todo', 'snoozed', 'done'] as const).map(s => (
                    <button key={s} onClick={() => patchTicket({ status: s })} style={{
                      padding: '3px 9px', fontSize: 11, fontWeight: 600, borderRadius: 4,
                      background: ticket.status === s ? 'var(--admin-accent)' : 'var(--admin-surface-2)',
                      color: ticket.status === s ? '#fff' : 'var(--admin-text)',
                      border: 'none', cursor: 'pointer', textTransform: 'capitalize',
                    }}>{s}</button>
                  ))}
                </div>
              </SidebarRow>
              <SidebarRow label="Priority">
                <div style={{ display: 'flex', gap: 4 }}>
                  {(['urgent', 'high', 'normal', 'low'] as const).map(p => (
                    <button key={p} onClick={() => patchTicket({ priority: p })} style={{
                      padding: '3px 7px', fontSize: 11, fontWeight: 600, borderRadius: 4,
                      background: ticket.priority === p ? 'var(--admin-accent)' : 'var(--admin-surface-2)',
                      color: ticket.priority === p ? '#fff' : 'var(--admin-text)',
                      border: 'none', cursor: 'pointer', textTransform: 'capitalize',
                    }}>{p}</button>
                  ))}
                </div>
              </SidebarRow>
              <SidebarRow label="Assignee">
                {ticket.assigned_name ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{ticket.assigned_name}</span>
                    <button onClick={() => patchTicket({ unassign: true })} style={{ fontSize: 11, color: 'var(--admin-text-dim)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                      unassign
                    </button>
                  </div>
                ) : (
                  <button onClick={() => patchTicket({ assignToMe: true })} style={{
                    padding: '3px 8px', fontSize: 11, fontWeight: 600, borderRadius: 4,
                    background: 'var(--admin-surface-2)', color: 'var(--admin-text)', border: 'none', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}>
                    <UserCheck size={12} /> Assign to me
                  </button>
                )}
              </SidebarRow>
              <SidebarRow label="SLA due">
                <span style={{ color: isOverdue ? 'var(--admin-danger)' : 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {isOverdue ? <AlertTriangle size={12} /> : <Clock size={12} />}
                  {fmt(ticket.sla_due_at)}
                </span>
              </SidebarRow>
              <SidebarRow label="Category">
                <span style={{ textTransform: 'capitalize' }}>{ticket.category ?? '—'}</span>
              </SidebarRow>
              {sourceLink && (
                <SidebarRow label="Source">
                  {sourceLink.href ? (
                    <Link href={sourceLink.href} style={{ color: 'var(--admin-accent)' }}>{sourceLink.label} →</Link>
                  ) : (
                    <span>{sourceLink.label}</span>
                  )}
                </SidebarRow>
              )}
            </dl>
          </Card>

          <Card>
            <h3 style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .4, color: 'var(--admin-text-dim)' }}>
              Tags
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
              {tags.map(t => (
                <button key={t} onClick={() => patchTicket({ removeTag: t })} title="Click to remove" style={{
                  padding: '3px 8px', fontSize: 11, fontWeight: 600, borderRadius: 999,
                  background: 'var(--admin-surface-2)', color: 'var(--admin-text)',
                  border: '1px solid var(--admin-border)', cursor: 'pointer',
                }}>{t} ×</button>
              ))}
            </div>
            <form onSubmit={e => { e.preventDefault(); if (newTag.trim()) { patchTicket({ addTag: newTag.trim() }); setNewTag('') } }}>
              <input value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="Add tag…" style={{
                width: '100%', padding: '6px 10px', fontSize: 12,
                background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border)', borderRadius: 6,
                color: 'var(--admin-text)', outline: 'none', boxSizing: 'border-box',
              }} />
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}

function SidebarRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', alignItems: 'center', gap: 8 }}>
      <dt style={{ fontSize: 11, color: 'var(--admin-text-dim)', fontWeight: 600 }}>{label}</dt>
      <dd style={{ margin: 0, color: 'var(--admin-text)' }}>{children}</dd>
    </div>
  )
}
