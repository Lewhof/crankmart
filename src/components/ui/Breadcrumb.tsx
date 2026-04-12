import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface Props {
  items: BreadcrumbItem[]
  /** Light variant for use on white/light backgrounds (default). Dark = on dark hero. */
  variant?: 'light' | 'dark'
}

export function Breadcrumb({ items, variant = 'light' }: Props) {
  const isDark = variant === 'dark'
  const textColor    = isDark ? 'rgba(255,255,255,0.6)' : '#9a9a9a'
  const activeColor  = isDark ? 'rgba(255,255,255,0.9)' : '#1a1a1a'
  const chevronColor = isDark ? 'rgba(255,255,255,0.3)' : '#d1d5db'

  // JSON-LD BreadcrumbList schema
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cyclemart.co.za' },
      ...items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: item.label,
        ...(item.href ? { item: `https://cyclemart.co.za${item.href}` } : {}),
      })),
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
        {/* Home */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', color: textColor, textDecoration: 'none', flexShrink: 0 }}>
          <Home size={12} />
        </Link>
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <ChevronRight size={12} style={{ color: chevronColor, flexShrink: 0 }} />
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  style={{ fontSize: 12, fontWeight: 500, color: textColor, textDecoration: 'none', whiteSpace: 'nowrap' }}
                >
                  {item.label}
                </Link>
              ) : (
                <span style={{ fontSize: 12, fontWeight: isLast ? 700 : 500, color: isLast ? activeColor : textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>
                  {item.label}
                </span>
              )}
            </span>
          )
        })}
      </nav>
    </>
  )
}
