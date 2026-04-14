import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck
  const { session } = adminCheck
  const userId = session.user.id as string

  const { id } = await params
  const body = (await request.json()) as { isComplete?: boolean; notes?: string }

  if (typeof body.isComplete === 'boolean') {
    if (body.isComplete) {
      await db.execute(sql`
        UPDATE marketing_checklist_items
        SET is_complete = true,
            completed_by = ${userId},
            completed_at = NOW(),
            updated_at = NOW()
        WHERE id = ${id}
      `)
    } else {
      await db.execute(sql`
        UPDATE marketing_checklist_items
        SET is_complete = false,
            completed_by = NULL,
            completed_at = NULL,
            updated_at = NOW()
        WHERE id = ${id}
      `)
    }
  }

  if (typeof body.notes === 'string') {
    await db.execute(sql`
      UPDATE marketing_checklist_items
      SET notes = ${body.notes}, updated_at = NOW()
      WHERE id = ${id}
    `)
  }

  return NextResponse.json({ success: true })
}
