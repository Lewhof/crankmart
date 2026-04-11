'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { MapPin, Heart, SlidersHorizontal, Zap, ChevronRight, X, Check } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { SearchBar } from '@/components/search/SearchBar'
import SaveButton from '@/components/listings/SaveButton'

interface ListingItem {
  id: string; slug: string; title: string; price: string
  city: string | null; province: string | null
  condition: 'new' | 'like_new' | 'used' | 'poor'
  status?: string
  boostEnabled: boolean | null; negotiable: boolean | null
  bikeMake: string | null; bikeModel: string | null; bikeYear: number | null
  attributes?: Record<string, string | boolean>
  image: { image_url: string; imageUrl?: string } | null
}

const COND_MAP = {
  new:      { label: 'New',      color: '#10B981' },
  like_new: { label: 'Like New', color: '#3B82F6' },
  used:     { label: 'Used',     color: '#F59E0B' },
  poor:     { label: 'Poor',     color: '#EF4444' },
}

// Visible category pills — 6 default, rest revealed via + More
const QUICK_CATS = [
  { label: 'All',        slug: 'all' },
  { label: 'MTB',        slug: 'mtb' },
  { label: 'Road',       slug: 'road-bike' },
  { label: 'Gravel',     slug: 'gravel-bike' },
  { label: 'E-Bikes',    slug: 'e-bikes' },
  { label: 'Gear',       slug: 'gear-apparel' },
]

// Mega-menu taxonomy — grouped by parent
const MEGA_MENU = [
  {
    group: 'Complete Bikes',
    slug: 'complete-bikes',
    items: [
      { label: 'MTB',              slug: 'mtb' },
      { label: 'Road Bike',        slug: 'road-bike' },
      { label: 'Gravel',           slug: 'gravel-bike' },
      { label: 'Enduro',           slug: 'enduro' },
      { label: 'Downhill',         slug: 'downhill' },
      { label: 'XC',               slug: 'xc' },
      { label: 'Trail MTB',        slug: 'trail-mtb' },
      { label: 'Hardtail MTB',     slug: 'hardtail-mtb' },
      { label: 'Full-Sus MTB',     slug: 'full-suspension-mtb' },
      { label: 'Dirt Jump',        slug: 'dirt-jump' },
      { label: 'BMX',              slug: 'bmx' },
      { label: 'Cyclocross',       slug: 'cyclocross' },
      { label: 'Triathlon / TT',   slug: 'triathlon-tt' },
      { label: 'Hybrid / City',    slug: 'hybrid-city' },
      { label: 'Fitness / Urban',  slug: 'fitness-urban' },
      { label: 'Cruiser',          slug: 'cruiser' },
      { label: 'Fixed Gear',       slug: 'fixedgear' },
      { label: 'Folding',          slug: 'folding' },
      { label: 'Fat Bikes',        slug: 'fat-bikes' },
      { label: 'Trials',           slug: 'trials' },
      { label: 'Tandem',           slug: 'tandem' },
      { label: 'Vintage',          slug: 'vintage' },
    ],
  },
  {
    group: 'E-Bikes',
    slug: 'e-bikes',
    items: [
      { label: 'E-MTB',              slug: 'e-mtb' },
      { label: 'E-Road / E-Gravel',  slug: 'e-road-gravel' },
      { label: 'E-Urban',            slug: 'e-urban' },
      { label: 'E-Bike Motors',      slug: 'e-bike-motors' },
      { label: 'E-Bike Batteries',   slug: 'e-bike-batteries' },
      { label: 'Conversion Kits',    slug: 'e-bike-kits' },
    ],
  },
  {
    group: 'Frames',
    slug: 'frames',
    items: [
      { label: 'Road Frames',        slug: 'road-frames' },
      { label: 'MTB Hardtail',       slug: 'mtb-frames-hardtail' },
      { label: 'MTB Full Sus',       slug: 'mtb-frames-fullsus' },
      { label: 'Gravel / CX',        slug: 'gravel-frames' },
      { label: 'Hybrid / Urban',     slug: 'hybrid-frames' },
      { label: 'BMX Frames',         slug: 'bmx-frames' },
      { label: 'E-Bike Frames',      slug: 'e-bike-frames' },
      { label: 'Frame Sets',         slug: 'framesets' },
      { label: 'Vintage Frames',     slug: 'vintage-frames' },
      { label: 'Restoration',        slug: 'restoration-frames' },
    ],
  },
  {
    group: 'Parts',
    slug: null,
    items: [
      { label: 'Suspension',         slug: 'suspension' },
      { label: 'Front Forks',        slug: 'front-forks' },
      { label: 'Rear Shocks',        slug: 'rear-shocks' },
      { label: 'Wheels & Tyres',     slug: 'wheels-tyres' },
      { label: 'Tyres',              slug: 'tyres' },
      { label: 'Wheelsets',          slug: 'wheelsets' },
      { label: 'Drivetrain',         slug: 'drivetrain' },
      { label: 'Cassettes',          slug: 'cassettes' },
      { label: 'Derailleurs',        slug: 'derailleurs' },
      { label: 'Cockpit',            slug: 'cockpit' },
      { label: 'Handlebars',         slug: 'handlebars' },
      { label: 'Pedals',             slug: 'pedals' },
      { label: 'Saddles',            slug: 'saddles-seatposts' },
      { label: 'Brakes',             slug: 'brakes' },
    ],
  },
  {
    group: 'Gear & Apparel',
    slug: 'gear-apparel',
    items: [
      { label: 'Helmets',            slug: 'helmets' },
      { label: 'Shoes',              slug: 'shoes' },
      { label: 'Jerseys',            slug: 'jerseys' },
      { label: 'Bib Shorts',         slug: 'bib-shorts' },
      { label: 'Jackets',            slug: 'jackets' },
      { label: 'Gloves',             slug: 'gloves' },
      { label: 'Protection',         slug: 'protection-armour' },
      { label: 'Glasses / Goggles',  slug: 'glasses-goggles' },
      { label: 'Womens Apparel',     slug: 'womens-apparel' },
    ],
  },
  {
    group: 'Accessories',
    slug: null,
    items: [
      { label: 'Lights',             slug: 'lights' },
      { label: 'Computers & GPS',    slug: 'computers-gps' },
      { label: 'Bags & Backpacks',   slug: 'bags-backpacks' },
      { label: 'Bike Racks',         slug: 'racks-carriers' },
      { label: 'Trainers & Rollers', slug: 'trainers-rollers' },
      { label: 'Tools',              slug: 'tools-accessories' },
      { label: 'Nutrition',          slug: 'nutrition' },
      { label: 'Kids Bikes',         slug: 'kids-bikes' },
      { label: 'Services',           slug: 'services' },
      { label: 'Wanted',             slug: 'wanted' },
      { label: 'Trades',             slug: 'trades' },
      { label: 'Other',              slug: 'other' },
    ],
  },
]

