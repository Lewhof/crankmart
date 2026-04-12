import { db } from '../../index'
import { sql } from 'drizzle-orm'

export async function checkDuplicate(params: {
  slug: string
  lat?: number | null
  lng?: number | null
  discipline?: string
}): Promise<{ exists: boolean; id: string | null }> {
  const { slug, lat, lng, discipline } = params

  const rows = await db.execute(sql`
    SELECT id FROM routes
    WHERE slug = ${slug}
      OR (
        lat IS NOT NULL AND lng IS NOT NULL
        AND ABS(CAST(lat AS float) - ${lat ?? 0}) < 0.005
        AND ABS(CAST(lng AS float) - ${lng ?? 0}) < 0.005
        AND discipline = ${discipline ?? 'mtb'}
      )
    LIMIT 1
  `)

  if (rows.rows.length > 0) {
    return { exists: true, id: rows.rows[0].id as string }
  }
  return { exists: false, id: null }
}
