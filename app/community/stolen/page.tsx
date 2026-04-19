import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { getCountry } from '@/lib/country'
import { getCountryConfig } from '@/lib/country-config'
import { getProvincesStatic } from '@/lib/regions-static'
import { ShieldAlert, Search, MapPin, Plus } from 'lucide-react'

export async function generateMetadata(): Promise<Metadata> {
  const cfg = getCountryConfig(await getCountry())
  return {
    title: 'Stolen bike registry | CrankMart Community',
    description: `Browse verified stolen bike reports across ${cfg.name}. Filter by ${cfg.regionLabel.toLowerCase()} and brand. Help reunite cyclists with their bikes.`,
    robots: { index: true, follow: true },
  }
}

export const revalidate = 60

interface StolenRow {
  id: string
  serial_number: string
  brand: string
  model: string | null
  year: number | null
  colour: string | null
  stolen_date: string | null
  stolen_location: string | null
  proof_photo_url: string | null
  saps_case_no: string | null
  status: string
  created_at: string
}

interface PageProps {
  searchParams: Promise<{ province?: string; brand?: string; page?: string; status?: string }>
}

const PAGE_SIZE = 24

async function fetchReports(opts: { province: string; brand: string; page: number; status: string }) {
  const country = await getCountry()
  const offset = (opts.page - 1) * PAGE_SIZE
  const provinceClause = opts.province ? sql`AND stolen_location ILIKE ${'%' + opts.province + '%'}` : sql``
  const brandClause = opts.brand ? sql`AND LOWER(brand) = LOWER(${opts.brand})` : sql``

  const [rowsRes, countRes, brandsRes] = await Promise.all([
    db.execute(sql`
      SELECT id, serial_number, brand, model, year, colour,
             stolen_date, stolen_location, proof_photo_url, saps_case_no, status, created_at
      FROM stolen_reports
      WHERE country = ${country} AND status = ${opts.status}
        ${provinceClause}
        ${brandClause}
      ORDER BY created_at DESC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `),
    db.execute(sql`
      SELECT COUNT(*)::int AS total FROM stolen_reports
      WHERE country = ${country} AND status = ${opts.status}
        ${provinceClause}
        ${brandClause}
    `),
    db.execute(sql`
      SELECT brand, COUNT(*)::int AS c FROM stolen_reports
      WHERE country = ${country} AND status = 'approved'
      GROUP BY brand ORDER BY c DESC LIMIT 12
    `),
  ])
  return {
    rows: (rowsRes.rows ?? rowsRes) as unknown as StolenRow[],
    total: ((countRes.rows ?? countRes) as Array<{ total: number }>)[0]?.total ?? 0,
    brands: ((brandsRes.rows ?? brandsRes) as Array<{ brand: string; c: number }>),
  }
}

