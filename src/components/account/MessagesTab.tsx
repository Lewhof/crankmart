'use client'
import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MessageCircle, Send } from 'lucide-react'

interface Conversation {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  listing_title: string
  listing_slug: string
  listing_image: string | null
  last_message: string | null
  last_message_at: string
  status: string
  buyer_name: string
  seller_name: string
  buyer_avatar: string | null
  seller_avatar: string | null
  buyer_unread_count: number
  seller_unread_count: number
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  is_read: boolean
  created_at: string
}

export default function MessagesTab() {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingThread, setLoadingThread] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load conversations on mount
  useEffect(() => {
    fetchConversations()
  }, [])

  // Load selected thread
  useEffect(() => {
    if (selectedConvId) {
      fetchThread(selectedConvId)
    }
  }, [selectedConvId])

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Poll for new messages every 10s when thread is open
  useEffect(() => {
    if (selectedConvId) {
      pollIntervalRef.current = setInterval(() => {
        fetchThread(selectedConvId, false)
      }, 10000)
      return () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
      }
    }
  }, [selectedConvId])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/messages')
      if (res.ok) {
        const data = await res.json()
        setConversations(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchThread = async (convId: string, showLoading = true) => {
    try {
      if (showLoading) setLoadingThread(true)
      const res = await fetch(`/api/messages/${convId}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedConv(data.conversation)
        setMessages(Array.isArray(data.messages) ? data.messages : [])
        // Refresh conversations to update unread counts
        fetchConversations()
      }
    } catch (error) {
      console.error('Failed to fetch thread:', error)
    } finally {
      if (showLoading) setLoadingThread(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConvId) return
    setSending(true)
    try {
      const res = await fetch(`/api/messages/${selectedConvId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: newMessage })
      })
      if (res.ok) {
        setNewMessage('')
        await fetchThread(selectedConvId)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const getOtherParty = (conv: Conversation) => {
    return session?.user?.id === conv.buyer_id
      ? { name: conv.seller_name, avatar: conv.seller_avatar }
      : { name: conv.buyer_name, avatar: conv.buyer_avatar }
  }

  const formatTime = (dateStr: string) => {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })
  }

  // Thread view (selected conversation)
  if (selectedConv && session?.user?.id) {
    const otherParty = getOtherParty(selectedConv)
    const isCurrentUserBuyer = session.user.id === selectedConv.buyer_id

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 280px)', background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid #ebebeb' }}>
        {/* Thread header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid #ebebeb', background: '#f5f5f5' }}>
          <button onClick={() => { setSelectedConvId(null); setMessages([]) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <ArrowLeft size={18} color="#1a1a1a" />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{otherParty.name}</div>
            <Link href={`/browse/${selectedConv.listing_slug}`} style={{ fontSize: 12, color: '#9a9a9a', textDecoration: 'none' }}>
              {selectedConv.listing_title}
            </Link>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loadingThread && messages.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <div style={{ color: '#9a9a9a', fontSize: 13 }}>Loading messages…</div>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <div style={{ color: '#9a9a9a', fontSize: 13 }}>No messages yet</div>
            </div>
          ) : (
            messages.map(msg => {
              const isOwn = msg.sender_id === session.user?.id
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '75%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: isOwn ? '#0D1B2A' : '#f5f5f5',
                    color: isOwn ? '#fff' : '#1a1a1a',
                    wordWrap: 'break-word',
                  }}>
                    <div style={{ fontSize: 14, lineHeight: 1.4 }}>{msg.body}</div>
                    <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>{formatTime(msg.created_at)}</div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #ebebeb', display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyPress={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage() } }}
            placeholder="Type your message…"
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid #e4e4e7',
              borderRadius: 6,
              fontSize: 13,
              outline: 'none',
              fontFamily: 'inherit',
            }}
            disabled={sending}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            style={{
              width: 38,
              height: 38,
              background: newMessage.trim() && !sending ? '#0D1B2A' : '#9aa5c4',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              cursor: newMessage.trim() && !sending ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    )
  }

  // Inbox list view
  return (
    <div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9a9a9a' }}>Loading messages…</div>
      ) : conversations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ width: 56, height: 56, background: '#f0f4ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <MessageCircle size={24} color="#0D1B2A" />
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>No messages yet</div>
          <div style={{ fontSize: 13, color: '#9a9a9a', marginBottom: 20 }}>When you contact a seller or receive an enquiry, it will appear here.</div>
          <Link href="/browse" style={{ display: 'inline-block', height: 44, padding: '0 20px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', lineHeight: '44px' }}>
            Browse listings
          </Link>
        </div>
      ) : (
        <div>
          {conversations.map(conv => {
            const otherParty = getOtherParty(conv)
            const unreadCount = session?.user?.id === conv.buyer_id ? conv.buyer_unread_count : conv.seller_unread_count
            return (
              <button
                key={conv.id}
                onClick={() => setSelectedConvId(conv.id)}
                style={{
                  width: '100%',
                  background: '#fff',
                  border: '1px solid #ebebeb',
                  borderRadius: 8,
                  display: 'flex',
                  gap: 12,
                  padding: '12px',
                  marginBottom: 10,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {/* Listing thumbnail */}
                <div style={{ width: 72, height: 72, borderRadius: 8, background: '#f5f5f5', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                  {conv.listing_image ? (
                    <Image src={conv.listing_image} alt={conv.listing_title} fill style={{ objectFit: 'cover' }} sizes="72px" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#e8edf5' }} />
                  )}
                </div>

                {/* Conversation info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 2 }}>{otherParty.name}</div>
                  <div style={{ fontSize: 12, color: '#9a9a9a', marginBottom: 4 }}>{conv.listing_title}</div>
                  <div style={{ fontSize: 13, color: '#6b6b6b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {conv.last_message}
                  </div>
                  <div style={{ fontSize: 11, color: '#9a9a9a', marginTop: 4 }}>{formatTime(conv.last_message_at)}</div>
                </div>

                {/* Unread badge */}
                {unreadCount > 0 && (
                  <div style={{
                    width: 24,
                    height: 24,
                    background: '#EF4444',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {unreadCount}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
