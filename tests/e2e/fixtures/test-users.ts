/**
 * Single source of truth for test user credentials in E2E specs.
 * Mirrors TEST_USERS in scripts/seed-test-users.ts — keep in sync.
 *
 * Login state for each persona is captured by auth.setup.ts into
 * playwright/.auth/<key>.json and consumed via:
 *
 *   import { test } from '@playwright/test'
 *   test.use({ storageState: TEST_USERS.regular_sa.storageState })
 */

export const TEST_PASSWORD = 'Test1234!'

interface TestUser {
  key: string
  email: string
  name: string
  role: 'buyer' | 'seller' | 'shop_owner' | 'organiser' | 'admin'
  country: 'za' | 'au'
  storageState: string
  emailVerified: boolean
}

function persona(key: string, fields: Omit<TestUser, 'key' | 'storageState'>): TestUser {
  return { key, storageState: `playwright/.auth/${key}.json`, ...fields }
}

export const TEST_USERS = {
  regular_sa:  persona('regular_sa',  { email: 'test.sa@crankmart.com',         name: 'Test User SA',       role: 'seller',     country: 'za', emailVerified: true }),
  regular_au:  persona('regular_au',  { email: 'test.au@crankmart.com',         name: 'Test User AU',       role: 'seller',     country: 'au', emailVerified: true }),
  shop_sa:     persona('shop_sa',     { email: 'test.shop.sa@crankmart.com',    name: 'Shop Owner SA',      role: 'shop_owner', country: 'za', emailVerified: true }),
  shop_au:     persona('shop_au',     { email: 'test.shop.au@crankmart.com',    name: 'Shop Owner AU',      role: 'shop_owner', country: 'au', emailVerified: true }),
  event_sa:    persona('event_sa',    { email: 'test.event.sa@crankmart.com',   name: 'Event Organiser SA', role: 'organiser',  country: 'za', emailVerified: true }),
  event_au:    persona('event_au',    { email: 'test.event.au@crankmart.com',   name: 'Event Organiser AU', role: 'organiser',  country: 'au', emailVerified: true }),
  admin:       persona('admin',       { email: 'test.admin@crankmart.com',      name: 'Test Admin',         role: 'admin',      country: 'za', emailVerified: true }),
  unverified:  persona('unverified',  { email: 'test.unverified@crankmart.com', name: 'Test Unverified',    role: 'seller',     country: 'za', emailVerified: false }),
} as const

export type TestUserKey = keyof typeof TEST_USERS
