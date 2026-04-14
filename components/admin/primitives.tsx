'use client'

/**
 * Shared admin UI primitives. All assume `[data-theme="admin"]` on ancestor.
 * Keep styles token-driven — never hardcode colors.
 */

import * as React from 'react'

// ─── Card ─────────────────────────────────────────────────────────────
export function Card({
  children,
  className = '',
  padded = true,
  interactive = false,
}: {
  children: React.ReactNode
  className?: string
  padded?: boolean
  interactive?: boolean
}) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--admin-surface)',
        border: '1px solid var(--admin-border)',
        borderRadius: 10,
        padding: padded ? 16 : 0,
        transition: interactive ? 'background .15s, transform .15s' : undefined,
        cursor: interactive ? 'pointer' : undefined,
      }}
    >
      {children}
    </div>
  )
}

// ─── PageHeader ───────────────────────────────────────────────────────
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 20,
        flexWrap: 'wrap',
      }}
    >
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--admin-text)' }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--admin-text-dim)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
    </div>
  )
}

// ─── StatusPill ───────────────────────────────────────────────────────
import { type PillTone, toneForStatus } from './tone'
export { toneForStatus }

const PILL_STYLES: Record<PillTone, { bg: string; color: string }> = {
  neutral: { bg: 'color-mix(in oklch, var(--admin-text-dim) 15%, transparent)', color: 'var(--admin-text-dim)' },
  success: { bg: 'color-mix(in oklch, var(--admin-success) 18%, transparent)', color: 'var(--admin-success)' },
  warn:    { bg: 'color-mix(in oklch, var(--admin-warn) 20%, transparent)',    color: 'var(--admin-warn)' },
  danger:  { bg: 'color-mix(in oklch, var(--admin-danger) 20%, transparent)',  color: 'var(--admin-danger)' },
  accent:  { bg: 'color-mix(in oklch, var(--admin-accent) 20%, transparent)',  color: 'var(--admin-accent)' },
}

export function StatusPill({
  label,
  tone = 'neutral',
}: {
  label: string
  tone?: PillTone
}) {
  const s = PILL_STYLES[tone]
  return (
    <span
      style={{
        display: 'inline-block',
        background: s.bg,
        color: s.color,
        padding: '2px 10px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '.2px',
        textTransform: 'capitalize',
      }}
    >
      {label}
    </span>
  )
}

