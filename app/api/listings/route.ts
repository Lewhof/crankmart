import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { listings, listingCategories } from '@/db/schema'
import { eq, desc, and, gte, lte, ilike, sql, SQL } from 'drizzle-orm'
import { auth } from '@/auth'
import { getCountry } from '@/lib/country'

export async function GET(request: NextRequest) {
  try {
    const p = request.nextUrl.searchParams
    const suggest      = p.get('suggest')
    const limit        = Math.min(Math.max(parseInt(p.get('limit') || '24'), 1), 100)
    const pageParam    = Math.max(parseInt(p.get('page') || '1'), 1)
    const offsetParam  = p.get('offset')
    const offset       = offsetParam ? Math.max(parseInt(offsetParam), 0) : (pageParam - 1) * limit

    const categorySlug = p.get('category')
    const categoryId   = p.get('categoryId')
    const condition    = p.get('condition')
    const province     = p.get('province')
    const minPrice     = p.get('minPrice')
    const maxPrice     = p.get('maxPrice')
    const search       = p.get('search')
    const sellerId     = p.get('seller')
    const excludeSlug  = p.get('exclude')
    const statusFilter = p.get('status') // 'all' to include sold/expired
    // Attribute filters (category-specific)
    const attrFilters  = p.get('attrs') // JSON string: {"suspension":"Full Sus","frameSize":"M"}

    const country = await getCountry()

    // Autocomplete suggestions mode
    if (suggest) {
      try {
        const results = await db.execute(sql`
          SELECT DISTINCT title FROM listings
          WHERE search_vector @@ plainto_tsquery('english', ${suggest})
            AND status = 'active'
            AND country = ${country}
          LIMIT 5
        `)
        return NextResponse.json(results.rows?.map((r: any) => r.title) || [])
      } catch (error) {
        console.error('Suggest error:', error)
        return NextResponse.json([])
      }
    }

    const conditions: SQL[] = [
      eq(listings.country, country),
      eq(listings.status, 'active'),
      sql`(${listings.expiresAt} IS NULL OR ${listings.expiresAt} > NOW())`,
    ]

    if (categorySlug && categorySlug !== 'all') {
      const cat = await db.select({ id: listingCategories.id })
        .from(listingCategories).where(eq(listingCategories.slug, categorySlug)).limit(1)
      if (cat.length) conditions.push(eq(listings.categoryId, cat[0].id))
    }
    if (categoryId && !categorySlug) {
      conditions.push(eq(listings.categoryId, parseInt(categoryId)))
    }

    if (condition) conditions.push(eq(listings.condition, condition as 'new' | 'like_new' | 'used' | 'poor'))
    if (province)  conditions.push(eq(listings.province, province))
    if (sellerId)    conditions.push(eq(listings.sellerId, sellerId))
    if (excludeSlug) conditions.push(sql`${listings.slug} != ${excludeSlug}`)
    if (statusFilter === 'all') {
      // Only allow 'all' if the requesting user owns the listings or is admin
      const session = await auth()
      const isAdmin = (session?.user as any)?.role === 'admin'
      const isOwner = session?.user?.id && sellerId && session.user.id === sellerId
      if (!isAdmin && !isOwner) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      // Remove the active-only filter
      const activeIdx = conditions.findIndex(c => String(c) === String(eq(listings.status, 'active')))
      if (activeIdx > -1) conditions.splice(activeIdx, 1)
    }
    if (minPrice)  conditions.push(gte(listings.price, minPrice))
    if (maxPrice)  conditions.push(lte(listings.price, maxPrice))

    // Full-text search with ILIKE fallback for short/partial terms
    let orderBy = [desc(listings.boostEnabled), desc(listings.createdAt)] as any[]
    if (search) {
      const term = `%${search}%`
      conditions.push(sql`(
        ${listings.searchVector} @@ plainto_tsquery('english', ${search})
        OR ${listings.title} ILIKE ${term}
        OR ${listings.bikeMake} ILIKE ${term}
        OR ${listings.bikeModel} ILIKE ${term}
        OR ${listings.description} ILIKE ${term}
      )`)
      orderBy = [
        desc(sql`ts_rank(${listings.searchVector}, plainto_tsquery('english', ${search}))`),
        desc(listings.boostEnabled),
        desc(listings.createdAt)
      ]
    }

    // JSONB attribute filters
    if (attrFilters) {
      try {
        const attrs = JSON.parse(attrFilters) as Record<string, string>
        for (const [key, value] of Object.entries(attrs)) {
          if (value) {
            conditions.push(
              sql`${listings.attributes}->>${key} = ${value}`
            )
          }
        }
      } catch { /* invalid JSON — ignore */ }
    }

    // Run main listing fetch and first-image lookup in parallel to save a
    // Vercel → Neon roundtrip. Both hit the same index; the image subquery
    // recomputes the top-N set but it's indexed and cheap.
    const mainQuery = db.select().from(listings)
      .where(and(...conditions))
      .orderBy(...orderBy)
      .limit(limit).offset(offset)

    const whereCombined = and(...conditions) as SQL
    const orderByCombined = sql.join(orderBy as SQL[], sql`, `)
    const imgQuery = db.execute(sql`
      SELECT DISTINCT ON (li.listing_id) li.listing_id, li.image_url, li.thumb_url, li.display_order
      FROM listing_images li
      WHERE li.listing_id IN (
        SELECT id FROM ${listings}
        WHERE ${whereCombined}
        ORDER BY ${orderByCombined}
        LIMIT ${limit} OFFSET ${offset}
      )
      ORDER BY li.listing_id, li.display_order ASC
    `)

    const [items, imgResult] = await Promise.all([mainQuery, imgQuery])

    const imageMap: Record<string, unknown> = {}
    ;(imgResult.rows ?? []).forEach((r: Record<string, unknown>) => {
      const listingId = String(r.listing_id)
      imageMap[listingId] = {
        listing_id:    r.listing_id,
        image_url:     r.image_url,
        thumb_url:     r.thumb_url,
        display_order: r.display_order,
      }
    })

    const itemsWithImages = items.map(item => ({
      ...item,
      image: imageMap[item.id] ?? null
    }))

    return NextResponse.json(itemsWithImages, {
      headers: {
        // Edge-cache at Vercel for 60s; tolerate stale while revalidating.
        // Auth/country-specific variants are handled by the Vary header.
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'Vary': 'Cookie, Accept-Encoding',
      },
    })
  } catch (error) {
    console.error('Listings fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }
}
