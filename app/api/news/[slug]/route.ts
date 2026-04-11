import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const result = await db.execute(sql.raw(`
      SELECT * FROM news_articles
      WHERE slug = '${slug.replace(/'/g, "''")}' AND status = 'approved'
      LIMIT 1
    `))
    const rows = Array.isArray(result.rows) ? result.rows : (Array.isArray(result) ? result : [])
    if (!rows || !rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Increment views
    await db.execute(sql.raw(`UPDATE news_articles SET views_count = views_count + 1 WHERE slug = '${slug.replace(/'/g, "''")}'`))

    // Get related articles
    const article = rows[0] as any
    const relatedResult = await db.execute(sql.raw(`
      SELECT id, title, slug, excerpt, cover_image_url, category, author_name, published_at
      FROM news_articles
      WHERE status = 'approved' AND slug != '${slug.replace(/'/g, "''")}' AND category = '${article.category}'
      ORDER BY published_at DESC LIMIT 3
    `))
    const relatedRows = Array.isArray(relatedResult.rows) ? relatedResult.rows : (Array.isArray(relatedResult) ? relatedResult : [])

    return NextResponse.json({ article, related: relatedRows })
  } catch (error) {
    console.error('News article error:', error)
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 })
  }
}
