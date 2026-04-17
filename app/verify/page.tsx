import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Email verification — CrankMart',
  robots: { index: false, follow: false },
}

const MESSAGES: Record<string, { heading: string; body: string; tone: 'success' | 'error' }> = {
  success: {
    heading: 'Email confirmed',
    body: "You're all set. You can now list a bike, message sellers, and manage your account.",
    tone: 'success',
  },
  used: {
    heading: 'Already confirmed',
    body: 'This verification link has already been used. If you can sign in, your email is confirmed.',
    tone: 'success',
  },
  expired: {
    heading: 'Link expired',
    body: 'This verification link has expired. Sign in and request a new one from your account.',
    tone: 'error',
  },
  invalid: {
    heading: 'Invalid link',
    body: 'That verification link is no longer valid. Please sign in and request a new one.',
    tone: 'error',
  },
}

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function VerifyPage({ searchParams }: PageProps) {
  const { status = 'invalid' } = await searchParams
  const msg = MESSAGES[status] || MESSAGES.invalid
  const isSuccess = msg.tone === 'success'

  return (
    <main style={{ maxWidth: 520, margin: '64px auto', padding: '0 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 14,
        padding: '32px 28px',
        boxShadow: '0 2px 12px rgba(0,0,0,.04)',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 24,
          background: isSuccess ? 'rgba(74,222,128,.12)' : 'rgba(248,113,113,.12)',
          color: isSuccess ? '#059669' : '#dc2626',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 800, marginBottom: 18,
        }}>
          {isSuccess ? '✓' : '!'}
        </div>
        <h1 style={{ margin: '0 0 8px', fontSize: 22, color: '#111827' }}>{msg.heading}</h1>
        <p style={{ margin: '0 0 24px', color: '#4b5563', fontSize: 15, lineHeight: 1.5 }}>{msg.body}</p>
        <Link
          href={isSuccess ? '/account' : '/login'}
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            background: '#0D1B2A',
            color: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          {isSuccess ? 'Go to my account' : 'Sign in'} →
        </Link>
      </div>
    </main>
  )
}
