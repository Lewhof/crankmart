import { NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { auth } from '@/auth'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

/**
 * Client-direct upload token endpoint.
 *
 * The browser POSTs a HandleUploadBody here. We verify the user is signed
 * in, then return a short-lived Blob token bound to the requested pathname
 * + content-type + max size. The browser then uploads the bytes directly
 * to Vercel Blob — server doesn't proxy the file, saving an extra hop.
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
      onUploadCompleted: async ({ blob }) => {
        // Hook for any post-upload bookkeeping. Listings rows are written
        // by /api/sell/publish later — nothing to do here for now.
        console.log('Listing upload complete:', blob.url)
      },
    })
    return NextResponse.json(result)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Upload failed'
    return NextResponse.json({ error: msg }, { status: 401 })
  }
}
