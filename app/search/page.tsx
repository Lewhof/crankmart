'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { MapPin, Heart, Zap } from 'lucide-react'
import { SearchBar } from '@/components/search/SearchBar'
import { countryFromPath } from '@/lib/regions-static'
import { formatPrice } from '@/lib/currency'

interface ListingItem {
  id: string; slug: string; title: string; price: string
  city: string | null; province: string | null
  condition: 'new' | 'like_new' | 'used' | 'poor'
  boostEnabled: boolean | null
  bikeMake: string | null; bikeModel: string | null; bikeYear: number | null
  attributes?: Record<string, string | boolean>
  image: { imageUrl: string } | null
}

const COND_MAP = {
  new:      { label: 'New',      color: '#10B981' },
  like_new: { label: 'Like New', color: '#3B82F6' },
  used:     { label: 'Used',     color: '#F59E0B' },
  poor:     { label: 'Poor',     color: '#EF4444' },
}

const SUGGESTED_SEARCHES = [
  'Road Bikes',
  'Mountain Bikes',
  'Shimano Components',
  'Trek',
  'Giant',
]

function SearchContent() {
  const router = useRouter()
  const country = countryFromPath(usePathname())
  const params = useSearchParams()
  const query = params.get('q') || ''

  const [items, setItems] = useState<ListingItem[]>([])
  const [loading, setLoading] = useState(!!query)
  const [searchValue, setSearchValue] = useState(query)

  useEffect(() => {
    if (!query.trim()) {
      setItems([])
      setLoading(false)
      return
    }

    const fetchResults = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/listings?search=${encodeURIComponent(query)}&limit=24`)
        if (res.ok) {
          setItems(await res.json())
        }
      } catch {
        // Network or parse error — loading state will clear, showing empty results
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [query])

  const handleSearch = (q: string) => {
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q)}`)
      setSearchValue(q)
    }
  }

  const fmt = (p: string) => formatPrice(country, p)

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <style>{`
        .search-grid {
          max-width: 1280px;
          margin: 0 auto;
          padding: 40px 16px;
          display: grid;
          gridTemplateColumns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
        }
        .listing-card {
          background: #fff;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          text-decoration: none;
          color: inherit;
          transition: box-shadow 0.2s, transform 0.2s;
          display: flex;
          flex-direction: column;
          height: 100%;
          border: 1px solid #e4e4e7;
        }
        .listing-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }
        .lcard-img {
          width: 100%;
          height: 200px;
          background: linear-gradient(135deg, #e4e4e7 0%, #d4d4d7 100%);
          position: relative;
          overflow: hidden;
        }
        .lcard-body {
          padding: 12px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .lcard-make {
          margin: 0;
          font-size: 11px;
          font-weight: 700;
          color: #9a9a9a;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .lcard-title {
          margin: 0;
          font-size: 14px;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .lcard-meta {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: #9a9a9a;
          flex-wrap: wrap;
        }
        .lcard-price {
          margin: 0;
          font-size: 16px;
          font-weight: 800;
          color: #0D1B2A;
          margin-top: auto;
        }
        .lcard-loc {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #9a9a9a;
        }
        .no-results {
          max-width: 640px;
          margin: 60px auto;
          text-align: center;
          padding: 0 16px;
        }
        .suggested-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin-top: 20px;
        }
        .suggested-chip {
          background: #fff;
          border: 1.5px solid #e4e4e7;
          border-radius: 20px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          color: #0D1B2A;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-block;
        }
        .suggested-chip:hover {
          border-color: #0D1B2A;
          background: #E9ECF5;
        }
        .skeleton {
          background: linear-gradient(90deg, #e4e4e7 25%, #d4d4d7 50%, #e4e4e7 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Header with search bar */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e4e4e7',
        padding: '24px 16px',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <h1 style={{
            margin: '0 0 16px 0',
            fontSize: 28,
            fontWeight: 800,
            color: '#1a1a1a',
          }}>
            Search
          </h1>
          <div style={{ maxWidth: 500 }}>
            <SearchBar 
              size="lg" 
              defaultValue={searchValue}
              onSearch={handleSearch}
              placeholder="Search bikes, parts, gear..."
            />
          </div>
        </div>
      </div>

      {/* Results or empty state */}
      {!query ? (
        // No query yet
        <div className="no-results">
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>
            What are you looking for?
          </h2>
          <p style={{ fontSize: 14, color: '#9a9a9a', marginBottom: 0 }}>
            Search for bikes, parts, or gear from South African sellers
          </p>
        </div>
      ) : loading ? (
        // Loading state
        <div className="search-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="listing-card">
              <div className="lcard-img skeleton" />
              <div className="lcard-body">
                <div className="skeleton" style={{ height: 12, width: '60%' }} />
                <div className="skeleton" style={{ height: 14, width: '100%' }} />
                <div className="skeleton" style={{ height: 10, width: '50%', marginTop: 8 }} />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        // No results
        <div className="no-results">
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>
            No results for "{query}"
          </h2>
          <p style={{ fontSize: 14, color: '#9a9a9a', marginBottom: 0 }}>
            Try a different search or browse our categories
          </p>
          <div className="suggested-chips">
            {SUGGESTED_SEARCHES.map(s => (
              <button
                key={s}
                className="suggested-chip"
                onClick={() => handleSearch(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        // Results found
        <>
          <div style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '20px 16px 0',
            fontSize: 13,
            color: '#9a9a9a',
          }}>
            Showing {items.length} {items.length === 1 ? 'result' : 'results'} for <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>"{query}"</span>
          </div>
          <div className="search-grid">
            {items.map(item => {
              const cond = COND_MAP[item.condition as keyof typeof COND_MAP]
              return (
                <Link key={item.id} href={`/browse/${item.slug}`} className="listing-card">
                  <div className="lcard-img">
                    {item.image?.imageUrl ? (
                      <Image
                        src={item.image.imageUrl}
                        alt={item.title}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: '#e4e4e7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#9a9a9a',
                        fontSize: 12,
                      }}>
                        No image
                      </div>
                    )}
                    {item.boostEnabled && (
                      <div style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        background: 'var(--color-primary)',
                        color: '#fff',
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '3px 7px',
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                      }}>
                        <Zap size={9} /> Featured
                      </div>
                    )}
                    <button onClick={e => e.preventDefault()} style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 4px rgba(0,0,0,.15)',
                    }}>
                      <Heart size={13} style={{ color: '#888', strokeWidth: 1.5 }} />
                    </button>
                  </div>
                  <div className="lcard-body">
                    {item.bikeMake && <p className="lcard-make">{item.bikeMake}</p>}
                    <p className="lcard-title">{item.bikeModel ?? item.title}</p>
                    <div className="lcard-meta">
                      {item.bikeYear && <span>{item.bikeYear}</span>}
                      {item.bikeYear && cond && <span>·</span>}
                      {cond && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: cond.color, display: 'inline-block' }} />
                        {cond.label}
                      </span>}
                      {item.attributes?.frameSize && <><span>·</span><span>{String(item.attributes.frameSize)}</span></>}
                      {item.attributes?.wheelSize && <><span>·</span><span>{String(item.attributes.wheelSize)}</span></>}
                    </div>
                    <p className="lcard-price">{fmt(item.price)}</p>
                    {(item.city || item.province) && (
                      <div className="lcard-loc"><MapPin size={10} />{item.city ?? item.province}</div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ background: '#f5f5f5', minHeight: '100vh' }} />}>
      <SearchContent />
    </Suspense>
  )
}
