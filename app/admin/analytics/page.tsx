'use client'
import { useEffect, useState } from 'react'

interface Stats {
  pageViews: { total: number; prev: number; change: number | null }
  uniqueVisitors: { total: number; prev: number; change: number | null }
  uniqueSessions: { total: number; prev: number; change: number | null }
  topPages: Array<{ path: string; views: string | number }>
  byDevice: Array<{ device: string; count: string | number }>
  byBrowser: Array<{ browser: string; count: string | number }>
  dailyViews: Array<{ date: string; views: string | number; unique_visitors: string | number }>
  topReferrers: Array<{ referrer: string; count: string | number }>
  listings: { total: number; total_views: number | null }
  users: { total: number; new_users: number }
  businesses: { total: number }
  categoryPerformance: Array<{ category: string; listing_count: string; total_views: string; avg_views: string }>
  sellFunnel: Array<{ path: string; count: string }>
  listingPageViews: number
  byCountry: Array<{ country_code: string; country: string; views: string; visitors: string }>
  byCity: Array<{ city: string; country_code: string; views: string; visitors: string }>
  days: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function delta(change: number | null) {
  if (change === null) return null
  const up = change >= 0
  return (
    <span style={{ fontSize: 12, fontWeight: 700, color: up ? '#10B981' : '#EF4444', marginLeft: 6 }}>
      {up ? '▲' : '▼'} {Math.abs(change)}%
    </span>
  )
}

function SparkLine({ data, color = 'var(--admin-text)', field = 'views' }: {
  data: Array<Record<string, any>>
  color?: string
  field?: string
}) {
  if (!data.length) return <div style={{ padding: '20px 0', color: 'var(--admin-text-dim)', fontSize: 13 }}>No data</div>
  const values = data.map(d => Number(d[field]))
  const max = Math.max(...values, 1)
  const w = 600, h = 100, px = 8, py = 10
  const pts = values.map((v, i) => {
    const x = px + (i / Math.max(values.length - 1, 1)) * (w - px * 2)
    const y = h - py - (v / max) * (h - py * 2)
    return `${x},${y}`
  }).join(' ')
  const areaClose = `${w - px},${h} ${px},${h}`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 100 }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill={`url(#sg-${color.replace('#','')})`} points={`${pts} ${areaClose}`} />
      <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" points={pts} />
      {values.map((v, i) => {
        const x = px + (i / Math.max(values.length - 1, 1)) * (w - px * 2)
        const y = h - py - (v / max) * (h - py * 2)
        return <circle key={i} cx={x} cy={y} r="3" fill={color} />
      })}
    </svg>
  )
}

