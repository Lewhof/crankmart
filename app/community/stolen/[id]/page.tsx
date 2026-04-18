import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { ShieldAlert, MapPin, Calendar, FileText, ShieldCheck } from 'lucide-react'
import { CommentThread } from '@/components/community/CommentThread'
import { FlagButton } from '@/components/community/FlagButton'

interface PageProps { params: Promise<{ id: string }> }

interface ReportDetail {
  id: string
  serial_number: string
  brand: string
  model: string | null
  year: number | null
  colour: string | null
  status: string
  saps_case_no: string | null
  stolen_date: string | null
  stolen_location: string | null
  proof_photo_url: string | null
  notes: string | null
  created_at: string
}

async function fetchReport(id: string): Promise<ReportDetail | null> {
  const res = await db.execute(sql`
    SELECT id, serial_number, brand, model, year, colour, status,
           saps_case_no, stolen_date, stolen_location, proof_photo_url, notes, created_at
    FROM stolen_reports
    WHERE id = ${id}::uuid AND status IN ('approved', 'recovered')
    LIMIT 1
  `)
  return ((res.rows ?? res) as unknown as ReportDetail[])[0] ?? null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const report = await fetchReport(id)
  if (!report) return { title: 'Stolen bike report — CrankMart' }
  const title = `${report.brand}${report.model ? ' ' + report.model : ''} reported stolen | CrankMart`
  return {
    title,
    description: `Frame serial ${report.serial_number} — ${report.brand}${report.model ? ' ' + report.model : ''} reported stolen${report.stolen_location ? ' in ' + report.stolen_location : ''}.`,
    robots: { index: true, follow: true },
  }
}

export default async function StolenDetailPage({ params }: PageProps) {
  const { id } = await params
  const r = await fetchReport(id)
  if (!r) notFound()

  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }) : null

  const isRecovered = r.status === 'recovered'

  return (
    <main style={{ maxWidth: 820, margin: '0 auto', padding: '32px 20px 80px', fontFamily: 'system-ui, sans-serif', color: '#1a1a1a' }}>
      <Link href="/community/stolen" style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none' }}>
        ← Stolen registry
      </Link>

      <header style={{ marginTop: 8, marginBottom: 18 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '4px 10px', borderRadius: 999,
          background: isRecovered ? '#ECFDF5' : '#FEE2E2',
          color: isRecovered ? '#065F46' : '#991B1B',
          fontSize: 12, fontWeight: 700, width: 'fit-content',
        }}>
          {isRecovered ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
          {isRecovered ? 'RECOVERED' : 'REPORTED STOLEN'}
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.5, margin: '12px 0 6px' }}>
          {r.brand}{r.model ? ` ${r.model}` : ''}{r.year ? ` · ${r.year}` : ''}
        </h1>
        <div style={{ fontSize: 14, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: '#1a1a1a' }}>
            Serial: {r.serial_number}
          </span>
          {r.colour && <span>· {r.colour}</span>}
        </div>
      </header>

      <section style={{
        background: isRecovered ? '#ECFDF5' : '#FEE2E2',
        border: `1px solid ${isRecovered ? '#A7F3D0' : '#FCA5A5'}`,
        borderRadius: 12, padding: 18, marginBottom: 20,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          <Field icon={<MapPin size={14} />} label="Where" value={r.stolen_location || '—'} />
          <Field icon={<Calendar size={14} />} label="When" value={fmt(r.stolen_date) || `Reported ${fmt(r.created_at)}`} />
          {r.saps_case_no && <Field icon={<FileText size={14} />} label="SAPS case" value={r.saps_case_no} mono />}
        </div>
      </section>

      {r.proof_photo_url && (
        <section style={{ marginBottom: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={r.proof_photo_url}
            alt={`${r.brand} ${r.model ?? ''} — proof of ownership`}
            style={{ width: '100%', borderRadius: 12, border: '1px solid #ebebeb' }}
          />
        </section>
      )}

      {r.notes && (
        <section style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: 18, marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 8px' }}>Notes from the owner</h2>
          <p style={{ margin: 0, fontSize: 14, color: '#1a1a1a', whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{r.notes}</p>
        </section>
      )}

      {/* Tip-off CTA */}
      <section style={{
        padding: '16px 18px', background: '#fff', border: '1px solid #ebebeb', borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 14, fontWeight: 800 }}>Seen this bike?</div>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280' }}>
            Drop a tip-off below — even small details help. The owner will see every comment.
          </p>
        </div>
        <FlagButton targetType="stolen_report" targetId={r.id} label="Report this listing" />
      </section>

      <CommentThread targetType="stolen_report" targetId={r.id} title="Tip-offs & discussion" />
    </main>
  )
}

function Field({ icon, label, value, mono = false }: {
  icon: React.ReactNode; label: string; value: string; mono?: boolean
}) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: .3, display: 'flex', alignItems: 'center', gap: 5 }}>
        {icon} {label}
      </div>
      <div style={{
        fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginTop: 3,
        fontFamily: mono ? 'ui-monospace, monospace' : 'inherit',
      }}>
        {value}
      </div>
    </div>
  )
}
