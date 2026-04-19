'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { countryFromPath } from '@/lib/regions-static'
import { formatPrice, getLocale } from '@/lib/currency'
import {
  ArrowLeft, Heart, Share2, Eye, Bookmark,
  MapPin, MessageCircle, Shield, CheckCircle, X, Tag, Zap, Search, SlidersHorizontal, ChevronRight
} from 'lucide-react'
import ContactSeller from '@/components/listings/ContactSeller'
import { CommentThread } from '@/components/community/CommentThread'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Listing {
  id: string; title: string; price: string; description: string; status?: string
  condition: string; bikeMake: string | null; bikeModel: string | null
  bikeYear: number | null; frameSize: string | null
  wheelSizeInches: number | null; suspensionTravelMm: number | null
  frameMaterial: string | null; drivetrainSpeeds: number | null
  brakeType: string | null; componentBrands: string | null
  damageNotes: string | null; tradeConsidered: boolean | null
  originalReceipt: boolean | null; warrantyRemaining: string | null
  recentUpgrades: string | null; colour: string | null
  youtubeUrl: string | null; province: string | null; city: string | null
  postalCode: string | null; shippingAvailable: boolean | null
  viewsCount: number | null; savesCount: number | null
  negotiable: boolean | null
  attributes?: Record<string, string | boolean>
  categoryId?: number | null
  category?: { id: number; slug: string; name: string; parentSlug?: string; parentName?: string } | null
  images: Array<{ id: string; imageUrl: string }>
  user: { id: string; name: string; email: string; province: string | null; city: string | null; createdAt: string; avatarUrl?: string | null } | null
}

const COND = {
  new:      { label: 'New',      color: '#10B981', bg: '#ECFDF5' },
  like_new: { label: 'Like New', color: '#3B82F6', bg: '#EFF6FF' },
  used:     { label: 'Used',     color: '#F59E0B', bg: '#FFFBEB' },
  poor:     { label: 'Poor',     color: '#EF4444', bg: '#FEF2F2' },
}

// Category-specific attribute filters (mirrors Browse page)
const CATEGORY_FILTERS: Record<string, Array<{ key: string; label: string; options: string[] }>> = {
  mtb:            [{ key:'suspension',label:'Suspension',options:['Full Sus','Hardtail'] },{ key:'frameSize',label:'Frame Size',options:['XS','S','M','L','XL'] },{ key:'wheelSize',label:'Wheel Size',options:['27.5"','29"'] },{ key:'travel',label:'Travel',options:['100-120mm','130-150mm','160mm+'] }],
  enduro:         [{ key:'suspension',label:'Suspension',options:['Full Sus'] },{ key:'frameSize',label:'Frame Size',options:['S','M','L','XL'] },{ key:'wheelSize',label:'Wheel Size',options:['27.5"','29"','Mixed'] },{ key:'travel',label:'Travel',options:['150-160mm','160mm+','170mm+'] }],
  'road-bike':    [{ key:'frameSize',label:'Frame Size',options:['XS','S','M','L','XL'] },{ key:'groupset',label:'Groupset',options:['Shimano 105','Shimano Ultegra','Shimano Dura-Ace','SRAM Rival','SRAM Force','SRAM Red'] },{ key:'frameType',label:'Frame Type',options:['Endurance','Aero','Climbing'] }],
  'gravel-bike':  [{ key:'frameSize',label:'Frame Size',options:['XS','S','M','L','XL'] },{ key:'groupset',label:'Groupset',options:['Shimano GRX','SRAM Rival AXS','SRAM Force AXS','Campagnolo Ekar'] },{ key:'tyreWidth',label:'Tyre Width',options:['35-40mm','40-45mm','45mm+'] }],
  helmets:        [{ key:'size',label:'Size',options:['XS/S','S/M','M/L','L/XL'] },{ key:'type',label:'Type',options:['Road','MTB Trail','Enduro','XC'] }],
  shoes:          [{ key:'size',label:'Size',options:['EU40','EU41','EU42','EU43','EU44','EU45','EU46'] },{ key:'type',label:'Type',options:['Road','MTB Clipless','MTB Flat','Gravel'] }],
  'gear-apparel': [{ key:'size',label:'Size',options:['XS','S','M','L','XL','XXL'] },{ key:'gender',label:'Gender',options:['Mens','Womens','Unisex'] },{ key:'type',label:'Type',options:['Jersey','Bib Shorts','Jacket','Gilet','Kit'] }],
  suspension:     [{ key:'type',label:'Type',options:['Fork','Rear Shock','Fork + Shock'] },{ key:'travel',label:'Travel',options:['100mm','120mm','140mm','150mm','160mm','170mm'] }],
  'e-bikes':      [{ key:'motor',label:'Motor',options:['Bosch Performance CX','Shimano EP8','Yamaha PW-X3','Specialized SL 1.1'] },{ key:'battery',label:'Battery',options:['250Wh','320Wh','500Wh','625Wh','750Wh'] },{ key:'frameSize',label:'Frame Size',options:['S','M','L','XL'] }],
  'e-mtb':        [{ key:'motor',label:'Motor',options:['Bosch Performance CX','Shimano EP8','Yamaha PW-X3'] },{ key:'travel',label:'Travel',options:['140mm','150mm','160mm','170mm'] },{ key:'frameSize',label:'Frame Size',options:['S','M','L','XL'] }],
  frames:         [{ key:'frameSize',label:'Frame Size',options:['XS','S','M','L','XL'] },{ key:'material',label:'Material',options:['Carbon','Aluminium','Steel','Titanium'] }],
  wheels:         [{ key:'wheelSize',label:'Wheel Size',options:['26"','27.5"','29"','700c'] },{ key:'discipline',label:'Discipline',options:['Road','MTB','Gravel'] }],
}

