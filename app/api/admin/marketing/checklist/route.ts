import { NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

type Row = {
  id: string
  section: string
  section_label: string
  label: string
  description: string | null
  sort_order: number
  is_complete: boolean
  completed_by: string | null
  completed_at: string | null
  completed_by_name: string | null
  notes: string | null
}

export async function GET() {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck

  const result = await db.execute(sql`
    SELECT m.id, m.section, m.section_label, m.label, m.description, m.sort_order,
           m.is_complete, m.completed_by, m.completed_at, m.notes,
           u.name AS completed_by_name
    FROM marketing_checklist_items m
    LEFT JOIN users u ON u.id = m.completed_by
    ORDER BY
      CASE m.section
        WHEN 'platform' THEN 1
        WHEN 'phase_1'  THEN 2
        WHEN 'phase_2'  THEN 3
        WHEN 'phase_3'  THEN 4
        ELSE 99
      END,
      m.sort_order
  `)
  const rows = ((result as unknown as { rows?: Row[] }).rows ?? (result as unknown as Row[])) as Row[]

  const sections = new Map<string, { key: string; label: string; items: Row[]; total: number; done: number }>()
  for (const r of rows) {
    const bucket = sections.get(r.section) ?? { key: r.section, label: r.section_label, items: [], total: 0, done: 0 }
    bucket.items.push(r)
    bucket.total += 1
    if (r.is_complete) bucket.done += 1
    sections.set(r.section, bucket)
  }

  const total = rows.length
  const done = rows.filter((r) => r.is_complete).length

  return NextResponse.json({
    sections: Array.from(sections.values()),
    summary: { total, done, pct: total === 0 ? 0 : Math.round((done / total) * 100) },
  })
}
