import Link from 'next/link'

/**
 * Compact author chip — avatar + display name + optional handle link.
 * Server-safe (no hooks); used inside comment rows + admin tables.
 */
export function UserCard({
  handle,
  name,
  avatarUrl,
  size = 28,
  showName = true,
}: {
  handle: string | null
  name: string
  avatarUrl: string | null
  size?: number
  showName?: boolean
}) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const inner = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt=""
          width={size}
          height={size}
          style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        />
      ) : (
        <span style={{
          width: size, height: size, borderRadius: '50%',
          background: 'var(--color-primary)', color: '#fff',
          fontSize: Math.max(10, size * 0.4), fontWeight: 700,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {initials || '?'}
        </span>
      )}
      {showName && (
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>
          {name}
          {handle && (
            <span style={{ color: '#9a9a9a', fontWeight: 500, marginLeft: 4 }}>
              @{handle}
            </span>
          )}
        </span>
      )}
    </span>
  )

  return handle ? (
    <Link href={`/u/${handle}`} prefetch={false} style={{ textDecoration: 'none', color: 'inherit' }}>
      {inner}
    </Link>
  ) : inner
}
