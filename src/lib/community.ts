/**
 * Shared helpers for the community surface — comment target validation,
 * handle generation/sanitisation, target-type resolution.
 *
 * Comments are polymorphic: a single `comments` table backs discussions on
 * listings, events, routes, news, stolen reports + lost reports. The
 * `target_type` discriminator must be one of the values in TARGET_TYPES;
 * anything else is rejected at the API boundary so SQL doesn't have to
 * defend against it later.
 */

export const TARGET_TYPES = [
  'listing',
  'event',
  'route',
  'news',
  'stolen_report',
  'lost_report',
] as const

export type TargetType = (typeof TARGET_TYPES)[number]

export function isTargetType(v: string): v is TargetType {
  return (TARGET_TYPES as readonly string[]).includes(v)
}

/** URL-safe handle: lowercase, alphanumeric + underscore, 3–30 chars. */
export function isValidHandle(raw: string): boolean {
  return /^[a-z0-9_]{3,30}$/.test(raw)
}

/** Strip noise so users get a forgiving "what would my handle look like" preview. */
export function suggestHandle(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 30)
}

/** Comment body: trim, collapse runs of newlines, cap length. */
export function sanitiseCommentBody(raw: string): string {
  return raw.trim().replace(/\n{3,}/g, '\n\n').slice(0, 4000)
}

export const FLAG_REASONS = [
  'spam',
  'abusive',
  'misleading',
  'off_topic',
  'private_info',
  'other',
] as const
export type FlagReason = (typeof FLAG_REASONS)[number]

export function isFlagReason(v: string): v is FlagReason {
  return (FLAG_REASONS as readonly string[]).includes(v)
}
