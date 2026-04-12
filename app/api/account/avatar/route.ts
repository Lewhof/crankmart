import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { auth } from '@/auth'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

const UPLOAD_DIR    = '/home/velo/storage/crankmart/uploads/avatars'
const PUBLIC_URL    = '/uploads/avatars'
const MAX_SIZE      = 5 * 1024 * 1024   // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'Max 5MB' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'JPEG, PNG or WebP only' }, { status: 400 })

  await mkdir(UPLOAD_DIR, { recursive: true })

  const ext      = extname(file.name) || '.jpg'
  const filename = `${uuidv4()}${ext}`
  const filepath = join(UPLOAD_DIR, filename)

  await writeFile(filepath, Buffer.from(await file.arrayBuffer()))

  const avatarUrl = `${PUBLIC_URL}/${filename}`

  await db.update(users)
    .set({ avatarUrl, updatedAt: new Date() })
    .where(eq(users.id, session.user.id))

  return NextResponse.json({ avatarUrl })
}

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await db.update(users)
    .set({ avatarUrl: null, updatedAt: new Date() })
    .where(eq(users.id, session.user.id))

  return NextResponse.json({ success: true })
}
