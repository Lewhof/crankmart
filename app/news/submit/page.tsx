'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Upload, Image as ImageIcon } from 'lucide-react'

const CATEGORIES = ['racing', 'events', 'industry', 'gear', 'general']

export default function SubmitArticlePage() {
  const [form, setForm] = useState({
    title: '', excerpt: '', content: '', coverImageUrl: '',
    category: 'general', tags: '', authorName: '', authorEmail: '', authorBio: '', sourceUrl: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [imgUploading, setImgUploading] = useState(false)
  const imgInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.content || !form.authorName || !form.authorEmail) {
      setError('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/news/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) return (
    <div style={{ minHeight: '80vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '48px 32px', maxWidth: 480, width: '100%', textAlign: 'center', border: '1px solid #ebebeb', boxShadow: '0 4px 32px rgba(0,0,0,.08)' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle size={36} color="#10B981" />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: '#1a1a1a', margin: '0 0 12px' }}>Article Submitted!</h2>
        <p style={{ fontSize: 15, color: '#6b7280', margin: '0 0 28px', lineHeight: 1.5 }}>
          Thank you for your submission. Our editorial team will review your article and you'll be notified by email once it's approved and published.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link href="/news" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: 'var(--color-primary)', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>
            Browse News
          </Link>
          <button onClick={() => { setSubmitted(false); setForm({ title:'',excerpt:'',content:'',coverImageUrl:'',category:'general',tags:'',authorName:'',authorEmail:'',authorBio:'',sourceUrl:'' }) }}
            style={{ padding: '10px 20px', border: '1.5px solid #e4e4e7', borderRadius: 8, background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#1a1a1a' }}>
            Submit Another
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '24px 16px 80px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Link href="/news" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#9a9a9a', textDecoration: 'none', marginBottom: 20 }}>
          <ArrowLeft size={14} /> Back to News
        </Link>

        <div style={{ background: '#fff', borderRadius: 16, padding: '32px', border: '1px solid #ebebeb' }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#1a1a1a', margin: '0 0 6px' }}>Submit an Article</h1>
            <p style={{ margin: 0, fontSize: 14, color: '#6b7280', lineHeight: 1.5 }}>
              Share your cycling news, race reports, or industry updates with the CycleMart community. All submissions are reviewed by our editorial team before publishing.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <style>{`
              .form-group { margin-bottom: 20px; }
              .form-label { display:block; font-size:13px; font-weight:700; color:#1a1a1a; margin-bottom:6px; }
              .form-label span { color:#ef4444; margin-left:2px; }
              .form-input { width:100%; padding:10px 14px; border:1.5px solid #e4e4e7; border-radius:8px; font-size:14px; font-family:inherit; outline:none; box-sizing:border-box; transition:border-color .15s; }
              .form-input:focus { border-color:var(--color-primary); }
              .form-hint { font-size:12px; color:#9a9a9a; margin-top:4px; }
              .form-section { padding-top:20px; border-top:1px solid #f0f0f0; margin-top:20px; }
              .form-section-title { font-size:14px; font-weight:800; color:#1a1a1a; margin:0 0 16px; }
            `}</style>

            {/* Article info */}
            <div className="form-group">
              <label className="form-label">Article Title <span>*</span></label>
              <input className="form-input" placeholder="e.g. Beers and Nortje Win Cape Epic 2026" value={form.title} onChange={e => update('title', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Category <span>*</span></label>
              <select className="form-input" value={form.category} onChange={e => update('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Excerpt / Summary <span>*</span></label>
              <textarea className="form-input" rows={3} placeholder="A short 1-2 sentence summary that appears in the news grid..." value={form.excerpt} onChange={e => update('excerpt', e.target.value)} style={{ resize: 'vertical' }} />
            </div>

            <div className="form-group">
              <label className="form-label">Article Content <span>*</span></label>
              <textarea className="form-input" rows={12} placeholder="Write your full article here. Separate paragraphs with a blank line..." value={form.content} onChange={e => update('content', e.target.value)} style={{ resize: 'vertical' }} />
              <p className="form-hint">Use blank lines between paragraphs. Plain text only — no HTML.</p>
            </div>

            <div className="form-group">
              <label className="form-label">Cover Image</label>
              <div style={{ display:'flex', gap:8, alignItems:'flex-start', flexWrap:'wrap' }}>
                <input className="form-input" style={{ flex:1, minWidth:200 }} placeholder="https://example.com/image.jpg" value={form.coverImageUrl} onChange={e => update('coverImageUrl', e.target.value)} />
                <button type="button" onClick={() => imgInputRef.current?.click()} disabled={imgUploading}
                  style={{ padding:'10px 14px', background:'var(--color-primary)', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap', opacity: imgUploading ? .6 : 1 }}>
                  <ImageIcon size={14} />{imgUploading ? 'Uploading…' : 'Upload image'}
                </button>
                <input ref={imgInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleImageUpload} />
              </div>
              {form.coverImageUrl && (
                <div style={{ marginTop:8, borderRadius:8, overflow:'hidden', maxHeight:120, background:'#f0f0f0' }}>
                  <img src={form.coverImageUrl} alt="Cover preview" style={{ width:'100%', maxHeight:120, objectFit:'cover', display:'block' }} />
                </div>
              )}
              <p className="form-hint">Upload or paste a URL. Landscape 1200×675 recommended.</p>
            </div>

            <div className="form-group">
              <label className="form-label">Tags</label>
              <input className="form-input" placeholder="Cape Epic, MTB, Racing (comma separated)" value={form.tags} onChange={e => update('tags', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Original Source URL</label>
              <input className="form-input" placeholder="https://bikehub.co.za/news/..." value={form.sourceUrl} onChange={e => update('sourceUrl', e.target.value)} />
              <p className="form-hint">If this article is based on or sourced from another publication.</p>
            </div>

            {/* Author info */}
            <div className="form-section">
              <p className="form-section-title">Your Details</p>

              <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Your Name <span>*</span></label>
                  <input className="form-input" placeholder="Jane Smith" value={form.authorName} onChange={e => update('authorName', e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Your Email <span>*</span></label>
                  <input className="form-input" type="email" placeholder="jane@example.com" value={form.authorEmail} onChange={e => update('authorEmail', e.target.value)} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">Short Bio</label>
                <input className="form-input" placeholder="e.g. Freelance cycling journalist based in Cape Town" value={form.authorBio} onChange={e => update('authorBio', e.target.value)} />
              </div>
            </div>

            {error && (
              <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, color: '#DC2626', marginBottom: 16 }}>
                {error}
              </div>
            )}

            {/* Notice */}
            <div style={{ padding: '12px 16px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, fontSize: 13, color: '#1e40af', marginBottom: 20 }}>
              📋 <strong>Editorial note:</strong> All submissions are reviewed before publishing. You'll receive an email when your article is approved or if we have any questions.
            </div>

            <button type="submit" disabled={submitting}
              style={{ width: '100%', height: 48, background: submitting ? '#9aa5c4' : '#0D1B2A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: submitting ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Upload size={16} />
              {submitting ? 'Submitting…' : 'Submit for Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
