import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { getAdminCountry } from '@/lib/admin-country'
import { countSegment, type SegmentQuery } from '@/lib/segments'

/**
 * Live recipient-count preview for the segment builder. Body carries a
 * tentative query; returns the row count without persisting anything.
 */
export async function POST(req: NextRequest) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check
  const country = await getAdminCountry()

  let body: { query?: SegmentQuery }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }
  if (!body.query) return NextResponse.json({ error: 'Query required' }, { status: 400 })

  const size = await countSegment(country, body.query)
  return NextResponse.json({ size })
}
