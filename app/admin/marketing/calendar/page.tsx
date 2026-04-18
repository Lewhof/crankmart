'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import { PageHeader, Empty } from '@/components/admin/primitives'

interface CampaignCalendarRow {
  id: string
  name: string
  status: string
  scheduled_at: string | null
  sent_at: string | null
}

const STATUS_COLOR: Record<string, string> = {
  draft:     '#9a9a9a',
  scheduled: '#F59E0B',
  sending:   '#3B82F6',
  sent:      '#10B981',
  cancelled: '#6b7280',
  failed:    '#EF4444',
}

export default function MarketingCalendarPage() {
  const [events, setEvents] = useState<Array<{ id: string; title: string; start: string; color: string; url: string }>>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/marketing/campaigns?status=all')
      const data = await res.json()
      const rows = (data.campaigns ?? []) as CampaignCalendarRow[]
      setEvents(rows
        .filter(r => r.scheduled_at || r.sent_at)
        .map(r => ({
          id: r.id,
          title: `${r.name} · ${r.status}`,
          start: (r.sent_at ?? r.scheduled_at) as string,
          color: STATUS_COLOR[r.status] ?? '#9a9a9a',
          url: `/admin/marketing/campaigns/${r.id}`,
        })))
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Campaign calendar"
        subtitle="Scheduled + sent campaigns for this country. Click to jump to a campaign."
      />

      {loading ? (
        <Empty message="Loading…" />
      ) : events.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--admin-text-dim)' }}>
          No scheduled or sent campaigns yet.{' '}
          <Link href="/admin/marketing/campaigns/new" style={{ color: 'var(--admin-accent)' }}>Create one →</Link>
        </div>
      ) : (
        <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: 10, padding: 16 }}>
          <FullCalendar
            plugins={[dayGridPlugin, listPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,listWeek' }}
            events={events}
            height={640}
            eventDisplay="block"
          />
        </div>
      )}
    </div>
  )
}
