import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import fs from 'fs'
import path from 'path'

export type CheckStatus = 'pass' | 'fail' | 'warn' | 'manual' | 'pending'
export type CheckCategory = 'content' | 'technical_seo' | 'geo' | 'marketing'
export type CheckType = 'db' | 'http' | 'code' | 'manual'

export interface CheckResult {
  id: string
  category: CheckCategory
  label: string
  status: CheckStatus
  detail: string
  check_type: CheckType
  checked_at: string
}

const MANUAL_FILE = path.join(process.cwd(), '.seo-audit-manual.json')
const BASE = 'https://crankmart.com'
const now = () => new Date().toISOString()

function readManual(): Record<string, { status: string; note?: string; marked_at: string; marked_by?: string }> {
  try {
    if (fs.existsSync(MANUAL_FILE)) {
      return JSON.parse(fs.readFileSync(MANUAL_FILE, 'utf-8'))
    }
  } catch {}
  return {}
}

function fileExists(rel: string): boolean {
  return fs.existsSync(path.join(process.cwd(), rel))
}

function fileContains(rel: string, ...terms: string[]): boolean {
  try {
    const content = fs.readFileSync(path.join(process.cwd(), rel), 'utf-8')
    return terms.every(t => content.includes(t))
  } catch {
    return false
  }
}

function fileContainsAny(rel: string, ...terms: string[]): boolean {
  try {
    const content = fs.readFileSync(path.join(process.cwd(), rel), 'utf-8')
    return terms.some(t => content.includes(t))
  } catch {
    return false
  }
}

async function fetchWithTimeout(url: string, method = 'GET', timeoutMs = 5000): Promise<{ ok: boolean; status: number; body?: string }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { method, signal: controller.signal, redirect: 'follow' })
    const body = method === 'GET' ? await res.text().catch(() => '') : undefined
    return { ok: res.ok || res.status < 400, status: res.status, body }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'fetch error'
    return { ok: false, status: 0, body: msg }
  } finally {
    clearTimeout(timer)
  }
}

async function runDbChecks(): Promise<CheckResult[]> {
  const results: CheckResult[] = []

  interface CountRow { count: string | number }

  const q = async (raw: string): Promise<number> => {
    try {
      const r = await db.execute(sql.raw(raw))
      const row = r.rows?.[0] as unknown as CountRow | undefined
      return parseInt((row?.count ?? '0').toString())
    } catch {
      return -1
    }
  }

  // Businesses
  const totalBiz = await q(`SELECT COUNT(*) as count FROM businesses`)
  const disabledBiz = await q(`SELECT COUNT(*) as count FROM businesses WHERE status = 'pending'`)
  const activeBiz = await q(`SELECT COUNT(*) as count FROM businesses WHERE status IN ('verified','claimed')`)

  results.push({
    id: 'businesses_total',
    category: 'content',
    label: 'Business directory seeded (162 target)',
    status: totalBiz >= 162 ? 'pass' : totalBiz > 0 ? 'warn' : 'fail',
    detail: totalBiz < 0 ? 'DB query failed' : `${totalBiz} businesses in DB`,
    check_type: 'db',
    checked_at: now(),
  })

  results.push({
    id: 'businesses_disabled',
    category: 'content',
    label: 'Pre-launch businesses set to disabled',
    status: disabledBiz > 0 ? 'pass' : 'warn',
    detail: disabledBiz < 0 ? 'DB query failed' : `${disabledBiz} disabled, ${activeBiz} active`,
    check_type: 'db',
    checked_at: now(),
  })

  // Classifieds / listings
  const totalListings = await q(`SELECT COUNT(*) as count FROM listings`)
  const activeListings = await q(`SELECT COUNT(*) as count FROM listings WHERE status = 'active'`)
  results.push({
    id: 'classifieds_check',
    category: 'content',
    label: 'Classifieds listings — seeded data check',
    status: 'warn',
    detail: totalListings < 0 ? 'DB query failed' : `${totalListings} total listings (${activeListings} active) — verify seeded test data wiped manually`,
    check_type: 'db',
    checked_at: now(),
  })

  // Events
  const eventsCount = await q(`SELECT COUNT(*) as count FROM events WHERE status IN ('verified','pending_review')`)
  results.push({
    id: 'events_count',
    category: 'content',
    label: 'Events count (target: 65 real events)',
    status: eventsCount >= 60 ? 'pass' : eventsCount > 0 ? 'warn' : 'fail',
    detail: eventsCount < 0 ? 'DB query failed' : `${eventsCount} upcoming/ongoing events`,
    check_type: 'db',
    checked_at: now(),
  })

  // Routes
  const routesCount = await q(`SELECT COUNT(*) as count FROM routes WHERE status = 'approved'`)
  results.push({
    id: 'routes_count',
    category: 'content',
    label: 'Routes count (target: 54+)',
    status: routesCount >= 54 ? 'pass' : routesCount > 0 ? 'warn' : 'fail',
    detail: routesCount < 0 ? 'DB query failed' : `${routesCount} approved routes`,
    check_type: 'db',
    checked_at: now(),
  })

  // News/GEO blog posts
  const newsCount = await q(`SELECT COUNT(*) as count FROM news_articles WHERE status = 'published'`)
  results.push({
    id: 'news_count',
    category: 'content',
    label: 'GEO blog posts published (target: 4+)',
    status: newsCount >= 4 ? 'pass' : newsCount > 0 ? 'warn' : 'fail',
    detail: newsCount < 0 ? 'DB query failed' : `${newsCount} published articles`,
    check_type: 'db',
    checked_at: now(),
  })

  return results
}

