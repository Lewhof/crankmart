'use client'

import { useEffect, useState } from 'react'

interface Stats {
  totalListings: number
  activeListings: number
  totalUsers: number
  newUsersThisWeek: number
  totalEvents: number
  totalBusinesses: number
  totalConversations: number
  pendingModeration: number
}

interface RecentListing {
  id: string
  title: string
  seller_name: string
  price: string
  status: string
  moderation_status: string
  created_at: string
  thumb_url: string
}

interface RecentUser {
  id: string
  name: string
  email: string
  avatar_url: string
  created_at: string
  is_admin: boolean
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentListings, setRecentListings] = useState<RecentListing[]>([])
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, listingsRes, usersRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/listings?page=1&limit=5'),
          fetch('/api/admin/users?page=1'),
        ])

        if (statsRes.status === 401 || statsRes.status === 403) {
          window.location.href = '/login?callbackUrl=/admin'
          return
        }

        const statsData = await statsRes.json()
        if (!statsData.error) setStats(statsData)

        const listingsData = await listingsRes.json()
        setRecentListings(listingsData.listings || [])

        const usersData = await usersRes.json()
        setRecentUsers((usersData.users || []).slice(0, 5))
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const StatCard = ({ number, label, trend }: { number: number; label: string; trend: string }) => (
    <div
      style={{
        backgroundColor: 'white',
        border: '1px solid #ebebeb',
        borderRadius: '8px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ fontSize: '32px', fontWeight: '700', color: '#0D1B2A' }}>{number}</div>
      <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>{label}</div>
      <div style={{ fontSize: '12px', color: '#999' }}>{trend}</div>
    </div>
  )

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

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          color: '#666',
        }}
      >
        Loading...
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', margin: '0 0 4px' }}>Dashboard</h1>
        <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Welcome to the CycleMart admin panel</p>
      </div>
      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}
      >
        <StatCard
          number={stats?.totalListings || 0}
          label="Total Listings"
          trend={`${stats?.activeListings || 0} active`}
        />
        <StatCard
          number={stats?.totalUsers || 0}
          label="Total Users"
          trend={`+${stats?.newUsersThisWeek || 0} this week`}
        />
        <StatCard
          number={stats?.totalEvents || 0}
          label="Total Events"
          trend="Upcoming events"
        />
        <StatCard
          number={stats?.pendingModeration || 0}
          label="Pending Moderation"
          trend="Requires review"
        />
        <StatCard
          number={stats?.totalBusinesses || 0}
          label="Businesses"
          trend="In directory"
        />
        <StatCard
          number={stats?.totalConversations || 0}
          label="Conversations"
          trend="Total messages"
        />
      </div>

      {/* Quick navigation */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:10 }}>
        {[
          { href:'/admin/listings',  label:'Listings',   color:'#0D1B2A' },
          { href:'/admin/events',    label:'Events',     color:'#059669' },
          { href:'/admin/news',      label:'Articles',   color:'#7C3AED' },
          { href:'/admin/directory', label:'Directory',  color:'#B45309' },
          { href:'/admin/users',     label:'Users',      color:'#DC2626' },
          { href:'/admin/messages',  label:'Messages',   color:'#0369A1' },
          { href:'/admin/settings',  label:'Settings',   color:'#4B5563' },
          { href:'/style-guide',     label:'Style Guide',color:'#EA580C' },
        ].map(({ href, label, color }) => (
          <a key={href} href={href}
            style={{ display:'block', padding:'14px 16px', background:'#fff', border:'1px solid #ebebeb', borderRadius:10, textDecoration:'none', fontWeight:700, fontSize:13, color, borderLeft:`3px solid ${color}`, transition:'box-shadow .15s' }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.08)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
            {label} →
          </a>
        ))}
      </div>

      {/* Tables */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Recent Listings */}
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #ebebeb',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '20px', borderBottom: '1px solid #ebebeb' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
              Recent Listings
            </h3>
          </div>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #ebebeb' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#666' }}>
                  Title
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#666' }}>
                  Seller
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#666' }}>
                  Price
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#666' }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recentListings.map((listing) => (
                <tr key={listing.id} style={{ borderBottom: '1px solid #ebebeb' }}>
                  <td style={{ padding: '12px', color: '#1a1a1a' }}>{listing.title}</td>
                  <td style={{ padding: '12px', color: '#666' }}>{listing.seller_name}</td>
                  <td style={{ padding: '12px', color: '#1a1a1a', fontWeight: '500' }}>
                    R{parseFloat(listing.price).toFixed(2)}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: statusBadgeColor(listing.status).bg,
                        color: statusBadgeColor(listing.status).text,
                      }}
                    >
                      {listing.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Users */}
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #ebebeb',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '20px', borderBottom: '1px solid #ebebeb' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
              Recent Users
            </h3>
          </div>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #ebebeb' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#666' }}>
                  Name
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#666' }}>
                  Email
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#666' }}>
                  Joined
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#666' }}>
                  Admin
                </th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #ebebeb' }}>
                  <td style={{ padding: '12px', color: '#1a1a1a', fontWeight: '500' }}>
                    {user.name}
                  </td>
                  <td style={{ padding: '12px', color: '#666', fontSize: '13px' }}>{user.email}</td>
                  <td style={{ padding: '12px', color: '#666', fontSize: '13px' }}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {user.is_admin ? (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          backgroundColor: '#0D1B2A',
                          color: 'white',
                        }}
                      >
                        Admin
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
