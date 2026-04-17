import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { auth } from '@/auth'
import { sendEmail } from '@/lib/email'
import { getAdminCountry, isSuperadminSession } from '@/lib/admin-country'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const role = (session?.user as any)?.role
    if (!session?.user || (role !== 'admin' && role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const status = request.nextUrl.searchParams.get('status') || 'pending'
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '200')
    const country = await getAdminCountry()
    const seeAll = isSuperadminSession(session) && request.nextUrl.searchParams.get('all') === '1'

    const statusCond = status === 'all' ? sql`` : sql` AND status = ${status}`
    const countryCond = seeAll ? sql`` : sql` AND country = ${country}`

    const result = await db.execute(sql`
      SELECT id, title, slug, excerpt, category, author_name, author_email, status, is_featured, created_at, published_at, views_count
      FROM news_articles
      WHERE 1=1 ${countryCond} ${statusCond}
      ORDER BY created_at DESC LIMIT ${limit}
    `)
    return NextResponse.json({ articles: result.rows ?? result })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id, action } = await request.json() // action: 'approve' | 'reject' | 'feature'

    if (action === 'approve') {
      await db.execute(sql`
        UPDATE news_articles SET
          status = 'approved',
          published_at = NOW(),
          approved_by = ${session.user.id}::uuid,
          approved_at = NOW()
        WHERE id = ${id}::uuid
      `)
      const result = await db.execute(sql`SELECT title, author_email, author_name, slug FROM news_articles WHERE id = ${id}::uuid`)
      const rows = result.rows ?? result
      const article = Array.isArray(rows) ? (rows[0] as { title: string; author_email: string; author_name: string; slug: string } | undefined) : null
      if (article && article.author_email) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://crankmart.com'
        const authorName = String(article.author_name || 'there')
        const articleSlug = String(article.slug)
        const emailHtml = `<div style="font-family:sans-serif;max-width:560px;margin:40px auto;background:#fff;border-radius:12px;border:1px solid #ebebeb;overflow:hidden"><div style="background:#0D1B2A;padding:24px 32px"><div style="color:#fff;font-size:20px;font-weight:800">CrankMart</div></div><div style="padding:32px"><h2 style="margin:0 0 12px">Your article is live!</h2><p style="color:#6b7280">Hi ${authorName}, your article has been approved and is now live on CrankMart.</p><a href="${baseUrl}/news/${articleSlug}" style="display:inline-block;margin-top:16px;background:#0D1B2A;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">View Article →</a></div></div>`
        sendEmail({
          to: String(article.author_email),
          subject: 'Your article is live on CrankMart',
          html: emailHtml,
        })
      }
    } else if (action === 'reject') {
      await db.execute(sql`UPDATE news_articles SET status = 'rejected' WHERE id = ${id}::uuid`)
    } else if (action === 'feature') {
      await db.execute(sql`UPDATE news_articles SET is_featured = NOT is_featured WHERE id = ${id}::uuid`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
