'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { scaleLinear } from 'd3-scale'
import { max as d3Max } from 'd3-array'

export type BarRow = {
  label: string
  value: number
  sub?: string
  leading?: React.ReactNode
  color?: string
}

type Props = {
  rows: BarRow[]
  color?: string
  empty?: string
}

export function BarList({ rows, color = 'var(--admin-text)', empty = 'No data' }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(420)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (!wrapRef.current) return
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width
      if (w && w > 0) setWidth(Math.round(w))
    })
    ro.observe(wrapRef.current)
    const t = setTimeout(() => setMounted(true), 20)
    return () => { ro.disconnect(); clearTimeout(t) }
  }, [])

  const maxV = useMemo(() => d3Max(rows, r => r.value) ?? 1, [rows])
  const scale = scaleLinear().domain([0, maxV || 1]).range([0, 1])

  if (!rows.length) {
    return <div ref={wrapRef} style={{ color: 'var(--admin-text-dim)', fontSize: 13 }}>{empty}</div>
  }

  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
      {rows.map((r, i) => {
        const ratio = scale(r.value)
        const barColor = r.color ?? color
        return (
          <div key={`${r.label}-${i}`} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, fontSize: 13, gap: 8 }}>
              <span style={{ color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1 }}>
                {r.leading}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label || '—'}</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexShrink: 0 }}>
                {r.sub && <span style={{ fontSize: 11, color: 'var(--admin-text-dim)' }}>{r.sub}</span>}
                <span style={{ fontWeight: 700, color: 'var(--admin-text)' }}>{r.value.toLocaleString()}</span>
              </span>
            </div>
            <div style={{ height: 7, background: 'var(--admin-border)', borderRadius: 4, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${(mounted ? ratio : 0) * 100}%`,
                  background: barColor,
                  borderRadius: 4,
                  transition: 'width 600ms cubic-bezier(0.22, 0.61, 0.36, 1)',
                }}
              />
            </div>
          </div>
        )
      })}

      <svg aria-hidden="true" width={0} height={0} style={{ position: 'absolute' }}>
        <title>bar-list-{width}</title>
      </svg>
    </div>
  )
}
