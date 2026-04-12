'use client'

import { useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Eye, Share2, Plus, Zap } from 'lucide-react'

function SuccessContent() {
  const params = useSearchParams()
  const slug       = params.get('slug') || ''
  const title      = params.get('title') || 'Your listing'
  const listingId  = params.get('listingId') || ''

  const listingUrl = `https://crankmart.com/browse/${slug}`
  const waText = encodeURIComponent(`Check out my listing on CrankMart: ${title}\n${listingUrl}`)

  // Confetti-lite: brief flash on mount
  useEffect(() => {
    document.title = 'Listing Live! 🎉 — CrankMart'
  }, [])

  return (
    <div style={{ minHeight: '80vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '48px 32px', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 4px 32px rgba(0,0,0,.08)', border: '1px solid #ebebeb' }}>
        {/* Icon */}
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle size={36} color="#10B981" />
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#1a1a1a', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
          Your listing is live! 🎉
        </h1>
        <p style={{ fontSize: 15, color: '#6b7280', margin: '0 0 32px', lineHeight: 1.5 }}>
          <strong style={{ color: '#1a1a1a' }}>{decodeURIComponent(title)}</strong> is now visible to buyers on CrankMart. Share it to get more views faster.
        </p>

        {/* Primary actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <Link href={`/browse/${slug}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, background: 'var(--color-primary)', color: '#fff', borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
            <Eye size={17} /> View Your Listing
          </Link>
          <a href={`https://wa.me/?text=${waText}`} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, background: '#25D366', color: '#fff', borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
            <Share2 size={17} /> Share on WhatsApp
          </a>
        </div>

        {/* Secondary */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link href="/sell/step-1"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none', padding: '8px 16px', border: '1.5px solid #e4e4e7', borderRadius: 8 }}>
            <Plus size={14} /> List Another
          </Link>
          <Link href="/account?tab=listings"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#1a1a1a', textDecoration: 'none', padding: '8px 16px', border: '1.5px solid #e4e4e7', borderRadius: 8 }}>
            My Listings
          </Link>
        </div>

        {/* Boost section — live */}
        <div style={{ marginTop: 28, background: 'linear-gradient(135deg, #1a1a2e 0%, #273970 100%)', borderRadius: 14, padding: '22px 20px', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Zap size={18} style={{ color: '#818cf8' }} />
            <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Boost your listing</span>
            <span style={{ fontSize: 10, fontWeight: 700, background: '#4ade80', color: '#052e16', padding: '2px 8px', borderRadius: 20 }}>LIVE</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {[
              { icon: '⚡', label: 'Bump Ad', desc: 'Push to top of category instantly', price: 'R20' },
              { icon: '🔝', label: 'Category Top', desc: 'Pinned at top of search results for 7 days', price: 'R69' },
              { icon: '🏠', label: 'Homepage Feature', desc: 'Prime homepage placement for 7 days', price: 'R99' },
            ].map(opt => (
              <div key={opt.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.08)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)' }}>
                <span style={{ fontSize: 18 }}>{opt.icon}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{opt.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#a5b4fc', marginLeft: 6 }}>{opt.price}</span>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>{opt.desc}</div>
                </div>
              </div>
            ))}
          </div>
          {listingId ? (
            <Link href={`/boost/select?listingId=${listingId}&returnTo=/browse/${slug}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', height: 44, background: '#818cf8', color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 800, textDecoration: 'none', boxSizing: 'border-box' }}>
              <Zap size={16} /> Boost this listing →
            </Link>
          ) : (
            <Link href="/account?tab=listings"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', height: 44, background: '#818cf8', color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 800, textDecoration: 'none', boxSizing: 'border-box' }}>
              <Zap size={16} /> Boost from My Listings →
            </Link>
          )}
        </div>

        <p style={{ fontSize: 12, color: '#9a9a9a', marginTop: 20 }}>
          A confirmation email has been sent to you.
        </p>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return <Suspense><SuccessContent /></Suspense>
}
