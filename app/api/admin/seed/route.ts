import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { runOrchestrator, summariseResults } from '@/db/seeds/orchestrator'

// Double-auth: admin session + SEED_TOKEN header.
// SEED_TOKEN is a server-only env var; prod runs require both.
export async function POST(req: NextRequest) {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck

  const expected = process.env.SEED_TOKEN
  const provided = req.headers.get('x-seed-token')
  if (!expected || provided !== expected) {
    return NextResponse.json({ error: 'Invalid seed token' }, { status: 403 })
  }

  let body: {
    entity?: 'businesses' | 'routes' | 'events'
    region?: string
    dryRun?: boolean
  } = {}
  try {
    body = await req.json()
  } catch {
    // empty body = run everything
  }

  const results = await runOrchestrator({
    entity: body.entity,
    region: body.region,
    dryRun: body.dryRun,
  })

  return NextResponse.json(summariseResults(results))
}
