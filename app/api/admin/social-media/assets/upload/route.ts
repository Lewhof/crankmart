import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'
import { checkAdminApi } from '@/lib/admin'

const MAX_SIZE = 15 * 1024 * 1024 // 15 MB — videos up to ~15 MB, images well under

// Extension is derived from the validated MIME — never trusted from the
// client filename. A crafted `evil.svg` uploaded as `image/png` must not
// land on Blob with a `.svg` extension (which could serve inline XSS).
const MIME_EXT: Record<string, string> = {
  'image/jpeg':      '.jpg',
  'image/png':       '.png',
  'image/webp':      '.webp',
  'image/gif':       '.gif',
  'video/mp4':       '.mp4',
  'video/quicktime': '.mov',
}

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await checkAdminApi()
    if (adminCheck instanceof NextResponse) return adminCheck

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file)                return NextResponse.json({ error: 'No file' }, { status: 400 })
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large (max 15MB)' }, { status: 400 })
    const ext = MIME_EXT[file.type]
    if (!ext) return NextResponse.json({ error: 'Unsupported type' }, { status: 400 })

    const filename = `social/${uuidv4()}${ext}`
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: false,
    })

    return NextResponse.json({
      url: blob.url,
      mime: file.type,
      sizeBytes: file.size,
      filename,
    })
  } catch (e) {
    console.error('Social asset upload error:', e)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
