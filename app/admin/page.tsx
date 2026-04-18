import Link from 'next/link'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { getAdminCountry } from '@/lib/admin-country'
import { formatPrice } from '@/lib/currency'
import { Card, PageHeader, StatCard, StatusPill, Table, Empty } from '@/components/admin/primitives'
import { toneForStatus } from '@/components/admin/tone'
import { ArrowRight } from 'lucide-react'

interface CountRow { count: number | string }

async function q(country: string, stmt: ReturnType<typeof sql>): Promise<number> {
  try {
    const r = await db.execute(stmt)
    const row = (r.rows ?? r)[0] as unknown as CountRow | undefined
    return parseInt((row?.count ?? '0').toString())
  } catch { return 0 }
}

export default async function AdminDashboard() {
  const country = await getAdminCountry()

  const [
    totalListings, activeListings, pendingListings,
    totalUsers, newUsersWeek,
    totalEvents, pendingEvents,
    totalBusinesses, pendingBusinesses,
    totalNews, pendingNews,
  ] = await Promise.all([
    q(country, sql`SELECT COUNT(*) as count FROM listings WHERE country = ${country}`),
    q(country, sql`SELECT COUNT(*) as count FROM listings WHERE country = ${country} AND status = 'active'`),
    q(country, sql`SELECT COUNT(*) as count FROM listings WHERE country = ${country} AND moderation_status = 'pending'`),
    q(country, sql`SELECT COUNT(*) as count FROM users WHERE country = ${country}`),
    q(country, sql`SELECT COUNT(*) as count FROM users WHERE country = ${country} AND created_at >= NOW() - INTERVAL '7 days'`),
    q(country, sql`SELECT COUNT(*) as count FROM events WHERE country = ${country}`),
    q(country, sql`SELECT COUNT(*) as count FROM events WHERE country = ${country} AND status IN ('pending_review','draft')`),
    q(country, sql`SELECT COUNT(*) as count FROM businesses WHERE country = ${country}`),
    q(country, sql`SELECT COUNT(*) as count FROM businesses WHERE country = ${country} AND status = 'pending'`),
    q(country, sql`SELECT COUNT(*) as count FROM news_articles WHERE country = ${country}`),
    q(country, sql`SELECT COUNT(*) as count FROM news_articles WHERE country = ${country} AND status = 'pending'`),
  ])

  const recentListings = await db.execute(sql`
    SELECT l.id, l.title, l.slug, l.price, l.status, l.moderation_status, l.created_at,
           u.name as seller_name
    FROM listings l JOIN users u ON l.seller_id = u.id
    WHERE l.country = ${country}
    ORDER BY l.created_at DESC LIMIT 5
  `)
  const recentUsers = await db.execute(sql`
    SELECT id, name, email, created_at, role
    FROM users WHERE country = ${country}
    ORDER BY created_at DESC LIMIT 5
  `)

  const listingRows = (recentListings.rows ?? recentListings) as Array<{
    id: string; title: string; slug: string; price: string; status: string;
    moderation_status: string; created_at: string; seller_name: string
  }>
  const userRows = (recentUsers.rows ?? recentUsers) as Array<{
    id: string; name: string; email: string; created_at: string; role: string | null
  }>

  const actionable = [
    { count: pendingListings, label: 'listings pending moderation', href: '/admin/listings?moderation=pending' },
    { count: pendingEvents, label: 'events awaiting review', href: '/admin/events?status=pending' },
    { count: pendingBusinesses, label: 'businesses awaiting approval', href: '/admin/directory?status=pending' },
    { count: pendingNews, label: 'articles pending', href: '/admin/news?status=pending' },
  ].filter(a => a.count > 0)

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`Showing data for ${country.toUpperCase()}. Switch country in the top bar.`}
      />

      {/* Actionable alerts */}
      {actionable.length > 0 && (
        <div style={{ display: 'grid', gap: 8, marginBottom: 20 }}>
          {actionable.map(a => (
            <Link
              key={a.href}
              href={a.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                background: 'color-mix(in oklch, var(--admin-warn) 15%, transparent)',
                border: '1px solid color-mix(in oklch, var(--admin-warn) 35%, transparent)',
                borderRadius: 8,
                color: 'var(--admin-text)',
                textDecoration: 'none',
                fontSize: 13,
              }}
            >
              <strong style={{ color: 'var(--admin-warn)' }}>{a.count}</strong>
              <span style={{ flex: 1 }}>{a.label}</span>
              <span style={{ color: 'var(--admin-text-dim)', fontSize: 12 }}>Review <ArrowRight size={12} style={{ verticalAlign: 'middle' }} /></span>
            </Link>
          ))}
        </div>
      )}

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard label="Listings" value={totalListings} hint={`${activeListings} active`} tone="accent" />
        <StatCard label="Users" value={totalUsers} hint={`+${newUsersWeek} this week`} tone="success" />
        <StatCard label="Events" value={totalEvents} hint={pendingEvents ? `${pendingEvents} pending` : 'all reviewed'} tone={pendingEvents ? 'warn' : 'neutral'} />
        <StatCard label="Businesses" value={totalBusinesses} hint={pendingBusinesses ? `${pendingBusinesses} pending` : 'all approved'} tone={pendingBusinesses ? 'warn' : 'neutral'} />
        <StatCard label="News articles" value={totalNews} hint={pendingNews ? `${pendingNews} pending` : 'all handled'} tone={pendingNews ? 'warn' : 'neutral'} />
      </div>

      {/* Recent tables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 16 }}>
        <Card padded={false}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Recent Listings</h3>
            <Link href="/admin/listings" style={{ fontSize: 12, color: 'var(--admin-accent)', textDecoration: 'none' }}>View all →</Link>
          </div>
          {listingRows.length === 0 ? (
            <Empty message="No listings yet in this country." />
          ) : (
            <Table
              head={['Title', 'Seller', 'Price', 'Status']}
              rows={listingRows.map(l => ({
                id: l.id,
                cells: [
                  <Link key="t" href={`/admin/listings/${l.id}`} style={{ color: 'var(--admin-text)', textDecoration: 'none', fontWeight: 600 }}>{l.title}</Link>,
                  l.seller_name,
                  formatPrice(country, l.price),
                  <StatusPill key="s" label={l.moderation_status} tone={toneForStatus(l.moderation_status)} />,
                ],
              }))}
            />
          )}
        </Card>

        <Card padded={false}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Recent Users</h3>
            <Link href="/admin/users" style={{ fontSize: 12, color: 'var(--admin-accent)', textDecoration: 'none' }}>View all →</Link>
          </div>
          {userRows.length === 0 ? (
            <Empty message="No users yet in this country." />
          ) : (
            <Table
              head={['Name', 'Email', 'Joined']}
              rows={userRows.map(u => ({
                id: u.id,
                cells: [
                  <span key="n" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {u.name}
                    {(u.role === 'admin' || u.role === 'superadmin') && <StatusPill label={u.role} tone="accent" />}
                  </span>,
                  <span key="e" style={{ color: 'var(--admin-text-dim)' }}>{u.email}</span>,
                  <span key="d" style={{ color: 'var(--admin-text-dim)', fontSize: 12 }}>
                    {new Date(u.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                  </span>,
                ],
              }))}
            />
          )}
        </Card>
      </div>
    </div>
  )
}
