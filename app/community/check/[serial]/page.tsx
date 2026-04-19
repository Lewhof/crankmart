import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react'
import type { CheckResponse } from '@/app/api/stolen/check/[serial]/route'

interface PageProps {
  params: Promise<{ serial: string }>
  searchParams: Promise<{ brand?: string }>
}

async function fetchCheck(serial: string, brand: string | undefined): Promise<CheckResponse | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://crankmart.com'
  const qs = brand ? `?brand=${encodeURIComponent(brand)}` : ''
  try {
    const res = await fetch(`${baseUrl}/api/stolen/check/${encodeURIComponent(serial)}${qs}`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    return (await res.json()) as CheckResponse
  } catch {
    return null
  }
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { serial } = await params
  const { brand } = await searchParams
  const title = brand
    ? `Check ${brand} serial ${serial} — stolen bike registry | CrankMart`
    : `Check bike serial ${serial} — stolen bike registry | CrankMart`
  return {
    title,
    description: `See if ${brand ? brand + ' ' : ''}frame serial ${serial} has been reported stolen on CrankMart or Bike Index.`,
    robots: { index: true, follow: true },
  }
}

export default async function CheckResultPage({ params, searchParams }: PageProps) {
  const { serial } = await params
  const { brand } = await searchParams
  const result = await fetchCheck(serial, brand)

  return (
    <main style={{ maxWidth: 680, margin: '48px auto 96px', padding: '0 20px', fontFamily: 'system-ui, sans-serif', color: '#1a1a1a' }}>
      <Link href="/community/check" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>
        ← New search
      </Link>
      <div style={{ marginTop: 10, marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7280' }}>Serial</div>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 0.5, fontFamily: 'ui-monospace, monospace' }}>
          {serial}
          {brand && (
            <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: 14, color: '#6b7280', fontWeight: 600, marginLeft: 10 }}>
              ({brand})
            </span>
          )}
        </div>
      </div>

      {!result ? (
        <ResultCard tone="warn" icon={<AlertTriangle size={22} />}
          title="Lookup failed"
          body="We couldn't reach the registry right now. Please try again in a moment."
        />
      ) : result.state === 'reported_stolen' ? (
        <ResultCard tone="danger" icon={<ShieldAlert size={22} />}
          title="Reported stolen"
          body={
            <>
              <p style={{ margin: '0 0 12px' }}>
                This serial has been reported stolen via {result.matches.map(m => m.sourceLabel).filter((x, i, a) => a.indexOf(x) === i).join(', ')}.
              </p>
              {result.matches.map((m, i) => (
                <div key={i} style={{ padding: '12px 14px', background: 'rgba(255,255,255,.65)', borderRadius: 8, marginBottom: 10, fontSize: 13, color: '#7f1d1d' }}>
                  <div style={{ fontWeight: 700 }}>{m.sourceLabel}</div>
                  {m.reportedAt && (
                    <div style={{ marginTop: 2 }}>
                      Reported {new Date(m.reportedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  )}
                  {m.sapsCaseNo && <div style={{ marginTop: 2 }}>SAPS case: {m.sapsCaseNo}</div>}
                  {m.stolenLocation && <div style={{ marginTop: 2 }}>Location: {m.stolenLocation}</div>}
                  {m.brand && <div style={{ marginTop: 2 }}>{m.brand}{m.model ? ' ' + m.model : ''}</div>}
                  {m.sourceUrl && (
                    <div style={{ marginTop: 6 }}>
                      <a href={m.sourceUrl} target="_blank" rel="noreferrer" style={{ color: '#991B1B', fontWeight: 600 }}>
                        View on {m.sourceLabel} →
                      </a>
                    </div>
                  )}
                </div>
              ))}
              <p style={{ margin: '10px 0 0', fontSize: 12 }}>
                If you&apos;re the rightful owner and the report is in error, contact the listing source
                directly to clear it. If you believe this bike is being sold to you right now,
                don&apos;t proceed — contact SAPS with the serial + seller details.
              </p>
            </>
          }
        />
      ) : (
        <ResultCard tone="ok" icon={<ShieldCheck size={22} />}
          title="No stolen reports found"
          body={
            <>
              <p style={{ margin: '0 0 10px' }}>
                We checked the CrankMart registry and Bike Index. No reports match this serial.
              </p>
              <p style={{ margin: 0, fontSize: 12, color: '#4b5563' }}>
                <strong>Clean doesn&apos;t mean safe.</strong> Not every stolen bike gets reported.
                Always meet in person, verify the seller can physically access the bike, and prefer
                sellers who can show a purchase receipt or registration document.
              </p>
            </>
          }
        />
      )}

      <section style={{ marginTop: 28, padding: '18px 20px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }}>
        <h2 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 6px' }}>Is your bike stolen?</h2>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#4b5563', lineHeight: 1.55 }}>
          Report it to the CrankMart registry so it shows up here next time someone checks. A SAPS
          case number + proof-of-ownership photo gets your report approved instantly.
        </p>
        <Link
          href={`/account?tab=report-stolen&serial=${encodeURIComponent(serial)}${brand ? '&brand=' + encodeURIComponent(brand) : ''}`}
          style={{
            display: 'inline-block', padding: '9px 16px', background: '#0D1B2A',
            color: '#fff', textDecoration: 'none', borderRadius: 8,
            fontSize: 13, fontWeight: 700,
          }}
        >
          Report this serial as stolen →
        </Link>
      </section>

      {result?.cached && result.cachedAt && (
        <p style={{ marginTop: 20, fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>
          Cached result from {new Date(result.cachedAt).toLocaleString()}.
        </p>
      )}
    </main>
  )
}

function ResultCard({ tone, icon, title, body }: {
  tone: 'ok' | 'warn' | 'danger'
  icon: React.ReactNode
  title: string
  body: React.ReactNode
}) {
  const styles = {
    ok:     { bg: '#ECFDF5', border: '#6EE7B7', color: '#065F46', iconBg: '#D1FAE5' },
    warn:   { bg: '#FEF3C7', border: '#FCD34D', color: '#92400E', iconBg: '#FDE68A' },
    danger: { bg: '#FEE2E2', border: '#FCA5A5', color: '#991B1B', iconBg: '#FECACA' },
  }[tone]
  return (
    <div style={{ padding: '20px 22px', background: styles.bg, border: `1px solid ${styles.border}`, borderRadius: 14, color: styles.color }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 8, background: styles.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{title}</h2>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.55 }}>{body}</div>
    </div>
  )
}
