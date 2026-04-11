'use client'

import { useEffect, useState } from 'react'

interface Business {
  id: string
  name: string
  city: string | null
  province: string | null
  business_type: string
  status: string
  outreach_sent_at: string | null
  claimed_at: string | null
  verified_at: string | null
  created_at: string
  email: string | null
  phone: string | null
}

const STATUS_TABS = [
  { key: 'pending',      label: 'Pending',        color: '#92400E', bg: '#FEF3C7' },
  { key: 'outreach',     label: 'Outreach Sent',  color: '#1D4ED8', bg: '#DBEAFE' },
  { key: 'claimed',      label: 'Claimed',        color: '#065F46', bg: '#D1FAE5' },
  { key: 'suspended',    label: 'Suspended',      color: '#991B1B', bg: '#FEE2E2' },
]

const TYPE_OPTIONS = ['all', 'shop', 'brand', 'service_center', 'tour_operator', 'event_organiser']

export default function VerificationsPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pending')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [tabCounts, setTabCounts] = useState<Record<string, number>>({})
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchData = async (t = tab, type = typeFilter, p = page) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status: t, type, page: p.toString() })
      const res = await fetch(`/api/admin/verifications?${params}`)
      const data = await res.json()
      setBusinesses(data.businesses ?? [])
      setTotalPages(data.pagination?.totalPages ?? 1)
      setTotalCount(data.pagination?.totalCount ?? 0)
      if (data.counts) setTabCounts(data.counts)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData(tab, typeFilter, page) }, [tab, typeFilter, page])

  const handleTabChange = (t: string) => { setTab(t); setPage(1) }
  const handleTypeChange = (t: string) => { setTypeFilter(t); setPage(1) }

  const handleAction = async (id: string, action: string) => {
    setActionLoading(`${id}:${action}`)
    try {
      await fetch(`/api/admin/verifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      await fetchData(tab, typeFilter, page)
    } catch {
      // silent
    } finally {
      setActionLoading(null)
    }
  }

  const fmt = (iso: string | null) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', margin: '0 0 4px' }}>Verifications</h1>
        <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Review and manage business verification requests</p>
      </div>

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', borderBottom: '2px solid #ebebeb', paddingBottom: 0 }}>
        {STATUS_TABS.map(({ key, label }) => {
          const count = tabCounts[key] ?? 0
          const active = tab === key
          return (
            <button key={key} onClick={() => handleTabChange(key)}
              style={{
                padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                background: 'none', border: 'none',
                borderBottom: active ? '2px solid #0D1B2A' : '2px solid transparent',
                color: active ? '#0D1B2A' : '#9a9a9a', marginBottom: -2,
                display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
              }}>
              {label}
              {count > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: active ? '#0D1B2A' : '#f0f0f0', color: active ? '#fff' : '#6b7280' }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Type filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type:</span>
        {TYPE_OPTIONS.map(t => (
          <button key={t} onClick={() => handleTypeChange(t)}
            style={{
              padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', borderRadius: 6,
              border: typeFilter === t ? '1.5px solid #0D1B2A' : '1.5px solid #e4e4e7',
              background: typeFilter === t ? '#0D1B2A' : '#fff',
              color: typeFilter === t ? '#fff' : '#374151',
            }}>
            {t === 'all' ? 'All' : t.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 8, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
            <div style={{ width: 28, height: 28, border: '3px solid #ebebeb', borderTopColor: '#0D1B2A', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
            <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
          </div>
        ) : businesses.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9a9a9a', fontSize: 14 }}>No businesses in this view</div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#fafafa', borderBottom: '2px solid #f0f0f0' }}>
                    {['Name', 'Type', 'City', 'Created', 'Outreach', 'Claimed', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {businesses.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{b.name}</div>
                        {b.email && <div style={{ fontSize: 11, color: '#9a9a9a', marginTop: 2 }}>{b.email}</div>}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: '#f0f0f0', color: '#374151' }}>
                          {b.business_type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#374151' }}>
                        {b.city || '—'}{b.province ? `, ${b.province}` : ''}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#6b7280', fontSize: 12 }}>{fmt(b.created_at)}</td>
                      <td style={{ padding: '12px 14px', color: '#6b7280', fontSize: 12 }}>{fmt(b.outreach_sent_at)}</td>
                      <td style={{ padding: '12px 14px', color: '#6b7280', fontSize: 12 }}>{fmt(b.claimed_at)}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {tab === 'pending' && (
                            <button onClick={() => handleAction(b.id, 'send-outreach')}
                              disabled={actionLoading === `${b.id}:send-outreach`}
                              style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: '#DBEAFE', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#1D4ED8' }}>
                              Send Outreach
                            </button>
                          )}
                          {tab === 'claimed' && (
                            <>
                              <button onClick={() => handleAction(b.id, 'verify')}
                                disabled={!!actionLoading}
                                style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: '#D1FAE5', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#065F46' }}>
                                Verify
                              </button>
                              <button onClick={() => handleAction(b.id, 'suspend')}
                                disabled={!!actionLoading}
                                style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: '#FEE2E2', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#991B1B' }}>
                                Suspend
                              </button>
                            </>
                          )}
                          {tab === 'suspended' && (
                            <button onClick={() => handleAction(b.id, 'reinstate')}
                              disabled={!!actionLoading}
                              style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: '#D1FAE5', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#065F46' }}>
                              Reinstate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '14px 16px', borderTop: '1px solid #ebebeb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}
                style={{ padding: '7px 16px', borderRadius: 6, border: '1.5px solid #e4e4e7', background: page === 1 ? '#f5f5f5' : '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, opacity: page === 1 ? 0.5 : 1 }}>
                ← Prev
              </button>
              <span style={{ fontSize: 13, color: '#9a9a9a' }}>Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                style={{ padding: '7px 16px', borderRadius: 6, border: '1.5px solid #e4e4e7', background: page === totalPages ? '#f5f5f5' : '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, opacity: page === totalPages ? 0.5 : 1 }}>
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
