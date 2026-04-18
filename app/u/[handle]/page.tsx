import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { MapPin, Calendar, MessageCircle, Package } from 'lucide-react'
import { UserCard } from '@/components/community/UserCard'

interface PageProps { params: Promise<{ handle: string }> }

interface ProfileRow {
  id: string
  name: string
  avatar_url: string | null
  handle: string
  profile_bio: string | null
  profile_province: string | null
  profile_city: string | null
  role: string
  created_at: string
}

interface ListingRow {
  id: string
  slug: string
  title: string
  price: string
  created_at: string
  thumb: string | null
}

interface CommentRow {
  id: string
  target_type: string
  target_id: string
  body: string
  created_at: string
}

async function fetchProfile(handle: string) {
  const userRes = await db.execute(sql`
    SELECT
      id, name, avatar_url, handle,
      profile_bio, profile_province,
      CASE WHEN profile_show_city THEN profile_city ELSE NULL END AS profile_city,
      role, created_at
    FROM users
    WHERE LOWER(handle) = LOWER(${handle})
      AND is_active = true AND banned_at IS NULL
    LIMIT 1
  `)
  const user = ((userRes.rows ?? userRes) as unknown as ProfileRow[])[0]
  if (!user) return null

  const [countsRes, listingsRes, commentsRes] = await Promise.all([
    db.execute(sql`
      SELECT
        (SELECT COUNT(*)::int FROM listings WHERE seller_id = ${user.id}::uuid AND status = 'active') AS listings_active,
        (SELECT COUNT(*)::int FROM listings WHERE seller_id = ${user.id}::uuid AND status = 'sold')   AS listings_sold,
        (SELECT COUNT(*)::int FROM comments WHERE user_id  = ${user.id}::uuid AND status = 'approved') AS comments_total
    `),
    db.execute(sql`
      SELECT l.id, l.slug, l.title, l.price, l.created_at,
             (SELECT image_url FROM listing_images WHERE listing_id = l.id ORDER BY display_order ASC LIMIT 1) AS thumb
      FROM listings l
      WHERE l.seller_id = ${user.id}::uuid AND l.status = 'active' AND l.moderation_status = 'approved'
      ORDER BY l.created_at DESC
      LIMIT 6
    `),
    db.execute(sql`
      SELECT c.id, c.target_type, c.target_id, LEFT(c.body, 200) AS body, c.created_at
      FROM comments c
      WHERE c.user_id = ${user.id}::uuid AND c.status = 'approved'
      ORDER BY c.created_at DESC
      LIMIT 10
    `),
  ])
  const counts = ((countsRes.rows ?? countsRes) as Array<{
    listings_active: number; listings_sold: number; comments_total: number
  }>)[0] ?? { listings_active: 0, listings_sold: 0, comments_total: 0 }

  return {
    user,
    counts,
    listings: (listingsRes.rows ?? listingsRes) as unknown as ListingRow[],
    comments: (commentsRes.rows ?? commentsRes) as unknown as CommentRow[],
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params
  const p = await fetchProfile(handle)
  if (!p) return { title: 'Profile not found — CrankMart' }
  return {
    title: `${p.user.name} (@${p.user.handle}) — CrankMart`,
    description: p.user.profile_bio || `Cyclist on CrankMart${p.user.profile_province ? ' in ' + p.user.profile_province : ''}.`,
  }
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { handle } = await params
  const p = await fetchProfile(handle)
  if (!p) notFound()

  const memberSince = new Date(p.user.created_at).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })
  const locationLabel = [p.user.profile_city, p.user.profile_province].filter(Boolean).join(', ') || null

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px', fontFamily: 'system-ui, sans-serif', color: '#1a1a1a' }}>
      {/* Header card */}
      <section style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <UserCard
            handle={null}
            name={p.user.name}
            avatarUrl={p.user.avatar_url}
            size={72}
            showName={false}
          />
          <div style={{ flex: 1, minWidth: 220 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, letterSpacing: -0.3 }}>{p.user.name}</h1>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
              @{p.user.handle}
              {p.user.role === 'admin' || p.user.role === 'superadmin' ? (
                <span style={{ marginLeft: 8, padding: '2px 8px', background: '#EEF2FF', color: '#4338CA', borderRadius: 999, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                  Team
                </span>
              ) : null}
            </div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 10, fontSize: 13, color: '#6b7280' }}>
              {locationLabel && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={13} /> {locationLabel}
                </span>
              )}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={13} /> Joined {memberSince}
              </span>
            </div>
          </div>
        </div>

        {p.user.profile_bio && (
          <p style={{ margin: '16px 0 0', fontSize: 14, color: '#1a1a1a', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
            {p.user.profile_bio}
          </p>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          <Stat icon={<Package size={13} />} label="Listings live"  value={p.counts.listings_active} />
          <Stat icon={<Package size={13} />} label="Sold"           value={p.counts.listings_sold} />
          <Stat icon={<MessageCircle size={13} />} label="Comments" value={p.counts.comments_total} />
        </div>
      </section>

      {/* Recent listings */}
      {p.listings.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, marginBottom: 10, textTransform: 'uppercase', letterSpacing: .4, color: '#1a1a1a' }}>
            Recent listings
          </h2>
          <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
            {p.listings.map(l => (
              <Link
                key={l.id}
                href={`/browse/${l.slug}`}
                style={{
                  display: 'flex', flexDirection: 'column', background: '#fff',
                  border: '1px solid #ebebeb', borderRadius: 10, overflow: 'hidden',
                  textDecoration: 'none', color: 'inherit',
                }}
              >
                <div style={{ aspectRatio: '4/3', background: '#f5f5f5', overflow: 'hidden' }}>
                  {l.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.thumb} alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : null}
                </div>
                <div style={{ padding: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-primary)', marginTop: 4 }}>
                    R {parseInt(l.price).toLocaleString('en-ZA')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent comments */}
      {p.comments.length > 0 && (
        <section>
          <h2 style={{ fontSize: 14, fontWeight: 800, marginBottom: 10, textTransform: 'uppercase', letterSpacing: .4, color: '#1a1a1a' }}>
            Recent discussion
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {p.comments.map(c => {
              const when = new Date(c.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
              return (
                <div key={c.id} style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 11, color: '#9a9a9a', marginBottom: 4, textTransform: 'capitalize' }}>
                    {c.target_type.replace('_', ' ')} · {when}
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#1a1a1a', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                    {c.body}
                  </p>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </main>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div style={{
      padding: '8px 12px', background: '#f8f9ff', border: '1px solid #e4e4e7', borderRadius: 8,
      display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#4b5563', fontWeight: 600,
    }}>
      {icon}
      <span><strong style={{ color: '#1a1a1a', fontSize: 13 }}>{value}</strong> {label}</span>
    </div>
  )
}
