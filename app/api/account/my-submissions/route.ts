import { NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { auth } from '@/auth'

/**
 * Returns the logged-in user's news article submissions for the
 * "My Submissions" tab on /account.
 *
 * Country-agnostic: a journalist may write for both SA and AU contexts;
 * this endpoint shows everything they've submitted regardless of which
 * country edition the article belongs to.
 */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 })
  }

  try {
    const result = await db.execute(sql`
      SELECT
        id, title, slug, status, category, cover_image_url,
        created_at, published_at, views_count
      FROM news_articles
      WHERE submitted_by = ${session.user.id}::uuid
      ORDER BY created_at DESC
      LIMIT 100
    `)
    const rows = (result.rows ?? result) as Array<Record<string, unknown>>
    return NextResponse.json(rows)
  } catch (e) {
    console.error('my-submissions failed:', e)
    return NextResponse.json({ error: 'Failed to load submissions' }, { status: 500 })
  }
}
