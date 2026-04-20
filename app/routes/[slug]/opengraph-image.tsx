import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-image'

export const alt = 'Cycling route on CrankMart'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const result = await db.execute(sql`
    SELECT name, discipline, difficulty, distance_km, elevation_m, town, province
    FROM routes WHERE slug = ${slug} LIMIT 1
  `)
  const row = ((result.rows ?? result) as Array<{
    name: string; discipline: string; difficulty: string;
    distance_km: string | null; elevation_m: number | null;
    town: string | null; province: string | null
  }>)[0]

  if (!row) return renderOg({ kind: 'Route', title: 'CrankMart trail' })

  const bits = [
    row.distance_km ? `${row.distance_km} km` : null,
    row.elevation_m ? `${row.elevation_m} m elev` : null,
    row.difficulty,
    [row.town, row.province].filter(Boolean).join(', '),
  ].filter(Boolean)

  return renderOg({
    kind: `Trail · ${row.discipline}`.toUpperCase(),
    title: row.name,
    subtitle: bits.join(' · '),
  })
}
