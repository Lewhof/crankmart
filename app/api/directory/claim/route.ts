import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { businesses, users } from '@/db/schema'
import { eq, and, gt, isNotNull } from 'drizzle-orm'
import { shopVerifiedEmail, sendEmail } from '@/lib/email'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, name, phone, email, website, address, suburb, city, province, description } = body

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }
    if (!phone && !email) {
      return NextResponse.json({ error: 'Phone or email is required' }, { status: 400 })
    }

    // Validate token against DB
    const [business] = await db
      .select()
      .from(businesses)
      .where(
        and(
          eq(businesses.claimToken, token),
          isNotNull(businesses.claimTokenExpiresAt),
          gt(businesses.claimTokenExpiresAt, new Date()),
        )
      )
      .limit(1)

    if (!business) {
      return NextResponse.json({ error: 'This claim link has expired or is invalid.' }, { status: 400 })
    }

    // Find or create user by email
    let userId: string | null = null
    if (email) {
      const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1)
      if (existing) {
        userId = existing.id
      } else {
        // Create a user account
        const tempPassword = await bcrypt.hash(Math.random().toString(36).slice(-12), 10)
        const [newUser] = await db.insert(users).values({
          email,
          name: name || business.name,
          passwordHash: tempPassword,
          role: 'shop_owner',
        }).returning({ id: users.id })
        userId = newUser.id
      }
    }

    // Update business: claim it
    await db.update(businesses)
      .set({
        status: 'claimed',
        verified: true,
        claimedBy: userId ?? undefined,
        claimedAt: new Date(),
        verifiedAt: new Date(),
        claimToken: null,
        claimTokenExpiresAt: null,
        name: name || business.name,
        phone: phone || business.phone,
        email: email || business.email,
        website: website || business.website,
        address: address || business.address,
        suburb: suburb || business.suburb,
        city: city || business.city,
        province: province || business.province,
        description: description || business.description,
        consentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, business.id))

    // Send verified email
    if (email) {
      const html = shopVerifiedEmail({
        ownerName: name || 'there',
        businessName: business.name,
        dashboardUrl: `${process.env.NEXTAUTH_URL ?? 'https://cyclemart.co.za'}/account/my-listing`,
        listingUrl: `${process.env.NEXTAUTH_URL ?? 'https://cyclemart.co.za'}/directory/${business.slug}`,
      })
      await sendEmail({ to: email, subject: `Your CycleMart listing is verified — ${business.name}`, html })
    }

    return NextResponse.json({ success: true, slug: business.slug })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
