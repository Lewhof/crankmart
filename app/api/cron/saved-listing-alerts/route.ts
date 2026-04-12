import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { sendEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cyclemart.co.za'

    // Find saved listings expiring in < 5 days that haven't been alerted yet
    const result = await db.execute(sql`
      SELECT 
        sl.user_id,
        u.name as user_name,
        u.email as user_email,
        l.id as listing_id,
        l.title,
        l.slug,
        l.price,
        l.expires_at,
        l.bike_make,
        l.bike_model
      FROM saved_listings sl
      JOIN users u ON u.id = sl.user_id
      JOIN listings l ON l.id = sl.listing_id
      WHERE l.status = 'active'
        AND l.expires_at IS NOT NULL
        AND l.expires_at BETWEEN NOW() AND NOW() + INTERVAL '5 days'
        AND sl.expiry_alert_sent IS NOT DISTINCT FROM false
    `)

    const rows = (result.rows ?? result) as any[]
    let notified = 0

    for (const row of rows) {
      try {
        const expiresDate = new Date(row.expires_at).toLocaleDateString('en-ZA', {
          day: '2-digit', month: 'short', year: 'numeric'
        })
        const listingTitle = [row.bike_make, row.bike_model, row.title].filter(Boolean)[0] || row.title
        const price = `R ${parseFloat(row.price).toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`

        await sendEmail({
          to: row.user_email,
          subject: `Saved listing expiring soon: ${listingTitle}`,
          html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ebebeb">
    <div style="background:#0D1B2A;padding:28px 32px">
      <div style="color:#fff;font-size:22px;font-weight:800">🚲 CycleMart</div>
    </div>
    <div style="padding:32px">
      <h2 style="margin:0 0 8px;font-size:20px;color:#1a1a1a">A saved listing is expiring soon ⏰</h2>
      <p style="margin:0 0 24px;color:#6b7280;font-size:14px">
        Hi ${row.user_name || 'there'}, a listing you saved is expiring on <strong>${expiresDate}</strong>.
        Act fast if you're still interested!
      </p>
      <div style="background:#f5f5f5;border-radius:8px;padding:16px;margin-bottom:24px;">
        <div style="font-size:16px;font-weight:700;color:#1a1a1a;margin-bottom:4px">${listingTitle}</div>
        <div style="font-size:18px;font-weight:900;color:#0D1B2A">${price}</div>
      </div>
      <a href="${baseUrl}/browse/${row.slug}" 
        style="display:block;text-align:center;background:#0D1B2A;color:#fff;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:12px">
        View Listing →
      </a>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #ebebeb;font-size:12px;color:#9a9a9a;text-align:center">
      You saved this listing on <a href="${baseUrl}" style="color:#0D1B2A">cyclemart.co.za</a>
    </div>
  </div>
</body>
</html>`,
        })

        // Mark alert sent
        await db.execute(sql`
          UPDATE saved_listings SET expiry_alert_sent = true
          WHERE user_id = ${row.user_id} AND listing_id = ${row.listing_id}
        `)

        notified++
      } catch (err) {
        console.error('Saved listing alert error:', err)
      }
    }

    return NextResponse.json({ success: true, notified, checked: rows.length })
  } catch (error) {
    console.error('Saved listing alerts cron error:', error)
    // If expiry_alert_sent column doesn't exist yet, return gracefully
    return NextResponse.json({ success: true, notified: 0, note: String(error) })
  }
}
