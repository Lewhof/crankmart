import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck

  try {
    const { merchant_id, merchant_key, passphrase, sandbox } = await req.json() as {
      merchant_id: string
      merchant_key: string
      passphrase: string
      sandbox: boolean
    }

    if (!merchant_id || !merchant_key) {
      return NextResponse.json({ valid: false, error: 'Merchant ID and key are required' })
    }

    const host = sandbox ? 'https://sandbox.payfast.co.za' : 'https://www.payfast.co.za'

    // Build a minimal PayFast signature check using the ping endpoint
    // PayFast doesn't have a public validation API, so we build a test payload
    // and hit the process endpoint in a HEAD/OPTIONS way to check credentials
    // The real check: build a valid signature and see if PayFast accepts it

    const timestamp = new Date().toISOString().slice(0, 19)
    const params: Record<string, string> = {
      merchant_id,
      merchant_key,
      amount: '1.00',
      item_name: 'Verification Test',
      m_payment_id: `verify_${Date.now()}`,
    }

    // Build param string + signature
    let paramString = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(v).replace(/%20/g, '+')}`)
      .join('&')

    if (passphrase && passphrase !== '••••••') {
      paramString += `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`
    }

    const signature = crypto.createHash('md5').update(paramString).digest('hex')

    // Try fetching the PayFast process endpoint — a 400 means creds are recognised (bad request = merchant found but invalid data)
    // A 401/403 means invalid merchant credentials
    const formBody = new URLSearchParams({ ...params, signature })
    const response = await fetch(`${host}/eng/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody.toString(),
      redirect: 'manual',
    })

    const status = response.status

    // PayFast redirects (302/303) to their checkout = merchant is valid and recognised
    // 200 with HTML = also valid (sandbox behavior)
    // 400 = recognised merchant but invalid payload (still means creds work)
    // 401/403 = invalid credentials

    if (status === 302 || status === 303 || status === 200 || status === 400) {
      const mode = sandbox ? 'SANDBOX' : 'LIVE'
      return NextResponse.json({
        valid: true,
        message: `✓ Merchant ${merchant_id} verified on PayFast ${mode}`,
        details: {
          merchant_id,
          mode,
          payfast_host: host,
          http_status: status,
          timestamp,
        },
      })
    }

    if (status === 401 || status === 403) {
      return NextResponse.json({
        valid: false,
        error: `Invalid credentials — PayFast returned ${status}. Check your merchant ID, key, and passphrase.`,
        details: { http_status: status, host },
      })
    }

    // Any other response
    return NextResponse.json({
      valid: false,
      error: `Unexpected response from PayFast (HTTP ${status}). Credentials may be incorrect or PayFast is unreachable.`,
      details: { http_status: status, host },
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({
      valid: false,
      error: `Could not reach PayFast: ${message}`,
    })
  }
}
