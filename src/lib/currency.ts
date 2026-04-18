/**
 * Currency + locale helpers that read from country-config. Replaces hardcoded
 * `R ${amount.toLocaleString('en-ZA')}` scattered across pages.
 *
 * Price storage is always the numeric column — currency is presentation-only.
 * If we ever need two-currency support for a single listing, that's a bigger
 * schema change; not in scope here.
 */

import { getCountryConfig } from './country-config'
import type { Country } from './country'

/**
 * Format a numeric price for display. Accepts strings too because Drizzle's
 * numeric columns round-trip as strings.
 *
 *   formatPrice('za', 5000)      → 'R 5 000'
 *   formatPrice('au', '5000.50') → 'A$5,000.50'
 */
export function formatPrice(
  country: Country,
  amount: number | string,
  opts: { showCents?: boolean } = {},
): string {
  const cfg = getCountryConfig(country)
  const n = typeof amount === 'string' ? parseFloat(amount) : amount
  if (!Number.isFinite(n)) return `${cfg.currencySymbol}0`

  const minimumFractionDigits = opts.showCents ? 2 : 0
  const maximumFractionDigits = opts.showCents ? 2 : 0
  const body = n.toLocaleString(cfg.locale, { minimumFractionDigits, maximumFractionDigits })
  // SA convention puts a space after R; AU slams A$ against the number.
  const sep = country === 'za' ? ' ' : ''
  return `${cfg.currencySymbol}${sep}${body}`
}

/** Return the ISO-4217 currency code for a country. */
export function getCurrency(country: Country): 'ZAR' | 'AUD' {
  return getCountryConfig(country).currency
}

/** BCP-47 locale for `toLocaleDateString` / date rendering. */
export function getLocale(country: Country): string {
  return getCountryConfig(country).locale
}
