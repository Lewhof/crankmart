import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck

  try {
    const body = (await request.json()) as { to: string }

    if (!body.to) {
      return NextResponse.json({ error: 'Email address required' }, { status: 400 })
    }

    const result = await sendEmail({
      to: body.to,
      subject: 'CycleMart SMTP Test Email',
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ebebeb">
    <div style="background:#0D1B2A;padding:28px 32px">
      <div style="color:#fff;font-size:22px;font-weight:800">🚲 CycleMart</div>
    </div>
    <div style="padding:32px">
      <h2 style="margin:0 0 16px;font-size:20px;color:#1a1a1a">SMTP Configuration Test</h2>
      <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6">
        Your email settings are working correctly! This is a test email from CycleMart to verify your SMTP configuration.
      </p>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #ebebeb;font-size:12px;color:#9a9a9a;text-align:center">
      <a href="https://cyclemart.co.za" style="color:#0D1B2A">cyclemart.co.za</a>
    </div>
  </div>
</body>
</html>
      `,
    })

    if (!result.ok) {
      return NextResponse.json(
        { error: `Failed: ${result.reason || 'Unknown error'}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Test email sent successfully' })
  } catch (error) {
    console.error('Test email error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Failed to send test email: ${errorMessage}` }, { status: 500 })
  }
}
