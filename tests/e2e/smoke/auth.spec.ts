/**
 * Wave 1 smoke — auth flows.
 * Maps to manual catalogue tests 2.1, 2.2 from the smoke roadmap.
 *
 * Login itself is exercised in auth.setup.ts (it must succeed for ANY auth
 * test to run); these specs verify the post-login state holds and logout works.
 */

import { test, expect } from '@playwright/test'
import { TEST_USERS } from '../fixtures/test-users'

test.describe('auth — session lifecycle', () => {
  test('2.1 regular_sa storageState lands on /account', async ({ browser }) => {
    const context = await browser.newContext({ storageState: TEST_USERS.regular_sa.storageState })
    const page = await context.newPage()
    await page.goto('/account')
    await expect(page).toHaveURL(/\/account/)
    // User menu / nav reflects logged-in state
    await expect(page.locator('header, nav')).toContainText(new RegExp(TEST_USERS.regular_sa.name.split(' ')[0], 'i'))
    await context.close()
  })

  test('2.2 logout clears session', async ({ browser }) => {
    const context = await browser.newContext({ storageState: TEST_USERS.regular_sa.storageState })
    const page = await context.newPage()
    await page.goto('/account')
    await page.getByRole('button', { name: /sign out|log out|logout/i }).first().click()
    // Land on home or /login; either way /account should now bounce
    await page.goto('/account')
    await expect(page).toHaveURL(/\/login/)
    await context.close()
  })

  test('2.3 admin storageState can reach /admin', async ({ browser }) => {
    const context = await browser.newContext({ storageState: TEST_USERS.admin.storageState })
    const page = await context.newPage()
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await context.close()
  })
})
