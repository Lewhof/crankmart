/**
 * Wave 1 smoke — country isolation (no cross-country data leak).
 * Maps to manual catalogue tests 6.1, 6.2, 6.3 from the smoke roadmap.
 *
 * API-level checks (no browser) — fast, deterministic, catches regressions
 * in the country-aware listings query that no UI test would surface.
 */

import { test, expect, request } from '@playwright/test'

test.describe('country isolation — listings API', () => {
  test('6.1 /api/listings with admin_country=za returns only SA cities', async ({ playwright }) => {
    const ctx = await playwright.request.newContext({
      extraHTTPHeaders: { cookie: 'admin_country=za' },
    })
    const res = await ctx.get('/api/listings?limit=20')
    expect(res.status()).toBe(200)
    const body = await res.json()
    const items = Array.isArray(body) ? body : (body.items ?? body.listings ?? [])
    expect(items.length).toBeGreaterThan(0)
    for (const item of items) {
      expect(item.country).toBe('za')
    }
    await ctx.dispose()
  })

  test('6.2 /api/listings with admin_country=au returns only AU listings', async ({ playwright }) => {
    const ctx = await playwright.request.newContext({
      extraHTTPHeaders: { cookie: 'admin_country=au' },
    })
    const res = await ctx.get('/api/listings?limit=20')
    expect(res.status()).toBe(200)
    const body = await res.json()
    const items = Array.isArray(body) ? body : (body.items ?? body.listings ?? [])
    expect(items.length).toBeGreaterThan(0)
    for (const item of items) {
      expect(item.country).toBe('au')
    }
    await ctx.dispose()
  })
})

test.describe('country isolation — UI', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('6.3 no "South Africa" leaks onto /au home or browse', async ({ page }) => {
    await page.goto('/au')
    const auMain = page.locator('main')
    await expect(auMain).not.toContainText(/South Africa|SAPS/i)

    await page.goto('/au/browse')
    const browseMain = page.locator('main')
    await expect(browseMain).not.toContainText(/South Africa|SAPS|Cape Town|Johannesburg/i)
  })
})

test.describe('cron auth', () => {
  test('6.17 cron endpoint rejects request without CRON_SECRET', async ({ playwright }) => {
    const ctx = await playwright.request.newContext()
    const res = await ctx.get('/api/cron/moderation-sla')
    // Any of 401 / 403 / 404 (depending on app) — what matters is "not 200"
    expect([401, 403]).toContain(res.status())
    await ctx.dispose()
  })
})
