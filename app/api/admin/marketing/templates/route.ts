import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { checkAdminApi } from '@/lib/admin'
import { getAdminCountry } from '@/lib/admin-country'

export async function GET() {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check
  const country = await getAdminCountry()

  const res = await db.execute(sql`
    SELECT id, name, subject, react_email_path, variables, is_transactional, updated_at
    FROM email_templates
    WHERE country = ${country}
    ORDER BY is_transactional DESC, name ASC
  `)
  return NextResponse.json({
    templates: (res.rows ?? res) as Array<Record<string, unknown>>,
  })
}

export async function POST(req: NextRequest) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check
  const country = await getAdminCountry()
  const session = (check as { session: { user?: { id?: string } } }).session

  let body: {
    name?: string
    subject?: string
    reactEmailPath?: string
    variables?: Record<string, unknown>
    isTransactional?: boolean
  }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

  if (!body.name?.trim() || !body.subject?.trim() || !body.reactEmailPath?.trim()) {
    return NextResponse.json({ error: 'name / subject / reactEmailPath required' }, { status: 400 })
  }

  const res = await db.execute(sql`
    INSERT INTO email_templates (country, name, subject, react_email_path, variables, is_transactional, created_by)
    VALUES (
      ${country}, ${body.name.trim()}, ${body.subject.trim()}, ${body.reactEmailPath.trim()},
      ${JSON.stringify(body.variables ?? {})}::jsonb,
      ${body.isTransactional ?? false},
      ${session.user?.id}::uuid
    )
    ON CONFLICT (country, name) DO UPDATE SET
      subject = EXCLUDED.subject,
      react_email_path = EXCLUDED.react_email_path,
      variables = EXCLUDED.variables,
      is_transactional = EXCLUDED.is_transactional,
      updated_at = NOW()
    RETURNING id
  `)
  return NextResponse.json({
    ok: true,
    id: ((res.rows ?? res) as Array<{ id: string }>)[0]?.id,
  })
}
