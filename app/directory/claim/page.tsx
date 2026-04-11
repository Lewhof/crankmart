import { db } from '@/db'
import { businesses } from '@/db/schema'
import { eq, gt, and, isNotNull } from 'drizzle-orm'
import Link from 'next/link'
import ClaimForm from './ClaimForm'

interface Props {
  searchParams: Promise<{ token?: string }>
}

export default async function ClaimPage({ searchParams }: Props) {
  const { token } = await searchParams

  if (!token) {
    return <ClaimError message="No claim token provided. Please use the link from your email." />
  }

  const [business] = await db
    .select()
    .from(businesses)
    .where(
      and(
        eq(businesses.claimToken, token),
        isNotNull(businesses.claimTokenExpiresAt),
        gt(businesses.claimTokenExpiresAt, new Date()),
      )
    )
    .limit(1)

  if (!business) {
    return <ClaimError message="This claim link has expired or is invalid." />
  }

  return (
    <main style={{ background: '#f9fafb', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/directory" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>← Back to Directory</Link>
        </div>

        <div style={{ background: '#0D1B2A', borderRadius: 12, padding: '24px 28px', marginBottom: 28, color: '#fff' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: 8 }}>
            Claim Your Listing
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 6px' }}>{business.name}</h1>
          {business.city && (
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>{business.city}{business.province ? `, ${business.province}` : ''}</div>
          )}
        </div>

        <ClaimForm business={business} token={token} />
      </div>
    </main>
  )
}

function ClaimError({ message }: { message: string }) {
  return (
    <main style={{ background: '#f9fafb', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ maxWidth: 440, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', margin: '0 0 12px' }}>Link Invalid</h1>
        <p style={{ fontSize: 15, color: '#6b7280', margin: '0 0 24px', lineHeight: 1.6 }}>{message}</p>
        <Link href="/directory" style={{ display: 'inline-block', background: '#0D1B2A', color: '#fff', padding: '11px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
          Browse Directory
        </Link>
      </div>
    </main>
  )
}
