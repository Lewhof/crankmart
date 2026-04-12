'use client'

import { useEffect, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import { useRouter } from 'next/navigation'

const TYPE_COLORS: Record<string, string> = {
  race:          '#EF4444',
  stage_race:    '#0D1B2A',
  fun_ride:      '#10B981',
  social_ride:   '#3B82F6',
  tour:          '#F59E0B',
  training_camp: '#8B5CF6',
  festival:      '#EC4899',
  default:       '#6B7280',
}

interface CalEvent {
  id: string; slug: string; title: string
  event_type: string; city: string; province: string
  event_date_start: string; event_date_end?: string
  is_featured: boolean
}

interface Props {
  events: CalEvent[]
}

export default function EventsCalendar({ events }: Props) {
  const router = useRouter()

  const calEvents = events.map(e => ({
    id:    e.id,
    title: e.title,
    start: e.event_date_start,
    end:   e.event_date_end || e.event_date_start,
    extendedProps: { slug: e.slug, city: e.city, province: e.province, type: e.event_type, featured: e.is_featured },
    backgroundColor: TYPE_COLORS[e.event_type] || TYPE_COLORS.default,
    borderColor:     TYPE_COLORS[e.event_type] || TYPE_COLORS.default,
    textColor:       '#fff',
  }))

  return (
    <div style={{ padding: '20px', maxWidth: 1280, margin: '0 auto' }}>
      <style>{`
        /* FullCalendar overrides — match CycleMart design */
        .fc { font-family: Inter, -apple-system, sans-serif; }
        .fc-toolbar-title { font-size: 16px !important; font-weight: 800 !important; color: #1a1a1a !important; }
        .fc-button-primary {
          background: #fff !important;
          border: 1px solid #e4e4e7 !important;
          color: #1a1a1a !important;
          font-weight: 600 !important;
          font-size: 12px !important;
          border-radius: 2px !important;
          box-shadow: none !important;
          padding: 6px 12px !important;
        }
        .fc-button-primary:hover { background: #f5f5f5 !important; }
        .fc-button-primary:not(:disabled).fc-button-active,
        .fc-button-primary:not(:disabled):active {
          background: #0D1B2A !important;
          border-color: #0D1B2A !important;
          color: #fff !important;
        }
        .fc-col-header-cell { background: #fafafa; }
        .fc-col-header-cell-cushion { font-size: 11px; font-weight: 700; color: #9a9a9a; text-transform: uppercase; letter-spacing: .06em; text-decoration: none !important; }
        .fc-daygrid-day-number { font-size: 12px; font-weight: 600; color: #374151; text-decoration: none !important; }
        .fc-day-today { background: #f0f4ff !important; }
        .fc-day-today .fc-daygrid-day-number { color: #0D1B2A; font-weight: 800; }
        .fc-event { border-radius: 2px !important; font-size: 11px !important; font-weight: 600 !important; padding: 1px 5px !important; cursor: pointer !important; }
        .fc-event:hover { opacity: 0.85; }
        .fc-daygrid-dot-event .fc-event-title { font-size: 11px; font-weight: 600; color: #1a1a1a; }
        .fc-list-event:hover td { background: #f5f5f5 !important; cursor: pointer; }
        .fc-list-event-title a { color: #0D1B2A !important; font-weight: 700 !important; text-decoration: none !important; font-size: 13px !important; }
        .fc-list-event-dot { border-radius: 50% !important; }
        .fc-list-day-cushion { background: #f5f5f5 !important; font-size: 12px !important; font-weight: 700 !important; color: #6b7280 !important; }
        .fc-list-table td { border-color: #f0f0f0 !important; }
        .fc-theme-standard td, .fc-theme-standard th { border-color: #f0f0f0 !important; }
        .fc-scrollgrid { border-radius: 2px; overflow: hidden; }
        .fc-toolbar.fc-header-toolbar { margin-bottom: 16px !important; flex-wrap: wrap; gap: 8px; }
        .fc-popover { border-radius: 2px !important; border: 1px solid #e4e4e7 !important; box-shadow: 0 4px 16px rgba(0,0,0,.1) !important; }
        .fc-popover-header { background: #0D1B2A !important; color: #fff !important; font-size: 12px !important; font-weight: 700 !important; border-radius: 2px 2px 0 0 !important; }
        .fc-more-link { font-size: 10px !important; font-weight: 700 !important; color: var(--color-primary) !important; }
        @media (max-width: 640px) {
          .fc-toolbar-title { font-size: 14px !important; }
          .fc-button-primary { padding: 5px 8px !important; font-size: 11px !important; }
          .fc-daygrid-day-number { font-size: 11px; }
        }
      `}</style>

      <FullCalendar
        plugins={[dayGridPlugin, listPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left:   'prev,next today',
          center: 'title',
          right:  'dayGridMonth,listMonth',
        }}
        buttonText={{
          today:      'Today',
          month:      'Month',
          listMonth:  'Agenda',
        }}
        events={calEvents}
        eventClick={({ event }) => {
          const slug = event.extendedProps?.slug
          if (slug) router.push(`/events/${slug}`)
        }}
        eventDidMount={({ event, el }) => {
          const city     = event.extendedProps?.city
          const province = event.extendedProps?.province
          if (city || province) {
            el.setAttribute('title', `${event.title} — ${city}${province ? ', ' + province : ''}`)
          }
        }}
        dayMaxEvents={3}
        moreLinkContent={({ num }) => `+${num} more`}
        height="auto"
        fixedWeekCount={false}
        showNonCurrentDates={false}
        listDaySideFormat={{ weekday: 'long' }}
        noEventsContent="No events this month"
      />

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 20, padding: '14px 0', borderTop: '1px solid #f0f0f0' }}>
        {Object.entries({
          race: 'Race', stage_race: 'Stage Race', fun_ride: 'Fun Ride',
          social_ride: 'Social Ride', tour: 'Tour', training_camp: 'Training Camp', festival: 'Festival',
        }).map(([key, label]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: TYPE_COLORS[key], flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
