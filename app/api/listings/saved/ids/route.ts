import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { listingSaves } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json([])
    }

    const userId = session.user.id

    const saves = await db.select({ listingId: listingSaves.listingId })
      .from(listingSaves)
      .where(eq(listingSaves.userId, userId))

    return NextResponse.json(saves.map((s) => s.listingId))
  } catch (error) {
    console.error('Fetch saved IDs error:', error)
    return NextResponse.json([])
  }
}
