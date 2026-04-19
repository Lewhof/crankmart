import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { getCountry } from '@/lib/country'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const country = await getCountry()
    // Join submitted_by user so the article header can link to /u/[handle]
    // and show the actual user's avatar (when the article came in via the
    // logged-in submission flow, not the legacy freeform-author seed path).
    const result = await db.execute(sql`
      SELECT
        n.*,
        u.handle      AS author_handle,
        u.avatar_url  AS author_avatar
      FROM news_articles n
      LEFT JOIN users u ON u.id = n.submitted_by
      WHERE n.slug = ${slug} AND n.status = 'approved' AND n.country = ${country}
      LIMIT 1
    `)
    const rows = Array.isArray(result.rows) ? result.rows : (Array.isArray(result) ? result : [])
    if (!rows || !rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Increment views (country-scoped)
    await db.execute(sql`UPDATE news_articles SET views_count = views_count + 1 WHERE slug = ${slug} AND country = ${country}`)

    // Get related articles
    const article = rows[0] as any
    const relatedResult = await db.execute(sql`
      SELECT id, title, slug, excerpt, cover_image_url, category, author_name, published_at
      FROM news_articles
      WHERE status = 'approved' AND slug != ${slug} AND category = ${article.category} AND country = ${country}
      ORDER BY published_at DESC LIMIT 3
    `)
    const relatedRows = Array.isArray(relatedResult.rows) ? relatedResult.rows : (Array.isArray(relatedResult) ? relatedResult : [])

    return NextResponse.json({ article, related: relatedRows })
  } catch (error) {
    console.error('News article error:', error)
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 })
  }
}
