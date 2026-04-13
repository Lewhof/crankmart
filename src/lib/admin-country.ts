/**
 * Admin country context — operator-facing, NOT a security boundary.
 *
 * Admin operators set their "viewing country" via a cookie set from the
 * top-bar switcher. API routes read it via `getAdminCountry()` and filter
 * queries accordingly. Superadmin can pass `?all=1` to see every country.
 *
 * Access control is handled separately by `checkAdminApi()` — this helper
 * only decides *what rows* the admin sees, not *whether* they're admin.
 */

import { cookies } from 'next/headers'
import {
  ACTIVE_COUNTRIES,
  DEFAULT_COUNTRY,
  getCountry,
  isActiveCountry,
  type Country,
} from './country'

export const ADMIN_COUNTRY_COOKIE = 'admin_country'

export async function getAdminCountry(): Promise<Country> {
  try {
    const store = await cookies()
    const v = store.get(ADMIN_COUNTRY_COOKIE)?.value
    if (isActiveCountry(v)) return v
  } catch {
    /* outside request context */
  }
  return getCountry()
}

/**
 * Resolve whether a given admin session may cross countries via ?all=1.
 * Call inside API routes after `checkAdminApi` has succeeded.
 */
export function isSuperadminSession(session: unknown): boolean {
  return (session as { user?: { role?: string } })?.user?.role === 'superadmin'
}

export { ACTIVE_COUNTRIES, DEFAULT_COUNTRY }
