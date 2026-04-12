import { NextResponse } from 'next/server'
import { db } from '@/db'
import { listingCategories } from '@/db/schema'
import { asc, isNull } from 'drizzle-orm'

export async function GET() {
  try {
    const all = await db.select().from(listingCategories).orderBy(asc(listingCategories.displayOrder))
    const parents = all.filter(c => !c.parentId)
    const children = all.filter(c => c.parentId)
    return NextResponse.json({ parents, children })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
