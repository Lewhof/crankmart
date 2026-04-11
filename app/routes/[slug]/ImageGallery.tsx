'use client'

import { useState, useEffect, useCallback } from 'react'
import { MapPin, X, ChevronLeft, ChevronRight, Camera } from 'lucide-react'

interface RouteImage {
  id: string
  url: string
  thumbUrl: string | null
  mediumUrl: string | null
  altText: string | null
  isPrimary: boolean
  displayOrder: number
}

interface Props {
  images: RouteImage[]
  routeName: string
  heroFallback?: string | null
}

export default function ImageGallery({ images, routeName, heroFallback }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [imgError, setImgError] = useState<Record<number, boolean>>({})

  const allImages = images.length > 0 ? images : (heroFallback ? [{ id: 'fallback', url: heroFallback, thumbUrl: null, mediumUrl: null, altText: routeName, isPrimary: true, displayOrder: 0 }] : [])
  const hasImages = allImages.length > 0
  const heroSrc = hasImages ? allImages[selectedIndex]?.url : null
  const showThumbs = allImages.length > 1

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }, [])
  const closeLightbox = useCallback(() => setLightboxOpen(false), [])
  const lightboxPrev = useCallback(() => setLightboxIndex(i => (i === 0 ? allImages.length - 1 : i - 1)), [allImages.length])
  const lightboxNext = useCallback(() => setLightboxIndex(i => (i === allImages.length - 1 ? 0 : i + 1)), [allImages.length])

  useEffect(() => {
    if (!lightboxOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') lightboxPrev()
      else if (e.key === 'ArrowRight') lightboxNext()
      else if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxOpen, lightboxPrev, lightboxNext, closeLightbox])

  // No images at all
  if (!hasImages) {
    return (
      <div style={{
        width: '100%', height: 280, borderRadius: 2,
        background: 'linear-gradient(135deg, #0D1B2A 0%, #1E3A5F 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 10, color: 'rgba(255,255,255,0.25)',
      }}>
        <MapPin size={36} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>{routeName}</span>
      </div>
    )
  }

  return (
    <>
      <style>{`
        .gallery-hero-wrap { position: relative; width: 100%; height: 280px; border-radius: 2px; overflow: hidden; background: #111; cursor: pointer; }
        @media (min-width: 768px) { .gallery-hero-wrap { height: 360px; } }
        .thumb-strip { display: flex; gap: 6px; margin-top: 6px; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
        .thumb-strip::-webkit-scrollbar { display: none; }
        .thumb-item { flex-shrink: 0; width: 76px; height: 52px; border-radius: 2px; overflow: hidden; cursor: pointer; border: 2px solid transparent; transition: border-color 0.15s, opacity 0.15s; opacity: 0.72; }
        .thumb-item.active { border-color: #0D1B2A; opacity: 1; }
        .thumb-item:hover { opacity: 1; }
      `}</style>

      {/* Hero */}
      <div className="gallery-hero-wrap" onClick={() => openLightbox(selectedIndex)}>
        {heroSrc && !imgError[selectedIndex] ? (
          <img
            key={heroSrc}
            src={heroSrc}
            alt={allImages[selectedIndex]?.altText ?? routeName}
            loading="eager"
            onError={() => setImgError(prev => ({ ...prev, [selectedIndex]: true }))}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0D1B2A, #1E3A5F)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={40} style={{ color: 'rgba(255,255,255,0.2)' }} />
          </div>
        )}

        {/* Overlay: photo count + expand hint */}
        {allImages.length > 0 && (
          <div style={{ position: 'absolute', bottom: 10, right: 10, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20 }}>
            <Camera size={12} />
            {allImages.length} photo{allImages.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {showThumbs && (
        <div className="thumb-strip">
          {allImages.slice(0, 10).map((img, i) => (
            <div
              key={img.id}
              className={`thumb-item${i === selectedIndex ? ' active' : ''}`}
              onClick={() => setSelectedIndex(i)}
            >
              <img
                src={img.thumbUrl ?? img.url}
                alt=""
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ))}
          {allImages.length > 10 && (
            <div
              onClick={() => openLightbox(10)}
              style={{ flexShrink: 0, width: 76, height: 52, borderRadius: 2, overflow: 'hidden', cursor: 'pointer', position: 'relative', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700 }}
            >
              +{allImages.length - 10}
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.94)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={closeLightbox}
        >
          <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <img
              src={allImages[lightboxIndex]?.url ?? ''}
              alt={allImages[lightboxIndex]?.altText ?? routeName}
              style={{ maxHeight: '88vh', maxWidth: '92vw', objectFit: 'contain', borderRadius: 4, display: 'block' }}
            />
          </div>

          {/* Close */}
          <button onClick={closeLightbox} style={{ position: 'fixed', top: 14, right: 14, background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', width: 38, height: 38, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>

          {/* Prev/Next */}
          {allImages.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); lightboxPrev() }} style={{ position: 'fixed', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', width: 42, height: 42, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronLeft size={20} />
              </button>
              <button onClick={e => { e.stopPropagation(); lightboxNext() }} style={{ position: 'fixed', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', width: 42, height: 42, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Counter */}
          <div style={{ position: 'fixed', bottom: 18, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 600, background: 'rgba(0,0,0,0.45)', padding: '3px 12px', borderRadius: 20 }}>
            {lightboxIndex + 1} / {allImages.length}
          </div>
        </div>
      )}
    </>
  )
}
