'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import { SA_BIKE_BRANDS } from '@/db/brands-kb'

const STEPS = ['Category', 'Details', 'Photos', 'Location & Price']

const CONDITIONS = [
  { value: 'new',      label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'used',     label: 'Used' },
  { value: 'poor',     label: 'Poor' },
]

// ── Category groups ─────────────────────────────────────────────
const MTB_CATS     = ['mtb','enduro','downhill','xc','trail-mtb','hardtail-mtb','full-suspension-mtb','dirt-jump','fat-bikes','bmx','kids-hardtail']
const FULL_SUS_CATS = ['enduro','downhill','full-suspension-mtb']
const ROAD_CATS    = ['road-bike','gravel-bike','cyclocross','triathlon-tt','fitness-urban','fixedgear','urban-commuter','hybrid-city']
const EBIKE_CATS   = ['e-mtb','e-road-gravel','e-urban','e-bikes']
const FULL_BIKE_CATS = [...MTB_CATS,...ROAD_CATS,...EBIKE_CATS,'complete-bikes','vintage','cruiser','folding','fat-bikes','tandem','trials','kids-road-hybrid','balance-bikes','kids-bikes']
const FRAME_CATS   = ['frames','road-frames','mtb-frames-hardtail','mtb-frames-fullsus','gravel-frames','hybrid-frames','bmx-frames','e-bike-frames','framesets','vintage-frames','restoration-frames']
const SUSP_CATS    = ['suspension','front-forks','rear-shocks','fork-parts','shock-parts']
const WHEEL_CATS   = ['wheels-tyres','wheelsets','rims','tyres','hubs','spokes']
const DT_CATS      = ['drivetrain','cassettes','chains','chainrings','derailleurs','bottom-brackets','chain-guides']
const APPAREL_CATS = ['gear-apparel','jerseys','bib-shorts','jackets','gloves','socks','base-layers','casual-apparel','womens-apparel','protection-armour']
const KIDS_CATS    = ['kids-bikes','kids-hardtail','kids-road-hybrid','balance-bikes']

// ── Option lists ────────────────────────────────────────────────
const FRAME_SIZES_MTB  = ['XS','S','M','L','XL','XXL']
const FRAME_SIZES_ROAD = ['44','46','48','50','52','54','56','58','60','62','XS','S','M','L','XL','XXL']
const WHEEL_SIZES_MTB  = ['24"','26"','27.5"','29"','Mixed (27.5F/29R)']
const WHEEL_SIZES_ROAD = ['700c','650b']
const WHEEL_SIZES_KIDS = ['12"','14"','16"','18"','20"','24"']
const TRAVEL_OPTIONS   = ['Rigid','80mm','100mm','120mm','130mm','140mm','150mm','160mm','170mm','180mm','200mm+','Not Specified']
const FRAME_MATERIALS  = ['Carbon','Aluminium','Steel','Titanium','Chromoly','Carbon/Aluminium Mix','Not Specified']
const MTB_GROUPSETS    = ['SRAM NX Eagle','SRAM GX Eagle','SRAM X01 Eagle','SRAM XX1 Eagle','SRAM XX SL Eagle','Shimano Deore','Shimano SLX','Shimano XT','Shimano XTR','Shimano Cues','Box Components','Other']
const ROAD_GROUPSETS   = ['Shimano 105','Shimano 105 Di2','Shimano Ultegra','Shimano Ultegra Di2','Shimano Dura-Ace','Shimano Dura-Ace Di2','SRAM Rival','SRAM Rival AXS','SRAM Force','SRAM Force AXS','SRAM Red','SRAM Red AXS','Campagnolo Chorus','Campagnolo Record','Campagnolo Super Record','Campagnolo Ekar','Other']
const DT_SPEEDS        = ['1× (Single)','7-speed','8-speed','9-speed','10-speed','11-speed','12-speed','13-speed']
const MOTOR_BRANDS     = ['Bosch','Shimano Steps','SRAM Eagle Powertrain','Fazua','TQ','Mahle X35+','Bafang','Tongsheng','Other']
const BATTERY_SIZES    = ['Under 400Wh','400Wh','500Wh','600Wh','625Wh','750Wh','Over 750Wh','Not Specified']
const SUSP_BRANDS      = ['Fox','RockShox','Manitou','DVO','MRP','X-Fusion','Öhlins','BOS','Push Industries','Other']
const AXLE_STANDARDS   = ['Quick Release (QR)','15×100mm Thru-Axle','20×110mm Thru-Axle','12×142mm Thru-Axle','12×148mm Boost','12×157mm Super Boost','Other']
const BRAKE_STANDARDS  = ['Rim Brake','Centre-Lock Disc','6-Bolt Disc']
const DT_BRANDS        = ['Shimano','SRAM','Campagnolo','Box Components','Other']
const GPS_BRANDS       = ['Garmin','Wahoo','Polar','Bryton','Lezyne','Sigma','CatEye','Other']
const HELMET_SIZES     = ['XS (50–54cm)','S (54–56cm)','M (55–59cm)','L (58–62cm)','XL (60–64cm)','XXL (62cm+)']
const SHOE_SIZES       = ['35','36','37','38','39','40','41','42','43','44','45','46','47','48']
const APPAREL_SIZES    = ['2XS','XS','S','M','L','XL','2XL','3XL']
const GENDERS          = ["Men's","Women's","Unisex"]
const KIDS_AGES        = ['2–4 years','4–6 years','6–9 years','9–12 years','12+ years']
const PEDAL_TYPE_OPTIONS = ['Flat / Platform','Clipless SPD (MTB)','Clipless SPD-SL (Road)','Clipless Look Keo','Clipless Crank Brothers','Included (type unknown)','Not Included']
const CHAIN_BRANDS       = ['SRAM','Shimano','KMC','Connex','Wippermann','Other']