export default function ListingDetailClient() {
  const params = useParams()
  const country = countryFromPath(usePathname())
  const locale = getLocale(country)
  const slug = params?.slug as string

  const { data: session } = useSession()
  const router = useRouter()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const [saved, setSaved] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)
  const [specsOpen, setSpecsOpen] = useState(true)
  const [similar, setSimilar] = useState<any[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [showFilterDrawer, setShowFilterDrawer] = useState(false)
  const [filterProvince, setFilterProvince] = useState('')
  const [filterCondition, setFilterCondition] = useState('')
  const [filterAttrs, setFilterAttrs] = useState<Record<string,string>>({})
  const [drawerCatParent, setDrawerCatParent] = useState<string | null>(null)  // null = use listing's parent
  const [drawerCatChild, setDrawerCatChild] = useState<string | null>(null)    // null = use listing's child
  const [categories, setCategories] = useState<{parents: any[], children: any[]}>({ parents: [], children: [] })

  // Use sentinel value 'NONE' to distinguish "user explicitly cleared" from "not yet set"
  const resetFilters = () => {
    setDrawerCatParent('NONE')
    setDrawerCatChild('NONE')
    setFilterCondition('')
    setFilterProvince('')
    setFilterAttrs({})
  }

  const restoreContextual = () => {
    setDrawerCatParent(null)   // null = snap back to listing's category
    setDrawerCatChild(null)
    setFilterCondition('')
    setFilterProvince('')
    setFilterAttrs({})
  }

  // Make offer modal
  const [offerOpen, setOfferOpen] = useState(false)
  const [offerAmount, setOfferAmount] = useState('')
  const [offerNote, setOfferNote] = useState('')
  const [offerSending, setOfferSending] = useState(false)
  const [offerSent, setOfferSent] = useState(false)
  const [offerError, setOfferError] = useState('')

  const handleMakeOffer = () => {
    if (!session?.user) { router.push('/login'); return }
    setOfferOpen(true)
    setOfferSent(false)
    setOfferError('')
  }

  const submitOffer = async () => {
    if (!listing) return
    const amount = parseFloat(offerAmount.replace(/[^0-9.]/g, ''))
    if (!amount || amount <= 0) { setOfferError('Please enter a valid offer amount.'); return }
    setOfferSending(true)
    setOfferError('')
    try {
      const body = `💰 OFFER: ${formatPrice(country, amount)}${offerNote.trim() ? `\n\n${offerNote.trim()}` : ''}\n\n— Sent via CrankMart Make Offer`
      const res = await fetch('/api/messages/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id, body }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send offer')
      setOfferSent(true)
    } catch (e: any) {
      setOfferError(e.message)
    } finally {
      setOfferSending(false)
    }
  }

  useEffect(() => {
    if (!slug) return
    fetch(`/api/listings/${slug}`)
      .then(r => r.json())
      .then(d => {
        setListing(d)
        // Fetch similar listings using same categoryId
        const catId = d?.categoryId || null
        const catParam = catId ? `&categoryId=${catId}` : ''
        fetch(`/api/listings?limit=8&exclude=${slug}${catParam}`)
          .then(r => r.json())
          .then(items => setSimilar(Array.isArray(items) ? items.slice(0, 8) : []))
          .catch(() => {})
      })
      .finally(() => setLoading(false))
  }, [slug])

  // Load category tree
  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => {
      if (d.parents) setCategories(d)
    }).catch(() => {})
  }, [])

  if (loading) return (
    <div style={{ maxWidth: '100%', margin: '0 auto', padding: '16px' }}>
      <div style={{ height: 320, background: '#f0f0f0', borderRadius: 12, marginBottom: 16, animation: 'pulse 1.4s infinite' }} />
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  )

  if (!listing) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <p style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>Listing not found</p>
      <Link href="/browse" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>← Back to Browse</Link>
    </div>
  )

  const isSold = listing.status === 'sold'
  const cond = COND[listing.condition as keyof typeof COND]
  const imgs = listing.images?.length ? listing.images : [{ id: '0', imageUrl: '' }]
  const isBike = listing.bikeMake || listing.bikeModel
  const memberSince = listing.user?.createdAt
    ? new Date(listing.user.createdAt).toLocaleDateString(locale, { month: 'long', year: 'numeric' })
    : null

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: 100 }}>
      <style>{`
        /* Layout wrapper */
        .detail-wrapper { max-width: 1280px; margin: 0 auto; padding: 0 16px; box-sizing: border-box; }
        @media(min-width:900px) { .detail-wrapper { padding: 0 24px; } }

        /* Top bar */
        .topbar { background:#fff; position:sticky; top:60px; z-index:30; border-bottom:1px solid #ebebeb; padding:0; }
        .topbar-title { font-size:14px; font-weight:700; color:#1a1a1a; }
        .topbar-actions { display:flex; gap:8px; }
        .icon-btn { width:36px; height:36px; border-radius:50%; background:#f5f5f5; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; }

        /* Main content grid — mobile single col, desktop 2 col */
        .detail-grid { display:grid; grid-template-columns:1fr; gap:0; padding:0; }
        @media(min-width:900px) {
          .detail-grid { grid-template-columns:55% 1fr; gap:24px; padding:24px 0; align-items:start; }
        }

        /* Gallery (left column on desktop) */
        .gallery { background:#000; position:relative; grid-column:1; }
        @media(min-width:900px) {
          .gallery { border-radius:12px; overflow:hidden; }
        }
        .gallery-main { position:relative; width:100%; padding-bottom:75%; background:#1a1a1a; overflow:hidden; }
        .img-counter { position:absolute; bottom:12px; right:12px; background:rgba(0,0,0,.55); color:#fff; font-size:12px; font-weight:700; padding:4px 10px; border-radius:9999px; backdrop-filter:blur(4px); }
        .thumb-strip { display:flex; gap:8px; padding:8px 12px; background:#111; overflow-x:auto; scrollbar-width:none; }
        .thumb-strip::-webkit-scrollbar { display:none; }
        .thumb { width:64px; height:48px; border-radius:2px; overflow:hidden; flex-shrink:0; cursor:pointer; border:2px solid transparent; transition:border-color .15s; }
        .thumb.active { border-color:#fff; }

        /* Details section (right column on desktop) */
        .details-section { grid-column:1; grid-row:2; }
        @media(min-width:900px) {
          .details-section {
            grid-column:2; grid-row:1; align-self:start;
            display:flex; flex-direction:column; gap:16px;
            position:sticky; top:104px;
            max-height:calc(100vh - 120px);
            overflow-y:auto; overflow-x:hidden;
            scrollbar-width:none;
          }
          .details-section::-webkit-scrollbar { display:none; }
        }

        /* Seller section — below gallery on desktop (col 1, row 2) */
        .seller-section { display:none; }
        @media(min-width:900px) {
          .seller-section { display:flex; flex-direction:column; gap:12px; grid-column:1; grid-row:2; padding:0; align-self:start; }
        }
        /* Hide mobile seller block on desktop */
        .seller-mobile-only { display:block; }
        @media(min-width:900px) { .seller-mobile-only { display:none; } }

        /* Content card */
        .content-card { background:#fff; margin:0; padding:16px; }
        @media(min-width:768px) { .content-card { border-radius:2px; padding:16px; } }
        @media(min-width:900px) { .content-card { margin:0; padding:16px; border-radius:2px; } }

        /* Section heading */
        .sec-title { font-size:13px; font-weight:700; color:#9a9a9a; textTransform:'uppercase'; letter-spacing:'.6px'; margin:'0 0 12px'; }

        /* Chips */
        .chips { display:flex; flex-wrap:wrap; gap:8px; }
        .chip { display:inline-flex; align-items:center; gap:6px; padding:6px 12px; border-radius:2px; border:1px solid #e8e8e8; background:#fff; font-size:12px; }
        .chip-label { font-weight:700; color:#1a1a1a; }
        .chip-val { color:#6b6b6b; font-size:12px; }

        /* Spec rows */
        .spec-row { padding:12px 0; border-bottom:1px solid #f0f0f0; display:flex; justify-content:space-between; align-items:flex-start; }
        .spec-row:last-child { border-bottom:none; }
        .spec-key { font-size:13px; font-weight:700; color:#1a1a1a; }
        .spec-val { font-size:13px; color:#6b6b6b; text-align:right; max-width:55%; }

        /* Size card */
        .size-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .size-card { background:#f5f5f5; border-radius:2px; padding:12px; }
        .size-card-label { font-size:11px; color:#9a9a9a; font-weight:600; text-transform:uppercase; letter-spacing:.5px; margin-bottom:4px; }
        .size-card-val { font-size:18px; font-weight:800; color:#1a1a1a; }

        /* Seller card */
        .seller-card { background:#f5f5f5; border-radius:2px; padding:14px; }
        .seller-avatar { width:40px; height:40px; border-radius:50%; background:var(--color-primary); color:#fff; font-size:16px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; }

        /* Price block — no longer needs its own sticky; handled by parent */
        .price-block { }

        /* Filter bar — NOT sticky, sits just below topbar */
        .filter-bar { background:#fff; border-bottom:1px solid #ebebeb; padding:0; }
        .filter-bar-inner { max-width:1280px; margin:0 auto; width:100%; display:flex; align-items:center; gap:0; overflow:hidden; padding:8px 16px; box-sizing:border-box; }
        @media(min-width:900px) { .filter-bar-inner { padding:10px 24px; } }
        .fb-btn { flex-shrink:0; display:flex; align-items:center; gap:5px; height:32px; padding:0 10px; border-radius:2px; border:1px solid #e4e4e7; background:#fff; font-size:12px; font-weight:600; color:#1a1a1a; cursor:pointer; white-space:nowrap; transition:all .12s; margin-right:12px; }
        @media(min-width:900px) { .fb-btn { height:36px; padding:0 14px; font-size:13px; margin-right:16px; } }
        .fb-btn:hover { background:#f5f5f5; }
        .fb-breadcrumb { display:flex; align-items:center; gap:0; overflow:hidden; flex:1; min-width:0; }
        .fb-crumb { font-size:11px; font-weight:500; color:#9a9a9a; text-decoration:none; white-space:nowrap; flex-shrink:1; overflow:hidden; text-overflow:ellipsis; }
        .fb-crumb-last { font-size:11px; font-weight:700; color:#1a1a1a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1; min-width:0; }
        .fb-sep { color:#d1d5db; margin:0 3px; flex-shrink:0; font-size:10px; }
        @media(min-width:900px) { .fb-crumb, .fb-crumb-last { font-size:13px; } .fb-sep { margin:0 4px; } }
        .fb-desktop-only { display:none; }
        .fb-mobile-only { display:inline; }
        @media(min-width:640px) { .fb-desktop-only { display:inline; } .fb-mobile-only { display:none; } }
        .fb-search { flex:1; min-width:0; position:relative; }
        .fb-search input { width:100%; height:38px; padding:0 14px 0 36px; border-radius:2px; border:1px solid #e4e4e7; font-size:13px; outline:none; box-sizing:border-box; background:#fff; }
        .fb-search input:focus { border-color:#0D1B2A; }
        .fb-search-icon { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:#9a9a9a; pointer-events:none; }
        .fb-cat { flex-shrink:0; font-size:11px; font-weight:700; color:var(--color-primary); background:#E9ECF5; padding:4px 10px; border-radius:2px; white-space:nowrap; text-decoration:none; display:flex; align-items:center; gap:4px; }
        /* Filter drawer */
        .fb-overlay { position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:500; opacity:0; pointer-events:none; transition:opacity .2s; }
        .fb-overlay.open { opacity:1; pointer-events:all; }
        .fb-drawer { position:fixed; bottom:0; left:0; right:0; background:#fff; border-radius:20px 20px 0 0; z-index:501; transform:translateY(100%); transition:transform .25s cubic-bezier(.4,0,.2,1); max-height:90vh; display:flex; flex-direction:column; }
        .fb-drawer.open { transform:translateY(0); }
        @media(min-width:768px) { .fb-drawer { left:auto; right:0; top:0; bottom:0; width:400px; border-radius:0; transform:translateX(100%); max-height:100vh; } .fb-drawer.open { transform:translateX(0); } }
        .fb-dr-hdr { padding:18px 20px 14px; border-bottom:1px solid #ebebeb; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
        .fb-dr-body { flex:1; overflow-y:auto; overflow-x:hidden; }
        .fb-dr-ftr { padding:14px 20px; border-top:1px solid #ebebeb; display:flex; gap:10px; flex-shrink:0; }
        .fb-apply { flex:2; height:48px; background:#1a1a1a; color:#fff; border:none; border-radius:2px; font-size:15px; font-weight:700; cursor:pointer; }
        .fb-clear { flex:1; height:48px; background:#fff; color:#1a1a1a; border:1px solid #e4e4e7; border-radius:2px; font-size:15px; font-weight:600; cursor:pointer; }
        .fb-section { padding:16px 20px; border-bottom:1px solid #f0f0f0; }
        .fb-section-label { font-size:11px; font-weight:700; color:#9a9a9a; text-transform:uppercase; letter-spacing:.8px; margin-bottom:10px; }
        .fb-pill { padding:7px 16px; border-radius:2px; border:1px solid #e4e4e7; background:#fff; font-size:13px; font-weight:500; color:#1a1a1a; cursor:pointer; transition:all .12s; }
        .fb-pill.active { background:#1a1a1a; color:#fff; border-color:#1a1a1a; font-weight:700; }
        .fb-select { width:100%; padding:8px 10px; border-radius:2px; border:1px solid #e4e4e7; font-size:13px; color:#1a1a1a; background:#fff; cursor:pointer; }

        /* Bottom bar */
        .bottom-bar { position:fixed; bottom:60px; left:0; right:0; background:#fff; border-top:1px solid #ebebeb; padding:10px 16px; display:flex; gap:10px; z-index:40; max-width:900px; margin:0 auto; }
        @media(min-width:768px) { .bottom-bar { bottom:0; max-width:100%; } }
        @media(min-width:900px) { .bottom-bar { display:none; } }
        .btn-offer { flex:1; height:50px; border:2px solid #1a1a1a; border-radius:2px; background:#fff; font-size:15px; font-weight:700; cursor:pointer; color:#1a1a1a; }
        .btn-contact { flex:1; height:50px; border:none; border-radius:2px; background:#1a1a1a; font-size:15px; font-weight:700; cursor:pointer; color:#fff; display:flex; align-items:center; justify-content:center; gap:8px; }
        .btn-offer:hover { background:#f5f5f5; }
        .btn-contact:hover { background:#333; }
        @media(min-width:900px) { .btn-offer, .btn-contact { height:48px; font-size:14px; } }

        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        .similar-grid { grid-template-columns: repeat(2,1fr); }
        @media(min-width:768px)  { .similar-grid { grid-template-columns: repeat(2,1fr); } }
        @media(min-width:900px)  { .similar-grid { grid-template-columns: repeat(3,1fr); } }
        @media(min-width:1100px) { .similar-grid { grid-template-columns: repeat(4,1fr); } }
        @media(min-width:1350px) { .similar-grid { grid-template-columns: repeat(5,1fr); } }
      `}</style>

      {/* Sold banner */}
      {isSold && (
        <div style={{ background: '#374151', color: '#fff', padding: '12px 20px', textAlign: 'center', fontSize: 14, fontWeight: 700 }}>
          This listing has been sold
        </div>
      )}

      {/* Top bar */}
      <div className="topbar">
        <div className="detail-wrapper" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', paddingTop:12, paddingBottom:12 }}>
          <Link href="/browse" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:6, color:'#1a1a1a' }}>
            <ArrowLeft size={18} />
            <span style={{ fontSize:14, fontWeight:600 }}>Back</span>
          </Link>
          <span className="topbar-title">Listing</span>
          <div className="topbar-actions">
            <button className="icon-btn" onClick={() => setSaved(!saved)}>
              <Heart size={16} style={{ fill: saved ? '#ef4444' : 'none', color: saved ? '#ef4444' : '#1a1a1a', strokeWidth: 1.5 }} />
            </button>
            <button className="icon-btn"><Share2 size={16} /></button>
          </div>
        </div>
      </div>

      {/* Filter bar + drawer */}
      {(() => {
        const cat = listing.category as any
        const listingParentSlug = cat?.parentSlug || cat?.slug || null
        const listingChildSlug  = cat?.parentSlug ? cat.slug : null

        // Effective category selection — null=use listing default, 'NONE'=explicitly cleared, string=user picked
        const activeParent = drawerCatParent === null ? listingParentSlug : drawerCatParent === 'NONE' ? null : drawerCatParent
        const activeChild  = drawerCatChild  === null ? listingChildSlug  : drawerCatChild  === 'NONE' ? null : drawerCatChild

        // Sibling categories for the active parent
        const parentObj  = categories.parents.find((p: any) => p.slug === activeParent)
        const siblings   = activeParent ? categories.children.filter((c: any) => c.parentId === parentObj?.id) : []

        // Attribute filters for the active child (or parent if no child)
        const attrSlug   = activeChild || activeParent || ''
        const attrFilters = CATEGORY_FILTERS[attrSlug] || CATEGORY_FILTERS[activeParent || ''] || []

        // Build browse URL from all active filters
        const targetCat = activeChild || activeParent
        const browseHref = `/browse${targetCat ? `?category=${encodeURIComponent(targetCat)}` : '?category=all'}${filterCondition ? `&condition=${encodeURIComponent(filterCondition)}` : ''}${filterProvince ? `&province=${encodeURIComponent(filterProvince)}` : ''}${Object.entries(filterAttrs).filter(([,v]) => v).map(([k,v]) => `&attrs=${encodeURIComponent(JSON.stringify({[k]:v}))}`).join('')}${searchInput.trim() ? `&search=${encodeURIComponent(searchInput)}` : ''}`

        // Active filter count for badge
        const activeCount = [
          !!(activeParent),
          !!(activeChild),
          !!filterCondition,
          !!filterProvince,
          ...Object.values(filterAttrs).filter(Boolean),
        ].filter(Boolean).length

        // Whether any filter differs from the listing's own context
        const isContextualDefault = drawerCatParent === null && drawerCatChild === null && !filterCondition && !filterProvince && !Object.values(filterAttrs).some(Boolean)

        return (
          <>
            {/* Filter + breadcrumb bar */}
            <div className="filter-bar">
              <div className="filter-bar-inner">
                <button
                  className="fb-btn"
                  onClick={() => setShowFilterDrawer(true)}
                  style={activeCount > 0 ? { background:'#E9ECF5', borderColor:'#0D1B2A', color:'#0D1B2A' } : {}}
                >
                  <SlidersHorizontal size={15} />
                  Filters{activeCount > 0 ? ` (${activeCount})` : ''}
                </button>
                <div style={{ width:1, height:18, background:'#e4e4e7', flexShrink:0, margin:'0 12px 0 0' }} />
                <nav className="fb-breadcrumb">
                  {/* Desktop: All › Parent › Child › Title */}
                  {/* Mobile: Child › Title (or Parent › Title if no child) */}
                  <Link href="/browse" className="fb-crumb fb-desktop-only">All</Link>
                  {listingParentSlug && <>
                    <span className="fb-sep fb-desktop-only">›</span>
                    <Link href={`/browse?category=${encodeURIComponent(listingParentSlug)}`} className="fb-crumb fb-desktop-only">{cat?.parentName || cat?.name}</Link>
                  </>}
                  {/* On mobile: show immediate parent as first crumb */}
                  {(listingChildSlug || listingParentSlug) && <>
                    <span className="fb-sep fb-mobile-only">›</span>
                    <Link href={`/browse?category=${encodeURIComponent(listingChildSlug || listingParentSlug || '')}`} className="fb-crumb fb-mobile-only">{cat?.name || cat?.parentName}</Link>
                  </>}
                  {listingChildSlug && <>
                    <span className="fb-sep fb-desktop-only">›</span>
                    <Link href={`/browse?category=${encodeURIComponent(listingChildSlug)}`} className="fb-crumb fb-desktop-only">{cat?.name}</Link>
                  </>}
                  <span className="fb-sep">›</span>
                  <span className="fb-crumb-last">{listing.bikeModel ?? listing.bikeMake ?? listing.title}</span>
                </nav>
              </div>
            </div>

            {/* Filter drawer */}
            <div className={`fb-overlay${showFilterDrawer ? ' open' : ''}`} onClick={() => setShowFilterDrawer(false)} />
            <div className={`fb-drawer${showFilterDrawer ? ' open' : ''}`}>

              {/* Header */}
              <div className="fb-dr-hdr">
                <span style={{ fontSize:17, fontWeight:800, color:'#1a1a1a' }}>Filters</span>
                <button onClick={() => setShowFilterDrawer(false)} style={{ background:'none', border:'none', cursor:'pointer', padding:4 }}>
                  <X size={22} />
                </button>
              </div>

              <div className="fb-dr-body">

                {/* ── Zone 1: Category navigation ── */}
                <div className="fb-section">
                  <div className="fb-section-label">Category</div>

                  {/* Parent level */}
                  <div style={{ marginBottom:10 }}>
                    <div style={{ fontSize:11, color:'#9a9a9a', fontWeight:600, marginBottom:6 }}>
                      <Link href="/browse" style={{ color:'#9a9a9a', textDecoration:'none', fontSize:11 }}>All listings</Link>
                      {' '}›{' '}
                      <span style={{ color:'#1a1a1a', fontWeight:700 }}>{categories.parents.find((p:any)=>p.slug===activeParent)?.name || 'Select category'}</span>
                    </div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {categories.parents.slice(0,12).map((p:any) => (
                        <button
                          key={p.id}
                          onClick={() => { setDrawerCatParent(p.slug); setDrawerCatChild('NONE'); setFilterAttrs({}) }}
                          style={{ padding:'5px 12px', borderRadius:2, border: activeParent === p.slug ? '1px solid #0D1B2A' : '1px solid #e4e4e7', background: activeParent === p.slug ? '#0D1B2A' : '#fff', color: activeParent === p.slug ? '#fff' : '#1a1a1a', fontSize:12, fontWeight: activeParent === p.slug ? 700 : 500, cursor:'pointer', transition:'all .12s' }}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Child level — shown when parent has subcategories */}
                  {siblings.length > 0 && (
                    <div style={{ borderTop:'1px solid #f0f0f0', paddingTop:10 }}>
                      <div style={{ fontSize:11, color:'#9a9a9a', fontWeight:600, marginBottom:6 }}>
                        {categories.parents.find((p:any)=>p.slug===activeParent)?.name} ›{' '}
                        <span style={{ color: activeChild ? '#1a1a1a' : '#9a9a9a', fontWeight: activeChild ? 700 : 500 }}>
                          {activeChild ? categories.children.find((c:any)=>c.slug===activeChild)?.name : 'All subcategories'}
                        </span>
                      </div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                        <button
                          onClick={() => { setDrawerCatChild('NONE'); setFilterAttrs({}) }}
                          style={{ padding:'5px 12px', borderRadius:2, border: !activeChild ? '1px solid #0D1B2A' : '1px solid #e4e4e7', background: !activeChild ? '#0D1B2A' : '#fff', color: !activeChild ? '#fff' : '#1a1a1a', fontSize:12, fontWeight: !activeChild ? 700 : 500, cursor:'pointer', transition:'all .12s' }}
                        >
                          All
                        </button>
                        {siblings.map((c:any) => (
                          <button
                            key={c.id}
                            onClick={() => { setDrawerCatChild(c.slug); setFilterAttrs({}) }}
                            style={{ padding:'5px 12px', borderRadius:2, border: activeChild === c.slug ? '1px solid #0D1B2A' : '1px solid #e4e4e7', background: activeChild === c.slug ? '#0D1B2A' : '#fff', color: activeChild === c.slug ? '#fff' : '#1a1a1a', fontSize:12, fontWeight: activeChild === c.slug ? 700 : 500, cursor:'pointer', transition:'all .12s' }}
                          >
                            {c.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Zone 3: Attribute filters (dynamic per category) ── */}
                {attrFilters.length > 0 && attrFilters.map(af => (
                  <div key={af.key} className="fb-section">
                    <div className="fb-section-label">{af.label}</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      <button
                        onClick={() => setFilterAttrs(a => ({...a,[af.key]:''}))}
                        style={{ padding:'5px 12px', borderRadius:2, border: !filterAttrs[af.key] ? '1px solid #0D1B2A' : '1px solid #e4e4e7', background: !filterAttrs[af.key] ? '#0D1B2A' : '#fff', color: !filterAttrs[af.key] ? '#fff' : '#1a1a1a', fontSize:12, fontWeight: !filterAttrs[af.key] ? 700 : 500, cursor:'pointer', transition:'all .12s' }}
                      >
                        All
                      </button>
                      {af.options.map(opt => (
                        <button
                          key={opt}
                          onClick={() => setFilterAttrs(a => ({...a,[af.key]: filterAttrs[af.key] === opt ? '' : opt}))}
                          style={{ padding:'5px 12px', borderRadius:2, border: filterAttrs[af.key] === opt ? '1px solid #0D1B2A' : '1px solid #e4e4e7', background: filterAttrs[af.key] === opt ? '#0D1B2A' : '#fff', color: filterAttrs[af.key] === opt ? '#fff' : '#1a1a1a', fontSize:12, fontWeight: filterAttrs[af.key] === opt ? 700 : 500, cursor:'pointer', transition:'all .12s' }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* ── Zone 4: Universal filters ── */}
                <div className="fb-section">
                  <div className="fb-section-label">Condition</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {[{v:'',l:'All'},{v:'new',l:'New'},{v:'like_new',l:'Like New'},{v:'used',l:'Used'},{v:'poor',l:'Poor'}].map(c => (
                      <button key={c.v} onClick={() => setFilterCondition(c.v)}
                        style={{ padding:'5px 12px', borderRadius:2, border: filterCondition === c.v ? '1px solid #0D1B2A' : '1px solid #e4e4e7', background: filterCondition === c.v ? '#0D1B2A' : '#fff', color: filterCondition === c.v ? '#fff' : '#1a1a1a', fontSize:12, fontWeight: filterCondition === c.v ? 700 : 500, cursor:'pointer', transition:'all .12s' }}
                      >{c.l}</button>
                    ))}
                  </div>
                </div>

                <div className="fb-section">
                  <div className="fb-section-label">Province</div>
                  <select value={filterProvince} onChange={e => setFilterProvince(e.target.value)} className="fb-select">
                    <option value="">All Provinces</option>
                    {['Western Cape','Gauteng','KwaZulu-Natal','Eastern Cape','Limpopo','Mpumalanga','North West','Free State','Northern Cape'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Footer */}
              <div style={{ padding:'10px 20px', borderTop:'1px solid #ebebeb', flexShrink:0 }}>
                {/* Reset row */}
                <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:10 }}>
                  <button
                    onClick={resetFilters}
                    style={{ fontSize:12, fontWeight:600, color:'#6b7280', background:'none', border:'1px solid #e4e4e7', borderRadius:2, padding:'5px 14px', cursor:'pointer' }}
                  >
                    Clear all filters
                  </button>
                  {!isContextualDefault && (
                    <button
                      onClick={restoreContextual}
                      style={{ fontSize:12, fontWeight:600, color:'var(--color-primary)', background:'none', border:'1px solid var(--color-primary)', borderRadius:2, padding:'5px 14px', cursor:'pointer' }}
                    >
                      ↩ Restore "{listingParentSlug ? (categories.parents.find((p:any)=>p.slug===listingParentSlug)?.name || listingParentSlug) : 'context'}"
                    </button>
                  )}
                </div>
                <div className="fb-dr-ftr" style={{ padding:0, border:'none' }}>
                  <button onClick={() => setShowFilterDrawer(false)} className="fb-clear" style={{ fontSize:14 }}>Cancel</button>
                  <button onClick={() => { setShowFilterDrawer(false); router.push(browseHref) }} className="fb-apply">Browse Results</button>
                </div>
              </div>
            </div>
          </>
        )
      })()}

      <div className="detail-wrapper">
        <div className="detail-grid">

          {/* Gallery */}
          <div className="gallery">
            <div className="gallery-main">
              {imgs[imgIdx]?.imageUrl
                ? <Image src={imgs[imgIdx].imageUrl} alt={listing.title} fill unoptimized style={{ objectFit:'cover' }} sizes="(min-width:900px) 55vw, 100vw" priority />
                : <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ color:'#555', fontSize:13 }}>No photo</span>
                  </div>
              }
              <div className="img-counter">{imgIdx + 1} / {imgs.length}</div>
            </div>
            {imgs.length > 1 && (
              <div className="thumb-strip">
                {imgs.map((img, i) => (
                  <div key={img.id} className={`thumb${imgIdx === i ? ' active' : ''}`} onClick={() => setImgIdx(i)}>
                    {img.imageUrl && <Image src={img.imageUrl} alt="" width={64} height={48} unoptimized style={{ objectFit:'cover', width:'100%', height:'100%' }} />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details column (right on desktop) */}
          <div className="details-section">

            {/* Price block — sticky on desktop */}
            <div className="price-block">
              <div className="content-card" style={{ marginBottom: 0 }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize:28, fontWeight:800, color:'#1a1a1a', lineHeight:1 }}>
                    {formatPrice(country, listing.price)}
                  </span>
                  {listing.negotiable && (
                    <span style={{ fontSize:11, fontWeight:700, color:'var(--color-primary)', background:'#E9ECF5', padding:'4px 10px', borderRadius:8 }}>
                      Negotiable
                    </span>
                  )}
                </div>
                <p style={{ fontSize:16, fontWeight:700, color:'#1a1a1a', margin:'0 0 8px', lineHeight:1.3 }}>{listing.title}</p>
                <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', fontSize:13 }}>
                  {(listing.city || listing.province) && (
                    <span style={{ display:'flex', alignItems:'center', gap:4, color:'#9a9a9a' }}>
                      <MapPin size={12} /> {listing.city}{listing.province ? `, ${listing.province}` : ''}
                    </span>
                  )}
                  {listing.viewsCount != null && (
                    <span style={{ display:'flex', alignItems:'center', gap:4, color:'#9a9a9a' }}>
                      <Eye size={12} /> {listing.viewsCount}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Boost banner — visible to listing owner only */}
            {session?.user?.id === listing.user?.id && (
              <div style={{
                background: 'linear-gradient(135deg, #1a1a2e, #273970)',
                borderRadius: 10,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                margin: '0 16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Zap size={18} style={{ color: '#818cf8', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Boost this listing</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>From R20 — get seen by more buyers</div>
                  </div>
                </div>
                <Link href={`/boost/select?listingId=${listing.id}&returnTo=/browse/${slug}`}
                  style={{ background: '#818cf8', color: '#fff', padding: '8px 16px', borderRadius: 7, fontWeight: 700, fontSize: 12, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  Boost →
                </Link>
              </div>
            )}

            {/* General information — attribute chips */}
            <div className="content-card">
              <div className="sec-title">Condition & specs</div>
              <div className="chips">
                {cond && (
                  <span className="chip">
                    <span style={{ width:6, height:6, borderRadius:'50%', background:cond.color, display:'inline-block' }} />
                    <span className="chip-label">{cond.label}</span>
                  </span>
                )}
                {listing.bikeYear && (
                  <span className="chip"><span className="chip-label">Year</span><span className="chip-val">{listing.bikeYear}</span></span>
                )}
                {listing.colour && (
                  <span className="chip"><span className="chip-label">Colour</span><span className="chip-val">{listing.colour}</span></span>
                )}
                {listing.frameMaterial && (
                  <span className="chip"><span className="chip-label">Material</span><span className="chip-val">{listing.frameMaterial}</span></span>
                )}
                {listing.wheelSizeInches && (
                  <span className="chip"><span className="chip-label">Wheels</span><span className="chip-val">{listing.wheelSizeInches}&quot;</span></span>
                )}
                {listing.suspensionTravelMm && (
                  <span className="chip"><span className="chip-label">Travel</span><span className="chip-val">{listing.suspensionTravelMm}mm</span></span>
                )}
                {listing.shippingAvailable && (
                  <span className="chip"><span className="chip-label">Shipping</span></span>
                )}
                {listing.tradeConsidered && (
                  <span className="chip"><span className="chip-label">Trade OK</span></span>
                )}
                {listing.originalReceipt && (
                  <span className="chip"><CheckCircle size={11} style={{ color:'#10B981' }} /><span className="chip-val">Receipt</span></span>
                )}
              </div>
            </div>

            {/* CTA + Seller card — rendered here on MOBILE only (desktop moved below gallery) */}
            <div className="seller-mobile-only">

            {/* CTA buttons first */}
            <div style={{ display:'flex', gap:8, paddingTop:8, flexDirection:'column' }}>
              <div style={{ display:'flex', gap:12 }}>
                <button className="btn-offer" style={{ flex:1 }} onClick={handleMakeOffer}>Make offer</button>
                <div style={{ flex:1 }}>
                  <ContactSeller 
                    listingId={listing.id} 
                    sellerId={listing.user?.id ?? ''} 
                    listingSlug={slug}
                    sellerName={listing.user?.name ?? 'Seller'}
                  />
                </div>
              </div>

              {/* Share buttons */}
              <div style={{ display:'flex', gap:8 }}>
                {/* WhatsApp */}
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out this listing on CrankMart: ${listing.title} - R${listing.price}\nhttps://crankmart.com/browse/${slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '10px 16px',
                    background: '#25D366',
                    color: '#fff',
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: 13,
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.background = '#1da752'
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.background = '#25D366'
                  }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ flexShrink: 0 }}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Share
                </a>

                {/* Copy link */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://crankmart.com/browse/${slug}`)
                    alert('Link copied!')
                  }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '10px 16px',
                    background: '#f0f0f0',
                    color: '#1a1a1a',
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: 13,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = '#e8e8e8'
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = '#f0f0f0'
                  }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  Copy link
                </button>
              </div>
            </div>
            {/* Seller card below CTA on mobile */}
            {listing.user && (
              <div className="content-card" style={{ paddingBottom: 12 }}>
                <div className="seller-card">
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                    <div className="seller-avatar" style={{ overflow:'hidden', padding:0, fontSize: listing.user.avatarUrl ? 0 : undefined }}>
                      {listing.user.avatarUrl
                        ? <img src={listing.user.avatarUrl} alt={listing.user.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', borderRadius:'50%' }} />
                        : listing.user.name?.[0]?.toUpperCase() ?? '?'
                      }
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <Link href={`/seller/${listing.user.id}`} style={{ fontWeight:700, fontSize:14, color:'var(--color-primary)', margin:0, textDecoration:'none', display:'block' }}>{listing.user.name}</Link>
                      {(listing.user.city || listing.user.province) && (
                        <p style={{ fontSize:12, color:'#9a9a9a', margin:'2px 0 0', display:'flex', alignItems:'center', gap:3 }}>
                          <MapPin size={10} />{listing.user.city ?? listing.user.province}
                        </p>
                      )}
                    </div>
                  </div>
                  {memberSince && (
                    <div style={{ fontSize:12, color:'#9a9a9a' }}>
                      <span style={{ fontWeight:700 }}>Member since</span> {memberSince}
                    </div>
                  )}
                </div>
              </div>
            )}
            </div>{/* end seller-mobile-only */}

            {/* ── Spec table in sidebar — visible immediately ── */}
            {(() => {
              const attrs = listing.attributes || {}
              const SPEC_LABELS: Record<string, string> = {
                bikeMake: 'Brand', bikeModel: 'Model', bikeYear: 'Year',
                frameSize: 'Frame Size', wheelSize: 'Wheel Size', kidsWheelSize: 'Wheel Size',
                frameMaterial: 'Frame Material', suspensionTravel: 'Suspension Travel',
                groupset: 'Groupset', drivetrainSpeeds: 'Drivetrain', drivetrainBrand: 'Brand',
                brakeType: 'Brakes', brakes: 'Brakes',
                forkBrand: 'Fork', rearShockBrand: 'Rear Shock',
                shifters: 'Shifters', crank: 'Crank', chain: 'Chain', cassette: 'Cassette',
                wheels: 'Wheels', tyres: 'Tyres', handlebar: 'Handlebar', stem: 'Stem',
                seatpost: 'Seatpost', saddle: 'Saddle', pedalType: 'Pedal Type',
                extras: 'Extras Included',
                motorBrand: 'Motor', batteryCapacity: 'Battery', ebikeRange: 'Range',
                suspBrand: 'Susp. Brand', axleStandard: 'Axle Standard', brakeStandard: 'Brake Standard',
                gpsBrand: 'Brand', apparelSize: 'Size', gender: 'Gender', kidsAge: 'Age Range',
                helmetSize: 'Size', shoeSize: 'Size (EU)', colour: 'Colour',
                recentUpgrades: 'Recent Upgrades', damageNotes: 'Damage Notes',
              }
              const all: Record<string, string> = {
                ...(listing.bikeMake    ? { bikeMake:    listing.bikeMake }    : {}),
                ...(listing.bikeModel   ? { bikeModel:   listing.bikeModel }   : {}),
                ...(listing.bikeYear    ? { bikeYear:    String(listing.bikeYear) } : {}),
                ...(listing.frameSize   ? { frameSize:   listing.frameSize }   : {}),
                ...(listing.frameMaterial ? { frameMaterial: listing.frameMaterial } : {}),
                ...Object.fromEntries(
                  Object.entries(attrs).filter(([, v]) => v && v !== 'false' && v !== '').map(([k, v]) => [k, String(v)])
                ),
              }
              const specRows = Object.entries(SPEC_LABELS)
                .map(([key, label]) => ({ label, value: all[key] }))
                .filter(r => r.value && r.value.trim())
              if (specRows.length === 0) return null
              return (
                <div className="content-card">
                  <button onClick={() => setSpecsOpen(p => !p)}
                    style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', background:'none', border:'none', cursor:'pointer', padding:'0 0 10px', fontSize:13, fontWeight:800, color:'#1a1a1a', borderBottom: specsOpen ? '1px solid #f0f0f0' : 'none' }}>
                    <span>Specs</span>
                    <span style={{ fontSize:12, color:'var(--color-primary)' }}>{specsOpen ? '▲ Hide' : '▼ Show all'}</span>
                  </button>
                  {specsOpen && (
                    <div style={{ marginTop: 10 }}>
                      {specRows.map((row, i) => (
                        <div key={row.label + i} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom: i < specRows.length-1 ? '1px solid #f5f5f5' : 'none', gap: 8 }}>
                          <span style={{ fontSize:12, fontWeight:700, color:'#6b7280', flexShrink:0 }}>{row.label}</span>
                          <span style={{ fontSize:12, color: row.label === 'Damage Notes' ? '#F59E0B' : '#1a1a1a', textAlign:'right' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })()}

          </div>

        {/* CTA + Seller card — desktop only, below gallery (col 1 row 2) */}
        <div className="seller-section">
          {/* CTA first */}
          <div style={{ display:'flex', flexDirection:'column', gap:8, padding:'0' }}>
            <div style={{ display:'flex', gap:12 }}>
              <button className="btn-offer" style={{ flex:1 }} onClick={handleMakeOffer}>Make offer</button>
              <div style={{ flex:1 }}>
                <ContactSeller
                  listingId={listing.id}
                  sellerId={listing.user?.id ?? ''}
                  listingSlug={slug}
                  sellerName={listing.user?.name ?? 'Seller'}
                />
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <a href={`https://wa.me/?text=${encodeURIComponent(`Check out this listing on CrankMart: ${listing.title} - R${listing.price}\nhttps://crankmart.com/browse/${slug}`)}`}
                target="_blank" rel="noopener noreferrer"
                style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'10px 16px', background:'#25D366', color:'#fff', borderRadius:8, fontWeight:700, fontSize:13, textDecoration:'none' }}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                Share
              </a>
              <button onClick={() => { navigator.clipboard.writeText(`https://crankmart.com/browse/${slug}`); alert('Link copied!') }}
                style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'10px 16px', border:'1.5px solid #e4e4e7', background:'#fff', borderRadius:8, fontWeight:600, fontSize:13, cursor:'pointer', color:'#1a1a1a' }}>
                <Share2 size={14} /> Copy link
              </button>
            </div>
          </div>
          {/* Seller card below CTA on desktop */}
          {listing.user && (
            <div className="content-card" style={{ paddingBottom: 12 }}>
              <div className="seller-card">
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                  <div className="seller-avatar" style={{ overflow:'hidden', padding:0, fontSize: listing.user.avatarUrl ? 0 : undefined }}>
                    {listing.user.avatarUrl
                      ? <img src={listing.user.avatarUrl} alt={listing.user.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', borderRadius:'50%' }} />
                      : listing.user.name?.[0]?.toUpperCase() ?? '?'
                    }
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <Link href={`/seller/${listing.user.id}`} style={{ fontWeight:700, fontSize:14, color:'var(--color-primary)', margin:0, textDecoration:'none', display:'block' }}>{listing.user.name}</Link>
                    {(listing.user.city || listing.user.province) && (
                      <p style={{ fontSize:12, color:'#9a9a9a', margin:'2px 0 0', display:'flex', alignItems:'center', gap:3 }}>
                        <MapPin size={10} />{listing.user.city ?? listing.user.province}
                      </p>
                    )}
                  </div>
                </div>
                {memberSince && (
                  <div style={{ fontSize:12, color:'#9a9a9a' }}>
                    <span style={{ fontWeight:700 }}>Member since</span> {memberSince}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        </div>

        {/* Full-width sections below — description, specs, protection */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:12, padding:'16px' }}>

          {/* Seller description */}
          <div className="content-card">
            <div className="sec-title">Description</div>
            <div style={{ position:'relative' }}>
              <p style={{
                fontSize:14, lineHeight:1.6, color:'#1a1a1a', margin:0,
                display: descExpanded ? 'block' : '-webkit-box',
                WebkitLineClamp: descExpanded ? undefined : 4,
                WebkitBoxOrient: 'vertical',
                overflow: descExpanded ? 'visible' : 'hidden',
              }}>
                {listing.description}
              </p>
              {!descExpanded && listing.description?.length > 250 && (
                <button onClick={() => setDescExpanded(true)}
                  style={{ background:'none', border:'none', color:'var(--color-primary)', fontWeight:700, fontSize:13, cursor:'pointer', padding:'8px 0 0', display:'block' }}>
                  Read more
                </button>
              )}
            </div>
          </div>

          {/* Spec table moved to sidebar above — removed from here */}

          {/* Buyer protection */}
          <div className="content-card">
            <div style={{ display:'flex', alignItems:'flex-start', gap:12, background:'#f5f5f5', borderRadius:8, padding:'12px 14px' }}>
              <Shield size={18} style={{ color:'var(--color-primary)', flexShrink:0, marginTop:2 }} />
              <div>
                <p style={{ fontWeight:700, fontSize:13, color:'#1a1a1a', margin:'0 0 2px' }}>Buyer protection</p>
                <p style={{ fontSize:12, color:'#6b6b6b', margin:0, lineHeight:1.5 }}>
                  Escrow available for transactions over R2,000. Your payment is held securely until you confirm receipt.
                </p>
              </div>
            </div>
          </div>

          {/* Report listing */}
          <div style={{ textAlign:'center', padding:'8px 16px' }}>
            <button style={{ background:'none', border:'none', fontSize:12, color:'#9a9a9a', cursor:'pointer', textDecoration:'underline' }}>
              Report this listing
            </button>
          </div>

        </div>
      </div>



      {/* ── Similar listings ── */}
      <div style={{ background:'#f5f5f5', padding:'24px 0 120px' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 16px', boxSizing:'border-box' }}
          className="detail-wrapper" >
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <h2 style={{ fontSize:16, fontWeight:800, color:'#1a1a1a', margin:0 }}>
              {similar.length > 0 ? 'Similar listings' : 'More listings'}
            </h2>
            <a href="/browse" style={{ fontSize:13, color:'var(--color-primary)', fontWeight:600, textDecoration:'none' }}>Browse all →</a>
          </div>
          {similar.length === 0 ? (
            <div style={{ textAlign:'center', padding:'32px 0', color:'#9a9a9a', fontSize:13 }}>
              No similar listings found. <a href="/browse" style={{ color:'var(--color-primary)', fontWeight:600, textDecoration:'none' }}>Browse all →</a>
            </div>
          ) : (
            <div style={{ display:'grid', gap:12 }}
              className="similar-grid">
              {similar.map(item => {
                const fmt2 = (p: string) => formatPrice(country, p)
                return (
                  <a key={item.id} href={`/browse/${item.slug}`}
                    style={{ background:'#fff', borderRadius:2, border:'1px solid #ebebeb', overflow:'hidden', textDecoration:'none', color:'inherit', display:'flex', flexDirection:'column', boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
                    <div style={{ position:'relative', width:'100%', aspectRatio:'4/3', background:'#f0f0f0', overflow:'hidden', flexShrink:0 }}>
                      {item.image?.image_url
                        ? <img src={item.image.image_url} alt={item.title} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
                        : <div style={{ position:'absolute', inset:0, background:'#e5e7eb' }} />
                      }
                    </div>
                    <div style={{ padding:'8px 10px 10px' }}>
                      {item.bikeMake && <div style={{ fontSize:10, color:'#9a9a9a', fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:2 }}>{item.bikeMake}</div>}
                      <div style={{ fontSize:12, fontWeight:700, color:'#1a1a1a', marginBottom:4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', lineHeight:1.3 }}>{item.bikeModel ?? item.title}</div>
                      <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                        <span style={{ fontSize:14, fontWeight:800, color:'#1a1a1a' }}>{fmt2(item.price)}</span>
                        {item.negotiable && <span style={{ fontSize:9, fontWeight:700, color:'var(--color-primary)', background:'#E9ECF5', padding:'1px 5px', borderRadius:4 }}>NEG</span>}
                      </div>
                      {(item.city || item.province) && <div style={{ fontSize:10, color:'#9a9a9a', marginTop:3, display:'flex', alignItems:'center', gap:3 }}><MapPin size={9} />{item.city ?? item.province}</div>}
                    </div>
                  </a>
                )
              })}
            </div>
          )}
        </div>

        {/* Community discussion */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <CommentThread targetType="listing" targetId={listing.id} title="Questions & discussion" />
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="bottom-bar">
        <button className="btn-offer" onClick={handleMakeOffer}>Make an offer</button>
        <div style={{ flex:1 }}>
          <ContactSeller 
            listingId={listing.id} 
            sellerId={listing.user?.id ?? ''} 
            listingSlug={slug}
            sellerName={listing.user?.name ?? 'Seller'}
          />
        </div>
      </div>

      {/* Make Offer Modal */}
      {offerOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:1000, display:'flex', alignItems:'flex-end', justifyContent:'center' }}
          onClick={e => { if (e.target === e.currentTarget) setOfferOpen(false) }}>
          <div style={{ background:'#fff', borderRadius:'16px 16px 0 0', padding:'28px 24px 40px', width:'100%', maxWidth:500, boxShadow:'0 -8px 40px rgba(0,0,0,.18)' }}>
            {offerSent ? (
              <div style={{ textAlign:'center', padding:'20px 0' }}>
                <div style={{ width:60, height:60, borderRadius:'50%', background:'#ECFDF5', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                  <CheckCircle size={32} color="#10B981" />
                </div>
                <p style={{ fontSize:18, fontWeight:800, color:'#1a1a1a', margin:'0 0 8px' }}>Offer Sent!</p>
                <p style={{ fontSize:14, color:'#6b7280', margin:'0 0 24px' }}>
                  Your offer of <strong>{formatPrice(country, offerAmount.replace(/[^0-9.]/g,''))}</strong> has been sent to the seller. Check your messages for their reply.
                </p>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={() => setOfferOpen(false)}
                    style={{ flex:1, height:44, border:'1.5px solid #e4e4e7', borderRadius:8, background:'#fff', fontSize:14, fontWeight:600, cursor:'pointer' }}>
                    Close
                  </button>
                  <button onClick={() => router.push('/messages')}
                    style={{ flex:1, height:44, border:'none', borderRadius:8, background:'var(--color-primary)', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                    View Messages
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <Tag size={18} color="#0D1B2A" />
                    <span style={{ fontSize:17, fontWeight:800, color:'#1a1a1a' }}>Make an Offer</span>
                  </div>
                  <button onClick={() => setOfferOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#9a9a9a', padding:4 }}>
                    <X size={20} />
                  </button>
                </div>

                <p style={{ fontSize:13, color:'#6b7280', margin:'0 0 20px' }}>
                  Listed at <strong style={{ color:'#1a1a1a' }}>{formatPrice(country, listing.price)}</strong> — enter your offer below. The seller will reply via messages.
                </p>

                <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#1a1a1a', marginBottom:6 }}>Your Offer Amount</label>
                <div style={{ position:'relative', marginBottom:16 }}>
                  <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:15, fontWeight:700, color:'#6b7280' }}>R</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 8500"
                    value={offerAmount}
                    onChange={e => setOfferAmount(e.target.value)}
                    autoFocus
                    style={{ width:'100%', height:48, paddingLeft:28, paddingRight:14, border:'1.5px solid #e4e4e7', borderRadius:8, fontSize:16, fontWeight:700, color:'#1a1a1a', outline:'none', boxSizing:'border-box' }}
                    onFocus={e => (e.target.style.borderColor = '#0D1B2A')}
                    onBlur={e => (e.target.style.borderColor = '#e4e4e7')}
                  />
                </div>

                <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#1a1a1a', marginBottom:6 }}>Add a note <span style={{ fontWeight:400, color:'#9a9a9a' }}>(optional)</span></label>
                <textarea
                  rows={3}
                  placeholder="e.g. Can collect this weekend, cash ready..."
                  value={offerNote}
                  onChange={e => setOfferNote(e.target.value)}
                  style={{ width:'100%', padding:'10px 14px', border:'1.5px solid #e4e4e7', borderRadius:8, fontSize:14, fontFamily:'inherit', resize:'none', outline:'none', boxSizing:'border-box', marginBottom:16 }}
                  onFocus={e => (e.target.style.borderColor = '#0D1B2A')}
                  onBlur={e => (e.target.style.borderColor = '#e4e4e7')}
                />

                {offerError && (
                  <div style={{ padding:'10px 14px', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, fontSize:13, color:'#DC2626', marginBottom:12 }}>
                    {offerError}
                  </div>
                )}

                <button onClick={submitOffer} disabled={offerSending}
                  style={{ width:'100%', height:50, background: offerSending ? '#9aa5c4' : '#0D1B2A', color:'#fff', border:'none', borderRadius:8, fontSize:15, fontWeight:700, cursor: offerSending ? 'default' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  <Tag size={16} />
                  {offerSending ? 'Sending offer…' : 'Send Offer to Seller'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
