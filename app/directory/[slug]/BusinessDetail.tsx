'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { MapPin, Phone, Mail, Globe, MessageCircle, CheckCircle, Star, ExternalLink, ArrowLeft, Zap, Eye } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

interface Business {
  id: string; name: string; slug: string; type: string
  province: string; city: string; address: string
  location: { lat: number; lng: number } | null
  logo: string | null; banner: string | null; description: string | null
  website: string | null; email: string | null; phone: string | null; whatsapp: string | null
  brands: string[] | null; services: string[] | null
  verified: boolean; featured: boolean
  rating: string | number; reviews: number; views: number
  hours_json?: Record<string, string> | null
  opening_year?: number | null
  createdAt: string
}

interface Scraped {
  description: string | null; bannerImage: string | null; pageTitle: string | null
  phone: string | null; facebook: string | null; instagram: string | null; twitter: string | null
  hours: string | null; scrapedAt: string; sourceUrl: string
}

interface Related {
  id: string; name: string; slug: string; type: string; city: string
  logo: string | null; verified: boolean
}

const TYPE_LABELS: Record<string, string> = {
  shop: 'Bike Shop', online: 'Online Store', brand: 'Brand', club: 'Cycling Club',
  coach: 'Coach / Trainer', mechanic: 'Mobile Mechanic', tour: 'Tour Operator', other: 'Other'
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function BusinessDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  const { data: session } = useSession()

  const [business, setBusiness] = useState<Business | null>(null)
  const [related, setRelated] = useState<Related[]>([])
  const [scraped, setScraped] = useState<Scraped | null>(null)
  const [loading, setLoading] = useState(true)
  const [scraping, setScraping] = useState(false)

  useEffect(() => {
    if (!slug) return
    fetch(`/api/directory/${slug}`)
      .then(r => r.json())
      .then(d => {
        setBusiness(d.data || d)
        setRelated(d.related || [])
        // Auto-scrape website in background
        if (d.data?.website || d.website) {
          setScraping(true)
          fetch(`/api/directory/${slug}/scrape`)
            .then(r => r.json())
            .then(sd => { if (sd.scraped) setScraped(sd.scraped) })
            .catch(() => {})
            .finally(() => setScraping(false))
        }
      })
      .finally(() => setLoading(false))
  }, [slug])

  // Inject LocalBusiness schema when business data is loaded
  useEffect(() => {
    if (!business) return

    const sameAsLinks: string[] = []
    if (scraped?.facebook) sameAsLinks.push(scraped.facebook)
    if (scraped?.instagram) sameAsLinks.push(scraped.instagram)
    if (scraped?.twitter) sameAsLinks.push(scraped.twitter)

    const localBusinessSchema = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `https://crankmart.com/directory/${business.slug}#business`,
      name: business.name,
      description: business.description || `${business.name} is a ${TYPE_LABELS[business.type] || business.type} in ${business.city}, ${business.province}.`,
      url: `https://crankmart.com/directory/${business.slug}`,
      ...(business.phone && { telephone: business.phone }),
      ...(business.address && {
        address: {
          '@type': 'PostalAddress',
          streetAddress: business.address,
          addressLocality: business.city,
          addressRegion: business.province,
          addressCountry: 'ZA'
        }
      }),
      ...(business.location && {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: business.location.lat,
          longitude: business.location.lng
        }
      }),
      ...(business.rating && business.reviews && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: parseFloat(String(business.rating)),
          reviewCount: business.reviews
        }
      }),
      ...(business.logo && { image: business.logo }),
      ...(sameAsLinks.length > 0 && { sameAs: sameAsLinks })
    }

    // Remove existing schema if present
    const existingScript = document.getElementById('local-business-schema')
    if (existingScript) existingScript.remove()

    // Inject schema into head
    const script = document.createElement('script')
    script.id = 'local-business-schema'
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(localBusinessSchema)
    document.head.appendChild(script)

    return () => {
      const s = document.getElementById('local-business-schema')
      if (s) s.remove()
    }
  }, [business, scraped])

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#f5f5f5' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}} .sk{animation:pulse 1.4s infinite;background:#e5e7eb;border-radius:2px}`}</style>
      <div className="sk" style={{ height:280 }} />
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 16px' }}>
        <div className="sk" style={{ height:100, borderRadius:12, marginBottom:16 }} />
        <div className="sk" style={{ height:200, borderRadius:12 }} />
      </div>
    </div>
  )

  if (!business) return (
    <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <p style={{ fontSize:20, fontWeight:700 }}>Business not found</p>
        <Link href="/directory" style={{ color:'var(--color-primary)' }}>← Back to Directory</Link>
      </div>
    </div>
  )

  const bannerImg = business.banner || scraped?.bannerImage
  const description = business.description || scraped?.description
  const displayPhone = business.phone || scraped?.phone
  const facebook = scraped?.facebook
  const instagram = scraped?.instagram
  const rating = parseFloat(String(business.rating)) || 0

  return (
    <div style={{ minHeight:'100vh', background:'#f5f5f5', fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
      <style>{`
        * { box-sizing: border-box; }
        .chip { display:inline-flex; align-items:center; padding:6px 14px; border-radius:2px; font-size:13px; font-weight:600; }
        .card { background:#fff; border-radius:2px; border:1px solid #ebebeb; padding:20px; }
        .cta-btn { display:flex; align-items:center; justify-content:center; gap:8px; width:100%; height:44px; border-radius:2px; font-size:14px; font-weight:700; text-decoration:none; cursor:pointer; border:none; transition:opacity .15s; }
        .cta-btn:hover { opacity:.88; }
        .info-row { display:flex; align-items:center; gap:10px; padding:10px 0; border-bottom:1px solid #f0f0f0; font-size:13px; }
        .info-row:last-child { border-bottom:none; }
        .brand-pill { padding:5px 12px; background:#E9ECF5; color:var(--color-primary); border-radius:2px; font-size:12px; font-weight:700; }
        .service-pill { padding:5px 12px; background:#f5f5f5; color:#4b5563; border-radius:2px; font-size:12px; font-weight:600; }
        @media(min-width:768px) {
          .main-grid { display:grid; grid-template-columns:1fr 300px; gap:32px; align-items:start; }
        }
        .biz-sidebar { position:static; }
        @media(min-width:768px) { .biz-sidebar { position:sticky; top:76px; display:flex; flex-direction:column; gap:12px; } }
        /* Stats bar */
        .biz-stats-bar { background:#fff; border-bottom:1px solid #ebebeb; }
        .biz-stats-inner { max-width:1280px; margin:0 auto; padding:0 16px; display:flex; gap:0; overflow-x:auto; scrollbar-width:none; }
        .biz-stats-inner::-webkit-scrollbar { display:none; }
        .biz-stat { display:flex; align-items:center; gap:10px; padding:12px 0; flex-shrink:0; padding-right:24px; margin-right:24px; border-right:1px solid #f0f0f0; }
        .biz-stat:last-child { border-right:none; padding-right:0; margin-right:0; }
        .biz-stat-icon { color:var(--color-primary); flex-shrink:0; }
        .biz-stat-label { font-size:14px; font-weight:700; color:var(--color-primary); }
        .biz-stat-sub { font-size:11px; color:#9CA3AF; }
      `}</style>

      {/* Breadcrumb strip — white background */}
      <div style={{ background:'#fff', borderBottom:'1px solid #ebebeb' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'10px 16px' }}>
          <Breadcrumb items={[{ label:'Shops', href:'/directory' }, { label:business.name }]} />
        </div>
      </div>

      {/* Gallery / Banner */}
      {bannerImg && (
        <div style={{ height:280, position:'relative', overflow:'hidden', background:'#000', width:'100%' }}>
          <img src={bannerImg} alt={business.name} style={{ width:'100%', height:'100%', objectFit:'cover', opacity:.75 }} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,.5) 0%, transparent 60%)' }} />
        </div>
      )}

      {/* Hero fallback — logo on branded gradient when no banner exists */}
      {!bannerImg && business.logo && (
        <div
          style={{
            height: 280,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 18,
            background: 'linear-gradient(135deg, #1a2744 0%, #0D1B2A 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <img
            src={business.logo}
            alt={business.name}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
            style={{
              maxHeight: 170,
              maxWidth: '60%',
              objectFit: 'contain',
            }}
          />
          <div
            style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {TYPE_LABELS[business.type] || business.type} · {business.city}
          </div>
        </div>
      )}

      {/* Title band — dark bg, white text */}
      <div style={{ background:'var(--color-night-ride,#0D1B2A)', padding:'12px 0 16px', width:'100%' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 16px' }}>
          {/* Badges row */}
          <div style={{ display:'flex', gap:8, marginBottom:10, flexWrap:'wrap', alignItems:'center' }}>
            <span style={{ background:'rgba(255,255,255,0.15)', color:'#fff', fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:2, textTransform:'uppercase', letterSpacing:'.04em' }}>
              {TYPE_LABELS[business.type] || business.type}
            </span>
            {business.verified && (
              <span style={{ background:'rgba(22,163,74,0.85)', color:'#fff', fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:2, display:'inline-flex', alignItems:'center', gap:4 }}>
                <CheckCircle size={10} /> Verified
              </span>
            )}
            {business.featured && (
              <span style={{ background:'rgba(245,158,11,0.85)', color:'#fff', fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:2 }}>
                ⭐ Featured
              </span>
            )}
          </div>
          {/* H1 */}
          <h1 style={{ color:'#fff', fontSize:'clamp(20px,4vw,30px)', fontWeight:800, margin:'0 0 8px', lineHeight:1.2 }}>{business.name}</h1>
          {/* Meta */}
          <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
              <MapPin size={13} style={{ color:'rgba(255,255,255,0.6)' }} />
              <span style={{ color:'rgba(255,255,255,0.8)', fontSize:13 }}>{business.city}, {business.province}</span>
            </div>
            {rating > 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <Star size={12} color="#F59E0B" fill="#F59E0B" />
                <span style={{ color:'rgba(255,255,255,0.7)', fontSize:12 }}>{rating.toFixed(1)} ({business.reviews})</span>
              </div>
            )}
            {business.views > 0 && (
              <span style={{ color:'rgba(255,255,255,0.5)', fontSize:12 }}>{business.views} views</span>
            )}
          </div>
        </div>
      </div>

      {/* Boost CTA — logged-in users (owner-claimed later; for now any logged-in user) */}
      {session && !business.featured && (
        <div style={{ background:'linear-gradient(135deg,#1a1a2e,#273970)', padding:'12px 20px' }}>
          <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <Zap size={16} style={{ color:'#818cf8', flexShrink:0 }} />
              <div>
                <span style={{ fontSize:13, fontWeight:800, color:'#fff' }}>Feature this business</span>
                <span style={{ fontSize:12, color:'rgba(255,255,255,0.6)', marginLeft:8 }}>R149 for 30 days — prime directory placement</span>
              </div>
            </div>
            <Link href={`/boost/select?directoryId=${business.id}&returnTo=/directory/${slug}`}
              style={{ background:'#818cf8', color:'#fff', padding:'8px 18px', borderRadius:7, fontWeight:700, fontSize:12, textDecoration:'none', whiteSpace:'nowrap', flexShrink:0 }}>
              Boost →
            </Link>
          </div>
        </div>
      )}

      {/* Quick contact strip */}
      <div style={{ background:'#fff', borderBottom:'1px solid #ebebeb' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 16px' }}>
          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:0 }}>
            {[
              displayPhone   ? { href:`tel:${displayPhone}`,                            icon:<Phone size={14}/>,  label:displayPhone,                                       color:'var(--color-primary)' } : null,
              business.email ? { href:`mailto:${business.email}`,                       icon:<Mail size={14}/>,   label:business.email,                                     color:'var(--color-primary)' } : null,
              business.website ? { href:business.website, target:'_blank',              icon:<Globe size={14}/>,  label:business.website.replace(/^https?:\/\/(www\.)?/,''), color:'var(--color-primary)' } : null,
              facebook       ? { href:facebook,           target:'_blank',              icon:<span style={{fontSize:14,lineHeight:1}}>f</span>, label:'Facebook',            color:'#1877F2' } : null,
              instagram      ? { href:instagram,          target:'_blank',              icon:<span style={{fontSize:13,lineHeight:1}}>📷</span>, label:'Instagram',           color:'#E1306C' } : null,
            ].filter(Boolean).map((item: any, i, arr) => (
              <div key={i} style={{ display:'flex', alignItems:'center' }}>
                <a
                  href={item.href}
                  {...(item.target ? { target:'_blank', rel:'noopener noreferrer' } : {})}
                  style={{ display:'flex', alignItems:'center', gap:7, color:item.color, textDecoration:'none', fontSize:13, fontWeight:600, padding:'14px 20px', whiteSpace:'nowrap' }}
                >
                  {item.icon} {item.label}
                </a>
                {i < arr.length - 1 && (
                  <div style={{ width:1, height:18, background:'#e4e4e7', flexShrink:0 }} />
                )}
              </div>
            ))}
            {scraping && <span style={{ fontSize:11, color:'#9a9a9a', padding:'14px 20px', marginLeft:'auto' }}>Fetching latest info…</span>}
          </div>
        </div>
      </div>

      {/* Stats bar — type, location, verified status */}
      <div className="biz-stats-bar">
        <div className="biz-stats-inner">
          {[
            { icon: <MapPin size={16} />, label: `${business.city}, ${business.province}`, sub: 'Location' },
            { icon: <CheckCircle size={16} />, label: business.verified ? 'Verified' : 'Unverified', sub: 'Status' },
            ...(business.opening_year ? [{ icon: <Star size={16} />, label: `Est. ${business.opening_year}`, sub: 'Founded' }] : []),
            ...(business.views > 0 ? [{ icon: <Eye size={16} />, label: `${business.views}`, sub: 'Views' }] : []),
          ].map((s, i) => (
            <div key={i} className="biz-stat">
              <span className="biz-stat-icon">{s.icon}</span>
              <div>
                <div className="biz-stat-label">{s.label}</div>
                <div className="biz-stat-sub">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'24px 16px 60px' }}>
        <div className="main-grid">
          {/* Left column */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* About */}
            {description && (
              <div className="card">
                <h2 style={{ fontSize:15, fontWeight:800, color:'#1a1a1a', margin:'0 0 12px' }}>About {business.name}</h2>
                <p style={{ fontSize:14, lineHeight:1.7, color:'#374151', margin:0 }}>{description}</p>
              </div>
            )}

            {/* Brands */}
            {business.brands && business.brands.length > 0 && (
              <div className="card">
                <h2 style={{ fontSize:15, fontWeight:800, color:'#1a1a1a', margin:'0 0 12px' }}>Brands Stocked</h2>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {business.brands.map((b, i) => <span key={i} className="brand-pill">{b}</span>)}
                </div>
              </div>
            )}

            {/* Services */}
            {business.services && business.services.length > 0 && (
              <div className="card">
                <h2 style={{ fontSize:15, fontWeight:800, color:'#1a1a1a', margin:'0 0 12px' }}>Services</h2>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {business.services.map((s, i) => <span key={i} className="service-pill">{s}</span>)}
                </div>
              </div>
            )}

            {/* Location */}
            {business.address && (
              <div className="card">
                <h2 style={{ fontSize:15, fontWeight:800, color:'#1a1a1a', margin:'0 0 12px' }}>Location</h2>
                <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:14 }}>
                  <MapPin size={16} color="#0D1B2A" style={{ flexShrink:0, marginTop:2 }} />
                  <div>
                    <p style={{ margin:0, fontSize:14, color:'#374151', lineHeight:1.6 }}>{business.address}</p>
                    <p style={{ margin:'2px 0 0', fontSize:13, color:'#9a9a9a' }}>{business.city}, {business.province}</p>
                  </div>
                </div>
                {/* Google Maps embed link */}
                {business.location && (
                  <a href={`https://www.google.com/maps?q=${business.location.lat},${business.location.lng}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px', background:'#E9ECF5', color:'var(--color-primary)', borderRadius:8, fontSize:13, fontWeight:700, textDecoration:'none' }}>
                    <MapPin size={13} /> Open in Google Maps
                  </a>
                )}
                {!business.location && business.address && (
                  <a href={`https://www.google.com/maps/search/${encodeURIComponent(business.name + ' ' + business.city)}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px', background:'#E9ECF5', color:'var(--color-primary)', borderRadius:8, fontSize:13, fontWeight:700, textDecoration:'none' }}>
                    <MapPin size={13} /> Find on Google Maps
                  </a>
                )}
              </div>
            )}

          </div>

          {/* Right sidebar */}
          <div className="biz-sidebar">

            {/* CTA buttons */}
            <div className="card" style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {business.website && (
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <a href={business.website} target="_blank" rel="noopener noreferrer" className="cta-btn" style={{ background:'var(--color-primary)', color:'#fff' }}>
                    <Globe size={15} /> Visit Website <ExternalLink size={13} />
                  </a>
                  <a href={business.website} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize:11, color:'#9a9a9a', textAlign:'center', textDecoration:'underline', wordBreak:'break-all' }}>
                    {business.website}
                  </a>
                </div>
              )}
              {business.whatsapp && (
                <a href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="cta-btn" style={{ background:'#25D366', color:'#fff' }}>
                  <MessageCircle size={15} /> WhatsApp
                </a>
              )}
              {business.email && (
                <a href={`mailto:${business.email}`} className="cta-btn" style={{ background:'#fff', color:'var(--color-primary)', border:'1.5px solid #0D1B2A' }}>
                  <Mail size={15} /> Send Email
                </a>
              )}
              {displayPhone && (
                <a href={`tel:${displayPhone}`} className="cta-btn" style={{ background:'#f5f5f5', color:'#1a1a1a', border:'1.5px solid #e4e4e7' }}>
                  <Phone size={15} /> Call Now
                </a>
              )}
            </div>

            {/* Info card */}
            <div className="card">
              <h3 style={{ fontSize:13, fontWeight:800, color:'#1a1a1a', margin:'0 0 12px', textTransform:'uppercase', letterSpacing:'.5px' }}>Details</h3>
              <div>
                <div className="info-row">
                  <span style={{ fontSize:12, fontWeight:700, color:'#6b7280', width:80, flexShrink:0 }}>Type</span>
                  <span style={{ fontSize:13, color:'#1a1a1a' }}>{TYPE_LABELS[business.type] || business.type}</span>
                </div>
                {business.city && (
                  <div className="info-row">
                    <span style={{ fontSize:12, fontWeight:700, color:'#6b7280', width:80, flexShrink:0 }}>Location</span>
                    <span style={{ fontSize:13, color:'#1a1a1a' }}>{business.city}, {business.province}</span>
                  </div>
                )}
                {business.opening_year && (
                  <div className="info-row">
                    <span style={{ fontSize:12, fontWeight:700, color:'#6b7280', width:80, flexShrink:0 }}>Est.</span>
                    <span style={{ fontSize:13, color:'#1a1a1a' }}>{business.opening_year}</span>
                  </div>
                )}
                {scraped?.hours && (
                  <div className="info-row" style={{ alignItems:'flex-start' }}>
                    <span style={{ fontSize:12, fontWeight:700, color:'#6b7280', width:80, flexShrink:0, marginTop:1 }}>Hours</span>
                    <span style={{ fontSize:12, color:'#374151', lineHeight:1.5 }}>{scraped.hours}</span>
                  </div>
                )}
                <div className="info-row">
                  <span style={{ fontSize:12, fontWeight:700, color:'#6b7280', width:80, flexShrink:0 }}>Listed</span>
                  <span style={{ fontSize:13, color:'#1a1a1a' }}>{new Date(business.createdAt).toLocaleDateString('en-ZA', { month:'short', year:'numeric' })}</span>
                </div>
                {business.verified && (
                  <div className="info-row">
                    <span style={{ fontSize:12, fontWeight:700, color:'#6b7280', width:80, flexShrink:0 }}>Status</span>
                    <span style={{ fontSize:13, color:'#059669', fontWeight:700, display:'flex', alignItems:'center', gap:4 }}><CheckCircle size={12} /> Verified</span>
                  </div>
                )}
              </div>
            </div>

            {/* Social links */}
            {(facebook || instagram || scraped?.twitter) && (
              <div className="card">
                <h3 style={{ fontSize:13, fontWeight:800, color:'#1a1a1a', margin:'0 0 12px', textTransform:'uppercase', letterSpacing:'.5px' }}>Social</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {facebook && (
                    <a href={facebook} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#1877F2', fontWeight:600, textDecoration:'none' }}>
                      <span style={{fontSize:16}}>f</span> Facebook
                    </a>
                  )}
                  {instagram && (
                    <a href={instagram} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#E1306C', fontWeight:600, textDecoration:'none' }}>
                      <span style={{fontSize:16}}>📷</span> Instagram
                    </a>
                  )}
                  {scraped?.twitter && (
                    <a href={scraped.twitter} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#1a1a1a', fontWeight:600, textDecoration:'none' }}>
                      <span style={{fontSize:16}}>𝕏</span> X / Twitter
                    </a>
                  )}
                </div>
              </div>
            )}

            {scraped && (
              <p style={{ fontSize:11, color:'#9a9a9a', textAlign:'center' }}>
                Some info sourced from <a href={scraped.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color:'var(--color-primary)' }}>{scraped.sourceUrl.replace(/^https?:\/\/(www\.)?/,'').slice(0,30)}</a>
              </p>
            )}
          </div>
        </div>

        {/* Related businesses */}
        {related.length > 0 && (
          <div style={{ marginTop:32 }}>
            <h2 style={{ fontSize:16, fontWeight:800, color:'#1a1a1a', margin:'0 0 14px' }}>Similar shops & brands</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:12 }}>
              {related.map(biz => (
                <Link key={biz.id} href={`/directory/${biz.slug}`}
                  style={{ display:'flex', gap:12, background:'#fff', borderRadius:10, border:'1px solid #ebebeb', padding:'12px 14px', textDecoration:'none', color:'inherit', alignItems:'center', boxShadow:'0 1px 3px rgba(0,0,0,.05)', transition:'box-shadow .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.1)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.05)')}>
                  <div style={{ width:40, height:40, borderRadius:8, background: biz.logo ? 'transparent' : '#0D1B2A', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
                    {biz.logo
                      ? <img src={biz.logo} alt={biz.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : <span style={{ color:'#fff', fontSize:14, fontWeight:900 }}>{getInitials(biz.name)}</span>
                    }
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:'#1a1a1a', margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{biz.name}</p>
                    <p style={{ fontSize:11, color:'#9a9a9a', margin:0 }}>{biz.city}{biz.verified ? ' · ✓' : ''}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
