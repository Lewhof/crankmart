'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Bike, Eye, EyeOff, Loader2, ArrowRight, Lock, Zap, MapPin, Calendar, Store, Shield } from 'lucide-react'

// ── Full home page (lazy-loaded for admins) ──────────────────────────────
import dynamic from 'next/dynamic'
const FullHomePage = dynamic(() => import('./_home/HomePageFull'), { ssr: false })

export default function RootPage() {
  const { status } = useSession()

  // Show full site to all users
  if (status === 'loading') return <LoadingScreen />
  return <FullHomePage />
}

// ── Loading screen ────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={28} style={{ color: '#818cf8', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ── Coming Soon Page ──────────────────────────────────────────────────────
function ComingSoonPage() {
  const [showLogin, setShowLogin] = useState(false)
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [showPw,    setShowPw]    = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const router = useRouter()

  // Slide counter for background
  const SLIDES = [
    { src: '/images/01-hero-mtb-karoo.jpg',       type: 'photo' },
    { src: '/images/hero-brand-banner.jpg',         type: 'banner' },
    { src: '/images/02-hero-chapmans-peak.jpg',    type: 'photo' },
    { src: '/images/06-hero-gravel-stellenbosch.jpg', type: 'photo' },
  ]
  const [slideIdx, setSlideIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setSlideIdx(i => (i + 1) % SLIDES.length), 5000)
    return () => clearInterval(t)
  }, [])

  // Countdown to launch date — 14 April 2026
  const LAUNCH_DATE = new Date('2026-04-14T00:00:00+02:00')
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 })
  useEffect(() => {
    const tick = () => {
      const diff = LAUNCH_DATE.getTime() - Date.now()
      if (diff <= 0) { setCountdown({ days: 0, hours: 0, mins: 0, secs: 0 }); return }
      setCountdown({
        days:  Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins:  Math.floor((diff % 3600000)  / 60000),
        secs:  Math.floor((diff % 60000)    / 1000),
      })
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', { email, password, redirect: false })
    if (res?.ok) {
      router.refresh()
    } else {
      setError('Invalid email or password.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: '#0a0f1e' }}>
      <style>{`
        @keyframes spin  { from{transform:rotate(0deg)}  to{transform:rotate(360deg)} }
        @keyframes fadeUp{ from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .cs-fade { animation: fadeUp .7s ease both; }
        .cs-delay-1 { animation-delay: .15s; }
        .cs-delay-2 { animation-delay: .3s; }
        .cs-delay-3 { animation-delay: .45s; }
        .cs-delay-4 { animation-delay: .6s; }
        .count-box { background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12); border-radius: 12px; padding: 14px 18px; min-width: 72px; text-align: center; backdrop-filter: blur(8px); }
        .count-num { font-size: 32px; font-weight: 900; color: #fff; line-height: 1; }
        .count-lbl { font-size: 10px; font-weight: 700; color: rgba(255,255,255,.5); text-transform: uppercase; letter-spacing: .08em; margin-top: 4px; }
        .feat-pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12); border-radius: 20px; font-size: 12px; font-weight: 600; color: rgba(255,255,255,.7); }
        .notify-input { width: 100%; height: 44px; padding: 0 14px; border-radius: 8px; border: 1.5px solid rgba(255,255,255,.2); background: rgba(255,255,255,.08); color: #fff; font-size: 14px; outline: none; box-sizing: border-box; backdrop-filter: blur(4px); }
        .notify-input::placeholder { color: rgba(255,255,255,.4); }
        .notify-input:focus { border-color: rgba(255,255,255,.5); }
        .login-card { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12); border-radius: 16px; padding: 28px 24px; backdrop-filter: blur(16px); max-width: 360px; width: 100%; }
        .pw-wrap { position: relative; }
        .pw-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: rgba(255,255,255,.5); cursor: pointer; padding: 0; }
      `}</style>

      {/* Background image slides */}
      {SLIDES.map((slide, i) => (
        <div key={i} style={{ position: 'absolute', inset: 0, transition: 'opacity 1s ease', opacity: slideIdx === i ? 1 : 0, zIndex: 0,
          background: slide.type === 'banner' ? '#0D1B2A' : undefined,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Image
            src={slide.src}
            alt=""
            fill
            unoptimized
            style={{ objectFit: slide.type === 'banner' ? 'contain' : 'cover' }}
          />
        </div>
      ))}
      {/* Dark overlay — hidden on brand banner slide */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,15,30,.92) 0%, rgba(10,15,30,.78) 100%)', zIndex: 1,
        opacity: SLIDES[slideIdx]?.type === 'banner' ? 0 : 1, transition: 'opacity 1s ease', pointerEvents: 'none' }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>

        {/* Logo */}
        <div className="cs-fade" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #273970, #4f6bc4)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bike size={24} style={{ color: '#fff' }} />
          </div>
          <span style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>CrankMart</span>
        </div>

        {/* Heading */}
        <div className="cs-fade cs-delay-1" style={{ marginBottom: 16 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,.2)', border: '1px solid rgba(99,102,241,.4)', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, color: '#a5b4fc', marginBottom: 16, letterSpacing: '.04em', textTransform: 'uppercase' }}>
            <span style={{ width: 6, height: 6, background: '#4ade80', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
            Coming Soon
          </div>
          <h1 style={{ fontSize: 'clamp(32px,6vw,64px)', fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.1, letterSpacing: '-1.5px' }}>
            South Africa's<br />
            <span style={{ background: 'linear-gradient(90deg,#818cf8,#a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Cycling Marketplace
            </span>
          </h1>
        </div>

        <p className="cs-fade cs-delay-2" style={{ fontSize: 16, color: 'rgba(255,255,255,.65)', maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.7 }}>
          Buy and sell bikes, gear &amp; parts. Discover routes, events, and local shops — all in one place built for SA cyclists.
        </p>

        {/* Feature pills */}
        <div className="cs-fade cs-delay-2" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
          {[
            { icon: <Zap size={12} />,      label: 'Free to list' },
            { icon: <MapPin size={12} />,   label: 'SA only' },
            { icon: <Calendar size={12} />, label: 'Events & routes' },
            { icon: <Store size={12} />,    label: 'Business directory' },
            { icon: <Shield size={12} />,   label: 'Trusted marketplace' },
          ].map(f => (
            <span key={f.label} className="feat-pill">{f.icon}{f.label}</span>
          ))}
        </div>

        {/* Countdown */}
        <div className="cs-fade cs-delay-3" style={{ marginBottom: 44 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14 }}>
            Launching 14 April 2026
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            {[
              { n: countdown.days,  l: 'Days' },
              { n: countdown.hours, l: 'Hours' },
              { n: countdown.mins,  l: 'Mins' },
              { n: countdown.secs,  l: 'Secs' },
            ].map(({ n, l }) => (
              <div key={l} className="count-box">
                <div className="count-num">{String(n).padStart(2, '0')}</div>
                <div className="count-lbl">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Login / notify toggle */}
        {!showLogin ? (
          <div className="cs-fade cs-delay-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%', maxWidth: 360 }}>
            <button
              onClick={() => setShowLogin(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', height: 48, background: '#fff', color: 'var(--color-primary)', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 800, cursor: 'pointer', justifyContent: 'center' }}>
              <Lock size={15} /> Admin Login
            </button>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>
              Are you a cyclist? We'll notify you at launch.
            </p>
            <form onSubmit={e => { e.preventDefault(); alert('Thanks! We\'ll notify you at launch.') }} style={{ display: 'flex', gap: 8, width: '100%' }}>
              <input type="email" placeholder="your@email.com" className="notify-input" style={{ flex: 1 }} required />
              <button type="submit" style={{ height: 44, padding: '0 16px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
                Notify Me <ArrowRight size={13} />
              </button>
            </form>
          </div>
        ) : (
          <div className="cs-fade login-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Admin Login</span>
              <button onClick={() => { setShowLogin(false); setError('') }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
            </div>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="notify-input"
              />
              <div className="pw-wrap">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="notify-input"
                  style={{ paddingRight: 40 }}
                />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(p => !p)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && <p style={{ fontSize: 12, color: '#f87171', margin: 0 }}>{error}</p>}
              <button type="submit" disabled={loading} style={{ height: 46, background: loading ? '#4b5563' : '#273970', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: loading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                {loading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Signing in…</> : 'Sign In →'}
              </button>
            </form>
          </div>
        )}

        {/* Footer */}
        <p style={{ position: 'absolute', bottom: 24, fontSize: 12, color: 'rgba(255,255,255,.2)' }}>
          © 2026 CrankMart · South Africa's cycling marketplace
        </p>
      </div>
    </div>
  )
}