function HBar({ label, value, max, color = 'var(--admin-text)' }: { label: string; value: number; max: number; color?: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
        <span style={{ color: 'var(--admin-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{label || '—'}</span>
        <span style={{ fontWeight: 700, color: 'var(--admin-text)' }}>{value.toLocaleString()}</span>
      </div>
      <div style={{ height: 6, background: 'var(--admin-border)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min((value / max) * 100, 100)}%`, background: color, borderRadius: 3, transition: 'width .4s' }} />
      </div>
    </div>
  )
}

function KPICard({ label, value, prev, change, color = 'var(--admin-text)', sub }: {
  label: string; value: string | number; prev?: number; change?: number | null; color?: string; sub?: string
}) {
  return (
    <div style={{ background: 'var(--admin-surface)', padding: '20px 22px', borderRadius: 8, border: '1px solid #ebebeb' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--admin-text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 30, fontWeight: 800, color }}>{typeof value === 'number' ? value.toLocaleString() : value}</span>
        {change !== undefined && delta(change ?? null)}
      </div>
      {prev !== undefined && prev > 0 && (
        <div style={{ fontSize: 11, color: 'var(--admin-text-dim)', marginTop: 4 }}>vs {prev.toLocaleString()} prev period</div>
      )}
      {sub && <div style={{ fontSize: 11, color: 'var(--admin-text-dim)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--admin-surface)', border: '1px solid #ebebeb', borderRadius: 8, padding: 20 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h3>
      {children}
    </div>
  )
}

function countryFlag(code: string) {
  if (!code || code.length !== 2 || code === '??') return '🌍'
  try {
    return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1E6 - 65 + c.charCodeAt(0)))
  } catch { return '🌍' }
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)
  const [chartMode, setChartMode] = useState<'views' | 'visitors'>('views')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/analytics/stats?days=${days}`)
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [days])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
      <div style={{ width: 32, height: 32, border: '3px solid #ebebeb', borderTopColor: 'var(--admin-text)', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  )

  if (!stats) return <div style={{ padding: 20, color: 'var(--admin-text-dim)' }}>Failed to load analytics</div>

  const maxDevice  = Math.max(...stats.byDevice.map(d => Number(d.count)), 1)
  const maxBrowser = Math.max(...stats.byBrowser.map(d => Number(d.count)), 1)
  const maxPage    = Math.max(...stats.topPages.map(d => Number(d.views)), 1)
  const maxCatViews = Math.max(...stats.categoryPerformance.map(c => Number(c.total_views)), 1)

  // Sell funnel ordered
  const funnelOrder = ['/sell', '/sell/step-1', '/sell/step-2', '/sell/step-3', '/sell/step-4', '/sell/success']
  const funnelMap: Record<string, number> = {}
  stats.sellFunnel.forEach(r => { funnelMap[r.path] = Number(r.count) })
  const funnelData = funnelOrder.map(p => ({ path: p, count: funnelMap[p] || 0 }))
  const funnelMax = Math.max(...funnelData.map(f => f.count), 1)
  const funnelLabels: Record<string, string> = {
    '/sell': 'Sell landing',
    '/sell/step-1': 'Step 1 — Category',
    '/sell/step-2': 'Step 2 — Details',
    '/sell/step-3': 'Step 3 — Photos',
    '/sell/step-4': 'Step 4 — Price',
    '/sell/success': 'Published ✓',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--admin-text)', margin: '0 0 4px' }}>Analytics</h1>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--admin-text-dim)' }}>Traffic, visitor, and listing performance data</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setDays(d)} style={{
              padding: '7px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              border: '1.5px solid', borderColor: days === d ? 'var(--admin-text)' : 'var(--admin-border)',
              background: days === d ? 'var(--admin-text)' : 'var(--admin-surface)',
              color: days === d ? 'var(--admin-surface)' : 'var(--admin-text)',
            }}>{d}d</button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        <KPICard label="Page Views" value={stats.pageViews.total} prev={stats.pageViews.prev} change={stats.pageViews.change} color="#0D1B2A" />
        <KPICard label="Unique Visitors" value={stats.uniqueVisitors.total} prev={stats.uniqueVisitors.prev} change={stats.uniqueVisitors.change} color="#3B82F6" />
        <KPICard label="Sessions" value={stats.uniqueSessions.total} prev={stats.uniqueSessions.prev} change={stats.uniqueSessions.change} color="#8B5CF6" />
        <KPICard label="Listing Views" value={stats.listingPageViews} color="#F59E0B" sub="visits to /browse/[slug]" />
        <KPICard label="Active Listings" value={stats.listings.total} color="#10B981" sub={`${(Number(stats.listings.total_views) || 0).toLocaleString()} total views`} />
        <KPICard label={`New Users (${days}d)`} value={stats.users.new_users} color="#EF4444" sub={`${stats.users.total} total`} />
      </div>

      {/* Daily trend chart */}
      <Card title={`Daily Trend — Last ${days} Days`}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {(['views', 'visitors'] as const).map(m => (
            <button key={m} onClick={() => setChartMode(m)} style={{
              padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              border: '1.5px solid', borderColor: chartMode === m ? 'var(--admin-text)' : 'var(--admin-border)',
              background: chartMode === m ? 'var(--admin-text)' : 'var(--admin-surface)',
              color: chartMode === m ? 'var(--admin-surface)' : 'var(--admin-text)',
            }}>
              {m === 'views' ? 'Page Views' : 'Unique Visitors'}
            </button>
          ))}
        </div>
        <SparkLine
          data={stats.dailyViews}
          field={chartMode === 'views' ? 'views' : 'unique_visitors'}
          color={chartMode === 'views' ? 'var(--admin-text)' : '#3B82F6'}
        />
        {stats.dailyViews.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--admin-text-dim)' }}>
            <span>{stats.dailyViews[0]?.date}</span>
            <span>{stats.dailyViews[stats.dailyViews.length - 1]?.date}</span>
          </div>
        )}
      </Card>

      {/* Top pages + Device */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        <Card title="Top Pages">
          {stats.topPages.map((p, i) => (
            <HBar key={i} label={p.path} value={Number(p.views)} max={maxPage} color="#0D1B2A" />
          ))}
          {stats.topPages.length === 0 && <div style={{ color: 'var(--admin-text-dim)', fontSize: 13 }}>No data</div>}
        </Card>
        <Card title="Device Breakdown">
          {stats.byDevice.map((d, i) => (
            <HBar key={i} label={d.device} value={Number(d.count)} max={maxDevice}
              color={d.device === 'mobile' ? '#3B82F6' : d.device === 'tablet' ? '#8B5CF6' : 'var(--admin-text)'} />
          ))}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--admin-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Browser</div>
            {stats.byBrowser.map((b, i) => (
              <HBar key={i} label={b.browser} value={Number(b.count)} max={maxBrowser} color="#F59E0B" />
            ))}
          </div>
        </Card>
      </div>

      {/* Category performance */}
      <Card title="Listing Performance by Category">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f0f0f0', background: 'var(--admin-surface-2)' }}>
                {['Category', 'Active Listings', 'Total Views', 'Avg Views / Listing', 'View Share'].map(h => (
                  <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--admin-text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.categoryPerformance.map((c, i) => {
                const pct = Math.round((Number(c.total_views) / maxCatViews) * 100)
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--admin-text)' }}>{c.category || 'Uncategorised'}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--admin-text)' }}>{Number(c.listing_count).toLocaleString()}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--admin-text)' }}>{Number(c.total_views || 0).toLocaleString()}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--admin-text-dim)' }}>{Number(c.avg_views || 0).toLocaleString()}</td>
                    <td style={{ padding: '10px 14px', minWidth: 120 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--admin-border)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: '#10B981', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--admin-text-dim)', width: 32, textAlign: 'right' }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {stats.categoryPerformance.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 20, color: 'var(--admin-text-dim)', textAlign: 'center' }}>No listing data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Location */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        <Card title="Visitors by Country">
          {stats.byCountry.length > 0 ? (() => {
            const maxV = Math.max(...stats.byCountry.map(c => Number(c.views)), 1)
            return (
              <div>
                {stats.byCountry.map((c, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                      <span style={{ color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 18, lineHeight: 1 }}>{countryFlag(c.country_code)}</span>
                        <span>{c.country || c.country_code || 'Unknown'}</span>
                        <span style={{ fontSize: 11, color: 'var(--admin-text-dim)' }}>({c.country_code})</span>
                      </span>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--admin-text-dim)' }}>{Number(c.visitors).toLocaleString()} visitors</span>
                        <span style={{ fontWeight: 700, color: 'var(--admin-text)' }}>{Number(c.views).toLocaleString()}</span>
                      </div>
                    </div>
                    <div style={{ height: 6, background: 'var(--admin-border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min((Number(c.views) / maxV) * 100, 100)}%`, background: '#3B82F6', borderRadius: 3, transition: 'width .4s' }} />
                    </div>
                  </div>
                ))}
              </div>
            )
          })() : (
            <div style={{ color: 'var(--admin-text-dim)', fontSize: 13 }}>No location data yet — accumulates as visitors arrive</div>
          )}
        </Card>

        <Card title="Top Cities">
          {stats.byCity.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <th style={{ padding: '6px 0', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--admin-text-dim)' }}>City</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: 'var(--admin-text-dim)' }}>Visitors</th>
                    <th style={{ padding: '6px 0', textAlign: 'right', fontSize: 11, fontWeight: 700, color: 'var(--admin-text-dim)' }}>Views</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.byCity.map((c, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f9f9f9' }}>
                      <td style={{ padding: '8px 0', color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 16 }}>{countryFlag(c.country_code)}</span>
                        {c.city}
                      </td>
                      <td style={{ padding: '8px 8px', textAlign: 'right', color: 'var(--admin-text-dim)' }}>{Number(c.visitors).toLocaleString()}</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700, color: 'var(--admin-text)' }}>{Number(c.views).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ color: 'var(--admin-text-dim)', fontSize: 13 }}>No city data yet</div>
          )}
        </Card>
      </div>

      {/* Sell funnel + Referrers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        <Card title="Sell Listing Funnel">
          {funnelData.map((f, i) => {
            const dropPct = i > 0 && funnelData[i - 1].count > 0
              ? Math.round((1 - f.count / funnelData[i - 1].count) * 100)
              : null
            return (
              <div key={f.path} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                  <span style={{ color: 'var(--admin-text)' }}>{funnelLabels[f.path]}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {dropPct !== null && dropPct > 0 && (
                      <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 600 }}>−{dropPct}%</span>
                    )}
                    <span style={{ fontWeight: 700, color: 'var(--admin-text)' }}>{f.count.toLocaleString()}</span>
                  </div>
                </div>
                <div style={{ height: 8, background: 'var(--admin-border)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min((f.count / funnelMax) * 100, 100)}%`,
                    background: f.path === '/sell/success' ? '#10B981' : 'var(--admin-text)',
                    borderRadius: 4, transition: 'width .4s',
                  }} />
                </div>
              </div>
            )
          })}
          {funnelMax === 0 && <div style={{ color: 'var(--admin-text-dim)', fontSize: 13 }}>No sell flow traffic yet</div>}
        </Card>

        <Card title="Top Referrers">
          {stats.topReferrers.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <th style={{ padding: '6px 0', textAlign: 'left', fontWeight: 600, color: 'var(--admin-text-dim)', fontSize: 11 }}>Source</th>
                    <th style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600, color: 'var(--admin-text-dim)', fontSize: 11 }}>Visits</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topReferrers.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f9f9f9' }}>
                      <td style={{ padding: '8px 0', color: 'var(--admin-text)', wordBreak: 'break-all', maxWidth: 220, fontSize: 12 }}>{r.referrer}</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700, color: 'var(--admin-text)' }}>{Number(r.count).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ color: 'var(--admin-text-dim)', fontSize: 13 }}>No referrer data yet</div>
          )}
        </Card>
      </div>

    </div>
  )
}
