import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { checkAdminApi } from '@/lib/admin'

const UPLOAD_DIR = '/home/velo/storage/crankmart/uploads/directory'
const PUBLIC_URL_BASE = '/uploads/directory'
const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await checkAdminApi()
    if (adminCheck instanceof NextResponse) return adminCheck

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG or WebP.' }, { status: 400 })
    }

    await mkdir(UPLOAD_DIR, { recursive: true })

    const ext = extname(file.name) || '.jpg'
    const filename = `${uuidv4()}${ext}`
    const filepath = join(UPLOAD_DIR, filename)

    const bytes = await file.arrayBuffer()
    await writeFile(filepath, Buffer.from(bytes))

    return NextResponse.json({
      url: `${PUBLIC_URL_BASE}/${filename}`,
      filename,
    })
  } catch (error) {
    console.error('Admin directory upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
