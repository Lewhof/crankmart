import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { auth } from '@/auth'
import { sendEmail } from '@/lib/email'

function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 100)
    + '-' + Math.random().toString(36).slice(2, 6)
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const body = await request.json()
    const { title, excerpt, content, coverImageUrl, category, tags, authorName, authorEmail, authorBio, sourceUrl } = body

    if (!title?.trim() || !content?.trim() || !authorName?.trim() || !authorEmail?.trim()) {
      return NextResponse.json({ error: 'Title, content, author name and email are required' }, { status: 400 })
    }

    const slug = slugify(title)
    const tagsArray = Array.isArray(tags) ? tags : (tags || '').split(',').map((t: string) => t.trim()).filter(Boolean)

    await db.execute(sql.raw(`
      INSERT INTO news_articles (
        title, slug, excerpt, body, cover_image_url, category, tags,
        author_name, author_email, author_bio, source_url, status,
        submitted_by, published_at
      ) VALUES (
        '${title.replace(/'/g, "''")}',
        '${slug}',
        '${(excerpt || '').replace(/'/g, "''")}',
        '${content.replace(/'/g, "''")}',
        ${coverImageUrl ? `'${coverImageUrl}'` : 'NULL'},
        '${(category || 'general').replace(/'/g, "''")}',
        ARRAY[${tagsArray.map((t: string) => `'${t.replace(/'/g, "''")}'`).join(',')}]::text[],
        '${authorName.replace(/'/g, "''")}',
        '${authorEmail.replace(/'/g, "''")}',
        ${authorBio ? `'${authorBio.replace(/'/g, "''")}'` : 'NULL'},
        ${sourceUrl ? `'${sourceUrl}'` : 'NULL'},
        'pending',
        ${session?.user?.id ? `'${session.user.id}'` : 'NULL'},
        NULL
      )
    `))

    // Notify admin
    try {
      const adminResult = await db.execute(sql.raw(`SELECT email FROM users WHERE role = 'admin' LIMIT 3`))
      const admins = (adminResult.rows ?? adminResult) as any[]
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cyclemart.co.za'

      for (const admin of admins) {
        await sendEmail({
          to: admin.email,
          subject: `New article submission: "${title}"`,
          html: `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f5f5f5;padding:32px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ebebeb">
    <div style="background:#0D1B2A;padding:24px 32px">
      <div style="color:#fff;font-size:20px;font-weight:800">🚲 CycleMart — New Article Submission</div>
    </div>
    <div style="padding:32px">
      <h2 style="margin:0 0 8px;font-size:18px">${title}</h2>
      <p style="color:#6b7280;font-size:14px;margin:0 0 16px">Submitted by <strong>${authorName}</strong> (${authorEmail})</p>
      <p style="color:#6b7280;font-size:14px;margin:0 0 24px">Category: <strong>${category || 'general'}</strong></p>
      <a href="${baseUrl}/admin/news" style="display:inline-block;background:#0D1B2A;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">
        Review in Admin →
      </a>
    </div>
  </div>
</body>
</html>`
        })
      }
    } catch (emailErr) {
      console.error('Admin notification email failed:', emailErr)
    }

    return NextResponse.json({ success: true, message: 'Article submitted for review' })
  } catch (error) {
    console.error('Article submit error:', error)
    return NextResponse.json({ error: 'Failed to submit article' }, { status: 500 })
  }
}
