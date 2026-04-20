import 'server-only'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import type { SocialPlatform, SocialProfile } from './social-meta'

// Re-export client-safe metadata so callers don't have to know the split.
// Any use-client component should prefer importing directly from
// '@/lib/social-meta' to keep the server-only bundle out of the browser.
export * from './social-meta'

/**
 * All active profiles for a country, sorted. Used by the Footer (via props
 * from the root layout) and by Organization.sameAs JSON-LD. Returns [] rather
 * than throwing if the table is missing (pre-migration boot).
 */
export async function getActiveProfiles(country: string): Promise<SocialProfile[]> {
  try {
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
  } catch (e) {
    console.error('[social] getActiveProfiles failed', e)
    return []
  }
}

/**
 * Just the URLs — used by Organization.sameAs. Falls back to an empty array
 * rather than throwing, so a misconfigured DB never breaks the root layout.
 */
export async function getSameAsUrls(country: string): Promise<string[]> {
  const profiles = await getActiveProfiles(country)
  return profiles.map(p => p.url)
}
