import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { listings, users } from '@/db/schema'
import { eq, and, lt, sql } from 'drizzle-orm'
import { sendEmail, listingExpiryReminderEmail } from '@/lib/email'
import { getLocale } from '@/lib/currency'
import type { Country } from '@/lib/country'

const RENEWAL_EMAIL_SENT = 'renewal_email_sent'

export async function GET(request: NextRequest) {
  try {
    // Check auth — cron secret is required
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Step 1: Find listings expiring soon (< 3 days away) but not yet notified
    // and send renewal emails
    const expiringListings = await db.select().from(listings)
      .where(
        and(
          eq(listings.status, 'active'),
          lt(listings.expiresAt, sql`NOW() + INTERVAL '3 days'`),
          lt(sql`NOW()`, listings.expiresAt!), // Not yet expired
          eq(listings.renewalEmailSent, false)
        )
      )

    let notified = 0
    for (const listing of expiringListings) {
      try {
        const seller = await db.select().from(users)
          .where(eq(users.id, listing.sellerId))
          .limit(1)

        if (seller.length === 0) continue

        const sellerUser = seller[0]
        const listingCountry: Country = (listing.country as Country) ?? 'za'
        const expiresDate = listing.expiresAt
          ? new Date(listing.expiresAt).toLocaleDateString(getLocale(listingCountry), {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : 'soon'

        const listingUrl = `https://crankmart.com/browse/${listing.slug}`
        const renewUrl = `https://crankmart.com/account?tab=listings&action=renew&id=${listing.id}`

        const html = listingExpiryReminderEmail({
          sellerName: sellerUser.name,
          listingTitle: listing.title,
          listingUrl,
          renewUrl,
          expiresAt: expiresDate,
        })

        await sendEmail({
          to: sellerUser.email,
          subject: `Your CrankMart listing expires soon: ${listing.title}`,
          html,
        })

        // Mark as notified
        await db.update(listings)
          .set({ renewalEmailSent: true })
          .where(eq(listings.id, listing.id))

        notified++
      } catch (error) {
        console.error(`Error sending renewal email for listing ${listing.id}:`, error)
        // Continue with next listing
      }
    }

    // Step 2: Find and expire all listings that passed the expiry date
    const expiredListings = await db.select({ id: listings.id })
      .from(listings)
      .where(
        and(
          eq(listings.status, 'active'),
          lt(listings.expiresAt, sql`NOW()`)
        )
      )

    const expiredCount = expiredListings.length

    if (expiredCount > 0) {
      await db.update(listings)
        .set({ status: 'expired' })
        .where(
          and(
            eq(listings.status, 'active'),
            lt(listings.expiresAt, sql`NOW()`)
          )
        )
    }

    return NextResponse.json({
      success: true,
      expired: expiredCount,
      notified,
    })
  } catch (error) {
    console.error('Cron expire-listings error:', error)
    return NextResponse.json(
      { error: 'Failed to process listing expiry' },
      { status: 500 }
    )
  }
}
