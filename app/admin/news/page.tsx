'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Check, X, Star, Eye, ExternalLink, Mail, Globe, User } from 'lucide-react'
import {
  PageHeader, Table, StatusPill, toneForStatus, Button, Empty,
} from '@/components/admin/primitives'

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

const OUTLETS = [
  { name: 'Cyclingnews SA', url: 'https://cyclingnews.com', region: 'SA/Global', type: 'Magazine', focus: 'Road, MTB, Racing', contact: 'editorial@cyclingnews.com' },
  { name: 'Bicycling South Africa', url: 'https://bicycling.co.za', region: 'SA', type: 'Magazine', focus: 'Road, MTB, Lifestyle', contact: 'editor@bicycling.co.za' },
  { name: 'MTB South Africa', url: 'https://www.facebook.com/MTBSouthAfrica', region: 'SA', type: 'Social/Community', focus: 'MTB', contact: '' },
  { name: 'Gravel Cyclist SA', url: 'https://gravelcyclist.com', region: 'SA', type: 'Online', focus: 'Gravel, Adventure', contact: '' },
  { name: 'Ride Magazine', url: 'https://ridemagazine.co.za', region: 'SA', type: 'Magazine', focus: 'Road, Cycling Culture', contact: 'info@ridemagazine.co.za' },
  { name: 'SA Mountain Bike', url: 'https://www.samountainbike.co.za', region: 'SA', type: 'Online', focus: 'MTB Racing & Trails', contact: '' },
  { name: 'ProCycling SA', url: 'https://procyclingsa.com', region: 'SA', type: 'Online', focus: 'Road Racing', contact: '' },
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
  { name: 'Selma Uahengo', outlet: 'Bicycling SA', region: 'SA', beat: 'Road, MTB, Features', twitter: '' },
  { name: 'Stuart Bailey', outlet: 'Ride Magazine', region: 'SA', beat: 'Road Racing, Pro Cycling', twitter: '@stuartbailey' },
  { name: 'Yolande de Villiers', outlet: 'Bicycling SA', region: 'SA', beat: "Lifestyle, Women's Cycling", twitter: '' },
  { name: 'Myles Kelsey', outlet: 'Freelance', region: 'SA', beat: 'MTB, Adventure, Epic Rides', twitter: '' },
  { name: 'Daniel Benson', outlet: 'Cyclingnews', region: 'Global', beat: 'Road Racing, Pro Cycling', twitter: '@dbenson_cn' },
  { name: 'Barry Ryan', outlet: 'Cyclingnews', region: 'Global', beat: 'Road, Grand Tours', twitter: '@BarryRyanCN' },
  { name: 'James Huang', outlet: 'CyclingTips / Escape Collective', region: 'Global', beat: 'Tech, Components, Reviews', twitter: '@jameshuang' },
  { name: 'Matt Beaudin', outlet: 'Velonews', region: 'USA', beat: 'Gravel, MTB, Features', twitter: '@mbeaudin' },
  { name: 'Joe Lindsey', outlet: 'Freelance (Velo, Bicycling)', region: 'USA', beat: 'Bikes, Industry, Long-form', twitter: '@joelindsey' },
  { name: 'Caley Fretz', outlet: 'Escape Collective', region: 'Global', beat: 'Road Racing, Culture', twitter: '@caleyfretz' },
  { name: 'Adam Becket', outlet: 'Cycling Weekly', region: 'UK', beat: 'Road, Racing, Pro Cycling', twitter: '@AdamBecket_CW' },
  { name: 'Chris Marshall-Bell', outlet: 'Road.cc', region: 'UK', beat: 'Road, Reviews, Tech', twitter: '@cmarshallbell' },
  { name: 'Laura Fletcher', outlet: 'Bikeradar', region: 'UK', beat: "MTB, Gravel, Women's", twitter: '' },
  { name: 'Seb Stott', outlet: 'Pinkbike', region: 'Global', beat: 'MTB Tech, Reviews', twitter: '@sebstott' },
  { name: 'Levy Labrideau', outlet: 'Singletracks', region: 'USA', beat: 'MTB, Trails', twitter: '' },
]

