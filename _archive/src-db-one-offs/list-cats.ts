import { db } from './index'
import { listingCategories } from './schema'
import { asc } from 'drizzle-orm'

async function main() {
  const cats = await db.select().from(listingCategories).orderBy(asc(listingCategories.displayOrder))
  cats.forEach(c => console.log(`${c.id} | parent:${c.parentId ?? '-'} | ${c.slug} | ${c.name}`))
  console.log(`\nTotal: ${cats.length}`)
  process.exit(0)
}
main()
