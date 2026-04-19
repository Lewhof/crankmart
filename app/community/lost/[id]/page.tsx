import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { Frown, MapPin, Calendar, Gift } from 'lucide-react'
import { CommentThread } from '@/components/community/CommentThread'
import { FlagButton } from '@/components/community/FlagButton'

interface PageProps { params: Promise<{ id: string }> }

interface LostDetail {
  id: string
  serial_number: string | null
  brand: string
  model: string | null
  year: number | null
  colour: string | null
  status: string
  last_seen_date: string | null
  last_seen_location: string | null
  proof_photo_url: string | null
  description: string | null
  reward_text: string | null
  created_at: string
}

async function fetchReport(id: string): Promise<LostDetail | null> {
  const res = await db.execute(sql`
    SELECT id, serial_number, brand, model, year, colour, status,
           last_seen_date, last_seen_location, proof_photo_url,
           description, reward_text, created_at
    FROM lost_reports
    WHERE id = ${id}::uuid AND status IN ('approved', 'recovered')
    LIMIT 1
  `)
  return ((res.rows ?? res) as unknown as LostDetail[])[0] ?? null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const r = await fetchReport(id)
  if (!r) return { title: 'Lost bike report — CrankMart' }
  return {
    title: `${r.brand}${r.model ? ' ' + r.model : ''} lost | CrankMart`,
    description: `${r.brand}${r.model ? ' ' + r.model : ''} lost${r.last_seen_location ? ' in ' + r.last_seen_location : ''}. Help the community find it.`,
    robots: { index: true, follow: true },
  }
}

export default async function LostDetailPage({ params }: PageProps) {
  const { id } = await params
  const r = await fetchReport(id)
  if (!r) notFound()

  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : null

  return (
    <main style={{ maxWidth: 820, margin: '0 auto', padding: '32px 20px 80px', fontFamily: 'system-ui, sans-serif', color: '#1a1a1a' }}>
      <Link href="/community/lost" style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none' }}>
        ← Lost & found
      </Link>

      <header style={{ marginTop: 8, marginBottom: 18 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '4px 10px', borderRadius: 999,
          background: '#FEF3C7', color: '#92400E',
          fontSize: 12, fontWeight: 700, width: 'fit-content',
        }}>
          <Frown size={14} /> LOST
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.5, margin: '12px 0 6px' }}>
          {r.brand}{r.model ? ` ${r.model}` : ''}{r.year ? ` · ${r.year}` : ''}
        </h1>
        <div style={{ fontSize: 14, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {r.serial_number && (
            <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: '#1a1a1a' }}>
              Serial: {r.serial_number}
            </span>
          )}
          {r.colour && <span>· {r.colour}</span>}
        </div>
      </header>

      <section style={{
        background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 12, padding: 18, marginBottom: 20,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          <Field icon={<MapPin size={14} />} label="Last seen" value={r.last_seen_location || '—'} />
          <Field icon={<Calendar size={14} />} label="When" value={fmt(r.last_seen_date) || `Reported ${fmt(r.created_at)}`} />
          {r.reward_text && <Field icon={<Gift size={14} />} label="Reward" value={r.reward_text} />}
        </div>
      </section>

      {r.proof_photo_url && (
        <section style={{ marginBottom: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={r.proof_photo_url}
            alt={`${r.brand} ${r.model ?? ''}`}
            style={{ width: '100%', borderRadius: 12, border: '1px solid #ebebeb' }}
          />
        </section>
      )}

      {r.description && (
        <section style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: 18, marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 8px' }}>What to look for</h2>
          <p style={{ margin: 0, fontSize: 14, color: '#1a1a1a', whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{r.description}</p>
        </section>
      )}

      <section style={{
        padding: '16px 18px', background: '#fff', border: '1px solid #ebebeb', borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 14, fontWeight: 800 }}>Spotted it?</div>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280' }}>
            Even "I think I saw one like this in…" helps. Post below; the owner gets every comment.
          </p>
        </div>
        <FlagButton targetType="lost_report" targetId={r.id} label="Report this listing" />
      </section>

      <CommentThread targetType="lost_report" targetId={r.id} title="Sightings & discussion" />
    </main>
  )
}

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: .3, display: 'flex', alignItems: 'center', gap: 5 }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginTop: 3 }}>{value}</div>
    </div>
  )
}
