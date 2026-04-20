import { ImageResponse } from 'next/og'

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

/**
 * Shared OG image template used by every `opengraph-image.tsx` route segment.
 * Satori supports only flexbox + a subset of CSS — stick to flex layouts and
 * avoid grid / transforms. Dark-native per CrankMart brand.
 */
export function renderOg({
  kind,
  title,
  subtitle,
  accent = '#E85D04',
}: {
  kind: string
  title: string
  subtitle?: string
  accent?: string
}): ImageResponse {
  const titleSize = title.length > 60 ? 54 : title.length > 36 ? 66 : 84
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
          color: '#F5F5F4',
          background: 'linear-gradient(135deg, #0D1B2A 0%, #1B263B 60%, #0D1B2A 100%)',
        }}
      >
        {/* Top row — logo + kind label */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 26,
              border: '2px solid #F5F5F4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 900,
            }}>
              C
            </div>
            <div style={{ display: 'flex', fontSize: 30, fontWeight: 800, letterSpacing: 1.5 }}>
              <span>CRANK</span>
              <span style={{ color: accent }}>MART</span>
            </div>
          </div>
          <div style={{
            padding: '10px 18px',
            borderRadius: 999,
            border: `1px solid ${accent}`,
            color: accent,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: 'uppercase',
            display: 'flex',
          }}>
            {kind}
          </div>
        </div>

        {/* Middle — title + subtitle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1056 }}>
          <div style={{ fontSize: titleSize, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1 }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: 30, color: '#D6D3D1', lineHeight: 1.35 }}>
              {subtitle.length > 140 ? subtitle.slice(0, 137) + '…' : subtitle}
            </div>
          )}
        </div>

        {/* Bottom — url bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 20,
          borderTop: '1px solid rgba(245, 245, 244, 0.15)',
        }}>
          <div style={{ fontSize: 22, color: '#D6D3D1' }}>crankmart.com</div>
          <div style={{ fontSize: 18, color: '#78716C', letterSpacing: 2, textTransform: 'uppercase' }}>
            Cycling Marketplace
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  )
}
