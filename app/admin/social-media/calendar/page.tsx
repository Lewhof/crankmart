'use client'

import { useEffect, useState, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import { PageHeader, Button } from '@/components/admin/primitives'
import { Edit3 } from 'lucide-react'

type PostRow = {
  id: string
  title: string | null
  body: string
  status: string
  scheduled_at: string | null
  created_at: string
  platforms: string[]
}

const STATUS_COLORS: Record<string, string> = {
  draft:      'color-mix(in oklch, var(--admin-text-dim) 45%, transparent)',
  scheduled:  'color-mix(in oklch, var(--admin-warn) 70%, transparent)',
  published:  'color-mix(in oklch, var(--admin-success) 70%, transparent)',
  failed:     'color-mix(in oklch, var(--admin-danger) 75%, transparent)',
  archived:   'color-mix(in oklch, var(--admin-text-dim) 25%, transparent)',
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Array<{ id: string; title: string; start: string; backgroundColor: string; borderColor: string; url: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const r = await fetch('/api/admin/social-media/posts?limit=500', { cache: 'no-store' })
      const { posts } = await r.json() as { posts: PostRow[] }
      setEvents(posts.map(p => {
        const when = p.scheduled_at || p.created_at
        const color = STATUS_COLORS[p.status] ?? STATUS_COLORS.draft
        const label = [p.title || p.body.slice(0, 48), p.platforms?.length ? `(${p.platforms.join(',')})` : ''].filter(Boolean).join(' ')
        return {
          id: p.id,
          title: label || '(untitled)',
          start: when,
          backgroundColor: color,
          borderColor: color,
          url: `/admin/social-media/compose?id=${p.id}`,
        }
      }))
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <PageHeader
        title="Content Calendar"
        subtitle="All posts by scheduled date (or creation date if not scheduled). Click an event to edit."
        actions={<Button href="/admin/social-media/compose" variant="primary"><Edit3 size={14} /> New post</Button>}
      />

      <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--admin-text-dim)', marginBottom: 12, flexWrap: 'wrap' }}>
        {Object.entries(STATUS_COLORS).map(([k, c]) => (
          <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: c }} /> {k}
          </span>
        ))}
      </div>

      {loading ? (
        <div style={{ color: 'var(--admin-text-dim)', fontSize: 13 }}>Loading…</div>
      ) : (
        <div style={{
          background: 'var(--admin-surface)',
          border: '1px solid var(--admin-border)',
          borderRadius: 10,
          padding: 12,
        }}>
          <style>{`
            .fc { font-size: 12px; color: var(--admin-text); }
            .fc a { color: inherit; text-decoration: none; }
            .fc .fc-toolbar-title { font-size: 14px; color: var(--admin-text); }
            .fc .fc-button { background: var(--admin-surface-2); border-color: var(--admin-border); color: var(--admin-text); font-size: 11px; padding: 4px 8px; }
            .fc .fc-button-primary:not(:disabled).fc-button-active { background: var(--admin-accent); border-color: var(--admin-accent); color: #fff; }
            .fc .fc-daygrid-day-number { color: var(--admin-text-dim); }
            .fc .fc-col-header-cell-cushion { color: var(--admin-text-dim); font-size: 10px; text-transform: uppercase; letter-spacing: .3px; }
            .fc-theme-standard td, .fc-theme-standard th { border-color: var(--admin-border); }
          `}</style>
          <FullCalendar
            plugins={[dayGridPlugin, listPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,listWeek' }}
            events={events}
            height="auto"
            eventDisplay="block"
          />
        </div>
      )}
    </div>
  )
}
