'use client'

import { useState } from 'react'
import { Flag } from 'lucide-react'

/**
 * Report-a-comment / report-a-listing button. Opens a small modal with the
 * FLAG_REASONS radio list and an optional notes textarea. Posts to
 * /api/community/flag and silently succeeds; users never see "we received
 * your flag" follow-up because that encourages flag-spam. Just "Thanks".
 */
const REASONS = [
  { value: 'spam',         label: 'Spam or advertising' },
  { value: 'abusive',      label: 'Abusive or harassing' },
  { value: 'misleading',   label: 'Misleading or a scam' },
  { value: 'off_topic',    label: 'Off-topic' },
  { value: 'private_info', label: 'Contains private info' },
  { value: 'other',        label: 'Other' },
]

export function FlagButton({
  targetType,
  targetId,
  label = 'Report',
  compact = false,
}: {
  targetType: string
  targetId: string
  label?: string
  compact?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('spam')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function submit() {
    setBusy(true)
    try {
      await fetch('/api/community/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, reason, notes: notes.trim() || undefined }),
      })
      setDone(true)
      setTimeout(() => { setOpen(false); setDone(false); setNotes('') }, 1200)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title={label}
        style={compact ? {
          background: 'transparent', border: 'none', color: '#9a9a9a',
          cursor: 'pointer', padding: 4, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4,
        } : {
          background: 'transparent', border: '1px solid #e4e4e7', color: '#6b7280',
          cursor: 'pointer', padding: '6px 10px', borderRadius: 6, fontSize: 12,
          display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600,
        }}
      >
        <Flag size={12} /> {!compact && label}
      </button>

      {open && (
        <div
          onClick={() => !busy && setOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 12, padding: 22, width: 420, maxWidth: '100%',
              boxShadow: '0 24px 60px rgba(0,0,0,.2)',
            }}
          >
            <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 800, color: '#1a1a1a' }}>Report content</h3>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: '#6b7280' }}>
              Our team reviews every report. Thanks for helping keep CrankMart safe.
            </p>

            {done ? (
              <div style={{ padding: '16px 0', textAlign: 'center', fontSize: 14, color: '#065F46', fontWeight: 600 }}>
                Thanks — report received.
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gap: 6, marginBottom: 14 }}>
                  {REASONS.map(r => (
                    <label key={r.value} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                      border: '1px solid', borderColor: reason === r.value ? 'var(--color-primary)' : '#ebebeb',
                      borderRadius: 8, cursor: 'pointer', fontSize: 13,
                      background: reason === r.value ? 'rgba(234,88,12,.06)' : '#fff',
                    }}>
                      <input
                        type="radio" name="reason" value={r.value}
                        checked={reason === r.value}
                        onChange={e => setReason(e.target.value)}
                      />
                      {r.label}
                    </label>
                  ))}
                </div>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Details (optional)"
                  style={{
                    width: '100%', minHeight: 70, padding: 10, fontSize: 13,
                    border: '1px solid #ebebeb', borderRadius: 8, resize: 'vertical',
                    fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 14,
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button
                    onClick={() => !busy && setOpen(false)}
                    style={{ background: '#fff', border: '1px solid #e4e4e7', padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submit}
                    disabled={busy}
                    style={{
                      background: 'var(--color-primary)', color: '#fff', border: 'none',
                      padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                      cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.7 : 1,
                    }}
                  >
                    {busy ? 'Sending…' : 'Submit report'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
