'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Eye, ArrowLeft, Share2, Calendar } from 'lucide-react'
import { CommentThread } from '@/components/community/CommentThread'
import { sanitizeArticleHtml } from '@/lib/sanitize-html'

interface Article {
  id: string; title: string; slug: string; excerpt: string; body: string
  cover_image_url: string | null; category: string; tags: string[]
  author_name: string; author_bio: string | null; source_url: string | null
  author_handle: string | null; author_avatar: string | null
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
    const url = `https://crankmart.com/news/${slug}`
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

  const dateFormatted = new Date(article.published_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
  // Body may be either Tiptap-emitted HTML (new submissions) or legacy
  // plain text seeded earlier. If it looks like HTML we sanitise + render
  // via dangerouslySetInnerHTML; otherwise we fall back to paragraph split.
  const looksLikeHtml = useMemo(() => /<\/?[a-z][\s\S]*>/i.test(article.body), [article.body])
  const safeHtml = useMemo(() => looksLikeHtml ? sanitizeArticleHtml(article.body) : '', [looksLikeHtml, article.body])
  const paragraphs = looksLikeHtml ? [] : article.body.split('\n\n').filter(Boolean)

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        .skel{animation:pulse 1.4s infinite;background:#efefef;border-radius:8px}
        .related-card{background:#fff;border-radius:10px;border:1px solid #ebebeb;overflow:hidden;text-decoration:none;color:inherit;display:flex;gap:12px;padding:12px;transition:box-shadow .15s}
        .related-card:hover{box-shadow:0 4px 12px rgba(0,0,0,.08)}
        .article-body{font-size:16px;line-height:1.75;color:#374151}
        .article-body p{font-size:16px;line-height:1.75;color:#374151;margin:0 0 20px}
        .article-body h2{font-size:22px;font-weight:800;color:#1a1a1a;margin:32px 0 14px}
        .article-body h3{font-size:18px;font-weight:700;color:#1a1a1a;margin:26px 0 12px}
        .article-body ul,.article-body ol{padding-left:22px;margin:0 0 20px}
        .article-body li{margin:0 0 6px}
        .article-body blockquote{border-left:3px solid #0D1B2A;padding-left:14px;color:#4b5563;font-style:italic;margin:20px 0}
        .article-body a{color:var(--color-primary);text-decoration:underline}
        .article-body img{max-width:100%;border-radius:10px;margin:20px 0;display:block}
        .article-body strong{color:#1a1a1a}
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
              {article.author_avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={article.author_avatar} alt={article.author_name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {article.author_name[0]}
                </div>
              )}
              <div>
                {article.author_handle ? (
                  <Link href={`/u/${article.author_handle}`} style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', textDecoration: 'none' }}>
                    {article.author_name}
                  </Link>
                ) : (
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{article.author_name}</div>
                )}
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

          {/* Body — HTML from Tiptap (sanitised) for new submissions, paragraph
               split for legacy plain-text seed articles */}
          {looksLikeHtml ? (
            <div className="article-body" dangerouslySetInnerHTML={{ __html: safeHtml }} />
          ) : (
            <div className="article-body">
              {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          )}

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

        <CommentThread targetType="news" targetId={article.id} title="Discussion" />

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
                    <p style={{ fontSize: 12, color: '#9a9a9a', margin: 0 }}>{r.author_name} · {new Date(r.published_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
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
