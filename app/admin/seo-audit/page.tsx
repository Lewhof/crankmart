'use client'

import { useEffect, useState, useCallback } from 'react'

type CheckStatus = 'pass' | 'fail' | 'warn' | 'manual' | 'pending'
type CheckCategory = 'content' | 'technical_seo' | 'geo' | 'marketing'

interface CheckResult {
  id: string
  category: CheckCategory
  label: string
  status: CheckStatus
  detail: string
  check_type: 'db' | 'http' | 'code' | 'manual'
  checked_at: string
}

interface AuditResponse {
  results: CheckResult[]
  deep: boolean
  ran_at: string
}

const STATUS_CONFIG: Record<CheckStatus, { icon: string; color: string; bg: string; label: string }> = {
  pass:    { icon: '✅', color: '#16a34a', bg: '#f0fdf4', label: 'PASS' },
  fail:    { icon: '✗',  color: '#dc2626', bg: '#fef2f2', label: 'FAIL' },
  warn:    { icon: '⚠',  color: '#d97706', bg: '#fffbeb', label: 'WARN' },
  manual:  { icon: '○',  color: 'var(--admin-text-dim)', bg: 'var(--admin-surface-2)', label: 'MANUAL' },
  pending: { icon: '⏳', color: 'var(--admin-text-dim)', bg: 'var(--admin-surface-2)', label: 'PENDING' },
}

const CATEGORY_LABELS: Record<CheckCategory | 'all', string> = {
  all: 'All',
  content: 'Content & Data',
  technical_seo: 'Technical SEO',
  geo: 'GEO',
  marketing: 'Marketing',
}

