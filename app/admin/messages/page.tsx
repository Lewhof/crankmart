'use client'

import { useEffect, useState } from 'react'

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

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ page: page.toString() })
        const res = await fetch(`/api/admin/messages?${params}`)
        const data = await res.json()
        setConversations(data.conversations)
        setTotalPages(data.pagination.totalPages)
      } catch (error) {
        console.error('Error fetching conversations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [page])

  const timeAgo = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', margin: '0 0 4px' }}>Messages</h1>
        <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>View all conversations between buyers and sellers</p>
      </div>

      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid #ebebeb',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: '60px 40px', textAlign: 'center', color: '#9a9a9a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <div style={{ width: 20, height: 20, border: '2px solid #e4e4e7', borderTopColor: '#0D1B2A', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
            <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
            Loading…
          </div>
        ) : conversations.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
            No conversations yet
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '14px',
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #ebebeb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700, color: '#6b7280' }}>
                      Listing
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700, color: '#6b7280' }}>
                      Buyer
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700, color: '#6b7280' }}>
                      Seller
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700, color: '#6b7280' }}>
                      Messages
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700, color: '#6b7280' }}>
                      Last Activity
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700, color: '#6b7280' }}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {conversations.map((conversation) => (
                    <tr key={conversation.id} style={{ borderBottom: '1px solid #ebebeb' }}>
                      <td style={{ padding: '12px', color: '#1a1a1a' }}>
                        {conversation.listing_title}
                      </td>
                      <td style={{ padding: '12px', color: '#6b7280', fontSize: '13px' }}>
                        {conversation.buyer_name}
                      </td>
                      <td style={{ padding: '12px', color: '#6b7280', fontSize: '13px' }}>
                        {conversation.seller_name}
                      </td>
                      <td style={{ padding: '12px', color: '#1a1a1a', fontWeight: '500' }}>
                        {conversation.message_count} message
                        {conversation.message_count !== 1 ? 's' : ''}
                      </td>
                      <td style={{ padding: '12px', color: '#6b7280', fontSize: '13px' }}>
                        {timeAgo(conversation.last_message_at)}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            backgroundColor: '#D1FAE5',
                            color: '#065F46',
                          }}
                        >
                          {conversation.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              style={{
                padding: '16px',
                borderTop: '1px solid #ebebeb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <button
                disabled={page === 1}
                onClick={() => setPage(Math.max(1, page - 1))}
                style={{
                  padding: '7px 16px',
                  borderRadius: 8,
                  border: '1.5px solid #e4e4e7',
                  backgroundColor: 'white',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  opacity: page === 1 ? 0.4 : 1,
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                ← Prev
              </button>
              <span style={{ color: '#6b7280', fontSize: 13 }}>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                style={{
                  padding: '7px 16px',
                  borderRadius: 8,
                  border: '1.5px solid #e4e4e7',
                  backgroundColor: 'white',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  opacity: page === totalPages ? 0.4 : 1,
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