// ─── Table ────────────────────────────────────────────────────────────
export function Table({
  head,
  rows,
  empty = 'Nothing to show.',
  onSelect,
  selectedIds,
}: {
  head: React.ReactNode[]
  rows: Array<{ id: string; cells: React.ReactNode[] }>
  empty?: React.ReactNode
  onSelect?: (ids: string[]) => void
  selectedIds?: string[]
}) {
  const selectable = Boolean(onSelect)
  const allSelected = selectable && rows.length > 0 && selectedIds?.length === rows.length

  const toggle = (id: string) => {
    if (!onSelect) return
    const set = new Set(selectedIds ?? [])
    if (set.has(id)) set.delete(id)
    else set.add(id)
    onSelect([...set])
  }
  const toggleAll = () => {
    if (!onSelect) return
    onSelect(allSelected ? [] : rows.map(r => r.id))
  }

  if (rows.length === 0) {
    return <Empty message={typeof empty === 'string' ? empty : 'Nothing to show.'}>{typeof empty !== 'string' ? empty : null}</Empty>
  }

  return (
    <div style={{ overflowX: 'auto', border: '1px solid var(--admin-border)', borderRadius: 10 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead style={{ background: 'var(--admin-surface-2)' }}>
          <tr>
            {selectable && (
              <th style={thCss}>
                <input type="checkbox" checked={!!allSelected} onChange={toggleAll} aria-label="Select all" />
              </th>
            )}
            {head.map((h, i) => (
              <th key={i} style={thCss}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => {
            const sel = selectedIds?.includes(r.id)
            return (
              <tr key={r.id} style={{ borderTop: '1px solid var(--admin-border)', background: sel ? 'color-mix(in oklch, var(--admin-accent) 8%, transparent)' : undefined }}>
                {selectable && (
                  <td style={tdCss}>
                    <input type="checkbox" checked={!!sel} onChange={() => toggle(r.id)} aria-label={`Select ${r.id}`} />
                  </td>
                )}
                {r.cells.map((c, i) => <td key={i} style={tdCss}>{c}</td>)}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const thCss: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  fontWeight: 600,
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '.3px',
  color: 'var(--admin-text-dim)',
}
const tdCss: React.CSSProperties = {
  padding: '10px 12px',
  color: 'var(--admin-text)',
  verticalAlign: 'middle',
}

// ─── Empty ────────────────────────────────────────────────────────────
export function Empty({
  message,
  children,
}: {
  message: string
  children?: React.ReactNode
}) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '48px 16px',
        color: 'var(--admin-text-dim)',
        background: 'var(--admin-surface)',
        border: '1px dashed var(--admin-border)',
        borderRadius: 10,
      }}
    >
      <div style={{ fontSize: 14 }}>{message}</div>
      {children && <div style={{ marginTop: 12 }}>{children}</div>}
    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────
export function StatCard({
  label,
  value,
  hint,
  tone = 'neutral',
}: {
  label: string
  value: string | number
  hint?: string
  tone?: PillTone
}) {
  const t = PILL_STYLES[tone]
  return (
    <div
      style={{
        background: 'var(--admin-surface)',
        border: '1px solid var(--admin-border)',
        borderLeft: `3px solid ${t.color}`,
        borderRadius: 10,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.4px', color: 'var(--admin-text-dim)', fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--admin-text)' }}>{value}</div>
      {hint && <div style={{ fontSize: 12, color: 'var(--admin-text-dim)' }}>{hint}</div>}
    </div>
  )
}

// ─── Button ───────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'ghost' | 'danger'
export function Button({
  children,
  onClick,
  variant = 'ghost',
  href,
  type = 'button',
  disabled,
  size = 'md',
}: {
  children: React.ReactNode
  onClick?: (e: React.MouseEvent) => void
  variant?: BtnVariant
  href?: string
  type?: 'button' | 'submit'
  disabled?: boolean
  size?: 'sm' | 'md'
}) {
  const styles: Record<BtnVariant, React.CSSProperties> = {
    primary: {
      background: 'var(--admin-accent)',
      color: '#fff',
      border: '1px solid var(--admin-accent)',
    },
    ghost: {
      background: 'var(--admin-surface-2)',
      color: 'var(--admin-text)',
      border: '1px solid var(--admin-border)',
    },
    danger: {
      background: 'color-mix(in oklch, var(--admin-danger) 18%, transparent)',
      color: 'var(--admin-danger)',
      border: '1px solid color-mix(in oklch, var(--admin-danger) 40%, transparent)',
    },
  }
  const sizeCss: React.CSSProperties = size === 'sm'
    ? { padding: '5px 10px', fontSize: 12 }
    : { padding: '8px 14px', fontSize: 13 }
  const base: React.CSSProperties = {
    ...styles[variant],
    ...sizeCss,
    borderRadius: 6,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  }
  if (href) return <a href={href} style={base}>{children}</a>
  return <button type={type} onClick={onClick} disabled={disabled} style={base}>{children}</button>
}

// ─── BulkActionBar ────────────────────────────────────────────────────
export function BulkActionBar({
  count,
  children,
  onClear,
}: {
  count: number
  children: React.ReactNode
  onClear: () => void
}) {
  if (!count) return null
  return (
    <div
      style={{
        position: 'sticky',
        bottom: 16,
        margin: '16px 0',
        padding: '10px 14px',
        background: 'var(--admin-surface-2)',
        border: '1px solid var(--admin-accent)',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,.15)',
        zIndex: 30,
      }}
    >
      <span style={{ fontSize: 13, color: 'var(--admin-text)' }}>
        <strong>{count}</strong> selected
      </span>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', gap: 8 }}>{children}</div>
      <Button variant="ghost" size="sm" onClick={onClear}>Clear</Button>
    </div>
  )
}
