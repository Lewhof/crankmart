# Multi-Country Architecture

Landed 2026-04-12. See `.claude/plans/2026-04-12-multi-country-architecture-retrofit-scope.md` for the full CDDP.

## TL;DR

CrankMart is built as a **global `.com` with country verticals**. Until launch day, ZA is the only active country and URLs have no country segment. At launch, a single env flag flips the whole app into country-prefixed mode (`/za/*`), with `/` → `/za` 301.

## The switch

```bash
# pre-launch (current)
COUNTRY_ROUTING_MODE=implicit-za

# at launch
COUNTRY_ROUTING_MODE=prefixed
```

Flipping this env var changes:
- `middleware.ts` — enforces `/{country}/*` and redirects `/` → `/{DEFAULT}`
- `src/lib/country.ts::countryPath()` — emits prefixed or unprefixed URLs
- `src/lib/hreflang.ts::buildAlternates()` — emits `/za/...` vs `/...`

No code redeploy required to flip.

## Rules (every new feature MUST follow)

1. **Every geo-scoped query filters by country.** Use `scopedBy(table)` from `src/lib/country.ts`, or add `eq(table.country, await getCountry())` manually.
2. **Geo-scoped tables today:** `users`, `listings`, `routes`, `events`, `businesses`, `news_articles`.
3. **Global tables (no country):** `listing_categories`, `boost_packages`, `listing_images`, `route_images`, `route_loops`, `route_reviews`, `route_saves`, `listing_saves`, `conversations`, `messages`, `scrape_runs`.
4. **Never hardcode `'za'` in queries.** Always resolve via `getCountry()` — that's what makes the switch free at launch.
5. **New regions/provinces/states** go in the `regions` table, keyed by `(country, code)`. Not enums.
6. **URLs in links/redirects** go through `countryPath()` so they work in both modes.
7. **`<head>` alternates** come from `buildAlternates()` inside `generateMetadata()`.

## Files

| Path | Purpose |
|---|---|
| `src/db/schema.ts` | `country char(2)` on geo tables; `regions` lookup |
| `drizzle/0009_multi_country.sql` | Migration: columns, indexes, regions table |
| `src/db/seed-regions.ts` | Seeds ZA provinces into `regions` |
| `src/lib/country.ts` | `getCountry()`, `scopedBy()`, `countryPath()`, constants |
| `src/lib/hreflang.ts` | `buildAlternates()` for `generateMetadata()` |
| `middleware.ts` | Routes requests, sets `x-country` header |
| `.env.example` | Documents `COUNTRY_ROUTING_MODE` |

## Migration runbook

```bash
# 1. Apply SQL migration (adds columns with default 'za' — safe on live data)
psql $DATABASE_URL -f drizzle/0009_multi_country.sql

# 2. Seed ZA regions
npx tsx src/db/seed-regions.ts

# 3. (Future) audit every query against geo tables → wrap with scopedBy()
```

## Launch-day runbook

1. Audit all geo-scoped queries — confirm `scopedBy()` or explicit country filter.
2. Test: force `x-country: au` header, confirm empty lists everywhere (no cross-leak).
3. Add hreflang tags to every public `generateMetadata()`.
4. Build per-country sitemap(s) — split existing `app/sitemap.ts`.
5. Flip env var: `COUNTRY_ROUTING_MODE=prefixed`.
6. Verify `/` → `/za/` 308 redirect.
7. Submit new sitemap to Google Search Console.

## Future: adding a 2nd country (e.g. AU)

1. Add `'au'` to `ACTIVE_COUNTRIES` in `src/lib/country.ts` AND `middleware.ts`.
2. Widen `Country` type.
3. Seed AU states in `regions` (`type = 'state'`).
4. Build geo-suggest banner (deferred — see memory `project_geosuggest_banner_deferred.md`).
5. Per-country sitemap entries for AU.
6. Hreflang automatically picks up the new country.
