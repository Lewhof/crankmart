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
    if (!user.emailVerified) {
      // Unverified user — log in just enough to capture the unverified-state cookie.
      // Tests that target the verify gate read this storageState; if login itself is
      // gated on verification, this setup will fail loudly and the test should switch
      // to fixture-based hydration instead.
    }

    await page.goto('/login')
    await page.getByLabel(/email/i).fill(user.email)
    await page.getByLabel(/password/i).fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /sign in|log in/i }).click()

    // Successful credential login redirects to /account (per src/auth.ts callbacks).
    // Unverified users may land on a verify-required page — accept either.
    await page.waitForURL(/\/(account|verify|verify-email)/, { timeout: 10_000 })

    await expect(page).toHaveURL(/\/(account|verify|verify-email)/)

    await page.context().storageState({ path: path.join(AUTH_DIR, `${key}.json`) })
  })
}
