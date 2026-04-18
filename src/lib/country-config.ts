/**
 * Central registry of per-country facts so every localisation point (currency,
 * locale, hero copy, police-case label, gate status, etc.) reads from one
 * source of truth instead of being scattered across templates and API routes.
 *
 * Adding a third country = one entry here + adding the code to
 * ACTIVE_COUNTRIES in src/lib/country.ts + proxy.ts.
 */

import type { Country } from './country'

export type LaunchStatus = 'live' | 'coming-soon'

export interface CountryConfig {
  /** ISO 3166-1 alpha-2, lowercase (used everywhere as the country discriminator). */
  code: Country
  /** Display name for country selectors. */
  name: string
  /** ISO 4217 currency code for price storage + display. */
  currency: 'ZAR' | 'AUD'
  /** Currency symbol prefix shown in price pills (not localised — explicit by design). */
  currencySymbol: string
  /** BCP-47 locale for `toLocaleString` / date + number formatting. */
  locale: 'en-ZA' | 'en-AU'
  /** IANA time zone for event-time + "posted ago" rendering. */
  timezone: 'Africa/Johannesburg' | 'Australia/Sydney'
  /** ITU phone prefix (no `+`). */
  phonePrefix: string
  /** Label for the provinces/states dropdown. */
  regionLabel: 'Province' | 'State'
  /** Label for the stolen-bike "police case" field. */
  policeLabel: string
  /** Launch gate — 'live' = public, 'coming-soon' = non-admins see the gate. */
  status: LaunchStatus
  /** Hero headline on the country-scoped home / Coming Soon page. */
  heroHeadline: string
  heroSubhead: string
  /** Optional hero image path (under /public). */
  heroImage?: string
}

/**
 * Per-country config. Launch gate reads from COUNTRY_LIVE_STATUS env at runtime
 * (format: `za:live,au:coming-soon`) so we can flip AU public without a redeploy.
 */
const CONFIG: Record<Country, CountryConfig> = {
  za: {
    code: 'za',
    name: 'South Africa',
    currency: 'ZAR',
    currencySymbol: 'R',
    locale: 'en-ZA',
    timezone: 'Africa/Johannesburg',
    phonePrefix: '27',
    regionLabel: 'Province',
    policeLabel: 'SAPS case number',
    status: 'live',
    heroHeadline: "South Africa's cycling marketplace",
    heroSubhead: 'Buy, sell, and discover bikes, gear, routes, and events across SA.',
    heroImage: '/images/hero-za.jpg',
  },
  au: {
    code: 'au',
    name: 'Australia',
    currency: 'AUD',
    currencySymbol: 'A$',
    locale: 'en-AU',
    timezone: 'Australia/Sydney',
    phonePrefix: '61',
    regionLabel: 'State',
    policeLabel: 'Police case number',
    status: 'coming-soon',
    heroHeadline: "Australia's cycling marketplace",
    heroSubhead: 'Buy, sell, and discover bikes, gear, routes, and events across Australia.',
    heroImage: '/images/hero-au.jpg',
  },
}

/**
 * Resolve launch status with env override. The env var format is
 * `za:live,au:coming-soon` — each country-status pair comma-separated. Unset
 * or malformed values fall back to the compile-time default.
 */
function statusFromEnv(code: Country, fallback: LaunchStatus): LaunchStatus {
  const raw = process.env.COUNTRY_LIVE_STATUS
  if (!raw) return fallback
  const pair = raw.split(',').map(s => s.trim()).find(p => p.startsWith(`${code}:`))
  if (!pair) return fallback
  const value = pair.slice(code.length + 1).trim()
  return value === 'live' || value === 'coming-soon' ? value : fallback
}

export function getCountryConfig(code: Country): CountryConfig {
  const base = CONFIG[code]
  return { ...base, status: statusFromEnv(code, base.status) }
}

export function allCountryConfigs(): CountryConfig[] {
  return (Object.keys(CONFIG) as Country[]).map(getCountryConfig)
}
