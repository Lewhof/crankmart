// Pure email template functions — no server imports, safe for client components
// Sending logic lives in email.ts (server only)

import type { Country } from './country'
import { getCountryConfig } from './country-config'

const LOGO_HTML = '<img src="https://crankmart.com/apple-icon.png" alt="CrankMart" style="width:48px;height:48px;border-radius:8px" />'
const HEADER = (subtitle?: string) => `
  <div style="background:#0D1B2A;padding:20px 32px;display:flex;align-items:center;gap:14px">
    ${LOGO_HTML}
    <div>
      <div style="color:#fff;font-size:24px;font-weight:800">CrankMart</div>
      ${subtitle ? `<div style="color:rgba(255,255,255,0.5);font-size:12px;margin-top:2px">${subtitle}</div>` : ''}
    </div>
  </div>
`

export function newMessageEmail({
  sellerName,
  buyerName,
  listingTitle,
  messagePreview,
  listingUrl,
  inboxUrl,
}: {
  sellerName: string
  buyerName: string
  listingTitle: string
  messagePreview: string
  listingUrl: string
  inboxUrl: string
}) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ebebeb">
    ${HEADER()}
    <div style="padding:32px">
      <h2 style="margin:0 0 8px;font-size:20px;color:#1a1a1a">New message from ${buyerName}</h2>
      <p style="margin:0 0 24px;color:#6b7280;font-size:14px">About your listing: <strong>${listingTitle}</strong></p>
      <div style="background:#f5f5f5;border-radius:8px;padding:16px;margin-bottom:24px;font-size:14px;color:#1a1a1a;line-height:1.6;border-left:3px solid #0D1B2A">
        "${messagePreview}"
      </div>
      <div style="display:flex;gap:12px;flex-direction:column">
        <a href="${inboxUrl}" style="display:block;text-align:center;background:#0D1B2A;color:#fff;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">
          Reply in CrankMart →
        </a>
        <a href="${listingUrl}" style="display:block;text-align:center;background:#f5f5f5;color:#0D1B2A;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;border:1px solid #e4e4e7">
          View your listing
        </a>
      </div>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #ebebeb;font-size:12px;color:#9a9a9a;text-align:center">
      You received this because someone messaged you on CrankMart.<br>
      <a href="https://crankmart.com" style="color:#0D1B2A">crankmart.com</a>
    </div>
  </div>
</body>
</html>`
}

export function listingPublishedEmail({
  sellerName,
  listingTitle,
  listingUrl,
}: {
  sellerName: string
  listingTitle: string
  listingUrl: string
}) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ebebeb">
    ${HEADER()}
    <div style="padding:32px">
      <h2 style="margin:0 0 8px;font-size:20px;color:#1a1a1a">Your listing is live! 🎉</h2>
      <p style="margin:0 0 24px;color:#6b7280;font-size:14px">Hi ${sellerName}, <strong>${listingTitle}</strong> is now visible to buyers on CrankMart.</p>
      <a href="${listingUrl}" style="display:block;text-align:center;background:#0D1B2A;color:#fff;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:16px">
        View your listing →
      </a>
      <p style="font-size:13px;color:#9a9a9a;text-align:center">Share it with friends to get more views</p>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #ebebeb;font-size:12px;color:#9a9a9a;text-align:center">
      <a href="https://crankmart.com" style="color:#0D1B2A">crankmart.com</a>
    </div>
  </div>
</body>
</html>`
}

