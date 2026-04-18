'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  MapPin, Heart, Package, MessageCircle, Settings, LogOut,
  ChevronRight, Plus, Eye, Bookmark, AlertCircle, Edit3, Zap,
  Building2, Calendar, Star, ExternalLink, Shield, CheckCircle, Camera,
} from 'lucide-react'
import MessagesTab from '@/components/account/MessagesTab'
import SaveButton from '@/components/listings/SaveButton'
import { upload as blobUpload } from '@vercel/blob/client'
import imageCompression from 'browser-image-compression'
import { v4 as avatarUuid } from 'uuid'

// ─── Types ───────────────────────────────────────────────────────────────────

interface MyListing {
  id: string; slug: string; title: string; price: string
  condition: string; status: string; viewsCount: number | null
  savesCount: number | null; createdAt: string; expiresAt: string | null
  image: { imageUrl: string } | null
}

interface MyShop {
  id: string; name: string; slug: string; description: string | null
  business_type: string; city: string | null; province: string | null
  logo_url: string | null; cover_url: string | null
  status: string; is_verified: boolean; is_premium: boolean
  views_count: number; rating: string | null; review_count: number
  boost_tier: string | null; boost_expires_at: string | null
  website: string | null; phone: string | null; email: string | null
}

interface MyEvent {
  id: string; title: string; slug: string
  discipline: string; event_type: string
  city: string | null; province: string | null
  status: string; event_date_start: string
  cover_image_url: string | null
  is_verified: boolean; is_featured: boolean
  views_count: number; boost_tier: string | null
}

interface SavedListing {
  id: string; slug: string; title: string; price: string
  condition: string; city: string | null; province: string | null
  bike_make: string | null; bike_model: string | null
  thumb_url: string | null
}

// ─── Constants ───────────────────────────────────────────────────────────────

const COND_COLORS: Record<string, string> = { new: '#10B981', like_new: '#3B82F6', used: '#F59E0B', poor: '#EF4444' }
const COND_LABELS: Record<string, string> = { new: 'New', like_new: 'Like New', used: 'Used', poor: 'Poor' }
const STATUS_COLORS: Record<string, string> = {
  active: '#10B981', verified: '#10B981', claimed: '#3B82F6',
  pending: '#F59E0B', expired: '#EF4444', sold: '#9CA3AF',
  upcoming: '#3B82F6', ongoing: '#10B981', completed: '#9CA3AF', cancelled: '#EF4444',
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })
}
function fmtPrice(p: string) {
  return `R ${parseFloat(p).toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`
}

