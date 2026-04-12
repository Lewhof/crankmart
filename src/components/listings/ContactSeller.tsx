'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { MessageCircle, Check } from 'lucide-react'

interface Props {
  listingId: string
  sellerId: string
  listingSlug: string
  sellerName: string
}

export default function ContactSeller({ listingId, sellerId, listingSlug, sellerName }: Props) {
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [error, setError] = useState('')

  if (status === 'loading') return null

  // Seller viewing own listing
  if (session?.user?.id === sellerId) {
    return (
      <div style={{ padding: '12px 16px', background: '#f0f4ff', borderRadius: 8, fontSize: 13, color: 'var(--color-primary)', fontWeight: 600, textAlign: 'center' }}>
        This is your listing
      </div>
    )
  }

  // Not logged in
  if (!session) {
    return (
      <Link href={`/login?callbackUrl=/browse/${listingSlug}`}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', height: 48, background: 'var(--color-primary)', color: '#fff', borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
        <MessageCircle size={18} />
        Contact Seller
      </Link>
    )
  }

  // Sent confirmation
  if (sent) {
    return (
      <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 700, color: '#15803d', marginBottom: 8 }}>
          <Check size={16} /> Message sent!
        </div>
        <Link href={`/account?tab=messages&conversation=${conversationId}`}
          style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
          View in your inbox →
        </Link>
      </div>
    )
  }

  const handleSend = async () => {
    if (!message.trim()) return
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/messages/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, body: message })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setConversationId(data.conversationId)
      setSent(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', height: 48, background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          <MessageCircle size={18} />
          Contact Seller
        </button>
      ) : (
        <div style={{ border: '1.5px solid #e4e4e7', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', background: '#f5f5f5', fontSize: 13, fontWeight: 600, color: '#1a1a1a', borderBottom: '1px solid #e4e4e7' }}>
            Message to {sellerName}
          </div>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Hi, is this still available? I'm interested..."
            rows={4}
            style={{ width: '100%', padding: '12px 14px', border: 'none', outline: 'none', fontSize: 14, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
            autoFocus
          />
          {error && <div style={{ padding: '6px 14px', fontSize: 12, color: '#ef4444' }}>{error}</div>}
          <div style={{ padding: '10px 14px', display: 'flex', gap: 8, borderTop: '1px solid #e4e4e7' }}>
            <button onClick={() => setOpen(false)}
              style={{ flex: 1, height: 38, background: '#f5f5f5', border: '1px solid #e4e4e7', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#1a1a1a' }}>
              Cancel
            </button>
            <button onClick={handleSend} disabled={!message.trim() || sending}
              style={{ flex: 2, height: 38, background: message.trim() && !sending ? '#0D1B2A' : '#9aa5c4', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: message.trim() && !sending ? 'pointer' : 'default' }}>
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
