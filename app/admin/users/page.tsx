'use client'

import { useEffect, useState } from 'react'
import { Shield, ShieldOff, Ban, Check } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  avatar_url: string
  created_at: string
  is_admin: boolean
  status: string
  listing_count: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [adminOnly, setAdminOnly] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          search,
          adminOnly: adminOnly.toString(),
        })
        const res = await fetch(`/api/admin/users?${params}`)
        const data = await res.json()
        setUsers(data.users)
        setTotalPages(data.pagination.totalPages)
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [page, search, adminOnly])

  const handleAction = async (id: string, action: string) => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (res.ok) {
        // Refetch users
        const params = new URLSearchParams({
          page: page.toString(),
          search,
          adminOnly: adminOnly.toString(),
        })
        const newRes = await fetch(`/api/admin/users?${params}`)
        const data = await newRes.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error performing action:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', margin: '0 0 4px' }}>Users Management</h1>
        <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Manage user accounts, admin roles and bans</p>
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
            Search
          </label>
          <input
            type="text"
            placeholder="Search by name or email..."
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

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={adminOnly}
              onChange={(e) => {
                setAdminOnly(e.target.checked)
                setPage(1)
              }}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Admin only</span>
          </label>
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
                      User
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700, color: '#6b7280' }}>
                      Email
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700, color: '#6b7280' }}>
                      Joined
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700, color: '#6b7280' }}>
                      Listings
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700, color: '#6b7280' }}>
                      Status
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700, color: '#6b7280' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #ebebeb' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              backgroundColor: '#0D1B2A',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '13px',
                              fontWeight: '700',
                            }}
                          >
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <div style={{ color: '#1a1a1a', fontWeight: 500 }}>{user.name}</div>
                            {user.is_admin && (
                              <div
                                style={{
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  color: '#0D1B2A',
                                }}
                              >
                                Admin
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px', color: '#6b7280', fontSize: '13px' }}>{user.email}</td>
                      <td style={{ padding: '12px', color: '#6b7280', fontSize: '13px' }}>
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px', color: '#1a1a1a', fontWeight: 500 }}>
                        {user.listing_count}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            backgroundColor: user.status === 'banned' ? '#FEE2E2' : '#D1FAE5',
                            color: user.status === 'banned' ? '#991B1B' : '#065F46',
                          }}
                        >
                          {user.status === 'banned' ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {user.is_admin ? (
                            <ActionButton
                              color="#dc2626"
                              onClick={() => handleAction(user.id, 'remove_admin')}
                            >
                              <ShieldOff size={14} />
                              Demote
                            </ActionButton>
                          ) : (
                            <ActionButton
                              color="#16a34a"
                              onClick={() => handleAction(user.id, 'make_admin')}
                            >
                              <Shield size={14} />
                              Promote
                            </ActionButton>
                          )}
                          {user.status === 'banned' ? (
                            <ActionButton
                              color="#16a34a"
                              onClick={() => handleAction(user.id, 'unban')}
                            >
                              <Check size={14} />
                              Unban
                            </ActionButton>
                          ) : (
                            <ActionButton
                              color="#dc2626"
                              onClick={() => handleAction(user.id, 'ban')}
                            >
                              <Ban size={14} />
                              Ban
                            </ActionButton>
                          )}
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
