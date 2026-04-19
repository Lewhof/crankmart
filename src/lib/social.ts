import { db } from '@/db'
import { sql } from 'drizzle-orm'

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

export const PLATFORM_META: Record<SocialPlatform, {
  label: string
  baseUrl: (h: string) => string
  shareText: string
}> = {
  instagram: { label: 'Instagram', baseUrl: h => `https://www.instagram.com/${h}`,     shareText: 'Instagram' },
  facebook:  { label: 'Facebook',  baseUrl: h => `https://www.facebook.com/${h}`,      shareText: 'Facebook'  },
  tiktok:    { label: 'TikTok',    baseUrl: h => `https://www.tiktok.com/@${h.replace(/^@/, '')}`, shareText: 'TikTok' },
  youtube:   { label: 'YouTube',   baseUrl: h => `https://www.youtube.com/@${h.replace(/^@/, '')}`, shareText: 'YouTube' },
  twitter:   { label: 'X',         baseUrl: h => `https://twitter.com/${h}`,           shareText: 'X / Twitter' },
  linkedin:  { label: 'LinkedIn',  baseUrl: h => `https://www.linkedin.com/company/${h}`, shareText: 'LinkedIn' },
  threads:   { label: 'Threads',   baseUrl: h => `https://www.threads.net/@${h.replace(/^@/, '')}`, shareText: 'Threads' },
  pinterest: { label: 'Pinterest', baseUrl: h => `https://www.pinterest.com/${h}`,     shareText: 'Pinterest' },
  bluesky:   { label: 'Bluesky',   baseUrl: h => `https://bsky.app/profile/${h}`,       shareText: 'Bluesky'   },
  strava:    { label: 'Strava',    baseUrl: h => `https://www.strava.com/clubs/${h}`,   shareText: 'Strava'    },
}

/**
 * All active profiles for a country, sorted. Used by the Footer and by
 * Organization.sameAs JSON-LD in the root layout.
 */
export async function getActiveProfiles(country: string): Promise<SocialProfile[]> {
  const result = await db.execute(sql`
    SELECT id, platform, handle, url, country, display_in_footer, is_active, sort_order
    FROM social_profiles
    WHERE country = ${country} AND is_active = TRUE
    ORDER BY sort_order ASC, platform ASC
  `)
  const rows = (result.rows ?? result) as Array<{
    id: string; platform: SocialPlatform; handle: string; url: string;
    country: string; display_in_footer: boolean; is_active: boolean; sort_order: number
  }>
  return rows.map(r => ({
    id: r.id,
    platform: r.platform,
    handle: r.handle,
    url: r.url,
    country: r.country,
    displayInFooter: r.display_in_footer,
    isActive: r.is_active,
    sortOrder: r.sort_order,
  }))
}

/**
 * Just the URLs — used by Organization.sameAs. Falls back to an empty array
 * rather than throwing, so a misconfigured DB never breaks the root layout.
 */
export async function getSameAsUrls(country: string): Promise<string[]> {
  try {
    const profiles = await getActiveProfiles(country)
    return profiles.map(p => p.url)
  } catch {
    return []
  }
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
