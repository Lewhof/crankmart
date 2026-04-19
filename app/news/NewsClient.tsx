'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Eye, ChevronRight, PenLine } from 'lucide-react'
import { countryFromPath } from '@/lib/regions-static'
import { getLocale } from '@/lib/currency'

interface Article {
  id: string; title: string; slug: string; excerpt: string
  cover_image_url: string | null; category: string; tags: string[]
  author_name: string; is_featured: boolean; views_count: number; published_at: string
}

const CATS = [
  { slug: 'all', label: 'All' },
  { slug: 'racing', label: 'Racing' },
  { slug: 'events', label: 'Events' },
  { slug: 'industry', label: 'Industry' },
  { slug: 'gear', label: 'Gear & Tech' },
  { slug: 'general', label: 'General' },
]

function timeAgo(dateStr: string, locale: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  return new Date(dateStr).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function NewsPage() {
  const country = countryFromPath(usePathname())
  const locale = getLocale(country)
  const countryAdj = country === 'au' ? 'AU' : 'SA'
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)

  const fetchArticles = async (cat: string, off: number, append = false) => {
    setLoading(true)
    try {
      const q = new URLSearchParams({ limit: '9', offset: String(off) })
      if (cat !== 'all') q.set('category', cat)
      const res = await fetch(`/api/news?${q}`, { headers: { 'x-country': country } })
      const data = await res.json()
      const list: Article[] = data.articles || []
      setArticles(prev => append ? [...prev, ...list] : list)
      setHasMore(data.pagination?.hasMore ?? false)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchArticles(category, 0) }, [category])

  const featured = articles.find(a => a.is_featured)
  const rest = articles.filter(a => !a.is_featured || articles.indexOf(a) > 0)

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        .skel{animation:pulse 1.4s infinite;background:#efefef;border-radius:2px}
        .article-card{background:#fff;border-radius:2px;border:1px solid #ebebeb;overflow:hidden;text-decoration:none;color:inherit;display:flex;flex-direction:column;box-shadow:0 1px 3px rgba(0,0,0,.06);transition:box-shadow .15s,transform .15s}
        .article-card:hover{box-shadow:0 6px 20px rgba(0,0,0,.10);transform:translateY(-1px)}
        .article-grid{display:grid;gap:16px;grid-template-columns:1fr}
        @media(min-width:640px){.article-grid{grid-template-columns:repeat(2,1fr)}}
        @media(min-width:900px){.article-grid{grid-template-columns:repeat(3,1fr)}}
        .cat-pill{flex-shrink:0;padding:7px 16px;border-radius:2px;border:1px solid #e4e4e7;background:#fff;font-size:13px;font-weight:500;color:#1a1a1a;cursor:pointer;white-space:nowrap;transition:all .12s}
        .cat-pill.active{background:var(--color-primary);color:#fff;border-color:var(--color-primary);font-weight:700}
      `}</style>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ebebeb' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1a1a1a', margin: '0 0 4px', letterSpacing: '-0.5px' }}>Cycling News</h1>
              <p style={{ margin: 0, fontSize: 14, color: '#9a9a9a' }}>Latest {countryAdj} cycling news, race reports and industry updates</p>
            </div>
            <Link href="/news/submit"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: 'var(--color-primary)', color: '#fff', borderRadius: 2, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              <PenLine size={14} /> Submit Article
            </Link>
          </div>

          {/* Category filter */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 1 }}>
            {CATS.map(c => (
              <button key={c.slug} className={`cat-pill${category === c.slug ? ' active' : ''}`}
                onClick={() => { setCategory(c.slug); setOffset(0) }}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px 80px' }}>
        {loading && articles.length === 0 ? (
          <div>
            {/* Featured skeleton */}
            <div className="skel" style={{ height: 400, borderRadius: 16, marginBottom: 24 }} />
            <div className="article-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="article-card">
                  <div className="skel" style={{ height: 200 }} />
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="skel" style={{ height: 10, width: '30%' }} />
                    <div className="skel" style={{ height: 18, width: '90%' }} />
                    <div className="skel" style={{ height: 14, width: '70%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#9a9a9a' }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>No articles found</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Check back soon or submit your own article.</p>
          </div>
        ) : (
          <>
            {/* Featured hero article */}
            {featured && offset === 0 && (
              <Link href={`/news/${featured.slug}`} style={{ display: 'block', textDecoration: 'none', marginBottom: 24 }}>
                <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', height: 420, background: '#1a1a1a' }}>
                  {featured.cover_image_url && (
                    <Image src={featured.cover_image_url} alt={featured.title} fill unoptimized style={{ objectFit: 'cover', opacity: 0.7 }} />
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.85) 0%, rgba(0,0,0,.2) 60%)' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px' }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                      <span style={{ padding: '4px 10px', background: 'var(--color-primary)', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px' }}>
                        {featured.category}
                      </span>
                      <span style={{ padding: '4px 10px', background: 'rgba(255,255,255,.15)', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                        Featured
                      </span>
                    </div>
                    <h2 style={{ fontSize: 'clamp(20px,3vw,30px)', fontWeight: 900, color: '#fff', margin: '0 0 10px', lineHeight: 1.2 }}>
                      {featured.title}
                    </h2>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,.8)', margin: '0 0 16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {featured.excerpt}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'rgba(255,255,255,.7)' }}>
                      <span>{featured.author_name}</span>
                      <span>·</span>
                      <span>{timeAgo(featured.published_at, locale)}</span>
                      <span>·</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={13} />{featured.views_count}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Article grid */}
            <div className="article-grid">
              {(offset === 0 ? rest : articles).map(article => (
                <Link key={article.id} href={`/news/${article.slug}`} className="article-card">
                  <div style={{ position: 'relative', width: '100%', paddingBottom: '56%', background: '#f0f0f0', overflow: 'hidden' }}>
                    {article.cover_image_url
                      ? <Image src={article.cover_image_url} alt={article.title} fill unoptimized style={{ objectFit: 'cover' }} sizes="(max-width:640px) 100vw, 33vw" />
                      : <div style={{ position: 'absolute', inset: 0, background: '#e5e7eb' }} />
                    }
                    <span style={{ position: 'absolute', top: 10, left: 10, padding: '3px 10px', background: 'var(--color-primary)', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px' }}>
                      {article.category}
                    </span>
                  </div>
                  <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1a1a1a', margin: '0 0 8px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {article.title}
                    </h3>
                    <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                      {article.excerpt}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#9a9a9a' }}>
                      <span>{article.author_name} · {timeAgo(article.published_at, locale)}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Eye size={12} />{article.views_count}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
                <button
                  onClick={() => { const next = offset + 9; setOffset(next); fetchArticles(category, next, true) }}
                  style={{ padding: '12px 32px', border: '1.5px solid #0D1B2A', borderRadius: 2, background: '#fff', color: 'var(--color-primary)', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Load More <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
