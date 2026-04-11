import { db } from '@/db'
import { sql } from 'drizzle-orm'

export interface ThemeVars {
  primary: string
  primaryHover: string
  accent: string
  accentHover: string
  nightRide: string
  background: string
  surface: string
}

const DEFAULTS: ThemeVars = {
  primary:      '#EA580C',
  primaryHover: '#C44A0A',
  accent:       '#EA580C',
  accentHover:  '#C44A0A',
  nightRide:    '#0D1B2A',
  background:   '#f5f5f5',
  surface:      '#ffffff',
}

export async function getThemeVars(): Promise<ThemeVars> {
  try {
    const result = await db.execute(
      sql`SELECT key, value FROM site_settings WHERE key LIKE 'theme_%'`
    )
    const rows = (result.rows ?? result) as Array<{ key: string; value: string }>
    const map: Record<string, string> = {}
    rows.forEach(r => { map[r.key] = r.value })

    return {
      primary:      map['theme_primary']      || DEFAULTS.primary,
      primaryHover: map['theme_primary_hover'] || DEFAULTS.primaryHover,
      accent:       map['theme_accent']       || DEFAULTS.accent,
      accentHover:  map['theme_accent_hover'] || DEFAULTS.accentHover,
      nightRide:    map['theme_night_ride']   || DEFAULTS.nightRide,
      background:   map['theme_background']   || DEFAULTS.background,
      surface:      map['theme_surface']      || DEFAULTS.surface,
    }
  } catch {
    return DEFAULTS
  }
}

export function buildThemeCss(t: ThemeVars): string {
  return `
    :root, [data-theme] {
      --color-primary: ${t.primary};
      --color-primary-dark: ${t.primaryHover};
      --color-accent: ${t.accent};
      --color-accent-dark: ${t.accentHover};
      --color-night-ride: ${t.nightRide};
      --color-night-ride-dark: color-mix(in srgb, ${t.nightRide} 80%, black);
      --color-background: ${t.background};
      --color-surface: ${t.surface};
    }
  `.trim()
}
