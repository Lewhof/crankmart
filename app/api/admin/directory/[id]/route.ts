import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { getAdminCountry, isSuperadminSession } from '@/lib/admin-country'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const adminCheck = await checkAdminApi()
    if (adminCheck instanceof NextResponse) return adminCheck
    const body = await request.json()
    const { action, logo_url, cover_url } = body
    const { id } = await params

    const country = await getAdminCountry()
    const seeAll = isSuperadminSession(adminCheck.session) && request.nextUrl.searchParams.get('all') === '1'
    const g = seeAll ? sql`` : sql` AND country = ${country}`

    // Handle image updates (logo_url, cover_url)
    if (logo_url !== undefined || cover_url !== undefined) {
      if (logo_url !== undefined && cover_url !== undefined) {
        await db.execute(sql`UPDATE businesses SET logo_url = ${logo_url}, cover_url = ${cover_url}, updated_at = NOW() WHERE id = ${id} ${g}`)
      } else if (logo_url !== undefined) {
        await db.execute(sql`UPDATE businesses SET logo_url = ${logo_url}, updated_at = NOW() WHERE id = ${id} ${g}`)
      } else {
        await db.execute(sql`UPDATE businesses SET cover_url = ${cover_url}, updated_at = NOW() WHERE id = ${id} ${g}`)
      }
      return NextResponse.json({ success: true, message: 'Images updated' })
    }

    if (action === 'verify') {
      await db.execute(sql`UPDATE businesses SET is_verified = true WHERE id = ${id} ${g}`)
      return NextResponse.json({ success: true, action: 'verified' })
    } else if (action === 'unverify') {
      await db.execute(sql`UPDATE businesses SET is_verified = false WHERE id = ${id} ${g}`)
      return NextResponse.json({ success: true, action: 'unverified' })
    } else if (action === 'feature') {
      await db.execute(sql`UPDATE businesses SET is_premium = true WHERE id = ${id} ${g}`)
      return NextResponse.json({ success: true, action: 'featured' })
    } else if (action === 'unfeature') {
      await db.execute(sql`UPDATE businesses SET is_premium = false WHERE id = ${id} ${g}`)
      return NextResponse.json({ success: true, action: 'unfeatured' })
    } else if (action === 'delete') {
      await db.execute(sql`DELETE FROM businesses WHERE id = ${id} ${g}`)
      return NextResponse.json({ success: true, action: 'deleted' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Directory action error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
