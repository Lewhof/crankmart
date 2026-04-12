'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Check, X, Star, Eye, ExternalLink, Mail, Globe, User } from 'lucide-react'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  author_name: string
  author_email: string
  status: string
  is_featured: boolean
  created_at: string
  published_at: string
  views_count: number
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  pending:  { bg: '#FEF9C3', color: '#854D0E' },
  approved: { bg: '#DCFCE7', color: '#166534' },
  rejected: { bg: '#FEE2E2', color: '#991B1B' },
}

// ─── Cycling Sources Data ──────────────────────────────────────────────────────
const OUTLETS = [
  // South Africa
  { name: 'Cyclingnews SA', url: 'https://cyclingnews.com', region: 'SA/Global', type: 'Magazine', focus: 'Road, MTB, Racing', contact: 'editorial@cyclingnews.com' },
  { name: 'Bicycling South Africa', url: 'https://bicycling.co.za', region: 'SA', type: 'Magazine', focus: 'Road, MTB, Lifestyle', contact: 'editor@bicycling.co.za' },
  { name: 'MTB South Africa', url: 'https://www.facebook.com/MTBSouthAfrica', region: 'SA', type: 'Social/Community', focus: 'MTB', contact: '' },
  { name: 'Gravel Cyclist SA', url: 'https://gravelcyclist.com', region: 'SA', type: 'Online', focus: 'Gravel, Adventure', contact: '' },
  { name: 'Ride Magazine', url: 'https://ridemagazine.co.za', region: 'SA', type: 'Magazine', focus: 'Road, Cycling Culture', contact: 'info@ridemagazine.co.za' },
  { name: 'SA Mountain Bike', url: 'https://www.samountainbike.co.za', region: 'SA', type: 'Online', focus: 'MTB Racing & Trails', contact: '' },
  { name: 'ProCycling SA', url: 'https://procyclingsa.com', region: 'SA', type: 'Online', focus: 'Road Racing', contact: '' },
  // International
  { name: 'Cyclingnews', url: 'https://cyclingnews.com', region: 'Global', type: 'Magazine', focus: 'Road, Racing, Tech', contact: 'editorial@cyclingnews.com' },
  { name: 'Velonews', url: 'https://velonews.com', region: 'USA', type: 'Magazine', focus: 'Road, Gravel, Race Coverage', contact: 'editor@velonews.com' },
  { name: 'BikeRadar', url: 'https://bikeradar.com', region: 'UK', type: 'Online', focus: 'MTB, Road, Reviews', contact: 'editorial@bikeradar.com' },
  { name: 'Pinkbike', url: 'https://pinkbike.com', region: 'Global', type: 'Online', focus: 'MTB', contact: 'info@pinkbike.com' },
  { name: 'Cycling Weekly', url: 'https://cyclingweekly.com', region: 'UK', type: 'Magazine', focus: 'Road, Racing', contact: 'cycling.weekly@timeinc.uk' },
  { name: 'Road.cc', url: 'https://road.cc', region: 'UK', type: 'Online', focus: 'Road, Commuting, Reviews', contact: 'newsdesk@road.cc' },
  { name: 'Velo', url: 'https://velo.outsideonline.com', region: 'USA', type: 'Magazine', focus: 'Road, Racing, Lifestyle', contact: '' },
  { name: 'Singletracks MTB', url: 'https://singletracks.com', region: 'USA', type: 'Online', focus: 'MTB Trails', contact: '' },
  { name: 'GravelCyclist.com', url: 'https://gravelcyclist.com', region: 'USA', type: 'Online', focus: 'Gravel', contact: '' },
  { name: 'Escape Collective', url: 'https://escapecollective.com', region: 'Global', type: 'Online', focus: 'Road, Culture, Deep-dives', contact: 'hello@escapecollective.com' },
]

