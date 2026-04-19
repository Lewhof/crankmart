"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { countryFromPath, getProvincesStatic } from "@/lib/regions-static";
import { getCountryConfig } from "@/lib/country-config";

const DirectoryMap = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div style={{ width: "100%", height: "100%", background: "#E9ECF5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#9CA3AF", fontSize: 13 }}>Loading map…</span>
    </div>
  ),
});

interface Business {
  id: string;
  name: string;
  slug: string;
  type: string;
  city: string;
  province: string;
  logo: string;
  cover?: string;
  description: string;
  brands?: string[];
  verified: boolean;
  featured: boolean;
  views: number;
  lat?: number | null;
  lng?: number | null;
  distance_from_user?: number | null;
}

interface DirectoryResponse {
  success: boolean;
  data: Business[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const BUSINESS_TYPES = [
  { value: "shop", label: "Bike Shops" },
  { value: "service_center", label: "Workshops" },
  { value: "brand", label: "Brands & Importers" },
  { value: "tour_operator", label: "Tours & Rentals" },
];

const CITIES_BY_PROVINCE: Record<string, Record<string, string[]>> = {
  za: {
    "Western Cape": ["Cape Town", "Stellenbosch", "George", "Paarl", "Worcester"],
    "Gauteng": ["Johannesburg", "Pretoria", "Midrand", "Sandton", "Centurion"],
    "KwaZulu-Natal": ["Durban", "Pietermaritzburg", "Ballito", "Richards Bay"],
    "Eastern Cape": ["Port Elizabeth", "East London", "Grahamstown"],
    "Free State": ["Bloemfontein", "Welkom"],
    "Limpopo": ["Polokwane", "Tzaneen"],
    "Mpumalanga": ["Nelspruit", "Witbank"],
    "Northern Cape": ["Kimberley", "Upington"],
    "North West": ["Rustenburg", "Klerksdorp"],
  },
  au: {
    "New South Wales":              ["Sydney", "Newcastle", "Wollongong", "Central Coast"],
    "Victoria":                     ["Melbourne", "Geelong", "Ballarat", "Bendigo"],
    "Queensland":                   ["Brisbane", "Gold Coast", "Sunshine Coast", "Cairns"],
    "Western Australia":            ["Perth", "Fremantle", "Mandurah"],
    "South Australia":              ["Adelaide"],
    "Tasmania":                     ["Hobart", "Launceston"],
    "Northern Territory":           ["Darwin", "Alice Springs"],
    "Australian Capital Territory": ["Canberra"],
  },
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function DirectoryPage() {
  const country = countryFromPath(usePathname());
  const cfg = getCountryConfig(country);
  const adj = country === 'au' ? 'AU' : 'SA';
  const PROVINCES = getProvincesStatic(country);
  const cityTable = CITIES_BY_PROVINCE[country] ?? {};
  const ALL_CITIES = [...new Set(Object.values(cityTable).flat())].sort();
  const [businesses,      setBusinesses]      = useState<Business[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [searchTerm,      setSearchTerm]      = useState("");
  const [selectedType,    setSelectedType]    = useState("");
  const [selectedProvince,setSelectedProvince]= useState("");
  const [selectedCity,    setSelectedCity]    = useState("");
  const [page,            setPage]            = useState(1);
  const [totalPages,      setTotalPages]      = useState(1);
  const [viewMode,        setViewMode]        = useState<"grid" | "map">("grid");

  // Near Me state
  const [userLat,    setUserLat]    = useState<number | null>(null);
  const [userLng,    setUserLng]    = useState<number | null>(null);
  const [nearMe,     setNearMe]     = useState(false);
  const [nearbyKm,   setNearbyKm]   = useState(50);
  const [locating,   setLocating]   = useState(false);
  const [locateError,setLocateError]= useState<string | null>(null);
  const [showFilters,setShowFilters]= useState(false);

  const RADIUS_OPTIONS = [10, 25, 50, 100, 200];

  const handleNearMe = () => {
    if (nearMe) { setNearMe(false); return; }
    if (!navigator.geolocation) { setLocateError("Geolocation not supported by your browser"); return; }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setNearMe(true);
        setLocating(false);
        setPage(1);
      },
      () => {
        setLocateError("Location access denied. Enable location in your browser settings.");
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const mappableBusinesses = businesses.filter(
    (b) => b.lat != null && b.lng != null && !isNaN(b.lat!) && !isNaN(b.lng!)
  );

  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedType) params.append("type", selectedType);
      if (selectedProvince) params.append("province", selectedProvince);
      if (selectedCity) params.append("city", selectedCity);
      if (nearMe && userLat !== null && userLng !== null) {
        params.append("lat", String(userLat));
        params.append("lng", String(userLng));
        params.append("nearbyKm", String(nearbyKm));
      }
      params.append("page", page.toString());
      params.append("limit", "200");

      const response = await fetch(`/api/directory?${params.toString()}`, { headers: { 'x-country': country } });
      const data: DirectoryResponse = await response.json();

      if (data.success) {
        setBusinesses(data.data);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      // Businesses fetch failed — loading state will clear to show empty list
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedType, selectedProvince, selectedCity, nearMe, userLat, userLng, nearbyKm, page]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedType, selectedProvince, selectedCity, nearMe, nearbyKm]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  // Inject ItemList schema when businesses are loaded
  useEffect(() => {
    if (loading || businesses.length === 0) return

    const pageTitle = selectedCity 
      ? `Cycling Businesses in ${selectedCity}`
      : selectedProvince
      ? `Cycling Businesses in ${selectedProvince}`
      : selectedType
      ? `${BUSINESS_TYPES.find(t => t.value === selectedType)?.label || 'Businesses'} in ${cfg.name}`
      : `Cycling Business Directory — ${cfg.name}`

    const itemListSchema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      '@id': `https://crankmart.com/directory#itemlist`,
      name: pageTitle,
      description: `Browse cycling businesses across ${cfg.name} on CrankMart`,
      numberOfItems: businesses.length,
      itemListElement: businesses.map((business, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://crankmart.com/directory/${business.slug}`,
        name: business.name,
        ...(business.description && { description: business.description }),
        ...(business.logo && { image: business.logo })
      }))
    }

    // Remove existing schema if present
    const existingScript = document.getElementById('item-list-schema')
    if (existingScript) existingScript.remove()

    // Inject schema into head
    const script = document.createElement('script')
    script.id = 'item-list-schema'
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(itemListSchema)
    document.head.appendChild(script)

    return () => {
      const s = document.getElementById('item-list-schema')
      if (s) s.remove()
    }
  }, [businesses, loading, selectedCity, selectedProvince, selectedType])

  const hasFilters = !!selectedType || !!selectedProvince || !!selectedCity || !!searchTerm;
  const filterCount = [!!selectedType, !!selectedProvince, !!selectedCity, !!searchTerm].filter(Boolean).length;
  const totalCount = businesses.length;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fafafa", overflowX: "clip", width: "100%" }}>

      <style>{`
        * { box-sizing: border-box; }
        /* Search */
        .dir-search-wrap { position: relative; max-width: 560px; width: 100%; margin: 0 auto; }
        .dir-search-wrap input { width: 100%; height: 52px; padding: 0 52px 0 20px; border-radius: 2px; border: 2px solid rgba(255,255,255,0.25); font-size: 15px; font-weight: 500; outline: none; box-sizing: border-box; background: rgba(255,255,255,0.15); color: #fff; backdrop-filter: blur(4px); transition: border-color .2s, background .2s; }
        .dir-search-wrap input::placeholder { color: rgba(255,255,255,0.55); }
        .dir-search-wrap input:focus { border-color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.22); }
        .dir-search-icon { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.6); pointer-events: none; }
        /* Stats bar */
        .dir-stats-bar { background:#fff; border-bottom:1px solid #ebebeb; }
        .dir-stats-inner { max-width:1280px; margin:0 auto; padding:0 20px; display:flex; gap:0; overflow-x:auto; scrollbar-width:none; }
        .dir-stats-inner::-webkit-scrollbar { display:none; }
        .dir-stat { display:flex; align-items:center; gap:8px; padding:11px 0; flex-shrink:0; padding-right:20px; margin-right:20px; border-right:1px solid #f0f0f0; }
        .dir-stat:last-child { border-right:none; padding-right:0; margin-right:0; }
        .dir-stat-icon { color:var(--color-primary); }
        .dir-stat-label { font-size:12px; font-weight:700; color:#1a1a1a; white-space:nowrap; }
        .dir-stat-sub { font-size:10px; color:#9CA3AF; white-space:nowrap; }
        /* Tab bar */
        /* Tab bar — matches Routes/Events style */
        .dir-breadcrumb-strip { background:#fff; border-bottom:1px solid #ebebeb; }
        .dir-breadcrumb-inner { max-width:1280px; margin:0 auto; padding:10px 16px; }
        @media(min-width:900px) { .dir-breadcrumb-inner { padding:10px 24px; } }
        .dir-tabbar { background:#fff; border-bottom:1px solid #ebebeb; position:sticky; top:60px; z-index:50; }
        .dir-nav-grid { max-width:1280px; margin:0 auto; padding:0 20px; display:grid; grid-template-columns:repeat(4,1fr); }
        @media(min-width:768px) { .dir-nav-grid { display:flex; align-items:stretch; } }
        .dir-nav-col { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; padding:10px 16px; border:none; background:none; cursor:pointer; font-size:12px; font-weight:600; color:#9CA3AF; border-bottom:2px solid transparent; margin-bottom:-1px; transition:color .15s; white-space:nowrap; }
        .dir-nav-col--active { color:#0D1B2A; border-bottom-color:#0D1B2A; }
        .dir-nav-col--filtered { color:#0D1B2A; }
        .dir-nearme-col { margin-left:auto; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; padding:10px 16px; border:none; background:none; cursor:pointer; font-size:12px; font-weight:600; color:#9CA3AF; border-bottom:2px solid transparent; margin-bottom:-1px; transition:color .15s; white-space:nowrap; }
        .dir-nearme-col--active { color:#16A34A; border-bottom-color:#16A34A; }
        .dir-pills-row { grid-column:1/-1; display:flex; gap:8px; flex-wrap:wrap; justify-content:center; align-items:center; padding:8px 16px 12px; border-top:1px solid #f0f0f0; }
        @media(min-width:768px) {
          .dir-nav-col { flex-direction:row; padding:14px 18px; font-size:13px; gap:6px; }
          .dir-nearme-col { flex-direction:row; padding:14px 18px; font-size:13px; gap:6px; }
          .dir-pills-row { grid-column:unset; border-top:none; padding:0 0 0 8px; justify-content:flex-start; flex-wrap:nowrap; }
        }
        .dir-radius-pill { padding:5px 12px; border-radius:20px; font-size:11px; font-weight:600; border:1px solid #D1D5DB; background:#fff; color:#374151; cursor:pointer; transition:all .15s; flex-shrink:0; }
        .dir-radius-pill--active { background:var(--color-primary); border-color:var(--color-primary); color:#fff; }
        /* Filter drawer — matches Routes style */
        .dir-foverlay { position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:500; opacity:0; pointer-events:none; transition:opacity .2s; }
        .dir-foverlay.open { opacity:1; pointer-events:all; }
        .dir-fdrawer { position:fixed; bottom:0; left:0; right:0; background:#fff; border-radius:20px 20px 0 0; z-index:501; transform:translateY(100%); transition:transform .25s cubic-bezier(.4,0,.2,1); max-height:90vh; display:flex; flex-direction:column; }
        .dir-fdrawer.open { transform:translateY(0); }
        @media(min-width:768px) {
          .dir-fdrawer { left:auto; right:0; top:0; bottom:0; width:400px; border-radius:0; transform:translateX(100%); max-height:100vh; }
          .dir-fdrawer.open { transform:translateX(0); }
        }
        .dir-fdr-hdr { padding:18px 20px 14px; border-bottom:1px solid #ebebeb; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
        .dir-fdr-body { flex:1; overflow-y:auto; }
        .dir-fdr-ftr { padding:14px 20px; border-top:1px solid #ebebeb; display:flex; gap:10px; flex-shrink:0; }
        .dir-btn-apply { flex:2; height:48px; background:#1a1a1a; color:#fff; border:none; border-radius:2px; font-size:15px; font-weight:700; cursor:pointer; }
        .dir-btn-clear { flex:1; height:48px; background:#fff; color:#1a1a1a; border:1px solid #e4e4e7; border-radius:2px; font-size:15px; font-weight:600; cursor:pointer; }
        .dir-fsection { padding:16px 20px; border-bottom:1px solid #f0f0f0; }
        /* Desktop sidebar */
        .dir-list-sidebar { display:none; width:220px; flex-shrink:0; position:sticky; top:57px; background:#fff; border:1px solid #ebebeb; border-radius:2px; overflow:hidden; align-self:start; }
        @media(min-width:768px) { .dir-list-sidebar { display:block; } }
        .dir-flabel { font-size:11px; font-weight:700; color:#9a9a9a; text-transform:uppercase; letter-spacing:.8px; margin-bottom:10px; }
        .dir-fpill { flex-shrink:0; padding:7px 16px; border-radius:2px; border:1px solid #e4e4e7; background:#fff; font-size:13px; font-weight:500; color:#1a1a1a; cursor:pointer; white-space:nowrap; transition:all .12s; }
        .dir-fpill.active { background:#1a1a1a; color:#fff; border-color:#1a1a1a; font-weight:700; }
        .dir-fselect { width:100%; padding:8px 10px; border-radius:2px; border:1px solid #e4e4e7; font-size:13px; color:#1a1a1a; background:#fff; cursor:pointer; }
        @keyframes dir-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #1a2744 0%, #0D1B2A 100%)", padding: "48px 20px 40px", textAlign: "center" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:12 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            <span style={{ color:"#93C5FD", fontSize:12, fontWeight:600, letterSpacing:"0.07em", textTransform:"uppercase" }}>{adj} Cycling Businesses</span>
          </div>
          <h1 style={{ color:"#fff", fontSize:"clamp(24px,4vw,36px)", fontWeight:800, lineHeight:1.2, margin:"0 0 10px" }}>
            Find {adj} Cycling Businesses
          </h1>
          <p style={{ color:"rgba(255,255,255,0.7)", fontSize:15, margin:"0 0 24px", lineHeight:1.6 }}>
            Discover bike shops, mechanics, brands, coaches, and more across {cfg.name}
          </p>
          <div className="dir-search-wrap">
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="dir-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="dir-stats-bar">
        <div className="dir-stats-inner">
          {[
            { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>, label: `${totalCount || 0} Businesses`, sub: "Verified" },
            { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, label: "9 Provinces", sub: "All covered" },
            { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>, label: "5 Categories", sub: "All types" },
            { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>, label: "Shops · Service · Tours", sub: "Every type" },
          ].map((s, i) => (
            <div key={i} className="dir-stat">
              <span className="dir-stat-icon">{s.icon}</span>
              <div>
                <div className="dir-stat-label">{s.label}</div>
                <div className="dir-stat-sub">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky tab bar */}
      <div className="dir-tabbar">
        <div className="dir-nav-grid">
          {/* List */}
          <button onClick={() => setViewMode("grid")} className={`dir-nav-col${viewMode === "grid" ? " dir-nav-col--active" : ""}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span>List</span>
          </button>
          {/* Map */}
          <button onClick={() => setViewMode("map")} className={`dir-nav-col${viewMode === "map" ? " dir-nav-col--active" : ""}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
            <span>Map</span>
          </button>
          {/* Filters */}
          <button onClick={() => setShowFilters(true)} className={`dir-nav-col${hasFilters ? " dir-nav-col--filtered" : ""}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
            <span>Filters{hasFilters ? ` (${filterCount})` : ""}</span>
          </button>
          {/* Near Me */}
          <button onClick={handleNearMe} disabled={locating} className={`dir-nearme-col${nearMe ? " dir-nearme-col--active" : ""}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: locating ? "dir-spin 1s linear infinite" : "none", flexShrink: 0 }}><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
            <span>{locating ? "Locating…" : nearMe ? "Near Me ✕" : "Near Me"}</span>
          </button>
          {/* Radius pills when Near Me active */}
          {nearMe && (
            <div className="dir-pills-row">
              {RADIUS_OPTIONS.map(r => (
                <button key={r} onClick={() => { setNearbyKm(r); setPage(1); }} className={`dir-radius-pill${nearbyKm === r ? " dir-radius-pill--active" : ""}`}>{r} km</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter drawer */}
      <div className={`dir-foverlay${showFilters ? " open" : ""}`} onClick={() => setShowFilters(false)} />
      <div className={`dir-fdrawer${showFilters ? " open" : ""}`}>
        <div className="dir-fdr-hdr">
          <span style={{ fontSize:17, fontWeight:800, color:"#1a1a1a" }}>Filters</span>
          <button onClick={() => setShowFilters(false)} style={{ background:"none", border:"none", cursor:"pointer", color:"#1a1a1a", padding:4 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="dir-fdr-body">
          {/* Business Type — full-width rows with dot indicator */}
          <div className="dir-fsection">
            <div className="dir-flabel">Business Type</div>
            {[{ value: "", label: "All Types" }, ...BUSINESS_TYPES].map(t => {
              const active = selectedType === t.value;
              return (
                <button key={t.value} onClick={() => { setSelectedType(t.value); setPage(1); }} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"8px 10px", marginBottom:3, borderRadius:2, border: active ? "1px solid #0D1B2A" : "1px solid transparent", background: active ? "rgba(13,27,42,0.06)" : "transparent", cursor:"pointer", fontSize:13, fontWeight: active ? 700 : 500, color:"#1a1a1a", textAlign:"left" }}>
                  <span style={{ width:8, height:8, borderRadius:"50%", background: active ? "#0D1B2A" : "#D1D5DB", flexShrink:0 }} />
                  {t.label}
                </button>
              );
            })}
          </div>
          {/* Province */}
          <div className="dir-fsection">
            <div className="dir-flabel">Province</div>
            <select value={selectedProvince} onChange={e => { setSelectedProvince(e.target.value); setSelectedCity(""); setPage(1); }} style={{ width:"100%", padding:"8px 10px", borderRadius:2, border:"1px solid #e4e4e7", fontSize:13, color:"#1a1a1a", background:"#fff", cursor:"pointer" }}>
              <option value="">All Provinces</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          {/* City */}
          <div className="dir-fsection">
            <div className="dir-flabel">City</div>
            <select value={selectedCity} onChange={e => { setSelectedCity(e.target.value); setPage(1); }} style={{ width:"100%", padding:"8px 10px", borderRadius:2, border:"1px solid #e4e4e7", fontSize:13, color: selectedCity ? "#1a1a1a" : "#9CA3AF", background:"#fff", cursor:"pointer" }}>
              <option value="">{selectedProvince ? "All Cities in Province" : "All Cities"}</option>
              {(selectedProvince ? cityTable[selectedProvince] || [] : ALL_CITIES).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="dir-fdr-ftr">
          <button onClick={() => { setSelectedType(""); setSelectedProvince(""); setSelectedCity(""); setSearchTerm(""); setPage(1); }} className="dir-btn-clear">Clear all</button>
          <button onClick={() => setShowFilters(false)} className="dir-btn-apply">Show {totalCount} Businesses</button>
        </div>
      </div>

      {/* Location error */}
      {locateError && (
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"12px 20px 0" }}>
          <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:2, padding:"10px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:13, color:"#DC2626", fontWeight:600 }}>{locateError}</span>
            <button onClick={() => setLocateError(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"#DC2626" }}>✕</button>
          </div>
        </div>
      )}

      {/* Map View */}
      {viewMode === "map" && (
        <section style={{ padding: "0 20px 0 20px" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <div style={{ height: 560, borderRadius: 2, overflow: "hidden", border: "1px solid #e0e0e0", marginTop: 24, marginBottom: 24 }}>
              {mappableBusinesses.length > 0 ? (
                <DirectoryMap
                  businesses={mappableBusinesses.map(b => ({
                    id: b.id, slug: b.slug, name: b.name,
                    type: b.type, city: b.city,
                    lat: b.lat!, lng: b.lng!,
                    distance_from_user: b.distance_from_user ?? null,
                  }))}
                  userLat={userLat}
                  userLng={userLng}
                  nearbyKm={nearbyKm}
                  nearMeActive={nearMe}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
                  <p style={{ color: "#999", fontSize: 14 }}>No location data available for current results.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Businesses Grid */}
      <section style={{ padding: viewMode === "map" ? "0" : "0" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "20px 16px 40px", display: viewMode === "grid" ? "flex" : "block", gap: 24, alignItems: "start", boxSizing: "border-box" }}>

          {/* Desktop sidebar — grid view only */}
          {viewMode === "grid" && (
            <aside className="dir-list-sidebar">
              {/* Business Type */}
              <div style={{ padding:'16px 20px', borderBottom:'1px solid #f0f0f0' }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#9a9a9a', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:10 }}>Business Type</div>
                {[{ value:'', label:'All' }, ...BUSINESS_TYPES].map(t => {
                  const isActive = selectedType === t.value
                  return (
                    <button key={t.value} onClick={() => setSelectedType(t.value)} style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'8px 10px', marginBottom:3, borderRadius:2, border: isActive ? '1px solid #0D1B2A' : '1px solid transparent', background: isActive ? '#E9ECF5' : 'transparent', cursor:'pointer', fontSize:13, fontWeight: isActive ? 700 : 500, color:'#1a1a1a', textAlign:'left' }}>
                      <span style={{ width:8, height:8, borderRadius:'50%', background: isActive ? '#0D1B2A' : '#d1d5db', flexShrink:0 }} />
                      {t.label}
                    </button>
                  )
                })}
              </div>
              {/* Province */}
              <div style={{ padding:'16px 20px', borderBottom:'1px solid #f0f0f0' }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#9a9a9a', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:10 }}>Province</div>
                <select value={selectedProvince} onChange={e => { setSelectedProvince(e.target.value); setSelectedCity(""); }} style={{ width:'100%', padding:'8px 10px', borderRadius:2, border:'1px solid #e4e4e7', fontSize:13, color:'#1a1a1a', background:'#fff', cursor:'pointer' }}>
                  <option value="">All Provinces</option>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              {/* City */}
              <div style={{ padding:'16px 20px' }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#9a9a9a', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:10 }}>City</div>
                <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} style={{ width:'100%', padding:'8px 10px', borderRadius:2, border:'1px solid #e4e4e7', fontSize:13, color:'#1a1a1a', background:'#fff', cursor:'pointer' }}>
                  <option value="">{selectedProvince ? 'All Cities' : 'All Cities'}</option>
                  {(cityTable[selectedProvince] || ALL_CITIES).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </aside>
          )}

          {/* Main content */}
          <div style={{ flex:1, minWidth:0 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <p>Loading businesses...</p>
            </div>
          ) : businesses.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <p style={{ fontSize: "16px", color: "#666" }}>
                No businesses found. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: "16px",
                  marginBottom: "40px",
                }}
              >
                {businesses.map((business) => (
                  <Link key={business.id} href={`/directory/${business.slug}`}>
                    <div
                      style={{
                        backgroundColor: "white",
                        borderRadius: "2px",
                        overflow: "hidden",
                        border: "1px solid #e0e0e0",
                        cursor: "pointer",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                      }}
                    >
                      {/* Card image — cover if available, else logo centred on gradient, else initials */}
                      <div style={{ height: "140px", position: "relative", overflow: "hidden", flexShrink: 0,
                        background: business.cover
                          ? `url(${business.cover}) center/cover no-repeat`
                          : business.logo
                          ? 'linear-gradient(135deg, #1a2744 0%, #0D1B2A 100%)'
                          : 'linear-gradient(135deg, #1a2744 0%, #0D1B2A 100%)',
                      }}>
                        {/* Logo centred when no cover */}
                        {!business.cover && business.logo && (
                          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
                            <img src={business.logo} alt={business.name} style={{ maxHeight:80, maxWidth:140, objectFit:'contain', filter:'brightness(0) invert(1)', opacity:.85 }} />
                          </div>
                        )}
                        {/* Initials fallback */}
                        {!business.cover && !business.logo && (
                          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <span style={{ fontSize:36, fontWeight:900, color:'rgba(255,255,255,0.3)' }}>{getInitials(business.name)}</span>
                          </div>
                        )}
                        {/* Type badge */}
                        <span style={{ position:'absolute', top:8, left:8, background:'rgba(0,0,0,0.55)', color:'#fff', fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:2, textTransform:'uppercase' }}>
                          {BUSINESS_TYPES.find(t => t.value === business.type)?.label || business.type}
                        </span>
                        {business.verified && (
                          <span style={{ position:'absolute', top:8, right:8, background:'rgba(5,150,105,0.85)', color:'#fff', fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:2 }}>✓ Verified</span>
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ padding: "12px", flex: 1, display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                          <h3 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>
                            {business.name}
                          </h3>
                          {business.verified && (
                            <div
                              style={{
                                backgroundColor: "#0D1B2A",
                                color: "white",
                                padding: "2px 6px",
                                borderRadius: "2px",
                                fontSize: "11px",
                                fontWeight: "600",
                                whiteSpace: "nowrap",
                              }}
                            >
                              ✓ Verified
                            </div>
                          )}
                        </div>



                        <p style={{ fontSize: "14px", color: "#666", marginBottom: "12px", margin: 0 }}>
                          {business.city}, {business.province}
                        </p>

                        {business.description && (
                          <p
                            style={{
                              fontSize: "13px",
                              color: "#888",
                              marginBottom: "12px",
                              lineHeight: "1.4",
                              flexGrow: 1,
                            }}
                          >
                            {business.description.slice(0, 100)}...
                          </p>
                        )}

                        {business.brands && business.brands.length > 0 && (
                          <p style={{ fontSize: "12px", color: "#999", marginBottom: "12px", margin: 0 }}>
                            <strong>Brands:</strong> {business.brands.slice(0, 3).join(", ")}
                            {business.brands.length > 3 && ` +${business.brands.length - 3}`}
                          </p>
                        )}

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, width: "100%", padding: "9px", borderRadius: 2, background: "var(--color-primary)", color: "#fff", fontSize: 12, fontWeight: 700, marginTop: "auto", cursor: "pointer" }}>
                          View Profile <ChevronRight size={13} />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "32px" }}>
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "2px",
                      border: "1px solid #ccc",
                      backgroundColor: page === 1 ? "#f5f5f5" : "white",
                      cursor: page === 1 ? "not-allowed" : "pointer",
                      opacity: page === 1 ? 0.5 : 1,
                    }}
                  >
                    ← Previous
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        style={{
                          padding: "8px 12px",
                          borderRadius: "2px",
                          border: "1px solid #ccc",
                          backgroundColor: page === pageNum ? "#0D1B2A" : "white",
                          color: page === pageNum ? "white" : "black",
                          cursor: "pointer",
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "2px",
                      border: "1px solid #ccc",
                      backgroundColor: page === totalPages ? "#f5f5f5" : "white",
                      cursor: page === totalPages ? "not-allowed" : "pointer",
                      opacity: page === totalPages ? 0.5 : 1,
                    }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
          </div>{/* end flex main content */}
        </div>
      </section>
    </div>
  );
}
