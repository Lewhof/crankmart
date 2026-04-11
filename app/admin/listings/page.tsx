'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Eye, Trash2, CheckCircle, XCircle } from 'lucide-react'

interface Listing {
  id: string
  title: string
  seller_name: string
  price: string
  status: string
  moderation_status: string
  created_at: string
  thumb_url: string
  category_id: number
  slug: string
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [status, setStatus] = useState('all')
  const [moderation, setModeration] = useState('all')
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          status,
          moderation,
          search,
        })
        const res = await fetch(`/api/admin/listings?${params}`)
        const data = await res.json()
        setListings(data.listings)
        setTotalPages(data.pagination.totalPages)
      } catch (error) {
        console.error('Error fetching listings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [page, status, moderation, search])

  const handleAction = async (id: string, action: string) => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (res.ok) {
        // Refetch listings
        const params = new URLSearchParams({
          page: page.toString(),
          status,
          moderation,
          search,
        })
        const newRes = await fetch(`/api/admin/listings?${params}`)
        const data = await newRes.json()
        setListings(data.listings)
      }
    } catch (error) {
      console.error('Error performing action:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const statusBadgeColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      pending: { bg: '#FEF3C7', text: '#92400E' },
      approved: { bg: '#D1FAE5', text: '#065F46' },
      rejected: { bg: '#FEE2E2', text: '#991B1B' },
      active: { bg: '#D1FAE5', text: '#065F46' },
      deleted: { bg: '#F3F4F6', text: '#6B7280' },
      draft: { bg: '#F3F4F6', text: '#6B7280' },
      sold: { bg: '#F3F4F6', text: '#6B7280' },
    }
    return colors[status] || { bg: '#F3F4F6', text: '#6B7280' }
  }

  const ActionButton = ({
    onClick,
    children,
    color,
  }: {
    onClick: () => void
    children: React.ReactNode
    color: string
  }) => (
    <button
      onClick={onClick}
      disabled={actionLoading !== null}
      style={{
        height: 30,
        padding: '0 12px',
        borderRadius: 6,
        border: 'none',
        fontSize: 12,
        fontWeight: 600,
        cursor: actionLoading ? 'not-allowed' : 'pointer',
        opacity: actionLoading ? 0.6 : 1,
        backgroundColor: color,
        color: 'white',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {children}
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', margin: '0 0 4px' }}>Listings Management</h1>
        <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Review, moderate and manage all marketplace listings</p>
      </div>

      {/* Filters */}
      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid #ebebeb',
          borderRadius: 8,
          padding: '16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#374151' }}>
            Status
          </label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 8,
              border: '1.5px solid #e4e4e7',
              fontSize: 13,
            }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="sold">Sold</option>
            <option value="draft">Draft</option>
            <option value="deleted">Deleted</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#374151' }}>
            Moderation
          </label>
          <select
            value={moderation}
            onChange={(e) => {
              setModeration(e.target.value)
              setPage(1)
            }}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 8,
              border: '1.5px solid #e4e4e7',
              fontSize: 13,
            }}
          >
            <option value="all">All Moderation</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#374151' }}>
            Search
          </label>
          <input
            type="text"
            placeholder="Search title or seller..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 8,
              border: '1.5px solid #e4e4e7',
              fontSize: 13,
            }}
          />
        </div>
      </div>

      {/* Table */}
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
                      Title
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700, color: '#6b7280' }}>
                      Seller
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700, color: '#6b7280' }}>
                      Price
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700, color: '#6b7280' }}>
                      Status
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700, color: '#6b7280' }}>
                      Moderation
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700, color: '#6b7280' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing.id} style={{ borderBottom: '1px solid #ebebeb' }}>
                      <td style={{ padding: '12px', color: '#1a1a1a' }}>{listing.title}</td>
                      <td style={{ padding: '12px', color: '#6b7280' }}>{listing.seller_name}</td>
                      <td style={{ padding: '12px', color: '#1a1a1a', fontWeight: 500 }}>
                        R{parseFloat(listing.price).toFixed(2)}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            backgroundColor: statusBadgeColor(listing.status).bg,
                            color: statusBadgeColor(listing.status).text,
                          }}
                        >
                          {listing.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            backgroundColor: statusBadgeColor(listing.moderation_status).bg,
                            color: statusBadgeColor(listing.moderation_status).text,
                          }}
                        >
                          {listing.moderation_status}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {listing.moderation_status === 'pending' && (
                            <>
                              <ActionButton
                                color="#16a34a"
                                onClick={() => handleAction(listing.id, 'approve')}
                              >
                                <CheckCircle size={14} />
                                Approve
                              </ActionButton>
                              <ActionButton
                                color="#dc2626"
                                onClick={() => handleAction(listing.id, 'reject')}
                              >
                                <XCircle size={14} />
                                Reject
                              </ActionButton>
                            </>
                          )}
                          <ActionButton
                            color="#3b82f6"
                            onClick={() =>
                              window.open(`/browse/${listing.slug}`, '_blank')
                            }
                          >
                            <Eye size={14} />
                            View
                          </ActionButton>
                          <ActionButton
                            color="#dc2626"
                            onClick={() => handleAction(listing.id, 'delete')}
                          >
                            <Trash2 size={14} />
                            Delete
                          </ActionButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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
