'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, ExternalLink, Heart, Share2, Clock } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { CommentThread } from '@/components/community/CommentThread'

interface Event {
  id: string; title: string; slug: string; description: string
  event_type: string; city: string; province: string; venue_name: string; address: string
  event_date_start: string; event_date_end: string
  entry_url: string; entry_status: string; entry_platform: string
  cover_image_url: string; is_featured: boolean; is_verified: boolean
  discipline: string[]; difficulty: string; country: string
  views_count: number; saves_count: number; website_url?: string
  entry_fee?: string; distance?: string; organiser_name?: string; organiser_website?: string
}

const TYPE_COLORS: Record<string, string> = {
  race: '#EF4444', stage_race: '#0D1B2A', fun_ride: '#10B981',
  social_ride: '#3B82F6', tour: '#F59E0B', training_camp: '#8B5CF6',
  festival: '#EC4899',
}
const TYPE_LABELS: Record<string, string> = {
  race: 'Race', stage_race: 'Stage Race', fun_ride: 'Fun Ride',
  social_ride: 'Social Ride', tour: 'Tour', training_camp: 'Training Camp', festival: 'Festival'
}
function gradientFor(type: string) {
  const g: Record<string, string> = {
    race: 'linear-gradient(135deg, #1e3a5f, #0D1B2A)',
    stage_race: 'linear-gradient(135deg, #0D1B2A, #1a5276)',
    fun_ride: 'linear-gradient(135deg, #0d6e4e, #10B981)',
    social_ride: 'linear-gradient(135deg, #1a4f8a, #3B82F6)',
    tour: 'linear-gradient(135deg, #92400e, #F59E0B)',
    training_camp: 'linear-gradient(135deg, #4c1d95, #8B5CF6)',
    festival: 'linear-gradient(135deg, #831843, #EC4899)',
  }
  return g[type] || 'linear-gradient(135deg, #374151, #6B7280)'
}

