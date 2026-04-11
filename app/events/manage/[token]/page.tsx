import { db } from '@/db'
import { events } from '@/db/schema'
import { eq, isNotNull } from 'drizzle-orm'
import Link from 'next/link'
import EventManageForm from './EventManageForm'

interface Props {
  params: Promise<{ token: string }>
}

export default async function EventManagePage({ params }: Props) {
  const { token } = await params

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.editToken, token))
    .limit(1)

  if (!event || !event.editToken) {
    return (
      <main style={{ background: '#f9fafb', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ maxWidth: 440, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🗓️</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', margin: '0 0 12px' }}>Link Invalid</h1>
          <p style={{ fontSize: 15, color: '#6b7280', margin: '0 0 24px', lineHeight: 1.6 }}>
            This event management link is invalid or has been revoked.
          </p>
          <Link href="/events" style={{ display: 'inline-block', background: '#0D1B2A', color: '#fff', padding: '11px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
            Browse Events
          </Link>
        </div>
      </main>
    )
  }

  const statusMap: Record<string, { label: string; bg: string; color: string }> = {
    draft:          { label: 'Draft',          bg: '#F3F4F6', color: '#6B7280' },
    pending_review: { label: 'Pending Review',  bg: '#FEF3C7', color: '#92400E' },
    verified:       { label: 'Verified',        bg: '#D1FAE5', color: '#065F46' },
    cancelled:      { label: 'Cancelled',       bg: '#FEE2E2', color: '#991B1B' },
    completed:      { label: 'Completed',       bg: '#DBEAFE', color: '#1D4ED8' },
  }
  const sc = statusMap[event.status ?? 'draft'] ?? statusMap.draft

  return (
    <main style={{ background: '#f9fafb', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/events" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>← Events</Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9a9a', marginBottom: 4 }}>Manage Event</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0D1B2A', margin: 0 }}>{event.title}</h1>
          </div>
          <span style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: sc.bg, color: sc.color, flexShrink: 0, marginTop: 4 }}>
            {sc.label}
          </span>
        </div>

        <EventManageForm event={event} token={token} />
      </div>
    </main>
  )
}
