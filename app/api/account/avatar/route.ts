import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'
import { extname } from 'path'
import { auth } from '@/auth'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

const MAX_SIZE      = 5 * 1024 * 1024   // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'Max 5MB' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'JPEG, PNG or WebP only' }, { status: 400 })

  try {
    const ext      = extname(file.name) || '.jpg'
    const filename = `avatars/${uuidv4()}${ext}`

    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: false,
    })

    await db.update(users)
      .set({ avatarUrl: blob.url, updatedAt: new Date() })
      .where(eq(users.id, session.user.id))

    return NextResponse.json({ avatarUrl: blob.url })
  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
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
