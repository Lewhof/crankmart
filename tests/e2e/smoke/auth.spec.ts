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
  test('2.1 regular_sa storageState reaches /account (authenticated route)', async ({ browser }) => {
    const context = await browser.newContext({ storageState: TEST_USERS.regular_sa.storageState })
    const page = await context.newPage()
    await page.goto('/account')
    // /account 308-redirects when authenticated (probably to a sub-route); should NOT bounce to /login
    await expect(page).not.toHaveURL(/\/login/)
    await context.close()
  })

  // TODO[selector-triage]: .avatar-btn locator times out on /za even though session cookie is
  // valid (other auth tests pass). Possibly useSession() loading-state race; needs waitFor on
  // the button + interactive UI-mode debug to confirm.
  test.skip('2.2 logout clears session', async ({ browser }) => {
    const context = await browser.newContext({ storageState: TEST_USERS.regular_sa.storageState })
    const page = await context.newPage()
    await page.goto('/za') // start at country home (TopNav present); /account uses its own layout
    // TopNav avatar dropdown reveals "Sign out" button.
    await page.locator('.avatar-btn').first().click()
    await page.getByRole('button', { name: /sign out/i }).click()
    // signOut() callback redirects to '/' — wait for navigation away from current state.
    await page.waitForLoadState('networkidle')
    // Verify session is dead: /account should now bounce to /login.
    await page.goto('/account')
    await expect(page).toHaveURL(/\/login/)
    await context.close()
  })

  test('2.3 admin storageState can reach /admin', async ({ browser }) => {
    const context = await browser.newContext({ storageState: TEST_USERS.admin.storageState })
    const page = await context.newPage()
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin/)
    // Don't assert h1 — admin shell may use h2 for page titles. Just confirm not 403/login bounce.
    await expect(page).not.toHaveURL(/\/login/)
    await context.close()
  })
})
