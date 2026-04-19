import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { auth } from '@/auth'
import { sendEmail } from '@/lib/email'
import { sanitizeArticleHtml } from '@/lib/sanitize-html'
import { getCountry } from '@/lib/country'
import { getCountryConfig } from '@/lib/country-config'

/**
 * Auth-gated article submission. Replaces the previous public, freeform-author,
 * sql.raw-with-manual-escaping endpoint.
 *
 * Author identity comes from the session (no retyping). Body is HTML from the
 * Tiptap editor and is sanitised server-side via sanitizeArticleHtml() before
 * persisting. Country is taken from the x-country header (set by the proxy).
 *
 * On success: writes status='pending', sends notification to active admins.
 */

function slugify(text: string): string {
  const base = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 100)
  return `${base}-${Math.random().toString(36).slice(2, 6)}`
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: 'Login required to submit an article' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const { title, excerpt, body: htmlBody, coverImageUrl, category, tags, sourceUrl } = body as {
    title?: string
    excerpt?: string
    body?: string
    coverImageUrl?: string | null
    category?: string
    tags?: string[]
    sourceUrl?: string | null
  }

  if (!title?.trim() || !htmlBody?.trim() || !excerpt?.trim()) {
    return NextResponse.json({ error: 'Title, excerpt and body are required' }, { status: 400 })
  }

  const sanitised = sanitizeArticleHtml(htmlBody)
  if (!sanitised.trim()) {
    return NextResponse.json({ error: 'Body is empty after sanitisation' }, { status: 400 })
  }

  const country = await getCountry()
  const cfg = getCountryConfig(country)
  const slug = slugify(title)
  const tagsArray = Array.isArray(tags) ? tags : []
  const userName = session.user.name ?? 'Anonymous Contributor'
  const userEmail = session.user.email
  const userId = session.user.id

  try {
    // Author bio comes from the user record so submissions stay current with profile.
    const userRows = await db.execute(sql`SELECT bio FROM users WHERE id = ${userId}::uuid LIMIT 1`)
    const userBio = ((userRows.rows ?? userRows) as Array<{ bio: string | null }>)[0]?.bio ?? null

    await db.execute(sql`
      INSERT INTO news_articles (
        title, slug, excerpt, body, cover_image_url, category, tags,
        author_name, author_email, author_bio, source_url,
        status, country, submitted_by, published_at
      ) VALUES (
        ${title}, ${slug}, ${excerpt}, ${sanitised},
        ${coverImageUrl ?? null}, ${category ?? 'general'}, ${tagsArray}::text[],
        ${userName}, ${userEmail}, ${userBio}, ${sourceUrl ?? null},
        'pending', ${country}, ${userId}::uuid, NULL
      )
    `)
  } catch (err) {
    console.error('news/submit insert failed:', err)
    return NextResponse.json({ error: 'Failed to submit article' }, { status: 500 })
  }

  // Notify active admins. Best-effort — submission still succeeds even if mail fails.
  try {
    const adminResult = await db.execute(sql`
      SELECT email FROM users WHERE role IN ('admin', 'superadmin') AND is_active = true LIMIT 5
    `)
    const admins = ((adminResult.rows ?? adminResult) as Array<{ email: string }>).filter(a => a.email)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://crankmart.com'

    await Promise.all(admins.map(admin => sendEmail({
      to: admin.email,
      subject: `New ${cfg.name} article submission: "${title}"`,
      html: `<!DOCTYPE html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f5;margin:0;padding:32px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ebebeb">
    <div style="background:#0D1B2A;padding:24px 32px">
      <div style="color:#fff;font-size:20px;font-weight:800">CrankMart — New article submission</div>
      <div style="color:rgba(255,255,255,0.5);font-size:12px;margin-top:2px">${cfg.name} edition</div>
    </div>
    <div style="padding:32px">
      <h2 style="margin:0 0 8px;font-size:18px;color:#1a1a1a">${title}</h2>
      <p style="color:#6b7280;font-size:14px;margin:0 0 6px">By <strong>${userName}</strong> (${userEmail})</p>
      <p style="color:#6b7280;font-size:14px;margin:0 0 20px">Category: <strong>${category ?? 'general'}</strong> · Country: <strong>${country.toUpperCase()}</strong></p>
      <a href="${baseUrl}/admin/news" style="display:inline-block;background:#0D1B2A;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">
        Review in Admin →
      </a>
    </div>
  </div>
</body></html>`,
    }).catch(e => console.error('admin notify failed for', admin.email, e))))
  } catch (e) {
    console.error('admin notify lookup failed:', e)
  }

  return NextResponse.json({ success: true, slug })
}
