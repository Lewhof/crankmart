'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { scaleLinear, scaleTime } from 'd3-scale'
import { line as d3Line, area as d3Area, curveMonotoneX } from 'd3-shape'
import { extent, max as d3Max, bisector } from 'd3-array'
import { timeFormat } from 'd3-time-format'

export type LinePoint = { date: string | Date; value: number }

type Props = {
  data: LinePoint[]
  color?: string
  height?: number
  yLabel?: string
}

const MARGIN = { top: 12, right: 12, bottom: 26, left: 42 }
const fmtShort = timeFormat('%b %d')
const fmtLong = timeFormat('%b %d, %Y')
const bisectDate = bisector<LinePoint, Date>(d => toDate(d.date)).center

function toDate(d: string | Date): Date {
  return d instanceof Date ? d : new Date(d)
}

export function LineChart({ data, color = '#0D1B2A', height = 220, yLabel }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(600)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  useEffect(() => {
    if (!wrapRef.current) return
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width
      if (w && w > 0) setWidth(Math.round(w))
    })
    ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [])

  const points = useMemo(
    () => data.map(d => ({ date: toDate(d.date), value: Number(d.value) || 0 })),
    [data],
  )

  const innerW = Math.max(width - MARGIN.left - MARGIN.right, 10)
  const innerH = Math.max(height - MARGIN.top - MARGIN.bottom, 10)

  const xDomain = useMemo(() => extent(points, p => p.date) as [Date, Date] | [undefined, undefined], [points])
  const yMax = useMemo(() => d3Max(points, p => p.value) ?? 1, [points])

  if (!points.length || !xDomain[0] || !xDomain[1]) {
    return (
      <div ref={wrapRef} style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-dim)', fontSize: 13 }}>
        No data
      </div>
    )
  }

  const x = scaleTime().domain(xDomain as [Date, Date]).range([0, innerW])
  const y = scaleLinear().domain([0, yMax || 1]).nice().range([innerH, 0])

  const linePath = d3Line<{ date: Date; value: number }>()
    .x(p => x(p.date))
    .y(p => y(p.value))
    .curve(curveMonotoneX)(points) ?? ''

  const areaPath = d3Area<{ date: Date; value: number }>()
    .x(p => x(p.date))
    .y0(innerH)
    .y1(p => y(p.value))
    .curve(curveMonotoneX)(points) ?? ''

  const yTicks = y.ticks(4)
  const xTicks = x.ticks(Math.min(points.length, Math.max(3, Math.floor(innerW / 90))))
  const gradId = `lc-grad-${color.replace(/[^a-zA-Z0-9]/g, '')}`

  const handleMove = (e: React.MouseEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const d = x.invert(mx)
    const idx = bisectDate(points, d)
    setHoverIdx(idx >= 0 && idx < points.length ? idx : null)
  }

  const hover = hoverIdx !== null ? points[hoverIdx] : null
  const hx = hover ? x(hover.date) : 0
  const hy = hover ? y(hover.value) : 0

  return (
    <div ref={wrapRef} style={{ width: '100%', position: 'relative' }}>
      <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {yTicks.map(t => (
            <g key={`yt-${t}`} transform={`translate(0,${y(t)})`}>
              <line x1={0} x2={innerW} stroke="var(--admin-border)" strokeWidth={1} />
              <text x={-8} y={0} dy="0.32em" textAnchor="end" style={{ fontSize: 10, fill: 'var(--admin-text-dim)' }}>
                {t >= 1000 ? `${(t / 1000).toFixed(t >= 10000 ? 0 : 1)}k` : t}
              </text>
            </g>
          ))}

          {xTicks.map((t, i) => (
            <text
              key={`xt-${i}`}
              x={x(t)}
              y={innerH + 16}
              textAnchor="middle"
              style={{ fontSize: 10, fill: 'var(--admin-text-dim)' }}
            >
              {fmtShort(t)}
            </text>
          ))}

          <path d={areaPath} fill={`url(#${gradId})`} />
          <path d={linePath} fill="none" stroke={color} strokeWidth={2.25} strokeLinejoin="round" strokeLinecap="round" />

          {hover && (
            <g>
              <line x1={hx} x2={hx} y1={0} y2={innerH} stroke={color} strokeWidth={1} strokeDasharray="3 3" opacity={0.5} />
              <circle cx={hx} cy={hy} r={4.5} fill="var(--admin-surface)" stroke={color} strokeWidth={2} />
            </g>
          )}

          <rect
            x={0}
            y={0}
            width={innerW}
            height={innerH}
            fill="transparent"
            onMouseMove={handleMove}
            onMouseLeave={() => setHoverIdx(null)}
          />
        </g>
      </svg>

      {hover && (
        <div
          style={{
            position: 'absolute',
            left: Math.min(Math.max(hx + MARGIN.left + 10, 8), width - 140),
            top: Math.max(hy + MARGIN.top - 12, 4),
            pointerEvents: 'none',
            background: 'var(--admin-text)',
            color: 'var(--admin-surface)',
            padding: '6px 10px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
          }}
        >
          <div style={{ opacity: 0.72, fontWeight: 500, marginBottom: 2 }}>{fmtLong(hover.date)}</div>
          <div>
            {hover.value.toLocaleString()}
            {yLabel ? <span style={{ opacity: 0.72, fontWeight: 500, marginLeft: 4 }}>{yLabel}</span> : null}
          </div>
        </div>
      )}
    </div>
  )
}
