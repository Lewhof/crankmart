import { NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

export async function GET(req: Request) {
  try {
    const adminCheck = await checkAdminApi()
    if (adminCheck instanceof NextResponse) return adminCheck

    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '30')

    const [
      listingsByStatus,
      listingsByCategory,
      listingsTrend,
      avgPriceByCategory,
      topListingsByViews,
      usersTrend,
      usersByProvince,
      topSellers,
      soldListings,
      messagesTrend,
      boostStats,
      moderationStats,
    ] = await Promise.all([
      // Listings by status
      db.execute(sql.raw(`
        SELECT status, COUNT(*) as count
        FROM listings
        GROUP BY status
        ORDER BY count DESC
      `)),

      // Listings by category
      db.execute(sql.raw(`
        SELECT lc.name as category, COUNT(l.id) as count
        FROM listings l
        LEFT JOIN listing_categories lc ON l.category_id = lc.id
        GROUP BY lc.name
        ORDER BY count DESC
      `)),

      // Listings created per day (last N days)
      db.execute(sql.raw(`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM listings
        WHERE created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `)),

      // Avg price by category
      db.execute(sql.raw(`
        SELECT lc.name as category, ROUND(AVG(l.price)::numeric, 2) as avg_price, COUNT(*) as count
        FROM listings l
        LEFT JOIN listing_categories lc ON l.category_id = lc.id
        WHERE l.price > 0 AND l.status = 'active'
        GROUP BY lc.name
        ORDER BY avg_price DESC
        LIMIT 10
      `)),

      // Top listings by views
      db.execute(sql.raw(`
        SELECT title, price, views_count as views, status, created_at
        FROM listings
        ORDER BY views_count DESC
        LIMIT 10
      `)),

      // New users per day (last N days)
      db.execute(sql.raw(`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM users
        WHERE created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `)),

      // Users by province
      db.execute(sql.raw(`
        SELECT province, COUNT(*) as count
        FROM users
        WHERE province IS NOT NULL AND province != ''
        GROUP BY province
        ORDER BY count DESC
      `)),

      // Top sellers by listing count
      db.execute(sql.raw(`
        SELECT u.name, u.email, COUNT(l.id) as listing_count,
               SUM(CASE WHEN l.status = 'sold' THEN 1 ELSE 0 END) as sold_count,
               SUM(CASE WHEN l.status = 'active' THEN 1 ELSE 0 END) as active_count
        FROM users u
        JOIN listings l ON l.seller_id = u.id
        GROUP BY u.id, u.name, u.email
        ORDER BY listing_count DESC
        LIMIT 10
      `)),

      // Sold listings trend
      db.execute(sql.raw(`
        SELECT DATE(updated_at) as date, COUNT(*) as count
        FROM listings
        WHERE status = 'sold'
          AND updated_at >= NOW() - INTERVAL '${days} days'
        GROUP BY DATE(updated_at)
        ORDER BY date ASC
      `)),

      // Messages/conversations trend
      db.execute(sql.raw(`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM conversations
        WHERE created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `)),

      // Boost stats
      db.execute(sql.raw(`
        SELECT bp.name as package_name, COUNT(b.id) as total,
               ROUND(SUM(b.amount_cents) / 100.0, 2) as revenue
        FROM boosts b
        JOIN boost_packages bp ON b.package_id = bp.id
        WHERE b.created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY bp.name
        ORDER BY total DESC
      `)),

      // Moderation stats
      db.execute(sql.raw(`
        SELECT moderation_status, COUNT(*) as count
        FROM listings
        GROUP BY moderation_status
        ORDER BY count DESC
      `)),
    ])

    return NextResponse.json({
      listingsByStatus: listingsByStatus.rows,
      listingsByCategory: listingsByCategory.rows,
      listingsTrend: listingsTrend.rows,
      avgPriceByCategory: avgPriceByCategory.rows,
      topListingsByViews: topListingsByViews.rows,
      usersTrend: usersTrend.rows,
      usersByProvince: usersByProvince.rows,
      topSellers: topSellers.rows,
      soldListings: soldListings.rows,
      messagesTrend: messagesTrend.rows,
      boostStats: boostStats.rows,
      moderationStats: moderationStats.rows,
      period: days,
    })
  } catch (error: any) {
    console.error('Reports error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