// Category-specific attribute filters
const CATEGORY_FILTERS: Record<string, Array<{
  key: string; label: string; options: string[]
}>> = {
  mtb: [
    { key: 'suspension', label: 'Suspension', options: ['Full Sus', 'Hardtail'] },
    { key: 'frameSize',  label: 'Frame Size', options: ['XS','S','M','L','XL'] },
    { key: 'wheelSize',  label: 'Wheel Size', options: ['27.5"','29"'] },
    { key: 'travel',     label: 'Travel',     options: ['100-120mm','130-150mm','160mm+'] },
  ],
  enduro: [
    { key: 'suspension', label: 'Suspension', options: ['Full Sus'] },
    { key: 'frameSize',  label: 'Frame Size', options: ['S','M','L','XL'] },
    { key: 'wheelSize',  label: 'Wheel Size', options: ['27.5"','29"','Mixed'] },
    { key: 'travel',     label: 'Travel',     options: ['150-160mm','160mm+','170mm+'] },
  ],
  'road-bike': [
    { key: 'frameSize', label: 'Frame Size', options: ['XS','S','M','L','XL'] },
    { key: 'groupset',  label: 'Groupset',   options: ['Shimano 105','Shimano Ultegra','Shimano Dura-Ace','SRAM Rival','SRAM Force','SRAM Red'] },
    { key: 'frameType', label: 'Frame Type', options: ['Endurance','Aero','Climbing'] },
  ],
  'gravel-bike': [
    { key: 'frameSize', label: 'Frame Size', options: ['XS','S','M','L','XL'] },
    { key: 'groupset',  label: 'Groupset',   options: ['Shimano GRX','SRAM Rival AXS','SRAM Force AXS','Campagnolo Ekar'] },
    { key: 'tyreWidth', label: 'Tyre Width', options: ['35-40mm','40-45mm','45mm+'] },
  ],
  helmets: [
    { key: 'size', label: 'Size', options: ['XS/S','S/M','M/L','L/XL'] },
    { key: 'type', label: 'Type', options: ['Road','MTB Trail','Enduro','XC'] },
  ],
  shoes: [
    { key: 'size', label: 'Size', options: ['EU40','EU41','EU42','EU43','EU44','EU45','EU46'] },
    { key: 'type', label: 'Type', options: ['Road','MTB Clipless','MTB Flat','Gravel'] },
  ],
  'gear-apparel': [
    { key: 'size',   label: 'Size',   options: ['XS','S','M','L','XL','XXL'] },
    { key: 'gender', label: 'Gender', options: ['Mens','Womens','Unisex'] },
    { key: 'type',   label: 'Type',   options: ['Jersey','Bib Shorts','Jacket','Gilet','Kit'] },
  ],
  suspension: [
    { key: 'type',   label: 'Type',   options: ['Fork','Rear Shock','Fork + Shock'] },
    { key: 'travel', label: 'Travel', options: ['100mm','120mm','140mm','150mm','160mm','170mm'] },
  ],
  'e-bikes': [
    { key: 'motor',     label: 'Motor',    options: ['Bosch Performance CX','Shimano EP8','Yamaha PW-X3','Specialized SL 1.1'] },
    { key: 'battery',   label: 'Battery',  options: ['250Wh','320Wh','500Wh','625Wh','750Wh'] },
    { key: 'frameSize', label: 'Frame Size', options: ['S','M','L','XL'] },
  ],
}

