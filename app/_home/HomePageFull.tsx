'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, ChevronRight, Zap, MapPin, ArrowRight, Shield, Tag, Users, SlidersHorizontal, Calendar, Store, ExternalLink, Newspaper, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Country } from '@/lib/country'
import { getCountryConfig } from '@/lib/country-config'
import { formatPrice, getLocale } from '@/lib/currency'

interface Event {
  id: string; title: string; slug: string
  event_date_start: string; event_date_end?: string
  city: string; province: string; event_type: string
  entry_status: string; entry_fee?: string; distance?: string
  cover_image_url?: string; is_featured: boolean
}

interface Shop {
  id: string; name: string; slug: string
  type: string; city: string; province: string
  description: string; logo?: string
  brands?: string[]; verified: boolean
}

interface NewsArticle {
  id: string; title: string; slug: string; excerpt: string
  cover_image_url: string | null; category: string; author_name: string
  is_featured: boolean; views_count: number; published_at: string
}

interface FeaturedListing {
  id: string; slug: string; title: string; price: string
  city: string | null; province: string | null
  condition: 'new' | 'like_new' | 'used' | 'poor'
  bikeMake: string | null; bikeModel: string | null; bikeYear: number | null
  boostEnabled: boolean | null
  image: { image_url: string; imageUrl?: string } | null
}

const COND_MAP = {
  new:      { label: 'New',      color: '#10B981' },
  like_new: { label: 'Like New', color: '#3B82F6' },
  used:     { label: 'Used',     color: '#F59E0B' },
  poor:     { label: 'Poor',     color: '#EF4444' },
}

const CATEGORIES = [
  { label: 'MTB',         slug: 'mtb',           img: '/images/07-bike-trek-mtb.jpg' },
  { label: 'Road',        slug: 'road-bike',      img: '/images/08-bike-specialized-road.jpg' },
  { label: 'Gravel',      slug: 'gravel-bike',    img: '/images/06-hero-gravel-stellenbosch.jpg' },
  { label: 'E-Bikes',     slug: 'e-bikes',        img: '/images/01-hero-mtb-karoo.jpg' },
  { label: 'Parts',       slug: 'drivetrain',     img: '/images/09-bike-parts-groupset.jpg' },
  { label: 'Gear',        slug: 'gear-apparel',   img: '/images/10-bike-helmet-gear.jpg' },
]

interface HomePageFullProps {
  country?: Country
  initial?: {
    featured?: FeaturedListing[]
    events?: Event[]
    shops?: Shop[]
    newsArticles?: NewsArticle[]
  }
}

