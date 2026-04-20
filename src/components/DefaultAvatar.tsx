'use client'

import Avatar from 'boring-avatars'

/**
 * Deterministic avatar fallback. Given the same `seed` (user id / handle)
 * renders the same 5-colour marble — matches brand warm/dark palette.
 *
 * Used anywhere we render a user's avatar: pass the uploaded URL as `src`
 * and we fall back to a generated marble when null.
 */
const PALETTE = ['#E85D04', '#F5C518', '#1B263B', '#0D1B2A', '#D6D3D1']

export function DefaultAvatar({
  seed,
  size = 40,
  src,
  alt,
  rounded = true,
}: {
  seed: string
  size?: number
  src?: string | null
  alt?: string
  rounded?: boolean
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt ?? ''}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: rounded ? '50%' : 6,
          objectFit: 'cover',
          display: 'block',
        }}
      />
    )
  }
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: rounded ? '50%' : 6,
      overflow: 'hidden',
      display: 'inline-block',
      lineHeight: 0,
    }}>
      <Avatar
        size={size}
        name={seed || 'crankmart'}
        variant="marble"
        colors={PALETTE}
      />
    </div>
  )
}
