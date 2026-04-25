import { type Page, type Locator, expect } from '@playwright/test'

export class SellWizardPage {
  constructor(readonly page: Page) {}

  async gotoStep1() {
    await this.page.goto('/sell/step-1')
  }

  async fillStep1(opts: { categoryLabel: string; title: string }) {
    await this.page.getByRole('button', { name: opts.categoryLabel, exact: false }).first().click()
    await this.page.getByLabel(/title/i).fill(opts.title)
  }

  async fillStep2(opts: { make: string; model: string; year: number; condition: 'new' | 'like_new' | 'used' | 'poor' }) {
    await this.page.getByLabel(/make/i).fill(opts.make)
    await this.page.getByLabel(/model/i).fill(opts.model)
    await this.page.getByLabel(/year/i).fill(String(opts.year))
    const conditionLabels: Record<typeof opts.condition, RegExp> = {
      new: /^new$/i,
      like_new: /like.?new/i,
      used: /used/i,
      poor: /poor/i,
    }
    await this.page.getByLabel(conditionLabels[opts.condition]).check()
  }

  async fillStep3(opts: { province: string; city: string; price: string; serial?: string }) {
    await this.page.getByLabel(/province|state/i).selectOption({ label: opts.province })
    await this.page.getByLabel(/city/i).fill(opts.city)
    await this.page.getByLabel(/price/i).fill(opts.price)
    if (opts.serial) {
      await this.page.getByLabel(/serial/i).fill(opts.serial)
    }
  }

  async clickNext() {
    await this.page.getByRole('button', { name: /next/i }).click()
  }

  async clickPublish() {
    await this.page.getByRole('button', { name: /publish/i }).click()
  }

  async clickSaveDraft() {
    await this.page.getByRole('button', { name: /save draft/i }).click()
  }

  async expectStolenSerialBlocked() {
    await expect(this.page.getByText(/registered as stolen|stolen registry/i)).toBeVisible({ timeout: 10_000 })
  }
}
