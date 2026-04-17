'use client'

import { useEffect, useState, useCallback } from 'react'
import { Palette, RotateCcw, Save, Check, Loader2, Eye } from 'lucide-react'
import { PageHeader, Button } from '@/components/admin/primitives'

// ── Preset concepts ───────────────────────────────────────────────────────
const PRESETS = [
  { id: 'b', label: 'Signal Orange', primary: '#EA580C', primaryHover: '#C44A0A', accent: '#EA580C', accentHover: '#C44A0A', nightRide: '#0D1B2A', background: '#f5f5f5', surface: '#ffffff' },
  { id: 'a', label: 'Precision Red',  primary: '#CC1F2D', primaryHover: '#A8172A', accent: '#CC1F2D', accentHover: '#A8172A', nightRide: '#0D1B2A', background: '#f5f5f5', surface: '#ffffff' },
  { id: 'c', label: 'Electric Blue',  primary: '#2563EB', primaryHover: '#1D4FBF', accent: '#2563EB', accentHover: '#1D4FBF', nightRide: '#0D1B2A', background: '#f5f5f5', surface: '#ffffff' },
  { id: 'd', label: 'Volt Green',     primary: '#65A30D', primaryHover: '#4D7A09', accent: '#65A30D', accentHover: '#4D7A09', nightRide: '#0D1B2A', background: '#f5f5f5', surface: '#ffffff' },
  { id: 'e', label: 'Titanium Gold',  primary: '#D4A017', primaryHover: '#AA8012', accent: '#D4A017', accentHover: '#AA8012', nightRide: '#0D1B2A', background: '#f5f5f5', surface: '#ffffff' },
  { id: 'baseline', label: 'Night Ride (Classic)', primary: '#273970', primaryHover: '#1E2E5C', accent: '#273970', accentHover: '#1E2E5C', nightRide: '#0D1B2A', background: '#ffffff', surface: '#ffffff' },
]

interface Theme {
  theme_primary:       string
  theme_primary_hover: string
  theme_accent:        string
  theme_accent_hover:  string
  theme_night_ride:    string
  theme_background:    string
  theme_surface:       string
}

const DEFAULT_THEME: Theme = {
  theme_primary:       '#EA580C',
  theme_primary_hover: '#C44A0A',
  theme_accent:        '#EA580C',
  theme_accent_hover:  '#C44A0A',
  theme_night_ride:    '#0D1B2A',
  theme_background:    '#f5f5f5',
  theme_surface:       '#ffffff',
}

// ── Live CSS preview injector ─────────────────────────────────────────────
function injectPreview(t: Theme) {
  let el = document.getElementById('cm-theme-preview')
  if (!el) {
    el = document.createElement('style')
    el.id = 'cm-theme-preview'
    document.head.appendChild(el)
  }
  el.textContent = `
    :root, [data-theme] {
      --color-primary: ${t.theme_primary} !important;
      --color-primary-dark: ${t.theme_primary_hover} !important;
      --color-accent: ${t.theme_accent} !important;
      --color-accent-dark: ${t.theme_accent_hover} !important;
      --color-night-ride: ${t.theme_night_ride} !important;
      --color-night-ride-dark: ${t.theme_night_ride}cc !important;
      --color-background: ${t.theme_background} !important;
      --color-surface: ${t.theme_surface} !important;
    }
  `
}

// ── Colour group config ───────────────────────────────────────────────────
const GROUPS = [
  {
    id: 'primary',
    label: 'Primary',
    subtitle: 'Hero · Nav · Text · Mark',
    description: 'Used for the top nav bar, footer, hero sections, and the wheel mark logo.',
    icon: '🎨',
    fields: [
      { key: 'theme_night_ride',    label: 'Night Ride (nav / footer bg)',  hint: 'Dark background for nav & footer' },
    ],
  },
  {
    id: 'accent',
    label: 'Accent',
    subtitle: 'CTA · Wordmark split · Buttons',
    description: 'The pop colour — used for MART in the logo, CTA buttons, active nav links, badges.',
    icon: '⚡',
    fields: [
      { key: 'theme_primary',       label: 'Accent colour',      hint: 'Buttons, MART wordmark, badges' },
      { key: 'theme_primary_hover', label: 'Accent hover',       hint: 'Hover state for buttons' },
      { key: 'theme_accent',        label: 'Secondary accent',   hint: 'Alternative accent (usually same as primary)' },
      { key: 'theme_accent_hover',  label: 'Secondary hover',    hint: 'Hover state for secondary accent' },
    ],
  },
  {
    id: 'background',
    label: 'Background',
    subtitle: 'Space · Breathing room',
    description: 'Page and card backgrounds — the canvas everything sits on.',
    icon: '🏔️',
    fields: [
      { key: 'theme_background', label: 'Page background',  hint: 'Main page canvas colour' },
      { key: 'theme_surface',    label: 'Surface / cards',  hint: 'Card and panel backgrounds' },
    ],
  },
]