function runCodeChecks(): CheckResult[] {
  const results: CheckResult[] = []

  // Cron files
  results.push({
    id: 'expire_cron',
    category: 'content',
    label: 'Listing expiry cron exists',
    status: fileExists('app/api/cron/expire-listings/route.ts') ? 'pass' : 'fail',
    detail: fileExists('app/api/cron/expire-listings/route.ts') ? 'app/api/cron/expire-listings/route.ts found' : 'Missing: app/api/cron/expire-listings/route.ts',
    check_type: 'code',
    checked_at: now(),
  })

  const claimPaths = ['app/api/businesses/claim/route.ts', 'app/api/directory/claim/route.ts', 'app/api/claim/route.ts']
  const claimFound = claimPaths.find(p => fileExists(p))
  results.push({
    id: 'claim_api',
    category: 'content',
    label: 'Business claim/verify API exists',
    status: claimFound ? 'pass' : 'warn',
    detail: claimFound ? `Found at ${claimFound}` : 'No claim API found — check if in-scope for launch',
    check_type: 'code',
    checked_at: now(),
  })

  // Sitemap/robots
  results.push({
    id: 'sitemap_code',
    category: 'technical_seo',
    label: 'sitemap.ts (Next.js) exists',
    status: fileExists('app/sitemap.ts') || fileExists('app/sitemap.tsx') ? 'pass' : 'fail',
    detail: fileExists('app/sitemap.ts') ? 'app/sitemap.ts found' : 'Missing sitemap.ts',
    check_type: 'code',
    checked_at: now(),
  })

  results.push({
    id: 'robots_code',
    category: 'technical_seo',
    label: 'robots.ts (Next.js) exists',
    status: fileExists('app/robots.ts') ? 'pass' : 'fail',
    detail: fileExists('app/robots.ts') ? 'app/robots.ts found' : 'Missing robots.ts',
    check_type: 'code',
    checked_at: now(),
  })

  results.push({
    id: 'llms_txt',
    category: 'technical_seo',
    label: 'llms.txt (AI crawlers) exists',
    status: fileExists('public/llms.txt') ? 'pass' : 'fail',
    detail: fileExists('public/llms.txt') ? 'public/llms.txt found' : 'Missing public/llms.txt',
    check_type: 'code',
    checked_at: now(),
  })

  // Schema checks in layout/pages
  const orgOk = fileContains('app/layout.tsx', 'Organization', '@context')
  results.push({
    id: 'org_schema',
    category: 'technical_seo',
    label: 'Organization schema in layout.tsx',
    status: orgOk ? 'pass' : 'fail',
    detail: orgOk ? 'Organization JSON-LD found in layout.tsx' : 'Missing Organization schema in layout.tsx',
    check_type: 'code',
    checked_at: now(),
  })

  const wsOk = fileContains('app/layout.tsx', 'WebSite', 'SearchAction')
  results.push({
    id: 'website_schema',
    category: 'technical_seo',
    label: 'WebSite + SearchAction schema',
    status: wsOk ? 'pass' : 'fail',
    detail: wsOk ? 'WebSite + SearchAction JSON-LD found' : 'Missing WebSite/SearchAction schema',
    check_type: 'code',
    checked_at: now(),
  })

  const faqOk = fileContains('app/faq/page.tsx', 'FAQPage')
  results.push({
    id: 'faq_schema',
    category: 'technical_seo',
    label: 'FAQPage schema on /faq',
    status: faqOk ? 'pass' : 'fail',
    detail: faqOk ? 'FAQPage JSON-LD found in faq/page.tsx' : 'Missing FAQPage schema',
    check_type: 'code',
    checked_at: now(),
  })

  const listingPaths = ['app/browse/[slug]/ListingDetail.tsx', 'app/browse/[slug]/page.tsx']
  const listingSchemaOk = listingPaths.some(p => fileContainsAny(p, 'Product', 'Offer', 'schema.org/Product'))
  results.push({
    id: 'listing_schema',
    category: 'technical_seo',
    label: 'Product schema on listing detail pages',
    status: listingSchemaOk ? 'pass' : 'fail',
    detail: listingSchemaOk ? 'Product/Offer JSON-LD found on listing detail' : 'Missing Product schema on listing detail pages',
    check_type: 'code',
    checked_at: now(),
  })

  const eventPaths = ['app/events/[slug]/page.tsx', 'app/events/[slug]/EventDetail.tsx']
  const eventSchemaOk = eventPaths.some(p => fileContainsAny(p, '"Event"', "'Event'", 'schema.org/Event'))
  results.push({
    id: 'event_schema',
    category: 'technical_seo',
    label: 'Event schema on event detail pages',
    status: eventSchemaOk ? 'pass' : 'fail',
    detail: eventSchemaOk ? 'Event JSON-LD found on event detail' : 'Missing Event schema on event detail pages',
    check_type: 'code',
    checked_at: now(),
  })

  const bizDetailPath = 'app/directory/[slug]/BusinessDetail.tsx'
  const bizSchemaOk = fileContainsAny(bizDetailPath, 'LocalBusiness', 'schema.org/LocalBusiness')
  results.push({
    id: 'business_schema',
    category: 'technical_seo',
    label: 'LocalBusiness schema on directory pages',
    status: bizSchemaOk ? 'pass' : 'fail',
    detail: bizSchemaOk ? 'LocalBusiness JSON-LD found' : 'Missing LocalBusiness schema on directory/[slug]',
    check_type: 'code',
    checked_at: now(),
  })

  const breadcrumbPaths = [bizDetailPath, ...listingPaths, 'app/directory/[slug]/page.tsx']
  const breadcrumbOk = breadcrumbPaths.some(p => fileContains(p, 'BreadcrumbList'))
  results.push({
    id: 'breadcrumb_schema',
    category: 'technical_seo',
    label: 'BreadcrumbList schema on inner pages',
    status: breadcrumbOk ? 'pass' : 'fail',
    detail: breadcrumbOk ? 'BreadcrumbList JSON-LD found' : 'Missing BreadcrumbList schema on inner pages',
    check_type: 'code',
    checked_at: now(),
  })

  const newsPaths = ['app/news/[slug]/page.tsx', 'app/news/[slug]/ArticleDetail.tsx', 'app/news/[slug]/NewsDetail.tsx']
  const articleSchemaOk = newsPaths.some(p => fileContainsAny(p, '"Article"', "'Article'", 'NewsArticle'))
  results.push({
    id: 'article_schema',
    category: 'technical_seo',
    label: 'Article schema on blog/news pages',
    status: articleSchemaOk ? 'pass' : 'fail',
    detail: articleSchemaOk ? 'Article JSON-LD found on news page' : 'Missing Article schema on news detail pages',
    check_type: 'code',
    checked_at: now(),
  })

  const routePagePaths = ['app/routes/[slug]/page.tsx', 'app/routes/[slug]/RouteDetail.tsx']
  const sportsSchemaOk = routePagePaths.some(p => fileContainsAny(p, 'SportsActivity', 'schema.org/SportsActivity'))
  results.push({
    id: 'sports_schema',
    category: 'technical_seo',
    label: 'SportsActivity schema on route pages',
    status: sportsSchemaOk ? 'pass' : 'fail',
    detail: sportsSchemaOk ? 'SportsActivity JSON-LD found' : 'Missing SportsActivity schema on route detail pages',
    check_type: 'code',
    checked_at: now(),
  })

  const hreflangOk = fileContainsAny('app/layout.tsx', 'hreflang', 'en-ZA')
  results.push({
    id: 'hreflang',
    category: 'technical_seo',
    label: 'hreflang en-ZA in layout',
    status: hreflangOk ? 'pass' : 'fail',
    detail: hreflangOk ? 'hreflang/en-ZA found in layout.tsx' : 'Missing hreflang en-ZA tag in layout.tsx',
    check_type: 'code',
    checked_at: now(),
  })

  const canonicalOk = fileContainsAny('app/layout.tsx', 'canonical') ||
    fileContainsAny('app/sitemap.ts', 'url')
  results.push({
    id: 'canonical_code',
    category: 'technical_seo',
    label: 'Canonical URL implementation',
    status: canonicalOk ? 'pass' : 'warn',
    detail: canonicalOk ? 'Canonical URL references found' : 'Canonical URL implementation not detected in layout',
    check_type: 'code',
    checked_at: now(),
  })

  // GEO: city pages
  const cityPageOk = fileExists('app/directory/[city]/page.tsx') ||
    fileExists('app/directory/cape-town/page.tsx') ||
    fileContainsAny('app/directory/page.tsx', 'cape-town', 'cape_town', 'city')
  results.push({
    id: 'city_pages',
    category: 'geo',
    label: 'City directory pages exist (/directory/[city])',
    status: cityPageOk ? 'pass' : 'warn',
    detail: cityPageOk ? 'City directory routing found' : 'City-specific directory pages not detected',
    check_type: 'code',
    checked_at: now(),
  })

  const catPageOk = fileExists('app/directory/category/[type]/page.tsx') ||
    fileExists('app/directory/[category]/page.tsx')
  results.push({
    id: 'category_pages',
    category: 'geo',
    label: 'Category directory pages exist (/directory/bike-shops)',
    status: catPageOk ? 'pass' : 'warn',
    detail: catPageOk ? 'Category directory routing found' : 'Category directory pages not detected',
    check_type: 'code',
    checked_at: now(),
  })

  const faqPageOk = fileExists('app/faq/page.tsx')
  results.push({
    id: 'faq_page',
    category: 'geo',
    label: 'FAQ page live (/faq)',
    status: faqPageOk ? 'pass' : 'fail',
    detail: faqPageOk ? '/faq page exists' : 'Missing app/faq/page.tsx',
    check_type: 'code',
    checked_at: now(),
  })

  const boostApiOk = fileExists('app/api/boosts/initiate/route.ts') || fileExists('app/api/payments/payfast/itn/route.ts')
  results.push({
    id: 'boost_flow',
    category: 'marketing',
    label: 'Featured upgrade / boost flow exists',
    status: boostApiOk ? 'pass' : 'warn',
    detail: boostApiOk ? 'Boost/payment API routes found' : 'Boost/payment flow not detected',
    check_type: 'code',
    checked_at: now(),
  })

  return results
}