export default function EventDetail({ event }: { event: Event }) {
  const slug = event.slug
  const [saved, setSaved] = useState(false)
  const [related, setRelated] = useState<Event[]>([])

  useEffect(() => {
    if (!event.event_type) return
    fetch(`/api/events?type=${event.event_type}&limit=3`)
      .then(r => r.json())
      .then(rel => setRelated(Array.isArray(rel) ? rel.filter((e: Event) => e.slug !== slug).slice(0, 3) : []))
      .catch(() => {})
  }, [event.event_type, slug])

  const typeColor = TYPE_COLORS[event.event_type] || '#6B7280'
  const typeLabel = TYPE_LABELS[event.event_type] || event.event_type
  const multiDay = event.event_date_end && event.event_date_start !== event.event_date_end
  const startDate = new Date(event.event_date_start).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const endDate = multiDay ? new Date(event.event_date_end).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }) : null

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: 100 }}>
      <style>{`
        .ev-topbar { background:#fff;border-bottom:1px solid #ebebeb;padding:0;position:sticky;top:60px;z-index:30; }
        .ev-topbar-inner { max-width:1280px;margin:0 auto;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;box-sizing:border-box; }
        @media(min-width:900px) { .ev-topbar-inner { padding:12px 24px; } }
        .ev-wrap { max-width: 1280px; margin: 0 auto; padding: 0 16px; box-sizing: border-box; }
        @media(min-width:900px) { .ev-wrap { padding: 0 24px; } }

        /* Hero — split layout on desktop */
        .ev-hero { margin-top: 16px; }
        @media(min-width:768px) {
          .ev-hero { display: grid; grid-template-columns: 55% 1fr; gap: 16px; }
        }
        .ev-banner { height: 260px; position: relative; overflow: hidden; flex-shrink: 0; }
        @media(min-width:768px) { .ev-banner { height: 100%; min-height: 340px; border-radius: 2px; } }
        .ev-banner-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.55) 0%, rgba(0,0,0,.05) 50%); }
        .ev-banner-content { position: absolute; bottom: 0; left: 0; right: 0; padding: 20px; }
        @media(min-width:768px) { .ev-banner-content { display: none; } }

        /* Details panel — right side on desktop */
        .ev-detail-panel {
          background: #fff;
          padding: 20px;
          display: flex; flex-direction: column; gap: 0;
          border: 1px solid #ebebeb; border-radius: 2px;
        }
        .ev-detail-panel-title {
          font-size: 20px; font-weight: 800; color: #1a1a1a; margin: 0 0 6px; line-height: 1.2;
          display: none;
        }
        .ev-detail-panel-loc { font-size: 13px; color: #6b7280; display: none; align-items: center; gap: 5px; margin-bottom: 16px; }
        @media(min-width:768px) {
          .ev-detail-panel-title { display: block; }
          .ev-detail-panel-loc { display: flex; }
        }
        .ev-type-badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 2px; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 10px; }

        .card { background: #fff; margin: 0; padding: 16px; margin-top: 12px; }
        @media(min-width:768px) { .card { border-radius: 2px; } }
        .sec-title { font-size: 12px; font-weight: 700; color: #9a9a9a; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 12px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .info-item { background: #f5f5f5; border-radius: 2px; padding: 12px; }
        .info-label { font-size: 11px; color: #9a9a9a; font-weight: 600; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 4px; }
        .info-val { font-size: 14px; font-weight: 700; color: #1a1a1a; }
        .btn-enter { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; height: 50px; background: var(--color-primary); color: #fff; border: none; border-radius: 2px; font-size: 15px; font-weight: 700; cursor: pointer; text-decoration: none; }
        .btn-enter:hover { background: #1e2d5a; }
        .btn-save { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; height: 50px; background: #fff; color: #1a1a1a; border: 1.5px solid #e4e4e7; border-radius: 2px; font-size: 15px; font-weight: 700; cursor: pointer; }
        .mobile-cta { position:fixed;bottom:60px;left:0;right:0;background:#fff;border-top:1px solid #ebebeb;padding:12px 16px;z-index:40;display:flex;gap:10px; }
        @media(min-width:768px) { .mobile-cta { display:none; } }
        .related-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .rel-card { background: #fff; border-radius: 2px; border: 1px solid #ebebeb; overflow: hidden; text-decoration: none; display: block; }
        .rel-banner { height: 70px; }
        .rel-body { padding: 8px; }
        .rel-title { font-size: 12px; font-weight: 700; color: #1a1a1a; margin-bottom: 3px; line-height: 1.3; }
        .rel-date { font-size: 10px; color: #9a9a9a; }
        .ev-about-grid { display: grid; grid-template-columns: 1fr; gap: 12px; margin-top: 16px; }
        @media(min-width:768px) { .ev-about-grid { grid-template-columns: 55% 1fr; gap: 16px; } }
      `}</style>

      {/* Topbar */}
      <div className="ev-topbar">
        <div className="ev-topbar-inner">
          <Breadcrumb items={[
            { label: 'Events', href: '/events' },
            { label: event.title },
          ]} />
          <div style={{ display:'flex',gap:8 }}>
            <button onClick={() => setSaved(p => !p)} style={{ width:36,height:36,borderRadius:'50%',background:'#f5f5f5',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <Heart size={16} style={{ fill: saved ? '#ef4444' : 'none', color: saved ? '#ef4444' : '#1a1a1a' }} />
            </button>
            <button style={{ width:36,height:36,borderRadius:'50%',background:'#f5f5f5',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="ev-wrap">

        {/* ── Hero: split layout desktop, stacked mobile ── */}
        <div className="ev-hero">
          {/* Left: banner image */}
          <div className="ev-banner" style={{ background: event.cover_image_url ? `url(${event.cover_image_url}) center/cover` : gradientFor(event.event_type) }}>
            <div className="ev-banner-overlay" />
            {/* Mobile: title overlay on image */}
            <div className="ev-banner-content">
              <span style={{ background: typeColor, color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 2, textTransform: 'uppercase', letterSpacing: '.4px', display: 'inline-block', marginBottom: 8 }}>
                {typeLabel}
              </span>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2 }}>{event.title}</h1>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,.8)', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: 5 }}>
                <MapPin size={11} /> {event.city}, {event.province}
              </p>
            </div>
          </div>

          {/* Right: detail panel (desktop only shows title here; mobile shows it on banner) */}
          <div className="ev-detail-panel">
            <h1 className="ev-detail-panel-title">{event.title}</h1>
            <span className="ev-type-badge" style={{ background: 'transparent', color: '#9a9a9a', border: 'none', padding: '0 0 4px 0', fontSize: 11 }}>{typeLabel}</span>
            <div className="ev-detail-panel-loc"><MapPin size={13} /> {event.venue_name || `${event.city}, ${event.province}`}</div>

            {/* Key info grid inside panel */}
            <div className="info-grid" style={{ flex: 1 }}>
              <div className="info-item">
                <div className="info-label">Start date</div>
                <div className="info-val">{startDate}</div>
              </div>
              {endDate && <div className="info-item"><div className="info-label">End date</div><div className="info-val">{endDate}</div></div>}
              <div className="info-item">
                <div className="info-label">Location</div>
                <div className="info-val">{event.venue_name || `${event.city}, ${event.province}`}</div>
              </div>
              {event.distance && <div className="info-item"><div className="info-label">Distance</div><div className="info-val">{event.distance}</div></div>}
              {event.entry_fee && <div className="info-item" style={{ borderLeft: '3px solid #15803d' }}><div className="info-label">Entry fee</div><div className="info-val" style={{ color: '#15803d' }}>{event.entry_fee}</div></div>}
              {event.difficulty && <div className="info-item"><div className="info-label">Difficulty</div><div className="info-val">{event.difficulty}</div></div>}
            </div>

            {/* CTA inside panel on desktop */}
            {event.entry_url && (
              <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                <a href={event.entry_url} target="_blank" rel="noopener noreferrer" className="btn-enter" style={{ flex: 2 }}>
                  Enter Now <ExternalLink size={15} />
                </a>
                <button className="btn-save" style={{ flex: 1 }} onClick={() => setSaved(p => !p)}>
                  <Heart size={15} style={{ fill: saved ? '#ef4444' : 'none', color: saved ? '#ef4444' : '#1a1a1a' }} />
                  {saved ? 'Saved' : 'Save'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info grid — mobile only (desktop shows inside panel above) */}
        <div className="card" style={{ display: 'block' }} id="mobile-info-grid">
          <style>{`@media(min-width:768px){#mobile-info-grid{display:none!important}}`}</style>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-label">Start date</div>
              <div className="info-val">{startDate}</div>
            </div>
            {endDate && (
              <div className="info-item">
                <div className="info-label">End date</div>
                <div className="info-val">{endDate}</div>
              </div>
            )}
            <div className="info-item">
              <div className="info-label">Location</div>
              <div className="info-val">{event.venue_name || `${event.city}, ${event.province}`}</div>
            </div>
            {event.distance && (
              <div className="info-item">
                <div className="info-label">Distance</div>
                <div className="info-val">{event.distance}</div>
              </div>
            )}
            {event.entry_fee && (
              <div className="info-item" style={{ borderLeft: '3px solid #15803d' }}>
                <div className="info-label">Entry fee</div>
                <div className="info-val" style={{ color: '#15803d' }}>{event.entry_fee}</div>
              </div>
            )}
            {event.difficulty && (
              <div className="info-item">
                <div className="info-label">Difficulty</div>
                <div className="info-val">{event.difficulty}</div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {/* About + Organiser — 2-column on desktop */}
        <div className="ev-about-grid">

          {/* About */}
          {event.description && (
            <div style={{ background: '#fff', borderRadius: 2, padding: 16, border: '1px solid #ebebeb' }}>
              <div className="sec-title">About this event</div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: '#1a1a1a', margin: 0 }}>{event.description}</p>
            </div>
          )}

          {/* Organiser */}
          <div style={{ background: '#fff', borderRadius: 2, padding: 16, border: '1px solid #ebebeb', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="sec-title">Organiser</div>
            <div style={{ background: '#f5f5f5', borderRadius: 2, padding: 14, display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                {(event.organiser_name || event.title)[0]}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>{event.organiser_name || `${event.title} Organising Team`}</div>
                {(event.organiser_website || event.entry_url) && (
                  <a href={event.organiser_website || event.entry_url} target="_blank" rel="noopener" style={{ fontSize: 12, color: 'var(--color-primary)', textDecoration: 'none' }}>
                    Visit website →
                  </a>
                )}
              </div>
            </div>
            {/* Entry CTA inside organiser card */}
            {event.entry_url && (
              <div>
                <a href={event.entry_url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', height: 48, background: 'var(--color-primary)', color: '#fff', borderRadius: 2, fontSize: 14, fontWeight: 800, textDecoration: 'none' }}>
                  <ExternalLink size={16} /> Visit Official Event Website
                </a>
                {event.entry_fee && (
                  <p style={{ textAlign: 'center', fontSize: 12, color: '#15803d', fontWeight: 600, margin: '8px 0 0' }}>
                    Entry from {event.entry_fee}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <CommentThread targetType="event" targetId={event.id} title="Event discussion" />

        {/* Related events */}
        {related.length > 0 && (
          <div className="card" style={{ marginBottom: 80 }}>
            <div className="sec-title">More {typeLabel} events</div>
            <div className="related-grid">
              {related.map(e => (
                <Link key={e.id} href={`/events/${e.slug}`} className="rel-card">
                  <div className="rel-banner" style={{ background: gradientFor(e.event_type) }} />
                  <div className="rel-body">
                    <div className="rel-title">{e.title}</div>
                    <div className="rel-date">{new Date(e.event_date_start).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile sticky CTA */}
      {event.entry_url && (
        <div className="mobile-cta">
          <button className="btn-save" style={{ flex: 1 }} onClick={() => setSaved(p => !p)}>
            <Heart size={16} style={{ fill: saved ? '#ef4444' : 'none', color: saved ? '#ef4444' : '#1a1a1a' }} />
            {saved ? 'Saved' : 'Save'}
          </button>
          <a href={event.entry_url} target="_blank" rel="noopener noreferrer" className="btn-enter" style={{ flex: 2 }}>
            Visit Website <ExternalLink size={14} />
          </a>
        </div>
      )}
    </div>
  )
}
