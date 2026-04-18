import { NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { auth } from '@/auth'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

/**
 * Client-direct avatar upload.
 *
 * Browser compresses + uploads straight to Blob using a token from this
 * endpoint. After upload Blob calls back into onUploadCompleted where we
 * persist the URL on users.avatar_url.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await auth()
        if (!session?.user?.id) throw new Error('Unauthorized')
        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_SIZE,
          addRandomSuffix: false,
          tokenPayload: JSON.stringify({ userId: session.user.id }),
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        try {
          const { userId } = JSON.parse(tokenPayload || '{}') as { userId?: string }
          if (!userId) return
          await db.update(users)
            .set({ avatarUrl: blob.url, updatedAt: new Date() })
            .where(eq(users.id, userId))
        } catch (e) {
          console.error('Avatar persist error:', e)
        }
      },
    })
    return NextResponse.json(result)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Upload failed'
    return NextResponse.json({ error: msg }, { status: 401 })
  }
}

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await db.update(users)
    .set({ avatarUrl: null, updatedAt: new Date() })
    .where(eq(users.id, session.user.id))

  return NextResponse.json({ success: true })
}
