import { type Page, type Locator, expect } from '@playwright/test'

export class BrowsePage {
  readonly searchInput: Locator
  readonly listingCards: Locator
  readonly priceFilter: Locator
  readonly provinceFilter: Locator
  readonly conditionFilter: Locator

  constructor(readonly page: Page) {
    this.searchInput = page.getByPlaceholder(/search/i)
    this.listingCards = page.locator('[data-testid="listing-card"], article, a[href^="/s/"]').first()
    this.priceFilter = page.getByLabel(/price/i)
    this.provinceFilter = page.getByLabel(/province|state/i)
    this.conditionFilter = page.getByLabel(/condition/i)
  }

  async goto(country: 'za' | 'au' = 'za') {
    await this.page.goto(`/${country}/browse`)
  }

  async expectListingsRendered() {
    await expect(this.listingCards).toBeVisible({ timeout: 10_000 })
  }

  async expectCurrencyLabel(currency: 'ZAR' | 'AUD') {
    await expect(this.page.getByText(new RegExp(`Price\\s*\\(${currency}\\)`, 'i'))).toBeVisible()
  }
}
