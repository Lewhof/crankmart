import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { businesses } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { checkAdminApi } from '@/lib/admin'
import { shopClaimTouch1Email, sendEmail } from '@/lib/email'

interface Params {
  params: Promise<{ id: string }>
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const check = await checkAdminApi()
  if (check instanceof NextResponse) return check

  const { id } = await params
  const { action } = await req.json()

  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, id))
    .limit(1)

  if (!business) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  switch (action) {
    case 'verify':
      await db.update(businesses)
        .set({ status: 'verified', verified: true, verifiedAt: new Date(), updatedAt: new Date() })
        .where(eq(businesses.id, id))
      break

    case 'suspend':
      await db.update(businesses)
        .set({ status: 'suspended', updatedAt: new Date() })
        .where(eq(businesses.id, id))
      break

    case 'reinstate':
      await db.update(businesses)
        .set({ status: 'claimed', updatedAt: new Date() })
        .where(eq(businesses.id, id))
      break

    case 'send-outreach': {
      const token = `claim_${id}_${Date.now()}_${Math.random().toString(36).slice(-8)}`
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      await db.update(businesses)
        .set({
          claimToken: token,
          claimTokenExpiresAt: expiresAt,
          outreachSentAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(businesses.id, id))

      const baseUrl = process.env.NEXTAUTH_URL ?? 'https://cyclemart.co.za'
      const claimUrl = `${baseUrl}/directory/claim?token=${token}`
      const previewUrl = `${baseUrl}/directory/${business.slug}`
      const unsubscribeUrl = `${baseUrl}/unsubscribe?bid=${id}`

      if (business.email) {
        const html = shopClaimTouch1Email({
          businessName: business.name,
          city: business.city ?? '',
          claimUrl,
          previewUrl,
          unsubscribeUrl,
        })
        await sendEmail({
          to: business.email,
          subject: `Is this your shop on CycleMart? — ${business.name}`,
          html,
          fromName: 'CycleMart Directory',
          fromEmail: 'directory@cyclemart.co.za',
        })
      }
      break
    }

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
