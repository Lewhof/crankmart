# CrankMart E2E Tests (Playwright)

Headless end-to-end tests covering the highest-value user-visible flows. Wave 1 smoke (12 tests) runs against any deployment with the test cohort seeded.

## Quick start

```bash
# 1. Install browser binaries (one-time, ~150MB)
npm run test:e2e:install

# 2. Make sure the test cohort is seeded against the DB you'll target
npm run seed:test          # uses .env.test (laptop-local) by default

# 3. Run all smoke tests against local dev server (port 3010)
npm run dev                # in another terminal
npm run test:e2e

# Or against deployed dev environment
E2E_BASE_URL=https://dev.crankmart.com npm run test:e2e
```

## What runs where

| Surface | Command | Target |
|---|---|---|
| Local against `next dev -p 3010` | `npm run test:e2e` | http://localhost:3010 |
| Local against test DB | `npm run dev:test` + `E2E_BASE_URL=http://localhost:3011 npm run test:e2e` | http://localhost:3011 |
| Deployed dev env | `E2E_BASE_URL=https://dev.crankmart.com npm run test:e2e` | dev.crankmart.com |
| CI (GitHub Actions, Phase 3) | Triggered on push to `dev` + PR to `main` | dev.crankmart.com (after Vercel deploy) |

## Wave 1 smoke tests (12)

Maps to manual catalogue numbers in [`.claude/plans/2026-04-19-e2e-smoke-test-roadmap.md`](../../../.claude/plans/2026-04-19-e2e-smoke-test-roadmap.md):

| File | Tests | Manual catalogue refs |
|---|---|---|
| `smoke/anon.spec.ts` | 5 | 1.1, 1.2, 1.8, 1.8b, 1.15 |
| `smoke/auth.spec.ts` | 3 | 2.1, 2.2 + admin smoke |
| `smoke/sell.spec.ts` | 2 | 2.18, 2.22 (stolen-gate) |
| `smoke/country-isolation.spec.ts` | 4 | 6.1, 6.2, 6.3, 6.17 (cron auth) |

## Authentication

Per-persona login is captured **once per run** by `auth.setup.ts` (Playwright `setup` project). Each persona writes to `playwright/.auth/<key>.json`. Specs consume via:

```ts
import { TEST_USERS } from '../fixtures/test-users'
test.use({ storageState: TEST_USERS.regular_sa.storageState })
```

**Pattern:** UI-drive form login (real `/login` POST, real `authorize()` callback, real bcrypt). No `/api/test/login` backdoor — production code surface stays clean.

**Auth.js v5 cookie note:** session cookie is `authjs.session-token` (HTTP) or `__Secure-authjs.session-token` (HTTPS). Playwright captures whichever is set automatically; no manual cookie naming needed.

## Available personas

8 personas defined in `fixtures/test-users.ts`, mirroring `scripts/seed-test-users.ts`:

| Key | Email | Role | Country |
|---|---|---|---|
| `regular_sa` | test.sa@crankmart.com | seller | za |
| `regular_au` | test.au@crankmart.com | seller | au |
| `shop_sa` | test.shop.sa@crankmart.com | shop_owner | za |
| `shop_au` | test.shop.au@crankmart.com | shop_owner | au |
| `event_sa` | test.event.sa@crankmart.com | organiser | za |
| `event_au` | test.event.au@crankmart.com | organiser | au |
| `admin` | test.admin@crankmart.com | admin | za |
| `unverified` | test.unverified@crankmart.com | seller (unverified) | za |

Shared password: `Test1234!`

## Layout

```
tests/e2e/
├── README.md                  ← this file
├── auth.setup.ts              ← runs once, writes playwright/.auth/*.json
├── fixtures/
│   ├── test-users.ts          ← persona registry, mirrors seed script
│   └── stolen-serial.ts       ← TEST-STOLEN-001 constant
├── pages/                     ← Page Object Models (extend as new flows are added)
│   ├── LoginPage.ts
│   ├── BrowsePage.ts
│   ├── SellWizardPage.ts
│   └── AdminDashboardPage.ts
└── smoke/                     ← Wave 1 (P0)
    ├── anon.spec.ts
    ├── auth.spec.ts
    ├── sell.spec.ts
    └── country-isolation.spec.ts
```

Wave 2 regression tests will go in `tests/e2e/regression/`. Wave 3 admin-depth in `tests/e2e/admin-depth/`. See [`.claude/plans/2026-04-25-e2e-automation-roadmap.md`](../../../.claude/plans/2026-04-25-e2e-automation-roadmap.md) for the full multi-wave plan.

## Adding a new test

1. Pick the wave + file (or create a new spec file in the appropriate subdir).
2. Reference manual catalogue test number in a leading comment (e.g. `// manual 2.18`).
3. If the test needs auth, add `test.use({ storageState: TEST_USERS.<key>.storageState })` near the top.
4. Use existing Page Objects where they fit; extend a POM rather than duplicating selectors.
5. Prefer **semantic selectors** (`getByRole`, `getByLabel`, `getByText`) over CSS — robust to markup changes.
6. Keep each `test()` independent — no ordering assumptions, no shared state.

## Selector tuning

Several Page Object selectors use educated-guess regex (e.g. `getByLabel(/email/i)`). When tests run for the first time against the live app, some selectors will need adjustment to match the actual rendered markup. Use Playwright's UI mode (`npm run test:e2e:ui`) to inspect and recover.

## CI integration (Phase 3 — pending)

A GitHub Actions workflow at `.github/workflows/e2e-dev.yml` will:
- Trigger on push to `dev` + PR to `main`
- Wait for Vercel deploy READY
- Install Chromium + run `npm run test:e2e`
- Block merges to main on failure
- Upload report as artifact

Workflow file is **not yet committed** — added in Phase 3 of the automation roadmap.

## Roadmaps

- [Manual smoke catalogue (283 tests)](../../../.claude/plans/2026-04-19-e2e-smoke-test-roadmap.md) — source-of-truth for *what* to test
- [Automation roadmap (waves 1-3)](../../../.claude/plans/2026-04-25-e2e-automation-roadmap.md) — *how* to automate