const JOURNALISTS = [
  // South Africa
  { name: 'Selma Uahengo', outlet: 'Bicycling SA', region: 'SA', beat: 'Road, MTB, Features', twitter: '', email: '' },
  { name: 'Stuart Bailey', outlet: 'Ride Magazine', region: 'SA', beat: 'Road Racing, Pro Cycling', twitter: '@stuartbailey', email: '' },
  { name: 'Yolande de Villiers', outlet: 'Bicycling SA', region: 'SA', beat: 'Lifestyle, Women\'s Cycling', twitter: '', email: '' },
  { name: 'Myles Kelsey', outlet: 'Freelance', region: 'SA', beat: 'MTB, Adventure, Epic Rides', twitter: '', email: '' },
  // International
  { name: 'Daniel Benson', outlet: 'Cyclingnews', region: 'Global', beat: 'Road Racing, Pro Cycling', twitter: '@dbenson_cn', email: '' },
  { name: 'Barry Ryan', outlet: 'Cyclingnews', region: 'Global', beat: 'Road, Grand Tours', twitter: '@BarryRyanCN', email: '' },
  { name: 'James Huang', outlet: 'CyclingTips / Escape Collective', region: 'Global', beat: 'Tech, Components, Reviews', twitter: '@jameshuang', email: '' },
  { name: 'Matt Beaudin', outlet: 'Velonews', region: 'USA', beat: 'Gravel, MTB, Features', twitter: '@mbeaudin', email: '' },
  { name: 'Joe Lindsey', outlet: 'Freelance (Velo, Bicycling)', region: 'USA', beat: 'Bikes, Industry, Long-form', twitter: '@joelindsey', email: '' },
  { name: 'Caley Fretz', outlet: 'Escape Collective', region: 'Global', beat: 'Road Racing, Culture', twitter: '@caleyfretz', email: '' },
  { name: 'Adam Becket', outlet: 'Cycling Weekly', region: 'UK', beat: 'Road, Racing, Pro Cycling', twitter: '@AdamBecket_CW', email: '' },
  { name: 'Chris Marshall-Bell', outlet: 'Road.cc', region: 'UK', beat: 'Road, Reviews, Tech', twitter: '@cmarshallbell', email: '' },
  { name: 'Laura Fletcher', outlet: 'Bikeradar', region: 'UK', beat: 'MTB, Gravel, Women\'s', twitter: '', email: '' },
  { name: 'Seb Stott', outlet: 'Pinkbike', region: 'Global', beat: 'MTB Tech, Reviews', twitter: '@sebstott', email: '' },
  { name: 'Levy Labrideau', outlet: 'Singletracks', region: 'USA', beat: 'MTB, Trails', twitter: '', email: '' },
]

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminNewsPage() {
  const [tab, setTab] = useState<'articles' | 'sources'>('articles')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [actioning, setActioning] = useState<string | null>(null)
  const [sourceSearch, setSourceSearch] = useState('')
  const [sourceTab, setSourceTab] = useState<'outlets' | 'journalists'>('outlets')

  const fetchArticles = async (status: string) => {
    setLoading(true)
    try {
      const url = status === 'all' ? '/api/admin/news?status=all&limit=200' : `/api/admin/news?status=${status}&limit=200`
      const res = await fetch(url)
      const data = await res.json()
      setArticles(data.articles || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { if (tab === 'articles') fetchArticles(statusFilter) }, [statusFilter, tab])

  const action = async (id: string, act: 'approve' | 'reject' | 'feature') => {
    setActioning(id)
    await fetch('/api/admin/news', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: act }),
    })
    if (act === 'feature') {
      setArticles(prev => prev.map(a => a.id === id ? { ...a, is_featured: !a.is_featured } : a))
    } else {
      // Update status in-place rather than remove, so "all" view stays populated
      const newStatus = act === 'approve' ? 'approved' : 'rejected'
      setArticles(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a))
    }
    setActioning(null)
  }

  const filteredOutlets = OUTLETS.filter(o =>
    o.name.toLowerCase().includes(sourceSearch.toLowerCase()) ||
    o.region.toLowerCase().includes(sourceSearch.toLowerCase()) ||
    o.focus.toLowerCase().includes(sourceSearch.toLowerCase())
  )
  const filteredJournalists = JOURNALISTS.filter(j =>
    j.name.toLowerCase().includes(sourceSearch.toLowerCase()) ||
    j.outlet.toLowerCase().includes(sourceSearch.toLowerCase()) ||
    j.beat.toLowerCase().includes(sourceSearch.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', margin: '0 0 4px' }}>News</h1>
        <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Manage articles, sources and journalist contacts</p>
      </div>

      {/* Main tabs */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '2px solid #ebebeb' }}>
        {[
          { key: 'articles', label: 'All Articles' },
          { key: 'sources',  label: '📡 Sources & Journalists' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            style={{
              padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              background: 'none', border: 'none',
              borderBottom: tab === t.key ? '2px solid #0D1B2A' : '2px solid transparent',
              color: tab === t.key ? '#0D1B2A' : '#9a9a9a',
              marginBottom: -2,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── ARTICLES TAB ── */}
      {tab === 'articles' && (
        <>
          {/* Status filter */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['all', 'pending', 'approved', 'rejected'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                style={{
                  padding: '7px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  border: '1.5px solid',
                  borderColor: statusFilter === s ? '#0D1B2A' : '#ebebeb',
                  background: statusFilter === s ? '#0D1B2A' : '#fff',
                  color: statusFilter === s ? '#fff' : '#374151',
                }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
              <div style={{ width: 28, height: 28, border: '3px solid #ebebeb', borderTopColor: '#0D1B2A', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
              <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
            </div>
          ) : articles.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 8, padding: '40px', textAlign: 'center', color: '#9a9a9a' }}>
              No articles found
            </div>
          ) : (
            <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 8, overflow: 'hidden' }}>
              {/* Summary row */}
              <div style={{ padding: '12px 20px', borderBottom: '1px solid #ebebeb', display: 'flex', gap: 16, fontSize: 13, color: '#6b7280' }}>
                <span><strong style={{ color: '#1a1a1a' }}>{articles.length}</strong> articles</span>
                {['pending','approved','rejected'].map(s => {
                  const n = articles.filter(a => a.status === s).length
                  if (!n) return null
                  const st = STATUS_STYLE[s]
                  return <span key={s} style={{ background: st.bg, color: st.color, padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: 12 }}>{n} {s}</span>
                })}
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f0f0f0', background: '#fafafa' }}>
                      {['Title', 'Category', 'Author', 'Status', 'Views', 'Date', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map(a => {
                      const st = STATUS_STYLE[a.status] || { bg: '#f0f0f0', color: '#666' }
                      return (
                        <tr key={a.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                          <td style={{ padding: '10px 14px', maxWidth: 280 }}>
                            <div style={{ fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {a.is_featured && <span title="Featured" style={{ marginRight: 4 }}>⭐</span>}
                              {a.title}
                            </div>
                            <div style={{ fontSize: 11, color: '#9a9a9a', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.excerpt?.slice(0, 80)}</div>
                          </td>
                          <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                            <span style={{ background: '#E9ECF5', color: '#0D1B2A', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{a.category}</span>
                          </td>
                          <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 600, color: '#374151' }}>{a.author_name || '—'}</div>
                            <div style={{ fontSize: 11, color: '#9a9a9a' }}>{a.author_email}</div>
                          </td>
                          <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                            <span style={{ background: st.bg, color: st.color, padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>{a.status}</span>
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#0D1B2A' }}>
                            {Number(a.views_count || 0).toLocaleString()}
                          </td>
                          <td style={{ padding: '10px 14px', whiteSpace: 'nowrap', color: '#9a9a9a', fontSize: 12 }}>
                            {new Date(a.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              {a.status === 'approved' && (
                                <Link href={`/news/${a.slug}`} target="_blank"
                                  style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 10px', border: '1.5px solid #e4e4e7', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#1a1a1a', textDecoration: 'none' }}>
                                  <Eye size={12} />
                                </Link>
                              )}
                              <button onClick={() => action(a.id, 'feature')} disabled={actioning === a.id}
                                title={a.is_featured ? 'Unfeature' : 'Feature'}
                                style={{ display: 'flex', alignItems: 'center', padding: '5px 10px', border: '1.5px solid', borderColor: a.is_featured ? '#854D0E' : '#e4e4e7', borderRadius: 6, cursor: 'pointer', background: a.is_featured ? '#FEF9C3' : '#fff', color: a.is_featured ? '#854D0E' : '#9a9a9a' }}>
                                <Star size={12} />
                              </button>
                              {a.status === 'pending' && (
                                <>
                                  <button onClick={() => action(a.id, 'approve')} disabled={actioning === a.id}
                                    style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 10px', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: '#10B981', color: '#fff' }}>
                                    <Check size={12} /> Approve
                                  </button>
                                  <button onClick={() => action(a.id, 'reject')} disabled={actioning === a.id}
                                    style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 10px', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: '#EF4444', color: '#fff' }}>
                                    <X size={12} />
                                  </button>
                                </>
                              )}
                              {a.status === 'rejected' && (
                                <button onClick={() => action(a.id, 'approve')} disabled={actioning === a.id}
                                  style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 10px', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: '#10B981', color: '#fff' }}>
                                  <Check size={12} /> Approve
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── SOURCES TAB ── */}
      {tab === 'sources' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>
            Cycling media outlets and journalists to approach for content partnerships, press submissions, and coverage.
          </p>

          {/* Search */}
          <input
            type="text"
            placeholder="Search outlets, journalists, regions, beats…"
            value={sourceSearch}
            onChange={e => setSourceSearch(e.target.value)}
            style={{ padding: '10px 14px', border: '1.5px solid #ebebeb', borderRadius: 8, fontSize: 14, width: '100%', maxWidth: 420, outline: 'none', boxSizing: 'border-box' }}
          />

          {/* Sub-tabs */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ key: 'outlets', label: `Outlets (${filteredOutlets.length})` }, { key: 'journalists', label: `Journalists (${filteredJournalists.length})` }].map(t => (
              <button key={t.key} onClick={() => setSourceTab(t.key as any)}
                style={{ padding: '7px 18px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1.5px solid', borderColor: sourceTab === t.key ? '#0D1B2A' : '#ebebeb', background: sourceTab === t.key ? '#0D1B2A' : '#fff', color: sourceTab === t.key ? '#fff' : '#374151' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Outlets */}
          {sourceTab === 'outlets' && (
            <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#fafafa', borderBottom: '2px solid #f0f0f0' }}>
                      {['Outlet', 'Region', 'Type', 'Focus', 'Contact'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOutlets.map((o, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 6, background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Globe size={14} color="#0D1B2A" />
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#1a1a1a' }}>{o.name}</div>
                              <a href={o.url} target="_blank" rel="noopener noreferrer"
                                style={{ fontSize: 11, color: '#3B82F6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
                                {o.url.replace('https://', '')} <ExternalLink size={9} />
                              </a>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                            background: o.region === 'SA' ? '#DCFCE7' : o.region === 'Global' ? '#EDE9FE' : '#EFF6FF',
                            color: o.region === 'SA' ? '#166534' : o.region === 'Global' ? '#5B21B6' : '#1D4ED8',
                          }}>
                            {o.region}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#6b7280' }}>{o.type}</td>
                        <td style={{ padding: '12px 16px', color: '#374151' }}>{o.focus}</td>
                        <td style={{ padding: '12px 16px' }}>
                          {o.contact ? (
                            <a href={`mailto:${o.contact}`}
                              style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#3B82F6', textDecoration: 'none', fontSize: 12 }}>
                              <Mail size={12} /> {o.contact}
                            </a>
                          ) : (
                            <span style={{ color: '#d1d5db', fontSize: 12 }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Journalists */}
          {sourceTab === 'journalists' && (
            <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#fafafa', borderBottom: '2px solid #f0f0f0' }}>
                      {['Name', 'Outlet', 'Region', 'Beat / Speciality', 'Twitter'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJournalists.map((j, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <User size={14} color="#0D1B2A" />
                            </div>
                            <span style={{ fontWeight: 700, color: '#1a1a1a' }}>{j.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#374151' }}>{j.outlet}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                            background: j.region === 'SA' ? '#DCFCE7' : j.region === 'Global' ? '#EDE9FE' : '#EFF6FF',
                            color: j.region === 'SA' ? '#166534' : j.region === 'Global' ? '#5B21B6' : '#1D4ED8',
                          }}>
                            {j.region}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#6b7280' }}>{j.beat}</td>
                        <td style={{ padding: '12px 16px' }}>
                          {j.twitter ? (
                            <a href={`https://twitter.com/${j.twitter.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                              style={{ color: '#3B82F6', textDecoration: 'none', fontSize: 12, display: 'flex', alignItems: 'center', gap: 3 }}>
                              {j.twitter} <ExternalLink size={9} />
                            </a>
                          ) : (
                            <span style={{ color: '#d1d5db', fontSize: 12 }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div style={{ padding: '12px 16px', background: '#f9f9f9', border: '1px solid #ebebeb', borderRadius: 8, fontSize: 12, color: '#9a9a9a' }}>
            💡 Use these contacts to invite journalists to submit articles directly via <Link href="/news/submit" style={{ color: '#0D1B2A', fontWeight: 600 }}>/news/submit</Link>, or to pitch CrankMart as a media partner for SA cycling events and product launches.
          </div>
        </div>
      )}

    </div>
  )
}
