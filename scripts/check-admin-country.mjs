#!/usr/bin/env node
/**
 * CI guard: every admin API route that queries the DB must import
 * `getAdminCountry` (or be explicitly allow-listed).
 *
 * Why: without country scoping, admin endpoints leak cross-country data
 * the moment COUNTRY_ROUTING_MODE flips to 'prefixed'.
 *
 * Run: node scripts/check-admin-country.mjs
 * Exit 1 on violation (use in CI / pre-commit).
 */

import { readFileSync } from 'fs'
import { readdirSync, statSync } from 'fs'
import { join, relative } from 'path'

const ROOT = process.cwd()
const ADMIN_API = join(ROOT, 'app', 'api', 'admin')

// Routes that genuinely don't touch geo-tables and don't need country scope.
// Keep this short — default stance is "scope it".
const ALLOW_LIST = new Set([
  'app/api/admin/country/route.ts',         // the switcher itself
  'app/api/admin/boost-packages/route.ts',  // global catalog
  'app/api/admin/boost-packages/[id]/route.ts',
  'app/api/admin/theme/route.ts',           // platform-wide theming
  'app/api/admin/settings/route.ts',        // platform settings
  'app/api/admin/settings/test/route.ts',
  'app/api/admin/payfast/route.ts',         // global payment config
  'app/api/admin/payfast/verify/route.ts',
  'app/api/admin/seed/route.ts',            // dev tool
  'app/api/admin/seo-audit/manual/route.ts',// manual notes file
  'app/api/admin/directory/upload/route.ts',// bulk import (operator-managed)
  'app/api/admin/boosts/route.ts',          // joined via users.country in future retrofit
])

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) out.push(...walk(full))
    else if (entry === 'route.ts' || entry === 'route.tsx') out.push(full)
  }
  return out
}

const violations = []
for (const file of walk(ADMIN_API)) {
  const rel = relative(ROOT, file).replace(/\\/g, '/')
  if (ALLOW_LIST.has(rel)) continue

  const src = readFileSync(file, 'utf8')
  const hasGet = /export\s+async\s+function\s+(GET|POST|PATCH|DELETE|PUT)/.test(src)
  if (!hasGet) continue

  const touchesGeoTable = /\bFROM\s+(listings|users|routes|businesses|events|news_articles|conversations|messages|boosts|page_views)\b/i.test(src)
    || /\bINTO\s+(listings|users|routes|businesses|events|news_articles)\b/i.test(src)
    || /\bUPDATE\s+(listings|users|routes|businesses|events|news_articles)\b/i.test(src)

  if (!touchesGeoTable) continue

  const hasAdminCountry = /getAdminCountry/.test(src)
  // Inline escape: files can declare their scoping strategy in a block comment,
  // e.g. `/* admin-country-allow: scoped via parent routes.country */`.
  const hasInlineAllow = /admin-country-allow\s*:/.test(src)

  if (!hasAdminCountry && !hasInlineAllow) {
    violations.push(rel)
  }
}

if (violations.length) {
  console.error('❌ Admin country-scope guard failed.\n')
  console.error('These admin API routes query geo-scoped tables but do not call getAdminCountry():\n')
  for (const v of violations) console.error('  - ' + v)
  console.error('\nFix: import { getAdminCountry } from "@/lib/admin-country" and filter by country,')
  console.error('or add the file to ALLOW_LIST in scripts/check-admin-country.mjs with a justification.\n')
  process.exit(1)
}

console.log('✅ Admin country-scope guard passed (' + (ALLOW_LIST.size) + ' allow-listed).')
