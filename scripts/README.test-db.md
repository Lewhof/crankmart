# Test Database Setup (Neon Branch)

Smoke tests, E2E runs, and destructive cleanups all target an isolated Neon
**branch** — never production. Branches on Neon are copy-on-write, so this
costs nothing until the branch diverges from main.

## One-time setup

### 1. Create the branch

Neon console → **Branches** → **Create branch**

| Field | Value |
|-------|-------|
| Name | `test` |
| Parent | `main` |
| Include data | Yes (copies current schema + rows) |

Copy the **pooled** connection string it gives you.

### 2. Create `.env.test`

`.env*` is gitignored — create it locally in the app root:

```dotenv
# .env.test
DATABASE_URL="postgresql://<user>:<password>@<host>-pooler.neon.tech/<db>?sslmode=require"

# REQUIRED. Cleanup/seed scripts refuse to run without this — last-ditch
# guard against accidentally pointing at prod.
TEST_ENV="true"
```

Paste the branch's pooled `DATABASE_URL` from step 1. Keep `TEST_ENV="true"`
exactly as shown — the scripts check for this literal value.

## Daily workflow

```bash
# Seed the cohort (6 users + shops + events + listings) on the test branch
npm run seed:test

# Preview cleanup — no deletes
npm run cleanup:test:dry

# Wipe the cohort
npm run cleanup:test
```

All three scripts **refuse to run against prod** because `TEST_ENV` is only
`true` in `.env.test`. Running them with `.env.local` loaded fails fast with
a clear error.

## Resetting the branch

When the test branch gets too messy, reset it instead of running cleanup:

Neon console → Branches → `test` → **Reset from parent**

Instant, destroys all divergence. Then re-run `npm run seed:test`.

## Credentials for the seeded cohort

- Password (all six users): `Test1234!`
- Email list: see `TEST_USERS` in `seed-test-users.ts`

All emails are `*@crankmart.com` aliases that forward to Lew's real inbox,
so email delivery (verification, password reset, notifications, Touch 1/2/3
sequences) can be verified end-to-end without involving real customer
addresses.

## Production escape hatch

Seed script has `--force-prod` if you ever need to populate prod with test
users (you almost certainly don't). Cleanup has no escape hatch — the hard
guard is intentional.
