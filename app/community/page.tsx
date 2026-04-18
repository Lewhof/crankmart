import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { getCountry } from '@/lib/country'
import { ShieldAlert, Search, MessageCircle, MapPin, Frown, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Community — CrankMart',
  description: 'South African cycling community: stolen bike registry, lost bike reports, serial lookup, and discussion across the marketplace.',
  robots: { index: true, follow: true },
}

export const revalidate = 120

interface StolenSummary {
  id: string
  brand: string
  model: string | null
  stolen_location: string | null
  stolen_date: string | null
  created_at: string
  proof_photo_url: string | null
}
interface LostSummary {
  id: string
  brand: string
  model: string | null
  last_seen_location: string | null
  last_seen_date: string | null
  created_at: string
  proof_photo_url: string | null
}
interface HotCommentRow {
  id: string
  target_type: string
  target_id: string
  body: string
  created_at: string
  handle: string | null
  name: string
  avatar_url: string | null
}

async function fetchHub() {
  const country = await getCountry()
  const [stolenRes, lostRes, hotRes, countsRes] = await Promise.all([
    db.execute(sql`
      SELECT id, brand, model, stolen_location, stolen_date, created_at, proof_photo_url
      FROM stolen_reports
      WHERE status = 'approved' AND country = ${country}
      ORDER BY created_at DESC LIMIT 6
    `),
    db.execute(sql`
      SELECT id, brand, model, last_seen_location, last_seen_date, created_at, proof_photo_url
      FROM lost_reports
      WHERE status = 'approved' AND country = ${country}
      ORDER BY created_at DESC LIMIT 6
    `),
    db.execute(sql`
      SELECT c.id, c.target_type, c.target_id, LEFT(c.body, 180) AS body, c.created_at,
             u.handle, u.name, u.avatar_url
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.status = 'approved'
      ORDER BY c.created_at DESC LIMIT 8
    `),
    db.execute(sql`
      SELECT
        (SELECT COUNT(*)::int FROM stolen_reports WHERE status = 'approved' AND country = ${country}) AS stolen_total,
        (SELECT COUNT(*)::int FROM stolen_reports WHERE status = 'recovered' AND country = ${country}) AS stolen_recovered,
        (SELECT COUNT(*)::int FROM lost_reports   WHERE status = 'approved' AND country = ${country}) AS lost_total,
        (SELECT COUNT(*)::int FROM users          WHERE is_active AND banned_at IS NULL AND country = ${country}) AS members_total
    `),
  ])

  return {
    stolen:  (stolenRes.rows ?? stolenRes) as unknown as StolenSummary[],
    lost:    (lostRes.rows ?? lostRes) as unknown as LostSummary[],
    hot:     (hotRes.rows ?? hotRes) as unknown as HotCommentRow[],
    counts:  ((countsRes.rows ?? countsRes) as Array<{
      stolen_total: number; stolen_recovered: number; lost_total: number; members_total: number
    }>)[0],
  }
}

