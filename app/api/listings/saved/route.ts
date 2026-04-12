import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

interface SavedListing {
  id: string;
  title: string;
  slug: string;
  price: number;
  condition: string;
  province: string;
  city: string;
  status: string;
  bike_make: string;
  bike_model: string;
  bike_year: number;
  created_at: string;
  saved_at: string;
  thumb_url: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const result = await db.execute(sql.raw(`
      SELECT 
        l.id, l.title, l.slug, l.price, l.condition, l.province, l.city,
        l.status, l.bike_make, l.bike_model, l.bike_year, l.created_at,
        s.created_at as saved_at,
        li.image_url as thumb_url
      FROM listing_saves s
      JOIN listings l ON l.id = s.listing_id
      LEFT JOIN LATERAL (
        SELECT image_url FROM listing_images 
        WHERE listing_id = l.id 
        ORDER BY display_order ASC LIMIT 1
      ) li ON true
      WHERE s.user_id = '${userId}'
      ORDER BY s.created_at DESC
    `))

    const rows = (result.rows ?? result) as unknown as SavedListing[]
    return NextResponse.json(rows)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Fetch saved listings error:', message)
    return NextResponse.json({ error: 'Failed to fetch saved listings' }, { status: 500 })
  }
}
