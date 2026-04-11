'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, X, ChevronUp, ChevronDown } from 'lucide-react'

const STEPS = ['Category', 'Details', 'Photos', 'Location & Price']

function Step3Content() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [images, setImages] = useState<Array<{ url: string; preview?: string; file?: File }>>([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)

  useEffect(() => {
    // Guard: must have completed step 1 + 2
    const step1 = localStorage.getItem('cyclemart-sell-category')
    const step2 = localStorage.getItem('cyclemart-sell-draft')
    if (!step1 || !step2) {
      router.replace('/sell/step-1')
      return
    }
    const saved = localStorage.getItem('cyclemart-sell-photos')
    if (saved) {
      try {
        setImages(JSON.parse(saved))
      } catch {}
    }
  }, [router])

  const savePhotos = (newImages: typeof images) => {
    // Only persist the server URL — blob previews are not serialisable
    const toSave = newImages.filter(i => i.url).map(({ url }) => ({ url }))
    localStorage.setItem('cyclemart-sell-photos', JSON.stringify(toSave))
  }

  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/sell/upload', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) throw new Error('Upload failed')
    return await res.json()
  }

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    // Capture files into array FIRST before any DOM manipulation
    const validFiles = Array.from(files)
      .filter(f => f.type.startsWith('image/') || f.name.match(/\.(jpe?g|png|webp|heic|heif|gif|avif)$/i))
      .slice(0, 15 - images.length)

    if (validFiles.length === 0) return

    setUploading(true)

    // Upload each file independently — don't let one failure block others
    const uploaded: Array<{ url: string; preview: string }> = []

    for (const file of validFiles) {
      const preview = URL.createObjectURL(file)
      try {
        // Add preview immediately so user sees it
        setImages(prev => {
          const next = [...prev, { url: '', preview }]
          return next
        })

        const result = await uploadFile(file)
        const serverUrl = result?.url || ''

        // Swap placeholder with real URL
        setImages(prev => {
          const next = [...prev]
          const idx = next.findLastIndex(img => img.preview === preview)
          if (idx !== -1) next[idx] = { url: serverUrl, preview }
          return next
        })

        uploaded.push({ url: serverUrl, preview })
      } catch (err) {
        // Upload failed for this file — placeholder will be removed below
        // Remove the placeholder for this failed file
        setImages(prev => {
          const next = [...prev]
          const idx = next.findLastIndex(img => img.preview === preview)
          if (idx !== -1) next.splice(idx, 1)
          return next
        })
      }
    }

    setUploading(false)

    // Reset file input AFTER processing so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ''

    // Persist to localStorage after all done
    setImages(prev => {
      savePhotos(prev)
      return prev
    })
  }

  const removeImage = (idx: number) => {
    const updated = images.filter((_, i) => i !== idx)
    setImages(updated)
    savePhotos(updated)
  }

  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDropImage = (targetIdx: number) => {
    if (draggedIdx === null || draggedIdx === targetIdx) return

    const updated = [...images]
    const draggedImage = updated[draggedIdx]
    updated.splice(draggedIdx, 1)
    updated.splice(targetIdx, 0, draggedImage)

    setImages(updated)
    savePhotos(updated)
    setDraggedIdx(null)
  }

  const handleTouchStart = (idx: number) => {
    setDraggedIdx(idx)
  }

  const handleTouchEnd = (targetIdx: number) => {
    if (draggedIdx === null) return
    handleDropImage(targetIdx)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const handleContinue = () => {
    if (images.length === 0) {
      alert('Please add at least 1 photo')
      return
    }
    router.push('/sell/step-4')
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: 100 }}>
      <style>{`
        * { box-sizing: border-box; }
        .sell-wrap { max-width: 640px; margin: 0 auto; padding: 0 0 40px; }
        @media(min-width:768px) { .sell-wrap { padding: 24px 0 40px; } }

        .progress-bar { background: #fff; border-bottom: 1px solid #ebebeb; padding: 0 20px; }
        .progress-inner { max-width: 640px; margin: 0 auto; display: flex; align-items: center; height: 52px; gap: 0; }
        .step-dot { display: flex; align-items: center; gap: 8px; flex: 1; }
        .step-dot:last-child { flex: 0; }
        .dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
        .dot.done { background: var(--color-primary); color: #fff; }
        .dot.active { background: var(--color-primary); color: #fff; box-shadow: 0 0 0 3px #E9ECF5; }
        .dot.todo { background: #f0f0f0; color: #9a9a9a; }
        .step-label { font-size: 12px; font-weight: 600; }
        .step-line { flex: 1; height: 2px; background: #ebebeb; }
        .step-line.done { background: var(--color-primary); }

        .sell-topbar { background: #fff; border-bottom: 1px solid #ebebeb; padding: 12px 20px; display: flex; align-items: center; gap: 12px; }

        .sell-card { background: #fff; margin: 0; padding: 20px; }
        @media(min-width:768px) { .sell-card { border-radius: 8px; margin-bottom: 12px; } }

        .dropzone { border: 2px dashed #ebebeb; border-radius: 8px; padding: 30px 20px; text-align: center; cursor: pointer; transition: all 0.2s; }
        .dropzone:hover { border-color: #0D1B2A; background: #f8f9ff; }
        .dropzone.active { border-color: #0D1B2A; background: #f8f9ff; }
        .dropzone-text { font-size: 13px; color: #9a9a9a; margin-bottom: 8px; }
        .dropzone-btn { display: inline-block; padding: 10px 20px; background: var(--color-primary); color: #fff; border-radius: 8px; font-size: 13px; font-weight: 600; }

        .photo-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 20px; }
        @media(min-width: 768px) { .photo-grid { grid-template-columns: repeat(4, 1fr); } }

        .photo-item { position: relative; border-radius: 8px; overflow: hidden; aspect-ratio: 1; background: #f0f0f0; }
        .photo-img { width: 100%; height: 100%; object-fit: cover; }

        .photo-controls { position: absolute; top: 8px; right: 8px; display: flex; gap: 6px; }
        .photo-btn { width: 32px; height: 32px; border-radius: 50%; background: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.15); transition: all 0.2s; }
        .photo-btn:hover { background: #f0f0f0; }

        .photo-item.dragging { opacity: 0.5; }
        .photo-item.drag-over { border: 2px solid #0D1B2A; }

        .photo-count { margin-top: 12px; font-size: 12px; color: #9a9a9a; }

        .sell-footer { position: fixed; bottom: 60px; left: 0; right: 0; background: #fff; border-top: 1px solid #ebebeb; padding: 12px 20px; z-index: 40; }
        @media(min-width: 768px) { .sell-footer { bottom: 0; } }

        .btn-next { width: 100%; height: 50px; background: var(--color-primary); color: #fff; border: none; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-next:hover { background: #1e2d5a; }
        .btn-next:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      {/* Top bar */}
      <div className="sell-topbar">
        <button
          onClick={() => router.back()}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a1a' }}
        >
          <ArrowLeft size={18} />
        </button>
        <span style={{ fontWeight: 800, fontSize: 16, color: '#1a1a1a' }}>Post a listing</span>
      </div>

      {/* Progress */}
      <div className="progress-bar">
        <div className="progress-inner">
          {STEPS.map((s, i) => (
            <div key={s} className="step-dot">
              <div className={`dot ${i < 2 ? 'done' : i === 2 ? 'active' : 'todo'}`}>{i + 1}</div>
              <span className="step-label" style={{ color: i <= 2 ? '#0D1B2A' : '#9a9a9a' }}>{s}</span>
              {i < STEPS.length - 1 && <div className={`step-line${i < 2 ? ' done' : ''}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="sell-wrap">
        <div className="sell-card" style={{ marginTop: 0 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', marginBottom: 4 }}>Photos</h2>
          <p style={{ fontSize: 13, color: '#9a9a9a', marginBottom: 16 }}>Upload at least 1 clear photo (max 15). First photo is the cover.</p>

          {/* Hidden file input — triggered programmatically */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.heic,.heif"
            style={{ display: 'none' }}
            onChange={e => {
              const files = e.target.files
              handleFileSelect(files)
            }}
          />

          {/* Dropzone — clicks trigger file input directly */}
          <div
            className={`dropzone${dragActive ? ' active' : ''}`}
            style={{ cursor: uploading ? 'not-allowed' : 'pointer', display: 'block' }}
            onClick={() => { if (!uploading) fileInputRef.current?.click() }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="dropzone-text">
              {uploading ? 'Uploading...' : 'Drag photos here or click to browse'}
            </div>
            <div className="dropzone-btn" onClick={e => { e.stopPropagation(); if (!uploading) fileInputRef.current?.click() }}>
              {uploading ? 'Uploading...' : 'Choose Photos'}
            </div>
          </div>

          {/* Photo grid */}
          {images.length > 0 && (
            <>
              <div className="photo-grid">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`photo-item${draggedIdx === idx ? ' dragging' : ''}${draggedIdx !== null && draggedIdx !== idx ? ' drag-over' : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDropImage(idx)}
                    onTouchStart={() => handleTouchStart(idx)}
                    onTouchEnd={() => handleTouchEnd(idx)}
                    style={{ cursor: draggedIdx === idx ? 'grabbing' : 'grab' }}
                  >
                    <img src={img.preview || img.url} alt={`Photo ${idx + 1}`} className="photo-img" />
                    {/* Uploading overlay for pending images */}
                    {!img.url && (
                      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.4)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <div style={{ width:24, height:24, border:'3px solid rgba(255,255,255,.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                      </div>
                    )}
                    <div className="photo-controls">
                      <button className="photo-btn" onClick={() => removeImage(idx)} title="Remove">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="photo-count">
                {images.filter(i => i.url).length} of 15 photos uploaded{uploading ? ' · uploading…' : ''}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="sell-footer">
        <button className="btn-next" onClick={handleContinue} disabled={images.length === 0 || uploading}>
          Continue <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

export default function Step3Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Step3Content />
    </Suspense>
  )
}
