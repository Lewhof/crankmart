import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'

import { MapPin, Navigation, Clock, Mountain, ChevronLeft, Download, ExternalLink, Phone, Mail, Star, ChevronRight } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import MiniMap from './MiniMap'

import GalleryWrapper from './GalleryWrapper'
import ReviewsSection from './ReviewsSection'

const DISCIPLINE_COLOR: Record<string, string> = {
  road: '#3B82F6', mtb: '#7C3AED', gravel: '#D97706', urban: '#10B981', bikepacking: '#EC4899',
}
const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: '#16A34A', intermediate: '#D97706', advanced: '#DC2626', expert: '#7C3AED',
}
const FACILITY_LABELS: Record<string, string> = {
  parking: '🅿️ Parking', toilets: '🚻 Toilets', coffee: '☕ Coffee',
  showers: '🚿 Showers', washBay: '🚲 Wash Bay', restaurant: '🍽️ Restaurant',
}

async function getRoute(slug: string) {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3099'
  try {
    const res = await fetch(`${baseUrl}/api/routes/${encodeURIComponent(slug)}`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const data = await getRoute(slug)
  if (!data?.route) return { title: 'Route — CrankMart' }
  const r = data.route
  return {
    title: `${r.name} — CrankMart`,
    description: r.description?.slice(0, 155) ?? `${r.discipline} route in ${r.province}`,
    openGraph: { title: `${r.name} — CrankMart`, description: r.description?.slice(0, 155) ?? '', images: r.hero_image_url ? [{ url: r.hero_image_url }] : [] },
  }
}

function formatTime(minutes: number | null): string {
  if (!minutes) return '–'
  const h = Math.floor(minutes / 60), m = minutes % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} hr`
  return `${h} hr ${m} min`
}

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => <Star key={i} size={14} style={{ color: i <= rating ? '#F59E0B' : '#E5E7EB', fill: i <= rating ? '#F59E0B' : 'none' }} />)}
    </div>
  )
}

export default async function RouteDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getRoute(slug)
  if (!data?.route) notFound()

  const { route: r, images, loops, reviews, nearby } = data
  const facilities = (r.facilities as Record<string, boolean> | null) ?? {}
  const facilityItems = Object.entries(facilities).filter(([, v]) => v)
  const tags = (r.tags as string[] | null) ?? []
  const avgRating = parseFloat(r.avg_rating ?? '0')
  const reviewCount = parseInt(r.review_count ?? '0')
  const disciplineColor = DISCIPLINE_COLOR[r.discipline] ?? '#64748B'
  const difficultyColor = DIFFICULTY_COLOR[r.difficulty] ?? '#64748B'
  // Unique loop difficulties (or fall back to the route's own difficulty)
  const knownDifficulties = Object.keys(DIFFICULTY_COLOR)
  const loopDiffRaw = loops && (loops as any[]).length > 0
    ? (loops as any[]).map((l: any) => (l.difficulty ?? '').trim().toLowerCase()).filter(Boolean)
    : []
  const loopDifficulties: string[] = loopDiffRaw.length > 0
    ? [...new Set<string>(loopDiffRaw)].filter(d => knownDifficulties.includes(d)).sort()
    : [r.difficulty].filter(Boolean)

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>

      <style>{`
        .route-detail-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
        @media (min-width: 768px) { .route-detail-grid { grid-template-columns: 1fr 320px; gap: 32px; } }
        .route-sidebar { position: static !important; }
        @media (min-width: 768px) { .route-sidebar { position: sticky !important; top: 76px; } }
      `}</style>

      {/* Breadcrumb strip */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ebebeb' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '10px 20px' }}>
          <Breadcrumb items={[
            { label: 'Routes', href: '/routes' },
            { label: r.name as string },
          ]} />
        </div>
      </div>

      {/* Gallery */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px' }}>
        <GalleryWrapper
          images={(images ?? []).map((img: any) => ({
            id: img.id,
            url: img.url,
            thumbUrl: img.thumb_url ?? null,
            mediumUrl: img.medium_url ?? null,
            altText: img.alt_text ?? null,
            isPrimary: img.is_primary ?? false,
            displayOrder: img.display_order ?? 0,
          }))}
          routeName={r.name}
          heroFallback={r.hero_image_url ?? r.primary_image_url}
        />
      </div>

      {/* Title band */}
      <div style={{ background: 'var(--color-night-ride)', padding: '18px 0 16px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{ background: disciplineColor, color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 2, textTransform: 'uppercase' }}>{r.discipline}</span>
            {loopDifficulties.filter(d => d && d.trim()).map((d: string) => {
              const dc = DIFFICULTY_COLOR[d] ?? '#64748B'
              return <span key={d} style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: `1.5px solid ${dc}`, fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 2, textTransform: 'capitalize' }}>{d}</span>
            })}
            {r.is_verified && <span style={{ background: 'rgba(22,163,74,0.85)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 2 }}>✓ Verified</span>}
          </div>
          <h1 style={{ color: '#fff', fontSize: 'clamp(20px, 4vw, 30px)', fontWeight: 800, margin: '0 0 6px', lineHeight: 1.2 }}>{r.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={13} style={{ color: 'rgba(255,255,255,0.6)' }} />
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>{r.town}, {r.province}</span>
            </div>
            {reviewCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Stars rating={Math.round(avgRating)} />
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{avgRating.toFixed(1)} ({reviewCount})</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ebebeb' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px', display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {[
            { icon: <Navigation size={16} />, label: r.distance_km ? `${parseFloat(r.distance_km).toFixed(0)} km` : '–', sub: 'Distance' },
            { icon: <Mountain size={16} />, label: r.elevation_m ? `${r.elevation_m} m` : '–', sub: 'Elevation' },
            { icon: <Clock size={16} />, label: formatTime(r.est_time_min), sub: 'Est. Time' },
            { icon: <MapPin size={16} />, label: r.surface ? r.surface.charAt(0).toUpperCase() + r.surface.slice(1) : '–', sub: 'Surface' },
          ].map((stat, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 0', flexShrink: 0, paddingRight: i < 3 ? 28 : 0, marginRight: i < 3 ? 28 : 0, borderRight: i < 3 ? '1px solid #f0f0f0' : 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: 2, background: '#E9ECF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', flexShrink: 0 }}>{stat.icon}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-primary)' }}>{stat.label}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>{stat.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column layout */}
      <div className='route-detail-grid' style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px', alignItems: 'start' }}>

        {/* Left */}
        <div>
          <section style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 2, padding: 24, marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary)', margin: '0 0 12px' }}>About this Route</h2>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: 0 }}>{r.description ?? 'No description available.'}</p>
          </section>

          {loops && (loops as any[]).length > 0 && (
            <section style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 2, padding: 24, marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary)', margin: '0 0 16px' }}>Trail Routes</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(loops as any[]).map((loop: any) => {
                  const catColor: Record<string, string> = { green: '#16A34A', blue: '#2563EB', red: '#DC2626', black: '#1a1a1a' }
                  const cat = loop.category ?? 'green'
                  const color = catColor[cat] ?? '#64748B'
                  const subtitle = loop.subtitle ?? loop.category ?? ''
                  const distKm = loop.distance_km ? parseFloat(loop.distance_km) : null
                  const estMin = distKm ? Math.round(distKm * 15) : null
                  const estTime = estMin ? (estMin >= 60 ? `${Math.floor(estMin/60)}h ${estMin%60 > 0 ? `${estMin%60}m` : ''}`.trim() : `${estMin} min`) : null
                  // Strip "Category: ..." suffix from description for display
                  const rawDesc: string = loop.description ?? ''
                  const displayDesc = rawDesc.includes('\n\nCategory:') ? rawDesc.split('\n\nCategory:')[0].trim() : rawDesc.trim()
                  return (
                    <div key={loop.id} style={{ border: `1.5px solid ${color}22`, borderLeft: `4px solid ${color}`, borderRadius: 2, padding: '14px 16px', background: `${color}08` }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary)' }}>{loop.name}</span>
                            {subtitle && (
                              <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}18`, border: `1px solid ${color}44`, padding: '2px 8px', borderRadius: 2 }}>{subtitle}</span>
                            )}
                          </div>
                          {displayDesc && (
                            <p style={{ fontSize: 13, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>{displayDesc}</p>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                          {distKm !== null && (
                            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-primary)' }}>{distKm.toFixed(1)} km</span>
                          )}
                          {estTime && (
                            <span style={{ fontSize: 11, color: '#9CA3AF' }}>~{estTime}</span>
                          )}
                          <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}15`, padding: '2px 8px', borderRadius: 2, textTransform: 'capitalize' }}>{loop.difficulty}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {facilityItems.length > 0 && (
            <section style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 2, padding: 24, marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary)', margin: '0 0 14px' }}>Facilities</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                {facilityItems.map(([key]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#f9f9f9', borderRadius: 2, fontSize: 13, fontWeight: 600, color: '#374151' }}>
                    {FACILITY_LABELS[key] ?? key}
                  </div>
                ))}
              </div>
            </section>
          )}

          {tags.length > 0 && (
            <section style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 2, padding: 24, marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary)', margin: '0 0 12px' }}>Tags</h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {tags.map(tag => <span key={tag} style={{ fontSize: 12, fontWeight: 600, color: '#4B5563', background: '#F3F4F6', padding: '5px 12px', borderRadius: 20  }}>{tag}</span>)}
              </div>
            </section>
          )}

          <ReviewsSection
            routeSlug={r.slug as string}
            routeName={r.name as string}
            initialReviews={(reviews ?? []) as any[]}
            initialAvgRating={avgRating}
            initialReviewCount={reviewCount}
          />
          {/* LEGACY reviews placeholder — kept for JSX structure, hidden */}
          {false && <section style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 2, padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>Reviews {reviewCount > 0 && <span style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF' }}>({reviewCount})</span>}</h2>
              {reviewCount > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Stars rating={Math.round(avgRating)} /><span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{avgRating.toFixed(1)}</span></div>}
            </div>
            {reviews && reviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {(reviews as any[]).map((rev: any) => (
                  <div key={rev.id} style={{ padding: '14px', background: '#f9f9f9', borderRadius: 2 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E9ECF5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>{(rev.user_name as string)?.[0]?.toUpperCase() ?? 'U'}</div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{rev.user_name ?? 'Anonymous'}</span>
                      </div>
                      <Stars rating={rev.rating} />
                    </div>
                    {rev.body && <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, margin: 0 }}>{rev.body}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '28px 0', color: '#9CA3AF', fontSize: 14 }}>
                <Star size={28} style={{ marginBottom: 8, opacity: 0.3 }} />
                <p style={{ margin: 0 }}>No reviews yet. Be the first to review this route!</p>
              </div>
            )}
          </section>}
        </div>

        {/* Right sidebar */}
        <div className='route-sidebar' style={{ top: 76, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {r.lat && r.lng && (
            <div style={{ height: 220, borderRadius: 2, overflow: 'hidden', border: '1px solid #ebebeb' }}>
              <MiniMap name={r.name} slug={r.slug} discipline={r.discipline} lat={String(r.lat)} lng={String(r.lng)} />
            </div>
          )}
          <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 2, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {r.lat && r.lng && (
              <a href={`https://maps.google.com/?q=${r.lat},${r.lng}`} target='_blank' rel='noopener noreferrer' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px', borderRadius: 2, background: 'var(--color-primary)', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                <Navigation size={15} /> Navigate to Trailhead
              </a>
            )}
            {r.gpx_url && (
              <a href={r.gpx_url} download style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px', borderRadius: 2, border: '1.5px solid #0D1B2A', color: 'var(--color-primary)', textDecoration: 'none', fontSize: 13, fontWeight: 700, background: '#fff' }}>
                <Download size={15} /> Download GPX
              </a>
            )}
          </div>
          {(r.website_url || r.contact_email || r.contact_phone) && (
            <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 2, padding: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-primary)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Contact</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {r.website_url && <a href={r.website_url} target='_blank' rel='noopener noreferrer' style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#3B82F6', textDecoration: 'none' }}><ExternalLink size={13} /> {r.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a>}
                {r.contact_email && <a href={`mailto:${r.contact_email}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', textDecoration: 'none' }}><Mail size={13} /> {r.contact_email}</a>}
                {r.contact_phone && <a href={`tel:${r.contact_phone}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', textDecoration: 'none' }}><Phone size={13} /> {r.contact_phone}</a>}
              </div>
            </div>
          )}
          <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 2, padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-primary)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Route Info</h3>
            {[
              { label: 'Discipline', value: r.discipline },
              { label: 'Difficulty', value: r.difficulty },
              { label: 'Surface', value: r.surface },
              { label: 'Province', value: r.province },
              { label: 'Region', value: r.region },
            ].filter(x => x.value).map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f5f5f5', fontSize: 13 }}>
                <span style={{ color: '#6B7280' }}>{item.label}</span>
                <span style={{ fontWeight: 600, color: '#1a1a1a', textTransform: 'capitalize' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nearby routes */}
      {nearby && nearby.length > 0 && (
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px 48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>More in {r.province}</h2>
            <Link href={`/routes?province=${encodeURIComponent(r.province)}`} style={{ fontSize: 13, color: '#3B82F6', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>See all <ChevronRight size={14} /></Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {(nearby as any[]).map((nr: any) => (
              <Link key={nr.id} href={`/routes/${nr.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: 80, background: nr.hero_image_url ? 'none' : `linear-gradient(135deg, ${DISCIPLINE_COLOR[nr.discipline] ?? '#64748B'}22, ${DISCIPLINE_COLOR[nr.discipline] ?? '#64748B'}44)`, position: 'relative', overflow: 'hidden' }}>
                    {nr.hero_image_url && <img src={nr.hero_image_url} alt={nr.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    <span style={{ position: 'absolute', top: 6, left: 6, background: DISCIPLINE_COLOR[nr.discipline] ?? '#64748B', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 2, textTransform: 'uppercase' }}>{nr.discipline}</span>
                  </div>
                  <div style={{ padding: '12px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 4 }}>{nr.name}</div>
                    <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#9CA3AF' }}>
                      {nr.distance_km && <span>{parseFloat(nr.distance_km).toFixed(0)} km</span>}
                      {nr.town && <span>{nr.town}</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
