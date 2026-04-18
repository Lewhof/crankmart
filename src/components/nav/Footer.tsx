'use client'

import Link from 'next/link'

const COLS = [
  {
    title: 'Community',
    links: [
      { href: '/community',          label: 'Community hub' },
      { href: '/community/stolen',   label: 'Stolen registry' },
      { href: '/community/lost',     label: 'Lost & found' },
      { href: '/community/check',    label: 'Check a serial' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { href: '/browse',    label: 'Classifieds' },
      { href: '/events',    label: 'Events' },
      { href: '/routes',    label: 'Trails' },
      { href: '/directory', label: 'Bike Shops' },
      { href: '/news',      label: 'News' },
    ],
  },
  {
    title: 'Business',
    links: [
      { href: '/pricing', label: 'Pricing' },
      { href: '/directory/register', label: 'Free Listing' },
      { href: '/directory/register', label: 'Advertise' },
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
    ],
  },
]

const WheelMark = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="18.5" stroke="white" strokeWidth="1.5"/>
    <circle cx="20" cy="20" r="11.5" stroke="white" strokeWidth="1" opacity="0.3"/>
    <circle cx="20" cy="20" r="2" fill="white"/>
    <line x1="20" y1="2"    x2="20"   y2="8.5"  stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="20" y1="31.5" x2="20"   y2="38"   stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="2"  y1="20"   x2="8.5"  y2="20"   stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="31.5" y1="20" x2="38"   y2="20"   stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="7.8"  y1="7.8"  x2="12.5" y2="12.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="27.5" y1="27.5" x2="32.2" y2="32.2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="32.2" y1="7.8"  x2="27.5" y2="12.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="12.5" y1="27.5" x2="7.8"  y2="32.2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

export function Footer() {
  return (
    <footer style={{ background: 'var(--color-night-ride)', marginTop: 'auto' }}>
      <style>{`
        .cm-footer-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 36px 20px 24px;
          box-sizing: border-box;
        }
        .cm-footer-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 24px 16px;
          margin-bottom: 28px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        @media (min-width: 640px) {
          .cm-footer-grid {
            grid-template-columns: 2fr 1fr 1fr 1fr;
            gap: 32px 40px;
          }
        }
        .cm-footer-brand {
          grid-column: span 3;
          margin-bottom: 4px;
        }
        @media (min-width: 640px) {
          .cm-footer-brand {
            grid-column: 1;
            margin-bottom: 0;
          }
        }
        .cm-footer-col-title {
          font-size: 10px;
          font-weight: 700;
          color: white;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .cm-footer-link {
          display: block;
          font-size: 12px;
          color: rgba(255,255,255,0.3);
          text-decoration: none;
          margin-bottom: 8px;
          line-height: 1.4;
        }
        .cm-footer-link:hover { color: rgba(255,255,255,0.7); }
        .cm-footer-bottom {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-start;
        }
        @media (min-width: 640px) {
          .cm-footer-bottom {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }
        .cm-footer-legal {
          display: flex;
          gap: 16px;
        }
        .cm-footer-legal-link {
          font-size: 11px;
          color: rgba(255,255,255,0.18);
          text-decoration: none;
        }
        .cm-footer-legal-link:hover { color: rgba(255,255,255,0.5); }
      `}</style>

      <div className="cm-footer-inner">
        <div className="cm-footer-grid">

          {/* Brand */}
          <div className="cm-footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <WheelMark size={22} />
              <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.06em' }}>
                <span style={{ color: 'white' }}>CRANK</span><span style={{ color: 'var(--color-primary)' }}>MART</span>
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', lineHeight: 1.75, margin: 0, maxWidth: 220 }}>
              SA&apos;s first dedicated cycling marketplace.
            </p>
          </div>

          {/* Link columns */}
          {COLS.map(col => (
            <div key={col.title}>
              <div className="cm-footer-col-title">{col.title}</div>
              <nav>
                {col.links.map(({ href, label }) => (
                  <Link key={label} href={href} prefetch={false} className="cm-footer-link">
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="cm-footer-bottom">
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)' }}>
            © {new Date().getFullYear()} CrankMart · H10 Holdings (Pty) Ltd
          </span>
          <div className="cm-footer-legal">
            {[
              { href: '/privacy', label: 'Privacy' },
              { href: '/terms',   label: 'Terms'   },
              { href: '/privacy', label: 'POPIA'   },
            ].map(({ href, label }) => (
              <Link key={label} href={href} prefetch={false} className="cm-footer-legal-link">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
