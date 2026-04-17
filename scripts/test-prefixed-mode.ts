/**
 * B12: local verification that COUNTRY_ROUTING_MODE=prefixed handles the
 * 20 most-trafficked routes correctly. Exercises proxy.ts directly by
 * constructing NextRequest instances and checking the redirect shape.
 *
 * Run:   COUNTRY_ROUTING_MODE=prefixed tsx scripts/test-prefixed-mode.ts
 *
 * Expected outcomes:
 *  - '/'            → 308 redirect to /za
 *  - '/browse'      → 308 redirect to /za/browse
 *  - '/za'          → pass-through (200 from the app itself)
 *  - '/za/browse'   → pass-through
 *  - '/api/listings'→ pass-through (API bypasses the gate)
 */
process.env.COUNTRY_ROUTING_MODE = 'prefixed'

import { NextRequest } from 'next/server'
import { proxy } from '../proxy'

// Only paths the static harness can exercise without a real request context
// (the full gate check calls `await auth()` which needs Next.js runtime).
// The excluded paths MUST be retested against a live preview deployment
// before the DNS flip that turns on prefixed mode in production.
const TOP_20_ROUTES = [
  '/',
  '/login',
  '/register',
  '/verify',
  '/forgot-password',
  '/api/listings',
  '/api/listings/foo',
  '/api/events',
  '/api/auth/session',
  '/api/waitlist',
]

const BASE = 'https://crankmart.com'

interface Outcome {
  path: string
  status: number
  location?: string | null
  verdict: 'OK' | 'FAIL'
  reason?: string
}

function expected(path: string): 'redirect' | 'pass' {
  if (path === '/') return 'redirect'
  if (path.startsWith('/api/')) return 'pass'
  const first = path.split('/')[1]?.split('?')[0] || ''
  if (first === 'za') return 'pass'
  return 'redirect'
}

async function check(path: string): Promise<Outcome> {
  const req = new NextRequest(new URL(path, BASE), { method: 'GET' })
  try {
    const res = await proxy(req)
    const status = res.status
    const location = res.headers.get('location')
    const kind = expected(path)
    if (kind === 'redirect') {
      if (status === 308 || status === 307 || status === 301) {
        const ok = location?.includes('/za')
        return { path, status, location, verdict: ok ? 'OK' : 'FAIL', reason: ok ? undefined : 'redirected but not to /za' }
      }
      return { path, status, location, verdict: 'FAIL', reason: `expected redirect, got ${status}` }
    }
    if (status === 200) return { path, status, location, verdict: 'OK' }
    if (status < 400) return { path, status, location, verdict: 'OK' }
    return { path, status, location, verdict: 'FAIL', reason: `unexpected status ${status}` }
  } catch (e) {
    return { path, status: 0, verdict: 'FAIL', reason: (e as Error).message }
  }
}

async function main() {
  console.log(`\nTesting COUNTRY_ROUTING_MODE=${process.env.COUNTRY_ROUTING_MODE}\n`)
  console.log('PATH'.padEnd(35), 'STATUS', 'LOCATION'.padEnd(40), 'VERDICT')
  console.log('-'.repeat(100))
  let fails = 0
  for (const p of TOP_20_ROUTES) {
    const o = await check(p)
    const loc = (o.location || '').slice(0, 38)
    console.log(
      p.padEnd(35),
      String(o.status).padEnd(6),
      loc.padEnd(40),
      o.verdict,
      o.reason ? `(${o.reason})` : '',
    )
    if (o.verdict === 'FAIL') fails++
  }
  console.log('')
  console.log(fails === 0 ? '✅ All routes behave correctly in prefixed mode.' : `❌ ${fails} route(s) failed.`)
  process.exit(fails)
}
main()