export default function SeoAuditPage() {
  const [results, setResults] = useState<CheckResult[]>([])
  const [ranAt, setRanAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [deepLoading, setDeepLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<CheckCategory | 'all'>('all')
  const [markingId, setMarkingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchAudit = useCallback(async (deep = false) => {
    if (deep) setDeepLoading(true)
    else setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/seo-audit${deep ? '?deep=true' : ''}`)
      if (res.status === 401 || res.status === 403) {
        window.location.href = '/login?callbackUrl=/admin/seo-audit'
        return
      }
      const data: AuditResponse = await res.json()
      if (data.results) {
        setResults(data.results)
        setRanAt(data.ran_at)
      } else {
        setError('Audit failed to return results')
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setLoading(false)
      setDeepLoading(false)
    }
  }, [])

  useEffect(() => { fetchAudit(false) }, [fetchAudit])

  const markManual = async (checkId: string, status: 'done' | 'pending') => {
    setMarkingId(checkId)
    try {
      await fetch('/api/admin/seo-audit/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkId, status }),
      })
      await fetchAudit(false)
    } catch {}
    setMarkingId(null)
  }

  const filtered = activeTab === 'all' ? results : results.filter(r => r.category === activeTab)

  const counts = {
    pass: results.filter(r => r.status === 'pass').length,
    warn: results.filter(r => r.status === 'warn').length,
    fail: results.filter(r => r.status === 'fail').length,
    manual: results.filter(r => r.status === 'manual').length,
  }
  const total = results.length
  const progress = total > 0 ? Math.round((counts.pass / total) * 100) : 0

  const formatTime = (iso: string) => {
    try { return new Date(iso).toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg', hour12: false }) }
    catch { return iso }
  }

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #ebebeb', borderTopColor: '#CC1F2D', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 12px' }} />
        <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
        <p style={{ color: '#666', fontSize: 14 }}>Running audit…</p>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--admin-text)', margin: '0 0 4px' }}>SEO &amp; GEO Audit</h1>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--admin-text-dim)' }}>{ranAt ? `Last run: ${formatTime(ranAt)}` : 'Audit has not been run yet'}</p>
        </div>
        <button
          onClick={() => fetchAudit(true)}
          disabled={deepLoading}
          style={{
            background: deepLoading ? '#aaa' : '#CC1F2D',
            color: 'var(--admin-surface)',
            border: 'none',
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 600,
            cursor: deepLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {deepLoading ? (
            <>
              <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'var(--admin-surface)', borderRadius: '50%', display: 'inline-block', animation: 'spin .8s linear infinite' }} />
              Running…
            </>
          ) : '▶ Run Full Audit'}
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#dc2626', fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Progress bar */}
      {total > 0 && (
        <div style={{ background: 'var(--admin-surface)', border: '1px solid #ebebeb', borderRadius: 10, padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--admin-text)' }}>Overall Progress</span>
            <span style={{ fontSize: 14, color: '#666' }}>{counts.pass} / {total} checks passing</span>
          </div>
          <div style={{ background: 'var(--admin-border)', borderRadius: 99, height: 10, overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, background: progress >= 80 ? '#16a34a' : progress >= 50 ? '#d97706' : '#CC1F2D', height: '100%', borderRadius: 99, transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
            {(['pass', 'warn', 'fail', 'manual'] as const).map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <span>{STATUS_CONFIG[s].icon}</span>
                <span style={{ color: STATUS_CONFIG[s].color, fontWeight: 600 }}>{counts[s]}</span>
                <span style={{ color: 'var(--admin-text-dim)' }}>{STATUS_CONFIG[s].label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
        {(Object.keys(CATEGORY_LABELS) as Array<CheckCategory | 'all'>).map(tab => {
          const tabCount = tab === 'all' ? total : results.filter(r => r.category === tab).length
          const tabFail = tab === 'all' ? counts.fail : results.filter(r => r.category === tab && r.status === 'fail').length
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                border: '1px solid',
                borderColor: activeTab === tab ? '#CC1F2D' : 'var(--admin-border)',
                background: activeTab === tab ? '#CC1F2D' : 'var(--admin-surface)',
                color: activeTab === tab ? 'var(--admin-surface)' : '#444',
                fontSize: 13,
                fontWeight: activeTab === tab ? 600 : 400,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {CATEGORY_LABELS[tab]}
              <span style={{
                background: activeTab === tab ? 'rgba(255,255,255,0.25)' : tabFail > 0 ? '#fee2e2' : 'var(--admin-border)',
                color: activeTab === tab ? 'var(--admin-surface)' : tabFail > 0 ? '#dc2626' : '#666',
                borderRadius: 99,
                padding: '1px 7px',
                fontSize: 11,
                fontWeight: 600,
              }}>
                {tabCount}
              </span>
            </button>
          )
        })}
      </div>

      {/* Check list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--admin-text-dim)', fontSize: 14 }}>No checks in this category</div>
        )}
        {filtered.map(check => {
          const cfg = STATUS_CONFIG[check.status]
          const isManualPending = check.status === 'manual'
          return (
            <div
              key={check.id}
              style={{
                background: 'var(--admin-surface)',
                border: '1px solid',
                borderColor: check.status === 'fail' ? '#fca5a5' : check.status === 'warn' ? '#fde68a' : 'var(--admin-border)',
                borderRadius: 8,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              {/* Status icon */}
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: cfg.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: check.status === 'fail' ? 15 : 16,
                color: cfg.color,
                fontWeight: 700,
                flexShrink: 0,
                marginTop: 1,
              }}>
                {cfg.icon}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--admin-text)' }}>{check.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: cfg.color,
                      background: cfg.bg,
                      border: `1px solid ${cfg.color}30`,
                      borderRadius: 4,
                      padding: '1px 6px',
                      letterSpacing: '0.05em',
                    }}>
                      {cfg.label}
                    </span>
                    <span style={{ fontSize: 10, color: '#bbb', background: 'var(--admin-surface-2)', borderRadius: 4, padding: '1px 6px' }}>
                      {check.check_type.toUpperCase()}
                    </span>
                  </div>
                </div>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: '#888', lineHeight: 1.5 }}>{check.detail}</p>
              </div>

              {/* Manual toggle */}
              {isManualPending && (
                <button
                  onClick={() => markManual(check.id, 'done')}
                  disabled={markingId === check.id}
                  style={{
                    background: 'transparent',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    padding: '5px 12px',
                    fontSize: 12,
                    color: '#444',
                    cursor: markingId === check.id ? 'not-allowed' : 'pointer',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {markingId === check.id ? '…' : 'Mark Done'}
                </button>
              )}
              {check.status === 'pass' && check.check_type === 'manual' && (
                <button
                  onClick={() => markManual(check.id, 'pending')}
                  disabled={markingId === check.id}
                  style={{
                    background: 'transparent',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    padding: '5px 12px',
                    fontSize: 12,
                    color: 'var(--admin-text-dim)',
                    cursor: 'pointer',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Undo
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer note */}
      {total > 0 && (
        <p style={{ marginTop: 20, fontSize: 11, color: '#bbb', textAlign: 'center' }}>
          Fast checks run on page load (DB + code). Click &ldquo;Run Full Audit&rdquo; to also check live URLs, sitemaps, and social profiles.
        </p>
      )}
    </div>
  )
}
