import type { businesses, routes, events } from '@/db/schema'

export type SeedResult = {
  entity: string
  region: string
  inserted: number
  updated: number
  skipped: number
  errors: { slug: string; message: string }[]
}

export type BusinessSeed = Omit<
  typeof businesses.$inferInsert,
  'id' | 'createdAt' | 'updatedAt' | 'source'
>

export type RouteSeed = Omit<
  typeof routes.$inferInsert,
  'id' | 'createdAt' | 'updatedAt' | 'source'
>

export type EventSeed = Omit<
  typeof events.$inferInsert,
  'id' | 'createdAt' | 'updatedAt' | 'source'
>

export type RegionFile<T> = {
  region: string
  rows: T[]
}
