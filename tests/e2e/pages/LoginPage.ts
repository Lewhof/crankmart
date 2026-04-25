import { type Page, type Locator, expect } from '@playwright/test'

export class LoginPage {
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly signInButton: Locator
  readonly googleButton: Locator
  readonly forgotPasswordLink: Locator
  readonly registerLink: Locator

  constructor(readonly page: Page) {
    this.emailInput = page.getByLabel(/email/i)
    this.passwordInput = page.getByLabel(/password/i)
    this.signInButton = page.getByRole('button', { name: /sign in|log in/i })
    this.googleButton = page.getByRole('button', { name: /sign in with google/i })
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot password/i })
    this.registerLink = page.getByRole('link', { name: /create account|register|sign up/i })
  }

  async goto() {
    await this.page.goto('/login')
  }

  async loginWith(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.signInButton.click()
  }

  async expectLoaded() {
    await expect(this.emailInput).toBeVisible()
    await expect(this.signInButton).toBeVisible()
  }
}