export function shopClaimTouch1Email({
  businessName,
  city,
  claimUrl,
  previewUrl,
  unsubscribeUrl,
  country = 'za',
}: {
  businessName: string
  city: string
  claimUrl: string
  previewUrl: string
  unsubscribeUrl: string
  country?: Country
}) {
  const cfg = getCountryConfig(country)
  const adj = country === 'au' ? 'AU' : 'SA'
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ebebeb">
    ${HEADER(`${adj}'s Cycling Directory`)}
    <div style="padding:32px">
      <h2 style="margin:0 0 8px;font-size:20px;color:#1a1a1a">Is this your shop?</h2>
      <p style="margin:0 0 16px;color:#6b7280;font-size:14px;line-height:1.6">
        We've listed <strong>${businessName}</strong> in ${city} on CrankMart, ${cfg.name}'s dedicated cycling directory. We'd love for you to claim and manage this listing — it's free.
      </p>
      <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6">
        Claiming your listing lets you update contact details, trading hours, services, and get in front of thousands of ${adj} cyclists.
      </p>
      <a href="${claimUrl}" style="display:block;text-align:center;background:#0D1B2A;color:#fff;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:12px">
        Claim My Listing →
      </a>
      <a href="${previewUrl}" style="display:block;text-align:center;background:#f5f5f5;color:#0D1B2A;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;border:1px solid #e4e4e7">
        View Your Listing
      </a>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #ebebeb;font-size:12px;color:#9a9a9a;text-align:center">
      <a href="https://crankmart.com" style="color:#0D1B2A">crankmart.com</a> ·
      <a href="${unsubscribeUrl}" style="color:#9a9a9a;margin-left:8px">Unsubscribe</a>
    </div>
  </div>
</body>
</html>`
}

export function shopClaimTouch2Email({
  businessName,
  city,
  claimUrl,
  unsubscribeUrl,
  country = 'za',
}: {
  businessName: string
  city: string
  claimUrl: string
  unsubscribeUrl: string
  country?: Country
}) {
  const adj = country === 'au' ? 'AU' : 'SA'
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ebebeb">
    ${HEADER()}
    <div style="padding:32px">
      <h2 style="margin:0 0 8px;font-size:20px;color:#1a1a1a">Still waiting for you to claim ${businessName}</h2>
      <p style="margin:0 0 16px;color:#6b7280;font-size:14px;line-height:1.6">
        Your listing in ${city} is live on CrankMart. Claiming it takes 2 minutes and is completely free.
      </p>
      <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:24px;border-left:3px solid #0D1B2A">
        <div style="font-size:13px;color:#374151;font-weight:700;margin-bottom:8px">What you'll get for free:</div>
        <ul style="margin:0;padding-left:18px;font-size:13px;color:#6b7280;line-height:1.8">
          <li>Update your contact info and trading hours</li>
          <li>Add your brands and services</li>
          <li>Be found by ${adj} cyclists searching nearby</li>
        </ul>
      </div>
      <a href="${claimUrl}" style="display:block;text-align:center;background:#0D1B2A;color:#fff;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">
        Claim My Listing →
      </a>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #ebebeb;font-size:12px;color:#9a9a9a;text-align:center">
      <a href="https://crankmart.com" style="color:#0D1B2A">crankmart.com</a> ·
      <a href="${unsubscribeUrl}" style="color:#9a9a9a;margin-left:8px">Unsubscribe</a>
    </div>
  </div>
</body>
</html>`
}

export function shopClaimTouch3Email({
  businessName,
  claimUrl,
  unsubscribeUrl,
}: {
  businessName: string
  claimUrl: string
  unsubscribeUrl: string
}) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ebebeb">
    ${HEADER()}
    <div style="padding:32px">
      <h2 style="margin:0 0 8px;font-size:20px;color:#1a1a1a">Last chance to claim ${businessName}</h2>
      <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6">
        This is our last reminder. Your claim link expires in 7 days. After that, your listing will remain on CrankMart but won't be editable until you request a new link.
      </p>
      <a href="${claimUrl}" style="display:block;text-align:center;background:#0D1B2A;color:#fff;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">
        Claim Now →
      </a>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #ebebeb;font-size:12px;color:#9a9a9a;text-align:center">
      <a href="https://crankmart.com" style="color:#0D1B2A">crankmart.com</a> ·
      <a href="${unsubscribeUrl}" style="color:#9a9a9a;margin-left:8px">Unsubscribe</a>
    </div>
  </div>
