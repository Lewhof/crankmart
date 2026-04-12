'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, X, Loader } from 'lucide-react'

const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'used', label: 'Used' },
  { value: 'poor', label: 'Poor' },
]

const SA_PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo',
  'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape',
]

const FRAME_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '46', '48', '50', '52', '54', '56', '58', '60', '62']
const WHEEL_SIZES = ['24"', '26"', '27.5"', '29"', '700c', '650b']

interface EditImage {
  id: string
  imageUrl: string
  displayOrder: number
}

interface EditFormData {
  title: string
  description: string
  price: string
  negotiable: boolean
  condition: string
  province: string
  city: string
  postalCode: string
  bikeMake: string
  bikeModel: string
  bikeYear: string
  colour: string
  frameSize: string
  wheelSizeInches: string
  drivetrainSpeeds: string
  brakeType: string
  frameMaterial: string
  shippingAvailable: boolean
}

function EditContent() {
  const router = useRouter()
  const params = useParams()
  const listingId = params?.id as string
  const { status } = useSession()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<EditFormData>({
    title: '',
    description: '',
    price: '',
    negotiable: true,
    condition: '',
    province: '',
    city: '',
    postalCode: '',
    bikeMake: '',
    bikeModel: '',
    bikeYear: '',
    colour: '',
    frameSize: '',
    wheelSizeInches: '',
    drivetrainSpeeds: '',
    brakeType: '',
    frameMaterial: '',
    shippingAvailable: false,
  })

  const [images, setImages] = useState<EditImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [deleteImageIds, setDeleteImageIds] = useState<string[]>([])
  const [newImageUrls, setNewImageUrls] = useState<string[]>([])

  // Auth check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/sell/edit/${listingId}`)
    }
  }, [status, router, listingId])

  // Load listing data
  useEffect(() => {
    if (!listingId) return

    const load = async () => {
      try {
        const res = await fetch(`/api/sell/edit/${listingId}`)
        if (!res.ok) {
          if (res.status === 401) {
            router.push(`/login?callbackUrl=/sell/edit/${listingId}`)
            return
          }
          if (res.status === 403) {
            router.push('/account')
            return
          }
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || 'Failed to load listing')
        }
        const data = await res.json()
        setForm({
          title: data.title || '',
          description: data.description || '',
          price: data.price ? data.price.toString() : '',
          negotiable: data.negotiable ?? true,
          condition: data.condition || '',
          province: data.province || '',
          city: data.city || '',
          postalCode: data.postalCode || '',
          bikeMake: data.bikeMake || '',
          bikeModel: data.bikeModel || '',
          bikeYear: data.bikeYear ? data.bikeYear.toString() : '',
          colour: data.colour || '',
          frameSize: data.frameSize || '',
          wheelSizeInches: data.wheelSizeInches ? data.wheelSizeInches.toString() : '',
          drivetrainSpeeds: data.drivetrainSpeeds ? data.drivetrainSpeeds.toString() : '',
          brakeType: data.brakeType || '',
          frameMaterial: data.frameMaterial || '',
          shippingAvailable: data.shippingAvailable ?? false,
        })
        setImages(data.images || [])
      } catch (err) {
        alert('Failed to load listing')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [listingId, router])

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

  const handleAddPhotos = async () => {
    const files = fileInputRef.current?.files
    if (!files) return

    setUploading(true)
    try {
      const urls: string[] = []
      for (let i = 0; i < Math.min(files.length, 15 - images.length - newImageUrls.length); i++) {
        const file = files[i]
        if (!file.type.startsWith('image/')) continue
        try {
          const { url } = await uploadFile(file)
          urls.push(url)
        } catch (err) {
          console.error('Upload error:', err)
        }
      }
      setNewImageUrls([...newImageUrls, ...urls])
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeImage = (id: string) => {
    setImages(images.filter(img => img.id !== id))
    setDeleteImageIds([...deleteImageIds, id])
  }

  const removeNewImage = (url: string) => {
    setNewImageUrls(newImageUrls.filter(u => u !== url))
  }

  const handleSave = async () => {
    if (!form.title || !form.condition || !form.price || !form.province || !form.city) {
      alert('Please fill in all required fields')
      return
    }

    setSaving(true)
    try {
      const payload: any = { ...form }
      if (deleteImageIds.length > 0) payload.deleteImageIds = deleteImageIds
      if (newImageUrls.length > 0) payload.newImages = newImageUrls

      const res = await fetch(`/api/listings/edit/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to save')
      }

      const result = await res.json()
      setSaveStatus('saved')
      setTimeout(() => {
        if (result.slug) {
          router.push(`/browse/${result.slug}`)
        } else {
          router.push('/account')
        }
      }, 1500)
    } catch (err) {
      console.error('Save error:', err)
      alert('Failed to save listing')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #ebebeb', borderTopColor: '#0D1B2A', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  const totalImages = images.length + newImageUrls.length

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: 100 }}>
      <style>{`
        * { box-sizing: border-box; }
        .edit-wrap { max-width: 640px; margin: 0 auto; padding: 0 0 40px; }
        @media(min-width:768px) { .edit-wrap { padding: 24px 0 40px; } }

        .edit-topbar { background: #fff; border-bottom: 1px solid #ebebeb; padding: 12px 20px; display: flex; align-items: center; gap: 12px; }

        .edit-card { background: #fff; margin: 0; padding: 20px; }
        @media(min-width:768px) { .edit-card { border-radius: 2px; margin-bottom: 12px; } }

        .card-title { font-size: 16px; font-weight: 800; color: #1a1a1a; margin-bottom: 16px; }
        .card-subtitle { font-size: 12px; color: #9a9a9a; margin-bottom: 16px; }

        .form-group { margin-bottom: 14px; }
        .form-label { display: block; font-size: 12px; font-weight: 600; color: #1a1a1a; margin-bottom: 6px; }
        .form-input { width: 100%; padding: 10px 12px; border: 1px solid #ebebeb; border-radius: 2px; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .form-input:focus { outline: none; border-color: #0D1B2A; background: #f8f9ff; }
        .textarea { width: 100%; padding: 10px 12px; border: 1px solid #ebebeb; border-radius: 2px; font-size: 13px; resize: vertical; min-height: 80px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .textarea:focus { outline: none; border-color: #0D1B2A; }

        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .radio-group { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 8px; }
        .radio-btn { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 10px 12px; border: 1px solid #ebebeb; border-radius: 2px; font-size: 13px; }
        .radio-btn:hover { border-color: #0D1B2A; background: #f8f9ff; }
        .radio-btn.selected { background: var(--color-primary); color: #fff; border-color: #0D1B2A; }
        .radio-btn input { cursor: pointer; }

        .checkbox-item { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 10px; }
        .checkbox-item input { width: 18px; height: 18px; cursor: pointer; }

        .photo-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 12px; }
        @media(min-width: 768px) { .photo-grid { grid-template-columns: repeat(4, 1fr); } }

        .photo-item { position: relative; border-radius: 2px; overflow: hidden; aspect-ratio: 1; background: #f0f0f0; }
        .photo-img { width: 100%; height: 100%; object-fit: cover; }

        .photo-btn { position: absolute; top: 8px; right: 8px; width: 32px; height: 32px; border-radius: 50%; background: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
        .photo-btn:hover { background: #f0f0f0; }

        .dropzone { border: 2px dashed #ebebeb; border-radius: 2px; padding: 30px 20px; text-align: center; cursor: pointer; transition: all 0.2s; }
        .dropzone:hover { border-color: #0D1B2A; background: #f8f9ff; }
        .dropzone-btn { display: inline-block; padding: 10px 20px; background: var(--color-primary); color: #fff; border-radius: 2px; font-size: 13px; font-weight: 600; border: none; cursor: pointer; }

        .save-footer { position: fixed; bottom: 60px; left: 0; right: 0; background: #fff; border-top: 1px solid #ebebeb; padding: 12px 20px; z-index: 40; }
        @media(min-width: 768px) { .save-footer { bottom: 0; } }

        .btn-save { width: 100%; height: 50px; background: var(--color-primary); color: #fff; border: none; border-radius: 2px; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-save:hover { background: #1e2d5a; }
        .btn-save:disabled { opacity: 0.4; cursor: not-allowed; }

        .save-status { position: fixed; top: 60px; right: 20px; font-size: 12px; color: #10b981; transition: opacity 0.3s; z-index: 30; }
        .save-status.visible { opacity: 1; }
        .save-status.hidden { opacity: 0; }
      `}</style>

      {/* Save status indicator */}
      <div className={`save-status${saveStatus ? ' visible' : ' hidden'}`}>
        Saved ✓
      </div>

      {/* Top bar */}
      <div className="edit-topbar">
        <button
          onClick={() => router.back()}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a1a' }}
        >
          <ArrowLeft size={18} />
        </button>
        <span style={{ fontWeight: 800, fontSize: 16, color: '#1a1a1a' }}>Edit listing</span>
      </div>

      <div className="edit-wrap">
        {/* Listing Details */}
        <div className="edit-card" style={{ marginTop: 0 }}>
          <div className="card-title">Listing Details</div>

          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              className="form-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Trek Slash 8 2023"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="textarea"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe condition, upgrades, service history..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Condition *</label>
            <div className="radio-group">
              {CONDITIONS.map(c => (
                <label key={c.value} className={`radio-btn${form.condition === c.value ? ' selected' : ''}`}>
                  <input
                    type="radio"
                    name="condition"
                    value={c.value}
                    checked={form.condition === c.value}
                    onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Brand</label>
              <input
                className="form-input"
                value={form.bikeMake}
                onChange={(e) => setForm({ ...form, bikeMake: e.target.value })}
                placeholder="Trek, Specialized..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Model</label>
              <input
                className="form-input"
                value={form.bikeModel}
                onChange={(e) => setForm({ ...form, bikeModel: e.target.value })}
                placeholder="Slash 8"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Year</label>
            <input
              className="form-input"
              type="number"
              value={form.bikeYear}
              onChange={(e) => setForm({ ...form, bikeYear: e.target.value })}
              placeholder="2023"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Colour</label>
            <input
              className="form-input"
              value={form.colour}
              onChange={(e) => setForm({ ...form, colour: e.target.value })}
              placeholder="Black, red accents..."
            />
          </div>
        </div>

        {/* Specs */}
        <div className="edit-card">
          <div className="card-title">Specifications</div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Frame Size</label>
              <select
                className="form-input"
                value={form.frameSize}
                onChange={(e) => setForm({ ...form, frameSize: e.target.value })}
              >
                <option value="">Select...</option>
                {FRAME_SIZES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Wheel Size</label>
              <select
                className="form-input"
                value={form.wheelSizeInches}
                onChange={(e) => setForm({ ...form, wheelSizeInches: e.target.value })}
              >
                <option value="">Select...</option>
                {WHEEL_SIZES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Material</label>
              <input
                className="form-input"
                value={form.frameMaterial}
                onChange={(e) => setForm({ ...form, frameMaterial: e.target.value })}
                placeholder="Carbon, Aluminum..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Drivetrain Speeds</label>
              <input
                className="form-input"
                type="number"
                value={form.drivetrainSpeeds}
                onChange={(e) => setForm({ ...form, drivetrainSpeeds: e.target.value })}
                placeholder="12"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Brake Type</label>
            <input
              className="form-input"
              value={form.brakeType}
              onChange={(e) => setForm({ ...form, brakeType: e.target.value })}
              placeholder="Hydraulic disc, rim..."
            />
          </div>
        </div>

        {/* Price & Location */}
        <div className="edit-card">
          <div className="card-title">Price & Location</div>

          <div className="form-group">
            <label className="form-label">Price (ZAR) *</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, fontWeight: 600, color: '#9a9a9a' }}>R</span>
              <input
                className="form-input"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="5000"
                style={{ paddingLeft: 32 }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={form.negotiable}
                onChange={(e) => setForm({ ...form, negotiable: e.target.checked })}
              />
              Price is negotiable
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Province *</label>
            <select
              className="form-input"
              value={form.province}
              onChange={(e) => setForm({ ...form, province: e.target.value })}
            >
              <option value="">Select province...</option>
              {SA_PROVINCES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                className="form-input"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Johannesburg"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Postal Code</label>
              <input
                className="form-input"
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                placeholder="2000"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={form.shippingAvailable}
                onChange={(e) => setForm({ ...form, shippingAvailable: e.target.checked })}
              />
              Available to ship
            </label>
          </div>
        </div>

        {/* Photos */}
        <div className="edit-card">
          <div className="card-title">Photos</div>
          <div className="card-subtitle">{totalImages} of 15 photos</div>

          {/* Existing photos */}
          {images.length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#9a9a9a', marginBottom: 8 }}>Current photos</div>
              <div className="photo-grid">
                {images.map(img => (
                  <div key={img.id} className="photo-item">
                    <Image src={img.imageUrl} alt="Photo" className="photo-img" fill style={{ objectFit: 'cover' }} />
                    <button
                      className="photo-btn"
                      onClick={() => removeImage(img.id)}
                      title="Remove"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* New photos */}
          {newImageUrls.length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#9a9a9a', marginBottom: 8, marginTop: 12 }}>New photos</div>
              <div className="photo-grid">
                {newImageUrls.map(url => (
                  <div key={url} className="photo-item">
                    <Image src={url} alt="Photo" className="photo-img" fill style={{ objectFit: 'cover' }} />
                    <button
                      className="photo-btn"
                      onClick={() => removeNewImage(url)}
                      title="Remove"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Upload */}
          {totalImages < 15 && (
            <div
              className="dropzone"
              style={{ marginTop: 12 }}
              onClick={() => fileInputRef.current?.click()}
            >
              <div style={{ fontSize: 13, color: '#9a9a9a', marginBottom: 8 }}>
                {uploading ? 'Uploading...' : 'Click to add photos'}
              </div>
              <button className="dropzone-btn" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Choose Photos'}
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            style={{ display: 'none' }}
            onChange={() => handleAddPhotos()}
            disabled={uploading}
          />
        </div>
      </div>

      <div className="save-footer">
        <button
          className="btn-save"
          onClick={handleSave}
          disabled={saving || !form.title || !form.condition || !form.price || !form.province || !form.city}
        >
          {saving ? (
            <>
              <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default function EditPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditContent />
    </Suspense>
  )
}
