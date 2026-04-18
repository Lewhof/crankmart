'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Search, Menu, X, User, LogOut, Package, Heart, ChevronDown, MessageCircle, Settings } from 'lucide-react'

const NAV_LINKS = [
  { href: '/browse',    label: 'Browse' },
  { href: '/community', label: 'Community' },
  { href: '/events',    label: 'Events' },
  { href: '/routes',    label: 'Routes' },
  { href: '/directory', label: 'Shops' },
  { href: '/news',      label: 'News' },
]

export function TopNav() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [drawerOpen, setDrawerOpen]     = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount]   = useState(0)

  const initials = session?.user?.name
    ?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  // Poll unread count every 30s when logged in
  useEffect(() => {
    if (!session?.user?.id) return
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch('/api/messages/unread-count')
        if (res.ok) {
          const data = await res.json()
          setUnreadCount(data.count ?? 0)
        }
      } catch (error) {
        console.error('Failed to fetch unread count:', error)
      }
    }
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [session?.user?.id])

  return (
    <>
      <style>{`
        .cm-nav-desktop { display: none; }
        .cm-nav-mobile  { display: flex; }
        .cm-hamburger   { display: flex; }
        @media (min-width: 768px) {
          .cm-nav-desktop { display: flex !important; }
          .cm-nav-mobile  { display: none !important; }
          .cm-hamburger   { display: none !important; }
        }
        .cm-drawer-overlay { position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:99;opacity:0;pointer-events:none;transition:opacity .2s; }
        .cm-drawer-overlay.open { opacity:1;pointer-events:all; }
        .cm-drawer { position:fixed;top:0;left:0;bottom:0;width:280px;background:#fff;z-index:100;transform:translateX(-100%);transition:transform .25s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;box-shadow:4px 0 24px rgba(0,0,0,.12); }
        .cm-drawer.open { transform:translateX(0); }
        /* user dropdown */
        .user-menu { position:absolute;top:calc(100% + 8px);right:0;background:#fff;border:1px solid #ebebeb;border-radius:2px;box-shadow:0 8px 24px rgba(0,0,0,.1);min-width:200px;overflow:hidden;z-index:60; }
        .user-menu-item { display:flex;align-items:center;gap:10px;padding:11px 16px;font-size:13px;font-weight:600;color:#1a1a1a;text-decoration:none;background:none;border:none;width:100%;cursor:pointer;text-align:left; }
        .user-menu-item:hover { background:#f5f5f5; }
        .user-menu-item.danger { color:#DC2626; }
        .user-menu-divider { height:1px;background:#f0f0f0;margin:4px 0; }
        .avatar-btn { width:34px;height:34px;border-radius:50%;background:var(--color-primary);color:#fff;font-size:13px;font-weight:800;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
      `}</style>

      <nav style={{ position:'sticky',top:0,zIndex:50,background:'var(--color-night-ride)',borderBottom:'1px solid rgba(255,255,255,0.08)',height:60 }}>
        <div style={{ maxWidth:1280,margin:'0 auto',padding:'0 16px',height:'100%',display:'flex',alignItems:'center',gap:12 }}>

          {/* Hamburger */}
          <button className="cm-hamburger" onClick={() => setDrawerOpen(true)}
            style={{ background:'none',border:'none',cursor:'pointer',padding:6,flexShrink:0,color:'#ffffff' }}>
            <Menu size={22} />
          </button>

          {/* Logo */}
          <Link href="/" style={{ flexShrink:0,textDecoration:'none',display:'flex',alignItems:'center',gap:10 }}>
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18.5" stroke="white" strokeWidth="1.5"/>
              <circle cx="20" cy="20" r="11.5" stroke="white" strokeWidth="1" opacity="0.35"/>
              <circle cx="20" cy="20" r="2" fill="white"/>
              <line x1="20" y1="2" x2="20" y2="8.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="20" y1="31.5" x2="20" y2="38" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="2" y1="20" x2="8.5" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="31.5" y1="20" x2="38" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="7.8" y1="7.8" x2="12.5" y2="12.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="27.5" y1="27.5" x2="32.2" y2="32.2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="32.2" y1="7.8" x2="27.5" y2="12.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="12.5" y1="27.5" x2="7.8" y2="32.2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={{ fontWeight:800,fontSize:17,letterSpacing:'0.04em' }}>
              <span style={{ color:'#ffffff' }}>CRANK</span><span style={{ color:'var(--color-primary)' }}>MART</span>
            </span>
          </Link>

          {/* Centre nav — desktop */}
          <div className="cm-nav-desktop" style={{ flex:1,justifyContent:'center',gap:4 }}>
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link key={href} href={href} style={{
                  padding:'6px 16px',borderRadius:2,fontSize:14,
                  fontWeight: active ? 700 : 500,
                  color: active ? 'var(--color-primary)' : 'rgba(255,255,255,0.75)',
                  background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                  textDecoration:'none',
                }}>{label}</Link>
              )
            })}
          </div>

          {/* Right actions — pushed to far right on mobile too */}
          <div style={{ display:'flex',alignItems:'center',gap:6,flexShrink:0,marginLeft:'auto' }}>
            {/* Admin settings icon — visible to admin + superadmin */}
            {session?.user && ['admin', 'superadmin'].includes((session.user as { role?: string }).role ?? '') && (
              <Link href="/admin" title="Admin Settings" style={{
                display:'flex',alignItems:'center',justifyContent:'center',
                width:34,height:34,borderRadius:2,
                color:'rgba(255,255,255,0.7)',
                background:'transparent',
                transition:'color .15s,background .15s',
                flexShrink:0,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color='#fff'; (e.currentTarget as HTMLAnchorElement).style.background='rgba(255,255,255,0.08)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color='rgba(255,255,255,0.7)'; (e.currentTarget as HTMLAnchorElement).style.background='transparent' }}
              >
                <Settings size={18} />
              </Link>
            )}

            {status === 'loading' ? (
              <div style={{ width:34,height:34,borderRadius:'50%',background:'#f0f0f0' }} />
            ) : session?.user ? (
              /* Logged-in: avatar + dropdown */
              <div style={{ position:'relative' }}>
                <button className="avatar-btn" onClick={() => setUserMenuOpen(p => !p)}>
                  {initials}
                </button>
                {userMenuOpen && (
                  <>
                    <div style={{ position:'fixed',inset:0,zIndex:55 }} onClick={() => setUserMenuOpen(false)} />
                    <div className="user-menu">
                      <div style={{ padding:'12px 16px',borderBottom:'1px solid #f0f0f0' }}>
                        <div style={{ fontSize:13,fontWeight:700,color:'#1a1a1a' }}>{session.user.name}</div>
                        <div style={{ fontSize:12,color:'#9a9a9a',marginTop:2 }}>{session.user.email}</div>
                      </div>
                      <Link href="/account" className="user-menu-item" onClick={() => setUserMenuOpen(false)}>
                        <User size={14} /> My Account
                      </Link>
                      <Link href="/account/profile" className="user-menu-item" onClick={() => setUserMenuOpen(false)}>
                        <User size={14} /> Public profile
                      </Link>
                      <Link href="/account?tab=listings" className="user-menu-item" onClick={() => setUserMenuOpen(false)}>
                        <Package size={14} /> My Listings
                      </Link>
                      <Link href="/account?tab=saved" className="user-menu-item" onClick={() => setUserMenuOpen(false)}>
                        <Heart size={14} /> Saved
                      </Link>
                      <Link href="/account?tab=messages" className="user-menu-item" onClick={() => setUserMenuOpen(false)} style={{ position: 'relative' }}>
                        <MessageCircle size={14} /> Messages
                        {unreadCount > 0 && (
                          <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: '#EF4444', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 12, minWidth: 20, textAlign: 'center' }}>
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                      <div className="user-menu-divider" />
                      <button className="user-menu-item danger" onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: '/' }) }}>
                        <LogOut size={14} /> Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Logged-out */
              <Link href="/login" prefetch={false}
                style={{ fontSize:13,fontWeight:700,color:'#ffffff',textDecoration:'none',padding:'7px 14px',borderRadius:2,border:'1.5px solid rgba(255,255,255,0.25)',background:'transparent',whiteSpace:'nowrap' }}>
                Login
              </Link>
            )}

            <Link href="/sell/step-1" prefetch={false} style={{
              background:'var(--color-primary)',color:'white',fontWeight:700,
              padding:'7px 12px',borderRadius:2,textDecoration:'none',
              fontSize:13,whiteSpace:'nowrap',flexShrink:0,
            }}>
              + Sell
            </Link>
          </div>

        </div>
      </nav>

      {/* Mobile drawer overlay */}
      <div className={`cm-drawer-overlay${drawerOpen ? ' open' : ''}`} onClick={() => setDrawerOpen(false)} />

      {/* Mobile drawer */}
      <div className={`cm-drawer${drawerOpen ? ' open' : ''}`}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',borderBottom:'1px solid #ebebeb' }}>
          <div style={{ display:'flex',alignItems:'center',gap:8 }}>
            <svg width="26" height="26" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18.5" stroke="#0D1B2A" strokeWidth="1.5"/><circle cx="20" cy="20" r="11.5" stroke="#0D1B2A" strokeWidth="1" opacity="0.35"/><circle cx="20" cy="20" r="2" fill="#0D1B2A"/><line x1="20" y1="2" x2="20" y2="8.5" stroke="#0D1B2A" strokeWidth="1.5" strokeLinecap="round"/><line x1="20" y1="31.5" x2="20" y2="38" stroke="#0D1B2A" strokeWidth="1.5" strokeLinecap="round"/><line x1="2" y1="20" x2="8.5" y2="20" stroke="#0D1B2A" strokeWidth="1.5" strokeLinecap="round"/><line x1="31.5" y1="20" x2="38" y2="20" stroke="#0D1B2A" strokeWidth="1.5" strokeLinecap="round"/><line x1="7.8" y1="7.8" x2="12.5" y2="12.5" stroke="#0D1B2A" strokeWidth="1.5" strokeLinecap="round"/><line x1="27.5" y1="27.5" x2="32.2" y2="32.2" stroke="#0D1B2A" strokeWidth="1.5" strokeLinecap="round"/><line x1="32.2" y1="7.8" x2="27.5" y2="12.5" stroke="#0D1B2A" strokeWidth="1.5" strokeLinecap="round"/><line x1="12.5" y1="27.5" x2="7.8" y2="32.2" stroke="#0D1B2A" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <span style={{ fontWeight:800,fontSize:16,letterSpacing:'0.04em' }}>
              <span style={{ color:'#1a1a1a' }}>CRANK</span><span style={{ color:'var(--color-primary)' }}>MART</span>
            </span>
          </div>
          <button onClick={() => setDrawerOpen(false)} style={{ background:'none',border:'none',cursor:'pointer',color:'#1a1a1a',padding:4 }}>
            <X size={22} />
          </button>
        </div>

        {/* Logged-in user info in drawer */}
        {session?.user && (
          <div style={{ padding:'16px 20px',borderBottom:'1px solid #ebebeb',display:'flex',alignItems:'center',gap:12 }}>
            <div className="avatar-btn" style={{ cursor:'default' }}>{initials}</div>
            <div>
              <div style={{ fontSize:14,fontWeight:700,color:'#1a1a1a' }}>{session.user.name}</div>
              <div style={{ fontSize:12,color:'#9a9a9a' }}>{session.user.email}</div>
            </div>
          </div>
        )}

        <div style={{ padding:'12px 0',flex:1 }}>
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link key={href} href={href} onClick={() => setDrawerOpen(false)} style={{
                display:'block',padding:'14px 24px',fontSize:16,
                fontWeight: active ? 700 : 500,
                color: active ? '#0D1B2A' : '#1a1a1a',
                background: active ? 'rgba(var(--color-primary-rgb, 13,27,42),0.08)' : 'transparent',
                textDecoration:'none',
                borderLeft: active ? '3px solid #0D1B2A' : '3px solid transparent',
              }}>{label}</Link>
            )
          })}
          {session?.user && (
            <>
              <div style={{ height:1,background:'#f0f0f0',margin:'8px 0' }} />
              <Link href="/account" onClick={() => setDrawerOpen(false)} style={{ display:'flex',alignItems:'center',gap:10,padding:'14px 24px',fontSize:15,fontWeight:600,color:'#1a1a1a',textDecoration:'none' }}>
                <User size={16} /> My Account
              </Link>
              <Link href="/account?tab=listings" onClick={() => setDrawerOpen(false)} style={{ display:'flex',alignItems:'center',gap:10,padding:'14px 24px',fontSize:15,fontWeight:600,color:'#1a1a1a',textDecoration:'none' }}>
                <Package size={16} /> My Listings
              </Link>
              <Link href="/account?tab=messages" onClick={() => setDrawerOpen(false)} style={{ display:'flex',alignItems:'center',gap:10,padding:'14px 24px',fontSize:15,fontWeight:600,color:'#1a1a1a',textDecoration:'none', position: 'relative' }}>
                <MessageCircle size={16} /> Messages
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', right: 24, background: '#EF4444', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 12, minWidth: 20, textAlign: 'center' }}>
                    {unreadCount}
                  </span>
                )}
              </Link>
            </>
          )}
        </div>

        <div style={{ padding:'16px 20px',borderTop:'1px solid #ebebeb',display:'flex',flexDirection:'column',gap:10 }}>
          {session?.user ? (
            <button onClick={() => { setDrawerOpen(false); signOut({ callbackUrl: '/' }) }}
              style={{ display:'block',textAlign:'center',padding:'12px',border:'1.5px solid #e4e4e7',borderRadius:2,fontSize:15,fontWeight:600,color:'#DC2626',background:'#fff',cursor:'pointer',width:'100%' }}>
              Sign out
            </button>
          ) : (
            <Link href="/login" onClick={() => setDrawerOpen(false)}
              style={{ display:'block',textAlign:'center',padding:'12px',border:'1.5px solid #e4e4e7',borderRadius:2,fontSize:15,fontWeight:600,color:'#1a1a1a',textDecoration:'none' }}>
              Login
            </Link>
          )}
          <Link href="/sell/step-1" onClick={() => setDrawerOpen(false)}
            style={{ display:'block',textAlign:'center',padding:'12px',background:'var(--color-primary)',borderRadius:2,fontSize:15,fontWeight:700,color:'#fff',textDecoration:'none' }}>
            + Sell
          </Link>
        </div>
      </div>
    </>
  )
}
