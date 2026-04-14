'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Circle, Megaphone, DollarSign, Users, BarChart3, Mail, Sparkles } from 'lucide-react'
import { Card, PageHeader } from '@/components/admin/primitives'

type Item = {
  id: string
  section: string
  section_label: string
  label: string
  description: string | null
  sort_order: number
  is_complete: boolean
  completed_by: string | null
  completed_at: string | null
  completed_by_name: string | null
  notes: string | null
}

type Section = { key: string; label: string; items: Item[]; total: number; done: number }
type ApiResponse = { sections: Section[]; summary: { total: number; done: number; pct: number } }

export default function MarketingPage() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false)

  const load = async () => {
    const r = await fetch('/api/admin/marketing/checklist', { cache: 'no-store' })
    if (r.ok) setData(await r.json())
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const toggle = async (item: Item) => {
    setData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        sections: prev.sections.map((s) => ({
          ...s,
          done: s.items.some((i) => i.id === item.id)
            ? s.done + (item.is_complete ? -1 : 1)
            : s.done,
          items: s.items.map((i) => (i.id === item.id ? { ...i, is_complete: !i.is_complete } : i)),
        })),
        summary: {
          ...prev.summary,
          done: prev.summary.done + (item.is_complete ? -1 : 1),
          pct: Math.round(((prev.summary.done + (item.is_complete ? -1 : 1)) / prev.summary.total) * 100),
        },
      }
    })
    await fetch(`/api/admin/marketing/checklist/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isComplete: !item.is_complete }),
    })
    load()
  }

  const saveNotes = async (id: string, notes: string) => {
    await fetch(`/api/admin/marketing/checklist/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    })
  }

  const overallPct = data?.summary.pct ?? 0
  const ringColor =
    overallPct >= 90
      ? 'var(--admin-success)'
      : overallPct >= 50
      ? 'var(--admin-warn)'
      : 'var(--admin-danger)'

  return (
    <div>
      <PageHeader
        title="Marketing Launch Readiness"
        subtitle="Pre-launch and per-phase checklist tied to v.0_reference_data/CrankMart_Marketing_Strategy_ZA.md. Marketing begins only once the Platform section is 100%."
        actions={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'var(--admin-surface)',
              border: '1px solid var(--admin-border)',
              borderRadius: 10,
              padding: '10px 14px',
            }}
          >
            <div style={{ position: 'relative', width: 56, height: 56, color: ringColor }}>
              <svg width="56" height="56" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r="16" fill="none" stroke="var(--admin-border)" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${overallPct} 100`}
                  strokeLinecap="round"
                  pathLength="100"
                />
              </svg>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--admin-text)',
                }}
              >
                {overallPct}%
              </div>
            </div>
            <div style={{ fontSize: 12 }}>
              <div style={{ color: 'var(--admin-text)', fontWeight: 600 }}>
                {data?.summary.done ?? 0} / {data?.summary.total ?? 0}
              </div>
              <div style={{ color: 'var(--admin-text-dim)' }}>complete</div>
            </div>
          </div>
        }
      />

      {/* Filter toggle */}
      <label
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 13,
          color: 'var(--admin-text-dim)',
          cursor: 'pointer',
          marginBottom: 16,
        }}
      >
        <input
          type="checkbox"
          checked={showIncompleteOnly}
          onChange={(e) => setShowIncompleteOnly(e.target.checked)}
          style={{ accentColor: 'var(--admin-accent)' }}
        />
        Show incomplete only
      </label>

      {loading && (
        <div style={{ color: 'var(--admin-text-dim)', fontSize: 13 }}>Loading…</div>
      )}

      {!loading && (
        <div style={{ display: 'grid', gap: 16 }}>
          {data?.sections.map((section) => {
            const visibleItems = showIncompleteOnly
              ? section.items.filter((i) => !i.is_complete)
              : section.items
            if (visibleItems.length === 0 && showIncompleteOnly) return null
            const pct = section.total === 0 ? 0 : Math.round((section.done / section.total) * 100)

            return (
              <Card key={section.key} padded={false}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '14px 16px',
                    borderBottom: '1px solid var(--admin-border)',
                    background: 'var(--admin-surface-2)',
                    borderRadius: '10px 10px 0 0',
                  }}
                >
                  <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--admin-text)' }}>
                    {section.label}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                    <span style={{ color: 'var(--admin-text-dim)' }}>
                      {section.done} / {section.total}
                    </span>
                    <div
                      style={{
                        width: 96,
                        height: 6,
                        background: 'var(--admin-border)',
                        borderRadius: 999,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: 'var(--admin-accent)',
                          transition: 'width .2s',
                        }}
                      />
                    </div>
                    <span style={{ color: 'var(--admin-text)', fontWeight: 600, width: 36, textAlign: 'right' }}>
                      {pct}%
                    </span>
                  </div>
                </div>

                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {visibleItems.map((item, idx) => (
                    <li
                      key={item.id}
                      style={{
                        padding: '14px 16px',
                        borderTop: idx === 0 ? 'none' : '1px solid var(--admin-border)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <button
                          onClick={() => toggle(item)}
                          aria-label={item.is_complete ? 'Mark incomplete' : 'Mark complete'}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            marginTop: 2,
                            color: item.is_complete ? 'var(--admin-success)' : 'var(--admin-text-dim)',
                            display: 'flex',
                          }}
                        >
                          {item.is_complete ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                        </button>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 13,
                              color: item.is_complete ? 'var(--admin-text-dim)' : 'var(--admin-text)',
                              textDecoration: item.is_complete ? 'line-through' : 'none',
                              lineHeight: 1.45,
                            }}
                          >
                            {item.label}
                          </div>
                          {item.description && (
                            <div style={{ fontSize: 12, color: 'var(--admin-text-dim)', marginTop: 4 }}>
                              {item.description}
                            </div>
                          )}
                          {item.is_complete && item.completed_at && (
                            <div style={{ fontSize: 11, color: 'var(--admin-success)', marginTop: 4 }}>
                              ✓ {item.completed_by_name ?? 'Admin'} ·{' '}
                              {new Date(item.completed_at).toLocaleDateString()}
                            </div>
                          )}
                          <textarea
                            defaultValue={item.notes ?? ''}
                            onBlur={(e) => saveNotes(item.id, e.target.value)}
                            placeholder="Add notes…"
                            rows={1}
                            style={{ marginTop: 8, width: '100%', fontSize: 12, resize: 'vertical' }}
                          />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            )
          })}
        </div>
      )}

      {/* Placeholder cards */}
      <div style={{ marginTop: 28 }}>
        <h2
          style={{
            margin: '0 0 4px',
            fontSize: 13,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '.4px',
            color: 'var(--admin-text)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Sparkles size={14} style={{ color: 'var(--admin-text-dim)' }} />
          Coming soon
        </h2>
        <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--admin-text-dim)' }}>
          Additional marketing ops tools planned post-launch. Scaffolded here to reserve layout and navigation.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 12,
          }}
        >
          <PlaceholderCard icon={DollarSign} title="Ad spend tracker" description="Log Meta + Google Ads monthly spend against Phase 2/3 budget bands. ROI per channel." />
          <PlaceholderCard icon={Users} title="Founding Member outreach" description="Shops contacted → claimed → listed → converted funnel. Email merge status." />
          <PlaceholderCard icon={Mail} title="Campaign log" description="Record each campaign (subject, audience, send date, CTR, conversions)." />
          <PlaceholderCard icon={BarChart3} title="KPI dashboard" description="Liquidity, Business Adoption, Organic Traffic, Boost Conversion — monthly snapshots." />
          <PlaceholderCard icon={Megaphone} title="Influencer tracker" description="Micro-influencer partnerships, boost-giveaway codes issued, redemptions." />
          <PlaceholderCard icon={Sparkles} title="Content calendar" description="2–4 SEO articles / month pipeline. Draft → review → published status." />
        </div>
      </div>
    </div>
  )
}

function PlaceholderCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>
  title: string
  description: string
}) {
  return (
    <div
      style={{
        background: 'var(--admin-surface)',
        border: '1px dashed var(--admin-border)',
        borderRadius: 10,
        padding: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <Icon size={14} style={{ color: 'var(--admin-text-dim)' }} />
        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--admin-text)' }}>{title}</h3>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '.06em',
            color: 'var(--admin-text-dim)',
            border: '1px solid var(--admin-border)',
            borderRadius: 999,
            padding: '2px 8px',
          }}
        >
          Soon
        </span>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: 'var(--admin-text-dim)', lineHeight: 1.5 }}>
        {description}
      </p>
    </div>
  )
}