// ── Select helper ────────────────────────────────────────────────
function Sel({ label, field, options, form, onChange }: { label: string; field: string; options: string[]; form: Record<string, string>; onChange: (k: string, v: string) => void }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <select className="form-input" value={form[field] || ''} onChange={e => onChange(field, e.target.value)}>
        <option value="">Select (optional)</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function Txt({ label, field, placeholder, form, onChange }: { label: string; field: string; placeholder?: string; form: Record<string, string>; onChange: (k: string, v: string) => void }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input className="form-input" value={form[field] || ''} onChange={e => onChange(field, e.target.value)} placeholder={placeholder || ''} />
    </div>
  )
}

function Step2Content() {
  const router = useRouter()
  const params = useSearchParams()
  const category = params.get('category') || 'other'
  const { status } = useSession()
  const [draftSaveStatus, setDraftSaveStatus] = useState<'saving' | 'saved' | null>(null)
  const [moreOpen, setMoreOpen] = useState(false)
  const draftSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    // Only guard step-1 completion — auth check moved to step-4 (publish)
    // No auth required just to fill in the form
    const step1 = localStorage.getItem('crankmart-sell-category')
    if (!step1) router.replace('/sell/step-1')
  }, [status, router, category])

  if (status === 'loading') {
    return (
      <div style={{ minHeight:'100vh', background:'#f5f5f5', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:32, height:32, border:'3px solid #ebebeb', borderTopColor:'#0D1B2A', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  const [form, setForm] = useState<Record<string, string>>({
    title:'', description:'', bikeMake:'', bikeModel:'', bikeYear:'', condition:'',
    frameSize:'', wheelSize:'', frameMaterial:'', suspensionTravel:'',
    groupset:'', drivetrainSpeeds:'', brakeType:'', forkBrand:'', rearShockBrand:'',
    wheels:'', tyres:'', handlebar:'',
    motorBrand:'', batteryCapacity:'', ebikeRange:'',
    suspBrand:'', axleStandard:'', brakeStandard:'', drivetrainBrand:'',
    gpsBrand:'', apparelSize:'', gender:'', kidsWheelSize:'', kidsAge:'',
    helmetSize:'', shoeSize:'', colour:'', recentUpgrades:'', damageNotes:'',
    seatpost:'', shifters:'', saddle:'', pedalType:'', stem:'', crank:'', chain:'', cassette:'', extras:'',
    serialNumber:'',
  })

  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([])
  const [showBrandDropdown, setShowBrandDropdown] = useState(false)
  const [importUrl, setImportUrl] = useState('')
  const [importing, setImporting] = useState(false)

  // ── Category flags ────────────────────────────────────────────
  const isMTB       = MTB_CATS.includes(category)
  const isFullSus   = FULL_SUS_CATS.includes(category)
  const isRoad      = ROAD_CATS.includes(category)
  const isEBike     = EBIKE_CATS.includes(category)
  const isFullBike  = FULL_BIKE_CATS.includes(category)
  const isFrame     = FRAME_CATS.includes(category)
  const isSuspPart  = SUSP_CATS.includes(category)
  const isWheel     = WHEEL_CATS.includes(category)
  const isDrivetrain = DT_CATS.includes(category)
  const isApparel   = APPAREL_CATS.includes(category)
  const isKids      = KIDS_CATS.includes(category)
  const isHelmet    = category === 'helmets'
  const isShoe      = category === 'shoes'
  const isGPS       = category === 'computers-gps'
  const hasBikeDetails = isFullBike || isFrame

  const frameSizes  = isRoad ? FRAME_SIZES_ROAD : FRAME_SIZES_MTB
  const wheelSizes  = isRoad ? WHEEL_SIZES_ROAD : WHEEL_SIZES_MTB
  const groupsets   = isMTB || isFrame ? MTB_GROUPSETS : ROAD_GROUPSETS

  // ── Draft load ────────────────────────────────────────────────
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const res = await fetch('/api/sell/draft')
        if (res.ok) {
          const draft = await res.json()
          if (draft?.data) { setForm(draft.data); return }
        }
      } catch {}
      const saved = localStorage.getItem('crankmart-sell-draft')
      if (saved) { try { setForm(JSON.parse(saved)) } catch {} }
    }
    loadDraft()
  }, [])

  // ── Autosave ──────────────────────────────────────────────────
  useEffect(() => {
    if (draftSaveTimeoutRef.current) clearTimeout(draftSaveTimeoutRef.current)
    setDraftSaveStatus('saving')
    draftSaveTimeoutRef.current = setTimeout(async () => {
      try {
        await fetch('/api/sell/draft', { method:'POST', body: JSON.stringify({ step:2, data:form }) })
        setDraftSaveStatus('saved')
        setTimeout(() => setDraftSaveStatus(null), 2000)
      } catch {}
    }, 1500)
    return () => { if (draftSaveTimeoutRef.current) clearTimeout(draftSaveTimeoutRef.current) }
  }, [form])

  const handleFormChange = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  const updateBrandSuggestions = (input: string) => {
    const n = input.toLowerCase()
    setBrandSuggestions(!n ? [] : SA_BIKE_BRANDS.filter(b => b.toLowerCase().startsWith(n)).slice(0, 10))
  }

  const handleImportUrl = async () => {
    if (!importUrl.trim()) return
    setImporting(true)
    try {
      const res = await fetch('/api/sell/import', { method:'POST', body: JSON.stringify({ url: importUrl }) })
      const data = await res.json()
      if (data.title) setForm(f => ({ ...f, title: data.title, description: data.description || f.description }))
    } catch {}
    setImporting(false)
  }

  const handleContinue = () => {
    localStorage.setItem('crankmart-sell-draft', JSON.stringify(form))
    localStorage.setItem('crankmart-sell-category', category)
    router.push('/sell/step-3')
  }

  return (
    <div style={{ background:'#f5f5f5', minHeight:'100vh', paddingBottom:100 }}>
      <style>{`
        * { box-sizing:border-box; }
        .sell-wrap { max-width:640px; margin:0 auto; padding:0 0 40px; }
        @media(min-width:768px) { .sell-wrap { padding:24px 0 40px; } }
        .progress-bar { background:#fff; border-bottom:1px solid #ebebeb; padding:0 20px; }
        .progress-inner { max-width:640px; margin:0 auto; display:flex; align-items:center; height:52px; gap:0; }
        .step-dot { display:flex; align-items:center; gap:8px; flex:1; }
        .step-dot:last-child { flex:0; }
        .dot { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; }
        .dot.done { background:var(--color-primary); color:#fff; }
        .dot.active { background:var(--color-primary); color:#fff; box-shadow:0 0 0 3px #E9ECF5; }
        .dot.todo { background:#f0f0f0; color:#9a9a9a; }
        .step-label { font-size:12px; font-weight:600; }
        .step-line { flex:1; height:2px; background:#ebebeb; }
        .step-line.done { background:var(--color-primary); }
        .sell-topbar { background:#fff; border-bottom:1px solid #ebebeb; padding:12px 20px; display:flex; align-items:center; gap:12px; }
        .sell-card { background:#fff; margin:0; padding:20px; }
        @media(min-width:768px) { .sell-card { border-radius:2px; margin-bottom:12px; } }
        .form-group { margin-bottom:14px; }
        .form-label { display:block; font-size:12px; font-weight:600; color:#1a1a1a; margin-bottom:6px; }
        .form-input { width:100%; padding:10px 12px; border:1px solid #ebebeb; border-radius:2px; font-size:14px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
        .form-input:focus { outline:none; border-color:var(--color-primary); background:#f8f9ff; }
        .input-group { position:relative; }
        .brand-dropdown { position:absolute; top:100%; left:0; right:0; background:#fff; border:1px solid #ebebeb; border-top:none; border-radius:0 0 8px 8px; max-height:200px; overflow-y:auto; z-index:10; }
        .brand-option { padding:10px 12px; cursor:pointer; font-size:13px; }
        .brand-option:hover { background:#f5f5f5; }
        .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .radio-group { display:grid; grid-template-columns:repeat(auto-fit,minmax(100px,1fr)); gap:8px; }
        .radio-btn { display:flex; align-items:center; gap:8px; cursor:pointer; padding:10px 12px; border:1px solid #ebebeb; border-radius:2px; font-size:13px; }
        .radio-btn:hover { border-color:var(--color-primary); background:#f8f9ff; }
        .radio-btn.selected { background:var(--color-primary); color:#fff; border-color:var(--color-primary); }
        .textarea { width:100%; padding:10px 12px; border:1px solid #ebebeb; border-radius:2px; font-size:13px; resize:vertical; min-height:80px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
        .textarea:focus { outline:none; border-color:var(--color-primary); }
        .import-section { margin-bottom:20px; padding-bottom:20px; border-bottom:1px solid #ebebeb; }
        .import-input-group { display:flex; gap:8px; margin-bottom:6px; }
        .import-input { flex:1; padding:10px 12px; border:1px solid #ebebeb; border-radius:2px; font-size:13px; }
        .import-btn { padding:10px 16px; background:var(--color-primary); color:#fff; border:none; border-radius:2px; font-size:13px; font-weight:600; cursor:pointer; white-space:nowrap; }
        .import-btn:disabled { opacity:.5; cursor:not-allowed; }
        .divider { height:1px; background:#f0f0f0; margin:16px 0; }
        .more-toggle { display:flex; align-items:center; justify-content:space-between; width:100%; padding:11px 14px; border:1px solid #e4e4e7; border-radius:2px; background:#fff; cursor:pointer; font-size:13px; font-weight:600; color:var(--color-primary); margin-bottom:14px; }
        .more-toggle:hover { border-color:var(--color-primary); background:#f8f9ff; }
        .sell-footer { position:fixed; bottom:60px; left:0; right:0; background:#fff; border-top:1px solid #ebebeb; padding:12px 20px; z-index:40; }
        @media(min-width:768px) { .sell-footer { bottom:0; } }
        .btn-next { width:100%; height:50px; background:var(--color-primary); color:#fff; border:none; border-radius:2px; font-size:15px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; }
        .btn-next:hover { background:#1e2d5a; }
        .btn-next:disabled { opacity:.4; cursor:not-allowed; }
        .draft-status { position:fixed; top:60px; right:20px; font-size:12px; color:#9a9a9a; z-index:30; transition:opacity .3s; }
      `}</style>

      <div className="draft-status" style={{ opacity: draftSaveStatus ? 1 : 0 }}>
        {draftSaveStatus === 'saving' ? 'Saving…' : '✓ Draft saved'}
      </div>

      {/* Topbar */}
      <div className="sell-topbar">
        <button onClick={() => router.back()} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'#1a1a1a' }}>
          <ArrowLeft size={18} />
        </button>
        <span style={{ fontWeight:800, fontSize:16, color:'#1a1a1a' }}>Post a listing</span>
      </div>

      {/* Progress */}
      <div className="progress-bar">
        <div className="progress-inner">
          {STEPS.map((s, i) => (
            <div key={s} className="step-dot">
              <div className={`dot ${i < 1 ? 'done' : i === 1 ? 'active' : 'todo'}`}>{i + 1}</div>
              <span className="step-label" style={{ color: i <= 1 ? '#0D1B2A' : '#9a9a9a' }}>{s}</span>
              {i < STEPS.length - 1 && <div className={`step-line${i < 1 ? ' done' : ''}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="sell-wrap">
        <div className="sell-card">
          <h2 style={{ fontSize:18, fontWeight:800, color:'#1a1a1a', marginBottom:4 }}>Item details</h2>
          <p style={{ fontSize:13, color:'#9a9a9a', marginBottom:16 }}>Fill in what you can — nothing is required except title and condition.</p>

          {/* Import */}
          <div className="import-section">
            <div className="form-label">Quick import from URL (optional)</div>
            <div className="import-input-group">
              <input type="text" className="import-input" placeholder="Paste URL from another listing…" value={importUrl} onChange={e => setImportUrl(e.target.value)} />
              <button className="import-btn" disabled={importing} onClick={handleImportUrl}>{importing ? 'Loading…' : 'Import'}</button>
            </div>
            <div style={{ fontSize:11, color:'#9a9a9a' }}>Extracts title, price and description</div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" value={form.title} onChange={e => handleFormChange('title', e.target.value)} placeholder="e.g., Trek Slash 8 2023 Mint Condition" />
          </div>

          {/* Condition */}
          <div className="form-group">
            <label className="form-label">Condition *</label>
            <div className="radio-group">
              {CONDITIONS.map(c => (
                <label key={c.value} className={`radio-btn${form.condition === c.value ? ' selected' : ''}`}>
                  <input type="radio" name="condition" value={c.value} checked={form.condition === c.value} onChange={e => handleFormChange('condition', e.target.value)} />
                  {c.label}
                </label>
              ))}
            </div>
          </div>

          {/* ── BIKE / FRAME primary fields ── */}
          {hasBikeDetails && (
            <>
              <div className="divider" />

              {/* Brand autocomplete */}
              <div className="form-group">
                <label className="form-label">Brand</label>
                <div className="input-group">
                  <input className="form-input" value={form.bikeMake}
                    onChange={e => { handleFormChange('bikeMake', e.target.value); updateBrandSuggestions(e.target.value); setShowBrandDropdown(true) }}
                    onFocus={() => setShowBrandDropdown(true)}
                    placeholder="e.g., Trek, Specialized…" />
                  {showBrandDropdown && brandSuggestions.length > 0 && (
                    <div className="brand-dropdown">
                      {brandSuggestions.map(b => (
                        <div key={b} className="brand-option" onClick={() => { handleFormChange('bikeMake', b); setShowBrandDropdown(false) }}>{b}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid-2">
                <Txt label="Model" field="bikeModel" placeholder="e.g., Slash 8" form={form} onChange={handleFormChange} />
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <input className="form-input" type="number" value={form.bikeYear} onChange={e => handleFormChange('bikeYear', e.target.value)} placeholder="2024" />
                </div>
              </div>

              <div className="grid-2">
                <Sel label="Frame Size" field="frameSize" options={frameSizes} form={form} onChange={handleFormChange} />
                <Sel label="Frame Material" field="frameMaterial" options={FRAME_MATERIALS} form={form} onChange={handleFormChange} />
              </div>

              <div className="form-group">
                <label className="form-label">Frame Serial Number <span style={{ color:'#9a9a9a', fontWeight:400 }}>(recommended)</span></label>
                <input
                  className="form-input"
                  value={form.serialNumber}
                  onChange={e => handleFormChange('serialNumber', e.target.value)}
                  placeholder="Stamped under the bottom bracket"
                  autoComplete="off"
                />
                <div style={{ fontSize:11, color:'#9a9a9a', marginTop:4, lineHeight:1.5 }}>
                  Buyers can verify a serial isn&apos;t reported stolen via <a href="/check" target="_blank" rel="noreferrer" style={{ color:'#0D1B2A', fontWeight:600 }}>/check</a>. Listings with a serial number sell faster and build trust. We&apos;ll block the listing if this serial is registered as stolen.
                </div>
              </div>

              {(isMTB || isFrame) && (
                <Sel label="Wheel Size" field="wheelSize" options={wheelSizes} form={form} onChange={handleFormChange} />
              )}
              {isRoad && (
                <Sel label="Wheel Standard" field="wheelSize" options={WHEEL_SIZES_ROAD} form={form} onChange={handleFormChange} />
              )}

              {isEBike && (
                <Sel label="Motor Brand" field="motorBrand" options={MOTOR_BRANDS} form={form} onChange={handleFormChange} />
              )}

              {/* ── More details toggle ── */}
              <button type="button" className="more-toggle" onClick={() => setMoreOpen(p => !p)}>
                <span>{moreOpen ? '▲ Hide details' : '▼ More bike details'}</span>
                {!moreOpen && <span style={{ fontSize:11, color:'#9a9a9a' }}>Groupset, components, travel…</span>}
                {moreOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {moreOpen && (
                <div>
                  {/* MTB secondary */}
                  {isMTB && (
                    <>
                      <Sel label="Suspension Travel (Front)" field="suspensionTravel" options={TRAVEL_OPTIONS} form={form} onChange={handleFormChange} />
                      <Sel label="Groupset" field="groupset" options={MTB_GROUPSETS} form={form} onChange={handleFormChange} />
                      <Sel label="Drivetrain Speeds" field="drivetrainSpeeds" options={DT_SPEEDS} form={form} onChange={handleFormChange} />
                      <div className="grid-2">
                        <Txt label="Fork Brand" field="forkBrand" placeholder="e.g., Fox 36" form={form} onChange={handleFormChange} />
                        {isFullSus && <Txt label="Rear Shock Brand" field="rearShockBrand" placeholder="e.g., Fox Float X2" form={form} onChange={handleFormChange} />}
                      </div>
                    </>
                  )}

                  {/* Road secondary */}
                  {isRoad && (
                    <>
                      <Sel label="Groupset" field="groupset" options={ROAD_GROUPSETS} form={form} onChange={handleFormChange} />
                      <Sel label="Drivetrain Speeds" field="drivetrainSpeeds" options={DT_SPEEDS} form={form} onChange={handleFormChange} />
                    </>
                  )}

                  {/* eBike secondary */}
                  {isEBike && (
                    <>
                      <Sel label="Battery Capacity" field="batteryCapacity" options={BATTERY_SIZES} form={form} onChange={handleFormChange} />
                      <Txt label="Range (km, approximate)" field="ebikeRange" placeholder="e.g., 80km in Eco mode" form={form} onChange={handleFormChange} />
                    </>
                  )}

                  {/* Shared bike secondary — components */}
                  <div className="grid-2">
                    <Txt label="Brakes" field="brakeType" placeholder="e.g., SRAM Code RSC" form={form} onChange={handleFormChange} />
                    <Txt label="Shifters" field="shifters" placeholder="e.g., SRAM GX Eagle Trigger" form={form} onChange={handleFormChange} />
                  </div>
                  <div className="grid-2">
                    <Txt label="Crank" field="crank" placeholder="e.g., SRAM XX1 Eagle 170mm" form={form} onChange={handleFormChange} />
                    <Sel label="Chain" field="chain" options={CHAIN_BRANDS} form={form} onChange={handleFormChange} />
                  </div>
                  <div className="grid-2">
                    <Txt label="Cassette" field="cassette" placeholder="e.g., SRAM XG-1295 10-52t" form={form} onChange={handleFormChange} />
                    <Txt label="Wheels / Wheelset" field="wheels" placeholder="e.g., DT Swiss XM1700" form={form} onChange={handleFormChange} />
                  </div>
                  <div className="grid-2">
                    <Txt label="Tyres" field="tyres" placeholder="e.g., Maxxis Minion DHF 2.5" form={form} onChange={handleFormChange} />
                    <Txt label="Handlebar" field="handlebar" placeholder="e.g., Renthal Fatbar 800mm" form={form} onChange={handleFormChange} />
                  </div>
                  <div className="grid-2">
                    <Txt label="Stem" field="stem" placeholder="e.g., Renthal Apex 50mm" form={form} onChange={handleFormChange} />
                    <Txt label="Seatpost" field="seatpost" placeholder="e.g., Fox Transfer 150mm" form={form} onChange={handleFormChange} />
                  </div>
                  <div className="grid-2">
                    <Txt label="Saddle" field="saddle" placeholder="e.g., Fizik Terra Argo 142mm" form={form} onChange={handleFormChange} />
                    <Sel label="Pedal Type" field="pedalType" options={PEDAL_TYPE_OPTIONS} form={form} onChange={handleFormChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Extras included</label>
                    <textarea className="textarea" style={{ minHeight:60 }} value={form.extras} onChange={e => handleFormChange('extras', e.target.value)} placeholder="e.g., Spare tube, original box, Garmin mount, spare brake pads…" />
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── SUSPENSION PARTS ── */}
          {isSuspPart && (
            <>
              <div className="divider" />
              <div className="grid-2">
                <Sel label="Brand" field="suspBrand" options={SUSP_BRANDS} form={form} onChange={handleFormChange} />
                <Sel label="Travel" field="suspensionTravel" options={TRAVEL_OPTIONS} form={form} onChange={handleFormChange} />
              </div>
              <div className="grid-2">
                <Sel label="Wheel Size Compatibility" field="wheelSize" options={WHEEL_SIZES_MTB} form={form} onChange={handleFormChange} />
                <Sel label="Axle Standard" field="axleStandard" options={AXLE_STANDARDS} form={form} onChange={handleFormChange} />
              </div>
            </>
          )}

          {/* ── WHEELS ── */}
          {isWheel && (
            <>
              <div className="divider" />
              <div className="grid-2">
                <Sel label="Wheel Size" field="wheelSize" options={[...WHEEL_SIZES_MTB,...WHEEL_SIZES_ROAD]} form={form} onChange={handleFormChange} />
                <Sel label="Brake Standard" field="brakeStandard" options={BRAKE_STANDARDS} form={form} onChange={handleFormChange} />
              </div>
              <Sel label="Axle Standard" field="axleStandard" options={AXLE_STANDARDS} form={form} onChange={handleFormChange} />
            </>
          )}

          {/* ── DRIVETRAIN ── */}
          {isDrivetrain && (
            <>
              <div className="divider" />
              <div className="grid-2">
                <Sel label="Brand" field="drivetrainBrand" options={DT_BRANDS} form={form} onChange={handleFormChange} />
                <Sel label="Speeds" field="drivetrainSpeeds" options={DT_SPEEDS} form={form} onChange={handleFormChange} />
              </div>
            </>
          )}

          {/* ── APPAREL ── */}
          {isApparel && (
            <>
              <div className="divider" />
              <div className="grid-2">
                <Sel label="Size" field="apparelSize" options={APPAREL_SIZES} form={form} onChange={handleFormChange} />
                <Sel label="Gender" field="gender" options={GENDERS} form={form} onChange={handleFormChange} />
              </div>
            </>
          )}

          {/* ── KIDS BIKES ── */}
          {isKids && (
            <>
              <div className="divider" />
              <div className="grid-2">
                <Sel label="Wheel Size" field="kidsWheelSize" options={WHEEL_SIZES_KIDS} form={form} onChange={handleFormChange} />
                <Sel label="Recommended Age" field="kidsAge" options={KIDS_AGES} form={form} onChange={handleFormChange} />
              </div>
            </>
          )}

          {/* ── HELMET ── */}
          {isHelmet && (
            <>
              <div className="divider" />
              <Sel label="Size" field="helmetSize" options={HELMET_SIZES} form={form} onChange={handleFormChange} />
            </>
          )}

          {/* ── SHOES ── */}
          {isShoe && (
            <>
              <div className="divider" />
              <Sel label="Size (EU)" field="shoeSize" options={SHOE_SIZES} form={form} onChange={handleFormChange} />
            </>
          )}

          {/* ── GPS / COMPUTERS ── */}
          {isGPS && (
            <>
              <div className="divider" />
              <Sel label="Brand" field="gpsBrand" options={GPS_BRANDS} form={form} onChange={handleFormChange} />
            </>
          )}

          {/* ── Shared fields ── */}
          <div className="divider" />
          <Txt label="Colour" field="colour" placeholder="e.g., Gloss black with red accents" form={form} onChange={handleFormChange} />

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="textarea" value={form.description}
              onChange={e => handleFormChange('description', e.target.value)}
              placeholder="Service history, upgrades, any damage…" />
          </div>

          {form.condition === 'poor' && (
            <div className="form-group">
              <label className="form-label">Describe any damage</label>
              <textarea className="textarea" value={form.damageNotes}
                onChange={e => handleFormChange('damageNotes', e.target.value)}
                placeholder="Be honest about damage, cracks, rust, alignment issues…" />
            </div>
          )}
        </div>
      </div>

      <div className="sell-footer">
        <button className="btn-next" onClick={handleContinue} disabled={!form.title || !form.condition}>
          Continue <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

export default function Step2Page() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <Step2Content />
    </Suspense>
  )
}
