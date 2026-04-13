'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  PageHeader, Table, StatusPill, Button, Empty,
} from '@/components/admin/primitives'

interface Conversation {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  status: string
  message_count: number
  last_message_at: string
  listing_title: string
  buyer_name: string
  seller_name: string
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchConversations = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString() })
      const res = await fetch(`/api/admin/messages?${params}`)
      const data = await res.json()
      setConversations(data.conversations ?? [])
      setTotalPages(data.pagination?.totalPages ?? 1)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchConversations() }, [fetchConversations])

  const rows = conversations.map(c => ({
    id: c.id,
    cells: [
      <span key="l" style={{ fontWeight: 600 }}>{c.listing_title}</span>,
      <span key="b" style={{ color: 'var(--admin-text-dim)' }}>{c.buyer_name}</span>,
      <span key="s" style={{ color: 'var(--admin-text-dim)' }}>{c.seller_name}</span>,
      <span key="m">{c.message_count} message{c.message_count !== 1 ? 's' : ''}</span>,
      <span key="t" style={{ color: 'var(--admin-text-dim)', fontSize: 12 }}>{timeAgo(c.last_message_at)}</span>,
      <StatusPill key="st" label={c.status} tone="success" />,
    ],
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader title="Messages" subtitle="View all conversations between buyers and sellers" />

      {loading ? (
        <Empty message="Loading conversations…" />
      ) : (
        <Table
          head={['Listing', 'Buyer', 'Seller', 'Messages', 'Last Activity', 'Status']}
          rows={rows}
          empty="No conversations yet"
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>← Prev</Button>
        <span style={{ color: 'var(--admin-text-dim)', fontSize: 12 }}>Page {page} of {totalPages}</span>
        <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next →</Button>
      </div>
    </div>
  )
}
