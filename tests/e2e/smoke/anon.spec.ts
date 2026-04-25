/**
 * Wave 1 smoke — anonymous visitor flows.
 * Maps to manual catalogue tests 1.1, 1.2, 1.8, 1.15 from
 * 2026-04-19-e2e-smoke-test-roadmap.md.
 *
 * No authentication — runs without storageState.
 */

import { test, expect } from '@playwright/test'
import { BrowsePage } from '../pages/BrowsePage'

// Anon = no storageState
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('anon — discoverability', () => {
  test('1.1 home /za renders without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })

    await page.goto('/za')
    await expect(page).toHaveURL(/\/za\/?$/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(errors, `Console errors on /za: ${errors.join('\n')}`).toEqual([])
  })

  test('1.2 /au renders with AU branding', async ({ page }) => {
    await page.goto('/au')
    await expect(page).toHaveURL(/\/au\/?$/)
    // Footer contains "Australia" or "AU's" — country adj
    await expect(page.locator('footer')).toContainText(/Australia|AU/)
    // No SA leak in main content
    const main = page.locator('main')
    await expect(main).not.toContainText(/South Africa|SAPS|R\d+/)
  })
})

test.describe('anon — browse', () => {
  test('1.8 /za/browse shows SA listings + ZAR currency', async ({ page }) => {
    const browse = new BrowsePage(page)
    await browse.goto('za')
    await browse.expectListingsRendered()
    await browse.expectCurrencyLabel('ZAR')
  })

  test('1.8b /au/browse shows AU listings + AUD currency', async ({ page }) => {
    const browse = new BrowsePage(page)
    await browse.goto('au')
    await browse.expectListingsRendered()
    await browse.expectCurrencyLabel('AUD')
  })

  test('1.15 listing detail loads from a browse card click', async ({ page }) => {
    const browse = new BrowsePage(page)
    await browse.goto('za')
    await browse.expectListingsRendered()
    const firstCard = page.locator('a[href^="/s/"]').first()
    await firstCard.click()
    await expect(page).toHaveURL(/\/s\//)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})
