import { router, publicProcedure } from '../trpc'
import { db } from '@/db'
import { listingCategories } from '@/db/schema'
import { asc } from 'drizzle-orm'

export const categoriesRouter = router({
  list: publicProcedure.query(async () => {
    return await db
      .select()
      .from(listingCategories)
      .orderBy(asc(listingCategories.name))
  }),
})
