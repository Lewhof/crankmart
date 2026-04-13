import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { randomBytes } from 'crypto'
import { auth } from '@/auth'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { sendEmail } from '@/lib/email'
import { getCountry } from '@/lib/country'

const EventSubmitSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  eventType: z.string().optional().default('road'),
  city: z.string().min(1, 'City is required'),
  province: z.string().optional().nullable(),
  venueName: z.string().optional().nullable(),
  eventDateStart: z.string().min(1, 'Event start date is required'),
  eventDateEnd: z.string().optional().nullable(),
  entryUrl: z.string().optional().nullable(),
  entryStatus: z.string().optional().default('open'),
  entryFee: z.union([z.string(), z.number()]).optional().nullable(),
  distance: z.union([z.string(), z.number()]).optional().nullable(),
  discipline: z.string().optional().nullable(),
  organiserName: z.string().optional().nullable(),
  organiserEmail: z.string().email('Organiser email is required and must be valid'),
  organiserWebsite: z.string().optional().nullable(),
  coverImageUrl: z.string().optional().nullable(),
})

function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 100)
    + '-' + randomBytes(4).toString('hex')
}

export async function POST(request: NextRequest) {
  try {
    // Auth guard
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = EventSubmitSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.issues },
        { status: 400 }
      )
    }

    const {
      title, description, eventType, city, province, venueName,
      eventDateStart, eventDateEnd, entryUrl, entryStatus, entryFee,
      distance, discipline, organiserName, organiserEmail, organiserWebsite,
      coverImageUrl,
    } = validation.data

    const slug = slugify(title)
    const country = await getCountry()

    await db.execute(sql`
      INSERT INTO events (
        country,
        title, slug, description, event_type, city, province, venue_name,
        event_date_start, event_date_end, entry_url, entry_status, entry_fee,
        distance, discipline, organiser_name, organiser_email, organiser_website,
        cover_image_url, status, is_featured, is_verified
      ) VALUES (
        ${country},
        ${title},
        ${slug},
        ${description ?? null},
        ${eventType || 'road'},
        ${city},
        ${province ?? null},
        ${venueName ?? null},
        ${eventDateStart},
        ${eventDateEnd ?? null},
        ${entryUrl ?? null},
        ${entryStatus || 'open'},
        ${entryFee != null ? String(entryFee) : null},
        ${distance != null ? String(distance) : null},
        ${discipline ?? null},
        ${organiserName ?? null},
        ${organiserEmail},
        ${organiserWebsite ?? null},
        ${coverImageUrl ?? null},
        'pending',
        false,
        false
      )
    `)

    // Notify admins
    try {
      const admins = await db.execute(sql`SELECT email FROM users WHERE role = 'admin' LIMIT 3`)
      const adminRows = (admins.rows ?? admins) as any[]
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://crankmart.com'
      for (const admin of adminRows) {
        await sendEmail({
          to: admin.email,
          subject: `New event submission: "${title}"`,
          html: `<div style="font-family:sans-serif;max-width:560px;margin:40px auto;background:#fff;border-radius:12px;border:1px solid #ebebeb;overflow:hidden"><div style="background:#0D1B2A;padding:24px 32px"><div style="color:#fff;font-size:20px;font-weight:800">🚲 CrankMart — New Event Submission</div></div><div style="padding:32px"><h2 style="margin:0 0 8px">${title}</h2><p style="color:#6b7280;font-size:14px;margin:0 0 4px">By <strong>${organiserName || organiserEmail}</strong></p><p style="color:#6b7280;font-size:14px;margin:0 0 16px">${city}${province ? ', ' + province : ''} · ${new Date(eventDateStart).toLocaleDateString('en-ZA')}</p><a href="${baseUrl}/admin/events" style="display:inline-block;background:#0D1B2A;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">Review in Admin →</a></div></div>`
        })
      }
    } catch {}

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Event submit error:', error)
    return NextResponse.json({ error: 'Failed to submit event' }, { status: 500 })
  }
}
