import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { getCountry } from '@/lib/country'
import { Frown, MapPin, Plus } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Lost bike registry | CrankMart Community',
  description: 'Lost your bike? Post it here; the community helps look. Browse recent lost-bike reports across South Africa.',
  robots: { index: true, follow: true },
}

export const revalidate = 60

interface LostRow {
  id: string
  serial_number: string | null
  brand: string
  model: string | null
  year: number | null
  colour: string | null
  last_seen_date: string | null
  last_seen_location: string | null
  proof_photo_url: string | null
  reward_text: string | null
  status: string
  created_at: string
}

interface PageProps {
  searchParams: Promise<{ province?: string; brand?: string; page?: string }>
}

const PAGE_SIZE = 24
const SA_PROVINCES = ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape']

async function fetchReports(opts: { province: string; brand: string; page: number }) {
  const country = await getCountry()
  const offset = (opts.page - 1) * PAGE_SIZE
  const provinceClause = opts.province ? sql`AND last_seen_location ILIKE ${'%' + opts.province + '%'}` : sql``
  const brandClause = opts.brand ? sql`AND LOWER(brand) = LOWER(${opts.brand})` : sql``

  const [rowsRes, countRes, brandsRes] = await Promise.all([
    db.execute(sql`
      SELECT id, serial_number, brand, model, year, colour,
             last_seen_date, last_seen_location, proof_photo_url, reward_text, status, created_at
      FROM lost_reports
      WHERE country = ${country} AND status = 'approved'
        ${provinceClause}
        ${brandClause}
      ORDER BY created_at DESC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `),
    db.execute(sql`
      SELECT COUNT(*)::int AS total FROM lost_reports
      WHERE country = ${country} AND status = 'approved'
        ${provinceClause}
        ${brandClause}
    `),
    db.execute(sql`
      SELECT brand, COUNT(*)::int AS c FROM lost_reports
      WHERE country = ${country} AND status = 'approved'
      GROUP BY brand ORDER BY c DESC LIMIT 12
    `),
  ])
  return {
    rows: (rowsRes.rows ?? rowsRes) as unknown as LostRow[],
    total: ((countRes.rows ?? countRes) as Array<{ total: number }>)[0]?.total ?? 0,
    brands: ((brandsRes.rows ?? brandsRes) as Array<{ brand: string; c: number }>),
  }
}

export default async function LostIndexPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const province = sp.province ?? ''
  const brand = sp.brand ?? ''
  const page = Math.max(1, parseInt(sp.page ?? '1'))
  const data = await fetchReports({ province, brand, page })
  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE))

  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : null

  const buildHref = (over: Partial<{ province: string; brand: string; page: number }>) => {
    const next = { province, brand, page: 1, ...over }
    const params = new URLSearchParams()
    if (next.province) params.set('province', next.province)
    if (next.brand)    params.set('brand', next.brand)
    if (next.page > 1) params.set('page', String(next.page))
    const qs = params.toString()
    return qs ? `/community/lost?${qs}` : '/community/lost'
  }

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 80px', fontFamily: 'system-ui, sans-serif', color: '#1a1a1a' }}>
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <div>
          <Link href="/community" style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none' }}>← Community</Link>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: '6px 0 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Frown size={26} style={{ color: '#D97706' }} /> Lost & found
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0, maxWidth: 640 }}>
            Lost a bike — or found one that might be someone&apos;s? Post the details; the community helps reunite bikes with their riders.
          </p>
        </div>
        <Link href="/community/lost/report" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
          fontSize: 13, fontWeight: 700, borderRadius: 8, textDecoration: 'none',
          background: 'var(--color-primary)', color: '#fff',
        }}>
          <Plus size={14} /> Report lost
        </Link>
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {SA_PROVINCES.map(p => (
          <Link
            key={p}
            href={buildHref({ province: province === p ? '' : p })}
            style={{
              ...chipStyle,
              background: province === p ? 'var(--color-primary)' : '#fff',
              color: province === p ? '#fff' : '#4b5563',
              borderColor: province === p ? 'var(--color-primary)' : '#ebebeb',
            }}
          >
            {p}
          </Link>
        ))}
      </div>

      {data.brands.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 22 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: .3, alignSelf: 'center', marginRight: 6 }}>Brand</span>
          {data.brands.map(b => (
            <Link
              key={b.brand}
              href={buildHref({ brand: brand === b.brand ? '' : b.brand })}
              style={{
                ...chipStyle,
                background: brand === b.brand ? 'var(--color-primary)' : '#fff',
                color: brand === b.brand ? '#fff' : '#4b5563',
                borderColor: brand === b.brand ? 'var(--color-primary)' : '#ebebeb',
              }}
            >
              {b.brand} <span style={{ opacity: .6, marginLeft: 4 }}>{b.c}</span>
            </Link>
          ))}
        </div>
      )}

      {data.rows.length === 0 ? (
        <div style={{ padding: 40, background: '#fff', border: '1px dashed #e4e4e7', borderRadius: 12, textAlign: 'center', color: '#9a9a9a' }}>
          No lost reports yet — be the first.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {data.rows.map(r => (
            <Link
              key={r.id}
              href={`/community/lost/${r.id}`}
              style={{
                display: 'flex', flexDirection: 'column',
                background: '#fff', border: '1px solid #ebebeb', borderRadius: 10,
                overflow: 'hidden', textDecoration: 'none', color: 'inherit',
                borderLeft: '3px solid #D97706',
              }}
            >
              <div style={{ aspectRatio: '4/3', background: '#f5f5f5', position: 'relative', overflow: 'hidden' }}>
                {r.proof_photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.proof_photo_url} alt={`${r.brand} ${r.model ?? ''}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#cbd5e1' }}>
                    <Frown size={32} />
                  </div>
                )}
                {r.reward_text && (
                  <span style={{ position: 'absolute', top: 8, right: 8, padding: '3px 8px', borderRadius: 999, background: '#D97706', color: '#fff', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .3 }}>
                    Reward
                  </span>
                )}
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a' }}>
                  {r.brand}{r.model ? ` ${r.model}` : ''}{r.year ? ` · ${r.year}` : ''}
                </div>
                {r.serial_number && (
                  <div style={{ fontSize: 11, color: '#9a9a9a', fontFamily: 'ui-monospace, monospace', marginTop: 2 }}>
                    {r.serial_number}
                  </div>
                )}
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={11} /> {r.last_seen_location || 'Location not given'}
                </div>
                <div style={{ fontSize: 11, color: '#9a9a9a', marginTop: 4 }}>
                  {fmt(r.last_seen_date) ?? `Reported ${fmt(r.created_at)}`}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 28 }}>
          {page > 1 && <Link href={buildHref({ page: page - 1 })} style={pillBtn}>← Prev</Link>}
          <span style={{ fontSize: 12, color: '#9a9a9a', alignSelf: 'center' }}>Page {page} of {totalPages}</span>
          {page < totalPages && <Link href={buildHref({ page: page + 1 })} style={pillBtn}>Next →</Link>}
        </div>
      )}
    </main>
  )
}

const chipStyle: React.CSSProperties = {
  padding: '5px 10px', fontSize: 12, fontWeight: 600,
  background: '#fff', border: '1px solid #ebebeb', color: '#4b5563',
  borderRadius: 999, textDecoration: 'none', whiteSpace: 'nowrap',
}

const pillBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 14px', fontSize: 13, fontWeight: 700,
  borderRadius: 8, textDecoration: 'none',
  background: '#fff', color: '#1a1a1a', border: '1px solid #e4e4e7',
}