async function runHttpChecks(): Promise<CheckResult[]> {
  const results: CheckResult[] = []

  const checks: Array<{ id: string; label: string; url: string; category: CheckCategory; validate?: (body: string) => boolean }> = [
    { id: 'sitemap_xml', label: 'sitemap.xml resolves (200 + valid)', category: 'technical_seo', url: `${BASE}/sitemap.xml`, validate: b => b.includes('<urlset') || b.includes('<sitemapindex') },
    { id: 'sitemap_listings', label: 'sitemap-listings.xml resolves', category: 'technical_seo', url: `${BASE}/sitemap-listings.xml`, validate: b => b.includes('<urlset') },
    { id: 'sitemap_blog', label: 'sitemap-blog.xml resolves', category: 'technical_seo', url: `${BASE}/sitemap-blog.xml`, validate: b => b.includes('<urlset') },
    { id: 'social_instagram', label: 'Instagram profile (@crankmartsa)', category: 'marketing', url: 'https://www.instagram.com/crankmartsa' },
    { id: 'social_facebook', label: 'Facebook page (@crankmartsa)', category: 'marketing', url: 'https://www.facebook.com/crankmartsa' },
    { id: 'social_tiktok', label: 'TikTok profile (@crankmartsa)', category: 'marketing', url: 'https://www.tiktok.com/@crankmartsa' },
  ]

  await Promise.all(checks.map(async (c) => {
    const r = await fetchWithTimeout(c.url)
    let status: CheckStatus = r.ok ? 'pass' : 'fail'
    let detail = r.ok ? `${r.status} OK` : `${r.status || 'Error'}: ${r.body?.slice(0, 80) || 'failed'}`
    if (r.ok && c.validate && r.body) {
      if (!c.validate(r.body)) {
        status = 'warn'
        detail = `${r.status} OK but content unexpected`
      } else {
        detail = `${r.status} OK — valid response`
      }
    }
    results.push({ id: c.id, category: c.category, label: c.label, status, detail, check_type: 'http', checked_at: now() })
  }))

  return results
}

