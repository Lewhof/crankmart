'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { upload } from '@vercel/blob/client'
import imageCompression from 'browser-image-compression'
import { ShieldAlert, Camera, Loader, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { countryFromPath } from '@/lib/regions-static'
import { getCountryConfig } from '@/lib/country-config'

export default function StolenReportPage() {
  const router = useRouter()
  const params = useSearchParams()
  const pathname = usePathname()
  const country = countryFromPath(pathname)
  const policeLabel = getCountryConfig(country).policeLabel
  const { data: session, status } = useSession()

  const [form, setForm] = useState({
    serial:          params.get('serial') ?? '',
    brand:           params.get('brand') ?? '',
    model:           '',
    year:            '',
    colour:          '',
    sapsCaseNo:      '',
    stolenDate:      '',
    stolenLocation:  '',
    proofPhotoUrl:   '',
    notes:           '',
  })
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ id: string; status: string } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=${encodeURIComponent('/community/stolen/report')}`)
    }
  }, [status, router])

  const setField = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1.2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      })
      const blob = await upload(`stolen-proof/${Date.now()}-${file.name}`, compressed, {
        access: 'public',
        handleUploadUrl: '/api/sell/upload',
      })
      setForm(f => ({ ...f, proofPhotoUrl: blob.url }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.serial.trim() || !form.brand.trim()) {
      setError('Serial number and brand are required.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/stolen/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serial:          form.serial.trim(),
          brand:           form.brand.trim(),
          model:           form.model.trim() || undefined,
          year:            form.year ? parseInt(form.year) : undefined,
          colour:          form.colour.trim() || undefined,
          sapsCaseNo:      form.sapsCaseNo.trim() || undefined,
          stolenDate:      form.stolenDate || undefined,
          stolenLocation:  form.stolenLocation.trim() || undefined,
          proofPhotoUrl:   form.proofPhotoUrl || undefined,
          notes:           form.notes.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Could not submit report.')
        setSubmitting(false)
        return
      }
      const data = await res.json()
      setSuccess({ id: data.id, status: data.status })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <main style={{ maxWidth: 640, margin: '80px auto', padding: '0 20px', textAlign: 'center', color: '#9a9a9a' }}>
        Loading…
      </main>
    )
  }

  if (success) {
    return (
      <main style={{ maxWidth: 640, margin: '80px auto', padding: '0 20px', fontFamily: 'system-ui, sans-serif', color: '#1a1a1a' }}>
        <div style={{ textAlign: 'center', padding: '40px 20px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 12 }}>
          <CheckCircle2 size={40} style={{ color: '#059669', marginBottom: 10 }} />
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 6px' }}>
            {success.status === 'approved' ? 'Published to the registry' : 'Report received'}
          </h1>
          <p style={{ margin: '0 0 18px', fontSize: 14, color: '#065F46' }}>
            {success.status === 'approved'
              ? `Your ${policeLabel.toLowerCase()} + photo passed the auto-approve gate. Your bike is now visible on the public registry.`
              : 'An admin will review your report shortly. You\'ll get an email when it\'s approved.'}
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {success.status === 'approved' && (
              <Link href={`/community/stolen/${success.id}`} style={{ padding: '10px 16px', background: 'var(--color-primary)', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                View report →
              </Link>
            )}
            <Link href="/community" style={{ padding: '10px 16px', background: '#fff', border: '1px solid #e4e4e7', color: '#1a1a1a', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
              Back to community
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px 80px', fontFamily: 'system-ui, sans-serif', color: '#1a1a1a' }}>
      <Link href="/community/stolen" style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <ArrowLeft size={12} /> Stolen registry
      </Link>
      <h1 style={{ fontSize: 26, fontWeight: 900, margin: '10px 0 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <ShieldAlert size={22} style={{ color: '#DC2626' }} /> Report your bike stolen
      </h1>
      <p style={{ margin: '0 0 24px', fontSize: 14, color: '#6b7280', lineHeight: 1.55 }}>
        Adding a bike here means any CrankMart seller attempting to list it will be blocked, and anyone checking the serial will see your report.
        <strong> Include your {policeLabel.toLowerCase()} + a proof-of-ownership photo to get auto-approved instantly.</strong>
      </p>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Row>
          <Field label="Frame serial number *">
            <input required value={form.serial} onChange={setField('serial')} placeholder="Stamped under the bottom bracket" autoComplete="off" style={inputStyle} />
          </Field>
        </Row>
        <Row two>
          <Field label="Brand *">
            <input required value={form.brand} onChange={setField('brand')} placeholder="e.g. Trek" style={inputStyle} />
          </Field>
          <Field label="Model">
            <input value={form.model} onChange={setField('model')} placeholder="e.g. Slash 8" style={inputStyle} />
          </Field>
        </Row>
        <Row two>
          <Field label="Year">
            <input type="number" value={form.year} onChange={setField('year')} placeholder="2023" style={inputStyle} />
          </Field>
          <Field label="Colour">
            <input value={form.colour} onChange={setField('colour')} placeholder="Gloss black" style={inputStyle} />
          </Field>
        </Row>

        <hr style={{ border: 0, borderTop: '1px solid #f0f0f0', margin: '4px 0' }} />
        <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: .4 }}>
          Incident
        </div>

        <Row two>
          <Field label={`${policeLabel} (auto-approve)`}>
            <input
              value={form.sapsCaseNo}
              onChange={setField('sapsCaseNo')}
              placeholder={country === 'au' ? 'e.g. E12345678 (state police)' : 'e.g. CAS 123/04/2026'}
              style={inputStyle}
            />
          </Field>
          <Field label="Date stolen">
            <input type="date" value={form.stolenDate} onChange={setField('stolenDate')} style={inputStyle} />
          </Field>
        </Row>
        <Row>
          <Field label="Where was it stolen?">
            <input value={form.stolenLocation} onChange={setField('stolenLocation')} placeholder="Suburb, city, province" style={inputStyle} />
          </Field>
        </Row>

        <Field label="Proof-of-ownership photo (auto-approve)">
          <input id="proof" type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />
          <label htmlFor="proof" style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px',
            border: '1px dashed #d1d5db', borderRadius: 8, cursor: 'pointer',
            fontSize: 13, color: '#6b7280', background: '#fff',
          }}>
            {uploading ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Camera size={14} />}
            {form.proofPhotoUrl ? 'Photo uploaded — change' : 'Upload receipt, photo of bike, or both'}
          </label>
          {form.proofPhotoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.proofPhotoUrl} alt="proof" style={{ width: 120, borderRadius: 8, marginTop: 8 }} />
          )}
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </Field>

        <Field label="Anything else we should know?">
          <textarea value={form.notes} onChange={setField('notes')} placeholder="Distinguishing features, unusual components, recent upgrades…" style={{ ...inputStyle, minHeight: 84, resize: 'vertical', fontFamily: 'inherit' }} />
        </Field>

        {error && (
          <div role="alert" style={{ padding: 12, background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: 8, fontSize: 13 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || uploading}
          style={{
            padding: '12px 16px', background: 'var(--color-primary)', color: '#fff',
            border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 800,
            cursor: submitting || uploading ? 'default' : 'pointer',
            opacity: submitting || uploading ? 0.7 : 1,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {submitting && <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />}
          Submit report
        </button>

        <p style={{ margin: '4px 0 0', fontSize: 11, color: '#9a9a9a', lineHeight: 1.5 }}>
          By submitting you confirm you&apos;re the rightful owner. False reports are removed and offenders banned.
          The reporter&apos;s identity stays private — only your report details are public.
        </p>
      </form>
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', fontSize: 14,
  border: '1px solid #d1d5db', borderRadius: 8, outline: 'none',
  boxSizing: 'border-box',
}

function Row({ children, two = false }: { children: React.ReactNode; two?: boolean }) {
  return <div style={{ display: 'grid', gridTemplateColumns: two ? '1fr 1fr' : '1fr', gap: 10 }}>{children}</div>
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1a1a1a', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  )
}
