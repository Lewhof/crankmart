'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { MapPin, Package, Calendar, ChevronRight, Zap } from 'lucide-react'
import { countryFromPath } from '@/lib/regions-static'
import { formatPrice, getLocale } from '@/lib/currency'

interface SellerProfile {
  id: string; name: string; province: string | null; city: string | null; createdAt: string
  listingCount: number
}

interface ListingItem {
  id: string; slug: string; title: string; price: string
  condition: 'new' | 'like_new' | 'used' | 'poor'
  bikeMake: string | null; bikeModel: string | null; bikeYear: number | null
  boostEnabled: boolean | null; city: string | null; province: string | null
  image: { image_url: string; imageUrl?: string } | null
}

const COND_MAP = {
  new:      { label: 'New',      color: '#10B981' },
  like_new: { label: 'Like New', color: '#3B82F6' },
  used:     { label: 'Used',     color: '#F59E0B' },
  poor:     { label: 'Poor',     color: '#EF4444' },
}

export default function SellerProfilePage() {
  const params = useParams()
  const sellerId = params?.id as string

  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [listings, setListings] = useState<ListingItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sellerId) return
    Promise.all([
      fetch(`/api/seller/${sellerId}`).then(r => r.json()),
      fetch(`/api/listings?seller=${sellerId}&limit=24`).then(r => r.json()),
    ]).then(([profile, items]) => {
      setSeller(profile)
      setListings(Array.isArray(items) ? items : [])
    }).finally(() => setLoading(false))
  }, [sellerId])

  const country = countryFromPath(usePathname())
  const fmt = (p: string) => formatPrice(country, p)
  const memberSince = seller?.createdAt
    ? new Date(seller.createdAt).toLocaleDateString(getLocale(country), { month: 'long', year: 'numeric' })
    : ''
  const initials = seller?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .skel { animation:pulse 1.4s infinite; background:#efefef; border-radius:2px; }
        .listing-grid { display:grid; gap:12px; grid-template-columns:repeat(2,1fr); }
        @media(min-width:640px)  { .listing-grid { grid-template-columns:repeat(3,1fr); } }
        @media(min-width:900px)  { .listing-grid { grid-template-columns:repeat(4,1fr); } }
        @media(min-width:1100px) { .listing-grid { grid-template-columns:repeat(5,1fr); } }
        .lcard { background:#fff; border-radius:12px; border:1px solid #ebebeb; overflow:hidden; text-decoration:none; color:inherit; display:flex; flex-direction:column; box-shadow:0 1px 3px rgba(0,0,0,.06); transition:box-shadow .15s,transform .15s; }
        .lcard:hover { box-shadow:0 6px 20px rgba(0,0,0,.10); transform:translateY(-1px); }
        .lcard-img { position:relative; width:100%; padding-bottom:72%; background:#f0f0f0; overflow:hidden; flex-shrink:0; }
        .lcard-body { padding:10px 10px 12px; display:flex; flex-direction:column; flex:1; }
        .lcard-make { font-size:10px; color:#9a9a9a; font-weight:700; text-transform:uppercase; letter-spacing:.6px; margin-bottom:2px; }
        .lcard-title { font-size:13px; font-weight:700; color:#1a1a1a; line-height:1.3; margin-bottom:5px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        .lcard-price { font-size:15px; font-weight:800; color:#1a1a1a; margin-top:auto; }
        .lcard-loc { display:flex; align-items:center; gap:3px; font-size:11px; color:#9a9a9a; margin-top:3px; }
      `}</style>

      {/* Profile header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ebebeb' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px' }}>
          <Link href="/browse" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#9a9a9a', textDecoration: 'none', marginBottom: 20 }}>
            ← Back to Browse
          </Link>

          {loading ? (
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div className="skel" style={{ width: 72, height: 72, borderRadius: '50%' }} />
              <div style={{ flex: 1 }}>
                <div className="skel" style={{ height: 22, width: 160, marginBottom: 8 }} />
                <div className="skel" style={{ height: 14, width: 120 }} />
              </div>
            </div>
          ) : seller ? (
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Avatar */}
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', fontSize: 24, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <h1 style={{ fontSize: 22, fontWeight: 900, color: '#1a1a1a', margin: '0 0 6px' }}>{seller.name}</h1>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {(seller.city || seller.province) && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#6b7280' }}>
                      <MapPin size={13} />{seller.city ?? seller.province}
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#6b7280' }}>
                    <Calendar size={13} />Member since {memberSince}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#6b7280' }}>
                    <Package size={13} />{listings.length} active listing{listings.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: '#9a9a9a' }}>Seller not found.</p>
          )}
        </div>
      </div>

      {/* Listings */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px 80px' }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', margin: '0 0 16px' }}>
          {seller?.name ? `${seller.name.split(' ')[0]}'s Listings` : 'Listings'}
        </h2>

        {loading ? (
          <div className="listing-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="lcard">
                <div className="lcard-img skel" />
                <div className="lcard-body" style={{ gap: 8 }}>
                  <div className="skel" style={{ height: 10, width: '40%' }} />
                  <div className="skel" style={{ height: 14, width: '85%' }} />
                  <div className="skel" style={{ height: 18, width: '50%', marginTop: 8 }} />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9a9a9a' }}>
            <Package size={40} style={{ opacity: .3, marginBottom: 12 }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', margin: '0 0 4px' }}>No active listings</p>
            <p style={{ fontSize: 13, margin: 0 }}>This seller has no listings right now.</p>
          </div>
        ) : (
          <div className="listing-grid">
            {listings.map(item => {
              const cond = COND_MAP[item.condition]
              return (
                <Link key={item.id} href={`/browse/${item.slug}`} className="lcard">
                  <div className="lcard-img">
                    {item.image?.image_url || item.image?.imageUrl
                      ? <Image src={item.image.image_url || item.image.imageUrl!} alt={item.title} fill unoptimized style={{ objectFit: 'cover' }} sizes="(max-width:640px) 50vw, 20vw" />
                      : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 11, color: '#ccc' }}>No photo</span>
                        </div>
                    }
                    {item.boostEnabled && (
                      <div style={{ position: 'absolute', top: 8, left: 8, background: 'var(--color-primary)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Zap size={9} /> Featured
                      </div>
                    )}
                  </div>
                  <div className="lcard-body">
                    {item.bikeMake && <p className="lcard-make">{item.bikeMake}</p>}
                    <p className="lcard-title">{item.bikeModel ?? item.title}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#9a9a9a', marginBottom: 6, flexWrap: 'wrap' }}>
                      {item.bikeYear && <span>{item.bikeYear}</span>}
                      {cond && <><span>·</span><span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: cond.color, display: 'inline-block' }} />
                        {cond.label}
                      </span></>}
                    </div>
                    <p className="lcard-price">{fmt(item.price)}</p>
                    {(item.city || item.province) && (
                      <div className="lcard-loc"><MapPin size={10} />{item.city ?? item.province}</div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
