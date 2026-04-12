'use client'

import Link from 'next/link'

export default function StyleGuidePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      <style>{`
        * { box-sizing: border-box; }
        .sg-wrap { max-width: 1100px; margin: 0 auto; padding: 40px 24px 80px; }
        .sg-section { background: #fff; border: 1px solid #ebebeb; border-radius: 2px; margin-bottom: 32px; overflow: hidden; }
        .sg-section-hdr { padding: 16px 24px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: baseline; gap: 12px; }
        .sg-section-title { font-size: 13px; font-weight: 800; color: #1a1a1a; text-transform: uppercase; letter-spacing: .8px; margin: 0; }
        .sg-section-sub { font-size: 12px; color: #9a9a9a; font-weight: 400; }
        .sg-body { padding: 24px; }
        .sg-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; }
        .sg-row:last-child { margin-bottom: 0; }
        .sg-label { font-size: 11px; color: #9a9a9a; font-weight: 600; min-width: 120px; flex-shrink: 0; }
        .sg-code { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 11px; background: #f5f5f5; border: 1px solid #e4e4e7; padding: 2px 7px; border-radius: 2px; color: #374151; }
        .sg-divider { height: 1px; background: #f0f0f0; margin: 20px 0; }
        .sg-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .sg-grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        @media(max-width: 640px) { .sg-grid2 { grid-template-columns: 1fr; } .sg-grid3 { grid-template-columns: 1fr 1fr; } }

        /* Replicate site elements */
        .pill { flex-shrink:0; padding:7px 16px; border-radius:2px; border:1px solid #e4e4e7; background:#fff; font-size:13px; font-weight:500; color:#1a1a1a; cursor:pointer; white-space:nowrap; transition:all .12s; }
        .pill.active { background:var(--color-primary,#0D1B2A); color:#fff; border-color:var(--color-primary,#0D1B2A); font-weight:700; }
        .radius-pill { padding:5px 12px; border-radius:20px; font-size:11px; font-weight:600; border:1px solid #D1D5DB; background:#fff; color:#374151; cursor:pointer; }
        .radius-pill.active { background:#0D1B2A; border-color:#0D1B2A; color:#fff; }
        .stat-icon { color:#0D1B2A; }
        .tab-btn { display:flex; flex-direction:row; align-items:center; gap:6px; padding:12px 16px; border:none; background:none; cursor:pointer; font-size:13px; font-weight:600; color:#9CA3AF; border-bottom:2px solid transparent; margin-bottom:-1px; white-space:nowrap; }
        .tab-btn.active { color:#0D1B2A; border-bottom-color:#0D1B2A; }
        .card-tile { background:#fff; border:1px solid #ebebeb; border-radius:2px; overflow:hidden; transition: transform 0.2s, box-shadow 0.2s; }
        .card-tile:hover { transform:translateY(-4px); box-shadow:0 8px 16px rgba(0,0,0,0.1); }
        .tile-btn { display:flex; align-items:center; justify-content:center; gap:5px; width:100%; padding:9px; border-radius:2px; background:#0D1B2A; color:#fff; text-decoration:none; font-size:12px; font-weight:700; border:none; cursor:pointer; }
        .badge { display:inline-flex; align-items:center; padding:3px 8px; border-radius:2px; font-size:10px; font-weight:700; }
        .hero-search input { width:100%; height:52px; padding:0 52px 0 20px; border-radius:10px; border:2px solid rgba(255,255,255,0.25); font-size:15px; font-weight:500; outline:none; background:rgba(255,255,255,0.15); color:#fff; backdrop-filter:blur(4px); }
        .hero-search input::placeholder { color:rgba(255,255,255,0.55); }
        .cta-btn { display:flex; align-items:center; justify-content:center; gap:8px; width:100%; height:44px; border-radius:2px; font-size:14px; font-weight:700; text-decoration:none; cursor:pointer; border:none; }
        .filter-drawer-preview { border:1px solid #ebebeb; border-radius:2px; overflow:hidden; }
        .fdr-hdr { padding:16px 20px; border-bottom:1px solid #ebebeb; display:flex; align-items:center; justify-content:space-between; }
        .fdr-section { padding:14px 20px; border-bottom:1px solid #f0f0f0; }
        .fdr-label { font-size:11px; font-weight:700; color:#9a9a9a; text-transform:uppercase; letter-spacing:.8px; margin-bottom:10px; }
        .fdr-select { width:100%; padding:8px 10px; border-radius:2px; border:1px solid #e4e4e7; font-size:13px; }
        .fdr-ftr { padding:14px 20px; display:flex; gap:10px; }
        .fdr-apply { flex:2; height:44px; background:#1a1a1a; color:#fff; border:none; border-radius:2px; font-size:14px; font-weight:700; cursor:pointer; }
        .fdr-clear { flex:1; height:44px; background:#fff; color:#1a1a1a; border:1px solid #e4e4e7; border-radius:2px; font-size:14px; font-weight:600; cursor:pointer; }
        .info-row { display:flex; align-items:center; gap:10px; padding:10px 0; border-bottom:1px solid #f0f0f0; font-size:13px; }
        .info-row:last-child { border-bottom:none; }
        .chip { display:inline-flex; align-items:center; padding:5px 12px; border-radius:2px; font-size:12px; font-weight:700; }
      `}</style>

      {/* Page header */}
      <div style={{ background: 'linear-gradient(135deg, #1a2744, #0D1B2A)', padding: '40px 24px', marginBottom: 0 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <span style={{ color: '#93C5FD', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>CycleMart</span>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, margin: '8px 0 6px' }}>UI Element Guide</h1>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 14, margin: 0 }}>Naming reference for all layouts, components, and style tokens used across the site.</p>
        </div>
      </div>

      <div className="sg-wrap">

        {/* ── PAGES ── */}
        <div className="sg-section">
          <div className="sg-section-hdr">
            <h2 className="sg-section-title">Pages & Routes</h2>
            <span className="sg-section-sub">URL → file location → component name</span>
          </div>
          <div className="sg-body">
            {[
              { url: '/',               file: 'app/page.tsx → app/_home/HomePageFull.tsx',   name: 'Home Page' },
              { url: '/browse',         file: 'app/browse/page.tsx',                          name: 'Browse / Marketplace' },
              { url: '/browse/[slug]',  file: 'app/browse/[slug]/ListingDetail.tsx',           name: 'Listing Detail' },
              { url: '/routes',         file: 'app/routes/RoutesClient.tsx',                   name: 'Routes Page' },
              { url: '/routes/[slug]',  file: 'app/routes/[slug]/page.tsx',                    name: 'Route Detail' },
              { url: '/directory',      file: 'app/directory/page.tsx',                        name: 'Shops / Directory' },
              { url: '/directory/[slug]',file:'app/directory/[slug]/BusinessDetail.tsx',       name: 'Shop Detail' },
              { url: '/events',         file: 'app/events/page.tsx + EventsClient.tsx',        name: 'Events Page' },
              { url: '/events/[slug]',  file: 'app/events/[slug]/EventDetail.tsx',             name: 'Event Detail' },
              { url: '/news',           file: 'app/news/page.tsx + NewsClient.tsx',            name: 'News Page' },
              { url: '/news/[slug]',    file: 'app/news/[slug]/ArticleDetail.tsx',             name: 'Article Detail' },
              { url: '/sell/*',         file: 'app/sell/step-1…4, success',                    name: 'Sell Wizard (4 steps)' },
              { url: '/account',        file: 'app/account/page.tsx',                          name: 'My Account' },
              { url: '/seller/[id]',    file: 'app/seller/[id]/page.tsx',                      name: 'Seller Profile' },
              { url: '/search',         file: 'app/search/page.tsx',                           name: 'Search Results' },
              { url: '/admin/*',        file: 'app/admin/**',                                  name: 'Admin Panel' },
            ].map((p, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 1fr', gap: 12, padding: '9px 0', borderBottom: '1px solid #f0f0f0', alignItems: 'center', fontSize: 13 }}>
                <code className="sg-code">{p.url}</code>
                <span style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: 11 }}>{p.file}</span>
                <span style={{ fontWeight: 700, color: '#1a1a1a' }}>{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── LAYOUT ZONES ── */}
        <div className="sg-section">
          <div className="sg-section-hdr">
            <h2 className="sg-section-title">Page Layout Zones</h2>
            <span className="sg-section-sub">Every content page is divided into these named zones</span>
          </div>
          <div className="sg-body">
            <div style={{ border: '2px dashed #e4e4e7', borderRadius: 2, overflow: 'hidden', fontSize: 12 }}>
              <div style={{ background: 'linear-gradient(135deg,#1a2744,#0D1B2A)', color: '#fff', padding: '20px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: '#93C5FD', marginBottom: 6 }}>EYEBROW LABEL  <span className="sg-code" style={{ color: '#fff', background: 'rgba(255,255,255,.15)', border: 'none' }}>icon + category text</span></div>
                <div style={{ fontSize: 20, fontWeight: 900 }}>Page Title</div>
                <div style={{ fontSize: 13, opacity: .7, marginTop: 4 }}>Subtitle / description</div>
                <div style={{ marginTop: 16, background: 'rgba(255,255,255,.15)', borderRadius: 10, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: 400, margin: '16px auto 0', fontSize: 12, opacity: .7 }}>🔍 Hero Search Bar  (border-radius: 10px)</div>
                <div style={{ marginTop: 6, fontSize: 10, color: '#93C5FD', textTransform: 'uppercase', letterSpacing: '.08em' }}>HERO</div>
              </div>
              <div style={{ background: '#fff', borderBottom: '1px solid #ebebeb', padding: '10px 24px', display: 'flex', gap: 16, alignItems: 'center', fontSize: 12, color: '#6b7280' }}>
                <span>📊 Count</span><span>·</span><span>📍 9 Provinces</span><span>·</span><span>🏆 All Levels</span><span>·</span><span>🗂 All Types</span>
                <span style={{ marginLeft: 'auto', fontSize: 10, color: '#93C5FD', textTransform: 'uppercase', letterSpacing: '.08em' }}>STATS BAR</span>
              </div>
              <div style={{ background: '#fff', borderBottom: '1px solid #ebebeb', padding: '0 24px', display: 'flex', gap: 0, fontSize: 12 }}>
                {['List', 'Map', 'Filters', 'Near Me →'].map((t, i) => (
                  <div key={i} style={{ padding: '12px 14px', borderBottom: i === 0 ? '2px solid #0D1B2A' : '2px solid transparent', color: i === 0 ? '#0D1B2A' : '#9CA3AF', fontWeight: 600 }}>{t}</div>
                ))}
                <span style={{ marginLeft: 'auto', fontSize: 10, color: '#93C5FD', textTransform: 'uppercase', letterSpacing: '.08em', alignSelf: 'center' }}>TAB BAR (sticky)</span>
              </div>
              <div style={{ background: '#fafafa', padding: '24px', minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ width: 160, height: 80, background: '#fff', border: '1px solid #ebebeb', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#9a9a9a' }}>Tile Card</div>
                ))}
                <span style={{ fontSize: 10, color: '#93C5FD', textTransform: 'uppercase', letterSpacing: '.08em' }}>CONTENT GRID</span>
              </div>
              <div style={{ background: '#0D1B2A', padding: '20px 24px', textAlign: 'center', color: 'rgba(255,255,255,.4)', fontSize: 11 }}>
                CTA STRIP / FOOTER
              </div>
            </div>
          </div>
        </div>

        {/* ── COLOUR TOKENS ── */}
        <div className="sg-section">
          <div className="sg-section-hdr">
            <h2 className="sg-section-title">Colour Tokens</h2>
            <span className="sg-section-sub">globals.css — use var() in CSS, Tailwind class in JSX</span>
          </div>
          <div className="sg-body">
            <div className="sg-grid3">
              {[
                { name: '--color-primary',       hex: '#EA580C', label: 'Primary (CycleMart orange)' },
                { name: '--color-night-ride',     hex: '#0D1B2A', label: 'Night Ride (dark navy)' },
                { name: '--color-ink',            hex: '#1a1a1a', label: 'Ink (body text)' },
                { name: '--color-muted',          hex: '#9a9a9a', label: 'Muted (secondary text)' },
                { name: '--color-border',         hex: '#ebebeb', label: 'Border' },
                { name: '--color-background',     hex: '#f5f5f5', label: 'Page Background' },
                { name: '--color-surface',        hex: '#ffffff', label: 'Card Surface' },
                { name: '--color-success',        hex: '#10B981', label: 'Success' },
                { name: '--color-warning',        hex: '#F59E0B', label: 'Warning' },
                { name: '--color-destructive',    hex: '#EF4444', label: 'Destructive / Error' },
                { name: '--color-primary-ghost',  hex: '#E9ECF5', label: 'Ghost / Highlight tint' },
                { name: 'hero blue accent',       hex: '#93C5FD', label: 'Hero eyebrow / accent text' },
              ].map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 2, background: c.hex, border: '1px solid #e4e4e7', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#374151', fontWeight: 600 }}>{c.hex}</div>
                    <div style={{ fontSize: 11, color: '#9a9a9a' }}>{c.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TYPOGRAPHY ── */}
        <div className="sg-section">
          <div className="sg-section-hdr">
            <h2 className="sg-section-title">Typography Scale</h2>
            <span className="sg-section-sub">Font: Inter — all weights 400–900</span>
          </div>
          <div className="sg-body">
            {[
              { label: 'Page H1',        style: { fontSize: 28, fontWeight: 900, color: '#1a1a1a' },        usage: 'Hero titles — clamp(24px, 4vw, 36px)' },
              { label: 'Section H2',     style: { fontSize: 17, fontWeight: 800, color: '#1a1a1a' },        usage: 'Card headers, section titles' },
              { label: 'Card H3',        style: { fontSize: 15, fontWeight: 800, color: '#1a1a1a' },        usage: 'Card sub-headers' },
              { label: 'Tile Title',     style: { fontSize: 14, fontWeight: 700, color: '#0D1B2A' },        usage: 'Listing/route/event tile names' },
              { label: 'Body',           style: { fontSize: 14, fontWeight: 400, color: '#374151' },        usage: 'Descriptions, paragraphs' },
              { label: 'Label / Meta',   style: { fontSize: 13, fontWeight: 500, color: '#6b7280' },        usage: 'Location, category, metadata' },
              { label: 'Small / Chip',   style: { fontSize: 12, fontWeight: 600, color: '#4B5563' },        usage: 'Tags, chips, filters' },
              { label: 'Eyebrow',        style: { fontSize: 12, fontWeight: 700, color: '#93C5FD', textTransform: 'uppercase' as const, letterSpacing: '.07em' }, usage: 'Hero category label above H1' },
              { label: 'Micro / Badge',  style: { fontSize: 10, fontWeight: 700, color: '#059669' },        usage: 'Badges, counts, tags on images' },
              { label: 'Section Label',  style: { fontSize: 11, fontWeight: 700, color: '#9a9a9a', textTransform: 'uppercase' as const, letterSpacing: '.8px' }, usage: 'Filter panel section headings' },
            ].map((t, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 1fr', gap: 16, padding: '10px 0', borderBottom: '1px solid #f0f0f0', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#9a9a9a', fontWeight: 600 }}>{t.label}</span>
                <span style={t.style}>The quick brown fox</span>
                <span style={{ fontSize: 11, color: '#9a9a9a' }}>{t.usage}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── PILLS & BUTTONS ── */}
        <div className="sg-section">
          <div className="sg-section-hdr">
            <h2 className="sg-section-title">Pills & Buttons</h2>
            <span className="sg-section-sub">border-radius: 2px · border: 1px solid #e4e4e7 · font-size: 13px</span>
          </div>
          <div className="sg-body">
            <div className="sg-row">
              <span className="sg-label">Category Pill</span>
              <button className="pill">All</button>
              <button className="pill">Road</button>
              <button className="pill active">MTB</button>
              <button className="pill">Gravel</button>
              <code className="sg-code">.pill / .pill.active — padding: 7px 16px</code>
            </div>
            <div className="sg-divider" />
            <div className="sg-row">
              <span className="sg-label">Near Me Radius Pill</span>
              <button className="radius-pill">10 km</button>
              <button className="radius-pill active">25 km</button>
              <button className="radius-pill">50 km</button>
              <code className="sg-code">.radius-pill — border-radius: 20px · padding: 5px 12px · font-size: 11px</code>
            </div>
            <div className="sg-divider" />
            <div className="sg-row">
              <span className="sg-label">Tile CTA Button</span>
              <button className="tile-btn" style={{ width: 160 }}>View Route ›</button>
              <code className="sg-code">.tile-btn — full width · padding: 9px · font-size: 12px · font-weight: 700</code>
            </div>
            <div className="sg-divider" />
            <div className="sg-row">
              <span className="sg-label">CTA (Sidebar)</span>
              <a className="cta-btn" style={{ background: '#0D1B2A', color: '#fff', width: 180 }}>Visit Website</a>
              <a className="cta-btn" style={{ background: '#25D366', color: '#fff', width: 140 }}>WhatsApp</a>
              <a className="cta-btn" style={{ background: '#fff', color: '#0D1B2A', border: '1px solid #0D1B2A', width: 140 }}>Send Email</a>
              <code className="sg-code">.cta-btn — height: 44px · full width</code>
            </div>
            <div className="sg-divider" />
            <div className="sg-row">
              <span className="sg-label">Badges</span>
              <span className="badge" style={{ background: '#ECFDF5', color: '#059669' }}>✓ Verified</span>
              <span className="badge" style={{ background: '#FEF9C3', color: '#854D0E' }}>⭐ Featured</span>
              <span className="badge" style={{ background: '#0D1B2A', color: '#fff' }}>NEW</span>
              <span className="badge" style={{ background: '#E9ECF5', color: '#0D1B2A' }}>NEG</span>
              <code className="sg-code">.badge — border-radius: 2px · font-size: 10–11px · font-weight: 700</code>
            </div>
          </div>
        </div>

        {/* ── TAB BAR ── */}
        <div className="sg-section">
          <div className="sg-section-hdr">
            <h2 className="sg-section-title">Tab Bar</h2>
            <span className="sg-section-sub">Sticky · position: sticky top: 0 · z-index: 50 — used on Browse, Routes, Events, Shops</span>
          </div>
          <div className="sg-body">
            <div style={{ borderBottom: '1px solid #ebebeb', display: 'flex', marginBottom: 16 }}>
              <button className="tab-btn active">⊞ List</button>
              <button className="tab-btn">🗺 Map</button>
              <button className="tab-btn">⇔ Filters (2)</button>
              <button className="tab-btn" style={{ marginLeft: 'auto', color: '#16A34A', borderBottomColor: '#16A34A' }}>◎ Near Me ✕</button>
            </div>
            <p style={{ fontSize: 12, color: '#9a9a9a', margin: 0 }}>
              <strong>CSS classes:</strong> <code className="sg-code">.tab-btn</code> <code className="sg-code">.tab-btn.active</code> — active tab gets bottom border 2px primary colour.<br/>
              Near Me active: <code className="sg-code">color: #16A34A</code>. Filters with active filters: <code className="sg-code">color: #0D1B2A</code> (no underline, just dark text).
            </p>
          </div>
        </div>

        {/* ── FILTER DRAWER ── */}
        <div className="sg-section">
          <div className="sg-section-hdr">
            <h2 className="sg-section-title">Filter Drawer</h2>
            <span className="sg-section-sub">Bottom sheet on mobile · Right panel on desktop (400px) · Opens from Filters tab</span>
          </div>
          <div className="sg-body">
            <div className="filter-drawer-preview" style={{ maxWidth: 380 }}>
              <div className="fdr-hdr">
                <span style={{ fontSize: 15, fontWeight: 800 }}>Filters</span>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
              </div>
              <div className="fdr-section">
                <div className="fdr-label">Category / Type</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="pill active">All</button>
                  <button className="pill">Road</button>
                  <button className="pill">MTB</button>
                  <button className="pill">Gravel</button>
                </div>
              </div>
              <div className="fdr-section">
                <div className="fdr-label">Province</div>
                <select className="fdr-select"><option>All Provinces</option></select>
              </div>
              <div className="fdr-section" style={{ borderBottom: 'none' }}>
                <div className="fdr-label">City</div>
                <select className="fdr-select"><option>All Cities</option></select>
              </div>
              <div className="fdr-ftr">
                <button className="fdr-clear">Clear all</button>
                <button className="fdr-apply">Show Results</button>
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#9a9a9a', margin: '16px 0 0' }}>
              CSS classes: <code className="sg-code">.foverlay</code> (backdrop) · <code className="sg-code">.fdrawer</code> · <code className="sg-code">.fdrawer.open</code> · <code className="sg-code">.fdr-hdr</code> · <code className="sg-code">.fdr-body</code> · <code className="sg-code">.fdr-ftr</code> · <code className="sg-code">.btn-apply</code> · <code className="sg-code">.btn-clear</code>
            </p>
          </div>
        </div>

        {/* ── TILE CARD ── */}
        <div className="sg-section">
          <div className="sg-section-hdr">
            <h2 className="sg-section-title">Tile Card</h2>
            <span className="sg-section-sub">Used in Browse, Routes, Events, Shops listing grids</span>
          </div>
          <div className="sg-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 16, marginBottom: 20 }}>
              <div className="card-tile">
                <div style={{ height: 120, background: 'linear-gradient(135deg,#1a2744,#3D50A0)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 32 }}>🖼</span>
                  <span style={{ position: 'absolute', top: 8, left: 8, background: '#3B82F6', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 2 }}>ROAD</span>
                  <span style={{ position: 'absolute', top: 8, right: 8, background: '#fff', color: '#16A34A', border: '1px solid #16A34A', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 2 }}>Beginner</span>
                </div>
                <div style={{ padding: 14 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#0D1B2A', margin: '0 0 3px' }}>Tile Title</p>
                  <p style={{ fontSize: 11, color: '#9CA3AF', margin: '0 0 10px' }}>📍 City, Province</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 12 }}>
                    {['Dist', 'Elev', 'Time'].map((s, i) => (
                      <div key={i} style={{ background: '#f9f9f9', borderRadius: 2, padding: '6px', textAlign: 'center' }}>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>–</div>
                        <div style={{ fontSize: 9, color: '#9CA3AF', textTransform: 'uppercase' }}>{s}</div>
                      </div>
                    ))}
                  </div>
                  <button className="tile-btn">View Route ›</button>
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.8 }}>
              <strong>Anatomy:</strong><br/>
              <code className="sg-code">Hero Image</code> — 120–160px height, objectFit: cover<br/>
              <code className="sg-code">Discipline Badge</code> — top-left, coloured bg, border-radius: 2px<br/>
              <code className="sg-code">Difficulty Badge</code> — top-right, white bg, coloured border<br/>
              <code className="sg-code">Distance Badge</code> — bottom-left (Near Me only), dark semi-transparent<br/>
              <code className="sg-code">Tile Body</code> — padding: 14px<br/>
              <code className="sg-code">Stat Grid</code> — 3-col, background: #f9f9f9, border-radius: 2px<br/>
              <code className="sg-code">Tile CTA Button</code> — full width, primary bg, font-size: 12px, font-weight: 700<br/>
              <code className="sg-code">Hover</code> — translateY(-4px) + box-shadow: 0 8px 16px rgba(0,0,0,.1)
            </div>
          </div>
        </div>

        {/* ── HERO ── */}
        <div className="sg-section">
          <div className="sg-section-hdr">
            <h2 className="sg-section-title">Hero Section</h2>
            <span className="sg-section-sub">Dark gradient banner at top of every page</span>
          </div>
          <div className="sg-body">
            <div style={{ background: 'linear-gradient(135deg,#1a2744,#0D1B2A)', padding: '36px 24px', borderRadius: 2, textAlign: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ color: '#93C5FD', fontSize: 14 }}>🚴</span>
                <span style={{ color: '#93C5FD', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em' }}>EYEBROW — Page Category</span>
              </div>
              <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 900, margin: '0 0 8px' }}>Page Title (H1)</h1>
              <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 14, margin: '0 0 20px' }}>Subtitle — one sentence description</p>
              <div style={{ position: 'relative', maxWidth: 400, margin: '0 auto' }}>
                <div className="hero-search"><input placeholder="Search…" readOnly /></div>
                <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.6)' }}>🔍</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.9 }}>
              <code className="sg-code">background</code>: linear-gradient(135deg, #1a2744, #0D1B2A)<br/>
              <code className="sg-code">Eyebrow</code>: icon + uppercase label, color: #93C5FD, font-size: 12px<br/>
              <code className="sg-code">H1</code>: clamp(24px, 4vw, 36px), font-weight: 900, color: #fff<br/>
              <code className="sg-code">Subtitle</code>: font-size: 15px, color: rgba(255,255,255,.7)<br/>
              <code className="sg-code">Search Input</code>: border-radius: 10px · frosted glass · height: 52px
            </div>
          </div>
        </div>

        {/* ── STATS BAR ── */}
        <div className="sg-section">
          <div className="sg-section-hdr">
            <h2 className="sg-section-title">Stats Bar</h2>
            <span className="sg-section-sub">Sits between Hero and Tab Bar — shows summary counts</span>
          </div>
          <div className="sg-body">
            <div style={{ background: '#fff', borderTop: '1px solid #ebebeb', borderBottom: '1px solid #ebebeb', padding: '0 0' }}>
              <div style={{ display: 'flex', gap: 0, padding: '0 4px', overflowX: 'auto' }}>
                {[
                  { icon: '🚴', label: '120 Routes', sub: 'Verified' },
                  { icon: '📍', label: '9 Provinces', sub: 'All covered' },
                  { icon: '📈', label: 'All Levels', sub: 'Beg → Expert' },
                  { icon: '⛰', label: 'Road · MTB · Gravel', sub: 'Every discipline' },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRight: i < 3 ? '1px solid #f0f0f0' : 'none' }}>
                    <span style={{ color: '#0D1B2A' }}>{s.icon}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{s.label}</div>
                      <div style={{ fontSize: 10, color: '#9CA3AF' }}>{s.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#9a9a9a', margin: '14px 0 0' }}>background: #fff · border-bottom: 1px solid #ebebeb · icon color: var(--color-primary) or night-ride</p>
          </div>
        </div>

        {/* ── DETAIL PAGE ── */}
        <div className="sg-section">
          <div className="sg-section-hdr">
            <h2 className="sg-section-title">Detail Page Layout</h2>
            <span className="sg-section-sub">Used on Shop Detail, Route Detail, Event Detail</span>
          </div>
          <div className="sg-body">
            <div style={{ border: '2px dashed #e4e4e7', borderRadius: 2, overflow: 'hidden', fontSize: 12 }}>
              <div style={{ background: 'linear-gradient(135deg,#1a2744,#0D1B2A)', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', color: 'rgba(255,255,255,.5)' }}>
                <span>← BACK BUTTON</span><span>BANNER IMAGE (220px)</span>
              </div>
              <div style={{ background: '#fff', borderBottom: '1px solid #ebebeb', padding: '12px 16px' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                  <div style={{ width: 60, height: 60, background: '#0D1B2A', borderRadius: 2, border: '3px solid #fff', marginTop: -24, flexShrink: 0 }} />
                </div>
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 900, color: '#1a1a1a' }}>Business / Route Name </span>
                  <span className="badge" style={{ background: '#ECFDF5', color: '#059669', marginLeft: 6 }}>✓ Verified</span>
                  <div style={{ fontSize: 11, color: '#9a9a9a', marginTop: 4 }}>Type · 📍 City, Province · ⭐ 4.5 (12) · 240 views</div>
                </div>
              </div>
              <div style={{ background: '#fafafa', borderBottom: '1px solid #ebebeb', padding: '8px 16px', display: 'flex', gap: 16, fontSize: 11, color: '#0D1B2A' }}>
                <span>📞 Phone</span><span>✉ Email</span><span>🌐 Website</span>
                <span style={{ marginLeft: 'auto', color: '#9a9a9a' }}>QUICK CONTACT STRIP</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 12, padding: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['About', 'Brands Stocked', 'Services', 'Location'].map(c => (
                    <div key={c} style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 2, padding: 12, fontSize: 11, color: '#6b7280' }}>
                      <strong style={{ color: '#1a1a1a' }}>{c}</strong> card
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 2, padding: 10, fontSize: 11, color: '#6b7280' }}>CTA BUTTONS<br/>(Website, WhatsApp, Email, Call)</div>
                  <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 2, padding: 10, fontSize: 11, color: '#6b7280' }}>DETAILS CARD<br/>(Type, Location, Est., Hours)</div>
                  <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 2, padding: 10, fontSize: 11, color: '#6b7280' }}>SOCIAL LINKS</div>
                </div>
              </div>
              <div style={{ padding: '12px 16px', borderTop: '1px solid #ebebeb', fontSize: 11, color: '#9a9a9a' }}>RELATED BUSINESSES — horizontal card grid</div>
            </div>
          </div>
        </div>

        {/* ── CARDS ── */}
        <div className="sg-section">
          <div className="sg-section-hdr">
            <h2 className="sg-section-title">Content Cards</h2>
            <span className="sg-section-sub">White cards used in detail pages and sidebar</span>
          </div>
          <div className="sg-body">
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 2, padding: 20, minWidth: 200 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1a1a1a', margin: '0 0 12px' }}>Card Title</h3>
                <p style={{ fontSize: 14, color: '#374151', margin: 0, lineHeight: 1.7 }}>Card body text content.</p>
              </div>
              <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 2, padding: 20, minWidth: 200 }}>
                <h3 style={{ fontSize: 11, fontWeight: 800, color: '#1a1a1a', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '.5px' }}>Details Card</h3>
                <div className="info-row"><span style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', width: 70 }}>Type</span><span style={{ fontSize: 13 }}>Bike Shop</span></div>
                <div className="info-row"><span style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', width: 70 }}>Location</span><span style={{ fontSize: 13 }}>Cape Town, WC</span></div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#9a9a9a', margin: '14px 0 0' }}>
              <code className="sg-code">.card</code>: background #fff · border: 1px solid #ebebeb · border-radius: 2px · padding: 20px<br/>
              <code className="sg-code">.info-row</code>: padding: 10px 0 · border-bottom: 1px solid #f0f0f0 · last-child no border
            </p>
          </div>
        </div>

        {/* ── NAMING CHEAT SHEET ── */}
        <div className="sg-section">
          <div className="sg-section-hdr">
            <h2 className="sg-section-title">Quick Naming Reference</h2>
            <span className="sg-section-sub">Use these names when requesting changes</span>
          </div>
          <div className="sg-body">
            <div className="sg-grid2">
              {[
                ['Hero', 'Dark gradient banner at top of page with title + search bar'],
                ['Eyebrow', 'Small icon + uppercase label above the H1 in the hero'],
                ['Stats Bar', 'Row of 4 stat items below the hero (count, provinces, etc.)'],
                ['Tab Bar', 'Sticky nav: List | Map | Filters | Near Me'],
                ['Filter Drawer', 'Slide-out panel with all filters (Category, Province, City, etc.)'],
                ['Category Pills', 'Row of filter buttons (All, Road, MTB, Gravel…) — 7px 16px, border-radius: 2px'],
                ['Radius Pills', 'Near Me distance buttons (10km, 25km…) — oval shape, border-radius: 20px'],
                ['Tile Card', 'Listing/route/shop/event card in the grid — hover lifts up'],
                ['Tile CTA Button', 'Full-width button at bottom of tile (View Route, View Profile, etc.)'],
                ['Content Grid', 'Auto-fill grid of tile cards — 1 col mobile, 2 col tablet, 3+ col desktop'],
                ['Banner', 'Cover image at top of detail pages (220px tall)'],
                ['Logo Block', 'Square logo pulled up over the banner in detail pages'],
                ['Quick Contact Strip', 'Slim bar below header with phone, email, website links'],
                ['CTA Buttons', 'Action buttons in sidebar (Visit Website, WhatsApp, Email, Call)'],
                ['Info Card', 'Sidebar card with Details / Social / Hours rows'],
                ['Related Section', 'Small cards below main content showing similar items'],
                ['Skeleton / Skel', 'Loading placeholder (pulsing grey block)'],
                ['Badge', 'Small label on tiles or headers (Verified, Featured, NEG, discipline)'],
                ['Chip', 'Inline tag for brands, services, tags'],
                ['CTA Strip', 'Dark full-width band at bottom of list pages ("Submit a Route", etc.)'],
              ].map(([name, desc], i) => (
                <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0D1B2A' }}>{name}</span>
                  <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>— {desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p style={{ fontSize: 12, color: '#9a9a9a', textAlign: 'center' }}>
          CycleMart UI Guide · <Link href="/" style={{ color: 'var(--color-primary,#EA580C)' }}>← Back to site</Link>
        </p>
      </div>
    </div>
  )
}
