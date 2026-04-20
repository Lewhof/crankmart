import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const revalidate = 3600
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://crankmart.com'
  let title = 'CrankMart news'
  let category = ''
  let author = ''

  try {
    const res = await fetch(`${baseUrl}/api/news/${slug}`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const a = await res.json()
      title = a.title || title
      category = (a.category || '').toString().toUpperCase()
      author = a.author_name || ''
    }
  } catch { /* fall through */ }

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '56px 64px',
        background: 'linear-gradient(135deg, #0a0f1e 0%, #1a2340 60%, #273970 100%)',
        color: '#fff',
        fontFamily: 'system-ui',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg, #273970, #4f6bc4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 900,
          }}>📰</div>
          <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: -0.6 }}>CrankMart News</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {category && (
            <div style={{
              display: 'inline-flex', alignItems: 'center',
              alignSelf: 'flex-start',
              padding: '8px 18px', borderRadius: 999,
              background: 'rgba(129, 140, 248, 0.18)',
              border: '1px solid rgba(165, 180, 252, 0.35)',
              color: '#a5b4fc',
              fontSize: 20, fontWeight: 700, letterSpacing: 2,
            }}>{category}</div>
          )}
          <div style={{
            fontSize: 64, fontWeight: 900, lineHeight: 1.1, letterSpacing: -1.5,
            display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>{title}</div>
          {author && (
            <div style={{ fontSize: 24, color: 'rgba(255,255,255,.6)' }}>By {author}</div>
          )}
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 20, color: 'rgba(255,255,255,.45)',
        }}>
          <div>crankmart.com/news</div>
          <div>SA Cycling Stories</div>
        </div>
      </div>
    ),
    { ...size },
  )
}
