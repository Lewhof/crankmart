import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-image'

export const alt = 'Bike shop on CrankMart'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const result = await db.execute(sql`
    SELECT name, business_type, city, province, description
    FROM businesses WHERE slug = ${slug} LIMIT 1
  `)
  const row = ((result.rows ?? result) as Array<{
    name: string; business_type: string; city: string | null; province: string | null; description: string | null
  }>)[0]

  if (!row) return renderOg({ kind: 'Directory', title: 'CrankMart directory' })

  const location = [row.city, row.province].filter(Boolean).join(', ')
  const kindLabel = row.business_type.replace(/_/g, ' ')
  const subtitle = [location, row.description?.slice(0, 120)].filter(Boolean).join(' · ')
  return renderOg({ kind: kindLabel, title: row.name, subtitle })
}
