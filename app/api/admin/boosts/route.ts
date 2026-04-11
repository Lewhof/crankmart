import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdminApi()
    if (adminCheck instanceof NextResponse) return adminCheck

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const offset = (page - 1) * limit

    const statusFilter = status && status !== 'all' ? sql` AND b.status = ${status}` : sql``

    const boostRows = await db.execute(
      sql`
        SELECT
          b.id,
          b.status,
          b.amount_cents,
          b.starts_at,
          b.expires_at,
          b.created_at,
          b.payfast_payment_id,
          u.email as user_email,
          u.name as user_name,
          bp.name as package_name,
          bp.type as package_type,
          l.title as listing_title,
          biz.name as business_name
        FROM boosts b
        LEFT JOIN users u ON b.user_id = u.id
        LEFT JOIN boost_packages bp ON b.package_id = bp.id
        LEFT JOIN listings l ON b.listing_id::uuid = l.id
        LEFT JOIN businesses biz ON b.directory_id::uuid = biz.id
        WHERE 1=1
        ${statusFilter}
        ORDER BY b.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
    )

    const countRow = await db.execute(
      sql`SELECT COUNT(*) as total FROM boosts b WHERE 1=1 ${statusFilter}`,
    )

    const statsRow = await db.execute(
      sql.raw(`
        SELECT
          COALESCE(SUM(CASE WHEN status IN ('active', 'expired') THEN amount_cents ELSE 0 END), 0) as total_revenue_cents,
          COALESCE(SUM(CASE WHEN status IN ('active', 'expired') AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW()) THEN amount_cents ELSE 0 END), 0) as monthly_revenue_cents,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
        FROM boosts
      `)
    )

    const stats = (statsRow.rows ?? statsRow)[0] as Record<string, unknown>
    const total = parseInt(String(((countRow.rows ?? countRow)[0] as Record<string, unknown>)?.total ?? '0'))

    return NextResponse.json({
      boosts: boostRows.rows ?? boostRows,
      total,
      totalPages: Math.ceil(total / limit),
      totalRevenueCents: parseInt(String(stats?.total_revenue_cents ?? '0')),
      monthlyRevenueCents: parseInt(String(stats?.monthly_revenue_cents ?? '0')),
      activeCount: parseInt(String(stats?.active_count ?? '0')),
      pendingCount: parseInt(String(stats?.pending_count ?? '0')),
    })
  } catch (error) {
    console.error('[admin/boosts] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
