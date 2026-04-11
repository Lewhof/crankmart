'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Eye, ArrowLeft, Share2, Calendar } from 'lucide-react'

interface Article {
  id: string; title: string; slug: string; excerpt: string; body: string
  cover_image_url: string | null; category: string; tags: string[]
  author_name: string; author_bio: string | null; source_url: string | null
  is_featured: boolean; views_count: number; published_at: string
}

interface RelatedArticle {
  id: string; title: string; slug: string; excerpt: string
  cover_image_url: string | null; author_name: string; published_at: string
}

export default function ArticleDetailPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [article, setArticle] = useState<Article | null>(null)
  const [related, setRelated] = useState<RelatedArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!slug) return
    fetch(`/api/news/${slug}`)
      .then(r => r.json())
      .then(d => { setArticle(d.article); setRelated(d.related || []) })
      .finally(() => setLoading(false))
  }, [slug])

  const handleShare = () => {
    const url = `https://cyclemart.co.za/news/${slug}`
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  if (loading) return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}} .skel{animation:pulse 1.4s infinite;background:#efefef;border-radius:8px}`}</style>
      <div className="skel" style={{ height: 400, borderRadius: 12, marginBottom: 24 }} />
      <div className="skel" style={{ height: 32, width: '80%', marginBottom: 16 }} />
      <div className="skel" style={{ height: 16, marginBottom: 10 }} />
      <div className="skel" style={{ height: 16, marginBottom: 10 }} />
      <div className="skel" style={{ height: 16, width: '60%' }} />
    </div>
  )

  if (!article) return (
    <div style={{ maxWidth: 800, margin: '80px auto', textAlign: 'center', padding: '0 16px' }}>
      <p style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a' }}>Article not found</p>
      <Link href="/news" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>← Back to News</Link>
    </div>
  )

  const dateFormatted = new Date(article.published_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })
  const paragraphs = article.body.split('\n\n').filter(Boolean)

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        .skel{animation:pulse 1.4s infinite;background:#efefef;border-radius:8px}
        .related-card{background:#fff;border-radius:10px;border:1px solid #ebebeb;overflow:hidden;text-decoration:none;color:inherit;display:flex;gap:12px;padding:12px;transition:box-shadow .15s}
        .related-card:hover{box-shadow:0 4px 12px rgba(0,0,0,.08)}
        .article-body p{font-size:16px;line-height:1.75;color:#374151;margin:0 0 20px}
      `}</style>

      {/* Hero image */}
      <div style={{ position: 'relative', height: 420, background: '#1a1a1a', overflow: 'hidden' }}>
        {article.cover_image_url && (
          <Image src={article.cover_image_url} alt={article.title} fill unoptimized style={{ objectFit: 'cover', opacity: 0.8 }} priority />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.7) 0%, rgba(0,0,0,.1) 60%)' }} />
        <div style={{ position: 'absolute', top: 16, left: 16 }}>
          <Link href="/news" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,.2)' }}>
            <ArrowLeft size={14} /> News
          </Link>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px 24px', maxWidth: 800, margin: '0 auto' }}>
          <span style={{ display: 'inline-block', padding: '4px 12px', background: 'var(--color-primary)', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 12 }}>
            {article.category}
          </span>
          <h1 style={{ fontSize: 'clamp(22px,4vw,34px)', fontWeight: 900, color: '#fff', margin: '0 0 12px', lineHeight: 1.2 }}>
            {article.title}
          </h1>
        </div>
      </div>

      {/* Article content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px' }}>
        {/* Meta bar */}
        <div style={{ background: '#fff', borderRadius: '0 0 12px 12px', padding: '16px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, border: '1px solid #ebebeb', borderTop: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {article.author_name[0]}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{article.author_name}</div>
                {article.author_bio && <div style={{ fontSize: 12, color: '#9a9a9a' }}>{article.author_bio}</div>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#9a9a9a' }}>
              <Calendar size={13} />{dateFormatted}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#9a9a9a' }}>
              <Eye size={13} />{article.views_count} views
            </div>
          </div>
          <button onClick={handleShare} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1.5px solid #e4e4e7', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: copied ? '#10B981' : '#1a1a1a' }}>
            <Share2 size={14} />{copied ? 'Copied!' : 'Share'}
          </button>
        </div>

        {/* Body */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '28px 28px', border: '1px solid #ebebeb', marginBottom: 24 }}>
          {/* Lead */}
          <p style={{ fontSize: 18, fontWeight: 600, color: '#374151', lineHeight: 1.6, margin: '0 0 24px', borderLeft: '3px solid #0D1B2A', paddingLeft: 16 }}>
            {article.excerpt}
          </p>

          {/* Body paragraphs */}
          <div className="article-body">
            {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 24, paddingTop: 24, borderTop: '1px solid #f0f0f0' }}>
              {article.tags.map(tag => (
                <span key={tag} style={{ padding: '4px 12px', background: '#f5f5f5', color: '#6b7280', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Source */}
          {article.source_url && (
            <p style={{ fontSize: 12, color: '#9a9a9a', marginTop: 16 }}>
              Source: <a href={article.source_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>{article.source_url}</a>
            </p>
          )}
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <div style={{ marginBottom: 80 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', margin: '0 0 16px' }}>Related Articles</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {related.map(r => (
                <Link key={r.id} href={`/news/${r.slug}`} className="related-card">
                  {r.cover_image_url && (
                    <div style={{ position: 'relative', width: 80, height: 60, flexShrink: 0, borderRadius: 8, overflow: 'hidden', background: '#f0f0f0' }}>
                      <Image src={r.cover_image_url} alt={r.title} fill unoptimized style={{ objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.title}</p>
                    <p style={{ fontSize: 12, color: '#9a9a9a', margin: 0 }}>{r.author_name} · {new Date(r.published_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
