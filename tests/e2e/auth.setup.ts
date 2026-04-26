/**
 * Playwright `setup` project: logs in once per persona via the real /login form
 * and saves authenticated state to playwright/.auth/<key>.json. Specs consume
 * the saved state via test.use({ storageState: TEST_USERS.<key>.storageState }).
 *
 * UI-drive (not a backdoor route) per Auth.js v5 + Playwright recommendation.
 * Exercises the real authorize() callback + bcrypt + DB lookup once per run.
 *
 * Pre-requisite: scripts/seed-test-users.ts must have populated the cohort
 * against the DB this baseURL points to (TEST_ENV=true on dev Vercel project,
 * or local .env.test for local runs).
 */

import { test as setup, expect } from '@playwright/test'
import { TEST_USERS, TEST_PASSWORD, type TestUserKey } from './fixtures/test-users'
import fs from 'node:fs'
import path from 'node:path'

const AUTH_DIR = 'playwright/.auth'

setup.beforeAll(() => {
  fs.mkdirSync(AUTH_DIR, { recursive: true })
})

const PERSONAS: TestUserKey[] = [
  'regular_sa',
  'regular_au',
  'shop_sa',
  'shop_au',
  'event_sa',
  'event_au',
  'admin',
  'unverified',
]

for (const key of PERSONAS) {
  const user = TEST_USERS[key]

  setup(`authenticate ${key}`, async ({ page }) => {
    // API-direct login (skips form). NextAuth v5 credentials flow:
    //   1. GET /api/auth/csrf  → captures __Host-authjs.csrf-token cookie + token body
    //   2. POST /api/auth/callback/credentials with csrfToken + creds + json:true (returns JSON not redirect)
    //   3. Cookie jar receives __Secure-authjs.session-token
    // Form-based login worked client-side but didn't persist the session cookie reliably under
    // Playwright's chromium context (form's onSubmit calls signIn() with redirect:false then a
    // hard window.location.href — by the time we navigated, the Set-Cookie hadn't been processed
    // by the browser context yet).
    const ctx = page.context()

    const csrfRes = await ctx.request.get('/api/auth/csrf')
    const { csrfToken } = await csrfRes.json()

    const loginRes = await ctx.request.post('/api/auth/callback/credentials', {
      form: {
        csrfToken,
        email: user.email,
        password: TEST_PASSWORD,
        callbackUrl: '/',
        json: 'true',
      },
    })

    if (!loginRes.ok() && loginRes.status() !== 302) {
      throw new Error(`Login failed for ${key}: ${loginRes.status()} ${await loginRes.text()}`)
    }

    // Verify the session cookie landed; without it the storageState is useless.
    const cookies = await ctx.cookies()
    const sessionCookie = cookies.find(c => c.name.includes('authjs.session-token'))
    if (!sessionCookie) {
      throw new Error(
        `No session cookie set for ${key}. Got: ${cookies.map(c => c.name).join(', ')}`,
      )
    }

    await ctx.storageState({ path: path.join(AUTH_DIR, `${key}.json`) })
  })
}
