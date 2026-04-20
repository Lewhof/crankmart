/**
 * Client-safe social-platform metadata.
 *
 * This module must NOT import anything server-only (db, server-only, fs, etc.)
 * because it's imported by `use client` components (nav/Footer, admin
 * composer previews). Keeping the split means the client bundle stays
 * small AND doesn't try to evaluate server-only code in the browser
 * (which was crashing the whole tree with "Something went wrong" when
 * Footer tried to load the server-only db module via the combined file).
 *
 * DB-dependent helpers (getActiveProfiles, getSameAsUrls) live in social.ts.
 */

export type SocialPlatform =
  | 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'twitter'
  | 'linkedin'  | 'threads'  | 'pinterest' | 'bluesky' | 'strava'

export type SocialProfile = {
  id: string
  platform: SocialPlatform
  handle: string
  url: string
  country: string
  displayInFooter: boolean
  isActive: boolean
  sortOrder: number
}

/**
 * Single source of truth per platform. Adding platform #11 = add one entry
 * here + one entry in the `social_platform` pg_enum. Footer icons pull from
 * `svg` below; composer previews pull from `label` + `PLATFORM_LIMITS`.
 */
export const PLATFORM_META: Record<SocialPlatform, {
  label: string
  baseUrl: (h: string) => string
  shareText: string
  svg: string
}> = {
  instagram: {
    label: 'Instagram', shareText: 'Instagram',
    baseUrl: h => `https://www.instagram.com/${h}`,
    svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
  },
  facebook: {
    label: 'Facebook', shareText: 'Facebook',
    baseUrl: h => `https://www.facebook.com/${h}`,
    svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
  },
  tiktok: {
    label: 'TikTok', shareText: 'TikTok',
    baseUrl: h => `https://www.tiktok.com/@${h.replace(/^@/, '')}`,
    svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19.6 6.3a5.5 5.5 0 0 1-3.3-1.1V15a5 5 0 1 1-5-5v2.6a2.4 2.4 0 1 0 2.4 2.4V2h2.6a5.5 5.5 0 0 0 3.3 3.3z"/></svg>',
  },
  youtube: {
    label: 'YouTube', shareText: 'YouTube',
    baseUrl: h => `https://www.youtube.com/@${h.replace(/^@/, '')}`,
    svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>',
  },
  twitter: {
    label: 'X', shareText: 'X / Twitter',
    baseUrl: h => `https://twitter.com/${h}`,
    svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
  },
  linkedin: {
    label: 'LinkedIn', shareText: 'LinkedIn',
    baseUrl: h => `https://www.linkedin.com/company/${h}`,
    svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
  },
  threads: {
    label: 'Threads', shareText: 'Threads',
    baseUrl: h => `https://www.threads.net/@${h.replace(/^@/, '')}`,
    svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.6 11.2c-.1-.1-.2-.1-.3-.2a6 6 0 0 0-2-.7c-1.4-.2-2.7 0-3.6.6v-.1c0-.9.4-1.6 1.1-2a2.7 2.7 0 0 1 2 0 2 2 0 0 1 1.3 1l2-.7c-.3-.8-.9-1.6-1.7-2.1-1.1-.7-2.5-.8-4-.5-1.7.3-3 1.3-3.6 2.9a9 9 0 0 0-.5 3.2c0 1 .2 2 .5 3 .7 1.7 2 2.7 3.7 3 1.4.3 2.7.1 3.9-.5 1.1-.6 1.9-1.6 2.1-2.8a3.3 3.3 0 0 0-.9-3.1z"/></svg>',
  },
  pinterest: {
    label: 'Pinterest', shareText: 'Pinterest',
    baseUrl: h => `https://www.pinterest.com/${h}`,
    svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.3-5.5s-.3-.6-.3-1.5c0-1.4.8-2.5 1.8-2.5.9 0 1.3.6 1.3 1.4 0 .9-.6 2.2-.8 3.4-.2 1 .5 1.8 1.5 1.8 1.8 0 3.2-1.9 3.2-4.6 0-2.4-1.7-4.1-4.2-4.1-2.9 0-4.6 2.1-4.6 4.3 0 .9.3 1.8.7 2.3.1.1.1.2.1.3l-.3 1c0 .2-.1.3-.3.2-1.3-.6-2-2.4-2-3.9 0-3.2 2.3-6.1 6.7-6.1 3.5 0 6.2 2.5 6.2 5.8 0 3.5-2.2 6.3-5.2 6.3-1 0-2-.5-2.3-1.1l-.6 2.4a11 11 0 0 1-1.3 2.6A10 10 0 1 0 12 2z"/></svg>',
  },
  bluesky: {
    label: 'Bluesky', shareText: 'Bluesky',
    baseUrl: h => `https://bsky.app/profile/${h}`,
    svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 3c3 2 5 4 6 7 1-3 3-5 6-7 4 0 6 3 4 7l-2 6-5-2c2 2 2 4 0 6-2-2-2-4 0-6l-5 2-2-6C0 6 2 3 6 3z"/></svg>',
  },
  strava: {
    label: 'Strava', shareText: 'Strava',
    baseUrl: h => `https://www.strava.com/clubs/${h}`,
    svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M15 14h-3l-3-6 3 6h3l-3-6zM10 4l6 12h-4l-2-4-2 4H4l6-12z"/></svg>',
  },
}

/** UTM convention: ?utm_source=X&utm_medium=social&utm_campaign=Y&utm_content=Z */
export function buildUtm(params: {
  source: string
  campaign?: string
  content?: string
  medium?: string
}): string {
  const q = new URLSearchParams()
  q.set('utm_source', params.source)
  q.set('utm_medium', params.medium ?? 'social')
  if (params.campaign) q.set('utm_campaign', params.campaign)
  if (params.content)  q.set('utm_content',  params.content)
  return q.toString()
}

/**
 * Cryptographically-safe slug generator for short-links. 8 chars of
 * base62 ≈ 218 trillion permutations — collisions vanishingly rare.
 */
export function randomSlug(length = 8): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  let out = ''
  for (let i = 0; i < length; i++) out += alphabet[bytes[i] % alphabet.length]
  return out
}

/** Per-platform character/media limits — used by the composer preview. */
export const PLATFORM_LIMITS: Record<SocialPlatform, { chars: number; images: number }> = {
  twitter:   { chars: 280,   images: 4 },
  bluesky:   { chars: 300,   images: 4 },
  threads:   { chars: 500,   images: 10 },
  instagram: { chars: 2200,  images: 10 },
  tiktok:    { chars: 2200,  images: 0 },
  linkedin:  { chars: 3000,  images: 9 },
  facebook:  { chars: 63206, images: 10 },
  youtube:   { chars: 5000,  images: 1 },
  pinterest: { chars: 500,   images: 1 },
  strava:    { chars: 2000,  images: 4 },
}