const PROVINCES = ['Western Cape','Gauteng','KwaZulu-Natal','Eastern Cape','Free State','Limpopo','North West','Mpumalanga','Northern Cape']
const CONDITIONS = [
  { value: 'new', label: 'New', color: '#10B981' },
  { value: 'like_new', label: 'Like New', color: '#3B82F6' },
  { value: 'used', label: 'Used', color: '#F59E0B' },
  { value: 'poor', label: 'Poor', color: '#EF4444' },
]

function BrowseContent() {
  const router = useRouter()
  const params = useSearchParams()
  const { data: session } = useSession()

  const [items, setItems] = useState<ListingItem[]>([])
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [allItems, setAllItems] = useState<ListingItem[]>([])
  const PAGE_SIZE = 24
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [drawerOpen, setDrawerOpen] = useState(params.get('filters') === 'open')
  const [catExpanded, setCatExpanded] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [category, setCategory] = useState(params.get('category') || 'all')
  const [search, setSearch] = useState(params.get('search') || '')

  // Applied filters
  const [condition, setCondition] = useState('')
  const [province, setProvince] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [attrs, setAttrs] = useState<Record<string, string>>({})

  // Draft filters (inside drawer before Apply)
  const [dCondition, setDCondition] = useState('')
  const [dProvince, setDProvince] = useState('')
  const [dMinPrice, setDMinPrice] = useState('')
  const [dMaxPrice, setDMaxPrice] = useState('')
  const [dAttrs, setDAttrs] = useState<Record<string, string>>({})
  const [dCategory, setDCategory] = useState(category)
  // Drill-down state for filter drawer category picker
  // null = showing tier 1, otherwise showing children of this parent slug
  const [drawerParent, setDrawerParent] = useState<string | null>(null)

  const catFilters = CATEGORY_FILTERS[category] || []
  const activeCount = [condition, province, minPrice || maxPrice, ...Object.values(attrs).filter(Boolean)].filter(Boolean).length

  const buildQuery = (
    cat: string, cond: string, prov: string, min: string, max: string,
    attrMap: Record<string, string>, searchTerm: string, offset: number
  ) => {
    const q = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) })
    if (searchTerm) q.set('search', searchTerm)
    if (cat !== 'all') q.set('category', cat)
    if (cond) q.set('condition', cond)
    if (prov) q.set('province', prov)
    if (min)  q.set('minPrice', min)
    if (max)  q.set('maxPrice', max)
    const activeAttrs = Object.fromEntries(Object.entries(attrMap).filter(([, v]) => v))
    if (Object.keys(activeAttrs).length) q.set('attrs', JSON.stringify(activeAttrs))
    return q
  }

  const fetchListings = useCallback(async (
    cat: string, cond: string, prov: string, min: string, max: string, attrMap: Record<string, string>, searchTerm: string = ''
  ) => {
    setLoading(true)
    setHasMore(true)
    const q = buildQuery(cat, cond, prov, min, max, attrMap, searchTerm, 0)
    try {
      const res = await fetch(`/api/listings?${q}`)
      const data = await res.json()
      setAllItems(data)
      setItems(data)
      setHasMore(data.length === PAGE_SIZE)
    } finally { setLoading(false) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const q = buildQuery(category, condition, province, minPrice, maxPrice, attrs, search, allItems.length)
    try {
      const res = await fetch(`/api/listings?${q}`)
      const data = await res.json()
      const merged = [...allItems, ...data]
      setAllItems(merged)
      setItems(merged)
      setHasMore(data.length === PAGE_SIZE)
    } finally { setLoadingMore(false) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingMore, hasMore, category, condition, province, minPrice, maxPrice, attrs, search, allItems])

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore() },
      { rootMargin: '200px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  // Back to top FAB — show after scrolling 400px
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fetch saved listing IDs when user is logged in
  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/listings/saved/ids')
        .then((res) => res.json())
        .then((ids) => setSavedIds(new Set(ids)))
        .catch(() => { /* non-fatal: saved IDs unavailable */ })
    }
  }, [session])

  useEffect(() => {
    fetchListings(category, condition, province, minPrice, maxPrice, attrs, search)
  }, [fetchListings, category, condition, province, minPrice, maxPrice, attrs, search])

  const selectCategory = (slug: string) => {
    setCategory(slug)
    setAttrs({})  // clear category-specific attrs when switching
    setDAttrs({})
    router.replace(`/browse?category=${slug}`, { scroll: false })
  }

  const openDrawer = () => {
    setDCategory(category)
    setDCondition(condition); setDProvince(province)
    setDMinPrice(minPrice); setDMaxPrice(maxPrice); setDAttrs({ ...attrs })
    // Always open at Tier 1 — if a child is selected, highlight its parent (Option B)
    setDrawerParent(null)
    setDrawerOpen(true)
  }

  const applyFilters = () => {
    if (dCategory !== category) {
      setCategory(dCategory)
      router.replace(`/browse?category=${dCategory}`, { scroll: false })
    }
    setCondition(dCondition); setProvince(dProvince)
    setMinPrice(dMinPrice); setMaxPrice(dMaxPrice); setAttrs(dAttrs)
    setDrawerOpen(false)
  }

  const clearFilters = () => {
    setCondition(''); setProvince(''); setMinPrice(''); setMaxPrice(''); setAttrs({})
    setDCondition(''); setDProvince(''); setDMinPrice(''); setDMaxPrice(''); setDAttrs({})
    setDCategory('all'); setCategory('all')
    router.replace('/browse', { scroll: false })
    setDrawerOpen(false)
  }

  const toggleDAttr = (key: string, val: string) =>
    setDAttrs(prev => ({ ...prev, [key]: prev[key] === val ? '' : val }))

  const handleSearch = (q: string) => {
    setSearch(q)
    router.replace(`/browse?search=${encodeURIComponent(q)}`, { scroll: false })
  }

  const clearSearch = () => {
    setSearch('')
    router.replace('/browse', { scroll: false })
  }

  const fmt = (p: string) => `R ${parseFloat(p).toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`
  const catLabel = QUICK_CATS.find(c => c.slug === category)?.label ?? 'Listings'

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <style>{`
        .cat-section { background:#fff; border-bottom:1px solid #ebebeb; }
        .cat-inner { max-width:1280px; margin:0 auto; padding:10px 16px; display:flex; gap:8px; overflow-x:auto; scrollbar-width:none; }
        .cat-inner::-webkit-scrollbar { display:none; }
        .cat-pill { flex-shrink:0; padding:7px 16px; border-radius:2px; border:1px solid #e4e4e7; background:#fff; font-size:13px; font-weight:500; color:#1a1a1a; cursor:pointer; white-space:nowrap; transition:all .12s; }
        .cat-pill.active { background:var(--color-primary); color:#fff; border-color:var(--color-primary); font-weight:700; }

        .filter-bar { max-width:1280px; margin:0 auto; padding:8px 16px; display:flex; align-items:center; gap:8px; }
        .fbtn { flex-shrink:0; display:flex; align-items:center; gap:5px; padding:7px 14px; border-radius:2px; border:1px solid #e4e4e7; background:#fff; font-size:13px; font-weight:500; color:#1a1a1a; cursor:pointer; white-space:nowrap; }
        .fbtn.active { border-color:var(--color-primary); background:#E9ECF5; color:var(--color-primary); font-weight:700; }
        .fbadge { background:var(--color-primary); color:#fff; font-size:10px; font-weight:800; padding:1px 6px; border-radius:2px; }
        .filter-search { flex:1; min-width:0; }
        .filter-count { font-size:12px; color:#9a9a9a; flex-shrink:0; white-space:nowrap; }
        /* Active chips — only on desktop */
        .chips-row { display:none; }

        .section-hdr { max-width:1280px; margin:0 auto; padding:20px 16px 10px; display:flex; align-items:baseline; justify-content:space-between; }
        .section-hdr h3 { font-size:18px; font-weight:800; color:#1a1a1a; margin:0; }
        .section-hdr small { font-size:12px; color:#9a9a9a; }

        .grid-wrap { max-width:1280px; margin:0 auto; padding:0 12px 100px; }
        .listing-grid { display:grid; gap:10px; grid-template-columns:repeat(2,1fr); }
        @media(min-width:768px)  { .listing-grid { grid-template-columns:repeat(2,1fr); gap:12px; } }
        @media(min-width:900px)  { .listing-grid { grid-template-columns:repeat(3,1fr); } }
        @media(min-width:1100px) { .listing-grid { grid-template-columns:repeat(4,1fr); } }
        @media(min-width:1350px) { .listing-grid { grid-template-columns:repeat(5,1fr); } }

        .lcard { background:#fff; border-radius:2px; border:1px solid #ebebeb; overflow:hidden; text-decoration:none; color:inherit; display:flex; flex-direction:column; box-shadow:0 1px 3px rgba(0,0,0,.06); transition:box-shadow .15s,transform .15s; }
        .lcard:hover { box-shadow:0 6px 20px rgba(0,0,0,.10); transform:translateY(-1px); }
        .lcard-img { position:relative; width:100%; aspect-ratio:4/3; background:#f0f0f0; overflow:hidden; flex-shrink:0; }
        .lcard-img.sold::after { content:'SOLD'; position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,.75); color:#fff; font-size:14px; font-weight:800; text-align:center; padding:8px 0; }
        .lcard-body { padding:10px 10px 12px; display:flex; flex-direction:column; flex:1; }
        .lcard-make { font-size:10px; color:#9a9a9a; font-weight:700; text-transform:uppercase; letter-spacing:.6px; margin-bottom:2px; }
        .lcard-title { font-size:13px; font-weight:700; color:#1a1a1a; line-height:1.3; margin-bottom:5px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        .lcard-meta { display:flex; align-items:center; gap:5px; font-size:11px; color:#9a9a9a; margin-bottom:6px; flex-wrap:wrap; }
        .lcard-price { font-size:15px; font-weight:800; color:#1a1a1a; margin-top:auto; }
        .lcard-loc { display:flex; align-items:center; gap:3px; font-size:11px; color:#9a9a9a; margin-top:3px; }

        /* Filter drawer */
        .foverlay { position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:200; opacity:0; pointer-events:none; transition:opacity .2s; }
        .foverlay.open { opacity:1; pointer-events:all; }
        .fdrawer { position:fixed; bottom:0; left:0; right:0; background:#fff; border-radius:2px 20px 0 0; z-index:201; transform:translateY(100%); transition:transform .25s cubic-bezier(.4,0,.2,1); max-height:90vh; display:flex; flex-direction:column; }
        .fdrawer.open { transform:translateY(0); }
        @media(min-width:768px) {
          .fdrawer { left:auto; right:0; top:0; bottom:0; width:400px; border-radius:0; transform:translateX(100%); max-height:100vh; }
          .fdrawer.open { transform:translateX(0); }
        }
        .fdr-hdr { padding:18px 20px 14px; border-bottom:1px solid #ebebeb; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
        .fdr-body { flex:1; overflow-y:auto; overflow-x:hidden; padding:0; }
        .fdr-ftr { padding:14px 20px; border-top:1px solid #ebebeb; display:flex; gap:10px; flex-shrink:0; }

        /* Filter section inside drawer */
        .fsec { padding:16px 20px; border-bottom:1px solid #f0f0f0; overflow:hidden; box-sizing:border-box; }
        .fsec-title { font-size:11px; font-weight:700; color:#9a9a9a; text-transform:uppercase; letter-spacing:.8px; margin-bottom:10px; }

        /* Chip grid for options */
        .fchips { display:flex; flex-wrap:wrap; gap:8px; }
        .fchip { padding:8px 14px; border-radius:2px; border:1px solid #e4e4e7; background:#fff; font-size:13px; font-weight:500; color:#1a1a1a; cursor:pointer; white-space:nowrap; transition:all .12s; }
        .fchip.active { background:#1a1a1a; color:#fff; border-color:#1a1a1a; font-weight:600; }

        /* Condition chips with dots */
        .cond-chip { display:flex; align-items:center; gap:6px; padding:8px 14px; border-radius:2px; border:1px solid #e4e4e7; background:#fff; font-size:13px; font-weight:500; color:#1a1a1a; cursor:pointer; white-space:nowrap; }
        .cond-chip.active { background:#1a1a1a; color:#fff; border-color:#1a1a1a; }
        .cond-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }

        /* Price inputs */
        .price-row { display:flex; gap:10px; width:100%; }
        .price-input { flex:1; min-width:0; width:0; height:44px; padding:0 14px; border:1px solid #e4e4e7; border-radius:2px; font-size:14px; outline:none; box-sizing:border-box; }
        .price-input:focus { border-color:var(--color-primary); }

        .btn-apply { flex:2; height:48px; background:var(--color-primary); color:#fff; border:none; border-radius:2px; font-size:15px; font-weight:700; cursor:pointer; }
        .btn-clear { flex:1; height:48px; background:#fff; color:#1a1a1a; border:1px solid #e4e4e7; border-radius:2px; font-size:15px; font-weight:600; cursor:pointer; }

        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        @keyframes spin { to { transform:rotate(360deg) } }
        .skel {
          background: linear-gradient(90deg, #efefef 25%, #e4e4e4 50%, #efefef 75%);
          background-size: 800px 100%;
          animation: shimmer 1.6s ease-in-out infinite;
        }
      `}</style>

      {/* Category pills */}
      <div className="cat-section" style={{ position: 'relative' }}>
        <div className="cat-inner">
          <button className={`cat-pill${category === 'all' ? ' active' : ''}`}
            onClick={() => selectCategory('all')}>
            All
          </button>
          {QUICK_CATS.slice(1).map(c => (
            <button key={c.slug} className={`cat-pill${category === c.slug ? ' active' : ''}`}
              onClick={() => selectCategory(c.slug)}>
              {c.label}
            </button>
          ))}
          <button
            className={`cat-pill${catExpanded ? ' active' : ''}`}
            onClick={() => setCatExpanded(p => !p)}
            style={{ fontWeight: 700, flexShrink: 0 }}>
            {catExpanded ? '▲ Less' : '▼ More'}
          </button>
        </div>

        {/* Mega-menu dropdown */}
        {catExpanded && (
          <>
            {/* Backdrop */}
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 19, background: 'rgba(0,0,0,0.25)' }}
              onClick={() => setCatExpanded(false)}
            />
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              background: '#fff', borderBottom: '1px solid #ebebeb',
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              zIndex: 20, padding: '20px 24px 24px',
            }}>
              <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                {/* Grid of category groups */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: '20px 32px',
                }}>
                  {MEGA_MENU.map(group => (
                    <div key={group.group}>
                      {/* Group heading — clickable if has parent slug */}
                      {group.slug ? (
                        <button
                          onClick={() => { selectCategory(group.slug!); setCatExpanded(false) }}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: 11, fontWeight: 700, color: 'var(--color-primary)',
                            textTransform: 'uppercase', letterSpacing: '.6px',
                            padding: '0 0 8px', display: 'block',
                            borderBottom: '1.5px solid #0D1B2A', marginBottom: 10, width: '100%', textAlign: 'left',
                          }}
                        >
                          {group.group}
                        </button>
                      ) : (
                        <div style={{
                          fontSize: 11, fontWeight: 700, color: '#9a9a9a',
                          textTransform: 'uppercase', letterSpacing: '.6px',
                          padding: '0 0 8px',
                          borderBottom: '1.5px solid #e0e0e0', marginBottom: 10,
                        }}>
                          {group.group}
                        </div>
                      )}
                      {/* Sub-items */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {group.items.map(item => (
                          <button
                            key={item.slug}
                            onClick={() => { selectCategory(item.slug); setCatExpanded(false) }}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              fontSize: 13, color: category === item.slug ? '#0D1B2A' : '#1a1a1a',
                              fontWeight: category === item.slug ? 700 : 400,
                              padding: '3px 0', textAlign: 'left',
                              display: 'flex', alignItems: 'center', gap: 6,
                            }}
                          >
                            {category === item.slug && (
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)', display: 'inline-block', flexShrink: 0 }} />
                            )}
                            <span style={{ color: 'inherit' }}>{item.label}</span>
                          </button>
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

      {/* Filter bar */}
      <div style={{ background: '#f5f5f5', borderBottom: '1px solid #e8e8e8' }}>
        {/* Main row: Filters | Search | count */}
        <div className="filter-bar">
          <button className={`fbtn${activeCount > 0 ? ' active' : ''}`} onClick={openDrawer}>
            <SlidersHorizontal size={13} />
            Filters
            {activeCount > 0 && <span className="fbadge">{activeCount}</span>}
          </button>
          {/* Search — takes all remaining space */}
          <div className="filter-search">
            <SearchBar size="sm" defaultValue={search} onSearch={handleSearch} />
          </div>
          <span className="filter-count">
            {loading ? '…' : `${items.length}`}
          </span>
        </div>

        {/* Active chips — desktop only second row, hidden on mobile */}
        <div className={`chips-row${activeCount > 0 ? ' has-chips' : ''}`}>
          {condition && (
            <button className="fbtn active" onClick={() => setCondition('')}>
              {COND_MAP[condition as keyof typeof COND_MAP]?.label} <X size={11} />
            </button>
          )}
          {Object.entries(attrs).filter(([, v]) => v).map(([k, v]) => (
            <button key={k} className="fbtn active" onClick={() => setAttrs(p => ({ ...p, [k]: '' }))}>
              {v as string} <X size={11} />
            </button>
          ))}
          {province && (
            <button className="fbtn active" onClick={() => setProvince('')}>
              {province} <X size={11} />
            </button>
          )}
          {(minPrice || maxPrice) && (
            <button className="fbtn active" onClick={() => { setMinPrice(''); setMaxPrice('') }}>
              {minPrice ? `R${parseInt(minPrice).toLocaleString()}` : '0'}–{maxPrice ? `R${parseInt(maxPrice).toLocaleString()}` : '∞'} <X size={11} />
            </button>
          )}
          {activeCount > 0 && (
            <button onClick={clearFilters} style={{ fontSize: 12, color: '#9a9a9a', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', flexShrink: 0 }}>
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Search results header — shown when searching */}
      {search && (
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>
              {items.length} {items.length === 1 ? 'result' : 'results'} for <span style={{ color: 'var(--color-primary)' }}>"{search}"</span>
            </h2>
            <button onClick={clearSearch} style={{
              fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline'
            }}>
              Clear search
            </button>
          </div>
        </div>
      )}

      {/* Section heading */}
      {!search && (
        <div className="section-hdr">
          <div>
            <h3>{category === 'all' ? 'Latest Listings' : catLabel}</h3>
            <small>Fresh deals from SA cyclists</small>
          </div>
          {/* Infinite scroll sentinel */}
          {hasMore && (
            <div ref={sentinelRef} style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
              {loadingMore && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#9a9a9a' }}>
                  <div style={{ width: 18, height: 18, border: '2px solid #e4e4e7', borderTopColor: '#0D1B2A', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Loading more…
                </div>
              )}
            </div>
          )}
          {!hasMore && items.length > 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '24px 0', fontSize: 13, color: '#9a9a9a' }}>
              {items.length} listings shown
            </div>
          )}
        </div>
      )}

      {/* Listing grid */}
      <div className="grid-wrap">
        <div className="listing-grid" style={{ minHeight: loading ? 'auto' : undefined }}>
          {loading
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="lcard" style={{ pointerEvents: 'none' }}>
                  {/* Image placeholder — same aspect-ratio as real card */}
                  <div className="lcard-img skel" />
                  {/* Body placeholder — matches real card body height */}
                  <div className="lcard-body" style={{ gap: 7, minHeight: 88 }}>
                    <div className="skel" style={{ height: 9,  borderRadius: 4, width: '38%' }} />
                    <div className="skel" style={{ height: 13, borderRadius: 4, width: '88%', marginTop: 1 }} />
                    <div className="skel" style={{ height: 13, borderRadius: 4, width: '65%' }} />
                    <div className="skel" style={{ height: 17, borderRadius: 4, width: '45%', marginTop: 6 }} />
                    <div className="skel" style={{ height: 11, borderRadius: 4, width: '55%', marginTop: 2 }} />
                  </div>
                </div>
              ))
            : items.length === 0
              ? (
                <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'60px 20px' }}>
                  <p style={{ fontSize:16, fontWeight:600, color:'#1a1a1a' }}>No listings found</p>
                  <p style={{ fontSize:13, color:'#9a9a9a', marginTop:4 }}>Try adjusting your filters</p>
                  <button onClick={clearFilters} style={{ marginTop:16, padding:'10px 24px', background:'var(--color-primary)', color:'#fff', border:'none', borderRadius:2, fontWeight:700, cursor:'pointer', fontSize:14 }}>
                    Clear Filters
                  </button>
                </div>
              )
              : items.map(item => {
                  const cond = COND_MAP[item.condition]
                  return (
                    <Link key={item.id} href={`/browse/${item.slug}`} className="lcard">
                      <div className={`lcard-img${item.status === 'sold' ? ' sold' : ''}`}>
                        {item.image?.image_url || item.image?.imageUrl
                          ? <Image src={item.image.image_url || item.image.imageUrl!} alt={item.title} fill unoptimized
                              placeholder="blur" blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSIzIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjMiIGZpbGw9IiNlZmVmZWYiLz48L3N2Zz4="
                              style={{ objectFit:'cover' }}
                              sizes="(max-width:640px) 50vw,(max-width:900px) 33vw,(max-width:1100px) 25vw,20vw" />
                          : <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                              <span style={{ fontSize:11, color:'#ccc' }}>No photo</span>
                            </div>
                        }
                        {item.boostEnabled && (
                          <div style={{ position:'absolute', top:8, left:8, background:'var(--color-primary)', color:'#fff', fontSize:10, fontWeight:700, padding:'3px 7px', borderRadius:2, display:'flex', alignItems:'center', gap:3 }}>
                            <Zap size={9} /> Featured
                          </div>
                        )}
                        <div onClick={e => e.preventDefault()} style={{ position:'absolute', top:8, right:8 }}>
                          <SaveButton listingId={item.id} initialSaved={savedIds.has(item.id)} size="sm" />
                        </div>
                      </div>
                      <div className="lcard-body">
                        {item.bikeMake && <p className="lcard-make">{item.bikeMake}</p>}
                        <p className="lcard-title">{item.bikeModel ?? item.title}</p>
                        <div className="lcard-meta">
                          {item.bikeYear && <span>{item.bikeYear}</span>}
                          {item.bikeYear && cond && <span>·</span>}
                          {cond && <span style={{ display:'flex', alignItems:'center', gap:3 }}>
                            <span style={{ width:6, height:6, borderRadius:'50%', background:cond.color, display:'inline-block' }} />
                            {cond.label}
                          </span>}
                          {/* Show 1-2 key attributes */}
                          {item.attributes?.frameSize && <><span>·</span><span>{String(item.attributes.frameSize)}</span></>}
                          {item.attributes?.wheelSize && <><span>·</span><span>{String(item.attributes.wheelSize)}</span></>}
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:'auto' }}>
                          <p className="lcard-price" style={{ margin:0 }}>{fmt(item.price)}</p>
                          {item.negotiable && <span style={{ fontSize:10, fontWeight:700, color:'var(--color-primary)', background:'#E9ECF5', padding:'2px 6px', borderRadius:2 }}>NEG</span>}
                        </div>
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

      {/* Overlay */}
      <div className={`foverlay${drawerOpen ? ' open' : ''}`} onClick={() => setDrawerOpen(false)} />

      {/* Filter drawer */}
      <div className={`fdrawer${drawerOpen ? ' open' : ''}`}>
        <div className="fdr-hdr">
          <div>
            <span style={{ fontSize:17, fontWeight:800, color:'#1a1a1a' }}>Filters</span>
            {category !== 'all' && (
              <span style={{ fontSize:13, color:'var(--color-primary)', fontWeight:600, marginLeft:8 }}>— {catLabel}</span>
            )}
          </div>
          <button onClick={() => setDrawerOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#1a1a1a', padding:4 }}>
            <X size={22} />
          </button>
        </div>

        <div className="fdr-body">
          {/* Category picker inside drawer — drill-down */}
          <div className="fsec">
            {drawerParent === null ? (
              /* ── Tier 1: parent list ── */
              <>
                <div className="fsec-title">Category</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* All option */}
                  <button
                    onClick={() => { setDCategory('all'); setDAttrs({}) }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: '1.5px solid', borderColor: dCategory === 'all' ? '#0D1B2A' : '#e4e4e7', borderRadius: 2, background: dCategory === 'all' ? '#E9ECF5' : '#fff', cursor: 'pointer', fontSize: 13, fontWeight: dCategory === 'all' ? 700 : 500, color: dCategory === 'all' ? '#0D1B2A' : '#1a1a1a', textAlign: 'left' }}>
                    All Categories
                  </button>
                  {MEGA_MENU.map(group => {
                    const isSelected = dCategory === group.slug || group.items.some(i => i.slug === dCategory)
                    const hasChildren = group.items.length > 0
                    return (
                      <button key={group.group}
                        onClick={() => {
                          if (hasChildren) {
                            setDrawerParent(group.group)
                          } else if (group.slug) {
                            setDCategory(group.slug); setDAttrs({})
                          }
                        }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: '1.5px solid', borderColor: isSelected ? '#0D1B2A' : '#e4e4e7', borderRadius: 2, background: isSelected ? '#E9ECF5' : '#fff', cursor: 'pointer', fontSize: 13, fontWeight: isSelected ? 700 : 500, color: isSelected ? '#0D1B2A' : '#1a1a1a', textAlign: 'left', width: '100%' }}>
                        <span>{group.group}</span>
                        {hasChildren && <span style={{ fontSize: 11, color: isSelected ? '#0D1B2A' : '#9a9a9a' }}>›</span>}
                      </button>
                    )
                  })}
                </div>
              </>
            ) : (
              /* ── Tier 2: children of selected parent ── */
              (() => {
                const group = MEGA_MENU.find(g => g.group === drawerParent)
                if (!group) return null
                return (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <button onClick={() => setDrawerParent(null)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: 13, fontWeight: 700, padding: 0 }}>
                        ← Back
                      </button>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#1a1a1a' }}>{group.group}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {/* All [parent] option */}
                      {group.slug && (
                        <button
                          onClick={() => { setDCategory(group.slug!); setDAttrs({}); setDrawerParent(null) }}
                          style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', border: '1.5px solid', borderColor: dCategory === group.slug ? '#0D1B2A' : '#e4e4e7', borderRadius: 2, background: dCategory === group.slug ? '#E9ECF5' : '#fff', cursor: 'pointer', fontSize: 13, fontWeight: dCategory === group.slug ? 700 : 500, color: dCategory === group.slug ? '#0D1B2A' : '#1a1a1a', textAlign: 'left', width: '100%' }}>
                          All {group.group}
                        </button>
                      )}
                      {group.items.map(item => (
                        <button key={item.slug}
                          onClick={() => { setDCategory(item.slug); setDAttrs({}); setDrawerParent(null) }}
                          style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', border: '1.5px solid', borderColor: dCategory === item.slug ? '#0D1B2A' : '#e4e4e7', borderRadius: 2, background: dCategory === item.slug ? '#E9ECF5' : '#fff', cursor: 'pointer', fontSize: 13, fontWeight: dCategory === item.slug ? 700 : 500, color: dCategory === item.slug ? '#0D1B2A' : '#1a1a1a', textAlign: 'left', width: '100%' }}>
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </>
                )
              })()
            )}
          </div>

          {/* Category-specific attributes — shown when a category is selected */}
          {(CATEGORY_FILTERS[dCategory] || []).map(f => (
            <div key={f.key} className="fsec">
              <div className="fsec-title">{f.label}</div>
              <div className="fchips">
                {f.options.map(opt => (
                  <button key={opt} className={`fchip${dAttrs[f.key] === opt ? ' active' : ''}`}
                    onClick={() => toggleDAttr(f.key, opt)}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Condition */}
          <div className="fsec">
            <div className="fsec-title">Condition</div>
            <div className="fchips">
              {CONDITIONS.map(c => (
                <button key={c.value}
                  className={`cond-chip${dCondition === c.value ? ' active' : ''}`}
                  onClick={() => setDCondition(dCondition === c.value ? '' : c.value)}>
                  <span className="cond-dot" style={{ background: dCondition === c.value ? '#fff' : c.color }} />
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="fsec">
            <div className="fsec-title">Price (ZAR)</div>
            <div className="price-row">
              <input className="price-input" type="number" placeholder="Min" value={dMinPrice}
                onChange={e => setDMinPrice(e.target.value)} />
              <input className="price-input" type="number" placeholder="Max" value={dMaxPrice}
                onChange={e => setDMaxPrice(e.target.value)} />
            </div>
          </div>

          {/* Province */}
          <div className="fsec">
            <div className="fsec-title">Province</div>
            <div className="fchips">
              {PROVINCES.map(prov => (
                <button key={prov} className={`fchip${dProvince === prov ? ' active' : ''}`}
                  onClick={() => setDProvince(dProvince === prov ? '' : prov)}>
                  {prov}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="fdr-ftr">
          <button className="btn-clear" onClick={clearFilters}>Clear All</button>
          <button className="btn-apply" onClick={applyFilters}>Show Results</button>
        </div>
      </div>

      {/* Back to top FAB */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          style={{
            position: 'fixed',
            bottom: 80,
            right: 20,
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: '#0D1B2A',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 50,
            fontSize: 20,
            lineHeight: 1,
          }}
        >
          ↑
        </button>
      )}
    </div>
  )
}

export default function BrowsePage() {
  return <Suspense><BrowseContent /></Suspense>
}