export default function AdminNewsPage() {
  const [tab, setTab] = useState<'articles' | 'sources'>('articles')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [actioning, setActioning] = useState<string | null>(null)
  const [sourceSearch, setSourceSearch] = useState('')
  const [sourceTab, setSourceTab] = useState<'outlets' | 'journalists'>('outlets')

  const fetchArticles = useCallback(async (status: string) => {
    setLoading(true)
    try {
      const url = status === 'all' ? '/api/admin/news?status=all&limit=200' : `/api/admin/news?status=${status}&limit=200`
      const res = await fetch(url)
      const data = await res.json()
      setArticles(data.articles || [])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { if (tab === 'articles') fetchArticles(statusFilter) }, [statusFilter, tab, fetchArticles])

  async function action(id: string, act: 'approve' | 'reject' | 'feature') {
    setActioning(id)
    try {
      await fetch('/api/admin/news', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: act }),
      })
      if (act === 'feature') {
        setArticles(prev => prev.map(a => a.id === id ? { ...a, is_featured: !a.is_featured } : a))
      } else {
        const newStatus = act === 'approve' ? 'approved' : 'rejected'
        setArticles(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a))
      }
    } finally {
      setActioning(null)
    }
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

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    background: 'none', border: 'none',
    borderBottom: active ? '2px solid var(--admin-accent)' : '2px solid transparent',
    color: active ? 'var(--admin-accent)' : 'var(--admin-text-dim)',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
  })
  const pillBtn = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
    border: '1px solid',
    borderColor: active ? 'var(--admin-accent)' : 'var(--admin-border)',
    background: active ? 'color-mix(in oklch, var(--admin-accent) 20%, transparent)' : 'var(--admin-surface-2)',
    color: active ? 'var(--admin-accent)' : 'var(--admin-text)',
  })

  const articleRows = articles.map(a => ({
    id: a.id,
    cells: [
      <div key="t" style={{ maxWidth: 320 }}>
        <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {a.is_featured && <Star size={11} style={{ color: 'var(--admin-warn)', marginRight: 4 }} />}
          {a.title}
        </div>
        <div style={{ fontSize: 11, color: 'var(--admin-text-dim)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {a.excerpt?.slice(0, 80)}
        </div>
      </div>,
      <StatusPill key="c" label={a.category} tone="neutral" />,
      <div key="au">
        <div style={{ fontWeight: 600 }}>{a.author_name || '—'}</div>
        <div style={{ fontSize: 11, color: 'var(--admin-text-dim)' }}>{a.author_email}</div>
      </div>,
      <StatusPill key="s" label={a.status} tone={toneForStatus(a.status)} />,
      <span key="v">{Number(a.views_count || 0).toLocaleString()}</span>,
      <span key="d" style={{ color: 'var(--admin-text-dim)', fontSize: 12 }}>
        {new Date(a.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
      </span>,
      <div key="a" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {a.status === 'approved' && (
          <Button variant="ghost" size="sm" href={`/news/${a.slug}`}><Eye size={12} /></Button>
        )}
        <Button variant={a.is_featured ? 'primary' : 'ghost'} size="sm" onClick={() => action(a.id, 'feature')} disabled={actioning === a.id}>
          <Star size={12} />
        </Button>
        {a.status === 'pending' && (
          <>
            <Button variant="primary" size="sm" onClick={() => action(a.id, 'approve')} disabled={actioning === a.id}>
              <Check size={12} /> Approve
            </Button>
            <Button variant="danger" size="sm" onClick={() => action(a.id, 'reject')} disabled={actioning === a.id}>
              <X size={12} />
            </Button>
          </>
        )}
        {a.status === 'rejected' && (
          <Button variant="primary" size="sm" onClick={() => action(a.id, 'approve')} disabled={actioning === a.id}>
            <Check size={12} /> Approve
          </Button>
        )}
      </div>,
    ],
  }))

  const outletRows = filteredOutlets.map((o, i) => ({
    id: String(i),
    cells: [
      <div key="n" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Globe size={13} style={{ color: 'var(--admin-accent)' }} />
        </div>
        <div>
          <div style={{ fontWeight: 600 }}>{o.name}</div>
          <a href={o.url} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 11, color: 'var(--admin-accent)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
            {o.url.replace('https://', '')} <ExternalLink size={9} />
          </a>
        </div>
      </div>,
      <StatusPill key="r" label={o.region} tone={o.region === 'SA' ? 'success' : o.region === 'Global' ? 'accent' : 'neutral'} />,
      <span key="t" style={{ color: 'var(--admin-text-dim)' }}>{o.type}</span>,
      <span key="f">{o.focus}</span>,
      o.contact
        ? <a key="c" href={`mailto:${o.contact}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--admin-accent)', textDecoration: 'none', fontSize: 12 }}>
            <Mail size={12} /> {o.contact}
          </a>
        : <span key="c" style={{ color: 'var(--admin-text-dim)', fontSize: 12 }}>—</span>,
    ],
  }))

  const journalistRows = filteredJournalists.map((j, i) => ({
    id: String(i),
    cells: [
      <div key="n" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <User size={13} style={{ color: 'var(--admin-accent)' }} />
        </div>
        <span style={{ fontWeight: 600 }}>{j.name}</span>
      </div>,
      <span key="o">{j.outlet}</span>,
      <StatusPill key="r" label={j.region} tone={j.region === 'SA' ? 'success' : j.region === 'Global' ? 'accent' : 'neutral'} />,
      <span key="b" style={{ color: 'var(--admin-text-dim)' }}>{j.beat}</span>,
      j.twitter
        ? <a key="t" href={`https://twitter.com/${j.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--admin-accent)', textDecoration: 'none', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            {j.twitter} <ExternalLink size={9} />
          </a>
        : <span key="t" style={{ color: 'var(--admin-text-dim)', fontSize: 12 }}>—</span>,
    ],
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader title="News" subtitle="Manage articles, sources and journalist contacts" />

      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--admin-border)' }}>
        {([
          { key: 'articles', label: 'All Articles' },
          { key: 'sources', label: '📡 Sources & Journalists' },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={tabBtn(tab === t.key)}>{t.label}</button>
        ))}
      </div>

      {tab === 'articles' && (
        <>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['all', 'pending', 'approved', 'rejected'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={pillBtn(statusFilter === s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <Empty message="Loading articles…" />
          ) : articles.length === 0 ? (
            <Empty message="No articles found" />
          ) : (
            <Table head={['Title', 'Category', 'Author', 'Status', 'Views', 'Date', 'Actions']} rows={articleRows} />
          )}
        </>
      )}

      {tab === 'sources' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ margin: 0, color: 'var(--admin-text-dim)', fontSize: 13 }}>
            Cycling media outlets and journalists to approach for content partnerships, press submissions, and coverage.
          </p>

          <input
            type="text"
            placeholder="Search outlets, journalists, regions, beats…"
            value={sourceSearch}
            onChange={e => setSourceSearch(e.target.value)}
            style={{
              padding: '9px 12px',
              border: '1px solid var(--admin-border)',
              background: 'var(--admin-surface-2)',
              color: 'var(--admin-text)',
              borderRadius: 6, fontSize: 13, width: '100%', maxWidth: 420,
            }}
          />

          <div style={{ display: 'flex', gap: 8 }}>
            {([
              { key: 'outlets', label: `Outlets (${filteredOutlets.length})` },
              { key: 'journalists', label: `Journalists (${filteredJournalists.length})` },
            ] as const).map(t => (
              <button key={t.key} onClick={() => setSourceTab(t.key)} style={pillBtn(sourceTab === t.key)}>{t.label}</button>
            ))}
          </div>

          {sourceTab === 'outlets' && <Table head={['Outlet', 'Region', 'Type', 'Focus', 'Contact']} rows={outletRows} empty="No outlets match." />}
          {sourceTab === 'journalists' && <Table head={['Name', 'Outlet', 'Region', 'Beat / Speciality', 'Twitter']} rows={journalistRows} empty="No journalists match." />}

          <div style={{ padding: '12px 16px', background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border)', borderRadius: 8, fontSize: 12, color: 'var(--admin-text-dim)' }}>
            💡 Use these contacts to invite journalists to submit articles directly via{' '}
            <Link href="/news/submit" style={{ color: 'var(--admin-accent)', fontWeight: 600 }}>/news/submit</Link>, or to pitch CrankMart as a media partner for SA cycling events and product launches.
          </div>
        </div>
      )}
    </div>
  )
}