function manualChecks(manual: ReturnType<typeof readManual>): CheckResult[] {
  const items: Array<{ id: string; label: string; category: CheckCategory }> = [
    { id: 'gscon_setup', label: 'Google Search Console — account setup', category: 'technical_seo' },
    { id: 'gscon_sitemap', label: 'Sitemap submitted to Google Search Console', category: 'technical_seo' },
    { id: 'cwv_check', label: 'Core Web Vitals verified (LCP < 2.5s)', category: 'technical_seo' },
    { id: 'redirects_plan', label: '301 redirects plan documented', category: 'technical_seo' },
    { id: 'gbp_claimed', label: 'Google Business Profile claimed', category: 'marketing' },
    { id: 'outreach_sent', label: 'Business verification outreach emails sent', category: 'marketing' },
  ]

  return items.map(item => {
    const entry = manual[item.id]
    const done = entry?.status === 'done'
    return {
      id: item.id,
      category: item.category,
      label: item.label,
      status: done ? 'pass' : 'manual',
      detail: done ? `Marked complete ${entry.marked_at ? new Date(entry.marked_at).toLocaleDateString('en-ZA') : ''}${entry.note ? ` — ${entry.note}` : ''}` : 'Manual verification required',
      check_type: 'manual',
      checked_at: now(),
    }
  })
}

export async function GET(request: NextRequest) {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck

  const deep = request.nextUrl.searchParams.get('deep') === 'true'
  const manual = readManual()

  try {
    const [dbResults, codeResults, manualResults] = await Promise.all([
      runDbChecks(),
      Promise.resolve(runCodeChecks()),
      Promise.resolve(manualChecks(manual)),
    ])

    const httpResults = deep ? await runHttpChecks() : []

    const all = [...dbResults, ...codeResults, ...manualResults, ...httpResults]
    return NextResponse.json({ results: all, deep, ran_at: now() })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
