import { router } from '../trpc'
import { listingsRouter } from './listings'
import { categoriesRouter } from './categories'

export const appRouter = router({
  listings: listingsRouter,
  categories: categoriesRouter,
})

export type AppRouter = typeof appRouter