export default function HomePageFull({ country = 'za', initial }: HomePageFullProps = {}) {
  const router = useRouter()
  const cfg = getCountryConfig(country)
  const locale = getLocale(country)
  const countryAdj = country === 'za' ? 'SA' : 'AU'
  const [search, setSearch] = useState('')
  const [featured]     = useState<FeaturedListing[]>(initial?.featured     ?? [])
  const [events]       = useState<Event[]>(          initial?.events       ?? [])
  const [shops]        = useState<Shop[]>(           initial?.shops        ?? [])
  const [newsArticles] = useState<NewsArticle[]>(    initial?.newsArticles ?? [])
  const [slideIdx, setSlideIdx] = useState(0)
  const [catExpanded, setCatExpanded] = useState(false)

  const SLIDES = [
    { img: '/images/01-hero-mtb-karoo.jpg',         headline: `${cfg.name}'s Cycling Marketplace`,       sub: 'Buy and sell bikes, gear and parts — free to list.' },
    { img: '/images/02-hero-chapmans-peak.jpg',      headline: 'Find Your Next Ride',                     sub: `Thousands of listings from ${countryAdj} cyclists.` },
    { img: '/images/06-hero-gravel-stellenbosch.jpg',headline: 'Sell in Minutes',                         sub: 'List your bike for free. Reach serious buyers.' },
  ]

  // Auto-advance hero slides
  useEffect(() => {
    const t = setInterval(() => setSlideIdx(i => (i + 1) % SLIDES.length), 5000)
    return () => clearInterval(t)
  }, [])

  // Data for listings/events/shops/news is seeded by the server wrapper
  // via the `initial` prop — no client-side waterfall on mount.

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) router.push(`/browse?search=${encodeURIComponent(search)}`)
    else router.push('/browse')
  }

  const fmt = (p: string) => formatPrice(country, p)

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <style>{`
        /* Hero */
        .hero { position:relative; height:520px; overflow:hidden; }
        @media(max-width:640px){ .hero { height:420px; } }
        .hero-slide { position:absolute; inset:0; transition:opacity .8s ease; }
        .hero-overlay { position:absolute; inset:0; background:linear-gradient(to bottom, rgba(0,0,0,.35) 0%, rgba(0,0,0,.6) 100%); }
        .hero-content { position:relative; z-index:2; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:0 20px; }
        .hero-title { font-size:clamp(26px,5vw,52px); font-weight:900; color:#fff; line-height:1.1; margin:0 0 10px; letter-spacing:-1px; text-shadow:0 2px 12px rgba(0,0,0,.3); }
        .hero-sub { font-size:clamp(14px,2vw,18px); color:rgba(255,255,255,.88); margin:0; font-weight:500; }
        .hero-dots { position:absolute; bottom:18px; left:50%; transform:translateX(-50%); display:flex; gap:6px; z-index:3; }
        .hero-dot { width:8px; height:8px; border-radius:50%; background:rgba(255,255,255,.4); border:none; cursor:pointer; padding:0; transition:background .2s; }
        .hero-dot.active { background:#fff; }

        /* Category + search + filter bar */
        .hcat-section { background:#fff; border-bottom:1px solid #ebebeb; }
        .hcat-inner { max-width:1280px; margin:0 auto; padding:10px 16px; display:flex; align-items:center; gap:8px; overflow-x:auto; scrollbar-width:none; }
        .hcat-inner::-webkit-scrollbar { display:none; }
        .hcat-pill { flex-shrink:0; padding:7px 16px; border-radius:2px; border:1px solid #e4e4e7; background:#fff; font-size:13px; font-weight:500; color:#1a1a1a; cursor:pointer; white-space:nowrap; transition:all .12s; text-decoration:none; }
        .hcat-pill:hover, .hcat-pill.active { background:var(--color-primary); color:#fff; border-color:var(--color-primary); font-weight:700; }
        /* Search inline — desktop only */
        .hcat-search-inline { display:none; }
        .hcat-filter-inline { display:none !important; }
        @media(min-width:768px) {
          .hcat-search-inline { display:flex; flex:1; min-width:0; max-width:320px; gap:0; border-radius:2px; overflow:hidden; border:1px solid #e4e4e7; }
          .hcat-search-inline:focus-within { border-color:var(--color-primary); }
          .hcat-filter-inline { display:flex !important; }
          .hmobile-search-row { display:none !important; }
        }
        /* Mobile search row */
        .hmobile-search-row { background:#f5f5f5; border-bottom:1px solid #e8e8e8; }
        .hfilter-bar { max-width:1280px; margin:0 auto; padding:8px 16px; display:flex; align-items:center; gap:8px; }
        .hsearch-wrap { flex:1; min-width:0; display:flex; gap:0; border-radius:2px; overflow:hidden; border:1px solid #e4e4e7; }
        .hsearch-wrap:focus-within { border-color:var(--color-primary); }
        .hero-input { flex:1; height:38px; padding:0 14px; border:none; font-size:13px; outline:none; font-family:inherit; min-width:0; }
        .hero-btn { height:38px; padding:0 18px; background:var(--color-primary); color:#fff; border:none; font-size:13px; font-weight:700; cursor:pointer; white-space:nowrap; display:flex; align-items:center; gap:6px; transition:background .15s; flex-shrink:0; }
        .hero-btn:hover { background:#1d2b57; }
        .hfbtn { flex-shrink:0; display:flex; align-items:center; gap:5px; padding:7px 14px; border-radius:2px; border:1px solid #e4e4e7; background:#fff; font-size:13px; font-weight:500; color:#1a1a1a; cursor:pointer; white-space:nowrap; text-decoration:none; }
        .hfbtn:hover { border-color:var(--color-primary); color:var(--color-primary); }
        /* Mega menu */
        .hmega-overlay { position:fixed; inset:0; z-index:19; background:rgba(0,0,0,0.25); }
        .hmega-dropdown { position:absolute; top:100%; left:0; right:0; background:#fff; border-bottom:1px solid #ebebeb; box-shadow:0 12px 40px rgba(0,0,0,.15); z-index:20; padding:20px 24px 24px; }

        /* Value props */
        .values { display:flex; justify-content:center; gap:0; border-bottom:1px solid #ebebeb; background:#fff; }
        .value-item { flex:1; max-width:280px; display:flex; align-items:center; gap:12px; padding:20px 24px; border-right:1px solid #ebebeb; }
        .value-item:last-child { border-right:none; }
        @media(max-width:640px) { .values { flex-direction:column; } .value-item { border-right:none; border-bottom:1px solid #ebebeb; max-width:none; } .value-item:last-child { border-bottom:none; } }
        .value-icon { width:40px; height:40px; border-radius:2px; background:#E9ECF5; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .value-title { font-size:14px; font-weight:700; color:#1a1a1a; margin:0 0 2px; }
        .value-desc { font-size:12px; color:#9a9a9a; margin:0; }

        /* Section */
        .section { max-width:1280px; margin:0 auto; padding:40px 16px; }
        .section-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
        .section-title { font-size:22px; font-weight:800; color:#1a1a1a; margin:0; }
        .section-link { display:flex; align-items:center; gap:4px; font-size:13px; font-weight:600; color:var(--color-primary); text-decoration:none; border:1px solid var(--color-primary); border-radius:2px; padding:6px 14px; }
        .section-link:hover { background:#E9ECF5; }

        /* Category grid */
        .cat-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
        @media(min-width:768px) { .cat-grid { grid-template-columns:repeat(6,1fr); } }
        .cat-card { position:relative; border-radius:2px; overflow:hidden; aspect-ratio:1; cursor:pointer; text-decoration:none; }
        .cat-card-img { transition:transform .3s; }
        .cat-card:hover .cat-card-img { transform:scale(1.05); }
        .cat-card-overlay { position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,.65) 0%, rgba(0,0,0,.1) 60%); }
        .cat-card-label { position:absolute; bottom:10px; left:0; right:0; text-align:center; font-size:13px; font-weight:800; color:#fff; letter-spacing:.3px; }

        /* Listing grid */
        .listing-grid { display:grid; gap:12px; grid-template-columns:repeat(2,1fr); }
        @media(min-width:640px)  { .listing-grid { grid-template-columns:repeat(3,1fr); } }
        @media(min-width:900px)  { .listing-grid { grid-template-columns:repeat(4,1fr); } }
        @media(min-width:1100px) { .listing-grid { grid-template-columns:repeat(6,1fr); } }

        .lcard { background:#fff; border-radius:2px; border:1px solid #ebebeb; overflow:hidden; text-decoration:none; color:inherit; display:flex; flex-direction:column; box-shadow:0 1px 3px rgba(0,0,0,.06); transition:box-shadow .15s,transform .15s; }
        .lcard:hover { box-shadow:0 6px 20px rgba(0,0,0,.10); transform:translateY(-1px); }
        .lcard-img { position:relative; width:100%; padding-bottom:72%; background:#f0f0f0; overflow:hidden; flex-shrink:0; }
        .lcard-body { padding:10px 10px 12px; display:flex; flex-direction:column; flex:1; }
        .lcard-make { font-size:10px; color:#9a9a9a; font-weight:700; text-transform:uppercase; letter-spacing:.6px; margin-bottom:2px; }
        .lcard-title { font-size:13px; font-weight:700; color:#1a1a1a; line-height:1.3; margin-bottom:5px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        .lcard-price { font-size:15px; font-weight:800; color:#1a1a1a; margin-top:auto; }
        .lcard-loc { display:flex; align-items:center; gap:3px; font-size:11px; color:#9a9a9a; margin-top:3px; }

        /* CTA Banner */
        .cta-banner { background:var(--color-night-ride); padding:36px 40px; display:flex; align-items:center; justify-content:space-between; gap:24px; flex-wrap:wrap; position:relative; overflow:hidden; }
        .cta-banner::before { content:''; position:absolute; right:-16px; top:-16px; width:80px; height:80px; border:1px solid rgba(255,255,255,0.04); border-radius:50%; }
        .cta-eyebrow { font-size:10px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.35); margin-bottom:8px; }
        .cta-text h2 { font-size:clamp(18px,2.5vw,26px); font-weight:800; color:#fff; margin:0 0 6px; letter-spacing:-0.3px; }
        .cta-text p { font-size:13px; color:rgba(255,255,255,0.32); margin:0; font-weight:300; }
        .cta-actions { display:flex; gap:12px; flex-wrap:wrap; }
        .cta-btn-primary { display:inline-flex; align-items:center; gap:8px; height:44px; padding:0 24px; background:#fff; color:var(--color-primary); border-radius:4px; font-size:13px; font-weight:800; text-decoration:none; letter-spacing:0.04em; transition:opacity .15s; white-space:nowrap; }
        .cta-btn-primary:hover { opacity:.9; }
        .cta-btn-secondary { display:inline-flex; align-items:center; gap:8px; height:44px; padding:0 20px; background:transparent; color:rgba(255,255,255,0.5); border:1px solid rgba(255,255,255,0.15); border-radius:4px; font-size:13px; font-weight:600; text-decoration:none; transition:border-color .15s,color .15s; }
        .cta-btn-secondary:hover { border-color:rgba(255,255,255,0.35); color:rgba(255,255,255,0.8); }

        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .skel { animation:pulse 1.4s infinite; background:#efefef; border-radius:2px; }
      `}</style>

      {/* ── Hero ── */}
      <div className="hero">
        {SLIDES.map((slide, i) => (
          <div key={i} className="hero-slide" style={{ opacity: slideIdx === i ? 1 : 0, zIndex: slideIdx === i ? 1 : 0 }}>
            <Image src={slide.img} alt={slide.headline} fill unoptimized style={{ objectFit: 'cover' }} priority={i === 0} />
          </div>
        ))}
        <div className="hero-overlay" style={{ zIndex: 1 }} />
        <div className="hero-content">
          <h1 className="hero-title">{SLIDES[slideIdx].headline}</h1>
          <p className="hero-sub">{SLIDES[slideIdx].sub}</p>
        </div>
        <div className="hero-dots" style={{ zIndex: 3 }}>
          {SLIDES.map((_, i) => (
            <button key={i} className={`hero-dot${slideIdx === i ? ' active' : ''}`} onClick={() => setSlideIdx(i)} />
          ))}
        </div>
      </div>

      {/* ── Category pills + search + filter — all one row on desktop ── */}
      <div className="hcat-section" style={{ position: 'relative' }}>
        <div className="hcat-inner">
          {[
            { label: 'All',     slug: 'all' },
            { label: 'MTB',     slug: 'mtb' },
            { label: 'Road',    slug: 'road-bike' },
            { label: 'Gravel',  slug: 'gravel-bike' },
            { label: 'E-Bikes', slug: 'e-bikes' },
            { label: 'Gear',    slug: 'gear-apparel' },
          ].map(c => (
            <Link key={c.slug} href={`/browse?category=${c.slug}`} className="hcat-pill">{c.label}</Link>
          ))}
          <button
            className={`hcat-pill${catExpanded ? ' active' : ''}`}
            onClick={() => setCatExpanded(p => !p)}
            style={{ fontWeight: 700 }}>
            {catExpanded ? '▲ Less' : '▼ More'}
          </button>
          {/* Search + filter — inline on desktop, hidden on mobile (shown in row below) */}
          <form className="hcat-search-inline" onSubmit={handleSearch}>
            <input
              className="hero-input"
              type="text"
              placeholder="Search bikes, brands, parts…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" className="hero-btn">
              <Search size={13} /> Search
            </button>
          </form>
          <Link href="/browse?filters=open" className="hfbtn hcat-filter-inline">
            <SlidersHorizontal size={13} /> Filters
          </Link>
        </div>

        {catExpanded && (
          <>
            <div className="hmega-overlay" onClick={() => setCatExpanded(false)} />
            <div className="hmega-dropdown">
              <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px 32px' }}>
                  {[
                    { group: 'Complete Bikes', items: [{ label:'Enduro', slug:'enduro' },{ label:'Downhill', slug:'downhill' },{ label:'XC', slug:'xc' },{ label:'Hardtail MTB', slug:'hardtail-mtb' },{ label:'Full-Sus MTB', slug:'full-suspension-mtb' },{ label:'BMX', slug:'bmx' },{ label:'Hybrid / City', slug:'hybrid-city' },{ label:'Fat Bikes', slug:'fat-bikes' },{ label:'Vintage', slug:'vintage' }] },
                    { group: 'E-Bikes', items: [{ label:'E-MTB', slug:'e-mtb' },{ label:'E-Road / Gravel', slug:'e-road-gravel' },{ label:'E-Urban', slug:'e-urban' },{ label:'E-Bike Motors', slug:'e-bike-motors' },{ label:'Batteries', slug:'e-bike-batteries' }] },
                    { group: 'Frames', items: [{ label:'Road Frames', slug:'road-frames' },{ label:'MTB Hardtail', slug:'mtb-frames-hardtail' },{ label:'MTB Full Sus', slug:'mtb-frames-fullsus' },{ label:'Gravel / CX', slug:'gravel-frames' },{ label:'BMX Frames', slug:'bmx-frames' }] },
                    { group: 'Parts', items: [{ label:'Suspension', slug:'suspension' },{ label:'Wheels & Tyres', slug:'wheels-tyres' },{ label:'Drivetrain', slug:'drivetrain' },{ label:'Cockpit', slug:'cockpit' },{ label:'Brakes', slug:'brakes' },{ label:'Pedals', slug:'pedals' },{ label:'Saddles', slug:'saddles-seatposts' }] },
                    { group: 'Gear & Apparel', items: [{ label:'Helmets', slug:'helmets' },{ label:'Shoes', slug:'shoes' },{ label:'Jerseys', slug:'jerseys' },{ label:'Bib Shorts', slug:'bib-shorts' },{ label:'Gloves', slug:'gloves' },{ label:'Protection', slug:'protection-armour' }] },
                    { group: 'Accessories', items: [{ label:'Lights', slug:'lights' },{ label:'Computers & GPS', slug:'computers-gps' },{ label:'Bags', slug:'bags-backpacks' },{ label:'Trainers', slug:'trainers-rollers' },{ label:'Tools', slug:'tools-accessories' },{ label:'Kids Bikes', slug:'kids-bikes' },{ label:'Wanted', slug:'wanted' }] },
                  ].map(group => (
                    <div key={group.group}>
                      <div style={{ fontSize:11, fontWeight:700, color:'#9a9a9a', textTransform:'uppercase', letterSpacing:'.6px', paddingBottom:8, borderBottom:'1.5px solid #e0e0e0', marginBottom:10 }}>
                        {group.group}
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                        {group.items.map(item => (
                          <Link key={item.slug} href={`/browse?category=${item.slug}`}
                            onClick={() => setCatExpanded(false)}
                            style={{ fontSize:13, color:'#1a1a1a', padding:'3px 0', textDecoration:'none' }}>
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Search + Filter bar — mobile only (Row 2) ── */}
      <div className="hmobile-search-row">
        <div className="hfilter-bar">
          <form className="hsearch-wrap" onSubmit={handleSearch}>
            <input
              className="hero-input"
              type="text"
              placeholder="Search bikes, brands, parts…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" className="hero-btn">
              <Search size={13} /> Search
            </button>
          </form>
          <Link href="/browse?filters=open" className="hfbtn">
            <SlidersHorizontal size={13} /> Filters
          </Link>
        </div>
      </div>

      {/* ── Shop by Category ── */}
      <div className="section">
        <div className="section-hdr">
          <h2 className="section-title">Shop by Category</h2>
          <Link href="/browse?filters=open" className="section-link">All Categories <ChevronRight size={13} /></Link>
        </div>
        <div className="cat-grid">
          {CATEGORIES.map(cat => (
            <Link key={cat.slug} href={`/browse?category=${cat.slug}`} className="cat-card">
              <Image src={cat.img} alt={cat.label} fill unoptimized className="cat-card-img" style={{ objectFit: 'cover' }} />
              <div className="cat-card-overlay" />
              <span className="cat-card-label">{cat.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Featured Listings ── */}
      <div style={{ background: '#f5f5f5', paddingBottom: 8 }}>
        <div className="section" style={{ paddingBottom: 0 }}>
          <div className="section-hdr">
            <h2 className="section-title">Featured Listings</h2>
            <Link href="/browse" className="section-link">Browse All <ArrowRight size={13} /></Link>
          </div>
          <div className="listing-grid">
            {featured.length === 0
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="lcard">
                    <div className="lcard-img skel" />
                    <div className="lcard-body" style={{ gap: 8 }}>
                      <div className="skel" style={{ height: 10, width: '40%' }} />
                      <div className="skel" style={{ height: 14, width: '85%' }} />
                      <div className="skel" style={{ height: 18, width: '50%', marginTop: 8 }} />
                    </div>
                  </div>
                ))
              : featured.map(item => {
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
                })
            }
          </div>
        </div>
      </div>

      {/* ── Value props (moved below featured listings) ── */}
      <div className="values" style={{ borderTop: '1px solid #ebebeb' }}>
        <div className="value-item">
          <div className="value-icon"><Tag size={20} color="#0D1B2A" /></div>
          <div>
            <p className="value-title">Free to List</p>
            <p className="value-desc">No fees, no commissions. Ever.</p>
          </div>
        </div>
        <div className="value-item">
          <div className="value-icon"><Users size={20} color="#0D1B2A" /></div>
          <div>
            <p className="value-title">{countryAdj} Cyclists Only</p>
            <p className="value-desc">Buy and sell locally, safely.</p>
          </div>
        </div>
        <div className="value-item">
          <div className="value-icon"><Shield size={20} color="#0D1B2A" /></div>
          <div>
            <p className="value-title">Trusted Platform</p>
            <p className="value-desc">Verified listings from real riders.</p>
          </div>
        </div>
      </div>

      {/* ── Latest News ── */}
      <div style={{ background: '#fff', borderTop: '1px solid #ebebeb' }}>
        <div className="section">
          <div className="section-hdr">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: '#E9ECF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Newspaper size={18} color="#0D1B2A" />
              </div>
              <div>
                <h2 className="section-title" style={{ marginBottom: 2 }}>Latest Cycling News</h2>
                <p style={{ margin: 0, fontSize: 12, color: '#9a9a9a' }}>Race reports, industry news & {countryAdj} cycling updates</p>
              </div>
            </div>
            <Link href="/news" className="section-link">All News <ChevronRight size={13} /></Link>
          </div>

          {newsArticles.length === 0 ? (
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #ebebeb' }}>
                  <div style={{ height: 150, background: '#efefef', animation: 'pulse 1.4s infinite' }} />
                  <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ height: 10, width: '30%', borderRadius: 4, background: '#efefef', animation: 'pulse 1.4s infinite' }} />
                    <div style={{ height: 16, width: '90%', borderRadius: 4, background: '#efefef', animation: 'pulse 1.4s infinite' }} />
                    <div style={{ height: 12, width: '60%', borderRadius: 4, background: '#efefef', animation: 'pulse 1.4s infinite' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {newsArticles.map((article, i) => (
                <Link key={article.id} href={`/news/${article.slug}`}
                  style={{ display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 2, border: '1px solid #ebebeb', overflow: 'hidden', textDecoration: 'none', color: 'inherit', boxShadow: '0 1px 3px rgba(0,0,0,.05)', transition: 'box-shadow .15s, transform .15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,.10)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,.05)'; (e.currentTarget as HTMLElement).style.transform = '' }}>
                  {/* Image */}
                  <div style={{ position: 'relative', width: '100%', paddingBottom: '52%', background: '#f0f0f0', overflow: 'hidden' }}>
                    {article.cover_image_url
                      ? <Image src={article.cover_image_url} alt={article.title} fill unoptimized style={{ objectFit: 'cover' }} sizes="(max-width:640px) 100vw, 33vw" />
                      : <div style={{ position: 'absolute', inset: 0, background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Newspaper size={28} color="#ccc" />
                        </div>
                    }
                    {i === 0 && article.is_featured && (
                      <span style={{ position: 'absolute', top: 10, left: 10, padding: '3px 10px', background: 'var(--color-primary)', color: '#fff', borderRadius: 20, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px' }}>
                        Featured
                      </span>
                    )}
                    <span style={{ position: 'absolute', top: 10, right: 10, padding: '3px 10px', background: 'rgba(0,0,0,.5)', color: '#fff', borderRadius: 20, fontSize: 10, fontWeight: 600, textTransform: 'capitalize' }}>
                      {article.category}
                    </span>
                  </div>
                  {/* Body */}
                  <div style={{ padding: '12px 14px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a', margin: '0 0 6px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {article.title}
                    </p>
                    <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 10px', lineHeight: 1.5, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {article.excerpt}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#9a9a9a' }}>
                      <span>{article.author_name} · {new Date(article.published_at).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Eye size={11} />{article.views_count}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Upcoming Events ── */}
      <div style={{ background: '#fff', borderTop: '1px solid #ebebeb' }}>
        <div className="section">
          <div className="section-hdr">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: '#E9ECF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Calendar size={18} color="#0D1B2A" />
              </div>
              <div>
                <h2 className="section-title" style={{ marginBottom: 2 }}>Upcoming Events</h2>
                <p style={{ margin: 0, fontSize: 12, color: '#9a9a9a' }}>Races, rides & cycling events across SA</p>
              </div>
            </div>
            <Link href="/events" className="section-link">All Events <ChevronRight size={13} /></Link>
          </div>

          {events.length === 0 ? (
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ height: 100, borderRadius: 2, background: '#efefef', animation: 'pulse 1.4s infinite' }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {events.map(ev => {
                const dateStart = new Date(ev.event_date_start)
                const day = dateStart.toLocaleDateString(locale, { day: 'numeric' })
                const mon = dateStart.toLocaleDateString(locale, { month: 'short' }).toUpperCase()
                const statusColor = ev.entry_status === 'open' ? '#10B981' : ev.entry_status === 'closed' ? '#EF4444' : '#F59E0B'
                return (
                  <Link key={ev.id} href={`/events/${ev.slug}`} style={{ display: 'flex', gap: 14, background: '#fff', borderRadius: 2, border: '1px solid #ebebeb', padding: '14px 16px', textDecoration: 'none', color: 'inherit', boxShadow: '0 1px 3px rgba(0,0,0,.05)', transition: 'box-shadow .15s', alignItems: 'center' }}>
                    {/* Date block */}
                    <div style={{ flexShrink: 0, width: 48, height: 52, borderRadius: 2, background: 'var(--color-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{day}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.7)', letterSpacing: '.5px' }}>{mon}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</div>
                      <div style={{ fontSize: 12, color: '#9a9a9a', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
                        <MapPin size={10} />{ev.city}, {ev.province}
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: statusColor, background: `${statusColor}18`, padding: '2px 8px', borderRadius: 20  }}>
                          {ev.entry_status === 'open' ? 'Open' : ev.entry_status === 'closed' ? 'Closed' : 'Coming Soon'}
                        </span>
                        {ev.distance && <span style={{ fontSize: 11, color: '#9a9a9a' }}>{ev.distance}</span>}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Featured Shops ── */}
      <div style={{ background: '#f5f5f5', borderTop: '1px solid #ebebeb' }}>
        <div className="section">
          <div className="section-hdr">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: '#E9ECF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Store size={18} color="#0D1B2A" />
              </div>
              <div>
                <h2 className="section-title" style={{ marginBottom: 2 }}>Featured Shops</h2>
                <p style={{ margin: 0, fontSize: 12, color: '#9a9a9a' }}>{countryAdj}'s top bike shops and brands</p>
              </div>
            </div>
            <Link href="/directory" className="section-link">All Shops <ChevronRight size={13} /></Link>
          </div>

          {shops.length === 0 ? (
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ height: 90, borderRadius: 2, background: '#efefef', animation: 'pulse 1.4s infinite' }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
              {shops.map(shop => (
                <Link key={shop.id} href={`/directory/${shop.slug}`} style={{ display: 'flex', gap: 12, background: '#fff', borderRadius: 2, border: '1px solid #ebebeb', padding: '14px 16px', textDecoration: 'none', color: 'inherit', boxShadow: '0 1px 3px rgba(0,0,0,.05)', alignItems: 'flex-start' }}>
                  {/* Logo or initial */}
                  <div style={{ width: 44, height: 44, borderRadius: 2, background: '#E9ECF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18, fontWeight: 900, color: 'var(--color-primary)' }}>
                    {shop.logo
                      ? <Image src={shop.logo} alt={shop.name} width={44} height={44} unoptimized style={{ borderRadius: 2, objectFit: 'cover' }} />
                      : shop.name[0].toUpperCase()
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shop.name}</span>
                      {shop.verified && <span style={{ fontSize: 10, background: 'var(--color-primary)', color: '#fff', padding: '1px 6px', borderRadius: 9999, fontWeight: 700, flexShrink: 0 }}>✓</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#9a9a9a', marginBottom: 5 }}>{shop.city}, {shop.province}</div>
                    {shop.brands && shop.brands.length > 0 && (
                      <div style={{ fontSize: 11, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {shop.brands.slice(0, 3).join(' · ')}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Sell CTA ── */}
      <div className="cta-banner">
        <div className="cta-text">
          <div className="cta-eyebrow">Free Forever</div>
          <h2>List Your Cycling Business.</h2>
          <p>Reach thousands of {countryAdj} cyclists. 2 minutes. No card needed.</p>
        </div>
        <div className="cta-actions">
          <Link href="/directory/register" className="cta-btn-primary">
            GET LISTED FREE
          </Link>
          <Link href="/browse" className="cta-btn-secondary">
            Browse Listings <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  )
}