// ── Swatch preview ────────────────────────────────────────────────────────
function Swatch({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size,
      borderRadius: 4, background: color,
      border: '1px solid rgba(0,0,0,0.12)', flexShrink: 0,
      boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
    }} />
  )
}

export default function AdminThemePage() {
  const [theme, setTheme]     = useState<Theme>(DEFAULT_THEME)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [previewing, setPreviewing] = useState(false)

  useEffect(() => {
    fetch('/api/admin/theme')
      .then(r => r.json())
      .then((data: Partial<Theme>) => {
        setTheme({ ...DEFAULT_THEME, ...data })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Live preview whenever theme changes
  useEffect(() => {
    if (previewing) injectPreview(theme)
  }, [theme, previewing])

  const handleChange = (key: keyof Theme, value: string) => {
    setTheme(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const applyPreset = (preset: typeof PRESETS[0]) => {
    const next: Theme = {
      theme_primary:       preset.primary,
      theme_primary_hover: preset.primaryHover,
      theme_accent:        preset.accent,
      theme_accent_hover:  preset.accentHover,
      theme_night_ride:    preset.nightRide,
      theme_background:    preset.background,
      theme_surface:       preset.surface,
    }
    setTheme(next)
    setSaved(false)
    if (previewing) injectPreview(next)
  }

  const togglePreview = () => {
    const next = !previewing
    setPreviewing(next)
    if (next) {
      injectPreview(theme)
    } else {
      const el = document.getElementById('cm-theme-preview')
      if (el) el.remove()
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(theme),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
      <Loader2 size={24} style={{ animation: 'spin .8s linear infinite', color: 'var(--color-primary)' }} />
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <PageHeader
        title="Theme & Colours"
        subtitle="Customise the colour scheme. Changes go live instantly site-wide on save."
        actions={
          <>
            <Button variant={previewing ? 'primary' : 'ghost'} size="sm" onClick={togglePreview}>
              <Eye size={14} /> {previewing ? 'Preview On' : 'Preview Off'}
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={14} style={{ animation: 'spin .8s linear infinite' }} /> :
               saved  ? <Check size={14} /> : <Save size={14} />}
              {saving ? 'Saving…' : saved ? 'Saved!' : 'Save & Apply'}
            </Button>
          </>
        }
      />

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, padding: '10px 14px', color: '#DC2626', fontSize: 13, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Presets */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--admin-text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
          Quick Presets
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRESETS.map(p => (
            <button key={p.id} onClick={() => applyPreset(p)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 12px', borderRadius: 4, fontSize: 12, fontWeight: 600,
              background: 'var(--admin-surface)', border: '1.5px solid #ebebeb', cursor: 'pointer',
              transition: 'border-color .15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = p.primary)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--admin-border)')}
            >
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: p.primary, display: 'inline-block' }} />
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: p.nightRide, display: 'inline-block' }} />
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Colour groups */}
      {GROUPS.map(group => (
        <div key={group.id} style={{
          background: 'var(--admin-surface)', border: '1px solid #ebebeb', borderRadius: 8,
          marginBottom: 20, overflow: 'hidden',
        }}>
          {/* Group header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', background: 'var(--admin-surface-2)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>{group.icon}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--admin-text)' }}>{group.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--admin-text-dim)', letterSpacing: '0.04em' }}>{group.subtitle}</span>
              </div>
              <p style={{ fontSize: 12, color: '#71717a', margin: 0, marginTop: 1 }}>{group.description}</p>
            </div>
          </div>

          {/* Fields */}
          <div style={{ padding: '12px 20px' }}>
            {group.fields.map(field => {
              const val = theme[field.key as keyof Theme] || '#000000'
              return (
                <div key={field.key} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '10px 0', borderBottom: '1px solid #f8f8f8',
                }}>
                  {/* Colour picker */}
                  <label style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                    <Swatch color={val} size={36} />
                    <input
                      type="color"
                      value={val}
                      onChange={e => handleChange(field.key as keyof Theme, e.target.value)}
                      style={{ position: 'absolute', opacity: 0, inset: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                    />
                  </label>

                  {/* Label + hint */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text)' }}>{field.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--admin-text-dim)', marginTop: 1 }}>{field.hint}</div>
                  </div>

                  {/* Hex input */}
                  <input
                    type="text"
                    value={val}
                    onChange={e => {
                      const v = e.target.value
                      if (/^#[0-9a-fA-F]{0,6}$/.test(v)) handleChange(field.key as keyof Theme, v)
                    }}
                    maxLength={7}
                    style={{
                      width: 90, padding: '6px 10px', borderRadius: 4, border: '1.5px solid #e4e4e7',
                      fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: 'var(--admin-text)',
                      background: 'var(--admin-surface-2)', textAlign: 'center', letterSpacing: '0.05em',
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Live preview nav mockup */}
      <div style={{ marginTop: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--admin-text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
          Live Preview
        </p>
        <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #ebebeb', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          {/* Nav preview */}
          <div style={{ background: theme.theme_night_ride, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18.5" stroke="white" strokeWidth="1.5"/>
              <circle cx="20" cy="20" r="11.5" stroke="white" strokeWidth="1" opacity="0.35"/>
              <circle cx="20" cy="20" r="2" fill="white"/>
              <line x1="20" y1="2" x2="20" y2="8.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="20" y1="31.5" x2="20" y2="38" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="2" y1="20" x2="8.5" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="31.5" y1="20" x2="38" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '0.04em' }}>
              <span style={{ color: 'var(--admin-surface)' }}>CRANK</span>
              <span style={{ color: theme.theme_primary }}>MART</span>
            </span>
            <div style={{ flex: 1, display: 'flex', gap: 4 }}>
              {['Browse', 'Events', 'Routes', 'Shops'].map(l => (
                <span key={l} style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', padding: '4px 10px', borderRadius: 2 }}>{l}</span>
              ))}
            </div>
            <span style={{ background: theme.theme_primary, color: 'var(--admin-surface)', fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 2 }}>
              + Sell
            </span>
          </div>
          {/* Body preview */}
          <div style={{ background: theme.theme_background, padding: 20 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {['Road Bikes', 'MTB', 'Components', 'Clothing'].map((cat, i) => (
                <span key={cat} style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  background: i === 0 ? theme.theme_primary : theme.theme_surface,
                  color: i === 0 ? 'var(--admin-surface)' : 'var(--admin-text)',
                  border: `1.5px solid ${i === 0 ? theme.theme_primary : 'var(--admin-border)'}`,
                }}>{cat}</span>
              ))}
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  flex: 1, background: theme.theme_surface, borderRadius: 6,
                  border: '1px solid #ebebeb', padding: 12, minWidth: 0,
                }}>
                  <div style={{ height: 60, background: 'var(--admin-border)', borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--admin-text)' }}>Trek Domane SL 5</div>
                  <div style={{ fontSize: 12, color: theme.theme_primary, fontWeight: 800, marginTop: 2 }}>R 28,000</div>
                </div>
              ))}
            </div>
          </div>
          {/* Footer preview */}
          <div style={{ background: theme.theme_night_ride, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 800, fontSize: 12, letterSpacing: '0.06em' }}>
              <span style={{ color: 'var(--admin-surface)' }}>CRANK</span>
              <span style={{ color: theme.theme_primary }}>MART</span>
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 8 }}>SA&apos;s cycling marketplace</span>
          </div>
        </div>
      </div>

      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  )
}
