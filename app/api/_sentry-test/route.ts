import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  throw new Error('Sentry test error — ' + new Date().toISOString())
  return NextResponse.json({ ok: true })
}
