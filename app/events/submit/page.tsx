'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Calendar } from 'lucide-react'

const EVENT_TYPES = ['Road Race','MTB Race','Gran Fondo','Stage Race','Gravel Race','XCO','Enduro','Downhill','Time Trial','Triathlon','Sportive / Fun Ride','Club Ride','Other']
const PROVINCES = ['Western Cape','Gauteng','KwaZulu-Natal','Eastern Cape','Free State','Limpopo','Mpumalanga','North West','Northern Cape']
const DISCIPLINES = ['Road','MTB','Gravel','XC','Enduro','Downhill','BMX','Triathlon','Multi-Discipline']
const ENTRY_STATUSES = ['Open','Closed','Coming Soon','Free Entry','Invite Only']

export default function SubmitEventPage() {
  const [form, setForm] = useState({
    title: '', description: '', eventType: '', city: '', province: '', venueName: '',
    eventDateStart: '', eventDateEnd: '', entryUrl: '', entryStatus: 'Open', entryFee: '',
    distance: '', discipline: '', organiserName: '', organiserEmail: '', organiserWebsite: '',
    coverImageUrl: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.eventDateStart || !form.city || !form.organiserEmail) {
      setError('Please fill in title, date, city and organiser email.')
      return
    }
    setSubmitting(true); setError('')
    try {
      const res = await fetch('/api/events/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) return (
    <div style={{ minHeight:'80vh', background:'#f5f5f5', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 16px' }}>
      <div style={{ background:'#fff', borderRadius:16, padding:'48px 32px', maxWidth:480, width:'100%', textAlign:'center', border:'1px solid #ebebeb', boxShadow:'0 4px 32px rgba(0,0,0,.08)' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'#ECFDF5', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
          <CheckCircle size={36} color="#10B981" />
        </div>
        <h2 style={{ fontSize:24, fontWeight:900, color:'#1a1a1a', margin:'0 0 12px' }}>Event Submitted!</h2>
        <p style={{ fontSize:15, color:'#6b7280', margin:'0 0 28px', lineHeight:1.5 }}>
          Thank you for submitting your event. Our team will review it and you'll be notified by email once it's approved and listed on CycleMart.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
          <Link href="/events" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'10px 20px', background:'var(--color-primary)', color:'#fff', borderRadius:8, textDecoration:'none', fontSize:14, fontWeight:700 }}>
            Browse Events
          </Link>
          <button onClick={() => { setSubmitted(false); setForm({ title:'',description:'',eventType:'',city:'',province:'',venueName:'',eventDateStart:'',eventDateEnd:'',entryUrl:'',entryStatus:'Open',entryFee:'',distance:'',discipline:'',organiserName:'',organiserEmail:'',organiserWebsite:'',coverImageUrl:'' }) }}
            style={{ padding:'10px 20px', border:'1.5px solid #e4e4e7', borderRadius:8, background:'#fff', fontSize:14, fontWeight:600, cursor:'pointer', color:'#1a1a1a' }}>
            Submit Another
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ background:'#f5f5f5', minHeight:'100vh', padding:'24px 16px 80px' }}>
      <div style={{ maxWidth:720, margin:'0 auto' }}>
        <Link href="/events" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, color:'#9a9a9a', textDecoration:'none', marginBottom:20 }}>
          <ArrowLeft size={14} /> Back to Events
        </Link>

        <div style={{ background:'#fff', borderRadius:16, padding:'32px', border:'1px solid #ebebeb' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
            <div style={{ width:44, height:44, borderRadius:10, background:'#E9ECF5', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Calendar size={22} color="#0D1B2A" />
            </div>
            <div>
              <h1 style={{ fontSize:22, fontWeight:900, color:'#1a1a1a', margin:0 }}>Submit an Event</h1>
              <p style={{ margin:0, fontSize:13, color:'#9a9a9a' }}>All submissions are reviewed before publishing</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <style>{`
              .fg { margin-bottom:18px; }
              .fl { display:block; font-size:13px; font-weight:700; color:#1a1a1a; margin-bottom:6px; }
              .fl span { color:#ef4444; margin-left:2px; }
              .fi { width:100%; padding:10px 14px; border:1.5px solid #e4e4e7; border-radius:8px; font-size:14px; font-family:inherit; outline:none; box-sizing:border-box; transition:border-color .15s; }
              .fi:focus { border-color:var(--color-primary); }
              .g2 { display:grid; gap:16px; grid-template-columns:1fr 1fr; }
              @media(max-width:600px) { .g2 { grid-template-columns:1fr; } }
              .sec { padding-top:20px; border-top:1px solid #f0f0f0; margin-top:20px; }
              .sec-title { font-size:14px; font-weight:800; color:#1a1a1a; margin:0 0 16px; }
            `}</style>

            {/* Event info */}
            <div className="fg">
              <label className="fl">Event Name <span>*</span></label>
              <input className="fi" placeholder="e.g., Cape Epic 2026" value={form.title} onChange={e => update('title', e.target.value)} />
            </div>

            <div className="g2">
              <div className="fg">
                <label className="fl">Event Type</label>
                <select className="fi" value={form.eventType} onChange={e => update('eventType', e.target.value)}>
                  <option value="">Select type</option>
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="fg">
                <label className="fl">Discipline</label>
                <select className="fi" value={form.discipline} onChange={e => update('discipline', e.target.value)}>
                  <option value="">Select discipline</option>
                  {DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="g2">
              <div className="fg">
                <label className="fl">Start Date <span>*</span></label>
                <input className="fi" type="date" value={form.eventDateStart} onChange={e => update('eventDateStart', e.target.value)} />
              </div>
              <div className="fg">
                <label className="fl">End Date</label>
                <input className="fi" type="date" value={form.eventDateEnd} onChange={e => update('eventDateEnd', e.target.value)} />
              </div>
            </div>

            <div className="g2">
              <div className="fg">
                <label className="fl">City <span>*</span></label>
                <input className="fi" placeholder="e.g., Stellenbosch" value={form.city} onChange={e => update('city', e.target.value)} />
              </div>
              <div className="fg">
                <label className="fl">Province</label>
                <select className="fi" value={form.province} onChange={e => update('province', e.target.value)}>
                  <option value="">Select province</option>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="fg">
              <label className="fl">Venue / Location Name</label>
              <input className="fi" placeholder="e.g., Lourensford Wine Estate" value={form.venueName} onChange={e => update('venueName', e.target.value)} />
            </div>

            <div className="g2">
              <div className="fg">
                <label className="fl">Entry Status</label>
                <select className="fi" value={form.entryStatus} onChange={e => update('entryStatus', e.target.value)}>
                  {ENTRY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="fg">
                <label className="fl">Entry Fee</label>
                <input className="fi" placeholder="e.g., R450 or Free" value={form.entryFee} onChange={e => update('entryFee', e.target.value)} />
              </div>
            </div>

            <div className="g2">
              <div className="fg">
                <label className="fl">Distance</label>
                <input className="fi" placeholder="e.g., 100km or 3×40km stages" value={form.distance} onChange={e => update('distance', e.target.value)} />
              </div>
              <div className="fg">
                <label className="fl">Entry / Info URL</label>
                <input className="fi" type="url" placeholder="https://entries.co.za/..." value={form.entryUrl} onChange={e => update('entryUrl', e.target.value)} />
              </div>
            </div>

            <div className="fg">
              <label className="fl">Cover Image URL</label>
              <input className="fi" placeholder="https://example.com/image.jpg" value={form.coverImageUrl} onChange={e => update('coverImageUrl', e.target.value)} />
            </div>

            <div className="fg">
              <label className="fl">Description</label>
              <textarea className="fi" rows={4} style={{ resize:'vertical' }} placeholder="Tell riders what to expect — route, highlights, categories, age groups…" value={form.description} onChange={e => update('description', e.target.value)} />
            </div>

            {/* Organiser info */}
            <div className="sec">
              <p className="sec-title">Organiser Details</p>
              <div className="g2">
                <div className="fg">
                  <label className="fl">Organiser / Club Name</label>
                  <input className="fi" placeholder="e.g., Cape Epic Pty Ltd" value={form.organiserName} onChange={e => update('organiserName', e.target.value)} />
                </div>
                <div className="fg">
                  <label className="fl">Contact Email <span>*</span></label>
                  <input className="fi" type="email" placeholder="events@yourclub.co.za" value={form.organiserEmail} onChange={e => update('organiserEmail', e.target.value)} />
                </div>
              </div>
              <div className="fg">
                <label className="fl">Website</label>
                <input className="fi" type="url" placeholder="https://www.yourevent.co.za" value={form.organiserWebsite} onChange={e => update('organiserWebsite', e.target.value)} />
              </div>
            </div>

            {error && (
              <div style={{ padding:'12px 16px', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, fontSize:13, color:'#DC2626', marginBottom:16 }}>
                {error}
              </div>
            )}

            <div style={{ padding:'12px 16px', background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:8, fontSize:13, color:'#1e40af', marginBottom:20 }}>
              📋 <strong>Editorial note:</strong> All event submissions are reviewed by our team before publishing. You'll receive an email notification when your event is approved.
            </div>

            <button type="submit" disabled={submitting}
              style={{ width:'100%', height:50, background: submitting ? '#9aa5c4' : '#0D1B2A', color:'#fff', border:'none', borderRadius:8, fontSize:15, fontWeight:700, cursor: submitting ? 'default' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              <Calendar size={16} />
              {submitting ? 'Submitting…' : 'Submit Event for Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
