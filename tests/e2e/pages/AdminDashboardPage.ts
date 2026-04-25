import { type Page, type Locator, expect } from '@playwright/test'

export class AdminDashboardPage {
  readonly countryToggle: Locator

  constructor(readonly page: Page) {
    this.countryToggle = page.getByRole('button', { name: /^(ZA|AU)$/ })
  }

  async goto() {
    await this.page.goto('/admin')
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/admin/)
    await expect(this.page.getByRole('heading', { level: 1 })).toBeVisible()
  }

  async toggleCountry(target: 'ZA' | 'AU') {
    await this.countryToggle.click()
    await expect(this.countryToggle).toHaveText(target, { timeout: 5_000 })
  }
}
