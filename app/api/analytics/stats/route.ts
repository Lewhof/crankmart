import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { auth } from '@/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const days = parseInt(request.nextUrl.searchParams.get('days') || '30')

    const [
      totalViews, uniqueVisitors, uniqueSessions,
      topPages, byDevice, byBrowser, dailyViews, topReferrers,
      prevViews, prevVisitors, prevSessions,
      listingStats, userStats, businessStats,
      categoryPerformance, sellFunnel, listingPageViews,
      byCountry, byCity,
    ] = await Promise.all([
      // Current period
      db.execute(sql.raw(`SELECT COUNT(*) as count FROM page_views WHERE created_at > NOW() - INTERVAL '${days} days'`)),
      db.execute(sql.raw(`SELECT COUNT(DISTINCT COALESCE(visitor_id, session_id, id::text)) as count FROM page_views WHERE created_at > NOW() - INTERVAL '${days} days'`)),
      db.execute(sql.raw(`SELECT COUNT(DISTINCT COALESCE(session_id, id::text)) as count FROM page_views WHERE created_at > NOW() - INTERVAL '${days} days'`)),
      db.execute(sql.raw(`SELECT path, COUNT(*) as views FROM page_views WHERE created_at > NOW() - INTERVAL '${days} days' GROUP BY path ORDER BY views DESC LIMIT 15`)),
      db.execute(sql.raw(`SELECT device, COUNT(*) as count FROM page_views WHERE created_at > NOW() - INTERVAL '${days} days' GROUP BY device ORDER BY count DESC`)),
      db.execute(sql.raw(`SELECT browser, COUNT(*) as count FROM page_views WHERE created_at > NOW() - INTERVAL '${days} days' GROUP BY browser ORDER BY count DESC`)),
      db.execute(sql.raw(`SELECT DATE(created_at) as date, COUNT(*) as views, COUNT(DISTINCT COALESCE(visitor_id, session_id, id::text)) as unique_visitors FROM page_views WHERE created_at > NOW() - INTERVAL '${days} days' GROUP BY DATE(created_at) ORDER BY date ASC`)),
      db.execute(sql.raw(`SELECT referrer, COUNT(*) as count FROM page_views WHERE created_at > NOW() - INTERVAL '${days} days' AND referrer IS NOT NULL AND referrer != '' GROUP BY referrer ORDER BY count DESC LIMIT 10`)),

      // Previous period comparisons
      db.execute(sql.raw(`SELECT COUNT(*) as count FROM page_views WHERE created_at > NOW() - INTERVAL '${days * 2} days' AND created_at <= NOW() - INTERVAL '${days} days'`)),
      db.execute(sql.raw(`SELECT COUNT(DISTINCT COALESCE(visitor_id, session_id, id::text)) as count FROM page_views WHERE created_at > NOW() - INTERVAL '${days * 2} days' AND created_at <= NOW() - INTERVAL '${days} days'`)),
      db.execute(sql.raw(`SELECT COUNT(DISTINCT COALESCE(session_id, id::text)) as count FROM page_views WHERE created_at > NOW() - INTERVAL '${days * 2} days' AND created_at <= NOW() - INTERVAL '${days} days'`)),

      // Entity stats
      db.execute(sql.raw(`SELECT COUNT(*) as total, SUM(views_count) as total_views FROM listings WHERE status = 'active'`)),
      db.execute(sql.raw(`SELECT COUNT(*) as total, COUNT(CASE WHEN created_at > NOW() - INTERVAL '${days} days' THEN 1 END) as new_users FROM users`)),
      db.execute(sql.raw(`SELECT COUNT(*) as total FROM businesses`)),

      // Category performance
      db.execute(sql.raw(`
        SELECT lc.name as category, COUNT(l.id) as listing_count,
               SUM(l.views_count) as total_views, ROUND(AVG(l.views_count)::numeric, 1) as avg_views
        FROM listings l LEFT JOIN listing_categories lc ON l.category_id = lc.id
        WHERE l.status = 'active' GROUP BY lc.name ORDER BY total_views DESC LIMIT 10
      `)),

      // Sell funnel
      db.execute(sql.raw(`
        SELECT path, COUNT(*) as count FROM page_views
        WHERE path IN ('/sell', '/sell/step-1', '/sell/step-2', '/sell/step-3', '/sell/step-4', '/sell/success')
          AND created_at > NOW() - INTERVAL '${days} days'
        GROUP BY path ORDER BY count DESC
      `)),

      // Listing page views
      db.execute(sql.raw(`SELECT COUNT(*) as count FROM page_views WHERE path LIKE '/browse/%' AND created_at > NOW() - INTERVAL '${days} days'`)),

      // Geo: by country
      db.execute(sql.raw(`
        SELECT COALESCE(country_code, '??') as country_code,
               COALESCE(country, country_code, 'Unknown') as country,
               COUNT(*) as views,
               COUNT(DISTINCT COALESCE(visitor_id, session_id, id::text)) as visitors
        FROM page_views
        WHERE created_at > NOW() - INTERVAL '${days} days'
        GROUP BY country_code, country
        ORDER BY views DESC LIMIT 20
      `)),

      // Geo: by city
      db.execute(sql.raw(`
        SELECT COALESCE(city, 'Unknown') as city,
               COALESCE(country_code, '') as country_code,
               COUNT(*) as views,
               COUNT(DISTINCT COALESCE(visitor_id, session_id, id::text)) as visitors
        FROM page_views
        WHERE created_at > NOW() - INTERVAL '${days} days'
          AND city IS NOT NULL AND city != ''
        GROUP BY city, country_code
        ORDER BY views DESC LIMIT 15
      `)),
    ])

    const currentViews     = Number(totalViews.rows[0]?.count || 0)
    const prevViewsN       = Number(prevViews.rows[0]?.count || 0)
    const currentVisitors  = Number(uniqueVisitors.rows[0]?.count || 0)
    const prevVisitorsN    = Number(prevVisitors.rows[0]?.count || 0)
    const currentSessions  = Number(uniqueSessions.rows[0]?.count || 0)
    const prevSessionsN    = Number(prevSessions.rows[0]?.count || 0)

    const pctChange = (curr: number, prev: number) =>
      !prev ? null : Math.round(((curr - prev) / prev) * 100)

    return NextResponse.json({
      pageViews:      { total: currentViews,    prev: prevViewsN,      change: pctChange(currentViews,    prevViewsN) },
      uniqueVisitors: { total: currentVisitors, prev: prevVisitorsN,   change: pctChange(currentVisitors, prevVisitorsN) },
      uniqueSessions: { total: currentSessions, prev: prevSessionsN,   change: pctChange(currentSessions, prevSessionsN) },
      uniquePages:    { total: currentVisitors },
      topPages:         topPages.rows,
      byDevice:         byDevice.rows,
      byBrowser:        byBrowser.rows,
      dailyViews:       dailyViews.rows,
      topReferrers:     topReferrers.rows,
      listings:         listingStats.rows[0],
      users:            userStats.rows[0],
      businesses:       businessStats.rows[0],
      categoryPerformance: categoryPerformance.rows,
      sellFunnel:       sellFunnel.rows,
      listingPageViews: Number(listingPageViews.rows[0]?.count || 0),
      byCountry:        byCountry.rows,
      byCity:           byCity.rows,
      days,
    })
  } catch (e: any) {
    console.error('Analytics stats error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
