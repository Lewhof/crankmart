import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { db } from '@/db'
import { listings, listingImages } from '@/db/schema'
import { eq, desc, and, ilike, SQL } from 'drizzle-orm'

export const listingsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().default(20),
        categoryId: z.number().int().optional(),
        condition: z.string().optional(),
        province: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const offset = (input.page - 1) * input.limit

      const conditions: SQL[] = [eq(listings.status, 'active')]

      if (input.categoryId) {
        conditions.push(eq(listings.categoryId, input.categoryId))
      }
      if (input.condition) {
        conditions.push(eq(listings.condition, input.condition as 'new' | 'like_new' | 'used' | 'poor'))
      }
      if (input.province) {
        conditions.push(ilike(listings.province, input.province))
      }
      if (input.search) {
        conditions.push(ilike(listings.title, `%${input.search}%`))
      }

      const items = await db
        .select()
        .from(listings)
        .where(and(...conditions))
        .orderBy(desc(listings.boostEnabled), desc(listings.createdAt))
        .limit(input.limit)
        .offset(offset)

      return items
    }),

  getBySlug: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const listing = await db.query.listings.findFirst({
        where: eq(listings.slug, input),
        with: {
          images: {
            orderBy: (img, { asc }) => [asc(img.displayOrder)],
          },
          seller: true,
        },
      })

      if (!listing) return null

      // Increment views
      await db
        .update(listings)
        .set({ viewsCount: (listing.viewsCount ?? 0) + 1 })
        .where(eq(listings.id, listing.id))

      return listing
    }),

  create: protectedProcedure
    .input(
      z.object({
        categoryId: z.number().int(),
        title: z.string().min(5).max(255),
        description: z.string().min(20),
        condition: z.enum(['new', 'like_new', 'used', 'poor']),
        bikeMake: z.string().optional(),
        bikeModel: z.string().optional(),
        bikeYear: z.number().int().optional(),
        price: z.number().positive(),
        city: z.string(),
        province: z.string(),
        imageUrls: z.array(z.string()).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const slug = `${input.title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')}-${Date.now()}`

      const [listing] = await db.insert(listings).values({
        sellerId: ctx.session.user?.id as string,
        categoryId: input.categoryId,
        title: input.title,
        slug,
        description: input.description,
        condition: input.condition,
        bikeMake: input.bikeMake,
        bikeModel: input.bikeModel,
        bikeYear: input.bikeYear,
        price: input.price.toString(),
        city: input.city,
        province: input.province,
        status: 'active',
        moderationStatus: 'approved',
      }).returning()

      if (input.imageUrls.length > 0) {
        await db.insert(listingImages).values(
          input.imageUrls.map((url, index) => ({
            listingId: listing.id,
            imageUrl: url,
            displayOrder: index,
          }))
        )
      }

      return listing
    }),
})
