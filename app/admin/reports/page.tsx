'use client'

import { useEffect, useState } from 'react'

interface ReportData {
  listingsByStatus: Array<{ status: string; count: string }>
  listingsByCategory: Array<{ category: string; count: string }>
  listingsTrend: Array<{ date: string; count: string }>
  avgPriceByCategory: Array<{ category: string; avg_price: string; count: string }>
  topListingsByViews: Array<{ title: string; price: number; views: number; status: string; created_at: string }>
  usersTrend: Array<{ date: string; count: string }>
  usersByProvince: Array<{ province: string; count: string }>
  topSellers: Array<{ name: string; email: string; listing_count: string; sold_count: string; active_count: string }>
  soldListings: Array<{ date: string; count: string }>
  messagesTrend: Array<{ date: string; count: string }>
  boostStats: Array<{ package_name: string; total: string; revenue: string }>
  moderationStats: Array<{ moderation_status: string; count: string }>
  period: number
}

const STATUS_COLORS: Record<string, string> = {
  active: '#10B981',
  sold: '#3B82F6',
  expired: '#F59E0B',
  draft: '#9CA3AF',
  removed: '#EF4444',
  paused: '#8B5CF6',
}

const MODERATION_COLORS: Record<string, string> = {
  approved: '#10B981',
  pending: '#F59E0B',
  rejected: '#EF4444',
  flagged: '#8B5CF6',
}

function SparkLine({ data, color = '#60A5FA' }: { data: Array<{ date: string; count: string }>; color?: string }) {
  if (!data.length) return <div style={{ padding: '20px 0', color: 'var(--admin-text-dim)', fontSize: 13 }}>No data for this period</div>
  const values = data.map(d => Number(d.count))
  const max = Math.max(...values, 1)
  const w = 500, h = 80, padX = 8, padY = 8
  const pts = values.map((v, i) => {
    const x = padX + (i / Math.max(values.length - 1, 1)) * (w - padX * 2)
    const y = h - padY - (v / max) * (h - padY * 2)
    return `${x},${y}`
  }).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 80 }}>
      <defs>
        <linearGradient id={`g-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill={`url(#g-${color.replace('#','')})`}
        stroke="none"
        points={`${padX},${h} ${pts} ${w - padX},${h}`}
      />
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" points={pts} />
      {values.map((v, i) => {
        const x = padX + (i / Math.max(values.length - 1, 1)) * (w - padX * 2)
        const y = h - padY - (v / max) * (h - padY * 2)
        return <circle key={i} cx={x} cy={y} r="3" fill={color} />
      })}
    </svg>
  )
}

