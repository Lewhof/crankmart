import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { step, data } = body

    const userId = session.user.id

    // Upsert: insert or update
    await sql`
      INSERT INTO listing_drafts (user_id, step, data, updated_at)
      VALUES (${userId}, ${step || 1}, ${JSON.stringify(data || {})}, NOW())
      ON CONFLICT (user_id) DO UPDATE
      SET step = EXCLUDED.step, data = EXCLUDED.data, updated_at = NOW()
    `

    return NextResponse.json({ id: userId })
  } catch (error) {
    console.error('Draft save error:', error)
    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const result = await sql`
      SELECT id, step, data, created_at, updated_at
      FROM listing_drafts
      WHERE user_id = ${userId}
      LIMIT 1
    `

    if (result.length === 0) {
      return NextResponse.json(null)
    }

    return NextResponse.json({
      id: result[0].id,
      step: result[0].step,
      data: result[0].data,
      createdAt: result[0].created_at,
      updatedAt: result[0].updated_at,
    })
  } catch (error) {
    console.error('Draft fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch draft' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    await sql`DELETE FROM listing_drafts WHERE user_id = ${userId}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Draft delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete draft' },
      { status: 500 }
    )
  }
}