export default async function StolenIndexPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const province = sp.province ?? ''
  const brand = sp.brand ?? ''
  const page = Math.max(1, parseInt(sp.page ?? '1'))
  const status = sp.status === 'recovered' ? 'recovered' : 'approved'
  const country = await getCountry()
  const cfg = getCountryConfig(country)
  const provinces = getProvincesStatic(country)
  const data = await fetchReports({ province, brand, page, status })
  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE))

  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : null

  const buildHref = (over: Partial<{ province: string; brand: string; page: number; status: string }>) => {
    const next = { province, brand, page: 1, status, ...over }
    const params = new URLSearchParams()
    if (next.province) params.set('province', next.province)
    if (next.brand)    params.set('brand', next.brand)
    if (next.page > 1) params.set('page', String(next.page))
    if (next.status !== 'approved') params.set('status', next.status)
    const qs = params.toString()
    return qs ? `/community/stolen?${qs}` : '/community/stolen'
  }

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 80px', fontFamily: 'system-ui, sans-serif', color: '#1a1a1a' }}>
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <div>
          <Link href="/community" style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none' }}>← Community</Link>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: '6px 0 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldAlert size={26} style={{ color: '#DC2626' }} /> Stolen bike registry
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0, maxWidth: 640 }}>
            Verified reports of bikes stolen in {cfg.name}. Found one for sale? Use{' '}
            <Link href="/community/check" style={{ color: '#0D1B2A', fontWeight: 600 }}>/community/check</Link> to look up a serial.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/community/check" style={pillBtn('ghost')}>
            <Search size={14} /> Check serial
          </Link>
          <Link href="/community/stolen/report" style={pillBtn('primary')}>
            <Plus size={14} /> Report stolen
          </Link>
        </div>
      </header>

      {/* Filter rail */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginBottom: 18 }}>
        <FilterTab href={buildHref({ status: 'approved' })} active={status === 'approved'} label={`Reported (${data.total})`} />
        <FilterTab href={buildHref({ status: 'recovered' })} active={status === 'recovered'} label="Recovered" />
        <span style={{ height: 16, width: 1, background: '#ebebeb', margin: '0 8px' }} />
        <select
          defaultValue={province}
          style={selectStyle}
          // anchor-based — link-on-change via meta tag would need client; simpler: render <Link>s for provinces
          aria-label="Filter by province"
          name="province-decor" // visual only; real navigation via chips below
        >
          <option value="">Province</option>
          {provinces.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {province && (
          <Link href={buildHref({ province: '' })} style={chipStyle}>{province} ✕</Link>
        )}
        {brand && (
          <Link href={buildHref({ brand: '' })} style={chipStyle}>{brand} ✕</Link>
        )}
      </div>

      {/* Province chips (server-side, no JS needed) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {provinces.map(p => (
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

      {/* Brand chips */}
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

      {/* Grid */}
      {data.rows.length === 0 ? (
        <div style={{ padding: 40, background: '#fff', border: '1px dashed #e4e4e7', borderRadius: 12, textAlign: 'center', color: '#9a9a9a' }}>
          No reports match those filters.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {data.rows.map(r => (
            <Link
              key={r.id}
              href={`/community/stolen/${r.id}`}
              style={{
                display: 'flex', flexDirection: 'column',
                background: '#fff', border: '1px solid #ebebeb', borderRadius: 10,
                overflow: 'hidden', textDecoration: 'none', color: 'inherit',
                borderLeft: '3px solid #DC2626',
              }}
            >
              <div style={{ aspectRatio: '4/3', background: '#f5f5f5', position: 'relative', overflow: 'hidden' }}>
                {r.proof_photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.proof_photo_url} alt={`${r.brand} ${r.model ?? ''}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#cbd5e1' }}>
                    <ShieldAlert size={32} />
                  </div>
                )}
                {r.status === 'recovered' && (
                  <span style={{ position: 'absolute', top: 8, right: 8, padding: '3px 8px', borderRadius: 999, background: '#059669', color: '#fff', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .3 }}>
                    Recovered
                  </span>
                )}
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a' }}>
                  {r.brand}{r.model ? ` ${r.model}` : ''}{r.year ? ` · ${r.year}` : ''}
                </div>
                <div style={{ fontSize: 11, color: '#9a9a9a', fontFamily: 'ui-monospace, monospace', marginTop: 2 }}>
                  {r.serial_number}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={11} /> {r.stolen_location || 'Location not given'}
                </div>
                <div style={{ fontSize: 11, color: '#9a9a9a', marginTop: 4 }}>
                  {fmt(r.stolen_date) ?? `Reported ${fmt(r.created_at)}`}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 28 }}>
          {page > 1 && <Link href={buildHref({ page: page - 1 })} style={pillBtn('ghost')}>← Prev</Link>}
          <span style={{ fontSize: 12, color: '#9a9a9a', alignSelf: 'center' }}>Page {page} of {totalPages}</span>
          {page < totalPages && <Link href={buildHref({ page: page + 1 })} style={pillBtn('ghost')}>Next →</Link>}
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

const selectStyle: React.CSSProperties = {
  padding: '6px 10px', fontSize: 12, fontWeight: 600,
  background: '#fff', border: '1px solid #ebebeb', borderRadius: 6,
  color: '#1a1a1a', cursor: 'pointer',
}

function pillBtn(variant: 'primary' | 'ghost'): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', fontSize: 13, fontWeight: 700,
    borderRadius: 8, textDecoration: 'none',
    background: variant === 'primary' ? 'var(--color-primary)' : '#fff',
    color: variant === 'primary' ? '#fff' : '#1a1a1a',
    border: variant === 'primary' ? 'none' : '1px solid #e4e4e7',
  }
}

function FilterTab({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      style={{
        padding: '6px 12px', fontSize: 13, fontWeight: 700,
        borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
        color: active ? 'var(--color-primary)' : '#6b7280',
        textDecoration: 'none',
      }}
    >
      {label}
    </Link>
  )
}
