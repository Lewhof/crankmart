/**
 * Wave 1 smoke — sell wizard + stolen-serial gate.
 * Maps to manual catalogue tests 2.22 + 2.18 from the smoke roadmap.
 *
 * Stolen-gate test is the highest-value pre-launch check: confirms the
 * publish path refuses listings whose serial matches an approved stolen report.
 */

import { test, expect } from '@playwright/test'
import { TEST_USERS } from '../fixtures/test-users'
import { STOLEN_TEST_SERIAL } from '../fixtures/stolen-serial'
import { SellWizardPage } from '../pages/SellWizardPage'

test.use({ storageState: TEST_USERS.regular_sa.storageState })

test.describe('sell — wizard + gates', () => {
  test('2.18 sell wizard accepts a clean listing through publish', async ({ page }) => {
    const sell = new SellWizardPage(page)
    const uniqueSlug = `e2e-smoke-${Date.now()}`

    await sell.gotoStep1()
    await sell.fillStep1({ categoryLabel: 'MTB', title: `E2E Smoke Listing ${uniqueSlug}` })
    await sell.clickNext()

    await sell.fillStep2({ make: 'TestBrand', model: 'SmokeBike', year: 2024, condition: 'used' })
    await sell.clickNext()

    await sell.fillStep3({ province: 'Western Cape', city: 'Cape Town', price: '999' })
    await sell.clickNext()

    // Step 4 = preview + publish
    await sell.clickPublish()
    await expect(page).toHaveURL(/\/sell\/success|\/s\//, { timeout: 15_000 })
  })

  test('2.22 publish blocked when serial is in stolen registry', async ({ page }) => {
    const sell = new SellWizardPage(page)

    await sell.gotoStep1()
    await sell.fillStep1({ categoryLabel: 'MTB', title: 'E2E Stolen-Gate Test' })
    await sell.clickNext()

    await sell.fillStep2({ make: 'TestBrand', model: 'StolenCheck', year: 2024, condition: 'used' })
    await sell.clickNext()

    await sell.fillStep3({
      province: 'Western Cape',
      city: 'Cape Town',
      price: '999',
      serial: STOLEN_TEST_SERIAL,
    })
    await sell.clickNext()
    await sell.clickPublish()

    await sell.expectStolenSerialBlocked()
    // We should NOT be on a success page
    await expect(page).not.toHaveURL(/\/sell\/success/)
  })
})
