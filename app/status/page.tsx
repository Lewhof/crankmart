import type { Metadata } from 'next'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { buildAlternates } from '@/lib/hreflang'

export const metadata: Metadata = {
  title: 'Status — CrankMart',
  description: 'Live status of CrankMart services: database, email delivery, media uploads, and known issues.',
  alternates: buildAlternates('/status'),
  robots: { index: true, follow: true },
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface CheckResult {
  name: string
  status: 'ok' | 'degraded' | 'down'
  detail?: string
  latencyMs?: number
}

async function checkDb(): Promise<CheckResult> {
  const t0 = Date.now()
  try {
    await db.execute(sql`SELECT 1`)
    return { name: 'Database', status: 'ok', latencyMs: Date.now() - t0 }
  } catch (e) {
    return { name: 'Database', status: 'down', detail: e instanceof Error ? e.message : 'unknown' }
  }
}

async function checkEmail(): Promise<CheckResult> {
  try {
    const res = await db.execute(sql`SELECT value FROM app_settings WHERE key = 'email_notifications_enabled' LIMIT 1`)
    const row = ((res.rows ?? res) as Array<{ value: string }>)[0]
    const enabled = row?.value === 'true'
    return {
      name: 'Email delivery',
      status: enabled ? 'ok' : 'degraded',
      detail: enabled ? undefined : 'Transactional email disabled in settings.',
    }
  } catch {
    return { name: 'Email delivery', status: 'degraded', detail: 'Config unreadable.' }
  }
}

async function checkAnalytics(): Promise<CheckResult> {
  try {
    const res = await db.execute(sql`SELECT COUNT(*)::int AS c FROM page_views WHERE created_at > NOW() - INTERVAL '24 hours'`)
    const row = ((res.rows ?? res) as Array<{ c: number }>)[0]
    const hits = Number(row?.c ?? 0)
    return {
      name: 'Analytics pipeline',
      status: 'ok',
      detail: `${hits.toLocaleString('en-ZA')} pageviews in the last 24 h.`,
    }
  } catch {
    return { name: 'Analytics pipeline', status: 'degraded', detail: 'Recent count query failed.' }
  }
}

function StatusPill({ status }: { status: CheckResult['status'] }) {
  const map = {
    ok:       { label: 'Operational', bg: 'rgba(16,185,129,.12)', color: '#059669', dot: '#10b981' },
    degraded: { label: 'Degraded',    bg: 'rgba(245,158,11,.12)', color: '#b45309', dot: '#f59e0b' },
    down:     { label: 'Down',        bg: 'rgba(239,68,68,.12)',  color: '#b91c1c', dot: '#ef4444' },
  }[status]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 999, background: map.bg, color: map.color, fontSize: 13, fontWeight: 700 }}>
      <span style={{ width: 8, height: 8, borderRadius: 4, background: map.dot }} />
      {map.label}
    </span>
  )
}

export default async function StatusPage() {
  const checks = await Promise.all([checkDb(), checkEmail(), checkAnalytics()])
  const overall: CheckResult['status'] = checks.some(c => c.status === 'down')
    ? 'down'
    : checks.some(c => c.status === 'degraded') ? 'degraded' : 'ok'

  const knownIssues: Array<{ title: string; summary: string; date: string }> = []

  return (
    <main style={{ maxWidth: 720, margin: '48px auto 96px', padding: '0 20px', fontFamily: 'system-ui, sans-serif', color: '#1a1a1a' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1, margin: '0 0 6px' }}>CrankMart Status</h1>
          <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>
            Live checks against our production services. Refreshes on every page load.
          </p>
        </div>
        <StatusPill status={overall} />
      </div>

      <section style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', marginBottom: 32 }}>
        {checks.map((c, i) => (
          <div
            key={c.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              padding: '16px 20px',
              borderTop: i === 0 ? 'none' : '1px solid #f1f5f9',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
              {(c.detail || c.latencyMs !== undefined) && (
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                  {c.latencyMs !== undefined && <span>{c.latencyMs} ms</span>}
                  {c.latencyMs !== undefined && c.detail && <span> · </span>}
                  {c.detail}
                </div>
              )}
            </div>
            <StatusPill status={c.status} />
          </div>
        ))}
      </section>

      <section>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 12px' }}>Known issues</h2>
        {knownIssues.length === 0 ? (
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0, padding: '16px 20px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12 }}>
            No known issues right now. If something looks wrong, email{' '}
            <a href="mailto:info@crankmart.com" style={{ color: '#0D1B2A', fontWeight: 700 }}>info@crankmart.com</a>.
          </p>
        ) : (
          <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
            {knownIssues.map(i => (
              <li key={i.title} style={{ padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 10, marginBottom: 8, background: '#fff' }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{i.title}</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                  {i.date} · {i.summary}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
