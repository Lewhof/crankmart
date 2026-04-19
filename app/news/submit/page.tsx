'use client'

/**
 * Article submission page for logged-in users.
 *
 * - Auth-gated: anon visitors are redirected to /login with returnTo.
 * - Author identity (name + bio + avatar) auto-pulled from session;
 *   no need for the journalist to retype it.
 * - Body uses TiptapEditor (rich text → HTML).
 * - Country derived from URL via countryFromPath so SA + AU stay isolated.
 * - On submit POSTs to /api/news/submit; success screen with link to
 *   /account?tab=submissions to track approval.
 */

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, CheckCircle, Upload, Image as ImageIcon, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { countryFromPath } from '@/lib/regions-static'

// Tiptap pulls in ProseMirror — keep it client-only to avoid bundling on the server route.
const TiptapEditor = dynamic(() => import('@/components/editor/TiptapEditor'), { ssr: false })

const CATEGORIES = ['racing', 'events', 'industry', 'gear', 'general']

export default function SubmitArticlePage() {
  const router = useRouter()
  const pathname = usePathname()
  const country = countryFromPath(pathname)
  const { data: session, status: authStatus } = useSession()

  const [form, setForm] = useState({
    title: '', excerpt: '', body: '', coverImageUrl: '',
    category: 'general', tags: '', sourceUrl: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [imgUploading, setImgUploading] = useState(false)
  const imgInputRef = useRef<HTMLInputElement>(null)

  // Redirect anon to login, preserving the return URL.
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.replace(`/login?returnTo=${encodeURIComponent('/news/submit')}`)
    }
  }, [authStatus, router])

  const update = (key: keyof typeof form, val: string) => setForm(f => ({ ...f, [key]: val }))

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImgUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/sell/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) update('coverImageUrl', data.url)
    } catch { setError('Image upload failed') }
    setImgUploading(false)
    if (imgInputRef.current) imgInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim() || !form.excerpt.trim()) {
      setError('Title, excerpt and article body are all required.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/news/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-country': country },
        body: JSON.stringify({
          title: form.title,
          excerpt: form.excerpt,
          body: form.body,
          coverImageUrl: form.coverImageUrl || null,
          category: form.category,
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
          sourceUrl: form.sourceUrl || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setSubmitted(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (authStatus === 'loading' || authStatus === 'unauthenticated') {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: '#9a9a9a' }} />
      </div>
    )
  }

  if (submitted) return (
    <div style={{ minHeight: '80vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '48px 32px', maxWidth: 480, width: '100%', textAlign: 'center', border: '1px solid #ebebeb', boxShadow: '0 4px 32px rgba(0,0,0,.08)' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle size={36} color="#10B981" />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: '#1a1a1a', margin: '0 0 12px' }}>Article submitted!</h2>
        <p style={{ fontSize: 15, color: '#6b7280', margin: '0 0 28px', lineHeight: 1.5 }}>
          Our editorial team will review it shortly. You&apos;ll get an email when it&apos;s approved and live.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/account?tab=submissions" style={{ padding: '10px 20px', background: 'var(--color-primary)', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>
            Track in My Submissions →
          </Link>
          <button onClick={() => { setSubmitted(false); setForm({ title:'', excerpt:'', body:'', coverImageUrl:'', category:'general', tags:'', sourceUrl:'' }) }}
            style={{ padding: '10px 20px', border: '1.5px solid #e4e4e7', borderRadius: 8, background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#1a1a1a' }}>
            Submit another
          </button>
        </div>
      </div>
    </div>
  )

  const user = session?.user as { name?: string; email?: string; image?: string } | undefined

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '24px 16px 80px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <Link href="/news" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#9a9a9a', textDecoration: 'none', marginBottom: 20 }}>
          <ArrowLeft size={14} /> Back to News
        </Link>

        <div style={{ background: '#fff', borderRadius: 16, padding: '32px', border: '1px solid #ebebeb' }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#1a1a1a', margin: '0 0 6px' }}>Submit an article</h1>
            <p style={{ margin: 0, fontSize: 14, color: '#6b7280', lineHeight: 1.5 }}>
              Race recaps, industry news, gear reviews, event previews — all welcome. Editorial team reviews before publishing.
            </p>
          </div>

          {/* Author chip — pulled from logged-in session */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#f5f5f5', borderRadius: 8, marginBottom: 24 }}>
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt={user.name ?? ''} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0D1B2A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {(user.name?.[0] ?? '?').toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>Submitting as {user.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{user.email}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <style>{`
              .form-group { margin-bottom: 18px; }
              .form-label { display:block; font-size:13px; font-weight:700; color:#1a1a1a; margin-bottom:6px; }
              .form-label span { color:#ef4444; margin-left:2px; }
              .form-input { width:100%; padding:10px 14px; border:1.5px solid #e4e4e7; border-radius:8px; font-size:14px; font-family:inherit; outline:none; box-sizing:border-box; transition:border-color .15s; }
              .form-input:focus { border-color:var(--color-primary); }
              .form-hint { font-size:12px; color:#9a9a9a; margin-top:4px; }
              @keyframes spin { 0% { transform: rotate(0); } 100% { transform: rotate(360deg); } }
            `}</style>

            <div className="form-group">
              <label className="form-label">Title <span>*</span></label>
              <input className="form-input" placeholder="e.g. Beers and Nortje win Cape Epic 2026" value={form.title} onChange={e => update('title', e.target.value)} />
            </div>

            <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Category <span>*</span></label>
                <select className="form-input" value={form.category} onChange={e => update('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tags</label>
                <input className="form-input" placeholder="Cape Epic, MTB, Racing" value={form.tags} onChange={e => update('tags', e.target.value)} />
                <p className="form-hint">Comma-separated.</p>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 18 }}>
              <label className="form-label">Excerpt <span>*</span></label>
              <textarea className="form-input" rows={2} placeholder="One or two sentences that show in the news grid." value={form.excerpt} onChange={e => update('excerpt', e.target.value)} style={{ resize: 'vertical' }} />
            </div>

            <div className="form-group">
              <label className="form-label">Cover image</label>
              <div style={{ display:'flex', gap:8, alignItems:'flex-start', flexWrap:'wrap' }}>
                <input className="form-input" style={{ flex:1, minWidth:200 }} placeholder="https://example.com/cover.jpg" value={form.coverImageUrl} onChange={e => update('coverImageUrl', e.target.value)} />
                <button type="button" onClick={() => imgInputRef.current?.click()} disabled={imgUploading}
                  style={{ padding:'10px 14px', background:'var(--color-primary)', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap', opacity: imgUploading ? .6 : 1 }}>
                  <ImageIcon size={14} />{imgUploading ? 'Uploading…' : 'Upload'}
                </button>
                <input ref={imgInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleCoverUpload} />
              </div>
              {form.coverImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.coverImageUrl} alt="Cover preview" style={{ width:'100%', maxHeight:160, objectFit:'cover', display:'block', marginTop:8, borderRadius:8 }} />
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Article body <span>*</span></label>
              <TiptapEditor
                initialHtml={form.body}
                onChange={html => update('body', html)}
                placeholder="Write your article. Use the toolbar for formatting, lists, links, images…"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Original source URL</label>
              <input className="form-input" placeholder="https://bicycling.co.za/news/..." value={form.sourceUrl} onChange={e => update('sourceUrl', e.target.value)} />
              <p className="form-hint">Optional. If your article is based on or syndicated from another publication.</p>
            </div>

            {error && (
              <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, color: '#DC2626', marginBottom: 16 }}>
                {error}
              </div>
            )}

            <div style={{ padding: '12px 16px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, fontSize: 13, color: '#1e40af', marginBottom: 20 }}>
              📋 <strong>Editorial note:</strong> we review every submission before it goes live. Track approval status in <Link href="/account?tab=submissions" style={{ color: '#1e40af', textDecoration: 'underline', fontWeight: 600 }}>My Submissions</Link>.
            </div>

            <button type="submit" disabled={submitting}
              style={{ width: '100%', height: 48, background: submitting ? '#9aa5c4' : '#0D1B2A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: submitting ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Upload size={16} />
              {submitting ? 'Submitting…' : 'Submit for review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
