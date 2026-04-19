import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { getAdminCountry, isSuperadminSession } from '@/lib/admin-country'

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdminApi()
    if (adminCheck instanceof NextResponse) return adminCheck

    const days = parseInt(request.nextUrl.searchParams.get('days') || '30')
    const country = await getAdminCountry()
    const seeAll = isSuperadminSession(adminCheck.session) && request.nextUrl.searchParams.get('all') === '1'
    // Note: page_views is session/visitor tracking — not geo-scoped by marketplace country;
    // it retains its own geo fields (country_code, city from IP). Only entity queries get scoped below.
    const cl = seeAll ? sql`` : sql` AND country = ${country}`

    // Per-stage labelled execution so a single failing query surfaces *which* stage broke
    // in the logs + client response — keeps diagnostics useful as the query count grows.
    const run = <T>(stage: string, p: Promise<T>): Promise<T> =>
      p.catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : String(e)
        console.error(`[analytics.stats] stage="${stage}" failed:`, msg)
        throw new Error(`stage="${stage}": ${msg}`)
      })

    const [
      totalViews, uniqueVisitors, uniqueSessions,
      topPages, byDevice, byBrowser, dailyViews, topReferrers,
      prevViews, prevVisitors, prevSessions,
      listingStats, userStats, businessStats,
      categoryPerformance, sellFunnel, listingPageViews,
      byCountry, byCity,
    ] = await Promise.all([
      // Current period
      run('totalViews', db.execute(sql`SELECT COUNT(*) as count FROM page_views WHERE created_at > NOW() - INTERVAL '1 day' * ${days}`)),
      run('uniqueVisitors', db.execute(sql`SELECT COUNT(DISTINCT COALESCE(visitor_id, session_id, id::text)) as count FROM page_views WHERE created_at > NOW() - INTERVAL '1 day' * ${days}`)),
      run('uniqueSessions', db.execute(sql`SELECT COUNT(DISTINCT COALESCE(session_id, id::text)) as count FROM page_views WHERE created_at > NOW() - INTERVAL '1 day' * ${days}`)),
      run('topPages', db.execute(sql`SELECT path, COUNT(*) as views FROM page_views WHERE created_at > NOW() - INTERVAL '1 day' * ${days} GROUP BY path ORDER BY views DESC LIMIT 15`)),
      run('byDevice', db.execute(sql`SELECT device, COUNT(*) as count FROM page_views WHERE created_at > NOW() - INTERVAL '1 day' * ${days} GROUP BY device ORDER BY count DESC`)),
      run('byBrowser', db.execute(sql`SELECT browser, COUNT(*) as count FROM page_views WHERE created_at > NOW() - INTERVAL '1 day' * ${days} GROUP BY browser ORDER BY count DESC`)),
      run('dailyViews', db.execute(sql`SELECT DATE(created_at) as date, COUNT(*) as views, COUNT(DISTINCT COALESCE(visitor_id, session_id, id::text)) as unique_visitors FROM page_views WHERE created_at > NOW() - INTERVAL '1 day' * ${days} GROUP BY DATE(created_at) ORDER BY date ASC`)),
      run('topReferrers', db.execute(sql`SELECT referrer, COUNT(*) as count FROM page_views WHERE created_at > NOW() - INTERVAL '1 day' * ${days} AND referrer IS NOT NULL AND referrer != '' GROUP BY referrer ORDER BY count DESC LIMIT 10`)),

      // Previous period comparisons
      run('prevViews', db.execute(sql`SELECT COUNT(*) as count FROM page_views WHERE created_at > NOW() - INTERVAL '1 day' * ${days * 2} AND created_at <= NOW() - INTERVAL '1 day' * ${days}`)),
      run('prevVisitors', db.execute(sql`SELECT COUNT(DISTINCT COALESCE(visitor_id, session_id, id::text)) as count FROM page_views WHERE created_at > NOW() - INTERVAL '1 day' * ${days * 2} AND created_at <= NOW() - INTERVAL '1 day' * ${days}`)),
      run('prevSessions', db.execute(sql`SELECT COUNT(DISTINCT COALESCE(session_id, id::text)) as count FROM page_views WHERE created_at > NOW() - INTERVAL '1 day' * ${days * 2} AND created_at <= NOW() - INTERVAL '1 day' * ${days}`)),

      // Entity stats (country-scoped)
      run('listingStats', db.execute(sql`SELECT COUNT(*) as total, SUM(views_count) as total_views FROM listings WHERE status = 'active' ${cl}`)),
      run('userStats', db.execute(sql`SELECT COUNT(*) as total, COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 day' * ${days} THEN 1 END) as new_users FROM users WHERE 1=1 ${cl}`)),
      run('businessStats', db.execute(sql`SELECT COUNT(*) as total FROM businesses WHERE 1=1 ${cl}`)),

      // Category performance (country-scoped listings)
      run('categoryPerformance', db.execute(sql`
        SELECT lc.name as category, COUNT(l.id) as listing_count,
               SUM(l.views_count) as total_views, ROUND(AVG(l.views_count)::numeric, 1) as avg_views
        FROM listings l LEFT JOIN listing_categories lc ON l.category_id = lc.id
        WHERE l.status = 'active' ${seeAll ? sql`` : sql` AND l.country = ${country}`}
        GROUP BY lc.name ORDER BY total_views DESC LIMIT 10
      `)),

      // Sell funnel
      run('sellFunnel', db.execute(sql`
        SELECT path, COUNT(*) as count FROM page_views
        WHERE path IN ('/sell', '/sell/step-1', '/sell/step-2', '/sell/step-3', '/sell/step-4', '/sell/success')
          AND created_at > NOW() - INTERVAL '1 day' * ${days}
        GROUP BY path ORDER BY count DESC
      `)),

      // Listing page views
      run('listingPageViews', db.execute(sql`SELECT COUNT(*) as count FROM page_views WHERE path LIKE '/browse/%' AND created_at > NOW() - INTERVAL '1 day' * ${days}`)),

      // Geo: by country
      run('byCountry', db.execute(sql`
        SELECT COALESCE(country_code, '??') as country_code,
               COALESCE(country, country_code, 'Unknown') as country,
               COUNT(*) as views,
               COUNT(DISTINCT COALESCE(visitor_id, session_id, id::text)) as visitors
        FROM page_views
        WHERE created_at > NOW() - INTERVAL '1 day' * ${days}
        GROUP BY country_code, country
        ORDER BY views DESC LIMIT 20
      `)),

      // Geo: by city
      run('byCity', db.execute(sql`
        SELECT COALESCE(city, 'Unknown') as city,
               COALESCE(country_code, '') as country_code,
               COUNT(*) as views,
               COUNT(DISTINCT COALESCE(visitor_id, session_id, id::text)) as visitors
        FROM page_views
        WHERE created_at > NOW() - INTERVAL '1 day' * ${days}
          AND city IS NOT NULL AND city != ''
        GROUP BY city, country_code
        ORDER BY views DESC LIMIT 15
      `)),
    ])

    const currentViews    = Number(totalViews.rows[0]?.count || 0)
    const prevViewsN      = Number(prevViews.rows[0]?.count || 0)
    const currentVisitors = Number(uniqueVisitors.rows[0]?.count || 0)
    const prevVisitorsN   = Number(prevVisitors.rows[0]?.count || 0)
    const currentSessions = Number(uniqueSessions.rows[0]?.count || 0)
    const prevSessionsN   = Number(prevSessions.rows[0]?.count || 0)

    const pctChange = (curr: number, prev: number) =>
      !prev ? null : Math.round(((curr - prev) / prev) * 100)

    return NextResponse.json({
      pageViews:      { total: currentViews,    prev: prevViewsN,    change: pctChange(currentViews,    prevViewsN) },
      uniqueVisitors: { total: currentVisitors, prev: prevVisitorsN, change: pctChange(currentVisitors, prevVisitorsN) },
      uniqueSessions: { total: currentSessions, prev: prevSessionsN, change: pctChange(currentSessions, prevSessionsN) },
      topPages:            topPages.rows,
      byDevice:            byDevice.rows,
      byBrowser:           byBrowser.rows,
      dailyViews:          dailyViews.rows,
      topReferrers:        topReferrers.rows,
      listings:            listingStats.rows[0],
      users:               userStats.rows[0],
      businesses:          businessStats.rows[0],
      categoryPerformance: categoryPerformance.rows,
      sellFunnel:          sellFunnel.rows,
      listingPageViews:    Number(listingPageViews.rows[0]?.count || 0),
      byCountry:           byCountry.rows,
      byCity:              byCity.rows,
      days,
    })
  } catch (e: unknown) {
    console.error('Admin analytics stats error:', e)
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
