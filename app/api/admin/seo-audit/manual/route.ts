import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { auth } from '@/auth'
import fs from 'fs'
import path from 'path'

const MANUAL_FILE = path.join(process.cwd(), '.seo-audit-manual.json')

type ManualEntry = {
  status: 'done' | 'pending'
  note?: string
  marked_at: string
  marked_by?: string
}

function readManual(): Record<string, ManualEntry> {
  try {
    if (fs.existsSync(MANUAL_FILE)) {
      return JSON.parse(fs.readFileSync(MANUAL_FILE, 'utf-8'))
    }
  } catch {}
  return {}
}

function writeManual(data: Record<string, ManualEntry>): void {
  fs.writeFileSync(MANUAL_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

export async function POST(request: NextRequest) {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck

  const session = await auth()
  const userName = (session?.user as { name?: string })?.name || 'admin'

  try {
    const body = await request.json()
    const { checkId, status, note } = body as { checkId: string; status: 'done' | 'pending'; note?: string }

    if (!checkId || !['done', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid payload — checkId and status (done|pending) required' }, { status: 400 })
    }

    const current = readManual()
    if (status === 'pending') {
      delete current[checkId]
    } else {
      current[checkId] = {
        status,
        note,
        marked_at: new Date().toISOString(),
        marked_by: userName,
      }
    }
    writeManual(current)

    return NextResponse.json({ ok: true, checkId, status })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  const adminCheck = await checkAdminApi()
  if (adminCheck instanceof NextResponse) return adminCheck

  return NextResponse.json(readManual())
}