</body>
</html>`
}

export function shopVerifiedEmail({
  ownerName,
  businessName,
  dashboardUrl,
  listingUrl,
  country = 'za',
}: {
  ownerName: string
  businessName: string
  dashboardUrl: string
  listingUrl: string
  country?: Country
}) {
  const adj = country === 'au' ? 'AU' : 'SA'
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ebebeb">
    ${HEADER()}
    <div style="padding:32px">
      <div style="background:#D1FAE5;border-radius:8px;padding:14px 16px;margin-bottom:20px;display:flex;align-items:center;gap:10px">
        <span style="font-size:20px">✅</span>
        <span style="font-size:14px;font-weight:700;color:#065F46">Your listing is verified!</span>
      </div>
      <h2 style="margin:0 0 8px;font-size:20px;color:#1a1a1a">Welcome to CrankMart, ${ownerName}!</h2>
      <p style="margin:0 0 16px;color:#6b7280;font-size:14px;line-height:1.6">
        <strong>${businessName}</strong> is now a verified listing on ${adj}'s cycling directory. ${adj} cyclists can find you, view your details, and get in touch.
      </p>
      <a href="${dashboardUrl}" style="display:block;text-align:center;background:#0D1B2A;color:#fff;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:12px">
        Go to My Listing →
      </a>
      <a href="${listingUrl}" style="display:block;text-align:center;background:#f5f5f5;color:#0D1B2A;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;border:1px solid #e4e4e7">
        View Public Listing
      </a>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #ebebeb;font-size:12px;color:#9a9a9a;text-align:center">
      <a href="https://crankmart.com" style="color:#0D1B2A">crankmart.com</a>
    </div>
  </div>
</body>
</html>`
}

export function eventOrganizerTouch1Email({
  eventTitle,
  organiserName,
  eventDate,
  editUrl,
  unsubscribeUrl,
}: {
  eventTitle: string
  organiserName: string
  eventDate: string
  editUrl: string
  unsubscribeUrl: string
}) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ebebeb">
    ${HEADER()}
    <div style="padding:32px">
      <h2 style="margin:0 0 8px;font-size:20px;color:#1a1a1a">Your event is listed on CrankMart</h2>
      <p style="margin:0 0 16px;color:#6b7280;font-size:14px;line-height:1.6">
        Hi ${organiserName}, we've added <strong>${eventTitle}</strong> (${eventDate}) to CrankMart. Use the link below to update details or make changes at any time.
      </p>
      <a href="${editUrl}" style="display:block;text-align:center;background:#0D1B2A;color:#fff;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:12px">
        Manage My Event →
      </a>
      <p style="font-size:13px;color:#9a9a9a;text-align:center;margin:0">Keep this email — it's the only way to edit your event.</p>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #ebebeb;font-size:12px;color:#9a9a9a;text-align:center">
      <a href="https://crankmart.com" style="color:#0D1B2A">crankmart.com</a> ·
      <a href="${unsubscribeUrl}" style="color:#9a9a9a;margin-left:8px">Unsubscribe</a>
    </div>
  </div>
</body>
</html>`
}

export function eventVerifiedEmail({
  organiserName,
  eventTitle,
  eventUrl,
  editUrl,
  country = 'za',
}: {
  organiserName: string
  eventTitle: string
  eventUrl: string
  editUrl: string
  country?: Country
}) {
  const adj = country === 'au' ? 'AU' : 'SA'
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ebebeb">
    ${HEADER()}
    <div style="padding:32px">
      <div style="background:#D1FAE5;border-radius:8px;padding:14px 16px;margin-bottom:20px">
        <span style="font-size:14px;font-weight:700;color:#065F46">✅ Event verified and live!</span>
      </div>
      <h2 style="margin:0 0 8px;font-size:20px;color:#1a1a1a">Hi ${organiserName} — you're live!</h2>
      <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6">
        <strong>${eventTitle}</strong> has been verified and is now visible to ${adj} cyclists on CrankMart.
      </p>
      <a href="${eventUrl}" style="display:block;text-align:center;background:#0D1B2A;color:#fff;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:12px">
        View Event Page →
      </a>
      <a href="${editUrl}" style="display:block;text-align:center;background:#f5f5f5;color:#0D1B2A;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;border:1px solid #e4e4e7">
        Edit Event
      </a>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #ebebeb;font-size:12px;color:#9a9a9a;text-align:center">
      <a href="https://crankmart.com" style="color:#0D1B2A">crankmart.com</a>
    </div>
  </div>
</body>
</html>`
}