export default async function CommunityHubPage() {
  const hub = await fetchHub()

  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : null

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 80px', fontFamily: 'system-ui, sans-serif', color: '#1a1a1a' }}>

      {/* Hero */}
      <section style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>CrankMart Community</h1>
        <p style={{ fontSize: 15, color: '#4b5563', margin: '6px 0 0', maxWidth: 640, lineHeight: 1.55 }}>
          SA&apos;s dedicated registry for stolen + lost bikes, serial-number checks, and community conversations across every listing, event, and route.
        </p>

        {/* Stat strip */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
          <Stat label="Stolen on file" value={hub.counts?.stolen_total ?? 0} />
          <Stat label="Recovered" value={hub.counts?.stolen_recovered ?? 0} tone="good" />
          <Stat label="Lost reports" value={hub.counts?.lost_total ?? 0} />
          <Stat label="Members" value={hub.counts?.members_total ?? 0} />
        </div>
      </section>

      {/* Pillar cards */}
      <section style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 40 }}>
        <PillarCard
          href="/community/check"
          icon={<Search size={20} />}
          title="Check a serial"
          body="Buying a used bike? Paste the frame serial and see if it&apos;s been reported stolen."
        />
        <PillarCard
          href="/community/stolen"
          icon={<ShieldAlert size={20} />}
          title="Stolen registry"
          body="Browse verified stolen-bike reports by province, brand, or date."
        />
        <PillarCard
          href="/community/lost"
          icon={<Frown size={20} />}
          title="Lost & found"
          body="Lost your bike somewhere? Post a description; the community helps look."
        />
        <PillarCard
          href="/community/stolen/report"
          icon={<MapPin size={20} />}
          title="Report stolen"
          body="Add your bike to the registry. SAPS case + photo auto-approves instantly."
        />
      </section>

      {/* Two-col: stolen + lost recent */}
      <section style={{ display: 'grid', gap: 28, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <div>
          <SectionHeader title="Recently reported stolen" href="/community/stolen" />
          {hub.stolen.length === 0 ? (
            <EmptyNote>No stolen reports yet.</EmptyNote>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {hub.stolen.map(s => (
                <RegistryRow
                  key={s.id}
                  href={`/community/stolen/${s.id}`}
                  thumb={s.proof_photo_url}
                  title={`${s.brand}${s.model ? ' ' + s.model : ''}`}
                  meta={[s.stolen_location ?? null, fmt(s.stolen_date) ?? `Reported ${fmt(s.created_at)}`].filter(Boolean).join(' · ')}
                  tone="danger"
                />
              ))}
            </div>
          )}
        </div>
        <div>
          <SectionHeader title="Lost & found" href="/community/lost" />
          {hub.lost.length === 0 ? (
            <EmptyNote>No lost reports yet. Be the first to post one.</EmptyNote>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {hub.lost.map(l => (
                <RegistryRow
                  key={l.id}
                  href={`/community/lost/${l.id}`}
                  thumb={l.proof_photo_url}
                  title={`${l.brand}${l.model ? ' ' + l.model : ''}`}
                  meta={[l.last_seen_location ?? null, fmt(l.last_seen_date) ?? `Reported ${fmt(l.created_at)}`].filter(Boolean).join(' · ')}
                  tone="warn"
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Hot comments */}
      <section style={{ marginTop: 44 }}>
        <SectionHeader title="Latest discussion" icon={<MessageCircle size={16} />} />
        {hub.hot.length === 0 ? (
          <EmptyNote>No discussion yet. Start a conversation on any listing or event.</EmptyNote>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {hub.hot.map(h => (
              <HotCommentRowUI key={h.id} row={h} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'good' }) {
  return (
    <div style={{
      padding: '10px 14px', background: '#fff', border: '1px solid #ebebeb', borderRadius: 8,
      minWidth: 110, display: 'flex', flexDirection: 'column', gap: 2,
    }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: .3 }}>
        {label}
      </span>
      <span style={{ fontSize: 20, fontWeight: 800, color: tone === 'good' ? '#059669' : '#1a1a1a' }}>
        {value.toLocaleString('en-ZA')}
      </span>
    </div>
  )
}

function PillarCard({ href, icon, title, body }: { href: string; icon: React.ReactNode; title: string; body: string }) {
  return (
    <Link href={href} style={{
      display: 'flex', flexDirection: 'column', gap: 8,
      padding: 18, background: '#fff', border: '1px solid #ebebeb', borderRadius: 10,
      textDecoration: 'none', color: 'inherit', transition: 'border-color .15s, transform .15s',
    }}>
      <span style={{
        width: 36, height: 36, borderRadius: 8, background: 'rgba(234,88,12,.08)',
        color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>{icon}</span>
      <span style={{ fontSize: 15, fontWeight: 800, color: '#1a1a1a' }}>{title}</span>
      <span style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{body}</span>
    </Link>
  )
}

function SectionHeader({ title, href, icon }: { title: string; href?: string; icon?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <h2 style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a', margin: 0, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: .4 }}>
        {icon} {title}
      </h2>
      {href && (
        <Link href={href} prefetch={false} style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}>
          See all →
        </Link>
      )}
    </div>
  )
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: 20, background: '#fff', border: '1px dashed #e4e4e7', borderRadius: 8, fontSize: 13, color: '#9a9a9a', textAlign: 'center' }}>
      {children}
    </div>
  )
}

function RegistryRow({ href, thumb, title, meta, tone }: {
  href: string; thumb: string | null; title: string; meta: string; tone: 'danger' | 'warn'
}) {
  const borderLeft = tone === 'danger' ? '#DC2626' : '#D97706'
  return (
    <Link href={href} prefetch={false} style={{
      display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'inherit',
      padding: 10, background: '#fff', border: '1px solid #ebebeb', borderRadius: 8,
      borderLeft: `3px solid ${borderLeft}`,
    }}>
      <span style={{ width: 42, height: 42, borderRadius: 6, background: '#f5f5f5', overflow: 'hidden', flexShrink: 0 }}>
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : null}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
        <span style={{ display: 'block', fontSize: 11, color: '#6b7280', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meta || '—'}</span>
      </span>
    </Link>
  )
}

function HotCommentRowUI({ row }: { row: HotCommentRow }) {
  const targetHref = {
    listing: '/browse',
    event:   '/events',
    route:   '/routes',
    news:    '/news',
    stolen_report: '/community/stolen',
    lost_report:   '/community/lost',
  }[row.target_type] ?? '/community'
  const href = row.target_type === 'stolen_report' || row.target_type === 'lost_report'
    ? `${targetHref}/${row.target_id}`
    : targetHref
  return (
    <Link href={href} prefetch={false} style={{
      display: 'flex', gap: 10, padding: 10, background: '#fff', border: '1px solid #ebebeb',
      borderRadius: 8, textDecoration: 'none', color: 'inherit',
    }}>
      <Users size={14} style={{ marginTop: 2, color: 'var(--color-primary)', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: '#6b7280' }}>
          <strong style={{ color: '#1a1a1a' }}>{row.name}</strong>
          {row.handle ? ` @${row.handle}` : ''}
          {' · '}
          <span style={{ textTransform: 'capitalize' }}>{row.target_type.replace('_', ' ')}</span>
        </div>
        <div style={{ fontSize: 13, color: '#1a1a1a', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {row.body}
        </div>
      </div>
    </Link>
  )
}