function DonutChart({ data, colors }: { data: Array<{ label: string; value: number }>; colors: Record<string, string> }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (!total) return <div style={{ color: 'var(--admin-text-dim)', fontSize: 13 }}>No data</div>
  let offset = 0
  const r = 40, cx = 60, cy = 60, stroke = 18
  const circ = 2 * Math.PI * r
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
      <svg viewBox="0 0 120 120" style={{ width: 120, height: 120, flexShrink: 0 }}>
        {data.map((d, i) => {
          const pct = d.value / total
          const dash = pct * circ
          const gap = circ - dash
          const el = (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={colors[d.label] || '#CBD5E1'}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset * circ}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
          )
          offset += pct
          return el
        })}
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="700" fill="currentColor">
          {total}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="currentColor" opacity="0.6">
          total
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {data.map(d => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: colors[d.label] || '#CBD5E1', flexShrink: 0 }} />
            <span style={{ color: 'var(--admin-text)', textTransform: 'capitalize' }}>{d.label.replace(/_/g, ' ')}</span>
            <span style={{ fontWeight: 700, color: 'var(--admin-text)', marginLeft: 'auto', paddingLeft: 12 }}>{d.value}</span>
            <span style={{ color: 'var(--admin-text-dim)', fontSize: 11 }}>({Math.round((d.value / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function HBar({ label, value, max, color = '#60A5FA', suffix = '' }: {
  label: string; value: number; max: number; color?: string; suffix?: string
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
        <span style={{ color: 'var(--admin-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{label || '—'}</span>
        <span style={{ fontWeight: 700, color: 'var(--admin-text)', flexShrink: 0 }}>{value.toLocaleString()}{suffix}</span>
      </div>
      <div style={{ height: 6, background: 'var(--admin-surface-2)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min((value / max) * 100, 100)}%`, background: color, borderRadius: 3, transition: 'width .4s' }} />
      </div>
    </div>
  )
}

function Card({ title, children, style }: { title: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: 10, padding: 20, ...style }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h3>
      {children}
    </div>
  )
}

function StatPill({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{ background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border)', borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--admin-text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      <span style={{ fontSize: 24, fontWeight: 800, color }}>{value}</span>
    </div>
  )
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(30)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/reports?days=${days}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [days])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--admin-border)', borderTopColor: 'var(--admin-accent)', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  )

  if (error) return (
    <div style={{ background: 'color-mix(in oklch, var(--admin-danger) 15%, transparent)', border: '1px solid color-mix(in oklch, var(--admin-danger) 40%, transparent)', borderRadius: 10, padding: 20, color: 'var(--admin-danger)' }}>
      Failed to load reports: {error}
    </div>
  )

  if (!data) return null

  // Summary stats
  const totalListings = data.listingsByStatus.reduce((s, r) => s + Number(r.count), 0)
  const activeListings = Number(data.listingsByStatus.find(r => r.status === 'active')?.count || 0)
  const soldListingsTotal = Number(data.listingsByStatus.find(r => r.status === 'sold')?.count || 0)
  const totalUsers = data.usersTrend.reduce((s, r) => s + Number(r.count), 0)
  const boostRevenue = data.boostStats.reduce((s, r) => s + Number(r.revenue || 0), 0)
  const totalMessages = data.messagesTrend.reduce((s, r) => s + Number(r.count), 0)

  // Category max for bars
  const catMax = Math.max(...data.listingsByCategory.map(r => Number(r.count)), 1)
  const provMax = Math.max(...data.usersByProvince.map(r => Number(r.count)), 1)
  const priceMax = Math.max(...data.avgPriceByCategory.map(r => Number(r.avg_price)), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--admin-text)', margin: '0 0 4px' }}>Reports</h1>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--admin-text-dim)' }}>Business intelligence and marketplace trends</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setDays(d)}
              style={{
                padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: '1px solid',
                borderColor: days === d ? 'var(--admin-accent)' : 'var(--admin-border)',
                background: days === d ? 'color-mix(in oklch, var(--admin-accent) 20%, transparent)' : 'var(--admin-surface-2)',
                color: days === d ? 'var(--admin-accent)' : 'var(--admin-text)',
              }}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        <StatPill label="Total Listings" value={totalListings.toLocaleString()} color="#60A5FA" />
        <StatPill label="Active" value={activeListings.toLocaleString()} color="#10B981" />
        <StatPill label="Sold" value={soldListingsTotal.toLocaleString()} color="#3B82F6" />
        <StatPill label={`New Users (${days}d)`} value={totalUsers.toLocaleString()} color="#8B5CF6" />
        <StatPill label={`Messages (${days}d)`} value={totalMessages.toLocaleString()} color="#F59E0B" />
        <StatPill label={`Boost Revenue (${days}d)`} value={boostRevenue > 0 ? `R${boostRevenue.toLocaleString()}` : 'R0'} color="#EF4444" />
      </div>

      {/* Row 1: Listings status + Moderation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        <Card title="Listings by Status">
          <DonutChart
            data={data.listingsByStatus.map(r => ({ label: r.status, value: Number(r.count) }))}
            colors={STATUS_COLORS}
          />
        </Card>
        <Card title="Moderation Queue">
          <DonutChart
            data={data.moderationStats.map(r => ({ label: r.moderation_status || 'unknown', value: Number(r.count) }))}
            colors={MODERATION_COLORS}
          />
        </Card>
      </div>

      {/* Row 2: Listings trend */}
      <Card title={`Listings Created — Last ${days} Days`}>
        <SparkLine data={data.listingsTrend} color="#60A5FA" />
        {data.listingsTrend.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--admin-text-dim)' }}>
            <span>{data.listingsTrend[0]?.date}</span>
            <span>{data.listingsTrend[data.listingsTrend.length - 1]?.date}</span>
          </div>
        )}
      </Card>

      {/* Row 3: New users + Messages */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        <Card title={`New Registrations — Last ${days} Days`}>
          <SparkLine data={data.usersTrend} color="#8B5CF6" />
        </Card>
        <Card title={`Conversations Started — Last ${days} Days`}>
          <SparkLine data={data.messagesTrend} color="#F59E0B" />
        </Card>
      </div>

      {/* Row 4: Listings by category + Avg price */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        <Card title="Listings by Category">
          {data.listingsByCategory.map(r => (
            <HBar key={r.category} label={r.category || 'Uncategorised'} value={Number(r.count)} max={catMax} color="#60A5FA" />
          ))}
        </Card>
        <Card title="Avg Active Listing Price by Category">
          {data.avgPriceByCategory.map(r => (
            <HBar key={r.category} label={r.category || 'Uncategorised'} value={Number(r.avg_price)} max={priceMax} color="#10B981" suffix="" />
          ))}
          {data.avgPriceByCategory.length === 0 && <div style={{ color: 'var(--admin-text-dim)', fontSize: 13 }}>No active listings with prices</div>}
        </Card>
      </div>

      {/* Row 5: Users by province */}
      <Card title="Users by Province">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0 24px' }}>
          {data.usersByProvince.map(r => (
            <HBar key={r.province} label={r.province} value={Number(r.count)} max={provMax} color="#8B5CF6" />
          ))}
          {data.usersByProvince.length === 0 && <div style={{ color: 'var(--admin-text-dim)', fontSize: 13 }}>No province data</div>}
        </div>
      </Card>

      {/* Row 6: Top sellers */}
      <Card title="Top Sellers">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                {['#', 'Name', 'Email', 'Total Listings', 'Active', 'Sold'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--admin-text-dim)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.topSellers.map((r, i) => (
                <tr key={r.email} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                  <td style={{ padding: '10px 12px', color: 'var(--admin-text-dim)', fontWeight: 600 }}>{i + 1}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--admin-text)' }}>{r.name || '—'}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--admin-text-dim)' }}>{r.email}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--admin-text)' }}>{r.listing_count}</td>
                  <td style={{ padding: '10px 12px', color: '#10B981', fontWeight: 600 }}>{r.active_count}</td>
                  <td style={{ padding: '10px 12px', color: '#3B82F6', fontWeight: 600 }}>{r.sold_count}</td>
                </tr>
              ))}
              {data.topSellers.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '20px 12px', color: 'var(--admin-text-dim)', textAlign: 'center' }}>No seller data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Row 7: Top listings by views */}
      <Card title="Top Listings by Views">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                {['#', 'Title', 'Price', 'Views', 'Status'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--admin-text-dim)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.topListingsByViews.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                  <td style={{ padding: '10px 12px', color: 'var(--admin-text-dim)', fontWeight: 600 }}>{i + 1}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--admin-text)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</td>
                  <td style={{ padding: '10px 12px', color: '#10B981', fontWeight: 700 }}>R{Number(r.price || 0).toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--admin-text)' }}>{Number(r.views || 0).toLocaleString()}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: `${STATUS_COLORS[r.status] || '#9CA3AF'}20`, color: STATUS_COLORS[r.status] || '#9CA3AF', textTransform: 'capitalize' }}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {data.topListingsByViews.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '20px 12px', color: 'var(--admin-text-dim)', textAlign: 'center' }}>No listings</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Row 8: Boost stats */}
      {data.boostStats.length > 0 && (
        <Card title={`Boost Packages — Last ${days} Days`}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {data.boostStats.map(r => (
              <div key={r.package_name} style={{ background: 'var(--admin-surface-2)', border: '1px solid #ebebeb', borderRadius: 8, padding: '14px 16px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--admin-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{r.package_name}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--admin-text)' }}>{r.total} <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--admin-text-dim)' }}>sold</span></div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#10B981', marginTop: 4 }}>R{Number(r.revenue || 0).toLocaleString()} revenue</div>
              </div>
            ))}
          </div>
        </Card>
      )}

    </div>
  )
}
