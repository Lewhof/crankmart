'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Star, Heart, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

interface Review {
  id: string
  rating: number
  body: string | null
  conditions_note: string | null
  ridden_at: string | null
  created_at: string
  user_name: string
  avatar_url: string | null
}

interface Props {
  routeId?: string
  routeSlug: string
  routeName: string
  initialReviews: Review[]
  initialAvgRating: number
  initialReviewCount: number
  initialSaved?: boolean
}

function Stars({ rating, size = 14, interactive = false, onRate }: {
  rating: number; size?: number; interactive?: boolean; onRate?: (r: number) => void
}) {
  const [hovered, setHovered] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          size={size}
          onClick={() => interactive && onRate?.(i)}
          onMouseEnter={() => interactive && setHovered(i)}
          onMouseLeave={() => interactive && setHovered(0)}
          style={{
            color: i <= (hovered || rating) ? '#F59E0B' : '#E5E7EB',
            fill: i <= (hovered || rating) ? '#F59E0B' : 'none',
            cursor: interactive ? 'pointer' : 'default',
            transition: 'color 0.1s, fill 0.1s',
          }}
        />
      ))}
    </div>
  )
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function ReviewsSection({
  routeSlug, routeName, initialReviews, initialAvgRating, initialReviewCount
}: Props) {
  const { data: session, status } = useSession()
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [avgRating, setAvgRating] = useState(initialAvgRating)
  const [reviewCount, setReviewCount] = useState(initialReviewCount)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [rating, setRating] = useState(0)
  const [body, setBody] = useState('')
  const [conditionsNote, setConditionsNote] = useState('')
  const [riddenAt, setRiddenAt] = useState('')

  // Load save state
  useEffect(() => {
    if (!session?.user) return
    fetch(`/api/routes/${routeSlug}/save`)
      .then(r => r.json())
      .then(d => setSaved(d.saved ?? false))
      .catch(() => {})
  }, [session, routeSlug])

  const toggleSave = async () => {
    if (!session?.user) return
    setSaving(true)
    try {
      const res = await fetch(`/api/routes/${routeSlug}/save`, { method: 'POST' })
      const d = await res.json()
      setSaved(d.saved)
    } finally {
      setSaving(false)
    }
  }

  const submitReview = async () => {
    if (!rating) { setSubmitError('Please select a star rating'); return }
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch(`/api/routes/${routeSlug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, body, conditions_note: conditionsNote, ridden_at: riddenAt || undefined }),
      })
      const d = await res.json()
      if (!res.ok) { setSubmitError(d.error || 'Failed to submit'); return }
      setReviews(prev => {
        const filtered = prev.filter(r => r.user_name !== d.review.user_name)
        return [d.review, ...filtered]
      })
      const newCount = reviewCount + 1
      const newAvg = ((avgRating * reviewCount) + rating) / newCount
      setAvgRating(Math.round(newAvg * 10) / 10)
      setReviewCount(newCount)
      setSubmitSuccess(true)
      setShowForm(false)
      setRating(0); setBody(''); setConditionsNote(''); setRiddenAt('')
    } finally {
      setSubmitting(false)
    }
  }

  // Rating breakdown
  const breakdown = [5,4,3,2,1].map(s => ({
    star: s,
    count: reviews.filter(r => r.rating === s).length,
  }))
  const maxBreakdown = Math.max(...breakdown.map(b => b.count), 1)

  return (
    <section style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: 24, marginBottom: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>Reviews</h2>
            {reviewCount > 0 && (
              <span style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', background: '#f5f5f5', padding: '2px 8px', borderRadius: 20 }}>{reviewCount}</span>
            )}
          </div>
          {reviewCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Stars rating={Math.round(avgRating)} size={16} />
              <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>{avgRating.toFixed(1)}</span>
              <span style={{ fontSize: 13, color: '#9CA3AF' }}>/ 5</span>
            </div>
          )}
        </div>

        {/* Save button */}
        {status === 'authenticated' ? (
          <button onClick={toggleSave} disabled={saving} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '8px 16px', borderRadius: 8, cursor: saving ? 'wait' : 'pointer',
            border: saved ? '1.5px solid #EF4444' : '1.5px solid #e0e0e0',
            background: saved ? '#FEF2F2' : '#fff',
            color: saved ? '#EF4444' : '#6B7280',
            fontSize: 13, fontWeight: 600, transition: 'all 0.15s', flexShrink: 0,
          }}>
            <Heart size={15} style={{ fill: saved ? '#EF4444' : 'none' }} />
            {saved ? 'Saved' : 'Save Route'}
          </button>
        ) : status === 'unauthenticated' ? (
          <Link href="/login" style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '8px 16px', borderRadius: 8,
            border: '1.5px solid #e0e0e0', background: '#fff',
            color: '#6B7280', fontSize: 13, fontWeight: 600, textDecoration: 'none',
          }}>
            <Heart size={15} /> Save Route
          </Link>
        ) : null}
      </div>

      {/* Rating breakdown */}
      {reviewCount > 0 && (
        <div style={{ marginBottom: 20, padding: '14px 16px', background: '#f9f9f9', borderRadius: 10 }}>
          {breakdown.map(({ star, count }) => (
            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: star > 1 ? 6 : 0 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', width: 20 }}>{star}★</span>
              <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(count / maxBreakdown) * 100}%`, background: '#F59E0B', borderRadius: 3, transition: 'width 0.4s' }} />
              </div>
              <span style={{ fontSize: 12, color: '#9CA3AF', width: 16, textAlign: 'right' }}>{count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Write review CTA */}
      {status === 'authenticated' && (
        <div style={{ marginBottom: 20 }}>
          {submitSuccess && !showForm && (
            <div style={{ fontSize: 13, color: '#16A34A', fontWeight: 600, marginBottom: 8 }}>✓ Review submitted!</div>
          )}
          <button onClick={() => setShowForm(p => !p)} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 16px', borderRadius: 8,
            border: '1.5px solid #0D1B2A', background: showForm ? '#0D1B2A' : '#fff',
            color: showForm ? '#fff' : '#0D1B2A',
            fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%', justifyContent: 'center',
          }}>
            {showForm ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            {showForm ? 'Cancel' : reviewCount === 0 ? '★ Be the first to review' : '★ Write a Review'}
          </button>

          {showForm && (
            <div style={{ marginTop: 14, padding: 16, border: '1px solid #ebebeb', borderRadius: 10, background: '#fafafa' }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>Your rating *</div>
                <Stars rating={rating} size={28} interactive onRate={setRating} />
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>Your review</div>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="How was the ride? Surface condition, any tips for other riders..."
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e0e0e0', fontSize: 13, resize: 'vertical', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 5 }}>Trail conditions (optional)</div>
                  <input
                    value={conditionsNote}
                    onChange={e => setConditionsNote(e.target.value)}
                    placeholder="e.g. Wet, muddy, dry..."
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1.5px solid #e0e0e0', fontSize: 12, boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 5 }}>Date ridden (optional)</div>
                  <input
                    type="date"
                    value={riddenAt}
                    onChange={e => setRiddenAt(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1.5px solid #e0e0e0', fontSize: 12, boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
              </div>

              {submitError && <div style={{ fontSize: 12, color: '#DC2626', marginBottom: 10 }}>{submitError}</div>}

              <button onClick={submitReview} disabled={submitting || !rating} style={{
                width: '100%', padding: '11px', borderRadius: 8,
                background: rating ? '#0D1B2A' : '#e5e7eb',
                color: rating ? '#fff' : '#9CA3AF',
                border: 'none', fontSize: 14, fontWeight: 700,
                cursor: rating && !submitting ? 'pointer' : 'not-allowed',
              }}>
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          )}
        </div>
      )}

      {status === 'unauthenticated' && reviewCount === 0 && (
        <div style={{ textAlign: 'center', padding: '20px 0', color: '#9CA3AF' }}>
          <Star size={28} style={{ marginBottom: 8, opacity: 0.3 }} />
          <p style={{ margin: '0 0 12px', fontSize: 14 }}>No reviews yet.</p>
          <Link href="/login" style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none', background: '#E9ECF5', padding: '8px 16px', borderRadius: 8 }}>
            Sign in to review
          </Link>
        </div>
      )}

      {/* Review list */}
      {reviews.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {reviews.map(rev => (
            <div key={rev.id} style={{ borderTop: '1px solid #f5f5f5', paddingTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                {/* Avatar */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--color-primary)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, overflow: 'hidden',
                }}>
                  {rev.avatar_url
                    ? <img src={rev.avatar_url} alt={rev.user_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : initials(rev.user_name ?? '?')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{rev.user_name}</span>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>{timeAgo(rev.created_at)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <Stars rating={rev.rating} size={13} />
                    {rev.ridden_at && (
                      <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                        Rode {new Date(rev.ridden_at).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {rev.body && <p style={{ fontSize: 13, color: '#374151', margin: '0 0 8px', lineHeight: 1.6 }}>{rev.body}</p>}
              {rev.conditions_note && (
                <span style={{ fontSize: 11, fontWeight: 600, color: '#4B5563', background: '#F3F4F6', padding: '3px 9px', borderRadius: 20 }}>
                  🌤 {rev.conditions_note}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