export function boostRenewalEmail({
  businessName,
  tier,
  expiresAt,
  renewUrl,
}: {
  businessName: string
  tier: string
  expiresAt: string
  renewUrl: string
}) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ebebeb">
    ${HEADER()}
    <div style="padding:32px">
      <h2 style="margin:0 0 8px;font-size:20px;color:#1a1a1a">Your boost expires soon ⏰</h2>
      <p style="margin:0 0 16px;color:#6b7280;font-size:14px;line-height:1.6">
        The <strong>${tier}</strong> boost for <strong>${businessName}</strong> expires on ${expiresAt}. Renew now to keep your visibility.
      </p>
      <a href="${renewUrl}" style="display:block;text-align:center;background:#0D1B2A;color:#fff;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">
        Renew Boost →
      </a>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #ebebeb;font-size:12px;color:#9a9a9a;text-align:center">
      <a href="https://crankmart.com" style="color:#0D1B2A">crankmart.com</a>
    </div>
  </div>
</body>
</html>`
}

export function adListingInviteEmail({
  businessName,
  listingTitle,
  reviewUrl,
  unsubscribeUrl,
}: {
  businessName: string
  listingTitle: string
  reviewUrl: string
  unsubscribeUrl: string
}) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ebebeb">
    ${HEADER()}
    <div style="padding:32px">
      <h2 style="margin:0 0 8px;font-size:20px;color:#1a1a1a">New listing referral for ${businessName}</h2>
      <p style="margin:0 0 16px;color:#6b7280;font-size:14px;line-height:1.6">
        A new classified listing — <strong>${listingTitle}</strong> — may be relevant to your shop. Review it and reach out to the seller.
      </p>
      <a href="${reviewUrl}" style="display:block;text-align:center;background:#0D1B2A;color:#fff;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">
        Review Listing →
      </a>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #ebebeb;font-size:12px;color:#9a9a9a;text-align:center">
      <a href="https://crankmart.com" style="color:#0D1B2A">crankmart.com</a> ·
      <a href="${unsubscribeUrl}" style="color:#9a9a9a;margin-left:8px">Unsubscribe</a>
    </div>
  </div>
</body>
</html>`
}

export function listingExpiryReminderEmail({
  sellerName,
  listingTitle,
  listingUrl,
  renewUrl,
  expiresAt,
}: {
  sellerName: string
  listingTitle: string
  listingUrl: string
  renewUrl: string
  expiresAt: string
}) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ebebeb">
    ${HEADER()}
    <div style="padding:32px">
      <h2 style="margin:0 0 8px;font-size:20px;color:#1a1a1a">Your listing expires soon ⏰</h2>
      <p style="color:#6b7280;font-size:14px;margin:0 0 12px">Hi ${sellerName}, your listing <strong>${listingTitle}</strong> expires on ${expiresAt}.</p>
      <p style="color:#6b7280;font-size:14px;margin:0 0 24px">Renew it to keep it visible to buyers.</p>
      <a href="${renewUrl}" style="display:block;text-align:center;background:#0D1B2A;color:#fff;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:12px">
        Renew Listing →
      </a>
      <a href="${listingUrl}" style="display:block;text-align:center;background:#f5f5f5;color:#0D1B2A;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;border:1px solid #e4e4e7">
        View Listing
      </a>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #ebebeb;font-size:12px;color:#9a9a9a;text-align:center">
      <a href="https://crankmart.com" style="color:#0D1B2A">crankmart.com</a>
    </div>
  </div>
</body>
</html>`
}
