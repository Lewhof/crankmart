import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

const KEYS = ['payfast_merchant_id', 'payfast_merchant_key', 'payfast_passphrase', 'payfast_sandbox']

export async function GET() {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck

  try {
    const result = await db.execute(
      sql`SELECT key, value FROM site_settings WHERE key = ANY(ARRAY['payfast_merchant_id','payfast_merchant_key','payfast_passphrase','payfast_sandbox'])`
    )
    const rows = (result.rows ?? result) as Array<{ key: string; value: string }>
    const out: Record<string, string> = {}
    rows.forEach(r => {
      // Mask key + passphrase
      if (r.key === 'payfast_merchant_key' || r.key === 'payfast_passphrase') {
        out[r.key.replace('payfast_', '')] = r.value ? '••••••' : ''
      } else {
        out[r.key.replace('payfast_', '')] = r.value ?? ''
      }
    })
    return NextResponse.json(out)
  } catch {
    return NextResponse.json({ error: 'Failed to load PayFast config' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck

  try {
    const body = await req.json() as {
      merchant_id?: string
      merchant_key?: string
      passphrase?: string
      sandbox?: boolean | string
    }

    const updates: Record<string, string> = {}
    if (body.merchant_id  !== undefined) updates['payfast_merchant_id']  = body.merchant_id
    if (body.passphrase   !== undefined && body.passphrase !== '••••••') updates['payfast_passphrase'] = body.passphrase
    if (body.sandbox      !== undefined) updates['payfast_sandbox'] = String(body.sandbox)

    // Only update merchant_key if it's not the masked placeholder
    if (body.merchant_key !== undefined && body.merchant_key !== '••••••') {
      updates['payfast_merchant_key'] = body.merchant_key
    }

    for (const [key, value] of Object.entries(updates)) {
      await db.execute(sql`
        INSERT INTO site_settings (key, value, updated_at)
        VALUES (${key}, ${value}, NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      `)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to save PayFast config' }, { status: 500 })
  }
}
