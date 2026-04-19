import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { getCountry } from '@/lib/country'

export async function GET(request: NextRequest) {
  try {
    const p = request.nextUrl.searchParams
    const limit  = Math.min(parseInt(p.get('limit') || '12'), 50)
    const offset = parseInt(p.get('offset') || '0')
    const category = p.get('category')
    const featured = p.get('featured')
    const country = await getCountry()

    const categoryFilter = category && category !== 'all'
      ? sql` AND category = ${category}`
      : sql``
    const featuredFilter = featured === 'true' ? sql` AND is_featured = true` : sql``

    const [result, countResult] = await Promise.all([
      db.execute(sql`
        SELECT id, title, slug, excerpt, cover_image_url, category, tags,
               author_name, is_featured, views_count, published_at, created_at
        FROM news_articles
        WHERE status = 'approved' AND country = ${country}${categoryFilter}${featuredFilter}
        ORDER BY is_featured DESC, published_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `),
      db.execute(sql`SELECT COUNT(*) as total FROM news_articles WHERE status = 'approved' AND country = ${country}${categoryFilter}${featuredFilter}`),
    ])
    const total = parseInt((countResult.rows?.[0] as any)?.total || '0')

    return NextResponse.json(
      {
        articles: result.rows ?? result,
        pagination: { total, limit, offset, hasMore: offset + limit < total },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          'Vary': 'Cookie, Accept-Encoding, x-country',
        },
      }
    )
  } catch (error) {
    console.error('News fetch error:', error)
    return NextResponse.json({ articles: [], pagination: { total: 0, limit: 12, offset: 0, hasMore: false } })
  }
}
