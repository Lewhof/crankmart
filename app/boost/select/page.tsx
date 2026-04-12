'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Zap, Star, Home, Building2, CheckCircle, ArrowRight, Loader2 } from 'lucide-react'

interface Package {
  id: number
  type: string
  name: string
  description: string
  durationDays: number | null
  priceCents: number
  // snake_case aliases (API may return either)
  duration_days?: number | null
  price_cents?: number
}

const TYPE_META: Record<string, { icon: React.ReactNode; color: string; badge: string }> = {
  bump:         { icon: <Zap size={20} />,       color: '#F59E0B', badge: 'Best value' },
  category_top: { icon: <Star size={20} />,      color: '#3B82F6', badge: 'Most popular' },
  homepage:     { icon: <Home size={20} />,      color: '#8B5CF6', badge: 'Max exposure' },
  directory:    { icon: <Building2 size={20} />, color: '#10B981', badge: 'For businesses' },
}

const PERKS: Record<string, string[]> = {
  bump:         ['Instantly pushed to top of category', 'Once-off — takes effect immediately', 'Cheapest way to get more eyes'],
  category_top: ['Pinned at top of search & category', 'Visible for 7 days', 'Blue "Top" badge on listing'],
  homepage:     ['Featured on CrankMart homepage', 'Highest visibility placement', '"Featured" badge for 7 days'],
  directory:    ['Premium spot in Business Directory', 'Featured badge on profile', 'Highlighted for 30 days'],
}

function formatPrice(cents: number) {
  return `R${(cents / 100).toFixed(2).replace('.00', '')}`
}

function BoostSelectInner() {
  const searchParams = useSearchParams()
  const listingId   = searchParams.get('listingId')
  const directoryId = searchParams.get('directoryId')
  const eventId     = searchParams.get('eventId')
  const routeId     = searchParams.get('routeId')
  const newsId      = searchParams.get('newsId')

  const [packages,   setPackages]   = useState<Package[]>([])
  const [selected,   setSelected]   = useState<number | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')

  useEffect(() => {
    fetch('/api/boosts/packages')
      .then(r => r.json())
      .then((data: Package[]) => {
        let filtered = data
        if      (directoryId) filtered = data.filter((p: Package) => p.type === 'directory')
        else if (eventId)     filtered = data.filter((p: Package) => p.type === 'event_feature')
        else if (routeId)     filtered = data.filter((p: Package) => p.type === 'route_feature')
        else if (newsId)      filtered = data.filter((p: Package) => p.type === 'news_feature')
        else                  filtered = data.filter((p: Package) => ['bump','category_top','homepage'].includes(p.type))
        setPackages(filtered)
        setLoading(false)
      })
  }, [directoryId, eventId, routeId, newsId])

  const selectedPkg = packages.find(p => p.id === selected)

  const handleBoost = async () => {
    if (!selected) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/boosts/initiate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ packageId: selected, listingId, directoryId, eventId, routeId, newsId }),
      })
      if (!res.ok) {
        const j = await res.json()
        throw new Error(j.error || 'Failed to initiate boost')
      }
      const { checkoutUrl, fields } = await res.json()

      // Build and auto-submit PayFast form
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = checkoutUrl
      Object.entries(fields).forEach(([k, v]) => {
        const input = document.createElement('input')
        input.type  = 'hidden'
        input.name  = k
        input.value = String(v)
        form.appendChild(input)
      })
      document.body.appendChild(form)
      form.submit()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  return (
    <div style={{ background: '#f8f8f8', minHeight: '100vh', padding: '40px 16px 80px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, background: '#1a1a2e', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Zap size={24} style={{ color: '#818cf8' }} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#1a1a1a', margin: '0 0 6px' }}>
            {directoryId ? 'Boost Your Business' : eventId ? 'Boost Your Event' : routeId ? 'Boost Your Route' : newsId ? 'Boost Your Article' : 'Boost Your Listing'}
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>
            Pick a boost to get more eyes on your {directoryId ? 'business' : eventId ? 'event' : routeId ? 'route' : newsId ? 'article' : 'listing'}. Pay via PayFast — secure, instant.
          </p>
        </div>

        {/* Packages */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Loader2 size={24} style={{ color: '#9CA3AF', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {packages.map(pkg => {
              const meta   = TYPE_META[pkg.type] ?? TYPE_META.bump
              const perks  = PERKS[pkg.type] ?? []
              const active = selected === pkg.id

              return (
                <div key={pkg.id} onClick={() => setSelected(pkg.id)} style={{
                  background: '#fff',
                  border:     `2px solid ${active ? meta.color : '#ebebeb'}`,
                  borderRadius: 12,
                  padding: '18px 20px',
                  cursor: 'pointer',
                  boxShadow: active ? `0 0 0 4px ${meta.color}20` : 'none',
                  position: 'relative',
                  transition: 'all .15s',
                }}>
                  {/* Accent bar */}
                  {active && <div style={{ position:'absolute', top:0, left:0, width:4, height:'100%', background:meta.color, borderRadius:'12px 0 0 12px' }} />}

                  <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:`${meta.color}18`, color:meta.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      {meta.icon}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                        <span style={{ fontSize:15, fontWeight:800, color:'#1a1a1a' }}>{pkg.name}</span>
                        <span style={{ background:`${meta.color}20`, color:meta.color, fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:20, textTransform:'uppercase' as const, letterSpacing:'0.05em', marginLeft:'auto', whiteSpace:'nowrap' as const }}>{meta.badge}</span>
                      </div>
                      <div style={{ fontSize:22, fontWeight:900, color:meta.color, marginBottom:6 }}>{formatPrice(pkg.priceCents ?? pkg.price_cents ?? 0)}</div>
                      <p style={{ fontSize:13, color:'#6B7280', margin:'0 0 8px', lineHeight:1.5 }}>{pkg.description}</p>
                      <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                        {perks.map(perk => (
                          <div key={perk} style={{ display:'flex', alignItems:'center', gap:5 }}>
                            <CheckCircle size={11} style={{ color:meta.color, flexShrink:0 }} />
                            <span style={{ fontSize:12, color:'#4B5563' }}>{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {error && (
          <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, padding:'12px 16px', marginBottom:14, fontSize:13, color:'#DC2626' }}>
            {error}
          </div>
        )}

        {/* CTA */}
        <button onClick={handleBoost} disabled={!selected || submitting} style={{
          width:'100%', padding:'15px', borderRadius:10, border:'none',
          background: selected ? (TYPE_META[selectedPkg?.type ?? '']?.color ?? '#273970') : '#e0e0e0',
          color: selected ? '#fff' : '#9CA3AF',
          fontSize:15, fontWeight:800,
          cursor: selected && !submitting ? 'pointer' : 'not-allowed',
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          transition:'all .15s',
        }}>
          {submitting
            ? <><Loader2 size={16} style={{ animation:'spin 1s linear infinite' }} /> Redirecting to PayFast…</>
            : selected
              ? <>{formatPrice(selectedPkg!.priceCents ?? selectedPkg!.price_cents ?? 0)} — Pay with PayFast <ArrowRight size={16} /></>
              : 'Select a boost package'
          }
        </button>

        <p style={{ textAlign:'center', fontSize:12, color:'#9CA3AF', marginTop:10 }}>
          Secure payment via PayFast · No subscription · Once-off
        </p>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export default function BoostSelectPage() {
  return (
    <Suspense fallback={<div style={{ padding:40, textAlign:'center', color:'#9CA3AF' }}>Loading…</div>}>
      <BoostSelectInner />
    </Suspense>
  )
}
