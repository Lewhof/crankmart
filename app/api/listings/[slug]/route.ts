import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { listings, listingImages, users, listingCategories } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const result = await db
      .select({ listing: listings, user: users })
      .from(listings)
      .leftJoin(users, eq(listings.sellerId, users.id))
      .where(eq(listings.slug, slug))
      .limit(1)

    if (!result.length) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { listing, user } = result[0]

    const images = await db
      .select()
      .from(listingImages)
      .where(eq(listingImages.listingId, listing.id))
      .orderBy(listingImages.displayOrder)

    // Fetch category + parent for contextual filtering
    let categoryInfo: { id: number; slug: string; name: string; parentSlug?: string; parentName?: string } | null = null
    if (listing.categoryId) {
      const cat = await db.select().from(listingCategories).where(eq(listingCategories.id, listing.categoryId)).limit(1)
      if (cat.length) {
        categoryInfo = { id: cat[0].id, slug: cat[0].slug, name: cat[0].name }
        if (cat[0].parentId) {
          const parent = await db.select().from(listingCategories).where(eq(listingCategories.id, cat[0].parentId)).limit(1)
          if (parent.length) {
            categoryInfo.parentSlug = parent[0].slug
            categoryInfo.parentName = parent[0].name
          }
        }
      }
    }

    return NextResponse.json({
      ...listing,
      category: categoryInfo,
      images,
      user: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        province: user.province,
        city: user.city,
        createdAt: user.createdAt,
        avatarUrl: user.avatarUrl ?? null,
      } : null,
    })
  } catch (error) {
    console.error('Listing detail error:', error)
    return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 })
  }
}
