import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { businesses } from '@/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import MyListingForm from './MyListingForm'

export default async function MyListingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/account/my-listing')

  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.claimedBy, session.user.id))
    .limit(1)

  if (!business) {
    return (
      <main style={{ background: '#f9fafb', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ maxWidth: 440, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏪</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', margin: '0 0 12px' }}>No listing claimed yet</h1>
          <p style={{ fontSize: 15, color: '#6b7280', margin: '0 0 24px', lineHeight: 1.6 }}>
            Your account doesn&apos;t have a claimed business listing. Browse the directory to find and claim your business.
          </p>
          <Link href="/directory" style={{ display: 'inline-block', background: '#0D1B2A', color: '#fff', padding: '11px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
            Browse Directory
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main style={{ background: '#f9fafb', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/account" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>← Account</Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0D1B2A', margin: '0 0 6px' }}>{business.name}</h1>
            <div style={{ fontSize: 14, color: '#6b7280' }}>{business.city}{business.province ? `, ${business.province}` : ''}</div>
          </div>
          <StatusBadge status={business.status} />
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Views', value: business.viewsCount ?? 0 },
            { label: 'Saves', value: business.savesCount ?? 0 },
            { label: 'Boost Tier', value: business.boostTier ?? 'Free' },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: '#fff', border: '1.5px solid #ebebeb', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0D1B2A' }}>{value}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Boost CTA */}
        {(!business.boostTier || business.boostTier === 'free') && (
          <div style={{ background: '#0D1B2A', borderRadius: 10, padding: '16px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 }}>Upgrade your listing</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Get more visibility with a Starter, Pro or Anchor plan.</div>
            </div>
            <Link href="/pricing" style={{ background: 'var(--color-primary)', color: '#fff', padding: '9px 18px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}>
              View Plans →
            </Link>
          </div>
        )}

        <MyListingForm business={business} />
      </div>
    </main>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    verified:  { label: 'Verified',  bg: '#D1FAE5', color: '#065F46' },
    claimed:   { label: 'Claimed',   bg: '#DBEAFE', color: '#1D4ED8' },
    pending:   { label: 'Pending',   bg: '#FEF3C7', color: '#92400E' },
    suspended: { label: 'Suspended', bg: '#FEE2E2', color: '#991B1B' },
  }
  const cfg = map[status] ?? { label: status, bg: '#F3F4F6', color: '#6B7280' }
  return (
    <span style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  )
}
