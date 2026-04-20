import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

/**
 * v1 "publish" returns a clipboard payload per platform rather than auto-
 * posting. Real auto-publish (Ayrshare / direct APIs) is a v2 decision.
 *
 * IMPORTANT: this endpoint does NOT flip status → 'published'. The server
 * has no way to confirm the admin actually pasted into each platform. The
 * client PATCHes status after a successful clipboard write, so reporting
 * metrics reflect reality rather than a hopeful server-side update.
 */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck

  const { id } = await params
  const row = await db.execute(sql`
    SELECT id, status, platforms, body, title, asset_ids
    FROM social_posts WHERE id = ${id}::uuid
  `)
  const post = ((row.rows ?? row) as Array<Record<string, unknown>>)[0]
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const assetIds = (post.asset_ids as string[] | null) ?? []
  let assetUrls: string[] = []
  if (assetIds.length > 0) {
    const a = await db.execute(sql`SELECT url FROM social_assets WHERE id = ANY(${assetIds}::uuid[])`)
    assetUrls = ((a.rows ?? a) as Array<{ url: string }>).map(r => r.url)
  }

  return NextResponse.json({
    ok: true,
    clipboard: {
      body: post.body as string,
      title: post.title as string | null,
      platforms: post.platforms as string[],
      assetUrls,
    },
  })
}
