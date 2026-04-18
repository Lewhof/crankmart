'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ChevronRight, Loader, ChevronDown } from 'lucide-react'
import { countryFromPath, getProvincesStatic } from '@/lib/regions-static'
import { getCountryConfig } from '@/lib/country-config'

const STEPS = ['Category', 'Details', 'Photos', 'Location & Price']

function Step4Content() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const country = countryFromPath(pathname)
  const provinces = getProvincesStatic(country)
  const regionLabel = getCountryConfig(country).regionLabel

  const [form, setForm] = useState({
    price: '',
    negotiable: true,
    province: '',
    city: '',
    postalCode: '',
    shippingAvailable: false,
  })

  const [publishing, setPublishing] = useState(false)
  const [duplicate, setDuplicate] = useState<{ existingSlug: string; existingTitle: string } | null>(null)
  const [publishError, setPublishError] = useState<{ message: string; code: string } | null>(null)
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'already' | 'error'>('idle')
  const [previewExpanded, setPreviewExpanded] = useState(false)
  const [previewData, setPreviewData] = useState<{ title?: string; image?: string; category?: string } | null>(null)

  useEffect(() => {
    const loadDraft = async () => {
      try {
        // Try to load from DB first
        const res = await fetch('/api/sell/draft')
        if (res.ok) {
          const draft = await res.json()
          if (draft?.data?.price) {
            setForm(f => ({
              ...f,
              price: draft.data.price || '',
              province: draft.data.province || '',
              city: draft.data.city || '',
              postalCode: draft.data.postalCode || '',
              negotiable: draft.data.negotiable !== undefined ? draft.data.negotiable : true,
              shippingAvailable: draft.data.shippingAvailable !== undefined ? draft.data.shippingAvailable : false,
            }))
            return
          }
        }
      } catch {}

      // Fallback to localStorage
      const saved = localStorage.getItem('crankmart-sell-draft')
      if (saved) {
        try {
          const draft = JSON.parse(saved)
          setForm(f => ({
            ...f,
            price: draft.price || '',
          }))
        } catch {}
      }
    }
    loadDraft()
  }, [])

  // Load preview data
  useEffect(() => {
    const draft = localStorage.getItem('crankmart-sell-draft')
    const photos = localStorage.getItem('crankmart-sell-photos')
    const category = localStorage.getItem('crankmart-sell-category') || 'other'

    if (draft) {
      const data = JSON.parse(draft)
      const photosData = photos ? JSON.parse(photos) : []
      setPreviewData({
        title: data.title,
        image: photosData[0]?.url,
        category,
      })
    }
  }, [])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      const callbackUrl = `/sell/step-4${searchParams.toString() ? '?' + searchParams.toString() : ''}`
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
    }
  }, [status, router, searchParams])

  const handleChange = (key: string, value: string | boolean) => {
    setForm(f => ({ ...f, [key]: value }))
  }

  const handlePublish = async (forceDuplicate?: boolean) => {
    if (!form.price || !form.province || !form.city) {
      setPublishError({ message: 'Please fill in price, province, and city.', code: 'validation' })
      return
    }
    setPublishError(null)

    setPublishing(true)
    try {
      // Get all data from localStorage
      const draft = JSON.parse(localStorage.getItem('crankmart-sell-draft') || '{}')
      const photos = JSON.parse(localStorage.getItem('crankmart-sell-photos') || '[]')
      const category = localStorage.getItem('crankmart-sell-category') || 'other'

      const publishPayload = {
        // Spread all draft fields (captures all step-2 attributes)
        ...draft,
        // Explicit mappings for fields with different names between draft and API
        category,
        wheelSizeInches: draft.wheelSize,
        suspensionTravelMm: draft.suspensionTravel,
        // Step-4 form overrides
        price: form.price,
        negotiable: form.negotiable,
        province: form.province,
        city: form.city,
        postalCode: form.postalCode,
        shippingAvailable: form.shippingAvailable,
        images: photos.map((p: any) => p.url),
        forceDuplicate: forceDuplicate || false,
      }

      const res = await fetch('/api/sell/publish', {
        method: 'POST',
        body: JSON.stringify(publishPayload),
      })

      // Handle duplicate warning (409)
      if (res.status === 409) {
        const err = await res.json()
        setDuplicate({ existingSlug: err.existingSlug, existingTitle: err.existingTitle })
        setPublishing(false)
        return
      }

      if (!res.ok) {
        const err = await res.json()
        // 403 + email_unverified gets a specific banner with a Resend button
        if (res.status === 403 && err.code === 'email_unverified') {
          setPublishError({ message: err.error || 'Please verify your email before publishing.', code: 'email_unverified' })
          setPublishing(false)
          return
        }
        // 403 + stolen_serial — block publish, point to support
        if (res.status === 403 && err.code === 'stolen_serial') {
          setPublishError({ message: err.error || 'This frame serial is registered as stolen.', code: 'stolen_serial' })
          setPublishing(false)
          return
        }
        setPublishError({ message: err.error || 'Publish failed', code: 'publish' })
        setPublishing(false)
        return
      }

      const { slug, listingId } = await res.json()
      const listingTitle = encodeURIComponent(draft.title || 'Your listing')

      // Clear localStorage
      localStorage.removeItem('crankmart-sell-draft')
      localStorage.removeItem('crankmart-sell-photos')
      localStorage.removeItem('crankmart-sell-category')

      // Delete draft from DB
      try {
        await fetch('/api/sell/draft', { method: 'DELETE' })
      } catch {}

      // Redirect to listing
      router.push(`/sell/success?slug=${slug}&title=${listingTitle}&listingId=${listingId}`)
    } catch (err) {
      setPublishError({ message: err instanceof Error ? err.message : 'Failed to publish', code: 'network' })
      setPublishing(false)
    }
  }

  const handleResendVerification = async () => {
    setResendStatus('sending')
    try {
      const res = await fetch('/api/auth/resend-verify', { method: 'POST' })
      const body = await res.json().catch(() => ({}))
      if (res.ok) {
        setResendStatus(body?.alreadyVerified ? 'already' : 'sent')
      } else {
        setResendStatus('error')
      }
    } catch {
      setResendStatus('error')
    }
  }

  if (status === 'loading') {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: 100 }}>
      <style>{`
        * { box-sizing: border-box; }
        .sell-wrap { max-width: 640px; margin: 0 auto; padding: 0 0 40px; }
        @media(min-width:768px) { .sell-wrap { padding: 24px 0 40px; } }

        .progress-bar { background: #fff; border-bottom: 1px solid #ebebeb; padding: 0 20px; }
        .progress-inner { max-width: 640px; margin: 0 auto; display: flex; align-items: center; height: 52px; gap: 0; }
        .step-dot { display: flex; align-items: center; gap: 8px; flex: 1; }
        .step-dot:last-child { flex: 0; }
        .dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
        .dot.done { background: var(--color-primary); color: #fff; }
        .dot.active { background: var(--color-primary); color: #fff; box-shadow: 0 0 0 3px #E9ECF5; }
        .dot.todo { background: #f0f0f0; color: #9a9a9a; }
        .step-label { font-size: 12px; font-weight: 600; }
        .step-line { flex: 1; height: 2px; background: #ebebeb; }
        .step-line.done { background: var(--color-primary); }

        .sell-topbar { background: #fff; border-bottom: 1px solid #ebebeb; padding: 12px 20px; display: flex; align-items: center; gap: 12px; }

        .sell-card { background: #fff; margin: 0; padding: 20px; }
        @media(min-width:768px) { .sell-card { border-radius: 8px; margin-bottom: 12px; } }

        .form-group { margin-bottom: 14px; }
        .form-label { display: block; font-size: 12px; font-weight: 600; color: #1a1a1a; margin-bottom: 6px; }
        .form-input { width: 100%; padding: 10px 12px; border: 1px solid #ebebeb; border-radius: 8px; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .form-input:focus { outline: none; border-color: #0D1B2A; background: #f8f9ff; }

        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .checkbox-item { display: flex; align-items: center; gap: 8px; padding: 12px; border: 1px solid #ebebeb; border-radius: 8px; cursor: pointer; }
        .checkbox-item:hover { background: #f8f9ff; }
        .checkbox-item input { width: 18px; height: 18px; cursor: pointer; }
        .checkbox-item-text { flex: 1; }
        .checkbox-label { font-size: 13px; font-weight: 600; color: #1a1a1a; }
        .checkbox-desc { font-size: 11px; color: #9a9a9a; margin-top: 2px; }

        .sell-footer { position: fixed; bottom: 60px; left: 0; right: 0; background: #fff; border-top: 1px solid #ebebeb; padding: 12px 20px; z-index: 40; }
        @media(min-width: 768px) { .sell-footer { bottom: 0; } }

        .btn-publish { width: 100%; height: 50px; background: var(--color-primary); color: #fff; border: none; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-publish:hover { background: #1e2d5a; }
        .btn-publish:disabled { opacity: 0.4; cursor: not-allowed; }

        .price-input-group { position: relative; }
        .price-prefix { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 13px; font-weight: 600; color: #9a9a9a; }
        .price-input { padding-left: 32px; }
      `}</style>

      {/* Top bar */}
      <div className="sell-topbar">
        <button
          onClick={() => router.back()}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a1a' }}
        >
          <ArrowLeft size={18} />
        </button>
        <span style={{ fontWeight: 800, fontSize: 16, color: '#1a1a1a' }}>Post a listing</span>
      </div>

      {/* Progress */}
      <div className="progress-bar">
        <div className="progress-inner">
          {STEPS.map((s, i) => (
            <div key={s} className="step-dot">
              <div className={`dot ${i < 3 ? 'done' : i === 3 ? 'active' : 'todo'}`}>{i + 1}</div>
              <span className="step-label" style={{ color: i <= 3 ? '#0D1B2A' : '#9a9a9a' }}>{s}</span>
              {i < STEPS.length - 1 && <div className={`step-line${i < 3 ? ' done' : ''}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="sell-wrap">
        {/* Preview section */}
        {previewData && (
          <div className="sell-card" style={{ marginTop: 0 }}>
            <button
              onClick={() => setPreviewExpanded(!previewExpanded)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                marginBottom: previewExpanded ? 16 : 0,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>Preview your listing</span>
              <ChevronDown
                size={20}
                style={{
                  transform: previewExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  color: '#9a9a9a',
                }}
              />
            </button>

            {previewExpanded && (
              <div style={{
                background: '#f8f9ff',
                border: '1px solid #e4e4e7',
                borderRadius: 8,
                padding: 16,
                marginBottom: 16,
              }}>
                <p style={{ fontSize: 12, color: '#9a9a9a', marginBottom: 12 }}>
                  This is how your listing will appear to buyers.
                </p>

                <div style={{
                  background: '#fff',
                  border: '1px solid #ebebeb',
                  borderRadius: 8,
                  overflow: 'hidden',
                }}>
                  {previewData.image && (
                    <div style={{ position: 'relative', width: '100%', height: 200, background: '#f0f0f0' }}>
                      <Image
                        src={previewData.image}
                        alt="Preview"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}

                  <div style={{ padding: 12 }}>
                    {previewData.category && (
                      <p style={{ fontSize: 10, fontWeight: 700, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 4px' }}>
                        {previewData.category}
                      </p>
                    )}
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', margin: '0 0 8px' }}>
                      {previewData.title || 'Your listing title'}
                    </p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a' }}>
                      R {form.price ? parseInt(form.price).toLocaleString('en-ZA') : '0'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Duplicate warning */}
        {duplicate && (
          <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 8, padding: 16, marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#92400E', marginBottom: 8 }}>
                You may already have a similar listing: "{duplicate.existingTitle}"
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={`/browse/${duplicate.existingSlug}`} target="_blank" rel="noopener" style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline' }}>
                  View existing →
                </a>
                <button
                  onClick={() => setDuplicate(null)}
                  style={{ fontSize: 12, color: '#92400E', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="sell-card" style={{ marginTop: 0 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', marginBottom: 4 }}>Price & Location</h2>
          <p style={{ fontSize: 13, color: '#9a9a9a', marginBottom: 16 }}>Almost done! Set your price and location.</p>

          {/* Price */}
          <div className="form-group">
            <label className="form-label">Price (ZAR) *</label>
            <div className="price-input-group">
              <span className="price-prefix">R</span>
              <input
                className="form-input price-input"
                type="number"
                value={form.price}
                onChange={e => handleChange('price', e.target.value)}
                placeholder="5000"
              />
            </div>
          </div>

          {/* Negotiable */}
          <div className="form-group">
            <label className="checkbox-item" style={{ marginBottom: 0 }}>
              <input
                type="checkbox"
                checked={form.negotiable}
                onChange={e => handleChange('negotiable', e.target.checked)}
              />
              <div className="checkbox-item-text">
                <div className="checkbox-label">Price is negotiable</div>
                <div className="checkbox-desc">Buyers can make offers</div>
              </div>
            </label>
          </div>

          {/* Province / State */}
          <div className="form-group">
            <label className="form-label">{regionLabel} *</label>
            <select
              className="form-input"
              value={form.province}
              onChange={e => handleChange('province', e.target.value)}
            >
              <option value="">Select {regionLabel.toLowerCase()}…</option>
              {provinces.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* City & Postal Code */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                className="form-input"
                value={form.city}
                onChange={e => handleChange('city', e.target.value)}
                placeholder="e.g., Johannesburg"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Postal Code</label>
              <input
                className="form-input"
                value={form.postalCode}
                onChange={e => handleChange('postalCode', e.target.value)}
                placeholder="2000"
              />
            </div>
          </div>

          {/* Shipping */}
          <div className="form-group">
            <label className="checkbox-item" style={{ marginBottom: 0 }}>
              <input
                type="checkbox"
                checked={form.shippingAvailable}
                onChange={e => handleChange('shippingAvailable', e.target.checked)}
              />
              <div className="checkbox-item-text">
                <div className="checkbox-label">Available to ship</div>
                <div className="checkbox-desc">Can be sent to other provinces</div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="sell-footer">
        {duplicate ? (
          <button
            className="btn-publish"
            onClick={() => handlePublish(true)}
            disabled={publishing}
          >
            {publishing ? (
              <>
                <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Publishing...
              </>
            ) : (
              <>
                Post anyway <ChevronRight size={18} />
              </>
            )}
          </button>
        ) : (
          <button
            className="btn-publish"
            onClick={() => handlePublish()}
            disabled={!form.price || !form.province || !form.city || publishing}
          >
            {publishing ? (
              <>
                <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Publishing...
              </>
            ) : (
              <>
                Publish Listing <ChevronRight size={18} />
              </>
            )}
          </button>
        )}

        {publishError && (
          <div
            role="alert"
            style={{
              marginTop: 14, padding: '14px 16px',
              background: publishError.code === 'email_unverified' ? '#FEF3C7' : '#FEE2E2',
              border: `1px solid ${publishError.code === 'email_unverified' ? '#FCD34D' : '#FCA5A5'}`,
              borderRadius: 8,
              color: publishError.code === 'email_unverified' ? '#92400E' : '#991B1B',
              fontSize: 13, lineHeight: 1.5,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>
              {publishError.code === 'email_unverified' ? 'Email not verified'
               : publishError.code === 'stolen_serial' ? 'Listing blocked — serial is reported stolen'
               : 'Could not publish'}
            </div>
            <div style={{ marginBottom: publishError.code === 'email_unverified' ? 10 : 0 }}>
              {publishError.message}
            </div>
            {publishError.code === 'email_unverified' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={handleResendVerification}
                  disabled={resendStatus === 'sending' || resendStatus === 'sent'}
                  style={{
                    padding: '7px 14px', borderRadius: 6,
                    background: '#92400E', color: '#fff', border: 'none',
                    fontSize: 12, fontWeight: 700,
                    cursor: resendStatus === 'sending' || resendStatus === 'sent' ? 'default' : 'pointer',
                    opacity: resendStatus === 'sent' ? 0.7 : 1,
                  }}
                >
                  {resendStatus === 'sending' ? 'Sending…'
                   : resendStatus === 'sent'    ? 'Sent ✓'
                   : resendStatus === 'already' ? 'Already verified — refresh'
                   : 'Resend verification email'}
                </button>
                {resendStatus === 'sent' && (
                  <span style={{ fontSize: 12 }}>Check your inbox, click the link, then retry Publish.</span>
                )}
                {resendStatus === 'error' && (
                  <span style={{ fontSize: 12 }}>Couldn&apos;t send — try again in a minute.</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default function Step4Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Step4Content />
    </Suspense>
  )
}