// ─── Boost Button ─────────────────────────────────────────────────────────────
function BoostBtn({ listingId, directoryId, eventId }: { listingId?: string; directoryId?: string; eventId?: string }) {
  const params = new URLSearchParams()
  if (listingId)   params.set('listingId',   listingId)
  if (directoryId) params.set('directoryId', directoryId)
  if (eventId)     params.set('eventId',     eventId)
  params.set('returnTo', '/account')
  return (
    <Link href={`/boost/select?${params}`} onClick={e => e.stopPropagation()}>
      <button style={{ height: 28, padding: '0 10px', background: '#fff8e6', color: '#D97706', border: '1px solid #FDE68A', borderRadius: 2, fontSize: 11, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <Zap size={11} /> Boost
      </button>
    </Link>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? '#9CA3AF'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 800, background: color + '18', color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      {status.replace('_', ' ')}
    </span>
  )
}

// ─── My Listings Tab ──────────────────────────────────────────────────────────
function ListingsTab({ userId }: { userId: string }) {
  const [listings, setListings] = useState<MyListing[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/listings?seller=${userId}&status=all&limit=50`)
      .then(r => r.json())
      .then(d => setListings(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) return <Spinner />

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a' }}>My Listings</div>
          <div style={{ fontSize: 12, color: '#9a9a9a', marginTop: 2 }}>{listings.length} listing{listings.length !== 1 ? 's' : ''}</div>
        </div>
        <Link href="/sell/step-1">
          <button style={BTN_PRIMARY}><Plus size={14} /> New Listing</button>
        </Link>
      </div>

      {listings.length === 0 ? (
        <EmptyState icon={<Package size={24} />} title="No listings yet" sub="Post your first listing and start selling." action={{ href: '/sell/step-1', label: 'Post a listing' }} />
      ) : (
        listings.map(l => {
          const expired    = l.status === 'expired'
          const sold       = l.status === 'sold'
          const expiresAt  = l.expiresAt ? new Date(l.expiresAt) : null
          const daysLeft   = expiresAt ? Math.ceil((expiresAt.getTime() - Date.now()) / 86400000) : null
          const soonExpiry = !expired && daysLeft !== null && daysLeft < 7 && daysLeft > 0

          return (
            <div key={l.id} style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 2, padding: 12, marginBottom: 10, display: 'flex', gap: 12 }}>
              {/* Thumb */}
              <Link href={`/browse/${l.slug}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                <div style={{ width: 72, height: 72, borderRadius: 2, background: '#f5f5f5', overflow: 'hidden', position: 'relative' }}>
                  {l.image?.imageUrl
                    ? <Image src={l.image.imageUrl} alt={l.title} fill style={{ objectFit: 'cover' }} sizes="72px" />
                    : <div style={{ width: '100%', height: '100%', background: '#e8edf5' }} />
                  }
                </div>
              </Link>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link href={`/browse/${l.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#1a1a1a', margin: '2px 0' }}>{fmtPrice(l.price)}</div>
                </Link>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 4 }}>
                  <StatusBadge status={l.status} />
                  <span style={{ fontSize: 11, color: '#9a9a9a', display: 'flex', alignItems: 'center', gap: 3 }}><Eye size={10} /> {l.viewsCount ?? 0}</span>
                  <span style={{ fontSize: 11, color: '#9a9a9a', display: 'flex', alignItems: 'center', gap: 3 }}><Bookmark size={10} /> {l.savesCount ?? 0}</span>
                  {soonExpiry && <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}><AlertCircle size={10} /> Expires in {daysLeft}d</span>}
                </div>
                {/* Actions */}
                {!sold && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    {!expired && (
                      <>
                        <Link href={`/sell/edit/${l.id}`}><button style={BTN_GHOST}><Edit3 size={11} /> Edit</button></Link>
                        <button style={BTN_GHOST} onClick={async () => {
                          if (!window.confirm('Mark as sold?')) return
                          const res = await fetch(`/api/listings/by-id/${l.id}/mark-sold`, { method: 'POST' })
                          if (res.ok) setListings(ls => ls.map(x => x.id === l.id ? { ...x, status: 'sold' } : x))
                        }}>✓ Sold</button>
                        <BoostBtn listingId={l.id} />
                      </>
                    )}
                    {expired && (
                      <button style={{ ...BTN_GHOST, color: '#EF4444', borderColor: '#FECACA' }} onClick={async () => {
                        const res = await fetch(`/api/listings/${l.slug}/renew`, { method: 'POST' })
                        if (res.ok) setListings(ls => ls.map(x => x.id === l.id ? { ...x, status: 'active', expiresAt: new Date(Date.now() + 30 * 86400000).toISOString() } : x))
                      }}>↺ Renew</button>
                    )}
                  </div>
                )}
              </div>
              <ChevronRight size={15} style={{ color: '#d1d5db', flexShrink: 0, alignSelf: 'center' }} />
            </div>
          )
        })
      )}
    </div>
  )
}

// ─── My Shop Tab ──────────────────────────────────────────────────────────────
function ShopTab({ userId }: { userId: string }) {
  const [shop, setShop]   = useState<MyShop | null | 'loading'>('loading')

  useEffect(() => {
    fetch('/api/account/my-shop')
      .then(r => r.json())
      .then(d => setShop(d))
      .catch(() => setShop(null))
  }, [userId])

  if (shop === 'loading') return <Spinner />

  if (!shop) return (
    <EmptyState
      icon={<Building2 size={24} />}
      title="No shop linked"
      sub="Are you a bike shop? Claim your business listing to manage it here."
      action={{ href: '/directory/claim', label: 'Claim my shop' }}
      secondary={{ href: '/directory/register', label: 'Register new shop' }}
    />
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a' }}>My Shop</div>
        <BoostBtn directoryId={shop.id} />
      </div>

      {/* Shop card */}
      <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 2, overflow: 'hidden' }}>
        {/* Cover */}
        <div style={{ height: 100, background: 'linear-gradient(135deg,#1a2744,#0D1B2A)', position: 'relative', overflow: 'hidden' }}>
          {shop.cover_url && <Image src={shop.cover_url} alt={shop.name} fill style={{ objectFit: 'cover' }} sizes="600px" />}
          {shop.is_verified && (
            <div style={{ position: 'absolute', top: 10, right: 10, background: '#10B981', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle size={10} /> Verified
            </div>
          )}
        </div>

        <div style={{ padding: '0 16px 16px' }}>
          {/* Logo + name row */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginTop: -24, marginBottom: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: 10, background: '#fff', border: '2px solid #ebebeb', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
              {shop.logo_url
                ? <Image src={shop.logo_url} alt={shop.name} fill style={{ objectFit: 'cover' }} sizes="52px" />
                : <div style={{ width: '100%', height: '100%', background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={20} style={{ color: '#94a3b8' }} /></div>
              }
            </div>
            <div style={{ flex: 1, paddingBottom: 4 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a', lineHeight: 1.2 }}>{shop.name}</div>
              <div style={{ fontSize: 12, color: '#9a9a9a', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <MapPin size={11} /> {shop.city ?? ''}{shop.city && shop.province ? ', ' : ''}{shop.province ?? ''}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0, background: '#f9f9f9', borderRadius: 8, marginBottom: 14 }}>
            {[
              { val: shop.views_count?.toLocaleString() ?? '0', lbl: 'Views' },
              { val: shop.rating ? parseFloat(shop.rating).toFixed(1) : '—', lbl: 'Rating' },
              { val: String(shop.review_count ?? 0), lbl: 'Reviews' },
            ].map(s => (
              <div key={s.lbl} style={{ textAlign: 'center', padding: '10px 8px' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a' }}>{s.val}</div>
                <div style={{ fontSize: 10, color: '#9a9a9a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 2 }}>{s.lbl}</div>
              </div>
            ))}
          </div>

          {/* Status + boost */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
            <StatusBadge status={shop.status ?? 'active'} />
            {shop.boost_tier && shop.boost_tier !== 'free' && (
              <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 4, background: '#FEF3C7', color: '#D97706' }}>
                <Zap size={9} style={{ display: 'inline', marginRight: 3 }} />{shop.boost_tier?.toUpperCase()} BOOST
                {shop.boost_expires_at && ` · expires ${fmtDate(shop.boost_expires_at)}`}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href={`/account/my-listing`}><button style={BTN_GHOST}><Edit3 size={11} /> Edit Profile</button></Link>
            <Link href={`/directory/${shop.slug}`} target="_blank"><button style={BTN_GHOST}><ExternalLink size={11} /> View Listing</button></Link>
            <BoostBtn directoryId={shop.id} />
          </div>
        </div>
      </div>

      {/* Not verified yet? */}
      {!shop.is_verified && (
        <div style={{ marginTop: 12, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Shield size={16} style={{ color: '#D97706', flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#92400E', marginBottom: 2 }}>Not yet verified</div>
            <div style={{ fontSize: 12, color: '#B45309' }}>Our team will review and verify your listing. Verified shops get a badge and priority placement.</div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── My Events Tab ────────────────────────────────────────────────────────────
function EventsTab({ userId }: { userId: string }) {
  const [events, setEvents] = useState<MyEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/account/my-events')
      .then(r => r.json())
      .then(d => setEvents(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) return <Spinner />

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a' }}>My Events</div>
          <div style={{ fontSize: 12, color: '#9a9a9a', marginTop: 2 }}>{events.length} event{events.length !== 1 ? 's' : ''}</div>
        </div>
        <Link href="/events/submit"><button style={BTN_PRIMARY}><Plus size={14} /> Submit Event</button></Link>
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={<Calendar size={24} />}
          title="No events yet"
          sub="Organising a race, ride or event? Submit it here."
          action={{ href: '/events/submit', label: 'Submit an event' }}
        />
      ) : (
        events.map(ev => (
          <div key={ev.id} style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 2, overflow: 'hidden', marginBottom: 10, display: 'flex', gap: 12, padding: 12 }}>
            {/* Cover thumb */}
            <Link href={`/events/${ev.slug}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
              <div style={{ width: 72, height: 72, borderRadius: 2, background: 'linear-gradient(135deg,#1a2744,#0D1B2A)', overflow: 'hidden', position: 'relative' }}>
                {ev.cover_image_url
                  ? <Image src={ev.cover_image_url} alt={ev.title} fill style={{ objectFit: 'cover' }} sizes="72px" />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={20} style={{ color: 'rgba(255,255,255,0.3)' }} /></div>
                }
              </div>
            </Link>
            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <Link href={`/events/${ev.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</div>
                <div style={{ fontSize: 12, color: '#9a9a9a', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={10} /> {fmtDate(ev.event_date_start)}
                  {ev.city && <><MapPin size={10} style={{ marginLeft: 6 }} /> {ev.city}</>}
                </div>
              </Link>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 6 }}>
                <StatusBadge status={ev.status} />
                {ev.is_verified && <span style={{ fontSize: 10, fontWeight: 800, color: '#10B981', display: 'flex', alignItems: 'center', gap: 3 }}><CheckCircle size={10} /> Verified</span>}
                <span style={{ fontSize: 11, color: '#9a9a9a', display: 'flex', alignItems: 'center', gap: 3 }}><Eye size={10} /> {ev.views_count ?? 0}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                <Link href={`/events/${ev.slug}`}><button style={BTN_GHOST}><ExternalLink size={11} /> View</button></Link>
                <BoostBtn eventId={ev.id} />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// ─── Saved Tab ────────────────────────────────────────────────────────────────
function SavedTab() {
  const [savedListings, setSavedListings] = useState<SavedListing[]>([])
  const [savedRoutes, setSavedRoutes] = useState<Record<string, unknown>[]>([])
  const [savedEvents, setSavedEvents] = useState<Record<string, unknown>[]>([])
  const [loadingL, setLoadingL] = useState(true)
  const [loadingR, setLoadingR] = useState(true)
  const [loadingE, setLoadingE] = useState(true)
  const [activeSub, setActiveSub] = useState<'listings' | 'routes' | 'events'>('listings')

  useEffect(() => {
    fetch('/api/listings/saved').then(r => r.json()).then(d => setSavedListings(Array.isArray(d) ? d : [])).finally(() => setLoadingL(false))
    fetch('/api/routes/saved').then(r => r.json()).then(d => setSavedRoutes(Array.isArray(d) ? d : [])).finally(() => setLoadingR(false))
    fetch('/api/events/saved').then(r => r.json()).then(d => setSavedEvents(Array.isArray(d) ? d : (d?.events ?? []))).catch(() => setSavedEvents([])).finally(() => setLoadingE(false))
  }, [])

  const counts = { listings: savedListings.length, routes: savedRoutes.length, events: savedEvents.length }
  const pill = (key: 'listings' | 'routes' | 'events', label: string, n: number) => (
    <button
      key={key}
      onClick={() => setActiveSub(key)}
      style={{
        padding: '8px 16px', border: 'none', borderRadius: 999, cursor: 'pointer',
        background: activeSub === key ? 'var(--color-primary)' : '#f0f0f0',
        color: activeSub === key ? '#fff' : '#1a1a1a',
        fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap',
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}
    >
      {label}
      <span style={{
        background: activeSub === key ? 'rgba(255,255,255,.25)' : '#d4d4d4',
        color: activeSub === key ? '#fff' : '#1a1a1a',
        fontSize: 11, padding: '1px 7px', borderRadius: 999, fontWeight: 800,
      }}>{n}</span>
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Sub-tab pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {pill('listings', 'Listings', counts.listings)}
        {pill('routes',   'Routes',   counts.routes)}
        {pill('events',   'Events',   counts.events)}
      </div>

      {/* — Saved Listings — */}
      {activeSub === 'listings' && (
        loadingL ? <Spinner /> : savedListings.length === 0 ? (
          <EmptyState icon={<Heart size={22} />} title="Nothing saved yet" sub="Tap ♥ on any listing to save it here." action={{ href: '/browse', label: 'Browse listings' }} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(155px,1fr))', gap: 10 }}>
            {savedListings.map(l => (
              <Link key={l.id} href={`/browse/${l.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', background: '#f5f5f5' }}>
                    {l.thumb_url ? <Image src={l.thumb_url} alt={l.title} fill style={{ objectFit: 'cover' }} sizes="155px" /> : null}
                    <div style={{ position: 'absolute', top: 6, right: 6 }} onClick={e => { e.preventDefault(); e.stopPropagation() }}>
                      <SaveButton listingId={l.id} initialSaved={true} size="sm" />
                    </div>
                  </div>
                  <div style={{ padding: 10 }}>
                    {l.bike_make && <div style={{ fontSize: 10, color: '#9a9a9a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 2 }}>{l.bike_make}</div>}
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.bike_model ?? l.title}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a' }}>{fmtPrice(l.price)}</div>
                    <div style={{ fontSize: 11, color: '#9a9a9a', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={10} /> {l.city ?? l.province}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}

      {/* — Saved Routes — */}
      {activeSub === 'routes' && (
        loadingR ? <Spinner /> : savedRoutes.length === 0 ? (
          <EmptyState icon={<Star size={22} />} title="No saved routes" sub="Browse routes and bookmark your favourites." action={{ href: '/routes', label: 'Browse routes' }} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 10 }}>
            {savedRoutes.map((r: Record<string, unknown>) => (
              <Link key={String(r.id)} href={`/routes/${r.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: 90, background: 'linear-gradient(135deg,#1a2744,#0D1B2A)', position: 'relative', overflow: 'hidden' }}>
                    {r.hero_image_url ? <img src={String(r.hero_image_url)} alt={String(r.name)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                    <span style={{ position: 'absolute', top: 7, left: 7, background: 'rgba(0,0,0,.5)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 2, textTransform: 'uppercase' }}>{String(r.discipline)}</span>
                  </div>
                  <div style={{ padding: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0D1B2A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(r.name)}</div>
                    <div style={{ fontSize: 11, color: '#9a9a9a', display: 'flex', alignItems: 'center', gap: 3, margin: '3px 0 6px' }}><MapPin size={10} /> {String(r.town)}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {r.distance_km != null && <span style={{ fontSize: 11, fontWeight: 600, color: '#4B5563' }}>{parseFloat(String(r.distance_km)).toFixed(0)} km</span>}
                      {r.elevation_m != null && <span style={{ fontSize: 11, fontWeight: 600, color: '#4B5563' }}>{String(r.elevation_m)} m ↑</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}

      {/* — Saved Events — */}
      {activeSub === 'events' && (
        loadingE ? <Spinner /> : savedEvents.length === 0 ? (
          <EmptyState icon={<Star size={22} />} title="No saved events" sub="Tap ♥ on any event to save it here." action={{ href: '/events', label: 'Browse events' }} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10 }}>
            {savedEvents.map((e: Record<string, unknown>) => (
              <Link key={String(e.id)} href={`/events/${e.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: 90, background: 'linear-gradient(135deg,#1a2744,#0D1B2A)', position: 'relative' }}>
                    {e.banner_url ? <img src={String(e.banner_url)} alt={String(e.title)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                  </div>
                  <div style={{ padding: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0D1B2A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(e.title)}</div>
                    <div style={{ fontSize: 11, color: '#9a9a9a', display: 'flex', alignItems: 'center', gap: 3, margin: '3px 0' }}><MapPin size={10} /> {String(e.city ?? e.province ?? '')}</div>
                    {Boolean(e.start_date) && (
                      <div style={{ fontSize: 11, color: '#9a9a9a' }}>
                        {new Date(String(e.start_date)).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  )
}

const SA_PROVINCES = [
  'Eastern Cape','Free State','Gauteng','KwaZulu-Natal',
  'Limpopo','Mpumalanga','North West','Northern Cape','Western Cape',
]

// ─── Profile Tab ─────────────────────────────────────────────────────────────
function ProfileTab({ session, onAvatarChange }: { session: ReturnType<typeof useSession>['data']; onAvatarChange: (url: string | null) => void }) {
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>((session?.user as Record<string,unknown>)?.avatarUrl as string ?? null)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // Inline edit state
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue]       = useState('')
  const [editExtra, setEditExtra]       = useState('') // for currentPassword
  const [saving, setSaving]             = useState(false)
  const [fieldVals, setFieldVals]       = useState({
    name:     session?.user?.name ?? '',
    province: (session?.user as Record<string,unknown>)?.province as string ?? '',
  })

  const startEdit = (field: string) => {
    setEditingField(field)
    setEditExtra('')
    setMsg(null)
    if (field === 'name')     setEditValue(fieldVals.name)
    if (field === 'province') setEditValue(fieldVals.province)
    if (field === 'password') setEditValue('')
  }

  const cancelEdit = () => { setEditingField(null); setEditValue(''); setEditExtra('') }

  const saveEdit = async (field: string) => {
    setSaving(true)
    setMsg(null)
    try {
      const body: Record<string, string> = { field, value: editValue }
      if (field === 'password') body.currentPassword = editExtra
      const res  = await fetch('/api/account/update', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) { setMsg({ ok: false, text: data.error ?? 'Save failed' }); return }
      if (field === 'name')     setFieldVals(v => ({ ...v, name: data.name }))
      if (field === 'province') setFieldVals(v => ({ ...v, province: data.province ?? '' }))
      setMsg({ ok: true, text: field === 'password' ? 'Password updated!' : `${field.charAt(0).toUpperCase() + field.slice(1)} updated!` })
      setEditingField(null)
    } finally {
      setSaving(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setMsg(null)
    try {
      // Compress avatar down hard — display max ~400px so 0.5 MB is plenty.
      let toUpload: File | Blob = file
      try {
        toUpload = await imageCompression(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 800,
          useWebWorker: true,
          initialQuality: 0.85,
          fileType: 'image/jpeg',
        })
      } catch { toUpload = file }

      const filename = `avatars/${avatarUuid()}.jpg`
      const blob = await blobUpload(filename, toUpload, {
        access: 'public',
        handleUploadUrl: '/api/account/avatar',
        contentType: 'image/jpeg',
      })

      setAvatarUrl(blob.url)
      onAvatarChange(blob.url)
      setMsg({ ok: true, text: 'Profile photo updated!' })
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : 'Upload failed' })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleRemove = async () => {
    if (!window.confirm('Remove your profile photo?')) return
    await fetch('/api/account/avatar', { method: 'DELETE' })
    setAvatarUrl(null)
    onAvatarChange(null)
    setMsg({ ok: true, text: 'Photo removed.' })
  }

  const initials = session?.user?.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() ?? '?'

  return (
    <div>
      {/* Avatar section */}
      <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 2, padding: 20, marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid #f0f0f0' }}>Profile Photo</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Preview */}
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#0D1B2A', color: '#fff', fontSize: avatarUrl ? 0 : 28, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: '3px solid #ebebeb' }}>
            {avatarUrl
              ? <img src={avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : initials
            }
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
              Your photo appears on all your listings so buyers know who they&apos;re dealing with. JPEG, PNG or WebP, max 5MB.
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <label style={{ height: 34, padding: '0 14px', background: '#0D1B2A', color: '#fff', border: 'none', borderRadius: 2, fontSize: 12, fontWeight: 700, cursor: uploading ? 'default' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, opacity: uploading ? .6 : 1 }}>
                <Camera size={13} /> {uploading ? 'Uploading…' : avatarUrl ? 'Change Photo' : 'Upload Photo'}
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} style={{ display: 'none' }} disabled={uploading} />
              </label>
              {avatarUrl && (
                <button onClick={handleRemove} style={{ height: 34, padding: '0 14px', background: '#fff', color: '#EF4444', border: '1px solid #FECACA', borderRadius: 2, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  Remove
                </button>
              )}
            </div>
            {msg && <div style={{ fontSize: 12, marginTop: 8, color: msg.ok ? '#059669' : '#EF4444', fontWeight: 600 }}>{msg.ok ? '✓' : '✗'} {msg.text}</div>}
          </div>
        </div>
      </div>

      {/* Account details */}
      <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 2, padding: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #f0f0f0' }}>Account Details</div>

        {/* Name */}
        <div style={{ padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>Name</div>
          {editingField === 'name' ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') saveEdit('name'); if (e.key === 'Escape') cancelEdit() }}
                style={{ flex: 1, minWidth: 160, height: 34, padding: '0 10px', border: '1px solid #d1d5db', borderRadius: 2, fontSize: 14 }} />
              <button onClick={() => saveEdit('name')} disabled={saving} style={{ ...BTN_PRIMARY, height: 34 }}>{saving ? '…' : 'Save'}</button>
              <button onClick={cancelEdit} style={{ ...BTN_OUTLINE, height: 34 }}>Cancel</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 14, color: '#1a1a1a', fontWeight: 500 }}>{fieldVals.name || '—'}</div>
              <button onClick={() => startEdit('name')} style={{ fontSize: 12, color: '#0D1B2A', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
            </div>
          )}
        </div>

        {/* Email (read-only) */}
        <div style={{ padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 2 }}>Email</div>
          <div style={{ fontSize: 14, color: '#6b7280', fontWeight: 500 }}>{session?.user?.email ?? '—'}</div>
        </div>

        {/* Province */}
        <div style={{ padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>Province</div>
          {editingField === 'province' ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <select autoFocus value={editValue} onChange={e => setEditValue(e.target.value)}
                style={{ flex: 1, minWidth: 160, height: 34, padding: '0 10px', border: '1px solid #d1d5db', borderRadius: 2, fontSize: 14 }}>
                <option value="">— Select province —</option>
                {SA_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <button onClick={() => saveEdit('province')} disabled={saving} style={{ ...BTN_PRIMARY, height: 34 }}>{saving ? '…' : 'Save'}</button>
              <button onClick={cancelEdit} style={{ ...BTN_OUTLINE, height: 34 }}>Cancel</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 14, color: '#1a1a1a', fontWeight: 500 }}>{fieldVals.province || 'Not set'}</div>
              <button onClick={() => startEdit('province')} style={{ fontSize: 12, color: '#0D1B2A', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
            </div>
          )}
        </div>

        {/* Password */}
        <div style={{ padding: '10px 0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>Password</div>
          {editingField === 'password' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input autoFocus type="password" placeholder="Current password" value={editExtra} onChange={e => setEditExtra(e.target.value)}
                style={{ height: 34, padding: '0 10px', border: '1px solid #d1d5db', borderRadius: 2, fontSize: 14 }} />
              <input type="password" placeholder="New password (min 8 chars)" value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') saveEdit('password'); if (e.key === 'Escape') cancelEdit() }}
                style={{ height: 34, padding: '0 10px', border: '1px solid #d1d5db', borderRadius: 2, fontSize: 14 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => saveEdit('password')} disabled={saving} style={{ ...BTN_PRIMARY, height: 34 }}>{saving ? '…' : 'Update Password'}</button>
                <button onClick={cancelEdit} style={{ ...BTN_OUTLINE, height: 34 }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 14, color: '#1a1a1a', fontWeight: 500 }}>••••••••</div>
              <button onClick={() => startEdit('password')} style={{ fontSize: 12, color: '#0D1B2A', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
            </div>
          )}
        </div>

        {msg && <div style={{ fontSize: 12, marginTop: 10, color: msg.ok ? '#059669' : '#EF4444', fontWeight: 600 }}>{msg.ok ? '✓' : '✗'} {msg.text}</div>}
      </div>
      <button onClick={() => signOut({ callbackUrl: '/' })}
        style={{ width: '100%', height: 44, background: '#fff', border: '1px solid #e4e4e7', borderRadius: 2, fontSize: 14, fontWeight: 700, color: '#1a1a1a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <LogOut size={16} /> Sign out
      </button>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <div style={{ width: 28, height: 28, border: '3px solid #ebebeb', borderTopColor: '#0D1B2A', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
    </div>
  )
}

function EmptyState({ icon, title, sub, action, secondary }: { icon: React.ReactNode; title: string; sub: string; action: { href: string; label: string }; secondary?: { href: string; label: string } }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', background: '#fff', border: '1px solid #ebebeb', borderRadius: 2 }}>
      <div style={{ width: 52, height: 52, background: '#f0f4ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: '#0D1B2A' }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#9a9a9a', marginBottom: 20 }}>{sub}</div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href={action.href}><button style={BTN_PRIMARY}><Plus size={13} /> {action.label}</button></Link>
        {secondary && <Link href={secondary.href}><button style={BTN_OUTLINE}>{secondary.label}</button></Link>}
      </div>
    </div>
  )
}

const BTN_PRIMARY: React.CSSProperties = { height: 36, padding: '0 16px', background: '#0D1B2A', color: '#fff', border: 'none', borderRadius: 2, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }
const BTN_OUTLINE: React.CSSProperties = { height: 36, padding: '0 16px', background: '#fff', color: '#1a1a1a', border: '1px solid #e4e4e7', borderRadius: 2, fontSize: 13, fontWeight: 600, cursor: 'pointer' }
const BTN_GHOST:   React.CSSProperties = { height: 28, padding: '0 10px', background: 'none', color: '#0D1B2A', border: '1px solid #e4e4e7', borderRadius: 2, fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }

// ─── Main ─────────────────────────────────────────────────────────────────────
function AccountPageInner() {
  const { data: session, status } = useSession()
  const router       = useRouter()
  const searchParams = useSearchParams()

  const VALID_TABS = ['listings', 'shop', 'events', 'saved', 'messages', 'profile']
  const initialTab = VALID_TABS.includes(searchParams.get('tab') ?? '') ? searchParams.get('tab')! : 'listings'
  const [tab, setTab] = useState(initialTab)

  useEffect(() => {
    const t = searchParams.get('tab')
    if (t && VALID_TABS.includes(t)) setTab(t)
  }, [searchParams])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login?callbackUrl=/account')
  }, [status, router])

  if (status === 'loading') return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #ebebeb', borderTopColor: '#0D1B2A', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
  if (!session) return null

  const [heroAvatar, setHeroAvatar] = useState<string | null>((session.user as Record<string,unknown>)?.avatarUrl as string ?? null)
  const initials = session.user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '?'
  const userId   = session.user?.id ?? ''

  const TABS = [
    { id: 'listings', label: 'My Listings',  icon: Package },
    { id: 'shop',     label: 'My Shop',       icon: Building2 },
    { id: 'events',   label: 'My Events',     icon: Calendar },
    { id: 'saved',    label: 'Saved',          icon: Heart },
    { id: 'messages', label: 'Messages',       icon: MessageCircle },
    { id: 'profile',  label: 'Profile',        icon: Settings },
  ]

  const switchTab = (id: string) => {
    setTab(id)
    router.replace(`/account?tab=${id}`, { scroll: false })
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: 80 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* ── Hero ── */}
        <div style={{ background: 'var(--color-primary,#0D1B2A)', padding: '28px 20px 56px', color: '#fff' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fff', color: '#0D1B2A', fontSize: heroAvatar ? 0 : 26, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, border: '3px solid rgba(255,255,255,.25)', overflow: 'hidden', flexShrink: 0 }}>
            {heroAvatar
              ? <img src={heroAvatar} alt={session.user?.name ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : initials
            }
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{session.user?.name ?? 'Cyclist'}</div>
          <div style={{ fontSize: 13, opacity: .7, display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={12} /> {(session.user as Record<string, unknown>)?.province as string ?? 'South Africa'}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ background: '#fff', borderBottom: '1px solid #ebebeb', display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {TABS.map(t => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button key={t.id} onClick={() => switchTab(t.id)} style={{ flexShrink: 0, padding: '13px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: active ? 700 : 500, color: active ? '#0D1B2A' : '#9a9a9a', borderBottom: `2px solid ${active ? '#0D1B2A' : 'transparent'}`, display: 'flex', alignItems: 'center', gap: 5, transition: 'all .12s' }}>
                <Icon size={13} /> {t.label}
              </button>
            )
          })}
        </div>

        {/* ── Content ── */}
        <div style={{ padding: '20px 16px' }}>
          {tab === 'listings' && <ListingsTab userId={userId} />}
          {tab === 'shop'     && <ShopTab userId={userId} />}
          {tab === 'events'   && <EventsTab userId={userId} />}
          {tab === 'saved'    && <SavedTab />}
          {tab === 'messages' && <MessagesTab />}
          {tab === 'profile'  && <ProfileTab session={session} onAvatarChange={(url) => setHeroAvatar(url)} />}
        </div>
      </div>
    </div>
  )
}

export default function AccountPage() {
  return <Suspense fallback={null}><AccountPageInner /></Suspense>
}
